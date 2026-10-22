$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'deploy-both.ps1')
$testCount = 0
function Must-Reject {
    param([scriptblock]$Action)
    $rejected = $false
    try { & $Action } catch { $rejected = $true }
    if (-not $rejected) { throw 'Expected an incomplete report to be rejected.' }
    $script:testCount++
}

$head = 'a' * 40
$report = [pscustomobject]@{
    commit_sha = $head
    sites = [pscustomobject]@{ status = 'succeeded'; commit_sha = $head; url = 'https://example.chatgpt.site'; version_id = 'version-test'; deployment_id = 'deployment-test' }
    github = [pscustomobject]@{ status = 'succeeded'; commit_sha = $head; url = 'https://example.github.io/repo/'; run_url = 'https://github.com/example/repo/actions/runs/1' }
}
Assert-DualDeploymentReport -Report $report -Head $head
$testCount++
foreach ($target in @('sites', 'github')) {
    foreach ($state in @('failed', 'pending', 'skipped')) {
        $report.$target.status = $state
        Must-Reject { Assert-DualDeploymentReport -Report $report -Head $head }
    }
    $report.$target.status = 'succeeded'
    $report.$target.commit_sha = 'b' * 40
    Must-Reject { Assert-DualDeploymentReport -Report $report -Head $head }
    $report.$target.commit_sha = $head
}
Must-Reject { Assert-DualDeploymentReport -Report $report -Head ('c' * 40) }
$report.sites.deployment_id = $null
Must-Reject { Assert-DualDeploymentReport -Report $report -Head $head }

# Exercise the actual CLI stream filter without starting Codex or any model.
$fixture = Join-Path $PSScriptRoot '../outputs/deploy-both-test'
$null = New-Item -ItemType Directory -Path $fixture -Force
$stub = Join-Path $fixture 'fake-codex.ps1'
@'
$null = @($input)
Write-Output 'FAKE_CREDENTIAL_MUST_NOT_LEAK'
Write-Error 'FAKE_CREDENTIAL_MUST_NOT_LEAK' -ErrorAction Continue
Write-Output '{"type":"item.completed","item":{"type":"agent_message","text":"FAKE_CREDENTIAL_MUST_NOT_LEAK"}}'
Write-Output '{"type":"turn.started"}'
Write-Output '{"type":"item.completed","item":{"type":"mcp_tool_call","result":"FAKE_CREDENTIAL_MUST_NOT_LEAK"}}'
exit 23
'@ | Set-Content -LiteralPath $stub -Encoding ASCII
$captured = @(Invoke-DualDeploymentAgent -Command $stub -Arguments @() -Prompt 'test input' 6>&1)
if (($captured | Out-String).Contains('FAKE_CREDENTIAL_MUST_NOT_LEAK')) { throw 'Raw credential-bearing event leaked.' }
if ($captured[-1] -ne 23) { throw 'Codex exit code was lost.' }
if (($captured | Out-String) -notmatch 'Codex deployment started') { throw 'Safe progress was not displayed.' }
$testCount += 3
$quiet = @(Invoke-DualDeploymentQuiet -Command $stub -Arguments @() 6>&1)
if ($quiet.Count -ne 1 -or $quiet[0] -ne 23) { throw 'Quiet preflight lost its exit code or leaked diagnostics.' }
$testCount++
Write-Host "$testCount deployment wrapper checks passed. No model or publication was started."
