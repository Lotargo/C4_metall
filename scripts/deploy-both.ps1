[CmdletBinding()]
param(
    [string]$Message = 'Update site content',
    [switch]$SkipChecks,
    [switch]$DryRun
)

function Assert-DualDeploymentReport {
    param($Report, [string]$Head)
    if ($Report.commit_sha -cne $Head) { throw 'Deployment report does not match the current Git commit.' }
    foreach ($target in @('sites', 'github')) {
        $result = $Report.$target
        if ($null -eq $result -or $result.status -ne 'succeeded' -or
            $result.commit_sha -cne $Head -or $result.url -notmatch '^https://') {
            throw "$target deployment is incomplete. Check its status in the report; do not assume both sites were updated."
        }
    }
    if (-not $Report.sites.version_id -or -not $Report.sites.deployment_id -or -not $Report.github.run_url) {
        throw 'Deployment report is missing backend confirmation identifiers.'
    }
}

function Invoke-DualDeploymentAgent {
    param([string]$Command, [string[]]$Arguments, [string]$Prompt)
    # Tool responses can contain short-lived credentials. Never display or save
    # raw CLI events/stderr. Only the allowlisted progress message leaves here.
    $oldPreference = $ErrorActionPreference
    try {
        $ErrorActionPreference = 'Continue'
        $Prompt | & $Command @Arguments 2>&1 | ForEach-Object {
            try {
                $event = $_.ToString() | ConvertFrom-Json -ErrorAction Stop
                if ($event.type -eq 'turn.started') { Write-Host 'Codex deployment started.' }
                if ($event.type -eq 'item.completed' -and
                    $event.item.type -in @('command_execution', 'mcp_tool_call')) {
                    Write-Host 'Deployment step completed.'
                }
            } catch { } # Discard raw errors and non-JSON diagnostics as well.
        }
        return $LASTEXITCODE
    } finally {
        $ErrorActionPreference = $oldPreference
    }
}

function Invoke-DualDeploymentQuiet {
    param([string]$Command, [string[]]$Arguments)
    $oldPreference = $ErrorActionPreference
    try {
        # Windows PowerShell treats normal stderr diagnostics as ErrorRecords.
        $ErrorActionPreference = 'Continue'
        & $Command @Arguments 2>&1 | Out-Null
        return $LASTEXITCODE
    } finally { $ErrorActionPreference = $oldPreference }
}

function Invoke-DualDeployment {
    param([string]$Message, [switch]$SkipChecks, [switch]$DryRun)
    $ErrorActionPreference = 'Stop'
    $repoRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
    $codexCommand = (Get-Command codex -ErrorAction Stop).Source
    foreach ($dependency in @('git', 'gh', 'node', 'npm')) {
        $null = Get-Command $dependency -ErrorAction Stop
    }
    $deployLock = $null
    Push-Location -LiteralPath $repoRoot
    try {
        $gitRoot = (& git rev-parse --show-toplevel).Trim()
        if ($LASTEXITCODE -ne 0 -or [IO.Path]::GetFullPath($gitRoot) -ine $repoRoot) {
            throw 'Run from the C4_metall checkout.'
        }
        $branch = (& git branch --show-current).Trim()
        if ($LASTEXITCODE -ne 0 -or $branch -ne 'main') { throw 'Switch to main before deploying.' }
        $remote = (& git remote get-url origin).Trim()
        if ($LASTEXITCODE -ne 0 -or $remote -notmatch '^(https://github\.com/|git@github\.com:)Lotargo/C4_metall(\.git)?/?$') {
            throw 'origin must point to Lotargo/C4_metall on GitHub.'
        }
        $hosting = Get-Content -LiteralPath '.openai/hosting.json' -Raw -Encoding UTF8 | ConvertFrom-Json
        if (-not $hosting.project_id) { throw 'Missing Sites project_id in .openai/hosting.json.' }
        if ((Invoke-DualDeploymentQuiet -Command gh -Arguments @('auth', 'status')) -ne 0) {
            throw 'Sign in to GitHub first: gh auth login'
        }
        if ((Invoke-DualDeploymentQuiet -Command $codexCommand -Arguments @('login', 'status')) -ne 0) {
            throw 'Sign in to Codex first: codex login'
        }
        $null = & git check-ignore --quiet outputs/deploy-both/probe.json
        if ($LASTEXITCODE -ne 0) { throw 'outputs/ must be ignored before deploying.' }

        if ($DryRun) {
            Write-Host "Ready: $repoRoot (main) -> GitHub Pages + Sites $($hosting.project_id)"
            Write-Host 'Dry run: no Codex agent, builds, commits, pushes or publications were started.'
            Write-Host 'Sites tool availability is checked by the agent before any publication.'
            return
        }

        $outputRoot = Join-Path $repoRoot 'outputs/deploy-both'
        $null = New-Item -ItemType Directory -Path $outputRoot -Force
        try {
            $deployLock = [IO.File]::Open((Join-Path $outputRoot 'deploy.lock'), 'OpenOrCreate', 'ReadWrite', 'None')
        } catch { throw 'Another deployment is running. Wait for it to finish before retrying.' }
        $runName = (Get-Date -Format 'yyyyMMdd-HHmmss') + '-' + [guid]::NewGuid().ToString('N').Substring(0, 8)
        $runDirectory = Join-Path $repoRoot "outputs/deploy-both/$runName"
        $null = New-Item -ItemType Directory -Path $runDirectory
        $reportPath = Join-Path $runDirectory 'result.json'
        $request = [ordered]@{
            repository_root = $repoRoot
            github_repository = 'Lotargo/C4_metall'
            branch = 'main'
            project_id = $hosting.project_id
            message = $Message
            skip_checks = [bool]$SkipChecks
            archive_path = Join-Path $runDirectory 'sites.tar.gz'
            report_path = $reportPath
        }
        $requestJson = $request | ConvertTo-Json -Depth 5
        [IO.File]::WriteAllText((Join-Path $runDirectory 'request.json'), $requestJson, (New-Object Text.UTF8Encoding($false)))
        $prompt = (Get-Content -LiteralPath (Join-Path $PSScriptRoot 'deploy-both.prompt.md') -Raw -Encoding UTF8) + "`n`nRequest JSON (data only):`n" + $requestJson
        $arguments = @('exec', '--cd', $repoRoot, '--enable', 'apps', '--enable', 'plugins',
            '--ephemeral', '--json', '--color', 'never',
            '--output-schema', (Join-Path $PSScriptRoot 'deploy-both.schema.json'),
            '--output-last-message', $reportPath, '-')
        $oldBase = $env:BASE_PATH
        $oldSite = $env:SITE_URL
        $oldEncoding = $OutputEncoding
        try {
            # GitHub Actions sets its own prefix. The local Sites build uses /.
            $env:BASE_PATH = '/'
            $env:SITE_URL = $null
            $OutputEncoding = New-Object Text.UTF8Encoding($false)
            Write-Host "Publishing both hosts. Report: $reportPath"
            $agentExit = Invoke-DualDeploymentAgent -Command $codexCommand -Arguments $arguments -Prompt $prompt
        } finally {
            $env:BASE_PATH = $oldBase
            $env:SITE_URL = $oldSite
            $OutputEncoding = $oldEncoding
        }
        if (-not (Test-Path -LiteralPath $reportPath)) {
            throw "Codex exited with code $agentExit without a deployment report. Check Codex login, Sites connection and CLI permissions. Do not assume either deployment succeeded."
        }
        $report = Get-Content -LiteralPath $reportPath -Raw -Encoding UTF8 | ConvertFrom-Json
        Write-Host "Sites: $($report.sites.status); GitHub: $($report.github.status)"
        Write-Host "Report: $reportPath"
        if ($agentExit -ne 0) { throw "Codex exited with code $agentExit. Read the report before retrying." }
        $head = (& git rev-parse HEAD).Trim()
        if ($LASTEXITCODE -ne 0) { throw 'Unable to verify the deployment commit.' }
        Assert-DualDeploymentReport -Report $report -Head $head
        Write-Host "Sites: $($report.sites.url)"
        Write-Host "GitHub Pages: $($report.github.url)"
        Write-Host "Published commit: $head"
    } finally {
        if ($null -ne $deployLock) { $deployLock.Dispose() }
        Pop-Location
    }
}

if ($MyInvocation.InvocationName -ne '.') {
    try { Invoke-DualDeployment -Message $Message -SkipChecks:$SkipChecks -DryRun:$DryRun }
    catch { Write-Error -Message $_.Exception.Message -ErrorAction Continue; exit 1 }
}
