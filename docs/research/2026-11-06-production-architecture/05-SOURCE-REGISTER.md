# Буквальные формульные записи и арифметический реестр

Дата: 06.11.2026. Источник: фиксированный снимок, описанный в [04-SOURCES-AND-COVERAGE](04-SOURCES-AND-COVERAGE.md).

Человеческое изложение по категориям находится в [основном](02-FORMULAS.md) и [дополнительном](03-ADDITIONAL-FORMULAS.md) каталогах. Этот реестр сохраняет буквальные выражения и различия реализаций. Он не добавляет новые методы и не исполняет формулы.

## 1. Объявленные формулы Go

Это записи `Formula.ID`/`Formula.Expression`, извлечённые из функций формульного описания. Некоторые записи описывают явный вход или неподдержанную метрику. Списки методов наследуют общие зависимости; одинаковый ID может встречаться в нескольких описаниях. Выполняемая арифметика находится в численных функциях того же ядра.

### machining-calc/calc/boring.go

[machining-calc/calc/boring.go](F:/projects/metall-dev-2/machining-calc/calc/boring.go)

**`constant-n.reference/1`**, строка 255:

```text
Dref задан явно: расточка d1, сверление Dсверла, радиальная канавка Dнаружный; резьба использует относящийся объявленный Dref
```

**`constant-n.spindle/1`**, строка 256:

```text
n задано, либо n=1000vc/(πDref); два известных режима проверяются на согласованность
```

**`constant-n.speed/1`**, строка 257:

```text
vc задана, либо vc=πnDref/1000; n постоянно на протяжении движения
```

**`constant-n.feed/1`**, строка 258:

```text
u=nf
```

**`axial-feed.travel/1`**, строка 258:

```text
Lfeed задано явно; не назначает длину контакта и объём
```

**`axial-feed.time/1`**, строка 259:

```text
tfeed=Lfeed/u; без возврата, наладки и скрытых циклов
```

**`axial-feed.average-rate/1`**, строка 260:

```text
Qaverage=V/(1000tfeed); при tfeed=0 неприменимо
```

**`boring.depth/1`**, строка 266:

```text
a=(d1-d0)/2; существующее отверстие d0>0
```

**`boring.area/1`**, строка 266:

```text
A=π(d1-d0)(d1+d0)/4
```

**`boring.volume/1`**, строка 267:

```text
V=A Lcontact
```

**`boring.engaged-time/1`**, строка 267:

```text
tengaged=Lcontact/u
```

**`boring.steady-rate/1`**, строка 267:

```text
Qsteady=A u/1000
```

**`chip/1`**, строка 268:

```text
h=f sin(κπ/180)
```

**`specific-force/1`**, строка 268:

```text
kc=kc11 h^(-mc)(1-γ/100)
```

**`boring.force/1`**, строка 269:

```text
Ft=kc a f; модель полного кольцевого слоя, не осевая сила
```

**`boring.mean-speed/1`**, строка 269:

```text
vmean=πn(d0+d1)/2000
```

**`boring.engaged-net-power/1`**, строка 270:

```text
Pengaged=Ft vmean/60000; не динамический пик и не средняя с воздушными ходами
```

**`boring.engaged-torque/1`**, строка 271:

```text
Tengaged=Ft(d0+d1)/4000; равно Pengaged 30000/(πn), если n известно
```

**`boring.engaged-drive-power/1`**, строка 271:

```text
Pdrive,engaged=Pengaged/η
```

### machining-calc/calc/drilling.go

[machining-calc/calc/drilling.go](F:/projects/metall-dev-2/machining-calc/calc/drilling.go)

**`drilling.area/1`**, строка 145:

```text
A=πD²/4
```

**`drilling.tip/1`**, строка 145:

```text
htip=D/(2tan(θπ/360)); идеальная коническая вершина
```

**`drilling.required-travel/1`**, строка 146:

```text
blind: Hfull+htip; through: Hmaterial+htip+e
```

**`drilling.derived-travel/1`**, строка 147:

```text
Если явный Lfeed неизвестен, Lfeed=required_feed_travel по достаточной объявленной геометрии; известный путь не удлиняется
```

**`drilling.volume/1`**, строка 148:

```text
blind: A(Hfull+htip/3); through: A Hmaterial; новый объём только в материале
```

**`drilling.steady-rate/1`**, строка 149:

```text
Qsteady=A n f/1000; полное идеальное сечение, не средняя за вход/выход
```

### machining-calc/calc/formulas.go

[machining-calc/calc/formulas.go](F:/projects/metall-dev-2/machining-calc/calc/formulas.go)

**`bandsaw.batch-counts/1`**, строка 12:

```text
N=Σ(bar_count×allocated_pieces_per_bar); B=Σbar_count; both equal the supplied totals
```

**`bandsaw.batch-kerf/1`**, строка 13:

```text
k=separation_kerf_mm/N, exact positive decimal
```

**`bandsaw.batch-head-cuts/1`**, строка 14:

```text
H=head_trim_kerf_mm/k; H/B is a nonnegative integer
```

**`bandsaw.batch-handling/1`**, строка 15:

```text
bar_load=B; piece_feed=N; clamp=UNKNOWN
```

**`bandsaw.area/1`**, строка 35:

```text
A = πD²/4, мм²
```

**`bandsaw.band-speed/1`**, строка 36:

```text
v_band = заданная скорость полотна; не используется вместо подачи
```

**`bandsaw.area-rate/1`**, строка 37:

```text
R = заданная эффективная производительность, см²/мин
```

**`bandsaw.time/1`**, строка 38:

```text
t = (A/100)/R, мин; 100 мм² = 1 см²
```

**`bandsaw.volume/1`**, строка 39:

```text
V_kerf = A × k, мм³; только пропил
```

**`bandsaw.rate/1`**, строка 40:

```text
Q_kerf = R × k/10, см³/мин
```

**`spindle/1`**, строка 44:

```text
n = 1000v / (πD)
```

**`feed/1`**, строка 44:

```text
u = nf
```

**`chip/1`**, строка 44:

```text
h = f sin(κπ/180)
```

**`time/1`**, строка 45:

```text
t = L/u
```

**`specific-force/1`**, строка 45:

```text
kc = kc11 h^(-m) (1-γ/100)
```

**`force/1`**, строка 46:

```text
F = kc a f
```

**`net-power/1`**, строка 46:

```text
P_cut = F v_mean / 60000
```

**`torque/1`**, строка 47:

```text
T_cut = P_cut × 30000 / (πn)
```

**`drive-power/1`**, строка 47:

```text
P_drive = P_cut / η
```

**`facing.travel/1`**, строка 50:

```text
L = (D-d)/2
```

**`facing.diameter/1`**, строка 50:

```text
Продольный конечный диаметр для торцовки неприменим
```

**`facing.volume/1`**, строка 50:

```text
V = π(D-d)(D+d)a/4
```

**`facing.rate/1`**, строка 50:

```text
Q = V/t/1000 = π(D+d)au/2000
```

**`mean-speed/1`**, строка 50:

```text
v_mean = πn(D+d)/2000
```

**`longitudinal.diameter/1`**, строка 52:

```text
d = D-2a
```

**`longitudinal.travel/1`**, строка 52:

```text
L = заданная длина рабочего движения
```

**`longitudinal.volume/1`**, строка 52:

```text
A = πa(D-a); V = AL
```

**`longitudinal.rate/1`**, строка 52:

```text
Q = πa(D-a)u/1000
```

**`mean-speed/1`**, строка 52:

```text
v_mean = πn(D-a)/1000
```

### machining-calc/calc/grooving.go

[machining-calc/calc/grooving.go](F:/projects/metall-dev-2/machining-calc/calc/grooving.go)

**`grooving.tool-width/1`**, строка 135:

```text
btool — фактическая ширина резания инструмента
```

**`grooving.new-width/1`**, строка 135:

```text
bnew задано отдельно; 0<=bnew<=btool, перекрытия проверяются планировщиком
```

**`grooving.depth/1`**, строка 136:

```text
Lcontact=(D-d)/2; 0<=d<=D
```

**`grooving.feed-travel/1`**, строка 136:

```text
Lfeed задан явно; он должен достигать объявленного радиального слоя
```

**`grooving.derived-travel/1`**, строка 137:

```text
При неизвестном явном Lfeed: Lfeed=(D-d)/2 по достаточной геометрии
```

**`grooving.volume/1`**, строка 138:

```text
V=π(D-d)(D+d)bnew/4; только новая неперекрытая осевая полоса
```

**`grooving.feed-time/1`**, строка 139:

```text
tfeed=Lfeed/(n fr); fr — радиальная подача на оборот
```

**`grooving.engaged-time/1`**, строка 139:

```text
tcontact=(D-d)/(2n fr)
```

**`grooving.engaged-average-rate/1`**, строка 140:

```text
Qcontact=V/(1000tcontact); средняя по меняющемуся радиусу, не мгновенная постоянная
```

**`grooving.average-rate/1`**, строка 141:

```text
Qaverage=V/(1000tfeed); при tfeed=0 неприменимо
```

### machining-calc/calc/linear_feed.go

[machining-calc/calc/linear_feed.go](F:/projects/metall-dev-2/machining-calc/calc/linear_feed.go)

**`linear-feed.travel/1`**, строка 142:

```text
L = явно заданный путь одного движения, мм; без восстановления геометрии
```

**`linear-feed.repetitions/1`**, строка 143:

```text
k = явно заданное целое число одинаковых движений >=1
```

**`linear-feed.total-travel/1`**, строка 144:

```text
Ltotal = L × k, мм
```

**`linear-feed.effective/1`**, строка 145:

```text
u = явно заданная эффективная подача вдоль пути, мм/мин
```

**`linear-feed.per-revolution/1`**, строка 146:

```text
u = n × f, мм/мин; n в об/мин, f в мм/об
```

**`linear-feed.per-tooth/1`**, строка 147:

```text
u = n × z_eff × fz, мм/мин; fz в мм/зуб
```

**`linear-feed.time/1`**, строка 148:

```text
t = Ltotal/u, мин; подтверждённый Ltotal=0 даёт t=0, не маскируя известные недопустимые входы
```

### machining-calc/calc/thread_turning.go

[machining-calc/calc/thread_turning.go](F:/projects/metall-dev-2/machining-calc/calc/thread_turning.go)

**`thread.nominal-diameter/1`**, строка 140:

```text
Dnominal задан явно для идентификации; он не восстанавливает профиль или Dref
```

**`thread.pitch/1`**, строка 140:

```text
P задан явно; область метода — однозаходная цилиндрическая резьба
```

**`thread.feed/1`**, строка 141:

```text
faxial=P; независимая известная подача проверяется на равенство шагу и не заменяет его
```

**`thread.feed-rate/1`**, строка 141:

```text
u=nP
```

**`thread.feed-travel/1`**, строка 142:

```text
Lfeed — явный осевой путь с объявленными входом/выходом, не длина винтовой линии
```

**`thread.feed-time/1`**, строка 142:

```text
tfeed=Lfeed/(nP); полезный spring-ход имеет время без нового номинального объёма
```

**`thread.return-time/1`**, строка 143:

```text
treturn=Lreturn/vreturn, только для явно объявленного возвратного движения
```

**`thread.no-return-time/1`**, строка 143:

```text
При явно нулевом Lreturn время возвратного движения 0; неизвестное Lreturn нулём не заменяется
```

**`thread.motion-cycle-time/1`**, строка 144:

```text
tcycle=tfeed+treturn; только эти движения, без скрытой синхронизации, выдержек и наладки
```

**`thread.unsupported-volume/1`**, строка 145:

```text
Точный винтовой V для cut в версии 1 не поддержан; кольцевая оболочка не используется
```

**`thread.spring-volume/1`**, строка 145:

```text
Для явно выбранного spring новый номинальный V=0; рабочее движение сохраняется
```

**`thread.average-rate/1`**, строка 146:

```text
Qaverage=V/(1000tfeed) при известном V и tfeed>0; для cut UNKNOWN
```

## 2. Арифметика Go-подбора и событий партии

Ниже сохранены численные строки с именами исходных переменных. Управляющие проверки, ветви и ограничения следует читать в соответствующих функциях; отдельная строка не является самостоятельной новой методикой.

### stock-selection/selection/engine.go

[stock-selection/selection/engine.go](F:/projects/metall-dev-2/stock-selection/selection/engine.go)

```go
22: func (e *Fault) Error() string                      { return e.Code + ": " + e.Message }
52: func pin(ref Object) string { return str(ref["id"]) + "@" + str(ref["version"]) }
87: 		id += ":" + Hash([]byte(description))
115: 		obj(response["sources"])[id] = Object{"kind": "published_package", "description": str(ref["id"]) + ", версия " + str(ref["version"]) + ", SHA-256 " + str(ref["sha256"])}
126: 			desc = "Используются закреплённые оценочные условия пакета " + id
318: 			return add(values[nominalRole], deviation)
320: 		message := label + " принята по номиналу детали; верхний предел не подтверждён."
422: 		required := add(finished, add(nums[2], nums[3]))
423: 		target := add(required, c.minus)
425: 			target = mul(newRatInt(ceil(div(target, c.step))), c.step)
427: 		allocated := add(target, c.plus)
432: 		effective := sub(add(diameter, nums[0]), div(mul(allocated, nums[1]), d("100")))
444: 			available = add(available, lower)
448: 		count := capacity(div(sub(sub(sub(available, c.head), times(kerf, c.headCuts)), c.tail), add(allocated, kerf)))
```

### stock-selection/selection/layout.go

[stock-selection/selection/layout.go](F:/projects/metall-dev-2/stock-selection/selection/layout.go)

```go
32: 		n6, n12 = Optimize(integer(quantity), c6, c12)
78: 		per := add(add(c.head, times(r.kerf, c.headCuts)), times(add(r.allocated, r.kerf), q))
79: 		rem := sub(r.available, per)
80: 		groupID := "bar-group-" + Hash([]byte(r.id + ":" + fmt.Sprint(q)))[:16]
82: 		purchase = add(purchase, times(d(r.supply), bars))
83: 		available = add(available, times(r.available, bars))
84: 		consumed = add(consumed, times(per, bars))
85: 		remnants = add(remnants, times(rem, bars))
95: 		full := remaining / r.capacity
100: 		remaining -= full * r.capacity
101: 		left := spec.bars - full
113: 	bars := n6 + n12
115: 	out["material_balance"] = Object{"purchase_length_mm": ds(purchase), "available_length_mm": ds(available), "supply_shortfall_reserve_mm": ds(sub(purchase, available)), "allocated_piece_length_mm": ds(times(first.allocated, n)), "required_piece_length_mm": ds(times(first.required, n)), "finished_envelope_length_mm": ds(times(finished, n)), "face_allowance_length_mm": ds(times(add(first.left, first.right), n)), "cut_tolerance_reserve_mm": ds(times(sub(first.allocated, first.required), n)), "separation_kerf_mm": ds(times(first.kerf, n)), "head_trim_body_mm": ds(times(c.head, bars)), "head_trim_kerf_mm": ds(times(first.kerf, bars*c.headCuts)), "layout_remnants_mm": ds(remnants)}
116: 	if add(consumed, remnants).Cmp(available) != 0 {
```

### stock-selection/selection/decimal.go

[stock-selection/selection/decimal.go](F:/projects/metall-dev-2/stock-selection/selection/decimal.go)

```go
14: 		panic("invalid validated decimal: " + s)
20: func add(a, b dec) dec         { return new(big.Rat).Add(a, b) }
21: func sub(a, b dec) dec         { return new(big.Rat).Sub(a, b) }
22: func mul(a, b dec) dec         { return new(big.Rat).Mul(a, b) }
23: func div(a, b dec) dec         { return new(big.Rat).Quo(a, b) }
24: func times(a dec, n int64) dec { return mul(a, new(big.Rat).SetInt64(n)) }
25: func floor(a dec) *big.Int {
33: func ceil(a dec) *big.Int { return new(big.Int).Neg(floor(new(big.Rat).Neg(a))) }
77: func capacity(a dec) int64 {
78: 	n := floor(a)
87: func ceilDiv(a, b int64) int64 {
91: 	return 1 + (a-1)/b
96: func Optimize(n, c6, c12 int64) (n6, n12 int64) {
98: 		return 0, ceilDiv(n, c12)
101: 		return ceilDiv(n, c6), 0
104: 		n12 = n / c12
105: 		rem := n % c12
112: 		return 0, n12 + 1
114: 	units := ceilDiv(n, c6)
115: 	delta := 2*c6 - c12
119: 		n12 = units / 2
121: 	return units - 2*n12, n12
```

### machining-calc/calc/bandsaw_batch.go

[machining-calc/calc/bandsaw_batch.go](F:/projects/metall-dev-2/machining-calc/calc/bandsaw_batch.go)

```go
224: 		return BatchCutEvent{EventID: "cut-" + string(kind), Kind: kind, Scope: "batch", Count: count, BarGroupIDs: append([]string{}, ids...), Section: BatchCutSection{Shape: "solid_round", Diameter: diameterText}, Kerf: kerfText, CuttingProfileRef: *l.CuttingProfileRef}
```

## 3. Вычислительные выражения Python

Поиск выполнен AST-разбором без импорта модулей продукта. Включены присваивания, возвраты и накопления с арифметическими операциями либо численными вызовами, а также сравнения в предметных областях. Синтаксические кандидаты содержат также операции над множествами, сборку данных, округление отображения и служебные счётчики. Они сохранены для аудита покрытия, а не объявлены дополнительными инженерными формулами. Вложенные функции могут повторяться в индексе внешней и собственной функции. Условия выполнения не теряются в ссылке на исходник, но не все повторяются в вырезанном выражении.

### mvp/src/metall_mvp/db/tolerances.py

[mvp/src/metall_mvp/db/tolerances.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/db/tolerances.py)

#### `claim`, строка 55

Строка 78:

```python
changed.rowcount == 1
```

Строка 72:

```python
jobs.c.stale == 0
```

#### `begin`, строка 84

Строка 91:

```python
result.rowcount == 1
```

Строка 88:

```python
jobs.c.stale == 0
```

### mvp/src/metall_mvp/domain/calculation/axial_length_chain.py

[mvp/src/metall_mvp/domain/calculation/axial_length_chain.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/axial_length_chain.py)

#### `_known_lower`, строка 29

Строка 52:

```python
lower is not None
```

Строка 54:

```python
dimension.nominal_value is not None
```

Строка 56:

```python
return dimension.nominal_value + deviation
```

Строка 57:

```python
opposite > 0
```

Строка 37:

```python
effective.lower_limit is not None
```

#### `assess_axial_length`, строка 62

Строка 148:

```python
nominal = sum(
        (item.nominal_value for item in lengths if item.nominal_value is not None), Decimal("0")
    )
```

Строка 175:

```python
lower_sum = (
        None
        if any(value is None for value in lowers)
        else sum((value for value in lowers if value is not None), Decimal("0"))
    )
```

Строка 180:

```python
upper_sum = (
        None
        if any(value is None for value in uppers)
        else sum((value for value in uppers if value is not None), Decimal("0"))
    )
```

Строка 86:

```python
len(chains) != 1
```

Строка 135:

```python
item.nominal_value is None
```

Строка 136:

```python
item.nominal_value <= 0
```

Строка 149:

```python
item.nominal_value is not None
```

Строка 164:

```python
item.nominal_value != nominal
```

Строка 187:

```python
upper_sum is not None
```

Строка 188:

```python
(overall_lower := _known_lower(item)) is not None
```

Строка 189:

```python
overall_lower > upper_sum
```

Строка 192:

```python
lower_sum is not None
```

Строка 194:

```python
(overall_upper := item.effective_upper_limit) is not None
```

Строка 195:

```python
overall_upper < lower_sum
```

Строка 204:

```python
lower is not None
```

Строка 204:

```python
lower <= 0
```

Строка 205:

```python
upper is not None
```

Строка 205:

```python
upper <= 0
```

Строка 206:

```python
lower is not None
```

Строка 206:

```python
upper is not None
```

Строка 206:

```python
lower > upper
```

### mvp/src/metall_mvp/domain/calculation/bar_stock_assortment.py

[mvp/src/metall_mvp/domain/calculation/bar_stock_assortment.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/bar_stock_assortment.py)

#### `section_tolerance`, строка 84

Строка 99:

```python
raw = abs(_decimal(row["lower_deviation_mm"]))
```

Строка 97:

```python
nominal not in values
```

#### `incomplete_nominals`, строка 105

Строка 110:

```python
section_tolerance(blank_type, nominal) is None
```

#### `bar_stock_rows_from_builtin`, строка 115

Строка 148:

```python
curvature_pct is not None
```

Строка 150:

```python
curvature_pct is not None
```

#### `bar_stock_rows_from_candidate`, строка 165

Строка 187:

```python
raw_lower is None
```

Строка 190:

```python
lower > 0
```

Строка 180:

```python
curvature_value is not None
```

Строка 205:

```python
curvature_value is not None
```

### mvp/src/metall_mvp/domain/calculation/bar_stock_selection.py

[mvp/src/metall_mvp/domain/calculation/bar_stock_selection.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/bar_stock_selection.py)

#### `curvature_from_percent`, строка 98

Строка 103:

```python
return value / Decimal("100")
```

#### `curvature_from_mm_per_m`, строка 106

Строка 111:

```python
return value / Decimal("1000")
```

#### `required_section_size`, строка 114

Строка 128:

```python
required = section + deviation
```

#### `guaranteed_section_size`, строка 134

Строка 141:

```python
nominal_mm <= _D_ZERO
```

Строка 143:

```python
section_deviation_mm < _D_ZERO
```

Строка 145:

```python
part_length_mm <= _D_ZERO
```

Строка 147:

```python
curvature_per_mm is not None
```

Строка 147:

```python
curvature_per_mm < _D_ZERO
```

#### `satisfies_literal_condition`, строка 152

Строка 166:

```python
guaranteed >= required_mm
```

#### `check_prescribed_stock`, строка 169

Строка 182:

```python
required_mm is not None
```

Строка 184:

```python
required_length_mm is not None
```

Строка 187:

```python
row.nominal_mm == prescribed
```

Строка 189:

```python
row.available_length_mm is None
```

Строка 200:

```python
required_mm is None
```

Строка 201:

```python
stock_minimum(row.nominal_mm, -row.section_deviation_mm) >= required_mm
```

Строка 204:

```python
required_length_mm is None
```

#### `select_minimal_bar_stock`, строка 227

Строка 242:

```python
part_length <= _D_ZERO
```

Строка 269:

```python
row.available_length_mm is None
```

Строка 269:

```python
row.available_length_mm >= part_length
```

Строка 256:

```python
item.available_length_mm is None
```

### mvp/src/metall_mvp/domain/calculation/basic_selection.py

[mvp/src/metall_mvp/domain/calculation/basic_selection.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/basic_selection.py)

#### `compare_basic_blank_options`, строка 13

Строка 35:

```python
recommended = min(
        passing,
        key=lambda option: (
            option.blank_candidate.blank_mass_kg,
            option.blank_candidate.candidate_id,
        ),
    )
```

### mvp/src/metall_mvp/domain/calculation/bent_round_bar.py

[mvp/src/metall_mvp/domain/calculation/bent_round_bar.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/bent_round_bar.py)

#### `_round`, строка 63

Строка 64:

```python
return value.quantize(_STEP, rounding=ROUND_CEILING if upper else ROUND_FLOOR)
```

#### `_value`, строка 67

Строка 68:

```python
dimension.nominal_value is None
```

Строка 88:

```python
lo is None
```

Строка 88:

```python
hi is None
```

Строка 88:

```python
lo <= 0
```

Строка 88:

```python
hi < lo
```

Строка 76:

```python
effective.lower_limit is not None
```

Строка 77:

```python
effective.upper_limit is not None
```

Строка 81:

```python
dimension.lower_limit is not None
```

Строка 81:

```python
dimension.upper_limit is not None
```

Строка 82:

```python
dimension.lower_deviation is not None
```

Строка 82:

```python
dimension.lower_deviation <= 0
```

Строка 83:

```python
dimension.upper_deviation is not None
```

Строка 83:

```python
dimension.upper_deviation >= 0
```

#### `_radius`, строка 93

Строка 95:

```python
return _Interval(
            radius.nominal + diameter.nominal / 2,
            radius.lower + diameter.lower / 2,
            radius.upper + diameter.upper / 2,
        )
```

Строка 101:

```python
return _Interval(
            radius.nominal - diameter.nominal / 2,
            radius.lower - diameter.upper / 2,
            radius.upper - diameter.lower / 2,
        )
```

#### `_angle`, строка 109

Строка 134:

```python
value = _Interval(180 - value.nominal, 180 - value.upper, 180 - value.lower)
```

Строка 135:

```python
value.upper < derived.lower
```

Строка 135:

```python
value.lower > derived.upper
```

#### `_own_lower_limit`, строка 160

Строка 175:

```python
dimension.lower_limit is not None
```

Строка 176:

```python
dimension.lower_deviation is not None
```

Строка 169:

```python
effective.lower_limit is not None
```

Строка 169:

```python
effective.lower_deviation is not None
```

Строка 171:

```python
effective.upper_deviation is not None
```

Строка 171:

```python
effective.upper_deviation >= 0
```

Строка 177:

```python
dimension.upper_deviation is not None
```

Строка 177:

```python
dimension.upper_deviation >= 0
```

#### `_own_tolerance_unverified`, строка 183

Строка 184:

```python
lower_limit is not None
```

#### `bent_round_bar_section`, строка 201

Строка 227:

```python
section.nominal_value is None
```

Строка 220:

```python
d.id == path.section_dimension_ref
```

#### `develop_round_bar`, строка 240

Строка 244:

```python
len(paths) != 1
```

Строка 433:

```python
return DevelopedRoundBarGeometry(
            **base,
            status="CALCULATED",
            nominal_length_mm=_round(
                sum((v.nominal for v in (*tangents, *arcs)), Decimal(0)), upper=True
            ),
            lower_length_mm=_round(
                sum((v.lower for v in (*tangents, *arcs)), Decimal(0)), upper=False
            ),
            upper_length_mm=_round(
                sum((v.upper for v in (*tangents, *arcs)), Decimal(0)), upper=True
            ),
            length_basis="nominal" if nominal_refs else "confirmed_limits",
            centerline_radii_mm=tuple(r.nominal for r in radii if r),
            deflection_angles_deg=tuple(a.nominal for a in angles),
            angle_sources=tuple(s for _, s in angles_and_sources),
            tangent_lengths_mm=tuple(v.nominal for v in tangents),
            arc_lengths_mm=tuple(v.nominal for v in arcs),
            conditions=tuple(dict.fromkeys(conditions)),
            reason="Длина осевой линии рассчитана по прямым участкам и дугам гибов.",
        )
```

Строка 308:

```python
max_radius = min(
                height.upper - diameter.lower / 2, width.upper - diameter.lower * Decimal("1.5")
            )
```

Строка 318:

```python
lows = [r.lower if r else diameter.lower / 2 for r in radii]
```

Строка 325:

```python
radius_sum_upper = min(sum(highs), width.upper - diameter.lower)
```

Строка 326:

```python
coefficient = PI / 2 - 2
```

Строка 327:

```python
nominal_radius_max = min(
                height.nominal - diameter.nominal / 2,
                width.nominal - diameter.nominal * Decimal("1.5"),
            )
```

Строка 331:

```python
nominal_sum_lower = sum(r.nominal if r else diameter.nominal / 2 for r in radii)
```

Строка 332:

```python
nominal_sum_upper = min(
                sum(r.nominal if r else nominal_radius_max for r in radii),
                width.nominal - diameter.nominal,
            )
```

Строка 336:

```python
nominal_base = width.nominal + 2 * height.nominal - 2 * diameter.nominal
```

Строка 337:

```python
nominal_lower = nominal_base + coefficient * nominal_sum_upper
```

Строка 338:

```python
nominal_upper = nominal_base + coefficient * nominal_sum_lower
```

Строка 339:

```python
lower = (
                width.lower + 2 * height.lower - 2 * diameter.upper + coefficient * radius_sum_upper
            )
```

Строка 342:

```python
upper = width.upper + 2 * height.upper - 2 * diameter.lower + coefficient * sum(lows)
```

Строка 361:

```python
return DevelopedRoundBarGeometry(
                **base,
                status="BOUNDED" if missing_radius else "CALCULATED",
                nominal_length_mm=_round(nominal, upper=True) if nominal is not None else None,
                nominal_lower_length_mm=_round(nominal_lower, upper=False),
                nominal_upper_length_mm=_round(nominal_upper, upper=True),
                lower_length_mm=_round(max(Decimal(0), lower), upper=False),
                upper_length_mm=_round(upper, upper=True),
                length_basis="nominal" if nominal_refs else "confirmed_limits",
                centerline_radii_mm=tuple(r.nominal if r else None for r in radii),
                deflection_angles_deg=(Decimal(90), Decimal(90)),
                angle_sources=("orthogonal_u", "orthogonal_u"),
                tangent_lengths_mm=tangents,
                arc_lengths_mm=arcs,
                conditions=tuple(dict.fromkeys(conditions)),
                reason="Геометрическая длина осевой линии П-образного прутка; пространственный габарит не подставлен вместо длины.",
                formula="L = W_out + 2 * H_out - 2 * d + (pi / 2 - 2) * (R_left + R_right); R_i >= d / 2; R_left + R_right <= W_out - d; R_i <= H_out - d / 2",
            )
```

Строка 418:

```python
adjacent = (
                setbacks[max(0, i - 1) : min(len(setbacks), i + 1)]
                if leg.length_basis == "virtual_vertex"
                else []
            )
```

Строка 423:

```python
result = _Interval(
                value.nominal - sum(s.nominal for s in adjacent),
                value.lower - sum(s.upper for s in adjacent),
                value.upper - sum(s.lower for s in adjacent),
            )
```

Строка 275:

```python
d.is_reference is True
```

Строка 348:

```python
tangents = (
                    height.nominal - diameter.nominal / 2 - rn[0],
                    width.nominal - diameter.nominal - sum(rn),
                    height.nominal - diameter.nominal / 2 - rn[1],
                )
```

Строка 355:

```python
arcs = tuple(PI * r / 2 for r in rn)
```

Строка 356:

```python
nominal = sum(tangents, Decimal(0)) + sum(arcs, Decimal(0))
```

Строка 393:

```python
radius is not None
```

Строка 407:

```python
return r * Decimal(str(tan(radians(float(a)) / 2))) if a < 180 else Decimal(0)
```

Строка 428:

```python
result.lower < 0
```

Строка 298:

```python
radius.lower < diameter.upper / 2
```

Строка 312:

```python
max_radius < diameter.upper / 2
```

Строка 313:

```python
width.lower < 2 * diameter.upper
```

Строка 314:

```python
height.lower < diameter.upper
```

Строка 320:

```python
sum(lows) > width.upper - diameter.lower
```

Строка 353:

```python
min(tangents) < 0
```

Строка 401:

```python
angle.upper >= 180
```

Строка 385:

```python
a.lower <= 0
```

Строка 385:

```python
a.upper > 180
```

Строка 407:

```python
a < 180
```

Строка 306:

```python
angle.lower != 90
```

Строка 306:

```python
angle.upper != 90
```

Строка 321:

```python
r > height.upper - diameter.lower / 2
```

Строка 364:

```python
nominal is not None
```

#### `read`, строка 270

Строка 275:

```python
d.is_reference is True
```

#### `setback`, строка 406

Строка 407:

```python
return r * Decimal(str(tan(radians(float(a)) / 2))) if a < 180 else Decimal(0)
```

Строка 407:

```python
a < 180
```

### mvp/src/metall_mvp/domain/calculation/blank_contract.py

[mvp/src/metall_mvp/domain/calculation/blank_contract.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/blank_contract.py)

#### `plan_cutting`, строка 322

Строка 347:

```python
piece = blank_cut_length_mm + kerf_mm
```

Строка 368:

```python
best = min(candidates, key=lambda item: item[0])
```

Строка 370:

```python
option_results = tuple(
        CuttingPlanOption(
            supply_length_mm=item.max_length_mm,
            parts_per_bar=item_parts,
            bars_required=item_bars,
            total_requested_length_mm=item_total,
            consumed_length_mm=item_consumed,
            waste_length_mm=item_total - item_consumed,
            selected=item is option,
        )
        for _, item, item_parts, item_bars, item_total, item_consumed in candidates
    )
```

Строка 382:

```python
return CuttingPlan(
        quantity=effective_quantity,
        quantity_assumed=effective_quantity_assumed,
        blank_cut_length_mm=blank_cut_length_mm,
        kerf_mm=kerf_mm,
        selected_supply_length_mm=option.max_length_mm,
        parts_per_bar=parts_per_bar,
        bars_required=bars_required,
        total_requested_length_mm=total_requested,
        consumed_length_mm=consumed,
        waste_length_mm=total_requested - consumed,
        options=option_results,
    )
```

Строка 338:

```python
effective_quantity < 1
```

Строка 340:

```python
blank_cut_length_mm <= _ZERO
```

Строка 342:

```python
kerf_mm < _ZERO
```

Строка 354:

```python
parts_per_bar = int(option.max_length_mm // piece)
```

Строка 355:

```python
bars_required = -(-effective_quantity // parts_per_bar)
```

Строка 356:

```python
total_requested = bars_required * option.max_length_mm
```

Строка 358:

```python
consumed = effective_quantity * piece
```

Строка 362:

```python
maximum = max(item.max_length_mm for item in supply_options)
```

Строка 336:

```python
quantity is None
```

Строка 337:

```python
quantity is None
```

Строка 352:

```python
piece > option.max_length_mm
```

#### `validate_rule_ref`, строка 65

Строка 69:

```python
self.allowance_per_side_mm != _ZERO
```

#### `validate_source`, строка 124

Строка 126:

```python
self.nominal_mm is None
```

Строка 129:

```python
self.nominal_mm is not None
```

#### `guaranteed_min_mm`, строка 149

Строка 150:

```python
return self.nominal_mm + self.lower_deviation_mm
```

#### `guaranteed_max_mm`, строка 153

Строка 154:

```python
return self.nominal_mm + self.upper_deviation_mm
```

#### `covers`, строка 156

Строка 157:

```python
self.guaranteed_min_mm >= required_min_mm
```

#### `validate_selection`, строка 179

Строка 197:

```python
self.guaranteed_allowance_per_side_mm is not None
```

Строка 202:

```python
expected = (self.selected.guaranteed_min_mm - self.finished_max_mm) / 2
```

Строка 203:

```python
self.guaranteed_allowance_per_side_mm != expected
```

Строка 183:

```python
self.selected.nominal_mm != self.prescribed.nominal_mm
```

Строка 193:

```python
self.required_min_mm is None
```

Строка 198:

```python
self.finished_max_mm is None
```

#### `validate_range`, строка 223

Строка 224:

```python
self.max_length_mm < self.min_length_mm
```

#### `piece_consumption_mm`, строка 285

Строка 286:

```python
return self.blank_cut_length_mm + self.kerf_mm
```

#### `validate_arithmetic`, строка 289

Строка 291:

```python
expected_parts = int(self.selected_supply_length_mm // piece)
```

Строка 296:

```python
expected_bars = -(-self.quantity // self.parts_per_bar)
```

Строка 292:

```python
expected_parts < 1
```

Строка 299:

```python
self.total_requested_length_mm != self.bars_required * self.selected_supply_length_mm
```

Строка 301:

```python
self.consumed_length_mm != self.quantity * piece
```

Строка 303:

```python
self.waste_length_mm != self.total_requested_length_mm - self.consumed_length_mm
```

Строка 307:

```python
len(selected) != 1
```

Строка 311:

```python
option.supply_length_mm != self.selected_supply_length_mm
```

Строка 314:

```python
option.total_requested_length_mm != self.total_requested_length_mm
```

Строка 315:

```python
option.consumed_length_mm != self.consumed_length_mm
```

Строка 316:

```python
option.waste_length_mm != self.waste_length_mm
```

### mvp/src/metall_mvp/domain/calculation/blank_preview.py

[mvp/src/metall_mvp/domain/calculation/blank_preview.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/blank_preview.py)

#### `_literal_stock_callout`, строка 200

Строка 213:

```python
len(observed) == 1
```

Строка 210:

```python
item.nominal_section_mm is not None
```

#### `_described_dimension`, строка 298

Строка 314:

```python
dimension.nominal_value is not None
```

#### `_dimension_for_role`, строка 320

Строка 331:

```python
return max(candidates, key=_required_upper, default=None)
```

Строка 328:

```python
item.nominal_value is not None
```

#### `_inferred_blank_type`, строка 347

Строка 364:

```python
len(matched_forms) == 1
```

#### `_proposal_dimensions`, строка 375

Строка 380:

```python
envelope_diameter: Dimension | None = None
```

Строка 381:

```python
envelope_length: Dimension | None = None
```

Строка 385:

```python
length is None
```

Строка 390:

```python
length is None
```

Строка 396:

```python
length = max(linear, key=_required_upper, default=None)
```

Строка 398:

```python
diameter is None
```

Строка 409:

```python
diameter_dimension = envelope_diameter or max(
                diameters,
                key=lambda item: item.effective_upper_limit or item.nominal_value,
                default=None,
            )
```

Строка 394:

```python
item.nominal_value is not None
```

Строка 402:

```python
item.nominal_value is not None
```

#### `_dimensions_sufficient`, строка 430

Строка 432:

```python
value.diameter_mm is not None
```

Строка 432:

```python
value.length_mm is not None
```

Строка 434:

```python
value.outer_diameter_mm is not None
```

Строка 434:

```python
value.length_mm is not None
```

#### `_candidate_decimals`, строка 455

Строка 462:

```python
value > 0
```

#### `_point_tolerance_lower`, строка 467

Строка 489:

```python
return min(lowers) if lowers else None
```

Строка 483:

```python
nominal not in values
```

#### `_dimensions_from_reference_candidates`, строка 492

Строка 521:

```python
nominal = next(
            (
                value
                for value in values
                if value
                + (
                    _point_tolerance_lower(
                        candidates,
                        standard_designation=standard_designation,
                        nominal=value,
                    )
                    or Decimal("0")
                )
                >= base.diameter_mm
            ),
            None,
        )
```

Строка 520:

```python
base.diameter_mm is not None
```

Строка 539:

```python
base.outer_diameter_mm is not None
```

Строка 542:

```python
base.thickness_mm is not None
```

Строка 525:

```python
value
                + (
                    _point_tolerance_lower(
                        candidates,
                        standard_designation=standard_designation,
                        nominal=value,
                    )
                    or Decimal("0")
                )
                >= base.diameter_mm
```

Строка 540:

```python
value >= base.outer_diameter_mm
```

Строка 543:

```python
value >= base.thickness_mm
```

#### `_source_backed_proposals`, строка 596

Строка 707:

```python
reason = (
            (
                (
                    "Материал взят из области применимости ГОСТа; "
                    if materials_from_references
                    else ""
                )
                + (
                    "форма и номинальный профиль взяты из обозначения "
                    "материала/сортамента на чертеже; "
                    if literal_profile
                    else "номинальный профиль выбран из извлечённого размерного ряда ГОСТа; "
                )
            )
            + "габарит реза — по максимальному размеру готовой детали с явным "
            "верхним отклонением. Коммерческие данные не используются."
            if not missing
            else "Для завершения нормативного подбора не хватает: " + ", ".join(missing) + "."
        )
```

#### `_preview_blocking_geometry`, строка 755

Строка 817:

```python
dimension.nominal_value is None
```

Строка 781:

```python
overall_length is not None
```

Строка 782:

```python
diameter is not None
```

#### `build_normative_blank_preview`, строка 873

Строка 1137:

```python
preview_reason += " " + selected_blank.curvature_assessment.reason
```

Строка 1058:

```python
strategy is None
```

Строка 1136:

```python
selected_blank.curvature_assessment is not None
```

Строка 1162:

```python
item.curvature_assessment is not None
```

### mvp/src/metall_mvp/domain/calculation/blank_requirement_resolver.py

[mvp/src/metall_mvp/domain/calculation/blank_requirement_resolver.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/blank_requirement_resolver.py)

#### `_surface_allowance`, строка 93

Строка 111:

```python
len(matches) > 1
```

#### `_required_roles`, строка 154

Строка 173:

```python
finished.inner_diameter_mm is not None
```

Строка 175:

```python
finished.length_mm is not None
```

#### `resolve_blank_requirement`, строка 185

Строка 233:

```python
required = BlankDimensions(
        diameter_mm=(
            finished_dimensions.diameter_mm + outer * 2
            if finished_dimensions.diameter_mm is not None
            else None
        ),
        outer_diameter_mm=(
            finished_dimensions.outer_diameter_mm + outer * 2
            if finished_dimensions.outer_diameter_mm is not None
            else None
        ),
        inner_diameter_mm=(
            max(_ZERO, finished_dimensions.inner_diameter_mm - inner * 2)
            if finished_dimensions.inner_diameter_mm is not None
            else None
        ),
        length_mm=(
            finished_dimensions.length_mm + length * 2
            if finished_dimensions.length_mm is not None
            else None
        ),
        width_mm=(
            finished_dimensions.width_mm + outer * 2
            if finished_dimensions.width_mm is not None
            else None
        ),
        height_mm=(
            finished_dimensions.height_mm + outer * 2
            if finished_dimensions.height_mm is not None
            else None
        ),
        thickness_mm=(
            finished_dimensions.thickness_mm + thickness * 2
            if finished_dimensions.thickness_mm is not None
            else None
        ),
    )
```

Строка 236:

```python
finished_dimensions.diameter_mm is not None
```

Строка 241:

```python
finished_dimensions.outer_diameter_mm is not None
```

Строка 246:

```python
finished_dimensions.inner_diameter_mm is not None
```

Строка 251:

```python
finished_dimensions.length_mm is not None
```

Строка 256:

```python
finished_dimensions.width_mm is not None
```

Строка 261:

```python
finished_dimensions.height_mm is not None
```

Строка 266:

```python
finished_dimensions.thickness_mm is not None
```

### mvp/src/metall_mvp/domain/calculation/builtin_blank_resolution.py

[mvp/src/metall_mvp/domain/calculation/builtin_blank_resolution.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/builtin_blank_resolution.py)

#### `_largest_for_role`, строка 90

Строка 91:

```python
return max(
        (
            item
            for item in passport.dimensions
            if item.role == role and item.nominal_value is not None
        ),
        key=lambda item: _upper(item) or _ZERO,
        default=None,
    )
```

Строка 95:

```python
item.nominal_value is not None
```

#### `_detect_blank_type`, строка 133

Строка 168:

```python
length is not None
```

Строка 168:

```python
width is not None
```

Строка 168:

```python
height is not None
```

Строка 168:

```python
width == height
```

#### `_detect_standard`, строка 173

Строка 193:

```python
len(explicit_matches) == 1
```

#### `_candidate_pair`, строка 202

Строка 222:

```python
len(revisions) > 1
```

#### `_display_allowances`, строка 251

Строка 256:

```python
length is not None
```

#### `_material_length_category`, строка 260

Строка 268:

```python
profile.identity.stock_length_category is None
```

#### `_lower_deviation`, строка 273

Строка 289:

```python
width_mm is not None
```

Строка 299:

```python
nominal not in values
```

Строка 308:

```python
raw_percent is not None
```

Строка 294:

```python
row_width != width_mm
```

Строка 311:

```python
return nominal * percent / Decimal("100")
```

#### `_upper_deviation`, строка 318

Строка 334:

```python
width_mm is not None
```

Строка 344:

```python
nominal not in values
```

Строка 353:

```python
raw_percent is not None
```

Строка 339:

```python
row_width != width_mm
```

Строка 356:

```python
return nominal * percent / Decimal("100")
```

#### `_build_normative_stock_parameters`, строка 363

Строка 638:

```python
guaranteed_fact = (selected_nominal + lower_dev) if lower_dev is not None else selected_nominal
```

Строка 487:

```python
low_idx = max(0, center_idx - 1)
```

Строка 488:

```python
high_idx = min(len(all_nominals), center_idx + 2)
```

Строка 490:

```python
low_idx = max(0, center_idx - 3)
```

Строка 491:

```python
high_idx = min(len(all_nominals), center_idx + 4)
```

Строка 646:

```python
piece_mass_kg = (sel_mass * (cut_length_mm / Decimal("1000"))).quantize(Decimal("0.01"))
```

Строка 663:

```python
min_wall = selected_wall + wall_minus
```

Строка 664:

```python
guaranteed_d_max = (
            (selected_nominal + upper_dev) if upper_dev is not None else selected_nominal
        )
```

Строка 667:

```python
guaranteed_inner_max_val = guaranteed_d_max - Decimal("2") * min_wall
```

Строка 668:

```python
math_explanation = (
            f"Расчётная потребность трубы: наружный диаметр не менее {target_outer} мм"
            + (
                f", внутренний диаметр не более {required_inner_max} мм (с учётом припуска)"
                if required_inner_max is not None
                else ""
            )
            + f". По сортаменту {standard} выбран типоразмер Ø{selected_nominal} × {selected_wall} мм: "
            f"гарантированный наружный диаметр с учётом допуска составляет {guaranteed_fact} мм >= {target_outer} мм, "
            f"гарантированный внутренний диаметр не более {guaranteed_inner_max_val.quantize(Decimal('0.01'))} мм"
            + (f" <= {required_inner_max} мм" if required_inner_max is not None else "")
            + (f", теоретическая масса {sel_mass} кг/м." if sel_mass else ".")
        )
```

Строка 742:

```python
len_disp = f"расчётный формат {canonical_decimal(mill_length_mm / 1000)} м"
```

Строка 743:

```python
math_explanation += (
            f" Расчётный формат проката: {canonical_decimal(mill_length_mm / 1000)} м"
            f" — {cutting_plan.parts_per_bar} заготовок из одного прутка, "
            f"{cutting_plan.bars_required} прутк., "
            f"kerf {format(cutting_plan.kerf_mm, 'f')} мм."
        )
```

Строка 426:

```python
row_nominal != selected_nominal
```

Строка 461:

```python
lower_dev is not None
```

Строка 463:

```python
upper_dev is not None
```

Строка 464:

```python
tol_disp += f"; верхнее {canonical_decimal(upper_dev)} мм"
```

Строка 485:

```python
selected_nominal in all_nominals
```

Строка 493:

```python
calculated_size in all_nominals
```

Строка 502:

```python
r_nom not in target_nominals
```

Строка 524:

```python
r_nom == selected_nominal
```

Строка 638:

```python
lower_dev is not None
```

Строка 645:

```python
sel_mass is not None
```

Строка 645:

```python
cut_length_mm is not None
```

Строка 685:

```python
math_explanation = (
            f"В штампе чертежа конструктором назначен исходный сортамент {standard}: "
            f"{stamp_callout_text or f'{selected_nominal} мм'}"
            + (f" (класс точности {precision_class})" if precision_class else "")
            + f". Назначение сохранено как факт чертежа, но гарантированный размер "
            f"{guaranteed_fact} мм меньше расчётной потребности {selection.required_min_mm} мм."
            + (
                f" Система рекомендует {recommended.nominal_mm} мм "
                f"(гарантированный размер {recommended.guaranteed_min_mm} мм)."
                if recommended is not None
                else " Безопасная рекомендация в сортаменте не найдена."
            )
        )
```

Строка 428:

```python
supply_width is not None
```

Строка 428:

```python
supply_length is not None
```

Строка 445:

```python
selected_supply_length is not None
```

Строка 446:

```python
row_length is not None
```

Строка 479:

```python
nom not in all_nominals
```

Строка 507:

```python
length_raw is not None
```

Строка 525:

```python
selected_supply_length is not None
```

Строка 527:

```python
supply_width is not None
```

Строка 527:

```python
supply_length is not None
```

Строка 665:

```python
upper_dev is not None
```

Строка 699:

```python
math_explanation = (
            f"В штампе чертежа конструктором явно назначен исходный сортамент {standard}: {stamp_callout_text or f'{selected_nominal} мм'}"
            + (f" (класс точности {precision_class})" if precision_class else "")
            + f". Нормативная проверка подтверждает применимость: с учётом минусового допуска стандарта {lower_dev} мм "
            f"гарантированный фактический размер проката составляет не менее {guaranteed_fact} мм, "
            + (
                f"что превышает размер готовой детали ({finished_dimension} мм) и обеспечивает припуск на чистовую обработку."
                if finished_dimension is not None
                else "что полностью покрывает габарит детали."
            )
        )
```

Строка 434:

```python
rw != supply_width
```

Строка 434:

```python
rl != supply_length
```

Строка 526:

```python
r_l == selected_supply_length
```

Строка 528:

```python
r_w == supply_width
```

Строка 528:

```python
r_l == supply_length
```

Строка 568:

```python
insuff_note = f"Недостаточно: {r_nom} + ({r_lower}) = {r_nom + r_lower} мм < {limit_target} мм (номинал детали)"
```

Строка 756:

```python
supply_width is not None
```

Строка 757:

```python
supply_length is not None
```

Строка 538:

```python
r_lower_d is not None
```

Строка 538:

```python
r_upper_d is not None
```

Строка 551:

```python
r_min_wall = r_wall + r_wall_minus
```

Строка 552:

```python
r_min_d = r_nom + r_lower_d
```

Строка 553:

```python
r_max_d = r_nom + r_upper_d
```

Строка 554:

```python
r_max_hole = r_max_d - Decimal("2") * r_min_wall
```

Строка 566:

```python
r_lower is not None
```

Строка 566:

```python
r_nom + r_lower < limit_target
```

Строка 711:

```python
calculated_size < selected_nominal
```

Строка 714:

```python
calc_fact = calculated_size + calc_lower
```

Строка 561:

```python
insuff_note = f"Отверстие заготовки велико: d_max = {r_max_hole.quantize(Decimal('0.01'))} мм > {required_inner_max} мм (стенка тоньше допустимой)"
```

Строка 713:

```python
calc_lower is not None
```

Строка 713:

```python
calculated_size + calc_lower < calculated_size
```

Строка 767:

```python
selected_supply_length is not None
```

#### `_select_linear_nominal`, строка 805

Строка 815:

```python
lower is not None
```

Строка 815:

```python
nominal + lower >= required
```

#### `_round_requirements`, строка 820

Строка 823:

```python
required_diameter is None
```

Строка 824:

```python
required_diameter = (
            max(
                (
                    _upper(item) or _ZERO
                    for item in passport.dimensions
                    if item.kind == DimensionKind.DIAMETER
                    and item.nominal_value is not None
                    and not is_observed_stock_callout_dimension(item)
                ),
                default=_ZERO,
            )
            or None
        )
```

Строка 830:

```python
item.nominal_value is not None
```

#### `_sheet_requirements`, строка 842

Строка 847:

```python
thickness_dimension = max(
        (
            item
            for item in passport.dimensions
            if item.nominal_value is not None and item.is_envelope_thickness
        ),
        key=lambda item: _upper(item) or _ZERO,
        default=_largest_for_role(passport, DimensionRole.OVERALL_HEIGHT),
    )
```

Строка 851:

```python
item.nominal_value is not None
```

#### `_hex_requirements`, строка 868

Строка 876:

```python
item.nominal_value is not None
```

#### `_tube_requirements`, строка 893

Строка 898:

```python
inner_diameter: Decimal | None = None
```

Строка 911:

```python
inner_diameter is None
```

Строка 903:

```python
item.typed_parameters.diameter is not None
```

Строка 908:

```python
inner_diameter is None
```

Строка 922:

```python
dim.nominal_value is not None
```

#### `_select_tube`, строка 929

Строка 963:

```python
wall_lower_raw is not None
```

Строка 975:

```python
mass = (Decimal("0.0246615") * wall * (d - wall)).quantize(Decimal("0.001"))
```

Строка 951:

```python
required_length is not None
```

Строка 959:

```python
lower_d is None
```

Строка 959:

```python
upper_d is None
```

#### `_select_sheet`, строка 986

Строка 1041:

```python
return min(candidates, key=lambda item: item[0])[1] if candidates else None
```

Строка 1006:

```python
formats = sorted(
            {
                (Decimal(str(item["width_mm"])), Decimal(str(item["length_mm"])))
                for item in display_rows
                if item.get("width_mm") is not None
                and item.get("length_mm") is not None
                and item.get("availability_status", "standard") == "standard"
                and Decimal(str(item.get("nominal_size_mm")).replace(",", ".")) == nominal
            },
            key=lambda item: (item[0] * item[1], item[0], item[1]),
        )
```

Строка 1032:

```python
key = (
                nominal,
                plan.total_requested_area_mm2,
                plan.sheets_required,
                width * length,
                width,
                length,
            )
```

Строка 1024:

```python
lower is None
```

Строка 1024:

```python
nominal + lower < required_thickness
```

Строка 1018:

```python
width >= required_width
```

Строка 1018:

```python
length >= required_length
```

Строка 1019:

```python
width >= required_length
```

Строка 1019:

```python
length >= required_width
```

#### `_project_supply_lengths`, строка 1071

Строка 1091:

```python
raw_length is not None
```

Строка 1083:

```python
nominal is not None
```

Строка 1086:

```python
wall_thickness is not None
```

#### `_unconfirmed_length_warning`, строка 1102

Строка 1107:

```python
selected_length in _mill_lengths(size, material_category)
```

#### `_plan_project_supply`, строка 1124

Строка 1132:

```python
options = tuple(
        LengthSupplyOption.measured(
            length, label=f"{canonical_decimal(length / Decimal('1000'))} м"
        )
        for length in sorted(set(lengths))
    )
```

#### `_available_bar_length_display`, строка 1147

Строка 1160:

```python
text = format(item / Decimal("1000"), "f")
```

#### `_length_is_proven`, строка 1165

Строка 1178:

```python
required_length <= mill_length
```

#### `_display_row_reference`, строка 1192

Строка 1207:

```python
row_nominal != nominal
```

Строка 1217:

```python
wall_thickness is not None
```

Строка 1222:

```python
row_wall != wall_thickness
```

Строка 1226:

```python
supply_length is not None
```

Строка 1227:

```python
raw_length is not None
```

Строка 1215:

```python
row_width != supply_width
```

Строка 1215:

```python
row_length != supply_length
```

#### `resolve_builtin_assortment_proposal`, строка 1239

Строка 1294:

```python
calculated_dimensions: BlankDimensions | None = None
```

Строка 1295:

```python
calculated_size: Decimal | None = None
```

Строка 1297:

```python
selected_nominal: Decimal | None = None
```

Строка 1298:

```python
supply_width: Decimal | None = None
```

Строка 1299:

```python
supply_length: Decimal | None = None
```

Строка 1300:

```python
selected_wall: Decimal | None = None
```

Строка 1301:

```python
selected_inner: Decimal | None = None
```

Строка 1302:

```python
recommended_nominal: Decimal | None = None
```

Строка 1303:

```python
recommended_supply_width: Decimal | None = None
```

Строка 1304:

```python
prescribed_nominal: Decimal | None = None
```

Строка 1305:

```python
prescribed_precision: str | None = None
```

Строка 1306:

```python
prescribed_callout_text: str | None = None
```

Строка 1307:

```python
required_inner_max: Decimal | None = None
```

Строка 1308:

```python
required_outer: Decimal | None = None
```

Строка 1310:

```python
mill_length_mm: Decimal | None = None
```

Строка 1311:

```python
stamp_callout_text: str | None = None
```

Строка 1312:

```python
finished_dimension: Decimal | None = None
```

Строка 1313:

```python
override_precision_class: str | None = None
```

Строка 1314:

```python
requirement: BlankRequirement | None = None
```

Строка 1315:

```python
cutting_plan: CuttingPlan | None = None
```

Строка 1316:

```python
sheet_cutting_plan: SheetCuttingPlan | None = None
```

Строка 1666:

```python
stock_selection: StockSelection | None = None
```

Строка 1667:

```python
selected_nominal is not None
```

Строка 1746:

```python
selected_nominal is not None
```

Строка 1289:

```python
allowance is not None
```

Строка 1290:

```python
allowance is not None
```

Строка 1669:

```python
recommended_nominal is not None
```

Строка 1700:

```python
prescribed_nominal is not None
```

Строка 1320:

```python
finished_diameter is None
```

Строка 1320:

```python
finished_length is None
```

Строка 1350:

```python
literal_nominal is not None
```

Строка 1363:

```python
selected_nominal is None
```

Строка 1365:

```python
selected_nominal is None
```

Строка 1377:

```python
finished_side = max(finished_width, finished_height)
```

Строка 1696:

```python
prescribed_nominal is not None
```

Строка 1783:

```python
supply_width is not None
```

Строка 1784:

```python
supply_length is not None
```

Строка 1786:

```python
calculated_dimensions.width_mm is not None
```

Строка 1787:

```python
calculated_dimensions.length_mm is not None
```

Строка 1862:

```python
supply_width is not None
```

Строка 1862:

```python
supply_length is not None
```

Строка 1337:

```python
required_diameter is not None
```

Строка 1337:

```python
required_length is not None
```

Строка 1374:

```python
finished_length is None
```

Строка 1374:

```python
finished_width is None
```

Строка 1374:

```python
finished_height is None
```

Строка 1407:

```python
literal_nominal is not None
```

Строка 1418:

```python
selected_nominal is None
```

Строка 1420:

```python
selected_nominal is None
```

Строка 1711:

```python
prescribed_lower is not None
```

Строка 1711:

```python
prescribed_upper is not None
```

Строка 1357:

```python
lower is not None
```

Строка 1357:

```python
literal_nominal + lower >= finished_diameter
```

Строка 1393:

```python
required_length is not None
```

Строка 1430:

```python
finished_length is None
```

Строка 1462:

```python
literal_nominal is not None
```

Строка 1473:

```python
selected_nominal is None
```

Строка 1475:

```python
selected_nominal is None
```

Строка 1412:

```python
lower is not None
```

Строка 1412:

```python
literal_nominal + lower >= finished_dimension
```

Строка 1448:

```python
required_length is not None
```

Строка 1548:

```python
finished_length is None
```

Строка 1548:

```python
finished_width is None
```

Строка 1548:

```python
finished_thickness is None
```

Строка 1590:

```python
literal_nominal is not None
```

Строка 1654:

```python
selected_nominal is None
```

Строка 1659:

```python
selected_nominal is not None
```

Строка 1467:

```python
lower is not None
```

Строка 1467:

```python
literal_nominal + lower >= finished_dimension
```

Строка 1491:

```python
finished_length is None
```

Строка 1568:

```python
required_length is not None
```

Строка 1569:

```python
required_width is not None
```

Строка 1570:

```python
required_thickness is not None
```

Строка 1514:

```python
required_length is not None
```

Строка 1597:

```python
lower is not None
```

Строка 1597:

```python
literal_nominal + lower >= finished_thickness
```

Строка 1604:

```python
area = width * length
```

Строка 1639:

```python
format_lower is None
```

Строка 1640:

```python
literal_nominal + format_lower < finished_thickness
```

Строка 1605:

```python
width >= required_width
```

Строка 1605:

```python
length >= required_length
```

Строка 1606:

```python
width >= required_length
```

Строка 1606:

```python
length >= required_width
```

Строка 1643:

```python
fmt_w >= required_width
```

Строка 1643:

```python
fmt_l >= required_length
```

Строка 1644:

```python
fmt_w >= required_length
```

Строка 1644:

```python
fmt_l >= required_width
```

#### `apply_builtin_assortment_proposal`, строка 1892

Строка 1912:

```python
retained = tuple(
        item
        for item in preview.procurement_proposals
        if not set(item.product_standard_refs) & _BUILTIN_STANDARD_SET
    )
```

#### `_row_tolerance_display`, строка 1985

Строка 1993:

```python
lower is not None
```

Строка 1995:

```python
upper is not None
```

#### `format_rank`, строка 1600

Строка 1604:

```python
area = width * length
```

Строка 1605:

```python
width >= required_width
```

Строка 1605:

```python
length >= required_length
```

Строка 1606:

```python
width >= required_length
```

Строка 1606:

```python
length >= required_width
```

### mvp/src/metall_mvp/domain/calculation/customer_bar_resolution.py

[mvp/src/metall_mvp/domain/calculation/customer_bar_resolution.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/customer_bar_resolution.py)

#### `_upper_deviation_basis`, строка 73

Строка 77:

```python
return bound - dimension.nominal_value, True
```

Строка 75:

```python
dimension.nominal_value is None
```

#### `_largest_dimension`, строка 84

Строка 89:

```python
return max(
        (
            item
            for item in passport.dimensions
            if item.role == role
            and item.nominal_value is not None
            and not is_observed_stock_callout_dimension(item)
            and not reference_mark_confirmed(item, passport.technical_requirements)
        ),
        key=_dimension_sort_key,
        default=None,
    )
```

Строка 94:

```python
item.nominal_value is not None
```

#### `_marked_profile_dimension`, строка 103

Строка 108:

```python
item.nominal_value is None
```

#### `_section_dimension`, строка 125

Строка 145:

```python
return max(
        candidates,
        key=_dimension_sort_key,
        default=None,
    )
```

#### `_updated_context_rows`, строка 189

Строка 217:

```python
row.nominal_size_mm == selected_nominal
```

Строка 229:

```python
prescribed_nominal is not None
```

Строка 218:

```python
row.length_mm is None
```

Строка 218:

```python
row.length_mm == selected_length
```

#### `_build_cutting_plan`, строка 243

Строка 253:

```python
eligible_lengths_mm is not None
```

#### `resolve_customer_bar_assortment_proposal`, строка 309

Строка 411:

```python
section_allowance = section_required - (section_nominal + upper_deviation)
```

Строка 417:

```python
selected_nominal: Decimal | None = None
```

Строка 418:

```python
formula_result: BarStockSelectionResult | None = None
```

Строка 419:

```python
prescribed_nominal: Decimal | None = None
```

Строка 420:

```python
formula_rows = tuple(
        row
        for row in bar_stock_rows_from_candidate(blank_type, size)
        if row.available_length_mm is None
        or row.available_length_mm >= required_length + DEFAULT_KERF_MM
    )
```

Строка 508:

```python
selection = resolve_stock_selection(
        prescribed=(
            StockPrescription(
                source=StockPrescriptionSource.DRAWING,
                nominal_mm=literal_nominal,
                precision_class=literal_precision,
                standard_designation=standard,
            )
            if literal_nominal is not None
            else StockPrescription(source=StockPrescriptionSource.NONE)
        ),
        recommended=row_spec(recommended_row),
        prescribed_spec=row_spec(prescribed_row),
        finished_max_mm=section_nominal + upper_deviation,
        required_min_mm=calculated_size,
    )
```

Строка 378:

```python
upper_deviation is None
```

Строка 390:

```python
requirement = customer_requirement(
            snapshot,
            blank_type,
            _dimensions(
                blank_type, section_mm=section_nominal + upper_deviation, length_mm=part_length
            ),
        )
```

Строка 538:

```python
formula_result.selected_nominal_mm is None
```

Строка 554:

```python
selected_nominal is not None
```

Строка 584:

```python
selected_nominal is not None
```

Строка 368:

```python
section.nominal_value is None
```

Строка 368:

```python
part_length is None
```

Строка 406:

```python
required.length_mm is not None
```

Строка 460:

```python
literal_nominal is not None
```

Строка 548:

```python
selected_nominal is not None
```

Строка 570:

```python
prescribed_nominal is None
```

Строка 655:

```python
explanation += (
                f" Для раскроя использована длина отрезки {required_length} мм; "
                f"мерная поставка {cutting_plan.selected_supply_length_mm} мм, "
                f"kerf {cutting_plan.kerf_mm} мм."
            )
```

Строка 646:

```python
prescribed_nominal is not None
```

Строка 516:

```python
literal_nominal is not None
```

Строка 662:

```python
prescribed_nominal == selected_nominal
```

Строка 727:

```python
prescribed_nominal == selected_nominal
```

Строка 423:

```python
row.available_length_mm is None
```

Строка 424:

```python
row.available_length_mm >= required_length + DEFAULT_KERF_MM
```

Строка 488:

```python
row.nominal_mm == formula_result.selected_nominal_mm
```

Строка 489:

```python
guaranteed_section_size(
                row.nominal_mm,
                row.section_deviation_mm,
                required_length,
                row.curvature_per_mm,
            )
            >= calculated_size
```

Строка 503:

```python
row.nominal_mm == literal_nominal
```

Строка 603:

```python
prescribed_nominal is not None
```

Строка 603:

```python
selected_nominal == prescribed_nominal
```

Строка 606:

```python
prescribed_nominal is not None
```

Строка 606:

```python
selected_nominal == prescribed_nominal
```

Строка 622:

```python
row.nominal_mm == selected_nominal
```

Строка 625:

```python
row.available_length_mm is None
```

Строка 626:

```python
row.available_length_mm == cutting_plan.selected_supply_length_mm
```

### mvp/src/metall_mvp/domain/calculation/customer_requirement.py

[mvp/src/metall_mvp/domain/calculation/customer_requirement.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/customer_requirement.py)

#### `profile_length_upper`, строка 47

Строка 57:

```python
len(refs) == 1
```

Строка 52:

```python
nominal is None
```

#### `bar_supply_lengths`, строка 62

Строка 73:

```python
row.available_length_mm is not None
```

Строка 68:

```python
row.nominal_mm == nominal
```

Строка 69:

```python
guaranteed_minimum(row.nominal_mm, -row.section_deviation_mm) >= required
```

Строка 70:

```python
row.available_length_mm is None
```

Строка 70:

```python
row.available_length_mm >= length
```

#### `tube_supply_lengths`, строка 76

Строка 85:

```python
(row.outer_diameter_mm, row.wall_thickness_mm, row.standard_designation) != (
            selected.outer_diameter_mm,
            selected.wall_thickness_mm,
            selected.standard_designation,
        )
```

Строка 92:

```python
upper is None
```

Строка 95:

```python
upper is not None
```

Строка 96:

```python
guaranteed_minimum(row.outer_diameter_mm, row.outer_deviation_mm) >= required_outer
```

Строка 97:

```python
raw_inner_maximum(
                row.outer_diameter_mm, upper, row.wall_thickness_mm, row.wall_lower_deviation_mm
            )
            <= required_hole
```

Строка 101:

```python
row.available_length_mm is None
```

Строка 101:

```python
row.available_length_mm >= length
```

Строка 105:

```python
row.available_length_mm is not None
```

### mvp/src/metall_mvp/domain/calculation/customer_sheet_resolution.py

[mvp/src/metall_mvp/domain/calculation/customer_sheet_resolution.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/customer_sheet_resolution.py)

#### `_prescribed_sheet`, строка 60

Строка 73:

```python
nominal is not None
```

#### `_thickness_dimension`, строка 76

Строка 85:

```python
return min(explicit, key=lambda item: item.nominal_value or Decimal("Infinity"))
```

Строка 81:

```python
item.nominal_value is not None
```

#### `_updated_context_rows`, строка 127

Строка 138:

```python
row.nominal_size_mm is None
```

Строка 138:

```python
row.width_mm is None
```

Строка 138:

```python
row.length_mm is None
```

Строка 145:

```python
width is None
```

Строка 149:

```python
row.nominal_size_mm == thickness
```

Строка 161:

```python
key
                    == (
                        result.selected.nominal_thickness_mm,
                        result.selected.width_mm,
                        result.selected.length_mm,
                    )
```

Строка 146:

```python
row.width_mm == width
```

Строка 146:

```python
row.length_mm == length
```

Строка 147:

```python
row.width_mm == length
```

Строка 147:

```python
row.length_mm == width
```

#### `resolve_customer_sheet_assortment_proposal`, строка 181

Строка 221:

```python
selected: SheetStockDbRow | None = None
```

Строка 222:

```python
result: SheetStockSelectionResult | None = None
```

Строка 223:

```python
sheet_plan: SheetCuttingPlan | None = None
```

Строка 254:

```python
thickness_allowance = required.thickness_mm - thickness_upper
```

Строка 255:

```python
cross_allowance = required.width_mm - width_upper
```

Строка 256:

```python
length_allowance = required.length_mm - length_upper
```

Строка 271:

```python
check = check_prescribed_sheet(
            thickness_mm=thickness,
            width_mm=width,
            length_mm=length,
            db_rows=availability_rows,
            required_thickness_mm=(
                thickness_upper + thickness_allowance if thickness_upper is not None else None
            ),
            required_width_mm=(width_upper + cross_allowance if width_upper is not None else None),
            required_length_mm=(
                length_upper + length_allowance if length_upper is not None else None
            ),
            quantity=passport.drawing_quantity.value,
        )
```

Строка 229:

```python
thickness_upper is None
```

Строка 229:

```python
width_upper is None
```

Строка 229:

```python
length_upper is None
```

Строка 250:

```python
required.thickness_mm is not None
```

Строка 251:

```python
required.width_mm is not None
```

Строка 252:

```python
required.length_mm is not None
```

Строка 310:

```python
upper_deviation is None
```

Строка 267:

```python
thickness_dimension is not None
```

Строка 300:

```python
thickness_dimension is None
```

Строка 301:

```python
thickness_dimension.nominal_value is None
```

Строка 302:

```python
part_width is None
```

Строка 303:

```python
part_length is None
```

Строка 277:

```python
thickness_upper is not None
```

Строка 279:

```python
width_upper is not None
```

Строка 281:

```python
length_upper is not None
```

Строка 428:

```python
thickness_dimension is not None
```

Строка 429:

```python
width_dimension is not None
```

Строка 430:

```python
length_dimension is not None
```

### mvp/src/metall_mvp/domain/calculation/customer_tube_resolution.py

[mvp/src/metall_mvp/domain/calculation/customer_tube_resolution.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/customer_tube_resolution.py)

#### `_explicit_tube_standard`, строка 72

Строка 88:

```python
len(matches) == 1
```

#### `_lower_deviation_basis`, строка 178

Строка 182:

```python
return bound - dimension.nominal_value, True
```

Строка 180:

```python
dimension.nominal_value is None
```

#### `_through_hole_dimension`, строка 185

Строка 209:

```python
return min(candidates, key=_hole_sort_key, default=None)
```

Строка 199:

```python
item.nominal_value is not None
```

#### `_update_context_rows`, строка 277

Строка 294:

```python
key[:2] == (selected.outer_diameter_mm, selected.wall_thickness_mm)
```

Строка 295:

```python
row.length_mm is None
```

Строка 295:

```python
row.length_mm == selected_length
```

#### `resolve_customer_tube_assortment_proposal`, строка 304

Строка 439:

```python
outer_total = required.outer_diameter_mm - outer_bound
```

Строка 440:

```python
inner_total = hole_bound - required.inner_diameter_mm
```

Строка 441:

```python
length_total = required.length_mm - length
```

Строка 443:

```python
rows = tuple(
        row
        for row in rows
        if row.available_length_mm is None
        or row.available_length_mm >= required_length + DEFAULT_KERF_MM
    )
```

Строка 458:

```python
selected: TubeStockDbRow | None = None
```

Строка 459:

```python
result: TubeStockSelectionResult | None = None
```

Строка 645:

```python
dimensions = (
        BlankDimensions(
            outer_diameter_mm=selected.outer_diameter_mm,
            inner_diameter_mm=(
                selected.outer_diameter_mm - Decimal("2") * selected.wall_thickness_mm
            ),
            thickness_mm=selected.wall_thickness_mm,
            length_mm=required_length,
        )
        if selected is not None
        else BlankDimensions()
    )
```

Строка 481:

```python
check = check_prescribed_tube(
            outer_diameter_mm=outer,
            wall_thickness_mm=wall,
            standard_designation=callout_standard,
            db_rows=rows,
            required_outer_mm=(
                outer_dimension.nominal_value + outer_upper + outer_total
                if outer_dimension is not None
                and outer_dimension.nominal_value is not None
                and outer_upper is not None
                else None
            ),
            required_hole_mm=(
                hole_dimension.nominal_value + hole_lower - inner_total
                if hole_dimension is not None
                and hole_dimension.nominal_value is not None
                and hole_lower is not None
                else None
            ),
            required_length_mm=required_length if size.value.get("editable_revision_id") else None,
        )
```

Строка 564:

```python
required_length is not None
```

Строка 587:

```python
inner = selected.outer_diameter_mm - Decimal("2") * selected.wall_thickness_mm
```

Строка 369:

```python
length is None
```

Строка 430:

```python
required.outer_diameter_mm is not None
```

Строка 431:

```python
required.length_mm is not None
```

Строка 433:

```python
required.inner_diameter_mm is None
```

Строка 433:

```python
required.inner_diameter_mm <= 0
```

Строка 565:

```python
required_length is not None
```

Строка 580:

```python
required_length is None
```

Строка 475:

```python
outer_dimension.nominal_value is not None
```

Строка 477:

```python
hole_dimension.nominal_value is not None
```

Строка 478:

```python
outer_upper is not None
```

Строка 479:

```python
hole_lower is not None
```

Строка 511:

```python
outer_dimension.nominal_value is None
```

Строка 513:

```python
hole_dimension.nominal_value is None
```

Строка 514:

```python
length is None
```

Строка 523:

```python
b is None
```

Строка 446:

```python
row.available_length_mm is None
```

Строка 447:

```python
row.available_length_mm >= required_length + DEFAULT_KERF_MM
```

Строка 489:

```python
outer_dimension.nominal_value is not None
```

Строка 490:

```python
outer_upper is not None
```

Строка 496:

```python
hole_dimension.nominal_value is not None
```

Строка 497:

```python
hole_lower is not None
```

### mvp/src/metall_mvp/domain/calculation/engine_parts/blank_selection.py

[mvp/src/metall_mvp/domain/calculation/engine_parts/blank_selection.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/engine_parts/blank_selection.py)

#### `drawing_stock_form_hint`, строка 136

Строка 144:

```python
len(explicit_forms) == 1
```

Строка 146:

```python
len(explicit_forms) > 1
```

Строка 151:

```python
len(legacy_forms) == 1
```

Строка 153:

```python
len(legacy_forms) > 1
```

Строка 182:

```python
len(forms) == 1
```

#### `legacy_product_stock_prescriptions`, строка 185

Строка 205:

```python
len(numbers) != 1
```

Строка 208:

```python
nominal <= 0
```

Строка 221:

```python
len(source_numbers) != 1
```

#### `select_normative_blank`, строка 294

Строка 320:

```python
selected = min(
        passing,
        key=lambda item: (
            item.blank_candidate.blank_mass_kg,
            -(item.blank_candidate.material_utilization or 0),
            item.blank_candidate.stock_item_ref,
        ),
    )
```

Строка 359:

```python
selected = min(sheet_options, key=lambda option: option[0])[1]
```

Строка 342:

```python
supply.width_mm is None
```

Строка 343:

```python
supply.length_mm is None
```

Строка 344:

```python
required.width_mm is None
```

Строка 345:

```python
required.length_mm is None
```

### mvp/src/metall_mvp/domain/calculation/engine_parts/costing.py

[mvp/src/metall_mvp/domain/calculation/engine_parts/costing.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/engine_parts/costing.py)

#### `calculate_material_cost`, строка 33

Строка 39:

```python
amount = blank.blank_mass_kg * quote.amount
```

Строка 42:

```python
amount = blank.blank_mass_kg / Decimal("1000") * quote.amount
```

Строка 45:

```python
amount = length_mm / Decimal("1000") * quote.amount
```

Строка 44:

```python
length_mm is not None
```

#### `_operation_costs`, строка 213

Строка 224:

```python
labor_hours = norm.setup_labor_hours + norm.labor_hours_per_part * quantity
```

Строка 225:

```python
machine_hours = norm.setup_machine_hours + norm.machine_hours_per_part * quantity
```

Строка 227:

```python
labor_cost = labor_hours * labor_rate.amount
```

Строка 262:

```python
total = labor_cost + machine_cost
```

Строка 260:

```python
machine_cost = machine_hours * machine_rate.amount
```

Строка 233:

```python
machine_rate is None
```

Строка 245:

```python
machine_rate.currency != labor_rate.currency
```

### mvp/src/metall_mvp/domain/calculation/engine_parts/costing_stage.py

[mvp/src/metall_mvp/domain/calculation/engine_parts/costing_stage.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/engine_parts/costing_stage.py)

#### `_cost_operations`, строка 76

Строка 90:

```python
rate_card is None
```

#### `_sum_batch_totals`, строка 113

Строка 135:

```python
material_cost is not None
```

Строка 135:

```python
rate_card is not None
```

Строка 141:

```python
len(currencies) != 1
```

Строка 155:

```python
material_total = MoneyAmount(
                amount=material_cost.amount * estimate_input.production_quantity,
                currency=currency,
            )
```

Строка 159:

```python
total_amount = material_total.amount + sum(
                (item.total_cost.amount for item in operation_costs),
                start=Decimal("0"),
            )
```

Строка 164:

```python
unit = MoneyAmount(
                amount=total_amount / estimate_input.production_quantity,
                currency=currency,
            )
```

### mvp/src/metall_mvp/domain/calculation/engine_parts/eligibility.py

[mvp/src/metall_mvp/domain/calculation/engine_parts/eligibility.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/engine_parts/eligibility.py)

#### `_has_resolved_upper_bound`, строка 35

Строка 54:

```python
dimension.upper_limit is not None
```

Строка 58:

```python
dimension.upper_deviation is not None
```

Строка 60:

```python
dimension.lower_deviation is not None
```

Строка 59:

```python
dimension.nominal_value is not None
```

Строка 50:

```python
dimension.effective_upper_limit is not None
```

Строка 63:

```python
dimension.nominal_value is not None
```

Строка 63:

```python
dimension.lower_deviation <= 0
```

#### `evaluate_calculation_eligibility`, строка 71

Строка 169:

```python
dimension.nominal_value is None
```

Строка 135:

```python
overall_length is not None
```

Строка 136:

```python
diameter is not None
```

### mvp/src/metall_mvp/domain/calculation/engine_parts/operations.py

[mvp/src/metall_mvp/domain/calculation/engine_parts/operations.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/engine_parts/operations.py)

#### `_machine_match`, строка 242

Строка 298:

```python
workpiece_inputs: dict[str, Decimal | None] = {"mass_kg": blank.blank_mass_kg}
```

Строка 305:

```python
checks: list[bool | None] = [
            None
            if limits.max_workpiece_diameter_mm is None or diameter is None
            else diameter <= limits.max_workpiece_diameter_mm,
            None
            if limits.max_workpiece_length_mm is None or length is None
            else length <= limits.max_workpiece_length_mm,
            None if limits.max_mass_kg is None else blank.blank_mass_kg <= limits.max_mass_kg,
        ]
```

Строка 308:

```python
diameter <= limits.max_workpiece_diameter_mm
```

Строка 311:

```python
length <= limits.max_workpiece_length_mm
```

Строка 312:

```python
limits.max_mass_kg is None
```

Строка 312:

```python
blank.blank_mass_kg <= limits.max_mass_kg
```

Строка 307:

```python
limits.max_workpiece_diameter_mm is None
```

Строка 307:

```python
diameter is None
```

Строка 310:

```python
limits.max_workpiece_length_mm is None
```

Строка 310:

```python
length is None
```

Строка 332:

```python
envelope_x <= limits.envelope_x_mm
```

Строка 335:

```python
envelope_y <= limits.envelope_y_mm
```

Строка 338:

```python
envelope_z <= limits.envelope_z_mm
```

Строка 339:

```python
limits.max_mass_kg is None
```

Строка 339:

```python
blank.blank_mass_kg <= limits.max_mass_kg
```

Строка 331:

```python
limits.envelope_x_mm is None
```

Строка 334:

```python
limits.envelope_y_mm is None
```

Строка 337:

```python
limits.envelope_z_mm is None
```

#### `_operation_norm`, строка 447

Строка 471:

```python
setup_hours = parameters.setup_minutes / MINUTES_PER_HOUR
```

Строка 472:

```python
per_part_hours = parameters.minutes_per_unit * operation.multiplicity / MINUTES_PER_HOUR
```

### mvp/src/metall_mvp/domain/calculation/engine_parts/part_model.py

[mvp/src/metall_mvp/domain/calculation/engine_parts/part_model.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/engine_parts/part_model.py)

#### `_rotational_envelope_dimensions`, строка 45

Строка 53:

```python
outer_diameter is None
```

#### `_prismatic_blank_type`, строка 60

Строка 72:

```python
len(forms) == 1
```

#### `build_part_model`, строка 75

Строка 304:

```python
return PartModel(
        archetype=archetype,
        material_ref=material_id,
        envelope=PartEnvelope(
            diameter_mm=(
                inferred_diameter_dimension.nominal_value
                if inferred_diameter_dimension is not None
                else max((item.diameter_mm for item in sections), default=None)
                if passport.envelope is None
                else None
            ),
            inner_diameter_mm=inner_diameter,
            length_mm=envelope_length_mm,
            width_mm=dimension_by_role.get(DimensionRole.OVERALL_WIDTH),
            height_mm=dimension_by_role.get(DimensionRole.OVERALL_HEIGHT),
            thickness_mm=thickness,
            max_diameter_mm=(
                _resolved_upper(inferred_diameter_dimension)
                if inferred_diameter_dimension is not None
                else max(
                    (item.max_diameter_mm for item in sections if item.max_diameter_mm is not None),
                    default=None,
                )
                if passport.envelope is None
                else None
            ),
            max_length_mm=envelope_max_length_mm,
            max_width_mm=(
                _resolved_upper(dimension_fact_by_role[DimensionRole.OVERALL_WIDTH])
                if DimensionRole.OVERALL_WIDTH in dimension_fact_by_role
                else None
            ),
            max_height_mm=(
                _resolved_upper(dimension_fact_by_role[DimensionRole.OVERALL_HEIGHT])
                if DimensionRole.OVERALL_HEIGHT in dimension_fact_by_role
                else None
            ),
            max_thickness_mm=(
                _resolved_upper(thickness_dimension) if thickness_dimension is not None else None
            ),
        ),
        sections=tuple(sections),
        features=tuple(
            PartFeatureRef(
                feature_id=item.id,
                kind=item.kind,
                dimension_refs=tuple(legacy_dimension_refs(item, passport.dimensions)),
            )
            for item in passport.features
        ),
        precision_requirement_refs=precision_refs,
        surface_requirement_refs=tuple(
            (item.feature_ref if item.target_description is None else None) or f"roughness:{index}"
            for index, item in enumerate(roughness_values, start=1)
        ),
        technical_requirement_refs=tuple(item.id for item in passport.technical_requirements),
        calculation_coverage=coverage,
    )
```

Строка 224:

```python
thickness_dimension is not None
```

Строка 243:

```python
overall_length_dimension is None
```

Строка 251:

```python
envelope_length_mm is None
```

Строка 132:

```python
thickness_dimension is not None
```

Строка 136:

```python
overall_length_dimension is not None
```

Строка 195:

```python
inner_diameter is not None
```

Строка 240:

```python
overall_length_dimension is not None
```

Строка 255:

```python
inferred_diameter_dimension is None
```

Строка 94:

```python
diameter is None
```

Строка 95:

```python
length is None
```

Строка 96:

```python
diameter.nominal_value is None
```

Строка 97:

```python
length.nominal_value is None
```

Строка 140:

```python
outer_diameter_dimension is not None
```

Строка 141:

```python
outer_diameter_dimension.nominal_value is not None
```

Строка 142:

```python
overall_length_dimension.nominal_value is not None
```

Строка 191:

```python
prism_width == prism_height
```

Строка 192:

```python
prism_max_width == prism_max_height
```

Строка 197:

```python
len(sections) >= 2
```

Строка 199:

```python
len(sections) == 1
```

Строка 164:

```python
item.typed_parameters.diameter is not None
```

Строка 310:

```python
inferred_diameter_dimension is not None
```

Строка 322:

```python
inferred_diameter_dimension is not None
```

Строка 342:

```python
thickness_dimension is not None
```

Строка 324:

```python
item.max_diameter_mm is not None
```

### mvp/src/metall_mvp/domain/calculation/engine_parts/pipeline.py

[mvp/src/metall_mvp/domain/calculation/engine_parts/pipeline.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/engine_parts/pipeline.py)

#### `_stock_reference_need`, строка 63

Строка 105:

```python
len(standard_refs) == 1
```

#### `_finalize_result`, строка 388

Строка 420:

```python
recommended = (
        min(pass_candidates, key=total_cost_amount).candidate_id if pass_candidates else None
    )
```

Строка 416:

```python
item.total_cost is None
```

Строка 412:

```python
item.total_cost is not None
```

#### `total_cost_amount`, строка 415

Строка 416:

```python
item.total_cost is None
```

### mvp/src/metall_mvp/domain/calculation/engine_parts/result_builder.py

[mvp/src/metall_mvp/domain/calculation/engine_parts/result_builder.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/engine_parts/result_builder.py)

#### `_build_state_and_machines`, строка 128

Строка 191:

```python
chosen = min(pass_matches, key=lambda item: item.machine_id)
```

#### `_build_estimate_candidate`, строка 280

Строка 296:

```python
strategy is None
```

Строка 387:

```python
rate_card is not None
```

### mvp/src/metall_mvp/domain/calculation/engine_parts/strategies.py

[mvp/src/metall_mvp/domain/calculation/engine_parts/strategies.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/engine_parts/strategies.py)

#### `_applicable_tolerance`, строка 40

Строка 83:

```python
len(matches) > 1
```

Строка 68:

```python
item.related_nominal_min_mm is not None
```

Строка 69:

```python
item.related_nominal_max_mm is not None
```

Строка 60:

```python
item.nominal_min_mm is not None
```

Строка 60:

```python
nominal < item.nominal_min_mm
```

Строка 61:

```python
item.nominal_max_mm is not None
```

Строка 61:

```python
nominal > item.nominal_max_mm
```

Строка 71:

```python
related >= item.related_nominal_min_mm
```

Строка 73:

```python
related > item.related_nominal_min_mm
```

Строка 76:

```python
related <= item.related_nominal_max_mm
```

Строка 78:

```python
related < item.related_nominal_max_mm
```

#### `_guaranteed_dimension`, строка 88

Строка 111:

```python
return nominal + deviation
```

Строка 96:

```python
nominal is None
```

#### `_stock_length_status`, строка 120

Строка 127:

```python
available < required_length
```

#### `_unique_section_length`, строка 132

Строка 137:

```python
return sum(by_dimension_ref.values(), start=Decimal("0"))
```

#### `_finished_rotational_volume`, строка 140

Строка 144:

```python
section.diameter_mm > current[0]
```

#### `_safe_material_utilization`, строка 152

Строка 155:

```python
return finished / blank
```

#### `_required_allowance`, строка 158

Строка 163:

```python
allowance is None
```

#### `_allowance_values`, строка 168

Строка 185:

```python
length is not None
```

Строка 175:

```python
length is not None
```

#### `_smallest_flat_supply_format`, строка 412

Строка 436:

```python
return min(fitting, key=lambda item: (item[0] * item[1], item[0], item[1]))
```

Строка 424:

```python
size.width_mm is not None
```

Строка 424:

```python
size.length_mm is not None
```

Строка 431:

```python
width >= required_width
```

Строка 431:

```python
length >= required_length
```

Строка 432:

```python
width >= required_length
```

Строка 432:

```python
length >= required_width
```

#### `build_blank_candidate`, строка 211

Строка 221:

```python
max_section_diameter = max(
            (item.max_diameter_mm or item.diameter_mm for item in part.sections),
            default=Decimal("0"),
        )
```

Строка 252:

```python
supply_length: Decimal | None = None
```

Строка 261:

```python
removed_volume = max(Decimal("0"), blank_volume - finished_volume)
```

Строка 262:

```python
blank_mass = blank_volume * MM3_TO_M3 * material.physical.density_kg_m3
```

Строка 242:

```python
required_diameter is not None
```

Строка 242:

```python
required_length is not None
```

Строка 255:

```python
stock.length_rule is not None
```

Строка 348:

```python
supply_length is not None
```

Строка 287:

```python
stock.length_rule is not None
```

Строка 292:

```python
stock.length_rule is not None
```

Строка 301:

```python
stock.length_rule is not None
```

Строка 304:

```python
stock.length_rule is not None
```

#### `build_blank_candidate`, строка 375

Строка 382:

```python
bore_volume = PI * inner**2 / 4 * length
```

Строка 383:

```python
finished = max(Decimal("0"), candidate.finished_simplified_volume_mm3 - bore_volume)
```

Строка 384:

```python
removed = max(Decimal("0"), candidate.blank_volume_mm3 - finished)
```

Строка 380:

```python
length is None
```

#### `build_blank_candidate`, строка 471

Строка 513:

```python
wall_nominal = (stock.size.outer_diameter_mm - stock.size.inner_diameter_mm) / 2
```

Строка 515:

```python
guaranteed_inner = (
            outer_max - 2 * wall_min if outer_max is not None and wall_min is not None else None
        )
```

Строка 532:

```python
blank_volume = (
            PI
            * (stock.size.outer_diameter_mm**2 - stock.size.inner_diameter_mm**2)
            / 4
            * required_length
        )
```

Строка 538:

```python
finished = PI * (outer**2 - inner**2) / 4 * part_length
```

Строка 539:

```python
removed = max(Decimal("0"), blank_volume - finished)
```

Строка 540:

```python
mass = blank_volume * MM3_TO_M3 * material.physical.density_kg_m3
```

Строка 484:

```python
part_length is None
```

Строка 505:

```python
required_length is not None
```

#### `build_blank_candidate`, строка 584

Строка 652:

```python
blank_volume = required_length * required_width * stock.size.thickness_mm
```

Строка 653:

```python
finished = nominal_length * nominal_width * nominal_thickness
```

Строка 654:

```python
mass = blank_volume * MM3_TO_M3 * material.physical.density_kg_m3
```

Строка 676:

```python
return BlankCandidate(
            candidate_id=f"blank:{stock.stock_item_id}",
            stock_item_ref=stock.stock_item_id,
            blank_type=stock.blank_type,
            requirement=requirement,
            required_dimensions=BlankDimensions(
                length_mm=required_length,
                width_mm=required_width,
                thickness_mm=stock.size.thickness_mm,
            ),
            supply_dimensions=(
                BlankDimensions(
                    length_mm=supply_length,
                    width_mm=supply_width,
                    thickness_mm=stock.size.thickness_mm,
                )
                if supply_length is not None and supply_width is not None
                else None
            ),
            allowances=_allowance_values(requirement),
            blank_volume_mm3=blank_volume,
            blank_mass_kg=mass,
            finished_simplified_volume_mm3=finished,
            removed_volume_mm3=max(Decimal("0"), blank_volume - finished),
            material_utilization=_safe_material_utilization(finished, blank_volume),
            geometry_rule_evaluations=(evaluation,),
            status=status,
        )
```

Строка 601:

```python
nominal_length is None
```

Строка 602:

```python
nominal_width is None
```

Строка 603:

```python
nominal_thickness is None
```

Строка 604:

```python
part_length is None
```

Строка 605:

```python
part_width is None
```

Строка 606:

```python
part_thickness is None
```

Строка 625:

```python
required_length is not None
```

Строка 626:

```python
required_width is not None
```

Строка 627:

```python
required_thickness is not None
```

Строка 644:

```python
supply_width is not None
```

Строка 692:

```python
supply_length is not None
```

Строка 692:

```python
supply_width is not None
```

#### `build_blank_candidate`, строка 724

Строка 801:

```python
mass = blank_volume * MM3_TO_M3 * material.physical.density_kg_m3
```

Строка 823:

```python
return BlankCandidate(
            candidate_id=f"blank:{stock.stock_item_id}",
            stock_item_ref=stock.stock_item_id,
            blank_type=stock.blank_type,
            requirement=requirement,
            required_dimensions=BlankDimensions(
                length_mm=required_length,
                width_mm=stock_width,
                height_mm=stock_height,
            ),
            allowances=_allowance_values(requirement),
            blank_volume_mm3=blank_volume,
            blank_mass_kg=mass,
            finished_simplified_volume_mm3=finished,
            removed_volume_mm3=max(Decimal("0"), blank_volume - finished),
            material_utilization=_safe_material_utilization(finished, blank_volume),
            geometry_rule_evaluations=(evaluation,),
            status=status,
        )
```

Строка 786:

```python
hex_area_factor = Decimal(3).sqrt() / 2
```

Строка 787:

```python
blank_volume = hex_area_factor * stock_width**2 * required_length
```

Строка 790:

```python
finished = hex_area_factor * part.envelope.width_mm**2 * part.envelope.length_mm
```

Строка 794:

```python
blank_volume = stock_width * stock_height * required_length
```

Строка 798:

```python
finished = part.envelope.width_mm * part.envelope.height_mm * part.envelope.length_mm
```

Строка 737:

```python
length is None
```

Строка 737:

```python
width is None
```

Строка 737:

```python
height is None
```

Строка 755:

```python
required_length is not None
```

Строка 756:

```python
required_width is not None
```

Строка 757:

```python
required_height is not None
```

Строка 788:

```python
part.envelope.width_mm is not None
```

Строка 789:

```python
part.envelope.length_mm is not None
```

Строка 795:

```python
part.envelope.width_mm is not None
```

Строка 796:

```python
part.envelope.height_mm is not None
```

Строка 797:

```python
part.envelope.length_mm is not None
```

Строка 765:

```python
width != height
```

Строка 765:

```python
required_width != required_height
```

### mvp/src/metall_mvp/domain/calculation/engine_parts/structured_blank.py

[mvp/src/metall_mvp/domain/calculation/engine_parts/structured_blank.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/engine_parts/structured_blank.py)

#### `_primary_nominal`, строка 43

Строка 57:

```python
return "width", max(size.width_mm, size.height_mm), None
```

Строка 50:

```python
size.width_mm is not None
```

#### `_stock_spec`, строка 61

Строка 73:

```python
tolerance.lower_deviation_mm is not None
```

Строка 78:

```python
tolerance.upper_deviation_mm is not None
```

#### `_supply_options_for_stock`, строка 119

Строка 139:

```python
return tuple(
            LengthSupplyOption.measured(
                length,
                label=f"{canonical_decimal(length / Decimal('1000'))} м",
            )
            for length in sorted(exact_lengths)
        )
```

Строка 135:

```python
length is None
```

#### `_primary_requirement`, строка 149

Строка 171:

```python
return (
            max(finished_values) if finished_values else None,
            max(required_values) if required_values else None,
        )
```

#### `project_structured_blank_result`, строка 208

Строка 255:

```python
prescribed_nominal is not None
```

Строка 248:

```python
prescribed_nominal is not None
```

Строка 264:

```python
prescribed_estimate = min(
                prescribed_matches,
                key=lambda item: (item.blank_candidate.blank_mass_kg, item.candidate_id),
            )
```

Строка 298:

```python
required_length is not None
```

Строка 321:

```python
supply.width_mm is not None
```

Строка 322:

```python
supply.length_mm is not None
```

Строка 323:

```python
dimensions.width_mm is not None
```

Строка 324:

```python
dimensions.length_mm is not None
```

Строка 260:

```python
_primary_nominal(stock)[1] == prescribed_nominal
```

Строка 336:

```python
other_stock.size.thickness_mm == selected_stock.size.thickness_mm
```

Строка 338:

```python
format_dims.width_mm is not None
```

Строка 339:

```python
format_dims.length_mm is not None
```

### mvp/src/metall_mvp/domain/calculation/engine_parts/technical_requirements.py

[mvp/src/metall_mvp/domain/calculation/engine_parts/technical_requirements.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/engine_parts/technical_requirements.py)

#### `assess_technical_requirement`, строка 36

Строка 170:

```python
source_matches = (
            _verified(source)
            and source.page_no is not None
            and source.source_section is not None
            and (source.normalized_bbox is not None or bool(source.annotation_refs))
            and source.raw_text == requirement.raw_text
            and source.page_no == observation.page_no
            and source.source_section == observation.source_section
            and (
                source.normalized_bbox is not None
                and source.normalized_bbox == observation.normalized_bbox
                or bool(set(source.annotation_refs) & set(observation.annotation_refs))
            )
        )
```

Строка 132:

```python
dimensions[ref].nominal_value is not None
```

### mvp/src/metall_mvp/domain/calculation/estimate_xlsx.py

[mvp/src/metall_mvp/domain/calculation/estimate_xlsx.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/estimate_xlsx.py)

#### `_autofit_columns`, строка 26

Строка 37:

```python
sheet.column_dimensions[col_letter].width = max(min_width, min(max_len + 3, max_width))
```

Строка 34:

```python
line_max = max(len(line) for line in lines)
```

#### `generate_estimate_xlsx`, строка 40

Строка 46:

```python
candidate: EstimateCandidate | None = None
```

Строка 143:

```python
row_idx += 1
```

Строка 183:

```python
all_ops = (
            list(mfg.base_operations)
            + list(mfg.feature_operations)
            + list(mfg.requirement_operations)
        )
```

Строка 219:

```python
row_idx += 1
```

### mvp/src/metall_mvp/domain/calculation/geometry_primitives.py

[mvp/src/metall_mvp/domain/calculation/geometry_primitives.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/geometry_primitives.py)

#### `cylinder_volume_mm3`, строка 13

Строка 14:

```python
return PI * Decimal(str(diameter_mm)) ** 2 / 4 * Decimal(str(length_mm))
```

#### `cone_frustum_volume_mm3`, строка 17

Строка 19:

```python
return PI * length * (a * a + a * b + b * b) / 12
```

#### `round_sections_volume_mm3`, строка 22

Строка 23:

```python
return sum((cylinder_volume_mm3(d, length) for d, length in sections), start=Decimal(0))
```

#### `mass_kg`, строка 26

Строка 27:

```python
return Decimal(str(volume_mm3)) * MM3_TO_M3 * Decimal(str(density_kg_m3))
```

### mvp/src/metall_mvp/domain/calculation/gost_8732_verified.py

[mvp/src/metall_mvp/domain/calculation/gost_8732_verified.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/gost_8732_verified.py)

#### `_matching_display_row`, строка 28

Строка 36:

```python
nominal is None
```

Строка 40:

```python
row_nominal != nominal
```

Строка 42:

```python
width is not None
```

Строка 44:

```python
length is not None
```

#### `_tube_row_guarantees`, строка 52

Строка 66:

```python
guaranteed_outer_min = diameter + lower_d
```

Строка 67:

```python
guaranteed_inner_max = diameter + upper_d - Decimal("2") * (wall + lower_wall)
```

Строка 64:

```python
lower_wall is None
```

Строка 60:

```python
diameter is None
```

#### `install_verified_8732_resolution`, строка 74

Строка 255:

```python
explanation = (
                f"Расчётная потребность трубы: наружный диаметр не менее {target_outer} мм"
                + (
                    f", внутренний диаметр не более {required_inner_max} мм"
                    if required_inner_max is not None
                    else ""
                )
                + f". Выбран стандартный типоразмер {selected_row.get('size_display')}: "
                f"D_min = {guaranteed_outer_min} мм"
                + (f" >= {target_outer} мм" if target_outer is not None else "")
                + f", минимальная стенка s_min = {selected_wall + lower_wall} мм, "
                f"d_max = {guaranteed_inner_max.quantize(Decimal('0.01'))} мм"
                + (f" <= {required_inner_max} мм" if required_inner_max is not None else "")
                + ". Комбинация D × S присутствует в таблице 1 как стандартная, без согласования."
            )
```

Строка 104:

```python
inner = diameter - Decimal("2") * wall
```

Строка 109:

```python
mass is None
```

Строка 110:

```python
mass = (Decimal("0.0246615") * wall * (diameter - wall)).quantize(Decimal("0.001"))
```

Строка 252:

```python
lower_wall is None
```

Строка 99:

```python
diameter is None
```

Строка 114:

```python
lower_d is None
```

Строка 114:

```python
upper_d is None
```

Строка 201:

```python
diameter is not None
```

Строка 206:

```python
lower_d is not None
```

Строка 206:

```python
upper_d is not None
```

#### `select_tube`, строка 83

Строка 104:

```python
inner = diameter - Decimal("2") * wall
```

Строка 109:

```python
mass is None
```

Строка 110:

```python
mass = (Decimal("0.0246615") * wall * (diameter - wall)).quantize(Decimal("0.001"))
```

Строка 99:

```python
diameter is None
```

Строка 114:

```python
lower_d is None
```

Строка 114:

```python
upper_d is None
```

#### `build_normative_stock_parameters`, строка 133

Строка 255:

```python
explanation = (
                f"Расчётная потребность трубы: наружный диаметр не менее {target_outer} мм"
                + (
                    f", внутренний диаметр не более {required_inner_max} мм"
                    if required_inner_max is not None
                    else ""
                )
                + f". Выбран стандартный типоразмер {selected_row.get('size_display')}: "
                f"D_min = {guaranteed_outer_min} мм"
                + (f" >= {target_outer} мм" if target_outer is not None else "")
                + f", минимальная стенка s_min = {selected_wall + lower_wall} мм, "
                f"d_max = {guaranteed_inner_max.quantize(Decimal('0.01'))} мм"
                + (f" <= {required_inner_max} мм" if required_inner_max is not None else "")
                + ". Комбинация D × S присутствует в таблице 1 как стандартная, без согласования."
            )
```

Строка 252:

```python
lower_wall is None
```

Строка 201:

```python
diameter is not None
```

Строка 206:

```python
lower_d is not None
```

Строка 206:

```python
upper_d is not None
```

### mvp/src/metall_mvp/domain/calculation/machine_basis.py

[mvp/src/metall_mvp/domain/calculation/machine_basis.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/machine_basis.py)

#### `_validate_excerpts`, строка 75

Строка 81:

```python
line < 1
```

Строка 81:

```python
characteristic.raw != lines[line - 1]
```

#### `get_machine_basis`, строка 85

Строка 136:

```python
path = (root / entry["file"]).resolve()
```

### mvp/src/metall_mvp/domain/calculation/machine_checks.py

[mvp/src/metall_mvp/domain/calculation/machine_checks.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/machine_checks.py)

#### `_scope`, строка 62

Строка 88:

```python
lower > upper
```

Строка 89:

```python
lower <= rpm <= upper
```

#### `_capacity`, строка 95

Строка 99:

```python
limit is None
```

Строка 104:

```python
hi is not None
```

Строка 109:

```python
lo is not None
```

Строка 113:

```python
lo is not None
```

Строка 118:

```python
hi is not None
```

Строка 105:

```python
hi < limit
```

Строка 110:

```python
lo > limit
```

Строка 114:

```python
lo > limit
```

Строка 119:

```python
hi < limit
```

Строка 106:

```python
hi == limit
```

Строка 110:

```python
lo == limit
```

Строка 115:

```python
lo == limit
```

Строка 119:

```python
hi == limit
```

#### `_range_check`, строка 132

Строка 135:

```python
lo is None
```

Строка 135:

```python
hi is None
```

Строка 143:

```python
lower is None
```

Строка 143:

```python
upper is None
```

Строка 218:

```python
len(intervals) == 1
```

Строка 153:

```python
lower < lo
```

Строка 154:

```python
hi < upper
```

Строка 201:

```python
lower <= hi
```

Строка 201:

```python
lo <= upper
```

Строка 153:

```python
lower == lo
```

Строка 154:

```python
hi == upper
```

Строка 172:

```python
lower < merged[-1][1]
```

Строка 173:

```python
lower == merged[-1][1]
```

Строка 183:

```python
upper < old_hi
```

Строка 185:

```python
upper > old_hi
```

#### `check_machine_requirements`, строка 227

Строка 309:

```python
len(facts) == 1
```

#### `contains`, строка 151

Строка 153:

```python
lower < lo
```

Строка 154:

```python
hi < upper
```

Строка 153:

```python
lower == lo
```

Строка 154:

```python
hi == upper
```

### mvp/src/metall_mvp/domain/calculation/material_basis.py

[mvp/src/metall_mvp/domain/calculation/material_basis.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/material_basis.py)

#### `select_operation_material_condition`, строка 30

Строка 74:

```python
len(mechanical) > 1
```

Строка 74:

```python
len(hardness) > 1
```

Строка 122:

```python
len(hardness_values) > 1
```

### mvp/src/metall_mvp/domain/calculation/models.py

[mvp/src/metall_mvp/domain/calculation/models.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/models.py)

#### `validate_quantity`, строка 37

Строка 38:

```python
self.production_quantity != 1
```

#### `validate_price_pair`, строка 467

Строка 468:

```python
(self.price_quote_ref is None) != (self.material_cost_per_part is None)
```

Строка 468:

```python
self.price_quote_ref is None
```

Строка 468:

```python
self.material_cost_per_part is None
```

#### `validate_cost`, строка 533

Строка 543:

```python
total.amount != per_part.amount * self.production_quantity
```

Строка 536:

```python
self.price_quote_ref is None
```

Строка 545:

```python
self.price_quote_ref is not None
```

Строка 546:

```python
self.price_quote_ref is None
```

#### `validate_basic_result`, строка 571

Строка 581:

```python
sequences != tuple(range(1, len(self.base_route) + 1))
```

Строка 587:

```python
unknown_machines = set(operation.compatible_machine_ids) - set(machine_by_id)
```

Строка 617:

```python
self.material_estimate.production_quantity != (
                self.estimate_input.production_quantity
            )
```

Строка 646:

```python
self.part_summary.finished_volume_mm3 is None
```

Строка 647:

```python
self.part_summary.finished_mass_kg is None
```

Строка 608:

```python
recommended.material_cost_per_part is None
```

Строка 627:

```python
self.material_estimate.price_quote_ref != selected.price_quote_ref
```

Строка 628:

```python
self.material_estimate.material_cost_per_part != selected.material_cost_per_part
```

### mvp/src/metall_mvp/domain/calculation/preliminary_stock.py

[mvp/src/metall_mvp/domain/calculation/preliminary_stock.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/preliminary_stock.py)

#### `_prescribed_form`, строка 84

Строка 98:

```python
len(sections) != 1
```

#### `_material_candidate_basis`, строка 150

Строка 183:

```python
_, _, _, basis, item = min(matches, key=lambda match: match[:3])
```

#### `_axis`, строка 349

Строка 376:

```python
len(matches) == 1
```

Строка 372:

```python
item.nominal_value is not None
```

#### `_outer_dimensions`, строка 379

Строка 442:

```python
item.nominal_value is not None
```

#### `_round_section_extents`, строка 465

Строка 492:

```python
factor, formula = Decimal("2") / Decimal("3").sqrt(), "D = 2 * S / sqrt(3)"
```

Строка 483:

```python
item.nominal_value is None
```

Строка 494:

```python
factor, formula = Decimal("2").sqrt(), "D = S * sqrt(2)"
```

#### `_round_determining_dimensions`, строка 499

Строка 503:

```python
nominal_max = max((item.nominal for item in extents), default=None)
```

Строка 504:

```python
item.nominal == nominal_max
```

#### `_outer_diameter`, строка 507

Строка 513:

```python
nominal_max = max(item.nominal_value for item in matches if item.nominal_value is not None)
```

Строка 519:

```python
return max(relevant, key=lambda item: _observed_value(passport, item) or _ZERO)
```

Строка 513:

```python
item.nominal_value is not None
```

Строка 514:

```python
item.nominal_value == nominal_max
```

#### `_round_upper_bounds`, строка 522

Строка 538:

```python
nominal_max = max(item.nominal for item in extents)
```

Строка 543:

```python
known_max = max(known, default=None)
```

Строка 539:

```python
item.nominal == nominal_max
```

#### `_observed_value`, строка 553

Строка 554:

```python
item.nominal_value is None
```

#### `_confirmed_upper`, строка 569

Строка 580:

```python
item.upper_limit is not None
```

Строка 581:

```python
item.upper_deviation is not None
```

Строка 600:

```python
effective.upper_limit is not None
```

Строка 582:

```python
item.lower_deviation is not None
```

Строка 582:

```python
item.lower_deviation < 0
```

Строка 586:

```python
effective.upper_limit is not None
```

Строка 587:

```python
effective.upper_deviation is not None
```

Строка 588:

```python
effective.lower_deviation is not None
```

Строка 588:

```python
effective.lower_deviation < 0
```

#### `_observed_envelope`, строка 638

Строка 668:

```python
nominal_max = max((item.nominal for item in extents), default=None)
```

Строка 674:

```python
round_extent = max(relevant, key=lambda item: item.observed(passport), default=None)
```

Строка 678:

```python
length is not None
```

Строка 709:

```python
section_axes: list[tuple[EnvelopeAxis, Dimension | None]] = [
            (axis, primary),
            ("length", length),
        ]
```

Строка 661:

```python
len(sections) == 1
```

Строка 661:

```python
sections[0].form == prescribed_form
```

Строка 732:

```python
inner_value = primary.nominal_value - 2 * wall.nominal_value
```

Строка 728:

```python
primary.nominal_value is not None
```

Строка 730:

```python
wall.nominal_value is not None
```

Строка 759:

```python
diameter is not None
```

Строка 762:

```python
length is not None
```

Строка 784:

```python
diameter = max(
                (
                    item
                    for item in _outer_dimensions(passport, include_reference=include_reference)
                    if item.role
                    in {
                        DimensionRole.OVERALL_LENGTH,
                        DimensionRole.OVERALL_WIDTH,
                        DimensionRole.OVERALL_HEIGHT,
                    }
                    and item.id not in internal_refs
                ),
                key=lambda item: _observed_value(passport, item) or _ZERO,
                default=None,
            )
```

Строка 825:

```python
thickness is not None
```

Строка 799:

```python
diameter is not None
```

Строка 819:

```python
thickness is not None
```

Строка 672:

```python
item.nominal == nominal_max
```

Строка 695:

```python
item.nominal_value is not None
```

Строка 839:

```python
height is None
```

Строка 839:

```python
height.kind == DimensionKind.DIAMETER
```

Строка 737:

```python
inner_value > 0
```

Строка 801:

```python
length is None
```

Строка 808:

```python
width is None
```

Строка 848:

```python
item is not height
```

Строка 803:

```python
(_observed_value(passport, length) or _ZERO)
                    < (_observed_value(passport, diameter) or _ZERO)
```

Строка 810:

```python
(_observed_value(passport, width) or _ZERO)
                    < (_observed_value(passport, diameter) or _ZERO)
```

#### `_stock_envelope`, строка 872

Строка 898:

```python
return (
        BlankDimensions(
            length_mm=_observed_value(passport, length),
            width_mm=_observed_value(passport, width),
            thickness_mm=envelope.thickness_mm,
        ),
        stock_refs,
        tuple(ref for ref in stock_refs if ref in unresolved)
        + tuple(
            item.id for item in (length, width) if item and not _confirmed_upper(passport, item)
        ),
        tuple(axes),
    )
```

#### `_section`, строка 946

Строка 955:

```python
return (
            size.outer_diameter_mm,
            "outer_diameter",
            {"wall_thickness": (size.outer_diameter_mm - size.inner_diameter_mm) / 2},
        )
```

Строка 964:

```python
size.width_mm is not None
```

#### `_has_section_basis`, строка 971

Строка 973:

```python
envelope.diameter_mm is not None
```

Строка 975:

```python
envelope.thickness_mm is not None
```

#### `_guaranteed_if_proven`, строка 981

Строка 993:

```python
return nominal + deviation if deviation is not None else None
```

#### `_tube_inner_maximum`, строка 996

Строка 1000:

```python
wall = (size.outer_diameter_mm - size.inner_diameter_mm) / 2
```

Строка 1024:

```python
return outer_max - 2 * wall_min if outer_max is not None and wall_min is not None else None
```

#### `_candidate`, строка 1027

Строка 1043:

```python
prescribed_secondary_mm is not None
```

Строка 1044:

```python
secondary = (
            (size.outer_diameter_mm - size.inner_diameter_mm) / 2
            if isinstance(size, TubeSize)
            else size.height_mm
            if isinstance(size, RectangularBarSize)
            else size.width_mm
            if isinstance(size, (SheetSize, PlateSize))
            else None
        )
```

Строка 1040:

```python
prescribed_nominal_mm is not None
```

Строка 1040:

```python
nominal != prescribed_nominal_mm
```

Строка 1053:

```python
secondary != prescribed_secondary_mm
```

Строка 1055:

```python
prescribed_tertiary_mm is not None
```

Строка 1076:

```python
prescribed_nominal_mm is None
```

Строка 1079:

```python
(minimum if minimum is not None else nominal) < required
```

Строка 1088:

```python
available_length is not None
```

Строка 1088:

```python
envelope.length_mm is not None
```

Строка 1089:

```python
available_length < envelope.length_mm
```

Строка 1101:

```python
envelope.inner_diameter_mm is None
```

Строка 1056:

```python
size.length_mm != prescribed_tertiary_mm
```

Строка 1066:

```python
required = min(envelope.width_mm, envelope.height_mm)
```

Строка 1068:

```python
required = max(
            (
                value
                for value in (envelope.diameter_mm, envelope.width_mm, envelope.height_mm)
                if value
            ),
            default=None,
        )
```

Строка 1093:

```python
stock.length_rule is not None
```

Строка 1094:

```python
envelope.length_mm is not None
```

Строка 1095:

```python
stock.length_rule.max_length_mm < envelope.length_mm
```

Строка 1107:

```python
raw_inner_max > envelope.inner_diameter_mm
```

Строка 1116:

```python
sheet_width is not None
```

Строка 1116:

```python
sheet_length is not None
```

Строка 1064:

```python
envelope.width_mm is not None
```

Строка 1064:

```python
envelope.height_mm is not None
```

Строка 1117:

```python
envelope.width_mm is not None
```

Строка 1117:

```python
envelope.length_mm is not None
```

Строка 1142:

```python
height_min is None
```

Строка 1146:

```python
envelope.diameter_mm is not None
```

Строка 1120:

```python
guaranteed_width is None
```

Строка 1120:

```python
guaranteed_length is None
```

Строка 1145:

```python
height_min is not None
```

Строка 1147:

```python
fit_width < envelope.diameter_mm
```

Строка 1149:

```python
fit_height < envelope.diameter_mm
```

Строка 1152:

```python
envelope.width_mm is not None
```

Строка 1153:

```python
envelope.height_mm is not None
```

Строка 1124:

```python
fit_width >= envelope.width_mm
```

Строка 1124:

```python
fit_length >= envelope.length_mm
```

Строка 1125:

```python
fit_width >= envelope.length_mm
```

Строка 1125:

```python
fit_length >= envelope.width_mm
```

Строка 1155:

```python
fit_width >= envelope.width_mm
```

Строка 1155:

```python
fit_height >= envelope.height_mm
```

Строка 1156:

```python
fit_width >= envelope.height_mm
```

Строка 1156:

```python
fit_height >= envelope.width_mm
```

#### `_geometric_choice`, строка 1183

Строка 1201:

```python
required = (
        envelope.diameter_mm
        if prescribed_form == BlankType.ROUND_BAR
        else max(
            (value for value in (envelope.width_mm, envelope.height_mm) if value is not None),
            default=None,
        )
    )
```

Строка 1229:

```python
return min(
        proven,
        key=lambda item: (
            item.nominal_dimensions.diameter_mm
            if prescribed_form == BlankType.ROUND_BAR
            else item.nominal_dimensions.width_mm,
            item.match_basis != "resolved_material",
            item.nominal_dimensions.length_mm or Decimal("Infinity"),
            item.standard_designation or "",
            item.stock_item_id,
            item.source,
            item.version,
        ),
    )
```

Строка 1215:

```python
candidate.guaranteed_section_mm is not None
```

Строка 1216:

```python
candidate.guaranteed_section_mm >= required
```

#### `_prescribed_section_conflict`, строка 1253

Строка 1268:

```python
observed = (
        envelope.diameter_mm
        if prescribed_form == BlankType.ROUND_BAR
        else max(
            (value for value in (envelope.width_mm, envelope.height_mm) if value is not None),
            default=None,
        )
    )
```

Строка 1265:

```python
prescribed_nominal_mm is None
```

Строка 1276:

```python
prescribed_nominal_mm >= observed
```

#### `_screen_preliminary_stock`, строка 1296

Строка 1508:

```python
search_standard_keys = (
        standard_keys if standard_keys & available_keys or not requested_unavailable else set()
    )
```

Строка 1581:

```python
provisional_candidates = tuple(
            sorted(
                provisional.values(),
                key=lambda item: (
                    "reference_nominal_conflict" in item.unverified,
                    (item.nominal_dimensions.width_mm or Decimal("Infinity"))
                    * (item.nominal_dimensions.length_mm or Decimal("Infinity"))
                    if item.blank_type in {BlankType.SHEET, BlankType.PLATE}
                    else Decimal("Infinity"),
                    (
                        item.nominal_dimensions.diameter_mm
                        or item.nominal_dimensions.outer_diameter_mm
                        or item.nominal_dimensions.width_mm
                        or Decimal("Infinity")
                    )
                    if item.blank_type not in {BlankType.SHEET, BlankType.PLATE}
                    else _ZERO,
                    -(item.nominal_dimensions.inner_diameter_mm or _ZERO),
                    item.nominal_dimensions.length_mm or Decimal("Infinity"),
                    item.standard_designation or "",
                    item.stock_item_id,
                ),
            )
        )
```

Строка 1739:

```python
prescribed_nominal_mm is None
```

Строка 1501:

```python
len(specified) == 1
```

Строка 1783:

```python
prescribed_nominal_mm is not None
```

Строка 1378:

```python
prescribed_nominal_mm is None
```

Строка 1766:

```python
prescribed_nominal_mm is None
```

Строка 1358:

```python
len({item.form for item in form_only}) == 1
```

Строка 1359:

```python
len({item.standard_ref for item in form_only if item.standard_ref}) <= 1
```

Строка 1716:

```python
(
            candidate := _screen_candidate(
                stock,
                screening_envelope,
                stock_envelope,
                prescribed_nominal_mm=prescribed_nominal_mm,
                prescribed_secondary_mm=prescribed_secondary_mm,
                prescribed_tertiary_mm=prescribed_tertiary_mm,
            )
        )
        is not None
```

Строка 1797:

```python
prescribed_nominal_mm is None
```

Строка 1804:

```python
prescribed_nominal_mm is not None
```

Строка 1327:

```python
item.nominal_section_mm is not None
```

Строка 1335:

```python
item.nominal_section_mm is None
```

Строка 1336:

```python
item.secondary_section_mm is None
```

Строка 1337:

```python
item.tertiary_section_mm is None
```

Строка 1367:

```python
len(sizes) != 1
```

Строка 1368:

```python
len(standards_in_prescriptions) > 1
```

Строка 1685:

```python
(
                    candidate := _screen_candidate(
                        stock,
                        screening_envelope,
                        stock_envelope,
                        prescribed_nominal_mm=prescribed_nominal_mm,
                        prescribed_secondary_mm=prescribed_secondary_mm,
                        prescribed_tertiary_mm=prescribed_tertiary_mm,
                    )
                )
                is not None
```

Строка 1775:

```python
_section_nominal(item) == _section_nominal(geometric_choice)
```

Строка 1816:

```python
prescribed_nominal_mm is not None
```

Строка 1844:

```python
prescribed_nominal_mm is not None
```

Строка 1850:

```python
prescribed_nominal_mm is not None
```

#### `select_preliminary_stock`, строка 1885

Строка 1924:

```python
envelope.length_mm is None
```

Строка 1924:

```python
envelope.width_mm is None
```

#### `nominal`, строка 455

Строка 457:

```python
return self.dimension.nominal_value * self.factor
```

Строка 456:

```python
self.dimension.nominal_value is not None
```

#### `observed`, строка 459

Строка 462:

```python
return value * self.factor
```

#### `usable`, строка 690

Строка 695:

```python
item.nominal_value is not None
```

### mvp/src/metall_mvp/domain/calculation/process_surfaces.py

[mvp/src/metall_mvp/domain/calculation/process_surfaces.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/process_surfaces.py)

#### `reference_surfaces`, строка 12

Строка 16:

```python
resolved: dict[str, bool | None] = {
        s.surface_id: counts[s.surface_id] == 1 for s in plan.surfaces
    }
```

Строка 17:

```python
counts[s.surface_id] == 1
```

Строка 35:

```python
ok: bool | None = bool(
                work
                and work_counts[surface.work_id] == 1
                and surface.feature_refs
                and all(
                    any(ref == scope or ref.startswith(scope + "/") for scope in work.source_refs)
                    for ref in surface.feature_refs
                )
            )
```

Строка 74:

```python
counts[surface.surface_id] != 1
```

Строка 48:

```python
calculate_state(before).volume_mm3 is not None
```

Строка 64:

```python
extreme = (
                        min(Decimal(v) for v in bounds if v is not None)
                        if surface.input_kind == "left"
                        else max(Decimal(v) for v in bounds if v is not None)
                    )
```

Строка 37:

```python
work_counts[surface.work_id] == 1
```

Строка 55:

```python
segment.inner_diameter_mm is not None
```

Строка 56:

```python
Decimal(segment.inner_diameter_mm) > 0
```

Строка 25:

```python
n == 1
```

#### `setup_surface_check`, строка 88

Строка 93:

```python
input_work = sorted(set(setup.accessible_surface_ids) & inputs)
```

### mvp/src/metall_mvp/domain/calculation/rough_sheet_stock.py

[mvp/src/metall_mvp/domain/calculation/rough_sheet_stock.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/rough_sheet_stock.py)

#### `_requirements`, строка 23

Строка 51:

```python
axes = {
        "length_mm": tuple(item for item in dimensions if item.role == length_role) + circular,
        "width_mm": tuple(item for item in dimensions if item.role == width_role) + circular,
        "thickness_mm": tuple(item for item in dimensions if item.is_envelope_thickness),
    }
```

Строка 56:

```python
values = {
        axis: max(
            (item.nominal_value for item in items if item.nominal_value is not None), default=None
        )
        for axis, items in axes.items()
    }
```

Строка 29:

```python
item.nominal_value is not None
```

Строка 58:

```python
item.nominal_value is not None
```

Строка 52:

```python
item.role == length_role
```

Строка 53:

```python
item.role == width_role
```

#### `_option`, строка 83

Строка 100:

```python
available = BlankDimensions(
        thickness_mm=size.thickness_mm + (deviations["thickness"] or Decimal(0)),
        width_mm=size.width_mm + (deviations["width"] or Decimal(0)),
        length_mm=size.length_mm + (deviations["length"] or Decimal(0)),
    )
```

Строка 89:

```python
required.thickness_mm is not None
```

Строка 90:

```python
required.width_mm is not None
```

Строка 91:

```python
required.length_mm is not None
```

Строка 105:

```python
available.thickness_mm is not None
```

Строка 106:

```python
available.width_mm is not None
```

Строка 107:

```python
available.length_mm is not None
```

Строка 108:

```python
available.thickness_mm < required.thickness_mm
```

Строка 87:

```python
size.width_mm is None
```

Строка 87:

```python
size.length_mm is None
```

Строка 110:

```python
available.width_mm >= required.width_mm
```

Строка 110:

```python
available.length_mm >= required.length_mm
```

Строка 112:

```python
available.width_mm >= required.length_mm
```

Строка 112:

```python
available.length_mm >= required.width_mm
```

#### `select_rough_sheet_stock`, строка 133

Строка 229:

```python
required.thickness_mm is not None
```

Строка 250:

```python
conflict += f" Предварительно рассчитана толщина {rough.selected.candidate.nominal_dimensions.thickness_mm} мм."
```

Строка 233:

```python
(
                row.guaranteed_section_mm
                if row.guaranteed_section_mm is not None
                else row.nominal_dimensions.thickness_mm or Decimal(0)
            )
            < required.thickness_mm
```

Строка 256:

```python
option.candidate.nominal_dimensions.thickness_mm
        == chosen.nominal_dimensions.thickness_mm
```

Строка 235:

```python
row.guaranteed_section_mm is not None
```

### mvp/src/metall_mvp/domain/calculation/round_geometry.py

[mvp/src/metall_mvp/domain/calculation/round_geometry.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/round_geometry.py)

#### `canonical_geometry`, строка 31

Строка 36:

```python
mapping.offset_mm is None
```

Строка 44:

```python
return (
                None
                if value is None
                else _text(mapping.direction * D(value) + D(mapping.offset_mm))
            )
```

Строка 56:

```python
mapping.direction == -1
```

Строка 53:

```python
mapping.direction == -1
```

#### `length_to_mm`, строка 67

Строка 79:

```python
return format(D(number) * factors[unit], "f")
```

#### `_state`, строка 112

Строка 174:

```python
return RoundStateResult(
        status="conflict" if conflict else "sufficient" if not issues else "partial",
        volume_mm3=_text(volume) if geometry_known and not conflict else None,
        mass_kg=_text(mass) if not conflict else None,
        known_volume_mm3=_text(volume) if not conflict else "0",
        diameter_mm=_text(max(v[2] for v in valid)) if geometry_known and not conflict else None,
        length_mm=_text(max(v[1] for v in valid) - min(v[0] for v in valid))
        if geometry_known and not conflict
        else None,
        diagnostics=tuple(issues),
    )
```

Строка 167:

```python
density is None
```

Строка 167:

```python
density.value is None
```

Строка 169:

```python
D(density.value) <= 0
```

Строка 157:

```python
volume += PI * (outer**2 - inner**2) / 4 * (end - start)
```

Строка 159:

```python
right[0] < left[1]
```

Строка 173:

```python
mass = volume * D("1e-9") * D(density.value)
```

Строка 138:

```python
outer <= 0
```

Строка 139:

```python
inner < 0
```

#### `intervals`, строка 193

Строка 208:

```python
outer <= 0
```

Строка 208:

```python
inner < 0
```

Строка 213:

```python
result[-1][1] != section[0]
```

Строка 215:

```python
result[-1][2:] == section[2:]
```

#### `same_shape`, строка 224

Строка 229:

```python
density is None
```

Строка 245:

```python
density_key(left) == density_key(right)
```

Строка 231:

```python
density.value is None
```

#### `turning_geometry`, строка 252

Строка 300:

```python
return dict(
        outer_diameter_mm=old[0], inner_diameter_mm=old[1], axial_depth_mm=(b - a) - (d - c)
    )
```

Строка 286:

```python
return dict(
            initial_diameter_mm=old[0],
            radial_depth_mm=(old[0] - new[0]) / 2,
            cut_length_mm=changes[-1][1] - changes[0][0],
        )
```

Строка 275:

```python
(initial[0][0], initial[-1][1]) != (final[0][0], final[-1][1])
```

Строка 272:

```python
a[1] != b[0]
```

Строка 281:

```python
old[1] != new[1]
```

Строка 282:

```python
new[0] >= old[0]
```

Строка 295:

```python
a == c
```

Строка 295:

```python
c < d < b
```

Строка 295:

```python
b == d
```

Строка 295:

```python
a < c < d
```

Строка 297:

```python
x != old
```

Строка 297:

```python
y is not None
```

Строка 263:

```python
s[0] <= start
```

Строка 263:

```python
end <= s[1]
```

Строка 283:

```python
a != old
```

Строка 283:

```python
b != new
```

#### `_contains`, строка 305

Строка 313:

```python
boundaries = sorted(
            {start, end}
            | {point for a, b, _, _ in inputs for point in (a, b) if start < point < end}
        )
```

Строка 319:

```python
outer > covering[0][2]
```

Строка 319:

```python
inner < covering[0][3]
```

Строка 318:

```python
v[0] <= left
```

Строка 318:

```python
v[1] >= right
```

#### `_cut`, строка 324

Строка 331:

```python
flows: dict[str, str | None] = {
        k: None for k in ("supply", "pieces", "kerf", "end_loss", "additional_loss", "remainder")
    }
```

Строка 350:

```python
area = PI * (supply[2] ** 2 - supply[3] ** 2) / 4
```

Строка 351:

```python
bar_length, piece_length = supply[1] - supply[0], piece[1] - piece[0]
```

Строка 352:

```python
flows["supply"] = _text(area * bar_length)
```

Строка 353:

```python
flows["pieces"] = _text(area * piece_length * quantity) if quantity is not None else None
```

Строка 371:

```python
consumed = (
        quantity * piece_length + plan.cut_count * D(plan.kerf_mm) + D(scalars[1]) + D(scalars[2])
    )
```

Строка 388:

```python
intervals = [(D(p), D(p) + piece_length) for p in plan.piece_origins_mm]
```

Строка 389:

```python
intervals += [
        (D(p), D(p) + D(plan.kerf_mm)) for p in plan.kerf_origins_mm if D(plan.kerf_mm) > 0
    ]
```

Строка 407:

```python
remainder = bar_length - consumed
```

Строка 417:

```python
result["piece_datum_translations_mm"] = tuple(
        _text(D(origin) - piece[0]) for origin in plan.piece_origins_mm
    )
```

Строка 420:

```python
flows["remainder"] = _text(area * remainder)
```

Строка 348:

```python
supply[2:] != piece[2:]
```

Строка 358:

```python
flows["kerf"] = _text(area * plan.cut_count * D(plan.kerf_mm))
```

Строка 374:

```python
consumed > bar_length
```

Строка 400:

```python
intervals += [(D(a), D(b)) for a, b in losses]
```

Строка 414:

```python
cursor < supply[1]
```

Строка 339:

```python
len(before.segments) != 1
```

Строка 340:

```python
len(after.segments) != 1
```

Строка 341:

```python
plan.supply_bar_count != 1
```

Строка 353:

```python
quantity is not None
```

Строка 357:

```python
plan.kerf_mm is not None
```

Строка 364:

```python
flows[key] = _text(area * D(value))
```

Строка 365:

```python
quantity is None
```

Строка 370:

```python
plan.kerf_mm is not None
```

Строка 370:

```python
scalars[1] is not None
```

Строка 370:

```python
scalars[2] is not None
```

Строка 384:

```python
plan.piece_origins_mm is not None
```

Строка 384:

```python
plan.kerf_origins_mm is not None
```

Строка 385:

```python
plan.end_loss_intervals_mm is not None
```

Строка 385:

```python
plan.additional_loss_intervals_mm is not None
```

Строка 386:

```python
len(plan.piece_origins_mm) != quantity
```

Строка 386:

```python
len(plan.kerf_origins_mm) != plan.cut_count
```

Строка 390:

```python
D(plan.kerf_mm) > 0
```

Строка 396:

```python
sum((D(b) - D(a) for a, b in losses), ZERO) != D(
            total
        )
```

Строка 355:

```python
D(v) < 0
```

Строка 403:

```python
b[0] < a[1]
```

Строка 396:

```python
D(b) <= D(a)
```

Строка 402:

```python
a < supply[0]
```

Строка 402:

```python
b > supply[1]
```

#### `calculate_transition`, строка 425

Строка 540:

```python
issues += [f"Вход: {v}" for v in a.diagnostics] if a else []
```

Строка 541:

```python
issues += [f"Выход: {v}" for v in b.diagnostics] if b else []
```

Строка 468:

```python
a.volume_mm3 is None
```

Строка 468:

```python
b.volume_mm3 is None
```

Строка 491:

```python
before.density != after.density
```

Строка 529:

```python
factor = D(density.value) * D("1e-9")
```

Строка 530:

```python
result["flow_masses_kg"] = {
                    k: _text(D(v) * factor) if v is not None else None
                    for k, v in result.get("flows_mm3", {}).items()
                }
```

Строка 521:

```python
density.value is not None
```

Строка 523:

```python
after.density.value is not None
```

Строка 524:

```python
density.material_grade == after.density.material_grade
```

Строка 525:

```python
D(density.value) == D(after.density.value)
```

Строка 535:

```python
result["removed_mass_kg"] = _text(D(result["removed_volume_mm3"]) * factor)
```

Строка 486:

```python
result["removed_volume_mm3"] = _text(D(a.volume_mm3) - D(b.volume_mm3))
```

Строка 528:

```python
density is not None
```

Строка 528:

```python
density.value is not None
```

#### `density_key`, строка 225

Строка 229:

```python
density is None
```

Строка 231:

```python
density.value is None
```

#### `section`, строка 262

Строка 263:

```python
s[0] <= start
```

Строка 263:

```python
end <= s[1]
```

#### `point`, строка 43

Строка 44:

```python
return (
                None
                if value is None
                else _text(mapping.direction * D(value) + D(mapping.offset_mm))
            )
```

### mvp/src/metall_mvp/domain/calculation/round_process.py

[mvp/src/metall_mvp/domain/calculation/round_process.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/round_process.py)

#### `_assess`, строка 62

Строка 245:

```python
remaining = None if b is None or target is None else sign * (b - target) / divisor
```

Строка 246:

```python
initial = None if a is None or target is None else sign * (a - target) / divisor
```

Строка 547:

```python
actual = (
                None
                if not valid_binding or any(v is None for v in values)
                else values[0]
                if len(values) == 1
                else values[1] - values[0]
                if values[0] is not None and values[1] is not None
                else None
            )
```

Строка 625:

```python
return (
                {node["origin"]} | set().union(*(origins(v) for v in node.values()))
                if isinstance(node.get("origin"), str)
                else set().union(*(origins(v) for v in node.values()))
            )
```

Строка 162:

```python
len(before.segments) != 1
```

Строка 162:

```python
len(after.segments) != 1
```

Строка 521:

```python
len({d.requirement_id for d in plan.dimensions}) == len(plan.dimensions)
```

Строка 123:

```python
number == 0
```

Строка 218:

```python
s.target_mm is not None
```

Строка 242:

```python
surface.target_mm is not None
```

Строка 486:

```python
len(faces) == 2
```

Строка 118:

```python
D(maximum) > 0
```

Строка 230:

```python
0 <= inner < outer
```

Строка 245:

```python
b is None
```

Строка 246:

```python
a is None
```

Строка 257:

```python
b is not None
```

Строка 271:

```python
surface.minimum_remaining_mm is not None
```

Строка 344:

```python
D(machine.hardness_minimum) >= 0
```

Строка 489:

```python
len(setups) >= 2
```

Строка 551:

```python
len(values) == 1
```

Строка 570:

```python
0 < D(tolerance) <= D(hi) - D(lo)
```

Строка 587:

```python
0 < D(ra) <= D(surface.maximum_ra_um)
```

Строка 601:

```python
0 <= D(target.minimum) <= D(current.hardness_value) <= D(target.maximum)
```

Строка 264:

```python
a == b
```

Строка 412:

```python
None in (z0, z1, start, end, machine.minimum_grip_mm)
```

Строка 560:

```python
lo is None
```

Строка 560:

```python
hi is None
```

Строка 561:

```python
D(lo) > 0
```

Строка 561:

```python
D(lo) <= actual <= D(hi)
```

Строка 569:

```python
lo is None
```

Строка 569:

```python
hi is None
```

Строка 264:

```python
a is None
```

Строка 264:

```python
b is None
```

Строка 278:

```python
minimum >= 0
```

Строка 417:

```python
D(z1 or "0") - D(z0 or "0") >= D(machine.minimum_grip_mm or "0")
```

Строка 481:

```python
max(g[0] for g in accesses) >= min(g[1] for g in accesses)
```

Строка 553:

```python
values[0] is not None
```

Строка 553:

```python
values[1] is not None
```

Строка 252:

```python
a is None
```

Строка 252:

```python
b is None
```

Строка 444:

```python
len(setups) > 1
```

#### `limit`, строка 113

Строка 118:

```python
D(maximum) > 0
```

#### `text`, строка 122

Строка 123:

```python
number == 0
```

#### `origins`, строка 623

Строка 625:

```python
return (
                {node["origin"]} | set().union(*(origins(v) for v in node.values()))
                if isinstance(node.get("origin"), str)
                else set().union(*(origins(v) for v in node.values()))
            )
```

### mvp/src/metall_mvp/domain/calculation/round_stock_curvature.py

[mvp/src/metall_mvp/domain/calculation/round_stock_curvature.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/round_stock_curvature.py)

#### `assess_round_stock_curvature`, строка 64

Строка 134:

```python
surplus = (
        (stock_min_diameter_mm - required_diameter_mm) / Decimal("2")
        if stock_min_diameter_mm is not None
        and required_diameter_mm is not None
        and allowances_confirmed
        else None
    )
```

Строка 158:

```python
residual = surplus - bound
```

Строка 79:

```python
stock_min_diameter_mm is None
```

Строка 83:

```python
assessment_length_mm is None
```

Строка 160:

```python
residual >= 0
```

Строка 81:

```python
required_diameter_mm is None
```

Строка 93:

```python
setup.basis_length_mm != assessment_length_mm
```

Строка 94:

```python
assessment_length_mm is None
```

Строка 101:

```python
setup.max_axis_deviation_mm is None
```

Строка 106:

```python
setup.max_axis_deviation_mm is not None
```

Строка 136:

```python
stock_min_diameter_mm is not None
```

Строка 137:

```python
required_diameter_mm is not None
```

Строка 110:

```python
norm.minimum_basis_length_mm is None
```

Строка 110:

```python
norm.end_exclusion_mm is None
```

Строка 129:

```python
setup.basis_length_mm is not None
```

Строка 130:

```python
bound = setup.basis_length_mm * norm.value / Decimal("100")
```

Строка 116:

```python
setup.basis_length_mm is None
```

Строка 117:

```python
setup.basis_length_mm < norm.minimum_basis_length_mm
```

Строка 123:

```python
setup.source_end_distance_mm is None
```

Строка 124:

```python
setup.source_end_distance_mm < norm.end_exclusion_mm
```

Строка 175:

```python
surplus < 0
```

Строка 191:

```python
surplus < 0
```

### mvp/src/metall_mvp/domain/calculation/round_stock_planning.py

[mvp/src/metall_mvp/domain/calculation/round_stock_planning.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/round_stock_planning.py)

#### `_planning_option`, строка 66

Строка 96:

```python
deduction = (
        cut_length * norm.value / Decimal("100")
        if cut_length is not None and norm is not None
        else None
    )
```

Строка 101:

```python
required = diameter + deduction if diameter is not None and deduction is not None else None
```

Строка 102:

```python
residual = (
        (minimum - required) / Decimal("2")
        if minimum is not None and required is not None
        else None
    )
```

Строка 111:

```python
stock_length is not None
```

Строка 112:

```python
cut_length is not None
```

Строка 113:

```python
stock_length >= cut_length
```

Строка 88:

```python
diameter is None
```

Строка 89:

```python
cut_length is None
```

Строка 91:

```python
stock_length is None
```

Строка 98:

```python
cut_length is not None
```

Строка 101:

```python
diameter is not None
```

Строка 116:

```python
diameter is not None
```

Строка 116:

```python
minimum <= diameter
```

Строка 117:

```python
stock_length is not None
```

Строка 117:

```python
cut_length is not None
```

Строка 117:

```python
stock_length < cut_length
```

#### `_bent_option`, строка 141

Строка 179:

```python
return RoundStockPlanningOption(
        candidate=candidate,
        status="INSUFFICIENT" if known_insufficient else "UNVERIFIED" if missing else "FITS",
        required_diameter_mm=bent.nominal_mm,
        part_length_mm=part_length,
        cut_blank_length_mm=cut_length,
        cut_blank_length_basis=cut_basis,
        curvature_basis_length_mm=None,
        curvature_percent=candidate.curvature_limit.value if candidate.curvature_limit else None,
        curvature_diameter_deduction_mm=None,
        required_stock_min_diameter_mm=lower,
        remaining_radial_surplus_mm=(minimum - lower) / Decimal("2")
        if lower is not None and minimum is not None
        else None,
        missing_data=tuple(missing),
    )
```

Строка 174:

```python
nominal is None
```

Строка 175:

```python
nominal != bent.nominal_mm
```

Строка 176:

```python
lower is not None
```

Строка 176:

```python
minimum < lower
```

Строка 177:

```python
stock_length is not None
```

Строка 177:

```python
cut_length is not None
```

Строка 177:

```python
stock_length < cut_length
```

Строка 162:

```python
cut_length is None
```

Строка 163:

```python
stock_length is None
```

Строка 191:

```python
lower is not None
```

Строка 164:

```python
lower is not None
```

#### `_bent_reason`, строка 207

Строка 227:

```python
return (
            f"Прокат номинала сечения {section} не обеспечивает его допуск без обработки: "
            f"гарантированный минимум {max(minima)} мм меньше нижнего предела {bent.own_lower_limit_mm} мм. "
            "Нужен прокат повышенной точности или решение технолога."
        )
```

Строка 225:

```python
bent.own_lower_limit_mm is not None
```

Строка 225:

```python
max(minima) < bent.own_lower_limit_mm
```

Строка 222:

```python
item.candidate.nominal_dimensions.diameter_mm == bent.nominal_mm
```

Строка 223:

```python
item.candidate.guaranteed_section_mm is not None
```

#### `_prescribed_option`, строка 241

Строка 256:

```python
len({row.nominal_dimensions.diameter_mm for row in rows}) != 1
```

#### `select_round_stock_planning`, строка 272

Строка 337:

```python
diameter is None
```

Строка 344:

```python
diameter is not None
```

Строка 348:

```python
bent_section.own_lower_limit_mm is None
```

Строка 294:

```python
result.prescribed_nominal_mm is not None
```

Строка 343:

```python
diameter is not None
```

Строка 352:

```python
part_length is None
```

Строка 352:

```python
length_refs == axial.source_fact_refs
```

Строка 356:

```python
axial.upper_length_mm is not None
```

Строка 359:

```python
axial.upper_length_mm is not None
```

Строка 364:

```python
axial.upper_length_mm is None
```

Строка 381:

```python
part_length is None
```

Строка 384:

```python
part_length is not None
```

Строка 523:

```python
diameter is None
```

Строка 524:

```python
cut_length is None
```

### mvp/src/metall_mvp/domain/calculation/round_workholding.py

[mvp/src/metall_mvp/domain/calculation/round_workholding.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/round_workholding.py)

#### `_known`, строка 27

Строка 28:

```python
calculate_state(state).volume_mm3 is None
```

#### `grip_interval`, строка 48

Строка 69:

```python
start, end = (mapping.direction * D(v) + D(mapping.offset_mm) for v in (start, end))
```

Строка 67:

```python
mapping.offset_mm is None
```

Строка 70:

```python
mapping.direction == -1
```

#### `_band`, строка 74

Строка 75:

```python
return tuple(
        (max(a, start), min(b, end), outer, inner)
        for a, b, outer, inner in intervals(state)
        if a < end and start < b
    )
```

Строка 78:

```python
a < end
```

Строка 78:

```python
start < b
```

#### `_assess`, строка 91

Строка 99:

```python
prefix: bool | None = True
```

Строка 206:

```python
length = (
                None
                if z0 is None or z1 is None or minimum is None
                else D(minimum) > 0 and D(z1) - D(z0) >= D(minimum)
            )
```

Строка 133:

```python
transition.removed_volume_mm3 is not None
```

Строка 209:

```python
D(minimum) > 0
```

Строка 209:

```python
D(z1) - D(z0) >= D(minimum)
```

Строка 194:

```python
segment.z0_mm is not None
```

Строка 195:

```python
segment.z1_mm is not None
```

Строка 196:

```python
D(segment.z0_mm) <= start < end <= D(segment.z1_mm)
```

### mvp/src/metall_mvp/domain/calculation/sheet_cutting.py

[mvp/src/metall_mvp/domain/calculation/sheet_cutting.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/sheet_cutting.py)

#### `_grid`, строка 74

Строка 75:

```python
return int((span + kerf) // (piece + kerf))
```

#### `plan_sheet_cutting`, строка 78

Строка 92:

```python
blank_area = effective_quantity * blank_width_mm * blank_length_mm
```

Строка 126:

```python
chosen = min(
        candidates,
        key=lambda option: (
            option.total_requested_area_mm2,
            option.sheets_required,
            option.sheet_width_mm * option.sheet_length_mm,
            option.sheet_width_mm,
            option.sheet_length_mm,
        ),
    )
```

Строка 108:

```python
capacity, _, rotated, columns, rows = max(orientations)
```

Строка 109:

```python
count = -(-effective_quantity // capacity)
```

Строка 110:

```python
requested = count * width * length
```

Строка 87:

```python
blank_width_mm <= 0
```

Строка 87:

```python
blank_length_mm <= 0
```

Строка 87:

```python
kerf_mm < 0
```

Строка 89:

```python
quantity is not None
```

Строка 89:

```python
quantity < 1
```

Строка 91:

```python
quantity is not None
```

Строка 95:

```python
width <= 0
```

Строка 95:

```python
length <= 0
```

Строка 141:

```python
quantity is None
```

#### `validate_arithmetic`, строка 57

Строка 62:

```python
area = self.selected_sheet_width_mm * self.selected_sheet_length_mm
```

Строка 58:

```python
self.parts_per_sheet != self.columns * self.rows
```

Строка 60:

```python
self.sheets_required != -(-self.quantity // self.parts_per_sheet)
```

Строка 63:

```python
self.total_requested_area_mm2 != self.sheets_required * area
```

Строка 65:

```python
self.blank_area_mm2 != self.quantity * self.blank_width_mm * self.blank_length_mm
```

Строка 67:

```python
self.waste_area_mm2 != self.total_requested_area_mm2 - self.blank_area_mm2
```

Строка 69:

```python
sum(option.selected for option in self.options) != 1
```

### mvp/src/metall_mvp/domain/calculation/sheet_stock_assortment.py

[mvp/src/metall_mvp/domain/calculation/sheet_stock_assortment.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/sheet_stock_assortment.py)

#### `_lower_deviation`, строка 16

Строка 29:

```python
nominal not in values
```

Строка 29:

```python
row_width != width
```

#### `sheet_stock_rows_from_candidate`, строка 43

Строка 78:

```python
lower is None
```

Строка 80:

```python
lower is not None
```

Строка 80:

```python
lower > 0
```

Строка 87:

```python
lower is not None
```

Строка 95:

```python
lower is not None
```

### mvp/src/metall_mvp/domain/calculation/sheet_stock_selection.py

[mvp/src/metall_mvp/domain/calculation/sheet_stock_selection.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/sheet_stock_selection.py)

#### `sheet_flatness_from_mm_per_m`, строка 67

Строка 71:

```python
return flatness / _THOUSAND
```

#### `format_contains_part`, строка 74

Строка 82:

```python
stock_width_mm >= part_width_mm
```

Строка 82:

```python
stock_length_mm >= part_length_mm
```

Строка 83:

```python
stock_width_mm >= part_length_mm
```

Строка 83:

```python
stock_length_mm >= part_width_mm
```

#### `check_prescribed_sheet`, строка 87

Строка 111:

```python
candidates = sorted(
        (
            row
            for row in db_rows
            if row.nominal_thickness_mm == thickness
            and (
                width is None or (row.width_mm, row.length_mm) in ((width, length), (length, width))
            )
        ),
        key=lambda row: (
            row.width_mm * row.length_mm,
            row.width_mm,
            row.length_mm,
            row.section_deviation_mm,
            row.assortment_item_id or "",
            row.designation or "",
        ),
    )
```

Строка 153:

```python
fitting = (
        min(
            fitting_rows,
            key=lambda row: (
                row.nominal_thickness_mm,
                (
                    plan := plan_sheet_cutting(
                        blank_width_mm=required_width_mm,
                        blank_length_mm=required_length_mm,
                        quantity=quantity,
                        formats=((row.width_mm, row.length_mm),),
                    )
                ).total_requested_area_mm2,
                plan.sheets_required,
                row.width_mm * row.length_mm,
                row.width_mm,
                row.length_mm,
            ),
        )
        if fitting_rows and required_width_mm is not None and required_length_mm is not None
        else (fitting_rows[0] if fitting_rows else None)
    )
```

Строка 102:

```python
(width_mm is None) != (length_mm is None)
```

Строка 104:

```python
(required_width_mm is None) != (required_length_mm is None)
```

Строка 102:

```python
width_mm is None
```

Строка 102:

```python
length_mm is None
```

Строка 104:

```python
required_width_mm is None
```

Строка 104:

```python
required_length_mm is None
```

Строка 106:

```python
width_mm is not None
```

Строка 107:

```python
length_mm is not None
```

Строка 172:

```python
required_width_mm is not None
```

Строка 172:

```python
required_length_mm is not None
```

Строка 134:

```python
required_thickness_mm is None
```

Строка 135:

```python
stock_minimum(row.nominal_thickness_mm, -row.section_deviation_mm)
                >= required_thickness_mm
```

Строка 139:

```python
required_width_mm is None
```

Строка 115:

```python
row.nominal_thickness_mm == thickness
```

Строка 141:

```python
required_length_mm is not None
```

Строка 117:

```python
width is None
```

Строка 117:

```python
(row.width_mm, row.length_mm) in ((width, length), (length, width))
```

#### `select_minimal_sheet_stock`, строка 199

Строка 226:

```python
width += decimal_value(width_allowance_mm, name="width allowance", minimum=_ZERO)
```

Строка 227:

```python
length += decimal_value(length_allowance_mm, name="length allowance", minimum=_ZERO)
```

Строка 229:

```python
selected: SheetStockDbRow | None = None
```

Строка 230:

```python
selected_plan: SheetCuttingPlan | None = None
```

Строка 231:

```python
selected_key: tuple[Decimal, Decimal, int, Decimal, Decimal, Decimal] | None = None
```

Строка 218:

```python
width <= _ZERO
```

Строка 218:

```python
length <= _ZERO
```

Строка 279:

```python
key = (
                row.nominal_thickness_mm,
                plan.total_requested_area_mm2,
                plan.sheets_required,
                row.width_mm * row.length_mm,
                row.width_mm,
                row.length_mm,
            )
```

Строка 296:

```python
row.nominal_thickness_mm == selected.nominal_thickness_mm
```

Строка 299:

```python
stock_minimum(row.nominal_thickness_mm, -row.section_deviation_mm) >= required
```

#### `fits`, строка 130

Строка 134:

```python
required_thickness_mm is None
```

Строка 135:

```python
stock_minimum(row.nominal_thickness_mm, -row.section_deviation_mm)
                >= required_thickness_mm
```

Строка 139:

```python
required_width_mm is None
```

Строка 141:

```python
required_length_mm is not None
```

### mvp/src/metall_mvp/domain/calculation/stock_calculation_basis.py

[mvp/src/metall_mvp/domain/calculation/stock_calculation_basis.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/stock_calculation_basis.py)

#### `stock_calculation_geometry`, строка 54

Строка 113:

```python
features = set(scope.feature_refs) | {ref for item in relations for ref in item.feature_refs}
```

#### `assess_stock_calculation_basis`, строка 128

Строка 138:

```python
refs = tuple(item.id for item in prescriptions) + tuple(item.id for item in scopes)
```

Строка 171:

```python
len(methods - {None}) > 1
```

Строка 171:

```python
len(forms) > 1
```

Строка 217:

```python
len(current_scopes) > 1
```

### mvp/src/metall_mvp/domain/calculation/stock_form_preview.py

[mvp/src/metall_mvp/domain/calculation/stock_form_preview.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/stock_form_preview.py)

#### `_profile_dimension`, строка 108

Строка 119:

```python
item.nominal_value is not None
```

Строка 133:

```python
item.nominal_value is not None
```

#### `_profile_length_basis`, строка 175

Строка 185:

```python
explicit.nominal_value is not None
```

#### `_profile_dimensions_complete`, строка 215

Строка 218:

```python
dimensions.width_mm is not None
```

Строка 219:

```python
dimensions.height_mm is not None
```

Строка 220:

```python
dimensions.length_mm is not None
```

Строка 224:

```python
dimensions.width_mm is not None
```

Строка 225:

```python
dimensions.height_mm is not None
```

Строка 226:

```python
dimensions.length_mm is not None
```

#### `_correct_profile_preview`, строка 252

Строка 278:

```python
nominal_length is not None
```

Строка 278:

```python
max_length is not None
```

### mvp/src/metall_mvp/domain/calculation/stock_screening_assessment.py

[mvp/src/metall_mvp/domain/calculation/stock_screening_assessment.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/stock_screening_assessment.py)

#### `_form_assessment`, строка 61

Строка 70:

```python
len(forms) > 1
```

Строка 75:

```python
len(forms) == 1
```

#### `_finished_upper`, строка 123

Строка 223:

```python
return max(
        item.effective_upper_limit for item in confirmed if item.effective_upper_limit is not None
    ), refs
```

Строка 130:

```python
result.axial_length is not None
```

Строка 153:

```python
len(sections) == 1
```

Строка 224:

```python
item.effective_upper_limit is not None
```

Строка 188:

```python
item.nominal_value is not None
```

#### `_section_check`, строка 228

Строка 282:

```python
return StockGeometryCheck(
        kind="section",
        status=status,
        reason=reason,
        available_mm=candidate.guaranteed_section_mm,
        required_upper_mm=required,
        comparison_basis="confirmed_upper" if required is not None else None,
        stock_lower_deviation_mm=(
            candidate.guaranteed_section_mm - nominal
            if candidate.guaranteed_section_mm is not None
            and (
                nominal := candidate.nominal_dimensions.diameter_mm
                or candidate.nominal_dimensions.outer_diameter_mm
                or candidate.nominal_dimensions.width_mm
                or candidate.nominal_dimensions.thickness_mm
            )
            is not None
            else None
        ),
        observed_nominal_mm=(
            next(
                (
                    item.nominal_value
                    for item in passport.dimensions
                    if item.id == observation.dimension_ref
                ),
                None,
            )
            if observation is not None
            else None
        ),
        source_fact_refs=refs,
        missing_fact_refs=tuple(missing),
    )
```

Строка 250:

```python
candidate.guaranteed_section_mm is None
```

Строка 253:

```python
candidate.guaranteed_section_mm is not None
```

Строка 254:

```python
known_upper is not None
```

Строка 255:

```python
candidate.guaranteed_section_mm < known_upper
```

Строка 273:

```python
candidate.guaranteed_section_mm is not None
```

Строка 275:

```python
candidate.guaranteed_section_mm >= required
```

Строка 291:

```python
candidate.guaranteed_section_mm is not None
```

Строка 292:

```python
(
                nominal := candidate.nominal_dimensions.diameter_mm
                or candidate.nominal_dimensions.outer_diameter_mm
                or candidate.nominal_dimensions.width_mm
                or candidate.nominal_dimensions.thickness_mm
            )
            is not None
```

#### `_nominal_section_check`, строка 318

Строка 324:

```python
required = max((item.nominal for item in extents), default=None)
```

Строка 339:

```python
deviation = available - nominal if available is not None and nominal is not None else None
```

Строка 339:

```python
nominal is not None
```

#### `_format_check`, строка 479

Строка 487:

```python
width is not None
```

Строка 490:

```python
length is not None
```

Строка 504:

```python
min_width is not None
```

Строка 505:

```python
min_length is not None
```

Строка 506:

```python
required_width is not None
```

Строка 507:

```python
required_length is not None
```

Строка 509:

```python
min_width >= required_width
```

Строка 509:

```python
min_length >= required_length
```

Строка 511:

```python
min_width >= required_length
```

Строка 511:

```python
min_length >= required_width
```

Строка 495:

```python
required_width is None
```

Строка 496:

```python
required_length is None
```

Строка 497:

```python
min_width is None
```

Строка 497:

```python
min_length is None
```

#### `_with_checks`, строка 534

Строка 576:

```python
section.available_mm is not None
```

Строка 598:

```python
len(checks) > 1
```

Строка 590:

```python
key in checks[-1].missing_fact_refs
```

#### `_profile_nominal_check`, строка 619

Строка 624:

```python
nominal = (
        result.observed_envelope.diameter_mm
        if axis == "diameter"
        else max(
            (
                value
                for value in (result.observed_envelope.width_mm, result.observed_envelope.height_mm)
                if value is not None
            ),
            default=None,
        )
    )
```

Строка 645:

```python
nominal is None
```

Строка 647:

```python
available >= nominal
```

#### `_tube_inner_check`, строка 659

Строка 672:

```python
return (
                item.effective_tolerance.lower_limit
                if item.effective_tolerance and item.effective_tolerance.lower_limit is not None
                else item.lower_limit
                if item.lower_limit is not None
                else item.nominal_value + item.lower_deviation
                if item.lower_deviation is not None and item.nominal_value is not None
                else None
            )
```

Строка 661:

```python
len(sections) == 1
```

Строка 693:

```python
required = outer_min - 2 * wall.effective_upper_limit
```

Строка 674:

```python
item.effective_tolerance.lower_limit is not None
```

Строка 676:

```python
item.lower_limit is not None
```

Строка 692:

```python
wall.effective_upper_limit is not None
```

Строка 678:

```python
item.lower_deviation is not None
```

Строка 678:

```python
item.nominal_value is not None
```

#### `assess_stock_screening`, строка 720

Строка 1080:

```python
update["compatible_gosts"] = tuple(
            sorted(
                set(result.compatible_gosts)
                | {
                    item.standard_designation
                    for item in geometric_rows
                    if item.standard_designation
                }
            )
        )
```

Строка 748:

```python
len(sizes) > 1
```

Строка 749:

```python
len(standards) > 1
```

Строка 750:

```python
len(precisions) > 1
```

Строка 770:

```python
result.prescribed_nominal_mm is not None
```

Строка 825:

```python
len(precisions) == 1
```

Строка 1023:

```python
update["prescribed_conflict_reason"] += (
                " Расчётный минимум не выбран: определяющий номинал требует проверки."
                if uncertain_outer or reference_outer
                else " Подходящей альтернативной строки в активной НСИ нет."
            )
```

Строка 1054:

```python
len(standards) == 1
```

Строка 737:

```python
item.nominal_section_mm is not None
```

Строка 738:

```python
item.secondary_section_mm is not None
```

Строка 918:

```python
_section_nominal(candidate) == _section_nominal(geometric_choice)
```

Строка 971:

```python
_section_nominal(item) == _section_nominal(geometric_choice)
```

#### `lower`, строка 671

Строка 672:

```python
return (
                item.effective_tolerance.lower_limit
                if item.effective_tolerance and item.effective_tolerance.lower_limit is not None
                else item.lower_limit
                if item.lower_limit is not None
                else item.nominal_value + item.lower_deviation
                if item.lower_deviation is not None and item.nominal_value is not None
                else None
            )
```

Строка 674:

```python
item.effective_tolerance.lower_limit is not None
```

Строка 676:

```python
item.lower_limit is not None
```

Строка 678:

```python
item.lower_deviation is not None
```

Строка 678:

```python
item.nominal_value is not None
```

### mvp/src/metall_mvp/domain/calculation/stock_selection_policy.py

[mvp/src/metall_mvp/domain/calculation/stock_selection_policy.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/stock_selection_policy.py)

#### `resolve_stock_selection`, строка 17

Строка 80:

```python
return StockSelection(
        prescribed=prescribed,
        recommended=recommended,
        selected=selected,
        selection_origin=selection_origin,
        finished_max_mm=finished_max_mm,
        required_min_mm=required_min_mm,
        guaranteed_allowance_per_side_mm=(
            (selected.guaranteed_min_mm - finished_max_mm) / Decimal("2")
            if selected is not None and finished_max_mm is not None
            else None
        ),
        sufficiency=sufficiency,
        warnings=tuple(warnings),
    )
```

Строка 38:

```python
finished_max_mm is not None
```

Строка 77:

```python
required_min_mm is not None
```

Строка 62:

```python
required_min_mm is not None
```

Строка 89:

```python
finished_max_mm is not None
```

### mvp/src/metall_mvp/domain/calculation/tube_stock_selection.py

[mvp/src/metall_mvp/domain/calculation/tube_stock_selection.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/tube_stock_selection.py)

#### `_positive_sum`, строка 92

Строка 93:

```python
value = Decimal(str(nominal)) + Decimal(str(deviation))
```

Строка 94:

```python
Decimal(str(nominal)) <= _ZERO
```

#### `check_prescribed_tube`, строка 101

Строка 116:

```python
2 * wall >= outer
```

Строка 142:

```python
upper is None
```

Строка 146:

```python
required_outer_mm is None
```

Строка 147:

```python
stock_minimum(outer, row.outer_deviation_mm) >= required_outer_mm
```

Строка 150:

```python
required_hole_mm is None
```

Строка 158:

```python
required_length_mm is None
```

Строка 126:

```python
row.outer_diameter_mm == outer
```

Строка 127:

```python
row.wall_thickness_mm == wall
```

Строка 131:

```python
row.available_length_mm is None
```

Строка 152:

```python
upper is not None
```

Строка 153:

```python
tube_inner_maximum(outer, upper, wall, row.wall_lower_deviation_mm)
                    <= required_hole_mm
```

#### `select_minimal_tube_stock`, строка 181

Строка 206:

```python
required_hole = (
        _positive_sum("D_hole_min", through_hole_mm, hole_lower_deviation_mm) - inner_allowance_mm
    )
```

Строка 211:

```python
required_length = part_length + length_allowance_mm
```

Строка 214:

```python
selected: TubeStockDbRow | None = None
```

Строка 196:

```python
part_length <= _ZERO
```

Строка 230:

```python
k1 = q / _THOUSAND
```

Строка 231:

```python
nominal_inner = row.outer_diameter_mm - _TWO * row.wall_thickness_mm
```

Строка 248:

```python
nominal_inner > _ZERO
```

Строка 249:

```python
row.available_length_mm is None
```

Строка 249:

```python
row.available_length_mm >= required_length
```

Строка 220:

```python
item.available_length_mm is None
```

#### `fits`, строка 139

Строка 142:

```python
upper is None
```

Строка 146:

```python
required_outer_mm is None
```

Строка 147:

```python
stock_minimum(outer, row.outer_deviation_mm) >= required_outer_mm
```

Строка 150:

```python
required_hole_mm is None
```

Строка 158:

```python
required_length_mm is None
```

Строка 152:

```python
upper is not None
```

Строка 153:

```python
tube_inner_maximum(outer, upper, wall, row.wall_lower_deviation_mm)
                    <= required_hole_mm
```

### mvp/src/metall_mvp/domain/compact_round.py

[mvp/src/metall_mvp/domain/compact_round.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/compact_round.py)

#### `assign_clarification_tasks`, строка 838

Строка 875:

```python
payload = {
            "source_run_id": value.source_run_id,
            "assignment": assignment.model_dump(mode="json"),
            "actor": actor,
            "saved_revision": value.revision + 1,
        }
```

#### `positive_required_extent`, строка 57

Строка 62:

```python
nominal is not None
```

Строка 62:

```python
nominal + deviation <= 0
```

#### `separate_stock_proposal`, строка 176

Строка 180:

```python
self.round_basis.prescribed_diameter_mm is not None
```

#### `work_references`, строка 411

Строка 431:

```python
0 <= goal.work_index < len(self.works)
```

### mvp/src/metall_mvp/domain/cycle_estimate.py

[mvp/src/metall_mvp/domain/cycle_estimate.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/cycle_estimate.py)

#### `money`, строка 153

Строка 154:

```python
return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
```

#### `material_cost`, строка 157

Строка 158:

```python
return money(kg * price * quantity)
```

#### `operation_cost`, строка 161

Строка 173:

```python
cost = money(minutes * rate / 60) if complete and rate is not None else None
```

Строка 172:

```python
minutes += component.minutes * multiplier
```

Строка 167:

```python
component.minutes is None
```

Строка 173:

```python
rate is not None
```

Строка 167:

```python
quantity is None
```

#### `calculate`, строка 177

Строка 237:

```python
accounted = sum(
        (item.rub_per_batch for item in lines if item.rub_per_batch is not None), Decimal(0)
    )
```

Строка 241:

```python
return (
        tuple(lines),
        tuple(missing),
        accounted,
        total,
        money(total / inputs.quantity) if total is not None else None,
    )
```

Строка 184:

```python
inputs.material_rub_per_kg.value is not None
```

Строка 194:

```python
inputs.material_rub_per_kg.value is None
```

Строка 210:

```python
cost is None
```

Строка 232:

```python
cost is None
```

Строка 215:

```python
rate is None
```

Строка 215:

```python
rate.value is None
```

#### `unique_rates`, строка 67

Строка 68:

```python
len({item.operation_id for item in self.rates}) != len(self.rates)
```

### mvp/src/metall_mvp/domain/d001_estimate.py

[mvp/src/metall_mvp/domain/d001_estimate.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/d001_estimate.py)

#### `exact_rates`, строка 67

Строка 68:

```python
len({r.operation_id for r in self.rates}) != len(self.rates)
```

Строка 70:

```python
len({r.title for r in self.other_costs}) != len(self.other_costs)
```

### mvp/src/metall_mvp/domain/estimation/automatic_machining.py

[mvp/src/metall_mvp/domain/estimation/automatic_machining.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/automatic_machining.py)

#### `_decimal`, строка 83

Строка 90:

```python
number < 0
```

Строка 90:

```python
number == 0
```

#### `extract_estimate_features`, строка 147

Строка 281:

```python
count is not None
```

Строка 214:

```python
op < 0
```

Строка 274:

```python
len(counts) > 1
```

Строка 273:

```python
len(counts) == 1
```

Строка 182:

```python
token in lower
```

#### `_ceil`, строка 317

Строка 318:

```python
result = int(value.to_integral_value(rounding=ROUND_CEILING))
```

Строка 319:

```python
result > 10000
```

#### `_motion`, строка 329

Строка 349:

```python
upper_repeats = _ceil(D(repeats) * factor)
```

Строка 377:

```python
numbers = {
            key: EvidenceValue(
                value=value * slowdown if upper and key == feed_key else value,
                unit=unit,
                basis="assumption",
                source=params.source,
            )
            for key, (value, unit) in operands.items()
        }
```

Строка 392:

```python
return OperationTimeWork(
            id=plan_id + suffix,
            description=f"Estimated unresolved {family} motion; source geometry is not completed by this hypothesis",
            method="motion.linear-feed/1",
            frequency="per_piece",
            scope="additive",
            feed_mode=mode,
            repetitions=upper_repeats if upper else repeats,
            operands=numbers,
            source=params.source,
        )
```

Строка 339:

```python
repeats < 1
```

Строка 339:

```python
repeats > 10000
```

Строка 339:

```python
path < 0
```

Строка 343:

```python
extra_upper_path is None
```

Строка 347:

```python
factor < 1
```

Строка 347:

```python
slowdown > 1
```

Строка 387:

```python
extra_upper_path is not None
```

Строка 379:

```python
key == feed_key
```

#### `_feature_path`, строка 408

Строка 415:

```python
count is None
```

Строка 480:

```python
tool = min(params.get("milling_tool_diameter_mm"), width)
```

Строка 484:

```python
lanes = 1 + _ceil(max(width - tool, D(0)) / (tool * step))
```

Строка 496:

```python
layers = _ceil((depth + allowance) / params.get("milling_ap_mm"))
```

Строка 499:

```python
path = max(path - tool, D(0)) if shape == "slot" else path + tool
```

Строка 505:

```python
return path + 2 * approach, int(count) * (layers * lanes + finish)
```

Строка 422:

```python
int(count) != count
```

Строка 428:

```python
path = leg * D(2).sqrt()
```

Строка 434:

```python
return path + 2 * approach, int(count)
```

Строка 444:

```python
path = (span * span + ((large - small) / 2) ** 2).sqrt()
```

Строка 445:

```python
layers = _ceil((large - small) / 2 / params.get(f"{family}_ap_mm")) + 1
```

Строка 451:

```python
return path + 2 * approach, int(count) * layers
```

Строка 454:

```python
span is None
```

Строка 467:

```python
radius = diameter / 2
```

Строка 470:

```python
depth = radius - offset
```

Строка 471:

```python
width = 2 * (radius * radius - offset * offset).sqrt()
```

Строка 473:

```python
depth == 0
```

Строка 482:

```python
step > 1
```

Строка 490:

```python
allowance += extra_depth
```

Строка 422:

```python
1 <= count <= 10000
```

Строка 427:

```python
angle == 45
```

Строка 439:

```python
span is not None
```

Строка 465:

```python
offset is None
```

Строка 468:

```python
offset > radius
```

Строка 458:

```python
width is None
```

Строка 458:

```python
depth is None
```

Строка 460:

```python
width > span
```

Строка 460:

```python
depth > diameter
```

#### `plan_machining_motions`, строка 509

Строка 530:

```python
operation_index < 0
```

Строка 538:

```python
known_cut_minutes is not None
```

Строка 613:

```python
span = length * span_ratio if known is not None and known > 0 else length
```

Строка 615:

```python
declared_span = max((item for item in literal_spans if item is not None), default=None)
```

Строка 616:

```python
declared_span is not None
```

Строка 617:

```python
span = min(span, declared_span)
```

Строка 629:

```python
repeats = max(1, _ceil(diameter * radial_ratio / params.get(f"{family}_ap_mm")))
```

Строка 630:

```python
path = span + 2 * approach
```

Строка 610:

```python
span_ratio > 1
```

Строка 633:

```python
path = min(diameter, length) * span_ratio + 2 * approach
```

Строка 613:

```python
known > 0
```

Строка 640:

```python
tool = min(params.get("milling_tool_diameter_mm"), diameter)
```

Строка 644:

```python
width, depth = diameter / 2, diameter * radial_ratio
```

Строка 653:

```python
declared_width = max(
                    (item for item in literal_widths if item is not None), default=None
                )
```

Строка 656:

```python
declared_depth = max(
                    (item for item in literal_depths if item is not None), default=None
                )
```

Строка 663:

```python
tool = min(tool, width) if width > 0 else tool
```

Строка 669:

```python
lanes = 1 + _ceil(max(width - tool, D(0)) / (tool * step))
```

Строка 670:

```python
layers = max(1, _ceil(depth / params.get("milling_ap_mm")))
```

Строка 671:

```python
repeats = layers * lanes + int(
                    params.get("milling_finish_passes", zero=True, integer=True)
                )
```

Строка 674:

```python
path = span + tool + 2 * approach
```

Строка 642:

```python
step > 1
```

Строка 659:

```python
declared_width is not None
```

Строка 660:

```python
width = min(diameter, declared_width)
```

Строка 661:

```python
declared_depth is not None
```

Строка 662:

```python
depth = min(diameter, declared_depth)
```

Строка 682:

```python
layers = _ceil(allowance / params.get("grinding_radial_step_mm"))
```

Строка 684:

```python
repeats = max(1, 2 * (layers + sparks))
```

Строка 685:

```python
path = length + 2 * approach if layers + sparks else D(0)
```

Строка 692:

```python
path, repeats = diameter + 2 * approach, 1
```

Строка 663:

```python
width > 0
```

Строка 650:

```python
offset is not None
```

Строка 650:

```python
offset <= diameter / 2
```

Строка 694:

```python
len(set(families)) == 1
```

Строка 694:

```python
known > 0
```

#### `get`, строка 303

Строка 305:

```python
value != value.to_integral_value()
```

#### `work`, строка 376

Строка 377:

```python
numbers = {
            key: EvidenceValue(
                value=value * slowdown if upper and key == feed_key else value,
                unit=unit,
                basis="assumption",
                source=params.source,
            )
            for key, (value, unit) in operands.items()
        }
```

Строка 392:

```python
return OperationTimeWork(
            id=plan_id + suffix,
            description=f"Estimated unresolved {family} motion; source geometry is not completed by this hypothesis",
            method="motion.linear-feed/1",
            frequency="per_piece",
            scope="additive",
            feed_mode=mode,
            repetitions=upper_repeats if upper else repeats,
            operands=numbers,
            source=params.source,
        )
```

Строка 387:

```python
extra_upper_path is not None
```

Строка 379:

```python
key == feed_key
```

### mvp/src/metall_mvp/domain/estimation/automatic_time.py

[mvp/src/metall_mvp/domain/estimation/automatic_time.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/automatic_time.py)

#### `_remaining`, строка 66

Строка 83:

```python
return aliases, {key: items[key] for key in sorted(required - known)}
```

Строка 80:

```python
line.minutes is not None
```

#### `_check_contributions`, строка 86

Строка 98:

```python
contribution.operation_index < 0
```

Строка 103:

```python
contribution.batch_base_minutes is not None
```

Строка 104:

```python
contribution.batch_upper_minutes is not None
```

Строка 155:

```python
contribution.base_minutes is not None
```

Строка 156:

```python
contribution.upper_minutes is not None
```

Строка 157:

```python
contribution.upper_minutes < contribution.base_minutes
```

Строка 150:

```python
minutes is not None
```

Строка 162:

```python
contribution.batch_base_minutes is None
```

Строка 163:

```python
contribution.batch_upper_minutes is None
```

Строка 164:

```python
contribution.batch_upper_minutes < contribution.batch_base_minutes
```

Строка 151:

```python
minutes < 0
```

Строка 192:

```python
contribution.base_minutes is not None
```

Строка 195:

```python
contribution.upper_minutes is not None
```

#### `_projection`, строка 208

Строка 223:

```python
raw_minutes is not None
```

Строка 274:

```python
minutes is not None
```

Строка 240:

```python
minutes is not None
```

#### `forecast_with_policy`, строка 285

Строка 300:

```python
by_operation: dict[int | None, list[WorkItem]] = {}
```

Строка 330:

```python
reserve = (
            upper.full_batch_minutes - base.full_batch_minutes
            if base.full_batch_minutes is not None and upper.full_batch_minutes is not None
            else None
        )
```

Строка 332:

```python
base.full_batch_minutes is not None
```

Строка 332:

```python
upper.full_batch_minutes is not None
```

### mvp/src/metall_mvp/domain/estimation/automatic_time_policy.py

[mvp/src/metall_mvp/domain/estimation/automatic_time_policy.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/automatic_time_policy.py)

#### `load_time_policy`, строка 138

Строка 143:

```python
revision not in {1, 2}
```

Строка 156:

```python
revision == 2
```

Строка 182:

```python
number < 0
```

#### `_size_bin`, строка 247

Строка 254:

```python
mass *= factor
```

Строка 252:

```python
mass is not None
```

#### `service_range`, строка 323

Строка 345:

```python
source = catalog.data["source"] + "; sha256=" + catalog.sha256
```

Строка 387:

```python
base, upper = number.base * count, number.upper * count
```

Строка 407:

```python
base *= scale.base
```

Строка 408:

```python
upper *= scale.upper
```

Строка 395:

```python
base += change_range.base * changes
```

Строка 396:

```python
upper += change_range.upper * changes
```

#### `plan_service_time`, строка 429

Строка 443:

```python
operation_index < 0
```

Строка 451:

```python
transition_count < 0
```

#### `ordered`, строка 69

Строка 70:

```python
self.upper < self.base
```

#### `exact_counts`, строка 94

Строка 100:

```python
count < 0
```

### mvp/src/metall_mvp/domain/estimation/contracts.py

[mvp/src/metall_mvp/domain/estimation/contracts.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/contracts.py)

#### `evidence_consistency`, строка 43

Строка 51:

```python
self.lower is not None
```

Строка 51:

```python
self.upper is not None
```

Строка 51:

```python
self.lower > self.upper
```

Строка 49:

```python
self.lower is not None
```

Строка 49:

```python
self.upper is not None
```

#### `time_state`, строка 199

Строка 200:

```python
self.minutes is not None
```

Строка 202:

```python
self.minutes is not None
```

### mvp/src/metall_mvp/domain/estimation/estimate.py

[mvp/src/metall_mvp/domain/estimation/estimate.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/estimate.py)

#### `_money`, строка 24

Строка 32:

```python
return value.quantize(quantum, rounding=ROUND_HALF_UP)
```

#### `_line_amount`, строка 77

Строка 84:

```python
line.hourly_rate is not None
```

Строка 85:

```python
return line.minutes * line.hourly_rate / 60 if line.minutes is not None else None
```

Строка 86:

```python
line.unit_price is not None
```

Строка 87:

```python
return line.unit_price * line.quantity if line.quantity is not None else None
```

Строка 78:

```python
line.hourly_rate is not None
```

Строка 78:

```python
line.unit_price is not None
```

Строка 80:

```python
line.hourly_rate is not None
```

Строка 80:

```python
line.unit_price is not None
```

Строка 85:

```python
line.minutes is not None
```

Строка 87:

```python
line.quantity is not None
```

#### `_validate_line`, строка 91

Строка 106:

```python
line.amount < 0
```

#### `build_estimate`, строка 116

Строка 129:

```python
quantity is not None
```

Строка 136:

```python
input_revision < 0
```

Строка 130:

```python
quantity <= 0
```

#### `apply_processing_markup`, строка 183

Строка 195:

```python
processing[bucket] = processing.get(bucket, Decimal(0)) + line.computed_batch_amount
```

Строка 199:

```python
markup = _money(base * (coefficient - 1), previous.currency)
```

Строка 200:

```python
subtotal = previous.base + markup
```

Строка 188:

```python
coefficient < 1
```

Строка 214:

```python
coefficient == 1
```

Строка 216:

```python
snapshot.processing_markup_coefficient == 1
```

#### `_assemble`, строка 224

Строка 316:

```python
quantity is None
```

Строка 264:

```python
line.computed_batch_minutes = line.minutes * factor
```

Строка 267:

```python
line.computed_batch_amount = amount * factor
```

Строка 295:

```python
bases[bucket] = bases.get(bucket, Decimal(0)) + line.computed_batch_amount
```

Строка 261:

```python
line.minutes is not None
```

Строка 262:

```python
factor is not None
```

Строка 266:

```python
factor is not None
```

Строка 297:

```python
item.key not in costs
```

Строка 256:

```python
quantity is not None
```

Строка 284:

```python
line.computed_batch_minutes is None
```

### mvp/src/metall_mvp/domain/estimation/feature_bindings.py

[mvp/src/metall_mvp/domain/estimation/feature_bindings.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/feature_bindings.py)

#### `dimension_binding_hash`, строка 12

Строка 15:

```python
0 <= i < len(dimensions)
```

#### `bound_feature_inventory`, строка 20

Строка 60:

```python
allowance is not None
```

Строка 49:

```python
len(matches) != 1
```

Строка 51:

```python
matches[0]["shape"] != prepared[min(expected)]["bound_shape"]
```

Строка 66:

```python
Decimal(str(amount)) < 0
```

#### `operation_grinding_features`, строка 81

Строка 112:

```python
feature: dict | None = next(
                (
                    f
                    for f in grinding_features(parent)
                    if f["source_rows"][0]["local_plan_index"] == index
                ),
                None,
            )
```

Строка 104:

```python
0 <= index < len(plans)
```

### mvp/src/metall_mvp/domain/estimation/feature_time.py

[mvp/src/metall_mvp/domain/estimation/feature_time.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/feature_time.py)

#### `feature_inventory`, строка 23

Строка 27:

```python
token in (row["kind"] + " " + row["location"]).casefold()
```

#### `assign_features`, строка 56

Строка 76:

```python
len(candidates) == 1
```

Строка 87:

```python
len(candidates) == 1
```

#### `_retained_interval`, строка 118

Строка 121:

```python
span is None
```

Строка 148:

```python
cursor < span
```

Строка 150:

```python
len(retained) > 1
```

Строка 134:

```python
length is None
```

Строка 137:

```python
start < 0
```

Строка 137:

```python
length <= 0
```

Строка 137:

```python
start + length > span
```

#### `grinding_features`, строка 155

Строка 206:

```python
allowance <= 0
```

Строка 206:

```python
span is None
```

Строка 222:

```python
span = retained[0][1] - retained[0][0] if retained else D(0)
```

Строка 245:

```python
span == 0
```

Строка 288:

```python
span != original_span
```

Строка 187:

```python
len(children) > 1
```

Строка 223:

```python
len(children) == 1
```

Строка 244:

```python
span -= footprint
```

Строка 237:

```python
D(0) < footprint <= span
```

#### `grinding_motion`, строка 301

Строка 305:

```python
layers = _ceil(feature["allowance_mm"] / params.get("grinding_radial_step_mm"))
```

Строка 318:

```python
return _motion(
        feature["id"],
        "grinding",
        feature["length_mm"] + 2 * approach,
        max(1, 2 * (layers + sparks)),
        params,
        unknown=False,
    )
```

#### `single_saw_motion`, строка 328

Строка 337:

```python
return _motion(
        f"op-{operation_index}-single-cut",
        "sawing",
        diameter + 2 * params.get("approach_mm", zero=True),
        1,
        params,
        unknown=False,
    )
```

### mvp/src/metall_mvp/domain/estimation/handoffs.py

[mvp/src/metall_mvp/domain/estimation/handoffs.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/handoffs.py)

#### `check_handoff`, строка 40

Строка 88:

```python
current.initial_diameter_mm is None
```

Строка 100:

```python
offset is None
```

Строка 110:

```python
predecessor_length is None
```

Строка 113:

```python
current_length is None
```

Строка 76:

```python
cutting_passes[-1].method_id != predecessor_input.method_id
```

Строка 83:

```python
attained <= 0
```

Строка 117:

```python
predecessor_length is not None
```

Строка 118:

```python
current_length is not None
```

Строка 119:

```python
offset is not None
```

Строка 120:

```python
predecessor_length < offset + current_length
```

Строка 91:

```python
current.initial_diameter_mm != attained
```

### mvp/src/metall_mvp/domain/estimation/manual_passes.py

[mvp/src/metall_mvp/domain/estimation/manual_passes.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/manual_passes.py)

#### `_nonnegative`, строка 72

Строка 73:

```python
number < 0
```

#### `_cylindrical`, строка 88

Строка 98:

```python
stop = (
        target.target_diameter_mm
        + (-_TWO if boring else _TWO) * target.remaining_radial_allowance_mm
        if target.target_diameter_mm is not None
        else None
    )
```

Строка 101:

```python
target.target_diameter_mm is not None
```

Строка 115:

```python
maximum <= 0
```

Строка 124:

```python
depth = (after - before) / _TWO if after is not None and before is not None else None
```

Строка 127:

```python
after = before - _TWO * depth if before is not None and depth is not None else None
```

Строка 142:

```python
depth is None
```

Строка 109:

```python
stop <= 0
```

Строка 138:

```python
before <= 0
```

Строка 140:

```python
after <= 0
```

Строка 144:

```python
depth < 0
```

Строка 131:

```python
index > 0
```

Строка 133:

```python
item.work_key == raw[index - 1].work_key
```

Строка 134:

```python
length is not None
```

Строка 135:

```python
length == previous_contact
```

Строка 146:

```python
depth == 0
```

Строка 172:

```python
length is not None
```

Строка 172:

```python
travel < length
```

Строка 175:

```python
length is not None
```

Строка 127:

```python
depth is not None
```

Строка 165:

```python
outer <= 0
```

Строка 175:

```python
length == target.work_length_mm
```

Строка 148:

```python
depth > maximum
```

#### `_facing`, строка 186

Строка 205:

```python
attained: Decimal | None = Decimal(0)
```

Строка 242:

```python
result.work_length_mm = (d - hole) / _TWO if d is not None and hole is not None else None
```

Строка 244:

```python
attained = (
            attained + depth
            if attained is not None and depth is not None and d == outer and hole == inner
            else None
        )
```

Строка 203:

```python
maximum <= 0
```

Строка 232:

```python
depth is None
```

Строка 219:

```python
d is None
```

Строка 230:

```python
d != outer
```

Строка 234:

```python
depth < 0
```

Строка 210:

```python
d is not None
```

Строка 211:

```python
d <= 0
```

Строка 213:

```python
hole < 0
```

Строка 214:

```python
d is not None
```

Строка 216:

```python
hole >= d
```

Строка 223:

```python
d is not None
```

Строка 224:

```python
d > outer
```

Строка 236:

```python
depth == 0
```

Строка 242:

```python
d is not None
```

Строка 246:

```python
depth is not None
```

Строка 246:

```python
d == outer
```

Строка 238:

```python
depth > maximum
```

#### `_counted`, строка 259

Строка 278:

```python
target.work_length_mm == 0
```

Строка 282:

```python
expected_diameter is not None
```

Строка 286:

```python
diameter is not None
```

Строка 286:

```python
diameter <= 0
```

Строка 316:

```python
target_kerf is None
```

Строка 299:

```python
depth is not None
```

Строка 300:

```python
target.work_length_mm is not None
```

Строка 301:

```python
depth > target.work_length_mm
```

Строка 304:

```python
depth is not None
```

Строка 304:

```python
depth == 0
```

Строка 308:

```python
depth is not None
```

Строка 308:

```python
travel < depth
```

Строка 313:

```python
kerf is not None
```

Строка 313:

```python
kerf <= 0
```

Строка 318:

```python
target_kerf is not None
```

Строка 318:

```python
kerf is not None
```

Строка 318:

```python
kerf != target_kerf
```

### mvp/src/metall_mvp/domain/estimation/pass_planning.py

[mvp/src/metall_mvp/domain/estimation/pass_planning.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/pass_planning.py)

#### `bind_planning_geometry`, строка 160

Строка 169:

```python
offset is not None
```

Строка 172:

```python
offset.value is not None
```

Строка 172:

```python
offset.value < 0
```

Строка 179:

```python
count != count.to_integral_value()
```

Строка 179:

```python
count < minimum
```

Строка 182:

```python
count != declared
```

#### `_operand`, строка 202

Строка 214:

```python
key in _REGIME_KEYS | {"ap_max_mm", "spring_passes"}
```

Строка 217:

```python
number.lower is None
```

Строка 218:

```python
number.upper is None
```

#### `_return`, строка 302

Строка 313:

```python
data.return_feed_mm_per_min is not None
```

Строка 309:

```python
data.return_travel_mm is not None
```

Строка 317:

```python
declared_feed is not None
```

Строка 317:

```python
declared_feed.value is not None
```

Строка 319:

```python
declared_feed is not None
```

#### `_layers`, строка 351

Строка 352:

```python
count = int((abs(stop - start) / step).to_integral_value(rounding=ROUND_CEILING))
```

Строка 353:

```python
count > _MAX_PASSES
```

Строка 359:

```python
following = current + direction * min(step, abs(stop - current))
```

#### `_feed_travel`, строка 365

Строка 371:

```python
return contact + data.approach_mm + data.exit_mm if contact is not None else None
```

Строка 367:

```python
data.feed_travel_mm is not None
```

Строка 368:

```python
data.feed_travel_mm < contact
```

#### `_linear_layers`, строка 374

Строка 389:

```python
stop = target + (-_TWO if boring else _TWO) * data.remaining_radial_allowance_mm
```

Строка 397:

```python
travel = (
        data.feed_travel_mm
        if data.feed_travel_mm is not None
        else data.work_length_mm + data.approach_mm + data.exit_mm
    )
```

Строка 387:

```python
depth <= 0
```

Строка 402:

```python
travel < data.work_length_mm
```

Строка 382:

```python
data.ap_max_mm is not None
```

Строка 383:

```python
depth is None
```

Строка 383:

```python
data.work_length_mm is None
```

Строка 390:

```python
stop < 0
```

Строка 395:

```python
data.work_length_mm == 0
```

Строка 399:

```python
data.feed_travel_mm is not None
```

#### `_facing`, строка 444

Строка 462:

```python
radial_travel = (outer - inner) / _TWO
```

Строка 463:

```python
travel = (
        data.feed_travel_mm
        if data.feed_travel_mm is not None
        else radial_travel + data.approach_mm + data.exit_mm
    )
```

Строка 460:

```python
total == 0
```

Строка 452:

```python
data.target_axial_depth_mm is not None
```

Строка 455:

```python
data.ap_max_mm is not None
```

Строка 456:

```python
depth is None
```

Строка 458:

```python
depth <= 0
```

Строка 465:

```python
data.feed_travel_mm is not None
```

#### `_sawing`, строка 496

Строка 501:

```python
data.initial_diameter_mm is None
```

Строка 505:

```python
extra = {
            "diameter_mm": _number(data, data.initial_diameter_mm),
            "cut_ordinal": _number(data, Decimal(index + 1), "1"),
        }
```

Строка 503:

```python
data.cut_width_mm is not None
```

Строка 509:

```python
kerf is not None
```

Строка 521:

```python
kerf is None
```

#### `_drilling`, строка 526

Строка 537:

```python
extra = {
            "diameter_mm": _number(data, diameter),
            "reference_diameter_mm": _number(data, diameter),
            "material_depth_mm": _number(data, contact),
            "hole_ordinal": _number(data, Decimal(index + 1), "1"),
        }
```

Строка 532:

```python
diameter is None
```

Строка 532:

```python
diameter <= 0
```

Строка 534:

```python
contact == 0
```

Строка 545:

```python
data.feed_travel_mm is not None
```

Строка 565:

```python
data.return_travel_mm is None
```

Строка 565:

```python
data.feed_travel_mm is None
```

Строка 546:

```python
data.feed_travel_mm < contact
```

Строка 561:

```python
data.return_travel_mm is not None
```

#### `_grooving`, строка 570

Строка 577:

```python
contact = (outer - final) / _TWO if outer is not None and final is not None else None
```

Строка 585:

```python
count = int((width / tool).to_integral_value(rounding=ROUND_CEILING))
```

Строка 586:

```python
count > _MAX_PASSES // 2
```

Строка 590:

```python
start = min(Decimal(index) * tool, width - tool)
```

Строка 591:

```python
end = start + tool
```

Строка 592:

```python
new_width = end - covered
```

Строка 579:

```python
width is None
```

Строка 581:

```python
tool > width
```

#### `_threading`, строка 621

Строка 646:

```python
len(positions) + springs > _MAX_PASSES // 2
```

Строка 627:

```python
data.ap_max_mm is not None
```

Строка 629:

```python
diameter is None
```

Строка 629:

```python
depth is None
```

Строка 633:

```python
depth * _TWO >= diameter
```

Строка 633:

```python
layer <= 0
```

Строка 635:

```python
depth == 0
```

Строка 635:

```python
travel == 0
```

Строка 643:

```python
assumed_springs != assumed_springs.to_integral_value()
```

Строка 643:

```python
assumed_springs < 0
```

#### `validate_sequence`, строка 717

Строка 727:

```python
sequence.strategy_version != expected.strategy_version
```

### mvp/src/metall_mvp/domain/estimation/pricing.py

[mvp/src/metall_mvp/domain/estimation/pricing.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/pricing.py)

#### `_nonnegative_number`, строка 26

Строка 33:

```python
number >= 0
```

#### `usable_rate_basis`, строка 36

Строка 45:

```python
len(currency) != 3
```

Строка 48:

```python
currency != currency.upper()
```

#### `selected_rate_basis`, строка 54

Строка 57:

```python
rate is not None
```

#### `usable_legacy_cost`, строка 62

Строка 64:

```python
rate is None
```

### mvp/src/metall_mvp/domain/estimation/profiles.py

[mvp/src/metall_mvp/domain/estimation/profiles.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/profiles.py)

#### `_validate_profile`, строка 108

Строка 134:

```python
rate is None
```

Строка 135:

```python
rate.value is None
```

Строка 136:

```python
rate.value < 0
```

Строка 143:

```python
number.value < 0
```

Строка 128:

```python
number.value <= 0
```

Строка 149:

```python
number.value < 0
```

#### `load_profiles`, строка 154

Строка 163:

```python
target = (root / name).resolve()
```

Строка 184:

```python
len({(profile.material_group, profile.material_state) for profile in cutting}) < 2
```

#### `_scope_problems`, строка 201

Строка 217:

```python
lower: Decimal | None
```

Строка 218:

```python
upper: Decimal | None
```

Строка 234:

```python
upper is not None
```

Строка 237:

```python
lower is not None
```

Строка 237:

```python
lower >= limit
```

Строка 239:

```python
lower is not None
```

Строка 242:

```python
upper is not None
```

Строка 242:

```python
upper <= limit
```

Строка 235:

```python
upper < limit
```

Строка 240:

```python
lower > limit
```

Строка 235:

```python
upper == limit
```

Строка 240:

```python
lower == limit
```

#### `select_profile`, строка 251

Строка 291:

```python
len(accepted) > 1
```

Строка 289:

```python
len(accepted) == 1
```

### mvp/src/metall_mvp/domain/estimation/reserve.py

[mvp/src/metall_mvp/domain/estimation/reserve.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/reserve.py)

#### `calculate_reserves`, строка 28

Строка 37:

```python
amounts: dict[MoneyBucket, Decimal | None] = dict.fromkeys(buckets)
```

Строка 38:

```python
grouped: dict[MoneyBucket, list[Decimal | None]] = {}
```

Строка 86:

```python
base = sum((value for value in values if value is not None), Decimal(0))
```

Строка 87:

```python
reserve: Decimal | None = None
```

Строка 99:

```python
amounts[bucket] = (
            sum((value for value in values if value is not None), Decimal(0))
            if all(value is not None for value in values)
            else None
        )
```

Строка 93:

```python
reserve = base * group.ratio
```

Строка 61:

```python
cost.currency != group.currency
```

Строка 63:

```python
cost.price_basis != group.price_basis
```

Строка 90:

```python
group.ratio is not None
```

Строка 91:

```python
base < 0
```

Строка 95:

```python
reserve = max(Decimal(0), group.upper_amount - base)
```

Строка 94:

```python
group.upper_amount is not None
```

### mvp/src/metall_mvp/domain/estimation/time_estimate.py

[mvp/src/metall_mvp/domain/estimation/time_estimate.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/time_estimate.py)

#### `_reason`, строка 210

Строка 213:

```python
len(explicit) != 1
```

#### `build_manufacturing_time`, строка 265

Строка 314:

```python
snapshot.quantity is None
```

Строка 355:

```python
snapshot.quantity is None
```

Строка 383:

```python
piece = sum(piece_values, Decimal(0)) if piece_values else None
```

Строка 384:

```python
fixed = sum(batch_values, Decimal(0)) if batch_values else None
```

Строка 389:

```python
full_piece = (
            full_batch / snapshot.quantity
            if full_batch is not None and snapshot.quantity is not None
            else None
        )
```

Строка 387:

```python
batch = (fixed or Decimal(0)) + piece * snapshot.quantity
```

Строка 386:

```python
snapshot.quantity is not None
```

Строка 289:

```python
line.minutes is not None
```

Строка 374:

```python
line.minutes is not None
```

Строка 379:

```python
line.minutes is not None
```

Строка 391:

```python
snapshot.quantity is not None
```

#### `ordered`, строка 72

Строка 73:

```python
self.upper_minutes < self.base_minutes
```

#### `ordered`, строка 88

Строка 89:

```python
self.upper_addition_batch_minutes < self.base_addition_batch_minutes
```

### mvp/src/metall_mvp/domain/estimation/work_scope.py

[mvp/src/metall_mvp/domain/estimation/work_scope.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/work_scope.py)

#### `selected_work`, строка 37

Строка 39:

```python
0 <= index < len(works)
```

### mvp/src/metall_mvp/domain/estimation/work_time_inputs.py

[mvp/src/metall_mvp/domain/estimation/work_time_inputs.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/work_time_inputs.py)

#### `_scalar`, строка 59

Строка 62:

```python
evidence.lower is not None
```

Строка 62:

```python
evidence.upper is not None
```

Строка 64:

```python
evidence.value < 0
```

Строка 64:

```python
evidence.value == 0
```

#### `_known_time_floor`, строка 68

Строка 87:

```python
floor += line.minutes
```

Строка 83:

```python
line.minutes is None
```

Строка 89:

```python
quantity is None
```

Строка 92:

```python
floor += line.minutes * quantity
```

#### `project_time_works`, строка 166

Строка 299:

```python
value: Decimal | None = minutes.value if minutes is not None else None
```

Строка 191:

```python
operation_index < 0
```

Строка 194:

```python
quantity is not None
```

Строка 290:

```python
minutes is not None
```

Строка 313:

```python
source += "\n" + minutes.source
```

Строка 195:

```python
quantity <= 0
```

Строка 292:

```python
minutes is not None
```

Строка 292:

```python
minutes.value is not None
```

Строка 293:

```python
work.feed_mode is not None
```

Строка 299:

```python
minutes is not None
```

Строка 300:

```python
minutes is not None
```

Строка 312:

```python
minutes is not None
```

Строка 312:

```python
minutes.source != source
```

Строка 294:

```python
minutes.value == 0
```

Строка 338:

```python
minutes is not None
```

Строка 333:

```python
minutes is not None
```

#### `explicit_time_basis`, строка 125

Строка 141:

```python
self.minutes is not None
```

Строка 144:

```python
self.minutes is not None
```

Строка 146:

```python
self.feed_mode is None
```

Строка 139:

```python
self.feed_mode is not None
```

Строка 139:

```python
self.repetitions != 1
```

Строка 160:

```python
evidence.value != evidence.value.to_integral_value()
```

### mvp/src/metall_mvp/domain/machine_regimes.py

[mvp/src/metall_mvp/domain/machine_regimes.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/machine_regimes.py)

#### `validate_regime`, строка 54

Строка 62:

```python
key not in METHODS[regime.method_id][1]
```

Строка 64:

```python
value.unit != PARAMETERS[key][1]
```

Строка 68:

```python
value.value <= 0
```

Строка 70:

```python
value.value > 180
```

#### `select_regime`, строка 74

Строка 91:

```python
len(matches) > 1
```

#### `working_profile`, строка 96

Строка 101:

```python
parameters = {
        key: value.model_copy(update={"source": source + "; " + value.source})
        for key, value in regime.parameters.items()
    }
```

### mvp/src/metall_mvp/domain/nsi/assortment_golden.py

[mvp/src/metall_mvp/domain/nsi/assortment_golden.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/assortment_golden.py)

#### `assortment_manifest_drift`, строка 65

Строка 103:

```python
unexpected = set(actual["per_product"]) - set(expected["per_product"])
```

### mvp/src/metall_mvp/domain/nsi/builtin_assortment.py

[mvp/src/metall_mvp/domain/nsi/builtin_assortment.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/builtin_assortment.py)

#### `_symmetric_display`, строка 109

Строка 110:

```python
upper is None
```

#### `_sheet_tolerance_display`, строка 113

Строка 114:

```python
lower is None
```

Строка 114:

```python
upper is None
```

Строка 120:

```python
high >= 0
```

#### `_load_bar_data`, строка 141

Строка 162:

```python
dev = abs(tol_val)
```

Строка 164:

```python
dev = dev / Decimal("2")
```

#### `_sheet_display_rows`, строка 212

Строка 215:

```python
flatness_mm = flatness_pct * 10
```

#### `_tube_display_rows`, строка 362

Строка 373:

```python
inner = d - Decimal("2") * wall
```

Строка 374:

```python
mass = (Decimal("0.0246615") * wall * (d - wall)).quantize(Decimal("0.001"))
```

### mvp/src/metall_mvp/domain/nsi/builtin_assortment_runtime.py

[mvp/src/metall_mvp/domain/nsi/builtin_assortment_runtime.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/builtin_assortment_runtime.py)

#### `_build_assortment_items`, строка 47

Строка 93:

```python
curvature is not None
```

Строка 247:

```python
inner = max(Decimal("0"), d - Decimal("2.0") * wall)
```

Строка 249:

```python
dev_wall = (wall * wall_pct).quantize(Decimal("0.01"))
```

Строка 250:

```python
inner_upper_dev = dev_d + Decimal("2") * dev_wall
```

Строка 251:

```python
inner_lower_dev = -dev_d - Decimal("2") * dev_wall
```

Строка 282:

```python
mass = (Decimal("0.0246615") * wall * (d - wall)).quantize(Decimal("0.001"))
```

Строка 242:

```python
dev_d = (d * Decimal("0.0100")).quantize(Decimal("0.01"))
```

Строка 244:

```python
dev_d = (d * Decimal("0.0125")).quantize(Decimal("0.01"))
```

Строка 292:

```python
mass > Decimal(0)
```

### mvp/src/metall_mvp/domain/nsi/catalog_runtime.py

[mvp/src/metall_mvp/domain/nsi/catalog_runtime.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/catalog_runtime.py)

#### `_approved_densities_for`, строка 94

Строка 101:

```python
density.material_id != material.material_id
```

Строка 102:

```python
density.material_record_version != material.record_version
```

Строка 106:

```python
density.record_version > current.record_version
```

#### `_approved_density_for`, строка 115

Строка 120:

```python
len(matches) == 1
```

#### `resolve`, строка 143

Строка 161:

```python
matches = tuple(
            material
            for material in approved
            if _material_key(material.canonical_name) in requested
            or bool(
                requested
                & aliases_by_material.get((material.material_id, material.record_version), set())
            )
        )
```

Строка 170:

```python
len(matches) == 1
```

Строка 180:

```python
len(matches) > 1
```

#### `list_all`, строка 205

Строка 238:

```python
density is None
```

Строка 237:

```python
len(approved) == 1
```

Строка 229:

```python
density.record_version > current.record_version
```

#### `_source_refs`, строка 450

Строка 544:

```python
return tuple(
            SnapshotRecordRef(
                record_kind=kind,
                record_id=record_id,
                record_version=record.record_version,
                content_hash=NSISnapshotManifest.compute_hash(record.model_dump(mode="json")),
                promotion_decision_id=record.promotion_decision_id or "",
            )
            for kind, record_id, record in records
        ) + tuple(assortment_snapshot_ref(item) for item in assortment)
```

### mvp/src/metall_mvp/domain/nsi/cut_norms.py

[mvp/src/metall_mvp/domain/nsi/cut_norms.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/cut_norms.py)

#### `validate_rows`, строка 82

Строка 84:

```python
previous: CutNormRow | None = None
```

Строка 86:

```python
row.diameter_to_mm <= row.diameter_over_mm
```

Строка 91:

```python
row.diameter_over_mm < previous.diameter_to_mm
```

#### `parse_cut_norms_csv`, строка 106

Строка 132:

```python
kerf.lower() == NOT_AVAILABLE
```

#### `export_cut_norms_csv`, строка 139

Строка 152:

```python
return UTF8_BOM + output.getvalue().encode("utf-8")
```

Строка 149:

```python
row.kerf_mm is None
```

#### `covers`, строка 48

Строка 49:

```python
self.diameter_over_mm < diameter_mm <= self.diameter_to_mm
```

### mvp/src/metall_mvp/domain/nsi/editable_candidates.py

[mvp/src/metall_mvp/domain/nsi/editable_candidates.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/editable_candidates.py)

#### `overlay_editable_reference_candidates`, строка 57

Строка 140:

```python
size_index = len(result) - 1
```

Строка 146:

```python
tolerance_index = len(result) - 1
```

Строка 172:

```python
item.size.width_mm is not None
```

Строка 173:

```python
item.size.length_mm is not None
```

Строка 239:

```python
Decimal(str(length)) in revision_lengths
```

#### `_pick_length_rows`, строка 285

Строка 288:

```python
row.length_mm >= minimum
```

#### `_bar_rows`, строка 294

Строка 307:

```python
row.selection_allowance_mm is None
```

Строка 309:

```python
row.curvature_percent is not None
```

Строка 311:

```python
row.curvature_mm is not None
```

Строка 312:

```python
curvature = row.curvature_mm * Decimal("100") / row.length_mm
```

Строка 324:

```python
curvature is not None
```

Строка 325:

```python
curvature is not None
```

#### `_sheet_rows`, строка 342

Строка 348:

```python
row.lower_deviation_magnitude_mm is None
```

Строка 363:

```python
row.flatness_percent is not None
```

Строка 370:

```python
row.flatness_percent is not None
```

#### `_pipe_rows`, строка 391

Строка 412:

```python
curvature = (
            row.straightness_percent * Decimal("10")
            if row.straightness_percent is not None
            else row.straightness_deviation_mm_per_m
        )
```

Строка 404:

```python
row.outer_negative_deviation_mm is not None
```

Строка 409:

```python
row.wall_negative_deviation_mm is not None
```

Строка 414:

```python
row.straightness_percent is not None
```

Строка 417:

```python
outer_lower is None
```

Строка 417:

```python
wall_lower is None
```

Строка 417:

```python
curvature is None
```

Строка 441:

```python
row.mass_per_meter_kg is not None
```

Строка 431:

```python
row.diameter_positive_tolerance_mm is not None
```

Строка 454:

```python
row.diameter_positive_tolerance_mm is not None
```

### mvp/src/metall_mvp/domain/nsi/editable_csv_sync.py

[mvp/src/metall_mvp/domain/nsi/editable_csv_sync.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/editable_csv_sync.py)

#### `check_publication`, строка 25

Строка 31:

```python
path = self.store.current_directory / profile.export_filename
```

#### `_synchronize_table`, строка 56

Строка 58:

```python
path = self.store.current_directory / profile.export_filename
```

Строка 65:

```python
content = stream.read(DEFAULT_MAX_BYTES + 1)
```

Строка 94:

```python
baseline = factory_defaults_directory() / profile.filename
```

Строка 112:

```python
now - pending[1] < 0.5
```

Строка 109:

```python
pending[0] != digest
```

### mvp/src/metall_mvp/domain/nsi/editable_exports.py

[mvp/src/metall_mvp/domain/nsi/editable_exports.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/editable_exports.py)

#### `_write_zip_atomic`, строка 178

Строка 188:

```python
info.external_attr = 0o100644 << 16
```

#### `export_current`, строка 63

Строка 65:

```python
path = self.current_directory / profile.export_filename
```

#### `export_publication`, строка 89

Строка 93:

```python
current_csv: Path | None = None
```

Строка 94:

```python
backup_directory: Path | None = None
```

### mvp/src/metall_mvp/domain/nsi/editable_runtime.py

[mvp/src/metall_mvp/domain/nsi/editable_runtime.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/editable_runtime.py)

#### `build_editable_runtime_table`, строка 239

Строка 278:

```python
row.selection_allowance_mm is None
```

Строка 285:

```python
curvature_percent = row.curvature_mm * Decimal("100") / length
```

Строка 284:

```python
curvature_percent is None
```

Строка 284:

```python
row.curvature_mm is not None
```

Строка 308:

```python
curvature_percent is not None
```

#### `_build_sheet_runtime_table`, строка 343

Строка 362:

```python
flatness = (
            row.flatness_percent * Decimal("10")
            if row.flatness_percent is not None
            else row.flatness_mm_per_m
        )
```

Строка 358:

```python
row.lower_deviation_magnitude_mm is None
```

Строка 364:

```python
row.flatness_percent is not None
```

#### `_build_tube_runtime_table`, строка 433

Строка 463:

```python
inner_d = row.outer_diameter_mm - 2 * row.wall_thickness_mm
```

Строка 451:

```python
row.outer_negative_deviation_mm is not None
```

Строка 456:

```python
row.wall_negative_deviation_mm is not None
```

Строка 459:

```python
outer_lower is None
```

Строка 459:

```python
wall_lower is None
```

Строка 489:

```python
row.diameter_positive_tolerance_mm is not None
```

Строка 502:

```python
row.wall_negative_deviation_mm is not None
```

### mvp/src/metall_mvp/domain/nsi/editable_table_defaults.py

[mvp/src/metall_mvp/domain/nsi/editable_table_defaults.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/editable_table_defaults.py)

#### `protected_snapshot_path`, строка 28

Строка 38:

```python
package = directory / filename
```

#### `_unpack_protected_snapshot`, строка 46

Строка 49:

```python
sum(item.file_size for item in archive.infolist()) > 32 * 1024 * 1024
```

Строка 52:

```python
target = (directory / member.filename).resolve()
```

#### `build_factory_defaults`, строка 74

Строка 85:

```python
content = (source / profile.filename).read_bytes()
```

Строка 93:

```python
destination = target / profile.filename
```

Строка 102:

```python
destination = target_schemas / name
```

Строка 107:

```python
src, dst = source / name, target / name
```

Строка 94:

```python
destination.resolve() != (source / profile.filename).resolve()
```

Строка 103:

```python
destination.resolve() != (source / "schemas" / name).resolve()
```

#### `build_factory_package`, строка 122

Строка 129:

```python
members = [
        default_directory / "manifest.json",
        *(
            default_directory / name
            for name in ("formulas.json", "sheet_tolerance_policies.json")
            if (default_directory / name).is_file()
        ),
        *(default_directory / "schemas" / f"{schema_id}.json" for schema_id in sorted(schema_ids)),
        *(default_directory / entry["filename"] for entry in manifest["tables"].values()),
    ]
```

Строка 145:

```python
info.external_attr = 0o100644 << 16
```

#### `verify_factory_default_csv`, строка 164

Строка 172:

```python
content = (base / str(entry["filename"])).read_bytes()
```

### mvp/src/metall_mvp/domain/nsi/editable_tables.py

[mvp/src/metall_mvp/domain/nsi/editable_tables.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/editable_tables.py)

#### `parse_editable_table_csv`, строка 142

Строка 175:

```python
parsed: dict[str, Decimal | None] = {}
```

#### `validate_editable_rows`, строка 266

Строка 272:

```python
len({type(row) for row in normalized}) != 1
```

#### `export_editable_table_csv`, строка 289

Строка 305:

```python
return UTF8_BOM + output.getvalue().encode("utf-8")
```

#### `external_row_payload`, строка 308

Строка 310:

```python
result: dict[str, str | None] = {}
```

#### `diff_editable_rows`, строка 335

Строка 340:

```python
added = [_diff_row(new[key]) for key in sorted(new.keys() - old.keys())]
```

Строка 341:

```python
removed = [_diff_row(old[key]) for key in sorted(old.keys() - new.keys())]
```

#### `_optional_decimal_to_csv_value`, строка 382

Строка 386:

```python
return prefix + value.replace(".", ",")
```

#### `_validate_headers`, строка 396

Строка 399:

```python
actual.count(header) > 1
```

#### `_validate_row`, строка 508

Строка 552:

```python
row.selection_allowance_mm is not None
```

Строка 553:

```python
row.selection_allowance_mm >= row.nominal_size_mm
```

Строка 558:

```python
row.lower_deviation_magnitude_mm is not None
```

Строка 559:

```python
row.lower_deviation_magnitude_mm >= row.thickness_mm
```

Строка 573:

```python
row.wall_thickness_mm * 2 >= row.outer_diameter_mm
```

Строка 593:

```python
expected = (row.wall_thickness_mm * percent / Decimal("100")).quantize(
                Decimal("0.001"), rounding=ROUND_HALF_UP
            )
```

Строка 515:

```python
Decimal(value) < 0
```

Строка 518:

```python
row.curvature_percent is not None
```

Строка 518:

```python
row.curvature_mm is not None
```

Строка 522:

```python
row.selection_allowance_mm is None
```

Строка 548:

```python
value <= 0
```

Строка 569:

```python
outer_minus >= row.outer_diameter_mm
```

Строка 571:

```python
wall_minus >= row.wall_thickness_mm
```

Строка 577:

```python
row.mass_per_meter_kg is not None
```

Строка 577:

```python
row.mass_per_meter_kg <= 0
```

Строка 523:

```python
row.curvature_percent is None
```

Строка 523:

```python
row.curvature_mm is None
```

Строка 526:

```python
row.lower_deviation_magnitude_mm is None
```

Строка 527:

```python
row.flatness_percent is None
```

### mvp/src/metall_mvp/domain/nsi/fixtures.py

[mvp/src/metall_mvp/domain/nsi/fixtures.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/fixtures.py)

#### `_contains_token_sequence`, строка 585

Строка 590:

```python
token_windows = (tokens[index : index + width] for index in range(len(tokens) - width + 1))
```

#### `resolve`, строка 606

Строка 613:

```python
len(matches) == 1
```

Строка 632:

```python
len(matches) > 1
```

### mvp/src/metall_mvp/domain/nsi/gost_8732_verified.py

[mvp/src/metall_mvp/domain/nsi/gost_8732_verified.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/gost_8732_verified.py)

#### `tube_matrix_rows`, строка 60

Строка 83:

```python
standard_count = sum(row.status == "standard" for row in result)
```

Строка 84:

```python
agreement_count = sum(row.status == "by_agreement_dash" for row in result)
```

Строка 90:

```python
len(diameters) != _EXPECTED_DIAMETER_COUNT
```

#### `tube_walls_for_diameter`, строка 108

Строка 110:

```python
row.outer_diameter_mm == d
```

#### `tube_outer_deviations_mm`, строка 114

Строка 118:

```python
deviation = (diameter * percent).quantize(Decimal("0.01"))
```

#### `tube_wall_deviations_mm`, строка 131

Строка 133:

```python
return (
        wall * lower_percent / Decimal("100"),
        wall * upper_percent / Decimal("100"),
    )
```

#### `_percent_display`, строка 146

Строка 147:

```python
value > 0
```

#### `tube_display_rows`, строка 159

Строка 166:

```python
inner <= 0
```

Строка 177:

```python
curvature is None
```

#### `_nominal_literal`, строка 218

Строка 220:

```python
Decimal(str(raw)) == nominal
```

#### `_enrich_non_tube_display_factory`, строка 225

Строка 242:

```python
mass = (Decimal("0.0061654") * nominal * nominal).quantize(Decimal("0.001"))
```

Строка 273:

```python
curvature is not None
```

Строка 246:

```python
mass = (Decimal("0.00785") * nominal * nominal).quantize(Decimal("0.001"))
```

Строка 250:

```python
mass = (Decimal("0.006798") * nominal * nominal).quantize(Decimal("0.001"))
```

Строка 254:

```python
mass = (Decimal("7.85") * nominal).quantize(Decimal("0.001"))
```

#### `_verified_tube_items`, строка 293

Строка 309:

```python
inner_lower = lower_d - Decimal("2") * upper_wall
```

Строка 310:

```python
inner_upper = upper_d - Decimal("2") * lower_wall
```

#### `install_verified_builtin_assortment`, строка 365

Строка 375:

```python
fixed_diameters = sorted(
        {Decimal(value) for value in builtin.TUBE_DIAMETERS_MM}
        | {Decimal("104.0"), Decimal("165.0")}
    )
```

Строка 379:

```python
builtin.TUBE_DIAMETERS_MM = [str(value.quantize(Decimal("0.1"))) for value in fixed_diameters]
```

#### `inner_diameter_mm`, строка 44

Строка 45:

```python
return self.outer_diameter_mm - Decimal("2") * self.wall_thickness_mm
```

#### `factory`, строка 229

Строка 242:

```python
mass = (Decimal("0.0061654") * nominal * nominal).quantize(Decimal("0.001"))
```

Строка 273:

```python
curvature is not None
```

Строка 246:

```python
mass = (Decimal("0.00785") * nominal * nominal).quantize(Decimal("0.001"))
```

Строка 250:

```python
mass = (Decimal("0.006798") * nominal * nominal).quantize(Decimal("0.001"))
```

Строка 254:

```python
mass = (Decimal("7.85") * nominal).quantize(Decimal("0.001"))
```

### mvp/src/metall_mvp/domain/nsi/linear_tolerance_rules.py

[mvp/src/metall_mvp/domain/nsi/linear_tolerance_rules.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/linear_tolerance_rules.py)

#### `_validate_document`, строка 21

Строка 31:

```python
value <= 0
```

#### `resolve_linear_tolerance`, строка 68

Строка 71:

```python
grade not in (9, 14)
```

Строка 74:

```python
low < nominal <= high
```

Строка 81:

```python
lower, upper = -width / 2, width / 2
```

### mvp/src/metall_mvp/domain/nsi/master_data.py

[mvp/src/metall_mvp/domain/nsi/master_data.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/master_data.py)

#### `validate_promotion_link`, строка 64

Строка 66:

```python
(links[0] is None) != (links[1] is None)
```

Строка 66:

```python
links[0] is None
```

Строка 66:

```python
links[1] is None
```

Строка 68:

```python
links[0] is None
```

#### `validate_range`, строка 215

Строка 217:

```python
self.nominal_min_mm is not None
```

Строка 218:

```python
self.nominal_max_mm is not None
```

Строка 219:

```python
self.nominal_max_mm < self.nominal_min_mm
```

Строка 222:

```python
self.lower_deviation_mm is None
```

Строка 222:

```python
self.upper_deviation_mm is None
```

Строка 230:

```python
self.related_nominal_min_mm is not None
```

Строка 231:

```python
self.related_nominal_max_mm is not None
```

Строка 232:

```python
self.related_nominal_max_mm < self.related_nominal_min_mm
```

#### `validate_match`, строка 339

Строка 342:

```python
(assortment_ref[0] is None) != (assortment_ref[1] is None)
```

Строка 344:

```python
(decision_ref[0] is None) != (decision_ref[1] is None)
```

Строка 342:

```python
assortment_ref[0] is None
```

Строка 342:

```python
assortment_ref[1] is None
```

Строка 344:

```python
decision_ref[0] is None
```

Строка 344:

```python
decision_ref[1] is None
```

### mvp/src/metall_mvp/domain/nsi/material_calculation_binding.py

[mvp/src/metall_mvp/domain/nsi/material_calculation_binding.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/material_calculation_binding.py)

#### `_range_fit`, строка 61

Строка 62:

```python
lower is None
```

Строка 62:

```python
upper is None
```

Строка 64:

```python
lower is not None
```

Строка 64:

```python
upper is not None
```

Строка 64:

```python
lower > upper
```

Строка 71:

```python
upper is not None
```

Строка 72:

```python
lo is not None
```

Строка 75:

```python
lower is not None
```

Строка 76:

```python
hi is not None
```

Строка 80:

```python
lower is None
```

Строка 81:

```python
upper is None
```

Строка 73:

```python
lo > upper
```

Строка 77:

```python
hi < lower
```

Строка 80:

```python
lo is not None
```

Строка 80:

```python
lo >= lower
```

Строка 81:

```python
hi is not None
```

Строка 81:

```python
hi <= upper
```

Строка 73:

```python
lo == upper
```

Строка 77:

```python
hi == lower
```

#### `bind_material_calculation`, строка 87

Строка 117:

```python
len(schemes) != 1
```

Строка 218:

```python
len(applicable) > 1
```

Строка 180:

```python
len(result.candidates) != 1
```

### mvp/src/metall_mvp/domain/nsi/material_catalog_extraction.py

[mvp/src/metall_mvp/domain/nsi/material_catalog_extraction.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/material_catalog_extraction.py)

#### `catalog_sync_metadata`, строка 44

Строка 57:

```python
age_days = max(0, (reference - parsed).days)
```

#### `_hardness_value`, строка 123

Строка 131:

```python
parsed <= 0
```

Строка 131:

```python
parsed > 1000
```

#### `build_catalog_output`, строка 149

Строка 236:

```python
reference - updated > timedelta(days=STALE_CARD_DAYS)
```

### mvp/src/metall_mvp/domain/nsi/material_evidence.py

[mvp/src/metall_mvp/domain/nsi/material_evidence.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/material_evidence.py)

#### `_evidence`, строка 95

Строка 103:

```python
lower is not None
```

Строка 103:

```python
upper is not None
```

Строка 103:

```python
lower > upper
```

Строка 100:

```python
lower is None
```

Строка 100:

```python
upper is None
```

#### `normalize_material_evidence`, строка 118

Строка 228:

```python
power is None
```

Строка 228:

```python
power != power.to_integral_value()
```

Строка 228:

```python
abs(power) > 100
```

Строка 231:

```python
number *= Decimal(10) ** int(power)
```

### mvp/src/metall_mvp/domain/nsi/material_extraction.py

[mvp/src/metall_mvp/domain/nsi/material_extraction.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/material_extraction.py)

#### `_parse_hardness_specs`, строка 190

Строка 191:

```python
specs: list[tuple[Decimal, Decimal | None]] = []
```

#### `validate_material_output`, строка 227

Строка 278:

```python
key = hashlib.sha256((candidate_namespace + kind).encode()).hexdigest()
```

#### `add`, строка 277

Строка 278:

```python
key = hashlib.sha256((candidate_namespace + kind).encode()).hexdigest()
```

### mvp/src/metall_mvp/domain/nsi/material_html.py

[mvp/src/metall_mvp/domain/nsi/material_html.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/material_html.py)

#### `__init__`, строка 9

Строка 12:

```python
self.hidden: str | None = None
```

### mvp/src/metall_mvp/domain/nsi/material_product_policy.py

[mvp/src/metall_mvp/domain/nsi/material_product_policy.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/material_product_policy.py)

#### `_forms_from_text`, строка 62

Строка 69:

```python
forms |= dict(_STANDARD_FORMS)[match.group(1)]
```

Строка 67:

```python
forms |= mapped
```

#### `delivery_blank_types`, строка 87

Строка 96:

```python
return frozenset(forms & CUSTOMER_ASSORTMENT_BLANK_TYPES)
```

Строка 91:

```python
forms |= _forms_from_text(option.category)
```

Строка 93:

```python
forms |= _forms_from_text(designation)
```

Строка 95:

```python
forms |= _forms_from_text(product_form)
```

### mvp/src/metall_mvp/domain/nsi/material_source_settings.py

[mvp/src/metall_mvp/domain/nsi/material_source_settings.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/material_source_settings.py)

#### `validate_public_url`, строка 43

Строка 49:

```python
parsed.port not in {None, 80, 443}
```

### mvp/src/metall_mvp/domain/nsi/material_sources.py

[mvp/src/metall_mvp/domain/nsi/material_sources.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/material_sources.py)

#### `parse_splav_material`, строка 329

Строка 499:

```python
warnings += ("Виды поставки не найдены в HTML-ответе.",)
```

Строка 501:

```python
warnings += ("Твёрдость не найдена в HTML-ответе.",)
```

Строка 358:

```python
len(row) >= 2
```

Строка 364:

```python
len(row) >= 2
```

Строка 361:

```python
len(row) >= 2
```

#### `parse_generic_material_html`, строка 505

Строка 657:

```python
warnings += ("Твёрдость не найдена в источнике.",)
```

Строка 531:

```python
len(row) >= 2
```

Строка 545:

```python
classification = lines[i + 1].strip()
```

Строка 544:

```python
i + 1 < len(lines)
```

Строка 544:

```python
len(lines[i + 1]) < 120
```

Строка 549:

```python
len(line) < 80
```

Строка 548:

```python
token in lower
```

#### `handle_starttag`, строка 127

Строка 136:

```python
self._cell_depth += 1
```

Строка 137:

```python
self._cell_depth == 1
```

#### `_finish_cell`, строка 158

Строка 159:

```python
self._cell_depth -= 1
```

Строка 160:

```python
self._cell_depth == 0
```

#### `acquire`, строка 683

Строка 713:

```python
source_uri = _SEARCH_URL + "?" + urlencode({"searchmat": clean_grade, "name_id": "0"})
```

Строка 688:

```python
len(clean_grade) > 40
```

#### `acquire`, строка 950

Строка 962:

```python
len(clean_grade) > 40
```

Строка 980:

```python
len(content) >= 200
```

#### `download_candidate`, строка 975

Строка 980:

```python
len(content) >= 200
```

### mvp/src/metall_mvp/domain/nsi/models.py

[mvp/src/metall_mvp/domain/nsi/models.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/models.py)

#### `validate_length_range`, строка 168

Строка 169:

```python
self.max_length_mm < self.min_length_mm
```

#### `validate_diameters`, строка 289

Строка 290:

```python
self.inner_diameter_mm >= self.outer_diameter_mm
```

#### `validate_size_series`, строка 304

Строка 313:

```python
bool(self.available_widths_mm) != bool(self.available_lengths_mm)
```

#### `validate_range`, строка 380

Строка 382:

```python
self.nominal_min_mm is not None
```

Строка 383:

```python
self.nominal_max_mm is not None
```

Строка 384:

```python
self.nominal_max_mm < self.nominal_min_mm
```

Строка 387:

```python
self.lower_deviation_mm is None
```

Строка 387:

```python
self.upper_deviation_mm is None
```

Строка 395:

```python
self.related_nominal_min_mm is not None
```

Строка 396:

```python
self.related_nominal_max_mm is not None
```

Строка 397:

```python
self.related_nominal_max_mm < self.related_nominal_min_mm
```

### mvp/src/metall_mvp/domain/nsi/runtime_bridge.py

[mvp/src/metall_mvp/domain/nsi/runtime_bridge.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/runtime_bridge.py)

#### `stock_item_from_assortment`, строка 29

Строка 43:

```python
material.stock_length_category is not None
```

Строка 48:

```python
rule.material_category == material.stock_length_category
```

### mvp/src/metall_mvp/domain/nsi/splav_material_runtime.py

[mvp/src/metall_mvp/domain/nsi/splav_material_runtime.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/splav_material_runtime.py)

#### `parse_splav_material_id`, строка 91

Строка 96:

```python
len(parts) == 3
```

#### `_scaled_to_decimal`, строка 251

Строка 265:

```python
return Decimal(str(number)) * (Decimal(10) ** power_int)
```

Строка 256:

```python
power is None
```

#### `splav_density_kg_m3`, строка 270

Строка 275:

```python
fallback: Decimal | None = None
```

Строка 283:

```python
value <= 0
```

#### `_to_decimal`, строка 342

Строка 349:

```python
result > 0
```

#### `_splav_hardness_options`, строка 376

Строка 387:

```python
value <= 0
```

#### `material_profile_from_splav_card`, строка 436

Строка 454:

```python
density is None
```

### mvp/src/metall_mvp/domain/nsi/splav_stock_runtime.py

[mvp/src/metall_mvp/domain/nsi/splav_stock_runtime.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/splav_stock_runtime.py)

#### `preview_snapshot`, строка 314

Строка 329:

```python
cached[0] == token
```

Строка 335:

```python
actual == cached[1]
```

Строка 353:

```python
len(self._previews) > 8
```

#### `build`, строка 357

Строка 395:

```python
len(prescribed_forms) == 1
```

### mvp/src/metall_mvp/domain/nsi/standard_form_scope.py

[mvp/src/metall_mvp/domain/nsi/standard_form_scope.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/standard_form_scope.py)

#### `assess_standard_form`, строка 10

Строка 18:

```python
entries = [
        {
            "designation": row["designation"],
            "title": row["title"],
            "forms": [
                "round_tube" if row["product_form"].value == "tube" else row["product_form"].value
            ],
            "source_url": OFFICIAL_REGISTRY_URLS[row["designation"]],
        }
        for row in STANDARD_DEFINITIONS
    ] + reference["entries"]
```

### mvp/src/metall_mvp/domain/nsi/stock_curvature.py

[mvp/src/metall_mvp/domain/nsi/stock_curvature.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/stock_curvature.py)

#### `stock_curvature_norm`, строка 40

Строка 78:

```python
wall_thickness_mm is None
```

#### `coefficient_per_mm`, строка 27

Строка 29:

```python
return self.value / divisor
```

### mvp/src/metall_mvp/domain/nsi/stock_formula_rules.py

[mvp/src/metall_mvp/domain/nsi/stock_formula_rules.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/stock_formula_rules.py)

#### `_bands`, строка 43

Строка 66:

```python
limit is not None
```

Строка 68:

```python
result[-1][1] is not None
```

Строка 58:

```python
value < 0
```

Строка 63:

```python
result[-1][1] is None
```

Строка 60:

```python
limit is not None
```

Строка 60:

```python
limit <= previous
```

#### `formula_rules_path`, строка 73

Строка 85:

```python
root = mvp_root / root
```

#### `validate_stock_formula_document`, строка 97

Строка 139:

```python
len(precision) > 32
```

#### `read_stock_formula_revision`, строка 177

Строка 178:

```python
len(sha256) != 64
```

#### `use_stock_formula_revision`, строка 202

Строка 215:

```python
len(sha) != 64
```

#### `band_deviation`, строка 272

Строка 277:

```python
return value if unit == "mm" else nominal * value / Decimal("100")
```

Строка 276:

```python
limit is None
```

Строка 276:

```python
nominal <= limit
```

### mvp/src/metall_mvp/domain/nsi/stock_selection_package.py

[mvp/src/metall_mvp/domain/nsi/stock_selection_package.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/stock_selection_package.py)

#### `_profile_path`, строка 30

Строка 31:

```python
relative = Path("library/nsi/stock_selection") / PROFILE_FILENAME
```

Строка 32:

```python
repository = Path(__file__).resolve().parents[5] / relative
```

Строка 33:

```python
return repository if repository.is_file() else Path(__file__).resolve().parents[2] / relative
```

#### `_row`, строка 42

Строка 56:

```python
stock.curvature_limit is not None
```

### mvp/src/metall_mvp/domain/nsi/tolerances.py

[mvp/src/metall_mvp/domain/nsi/tolerances.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/tolerances.py)

#### `same_designation`, строка 62

Строка 65:

```python
a == b
```

Строка 73:

```python
len(year_a) == 2
```

Строка 74:

```python
len(year_b) == 2
```

#### `_resolve_metric_thread_tolerance`, строка 113

Строка 143:

```python
ei = es - td
```

#### `_linear_fit`, строка 209

Строка 213:

```python
dim.nominal_value is None
```

#### `_resolved_linear_values`, строка 219

Строка 222:

```python
return {
        "status": "explicit",
        "standard_ref": resolution.standard_ref,
        "rule_id": resolution.rule_id,
        "citation_summary": resolution.citation,
        "lower_deviation": resolution.lower,
        "upper_deviation": resolution.upper,
        "lower_limit": nominal + resolution.lower,
        "upper_limit": nominal + resolution.upper,
        "target_median": nominal + (resolution.lower + resolution.upper) / 2,
        "tolerance_band": resolution.upper - resolution.lower,
        "calculation": ToleranceCalculation.model_validate(
            {
                "unit": "mm",
                "nominal": str(nominal),
                "table_sha256": RULESET_SHA256,
                "table_row": {
                    "over_mm": str(resolution.over_mm),
                    "through_mm": str(resolution.through_mm),
                    "it_grade": resolution.it_grade,
                    "width_mm": str(resolution.width_mm),
                },
                "zone": resolution.zone,
                "deviation_formula": {
                    "H": "lower = 0; upper = IT",
                    "h": "lower = -IT; upper = 0",
                    "symmetric": "lower = -IT/2; upper = IT/2",
                }[resolution.zone],
                "limit_formula": "limit = nominal + deviation",
                "median_formula": "target = (lower_limit + upper_limit)/2",
                "band_formula": "band = upper_limit - lower_limit",
            }
        ),
    }
```

#### `_match_general_tolerance`, строка 258

Строка 262:

```python
len(matched) == 1
```

Строка 264:

```python
len(matched) > 1
```

#### `plan_tolerances`, строка 269

Строка 301:

```python
dim.nominal_value is None
```

Строка 326:

```python
low = dim.lower_limit - dim.nominal_value if dim.lower_limit is not None else None
```

Строка 327:

```python
high = dim.upper_limit - dim.nominal_value if dim.upper_limit is not None else None
```

Строка 331:

```python
low < 0
```

Строка 373:

```python
ll = dim.nominal_value + low
```

Строка 374:

```python
ul = dim.nominal_value + high
```

Строка 326:

```python
dim.lower_limit is not None
```

Строка 327:

```python
dim.upper_limit is not None
```

Строка 333:

```python
high > 0
```

Строка 409:

```python
dim.nominal_value is not None
```

Строка 420:

```python
ll = dim.nominal_value + low
```

Строка 421:

```python
ul = dim.nominal_value + high
```

Строка 422:

```python
row = row.model_copy(
                    update={
                        "origin": "fit",
                        "status": "explicit",
                        "standard_ref": std_ref,
                        "tolerance_class": dim.fit_designation or "6g",
                        "lower_deviation": low,
                        "upper_deviation": high,
                        "lower_limit": ll,
                        "upper_limit": ul,
                        "target_median": (ll + ul) / Decimal("2"),
                        "tolerance_band": ul - ll,
                        "reason": desc,
                    }
                )
```

Строка 392:

```python
(low, high) != (fit_rule.lower, fit_rule.upper)
```

Строка 418:

```python
dim.nominal_value is not None
```

Строка 343:

```python
dim.lower_deviation is not None
```

Строка 346:

```python
dim.upper_deviation is not None
```

Строка 351:

```python
dim.lower_deviation is None
```

Строка 351:

```python
low == 0
```

Строка 352:

```python
dim.upper_deviation is None
```

Строка 352:

```python
high == 0
```

#### `enrich_passport_tolerances`, строка 618

Строка 638:

```python
target_median: Decimal | None = None
```

Строка 639:

```python
tolerance_band: Decimal | None = None
```

Строка 641:

```python
target_median = (row.lower_limit + row.upper_limit) / Decimal("2")
```

Строка 642:

```python
tolerance_band = row.upper_limit - row.lower_limit
```

Строка 640:

```python
row.lower_limit is not None
```

Строка 640:

```python
row.upper_limit is not None
```

Строка 648:

```python
target_median = dim.nominal_value + (
                row.lower_deviation + row.upper_deviation
            ) / Decimal("2")
```

Строка 651:

```python
tolerance_band = row.upper_deviation - row.lower_deviation
```

Строка 644:

```python
dim.nominal_value is not None
```

Строка 645:

```python
row.lower_deviation is not None
```

Строка 646:

```python
row.upper_deviation is not None
```

#### `_compute_median_and_band`, строка 178

Строка 179:

```python
self.lower_limit is not None
```

Строка 179:

```python
self.upper_limit is not None
```

### mvp/src/metall_mvp/domain/passport/physical_geometry.py

[mvp/src/metall_mvp/domain/passport/physical_geometry.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/passport/physical_geometry.py)

#### `non_surface_dimension_refs`, строка 7

Строка 37:

```python
return non_surface - surface - axial_lengths
```

Строка 32:

```python
d.id in axial_refs
```

Строка 33:

```python
d.id not in stock
```

#### `physical_geometry`, строка 40

Строка 47:

```python
d.id not in excluded
```

### mvp/src/metall_mvp/domain/passport/units.py

[mvp/src/metall_mvp/domain/passport/units.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/passport/units.py)

#### `convert_decimal`, строка 67

Строка 82:

```python
return Decimal(str(value)) * source_factor / target_factor
```

### mvp/src/metall_mvp/domain/recognition/autonomous_parts/mass.py

[mvp/src/metall_mvp/domain/recognition/autonomous_parts/mass.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/recognition/autonomous_parts/mass.py)

#### `literal_drawing_mass`, строка 21

Строка 48:

```python
value > 0
```

### mvp/src/metall_mvp/domain/recognition/models.py

[mvp/src/metall_mvp/domain/recognition/models.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/recognition/models.py)

#### `_validate_normalized_bbox`, строка 24

Строка 31:

```python
x0 = max(0.0, min(0.98, x0))
```

Строка 32:

```python
y0 = max(0.0, min(0.98, y0))
```

Строка 33:

```python
x1 = max(0.01, min(1.0, x1))
```

Строка 34:

```python
y1 = max(0.01, min(1.0, y1))
```

Строка 27:

```python
len(bbox) != 4
```

Строка 30:

```python
x0 < 0
```

Строка 30:

```python
y0 < 0
```

Строка 30:

```python
x1 > 1
```

Строка 30:

```python
y1 > 1
```

Строка 36:

```python
x0 + 0.02 <= 1.0
```

Строка 37:

```python
x1 = x0 + 0.02
```

Строка 39:

```python
x0 = max(0.0, x1 - 0.02)
```

Строка 41:

```python
y0 + 0.02 <= 1.0
```

Строка 42:

```python
y1 = y0 + 0.02
```

Строка 44:

```python
y0 = max(0.0, y1 - 0.02)
```

#### `_normalize_provider_bbox`, строка 48

Строка 56:

```python
maximum = max(coordinates, default=0.0)
```

Строка 65:

```python
return [coordinate / 1000.0 for coordinate in coordinates]
```

Строка 50:

```python
len(value) != 4
```

Строка 58:

```python
maximum <= 1.0
```

Строка 59:

```python
min(coordinates, default=0.0) < 0.0
```

Строка 60:

```python
maximum > 1000.0
```

Строка 61:

```python
coordinates[2] <= coordinates[0]
```

Строка 62:

```python
coordinates[3] <= coordinates[1]
```

#### `validate_source_bbox`, строка 176

Строка 184:

```python
x0 < 0
```

Строка 184:

```python
y0 < 0
```

#### `validate_polygon`, строка 190

Строка 191:

```python
len(polygon) < 3
```

Строка 194:

```python
x < 0
```

Строка 194:

```python
y < 0
```

Строка 194:

```python
x > 1
```

Строка 194:

```python
y > 1
```

### mvp/src/metall_mvp/domain/route_planning.py

[mvp/src/metall_mvp/domain/route_planning.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/route_planning.py)

#### `default_quantity`, строка 53

Строка 58:

```python
drawing.value >= 1
```

#### `nominal_round_mass_kg`, строка 124

Строка 129:

```python
section_m2 = NOMINAL_ROUND_MASS_PI * (diameter_mm / 1000) ** 2 / 4
```

Строка 130:

```python
return format(density_kg_m3 * section_m2 * (Decimal(length_mm) / 1000), "f")
```

#### `nominal_round_mass_unknowns`, строка 133

Строка 154:

```python
dimensions.inner_diameter_mm is not None
```

Строка 156:

```python
dimensions.diameter_mm is None
```

Строка 156:

```python
dimensions.diameter_mm <= 0
```

#### `preliminary_cut`, строка 204

Строка 229:

```python
length = base + 2 * row.face_allowance_mm
```

Строка 232:

```python
row.kerf_mm is None
```

Строка 216:

```python
diameter is not None
```

Строка 220:

```python
diameter is None
```

Строка 224:

```python
base <= 0
```

Строка 237:

```python
pieces = int(supply // (length + row.kerf_mm))
```

#### `preliminary_stock_masses`, строка 250

Строка 272:

```python
length is None
```

Строка 279:

```python
candidate.nominal_dimensions.diameter_mm is not None
```

Строка 274:

```python
length is None
```

Строка 274:

```python
length <= 0
```

Строка 278:

```python
length is not None
```

#### `route_blank_usable`, строка 449

Строка 457:

```python
option.cut_blank_length_mm is None
```

Строка 463:

```python
supply >= option.cut_blank_length_mm
```

#### `stamp_mass_condition`, строка 522

Строка 527:

```python
deviation = (final_mass_kg - stamp) / stamp
```

Строка 528:

```python
abs(deviation) <= STAMP_MASS_TOLERANCE
```

Строка 525:

```python
stamp <= 0
```

Строка 525:

```python
final_mass_kg is None
```

#### `legacy_stock_fingerprint`, строка 543

Строка 545:

```python
return hashlib.sha256(
        (passport.model_dump_json() + "\n" + preview.model_dump_json()).encode("utf-8")
    ).hexdigest()
```

#### `stock_fingerprint`, строка 550

Строка 552:

```python
return hashlib.sha256(
        (
            json.dumps(
                passport.model_dump(mode="json"),
                ensure_ascii=False,
                sort_keys=True,
                separators=(",", ":"),
            )
            + "\n"
            + json.dumps(
                preview.model_dump(mode="json"),
                ensure_ascii=False,
                sort_keys=True,
                separators=(",", ":"),
            )
        ).encode("utf-8")
    ).hexdigest()
```

#### `build_planning_input`, строка 588

Строка 636:

```python
option: RoundStockPlanningOption | None = None
```

Строка 724:

```python
quantity.value is None
```

Строка 714:

```python
drawing_quantity.value != quantity.value
```

Строка 675:

```python
assigned != option.candidate.nominal_dimensions.diameter_mm
```

Строка 717:

```python
drawing_quantity.value is not None
```

Строка 728:

```python
drawing_quantity.value is not None
```

Строка 729:

```python
drawing_quantity.value != quantity.value
```

#### `cutting_values`, строка 892

Строка 901:

```python
piece = base + cut.reserve_mm if base is not None else cut.piece_length_mm
```

Строка 911:

```python
available = (
        supply * cut.supply_bar_count
        if supply is not None and cut.supply_bar_count is not None
        else None
    )
```

Строка 909:

```python
consumed = quantity * piece + cut.cut_count * cut.kerf_mm + cut.end_waste_mm
```

Строка 904:

```python
quantity is not None
```

Строка 908:

```python
cut.end_waste_mm is not None
```

Строка 907:

```python
cut.kerf_mm is not None
```

#### `assess_cutting`, строка 919

Строка 927:

```python
cut.piece_length_mm != piece
```

#### `check_route_structure`, строка 949

Строка 955:

```python
len(states) != len(operations) + 1
```

Строка 958:

```python
op.output_state_id != states[index + 1]
```

#### `validate_proposal`, строка 964

Строка 978:

```python
features = {
        item.id
        for item in (
            *passport.features,
            *passport.dimensions,
            *passport.stock_prescriptions,
            *passport.views,
            *passport.local_reference_definitions,
        )
    } | {getattr(relation, "id", None) for relation in passport.geometry_relations} - {None}
```

Строка 989:

```python
conditions = list(inputs.conditions) + list(proposal.conditions)
```

Строка 1046:

```python
proposal.states[0].dimensions != blank.candidate.nominal_dimensions
```

### mvp/src/metall_mvp/domain/route_time.py

[mvp/src/metall_mvp/domain/route_time.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/route_time.py)

#### `shared_work_problems`, строка 159

Строка 165:

```python
len(components) != sum(len(op.components) for op in operations)
```

#### `work_totals`, строка 182

Строка 208:

```python
accounted = setup + unit * count if count is not None else None
```

Строка 210:

```python
return RouteTimeTotals(
        accounted_setup_minutes=setup,
        accounted_unit_minutes=unit,
        accounted_batch_minutes=accounted,
        missing=tuple(dict.fromkeys(problems)),
        total_batch_minutes=complete,
        total_unit_minutes=complete / count if complete is not None and count else None,
    )
```

Строка 206:

```python
count is None
```

Строка 208:

```python
count is not None
```

Строка 199:

```python
component.minutes is None
```

Строка 202:

```python
setup += component.minutes
```

Строка 204:

```python
unit += component.minutes
```

#### `honest_basis`, строка 28

Строка 39:

```python
self.minutes is None
```

Строка 37:

```python
self.minutes is not None
```

### mvp/src/metall_mvp/stock_fit_safety.py

[mvp/src/metall_mvp/stock_fit_safety.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/stock_fit_safety.py)

#### `confirmed_bound`, строка 40

Строка 49:

```python
raw_nominal is None
```

Строка 63:

```python
result = nominal + decimal_value(deviation, name=f"{side}_deviation")
```

Строка 66:

```python
limit is not None
```

Строка 64:

```python
limit is not None
```

#### `exact_lengths`, строка 96

Строка 102:

```python
row.available_length_mm is not None
```

#### `guaranteed_minimum`, строка 117

Строка 122:

```python
return nominal + lower
```

Строка 120:

```python
lower > ZERO
```

Строка 120:

```python
nominal + lower <= ZERO
```

#### `required_external`, строка 125

Строка 131:

```python
return nominal + upper + allowance
```

Строка 129:

```python
nominal + upper <= ZERO
```

#### `raw_inner_maximum`, строка 134

Строка 143:

```python
return outer + outer_plus - 2 * (wall + wall_minus)
```

Строка 141:

```python
wall * 2 >= outer
```

Строка 141:

```python
wall + wall_minus <= ZERO
```

### mvp/src/metall_mvp/tools/raster.py

[mvp/src/metall_mvp/tools/raster.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/tools/raster.py)

#### `_bounded_scale`, строка 36

Строка 39:

```python
by_dimension = SOURCE_RENDER_MAX_DIMENSION / max(width, height)
```

Строка 40:

```python
by_pixels = math.sqrt(SOURCE_RENDER_MAX_PIXELS / (width * height))
```

Строка 41:

```python
return min(requested, by_dimension, by_pixels)
```

Строка 37:

```python
width <= 0
```

Строка 37:

```python
height <= 0
```

Строка 37:

```python
requested <= 0
```

#### `_render_pdf`, строка 44

Строка 62:

```python
scale = _bounded_scale(width, height, PDF_RENDER_DPI / 72)
```

Строка 47:

```python
len(document) != 1
```

#### `_open_raster`, строка 72

Строка 81:

```python
scale < 1
```

Строка 82:

```python
size = (max(1, round(image.width * scale)), max(1, round(image.height * scale)))
```

#### `_whole_page`, строка 88

Строка 89:

```python
scale = min(1.0, WHOLE_PAGE_MAX_DIMENSION / max(image.size))
```

Строка 92:

```python
size = (max(1, round(image.width * scale)), max(1, round(image.height * scale)))
```

Строка 90:

```python
scale == 1
```

#### `_validate_bbox`, строка 149

Строка 150:

```python
len(bbox) != 4
```

Строка 155:

```python
x0 < 0
```

Строка 155:

```python
y0 < 0
```

Строка 155:

```python
x1 > 1
```

Строка 155:

```python
y1 > 1
```

#### `_expand_bbox`, строка 160

Строка 164:

```python
margin_x = (x1 - x0) * margin_ratio
```

Строка 165:

```python
margin_y = (y1 - y0) * margin_ratio
```

Строка 166:

```python
return (
        max(0.0, x0 - margin_x),
        max(0.0, y0 - margin_y),
        min(1.0, x1 + margin_x),
        min(1.0, y1 + margin_y),
    )
```

Строка 161:

```python
margin_ratio < 0
```

Строка 161:

```python
margin_ratio > 0.5
```

#### `crop_source_render`, строка 174

Строка 189:

```python
pixel_bbox = (
            max(0, math.floor(x0 * image.width)),
            max(0, math.floor(y0 * image.height)),
            min(image.width, math.ceil(x1 * image.width)),
            min(image.height, math.ceil(y1 * image.height)),
        )
```

### mvp/src/metall_mvp/workflows/accepted_estimate.py

[mvp/src/metall_mvp/workflows/accepted_estimate.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/accepted_estimate.py)

#### `material_from_operations`, строка 49

Строка 97:

```python
density.value is None
```

#### `calculate_estimate`, строка 115

Строка 232:

```python
values["conditions"] += (
        "Себестоимость изготовления в RUB; НДС, прибыль и продажная цена не рассчитываются",
        "Ставка включает труд, оборудование, накладные и расходные материалы; применяется ко всему времени операции",
        "Каждая строка округляется до копейки ROUND_HALF_UP, итог партии равен сумме строк; на деталь делится итог партии",
    )
```

Строка 123:

```python
(rate.machine_id, rate.machine_sha256) != expected
```

Строка 136:

```python
loss = Decimal(plan.end_loss_total_mm) + Decimal(plan.additional_loss_mm)
```

Строка 180:

```python
minutes += c.minutes * multiplier
```

Строка 184:

```python
raw = minutes * rate / 60
```

Строка 185:

```python
index == 0
```

Строка 187:

```python
raw = kg * price if kg is not None and price is not None else None
```

Строка 135:

```python
plan.end_loss_total_mm is not None
```

Строка 135:

```python
plan.additional_loss_mm is not None
```

Строка 181:

```python
minutes is not None
```

Строка 183:

```python
rate is not None
```

Строка 177:

```python
c.minutes is None
```

Строка 177:

```python
minutes is None
```

Строка 187:

```python
price is not None
```

#### `save`, строка 297

Строка 386:

```python
return revision + 1, False
```

Строка 356:

```python
record = AcceptedEstimateRecord(
                source=source,
                intent=intent,
                revision=revision + 1,
                command=command,
                actor=actor,
                created_at=datetime.now(UTC),
                time=time,
                **calculate_estimate(time, original.packet.basis, command.economics),
            )
```

### mvp/src/metall_mvp/workflows/automatic_compact_time.py

[mvp/src/metall_mvp/workflows/automatic_compact_time.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/automatic_compact_time.py)

#### `process_families`, строка 53

Строка 55:

```python
text = (str(kind) + " " + str(equipment)).casefold()
```

#### `_positive`, строка 126

Строка 131:

```python
result > 0
```

#### `size_context`, строка 134

Строка 144:

```python
diameter is None
```

Строка 146:

```python
diameter = (
            finished + 2 * D(envelope["radial_allowance_mm"])
            if finished is not None
            else D(envelope["diameter_default_mm"])
        )
```

Строка 159:

```python
length is None
```

Строка 161:

```python
length = (
            finished + 2 * D(envelope["face_allowance_mm"])
            if finished is not None
            else D(envelope["length_default_mm"])
        )
```

Строка 176:

```python
mass is None
```

Строка 179:

```python
mass = (
                D("3.1415926535897932384626433832795028841971693993751")
                * diameter
                * diameter
                * length
                / 4
                * D(envelope["density_kg_per_mm3"])
            )
```

#### `_legacy_automatic_forecast`, строка 238

Строка 594:

```python
row["automatic_time_ms"] = round((perf_counter() - operation_started) * 1000, 3)
```

Строка 334:

```python
base = (
                    sum((entry[0] for entry in ranges), D(0))
                    if role != "inspection"
                    else max(entry[0] for entry in ranges)
                )
```

Строка 339:

```python
upper = (
                    sum((entry[1] for entry in ranges), D(0))
                    if role != "inspection"
                    else max(entry[1] for entry in ranges)
                )
```

Строка 409:

```python
cache: dict[str, Any] | None = row.get("automatic_machining_cache")
```

Строка 462:

```python
returns = sum(
                    item.get("movement_kind") == "return"
                    for seq in residual.get("calculation_evidence", {}).get("pass_sequences", [])
                    for item in seq.get("passes", [])
                )
```

Строка 467:

```python
counted_thread_returns = sum(
                    (entry.get("response") or {}).get("method") == "turning.thread.constant-n/1"
                    and (entry.get("response") or {})
                    .get("metrics", {})
                    .get("cycle_time_min", {})
                    .get("state")
                    == "known"
                    for entry in residual.get("calculations", [])
                )
```

Строка 476:

```python
returns = max(0, returns - counted_thread_returns)
```

Строка 477:

```python
events = max(1, returns)
```

Строка 478:

```python
base += D(catalog.data["noncutting"]["return_minutes_base"]) * events
```

Строка 479:

```python
upper += D(catalog.data["noncutting"]["return_minutes_upper"]) * events
```

Строка 507:

```python
base += low
```

Строка 508:

```python
upper += high
```

Строка 345:

```python
len(stations) > 1
```

Строка 346:

```python
assumptions += (
                        TimeAssumption(
                            parameter="service_stations",
                            chosen=", ".join(stations),
                            reason="Distinct machining stations each require setup and handling; drilling on a lathe/mill is not counted as another station. Inspection uses the largest station budget once.",
                            source=catalog.data["source"],
                        ),
                    )
```

Строка 452:

```python
base += D(component["base"]["minutes"])
```

Строка 453:

```python
upper += D(component["upper"]["minutes"])
```

Строка 558:

```python
base += low
```

Строка 559:

```python
upper += high
```

Строка 541:

```python
value.quantity is None
```

Строка 544:

```python
base += low / value.quantity
```

Строка 545:

```python
upper += high / value.quantity
```

Строка 550:

```python
value.quantity is not None
```

#### `recalculate_automatic_time`, строка 602

Строка 641:

```python
return store.save(
            pending.model_copy(
                update={
                    "status": value.status,
                    "calculation_pending": False,
                    "time_estimate": forecast,
                    "details": rows,
                    "timings_ms": {
                        **pending.timings_ms,
                        "automatic_time": round((perf_counter() - started) * 1000, 3),
                    },
                }
            ),
            pending.revision,
            actor,
        )
```

### mvp/src/metall_mvp/workflows/compact_estimation.py

[mvp/src/metall_mvp/workflows/compact_estimation.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/compact_estimation.py)

#### `pin_settings`, строка 170

Строка 195:

```python
len(found) != 1
```

#### `_scope_values`, строка 219

Строка 220:

```python
values: dict[str, Decimal | EvidenceValue | None] = {
        key: EvidenceValue.model_validate(number.model_dump())
        for key, number in operands.items()
        if number.value is not None
    }
```

Строка 240:

```python
values["depth_to_diameter"] = plan.work_length_mm / diameter
```

Строка 239:

```python
plan.work_length_mm is not None
```

#### `apply_decisions`, строка 259

Строка 266:

```python
int(match[1]) != detail.operation_index
```

Строка 268:

```python
int(match[2]) >= len(passes)
```

Строка 268:

```python
match[3] not in RoundOperands.model_fields
```

#### `prepare_operation`, строка 277

Строка 442:

```python
application: dict[str, Any] | None = None
```

Строка 782:

```python
plan_index = len(detail.local_pass_plans) + target_index
```

Строка 336:

```python
len({(p.material_group, p.material_state) for p in baselines}) > 1
```

Строка 348:

```python
addressed[0].profile_pin is not None
```

Строка 457:

```python
len(choices) != 1
```

Строка 619:

```python
updates["ap_max_mm"] = (
                    min(data.ap_max_mm, depth.value) if data.ap_max_mm is not None else depth.value
                )
```

Строка 666:

```python
allowed = legacy[item.method_id] | {
                    "cutting_speed_m_per_min",
                    "feed_mm_per_rev",
                    "entering_angle_deg",
                    "rake_angle_deg",
                    "efficiency_ratio",
                    "kc11_n_per_mm2",
                    "mc",
                }
```

Строка 683:

```python
allowed = (
                    common
                    | {
                        "turning.boring.constant-n/1": {
                            "initial_bore_diameter_mm",
                            "final_bore_diameter_mm",
                            "contact_length_mm",
                            "outer_diameter_mm",
                            "entering_angle_deg",
                            "rake_angle_deg",
                            "efficiency_ratio",
                            "kc11_n_per_mm2",
                            "mc",
                        },
                        "drilling.axial.constant-n/1": {
                            "diameter_mm",
                            "material_depth_mm",
                            "tip_angle_deg",
                            "breakthrough_extra_mm",
                        },
                        "turning.grooving.constant-n/1": {
                            "outer_diameter_mm",
                            "inner_diameter_mm",
                            "tool_width_mm",
                            "newly_removed_width_mm",
                        },
                        "turning.thread.constant-n/1": {
                            "thread_pitch_mm",
                            "nominal_diameter_mm",
                            "return_travel_mm",
                            "return_feed_mm_per_min",
                        },
                    }[item.method_id]
                )
```

Строка 618:

```python
depth is not None
```

Строка 618:

```python
depth.value is not None
```

Строка 558:

```python
operands.spindle_rpm is not None
```

Строка 559:

```python
operands.spindle_rpm.value is not None
```

Строка 620:

```python
data.ap_max_mm is not None
```

Строка 754:

```python
position + 1 < len(sequence.passes)
```

Строка 755:

```python
sequence.passes[position + 1].movement_kind == "return"
```

#### `apply_time_profiles`, строка 837

Строка 857:

```python
keys = {
            plan.work_key or f"operation:{detail.operation_index}:local:{index}"
            for index, plan in enumerate(detail.local_pass_plans)
        } | {target.work_key for target in detail.manual_pass_targets}
```

Строка 882:

```python
len(candidates) > 1
```

Строка 847:

```python
len(classes) == 1
```

Строка 867:

```python
count += getattr(target, field)
```

Строка 897:

```python
detail.setup_minutes_per_batch is None
```

Строка 939:

```python
detail.auxiliary_minutes_per_part is None
```

Строка 913:

```python
total += number.value
```

Строка 917:

```python
total += number.value * count
```

Строка 925:

```python
total += number.value * count
```

Строка 918:

```python
count > 0
```

Строка 926:

```python
count > 0
```

#### `refresh_rates`, строка 951

Строка 971:

```python
len(candidates) > 1
```

#### `refresh_legacy_quantity`, строка 987

Строка 1009:

```python
old_cost is not None
```

Строка 1016:

```python
batch = Decimal(str(per_piece)) * value.quantity + Decimal(str(setup))
```

Строка 1013:

```python
value.quantity is None
```

Строка 1019:

```python
row["cost"] = {
                    **old_cost,
                    "amount": str(batch * Decimal(str(old_cost["hourly_rate"])) / 60),
                }
```

#### `legacy_estimate_projection`, строка 1027

Строка 1033:

```python
cost is None
```

Строка 1037:

```python
totals[key] = totals.get(key, Decimal(0)) + Decimal(cost["amount"])
```

#### `load_summary`, строка 1048

Строка 1078:

```python
return {
        "maximum_known_model_drive_power_kw": str(max(known_powers)) if known_powers else None,
        "known_energy_kwh": str(known_energy) if energy_intervals else None,
        "energy_kwh": str(known_energy) if all_energy else None,
        "peak_load_state": "unverified",
        "energy_scope": "Modelled cutting/engagement intervals; auxiliary and idle energy are excluded",
        "limitations": limitations,
    }
```

Строка 1068:

```python
known_energy += number * Decimal(str(time["value"])) / 60
```

Строка 1069:

```python
energy_intervals += 1
```

#### `_head_cut_time`, строка 1099

Строка 1130:

```python
len(matches) == 1
```

#### `_stock_batch_time_items`, строка 1133

Строка 1218:

```python
loading_minutes = (
        loading.value * count
        if loading and loading.value is not None and count is not None
        else None
    )
```

Строка 1160:

```python
len(auxiliary) > 1
```

Строка 1215:

```python
count = sum(event["count"] for event in loads)
```

Строка 1238:

```python
minutes = match[0] * count if match and valid_count else None
```

Строка 1147:

```python
value.quantity is not None
```

Строка 1156:

```python
len(saw_rows) == 1
```

Строка 1220:

```python
count is not None
```

Строка 1237:

```python
type(count) is int
```

Строка 1237:

```python
count > 0
```

Строка 1182:

```python
minutes is not None
```

#### `cost_inputs`, строка 1251

Строка 1478:

```python
item.reason = disposition.reason + "; " + disposition.source
```

#### `_manual_estimate_lines`, строка 1485

Строка 1514:

```python
line.minutes is None
```

Строка 1492:

```python
line.minutes is not None
```

Строка 1509:

```python
line.minutes is not None
```

Строка 1509:

```python
line.minutes < floor
```

#### `build_cost_snapshot`, строка 1540

Строка 1544:

```python
machine_rates is not None
```

Строка 1551:

```python
machine_rates is not None
```

Строка 1598:

```python
item.reason = disposition.reason + "; " + disposition.source
```

Строка 1627:

```python
machine_rates is not None
```

Строка 1578:

```python
line.source = (line.source + "; " + rate["source"]).strip("; ")
```

Строка 1602:

```python
line.minutes is not None
```

Строка 1568:

```python
line.hourly_rate is None
```

Строка 1569:

```python
line.unit_price is None
```

Строка 1571:

```python
line.minutes is not None
```

#### `choose`, строка 412

Строка 442:

```python
application: dict[str, Any] | None = None
```

Строка 457:

```python
len(choices) != 1
```

#### `prepare_manual`, строка 535

Строка 558:

```python
operands.spindle_rpm is not None
```

Строка 559:

```python
operands.spindle_rpm.value is not None
```

#### `event_count`, строка 853

Строка 857:

```python
keys = {
            plan.work_key or f"operation:{detail.operation_index}:local:{index}"
            for index, plan in enumerate(detail.local_pass_plans)
        } | {target.work_key for target in detail.manual_pass_targets}
```

Строка 867:

```python
count += getattr(target, field)
```

#### `add`, строка 1165

Строка 1182:

```python
minutes is not None
```

### mvp/src/metall_mvp/workflows/compact_regime_proposals.py

[mvp/src/metall_mvp/workflows/compact_regime_proposals.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/compact_regime_proposals.py)

#### `proposed_material_baseline`, строка 48

Строка 65:

```python
len(identities) == 1
```

### mvp/src/metall_mvp/workflows/compact_round.py

[mvp/src/metall_mvp/workflows/compact_round.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/compact_round.py)

#### `stock_selection`, строка 262

Строка 302:

```python
required = basis.diameter_mm + basis.diameter_upper_deviation_mm
```

Строка 306:

```python
length = basis.length_mm + basis.length_upper_deviation_mm
```

Строка 395:

```python
cut_count = int(row.size.available_length_mm // (useful_length + norm.kerf_mm))
```

Строка 303:

```python
minimum_stock_diameter_mm is not None
```

Строка 304:

```python
required = max(required, minimum_stock_diameter_mm)
```

Строка 316:

```python
cut_length = length + 2 * norm.face_allowance_mm
```

Строка 360:

```python
basis.prescribed_diameter_mm is not None
```

Строка 361:

```python
row.size.diameter_mm != basis.prescribed_diameter_mm
```

Строка 313:

```python
norm.kerf_mm is None
```

Строка 327:

```python
candidate.guaranteed_section_mm is not None
```

Строка 328:

```python
option.required_stock_min_diameter_mm is not None
```

Строка 329:

```python
candidate.guaranteed_section_mm > option.required_stock_min_diameter_mm
```

Строка 333:

```python
row.size.available_length_mm >= cut_length + norm.kerf_mm
```

Строка 380:

```python
option.candidate.guaranteed_section_mm is not None
```

Строка 381:

```python
option.curvature_diameter_deduction_mm is not None
```

#### `enrich`, строка 408

Строка 499:

```python
area_m2 = NOMINAL_ROUND_MASS_PI * (Decimal(selected["diameter_mm"]) / 1000) ** 2 / 4
```

Строка 507:

```python
selected[key] = str(
                        area_m2
                        * Decimal(selected[length_key])
                        / 1000
                        * profile.physical.density_kg_m3
                    )
```

Строка 504:

```python
selected.get(length_key) is None
```

#### `elapsed_timings`, строка 619

Строка 621:

```python
timings[stage] = round(max(0, perf_counter() - started) * 1000, 3)
```

#### `generate_route`, строка 625

Строка 651:

```python
return store.save(
        value.model_copy(
            update={
                "status": "review",
                "route": route,
                "route_revision": value.revision + 1,
                "quantity_review": None,
                "timings_ms": elapsed_timings(
                    value,
                    "planning",
                    started,
                    discard=(
                        "detailing",
                        "arithmetic",
                        "calculator",
                        "local_planning",
                        "work_time",
                    ),
                ),
                "details": [],
                "calculation_inputs": [],
                "calculation_pending": False,
                "estimate": {},
                "cost_estimate": None,
                "time_estimate": None,
                "stock_proposal": None,
                "confirmation": None,
                "remarks": [*value.remarks, comment] if comment else value.remarks,
                "evidence": [*value.evidence, artifact],
            }
        ),
        value.revision,
    )
```

#### `apply_verification`, строка 686

Строка 734:

```python
basis_fields = set(data["round_basis"]) - {"limitations"}
```

Строка 770:

```python
len(parts) == 1
```

Строка 770:

```python
parts[0] in scalars
```

Строка 775:

```python
len(parts) == 2
```

Строка 782:

```python
len(parts) == 2
```

Строка 782:

```python
parts[0] in cells
```

Строка 785:

```python
len(parts) == 2
```

Строка 785:

```python
parts[1] in basis_fields
```

Строка 789:

```python
len(parts) == 2
```

Строка 797:

```python
len(parts) == 3
```

Строка 816:

```python
label = f"{'Размер' if parts[0] == 'dimensions' else 'Требование'} {index + 1} · {labels[parts[2]]}"
```

Строка 806:

```python
len(parts) == 3
```

Строка 808:

```python
parts[1] != str(index)
```

Строка 813:

```python
parts[2] not in allowed
```

Строка 810:

```python
index >= len(data[parts[0]])
```

#### `verify_reading`, строка 896

Строка 902:

```python
inputs["code_workspace"]["root"] = str(
        store.runtime.artifacts.root / value.source_run_id / "compact_verification"
    )
```

Строка 918:

```python
return store.save(
        value.model_copy(
            update={
                "reading": reading,
                "reading_revision": value.revision + 1,
                "verification": review,
                "verification_changes": changes,
                "timings_ms": elapsed_timings(value, "verification", started),
                "status": "preliminary",
                "evidence": [*value.evidence, artifact],
            }
        ),
        value.revision,
    )
```

#### `prepare_reading_source`, строка 934

Строка 964:

```python
context = {
        "document_source": inspected.raw_result,
        "python_executable": sys.executable,
        "code_workspace": {
            "root": str(runtime.artifacts.root / source / "compact_reading"),
            "files": {},
            "artifact_files": {"drawing_full.png": prepared.artifact_ids[0]},
            "collect": [],
        },
        "cli_tools": ["read_files", "view_images", "execute_commands"],
    }
```

#### `read_and_plan`, строка 1013

Строка 1068:

```python
value = store.save(
                value.model_copy(
                    update={
                        "reading": reading,
                        "reading_revision": value.revision + 1,
                        "status": "checking",
                        "timings_ms": elapsed_timings(value, "reading", started),
                        "evidence": [artifact],
                    }
                ),
                value.revision,
            )
```

#### `minute_value`, строка 1216

Строка 1219:

```python
value.value < 0
```

#### `_pin_work_scopes`, строка 1293

Строка 1299:

```python
0 <= detail.operation_index < len(value.route.operations)
```

#### `calculate_saved_details`, строка 1313

Строка 1328:

```python
quantity_detail_artifact is not None
```

#### `calculate_details`, строка 1377

Строка 1424:

```python
planning_ms += (perf_counter() - planning_started) * 1000
```

Строка 1505:

```python
times: list[Decimal | None] = []
```

Строка 1477:

```python
required_stock = max(required_stock or Decimal(0), needed)
```

Строка 1556:

```python
row["known_machine_minutes_per_part"] = str(
                sum((t for t in times if t is not None), Decimal(0))
            )
```

Строка 1565:

```python
machine = sum((t for t in times if t is not None), Decimal(0))
```

Строка 1583:

```python
len(rates) == 1
```

Строка 1586:

```python
row["cost"] = {
                **rates[0],
                "amount": str(
                    Decimal(row["batch_minutes"]) / 60 * Decimal(str(rates[0]["hourly_rate"]))
                ),
            }
```

Строка 1574:

```python
total = machine + auxiliary
```

Строка 1585:

```python
len(rates) == 1
```

Строка 1450:

```python
requirement.value <= 0
```

Строка 1475:

```python
needed = max(needed or Decimal(0), number.value)
```

Строка 1528:

```python
calculator_ms += (perf_counter() - calculator_started) * 1000
```

Строка 1577:

```python
row["batch_minutes"] = str(total * value.quantity + setup)
```

Строка 1581:

```python
(basis := legacy_card_rate(card, detail.machine_id)) is not None
```

Строка 1472:

```python
selected_nominal is not None
```

Строка 1473:

```python
number.value > selected_nominal
```

Строка 1517:

```python
selected_nominal is not None
```

Строка 1576:

```python
value.quantity is not None
```

Строка 1519:

```python
diameter is None
```

Строка 1519:

```python
diameter.value != selected_nominal
```

#### `save`, строка 116

Строка 120:

```python
value = value.model_copy(update={"revision": expected + 1})
```

Строка 130:

```python
(current or 0) != expected
```

#### `claim`, строка 142

Строка 166:

```python
value.quantity_review is not None
```

### mvp/src/metall_mvp/workflows/cutting_calculation.py

[mvp/src/metall_mvp/workflows/cutting_calculation.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/cutting_calculation.py)

#### `validate_response`, строка 49

Строка 100:

```python
len(separation) != 1
```

Строка 104:

```python
len(items) != 1
```

Строка 82:

```python
count is not None
```

Строка 82:

```python
type(count) is not int
```

Строка 82:

```python
count < 0
```

### mvp/src/metall_mvp/workflows/d001_estimate.py

[mvp/src/metall_mvp/workflows/d001_estimate.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/d001_estimate.py)

#### `material_snapshot`, строка 58

Строка 90:

```python
density = evidence(
            basis.material_basis.density_kg_m3,
            "kg/m3",
            basis.material_basis.source,
            basis="reference",
            rationale=basis.material_basis.version + "; " + basis.material_basis.relation,
        )
```

Строка 124:

```python
density.value is not None
```

#### `procurement`, строка 189

Строка 211:

```python
paid = evidence(
                unit * q if q is not None else None,
                "kg",
                inputs.paid_kg_per_unit.source,
                rationale=method,
            )
```

Строка 226:

```python
paid = evidence(
                unit * q if unit is not None and q is not None else None,
                "kg",
                "Масса технологического отрезка",
                rationale=method,
            )
```

Строка 249:

```python
capacity = int((s - end) // (cut_length + k)) if cut_length > 0 and s > end else 0
```

Строка 221:

```python
unit = (
                    unit * (cut_length + k) / cut_length
                    if unit is not None and cut_length and k is not None
                    else None
                )
```

Строка 250:

```python
capacity > 0
```

Строка 251:

```python
count = (q + capacity - 1) // capacity
```

Строка 254:

```python
gross = mass * count
```

Строка 243:

```python
cut_length is not None
```

Строка 247:

```python
mass is not None
```

Строка 249:

```python
cut_length > 0
```

Строка 262:

```python
reusable = max(
                        Decimal(0), gross - mass / s * (count * end + q * (cut_length + k))
                    )
```

Строка 275:

```python
paid = evidence(
                        gross - credit,
                        "kg",
                        inputs.credited_kg_per_batch.source,
                        rationale=method + "; явный зачёт остатка",
                    )
```

#### `costs_for_operations`, строка 314

Строка 402:

```python
accounted = sum(
        (Decimal(line.rub_per_batch) for line in lines if line.rub_per_batch is not None),
        Decimal(0),
    )
```

Строка 407:

```python
return dict(
        lines=tuple(lines),
        missing=tuple(dict.fromkeys(missing)),
        conditions=tuple(dict.fromkeys(conditions)),
        status="partial" if missing else "sufficient",
        accounted_rub_per_batch=format(accounted, "f"),
        total_rub_per_batch=format(total, "f") if total is not None else None,
        total_rub_per_unit=format(money(total / q), "f") if total is not None and q else None,
    )
```

Строка 332:

```python
price is None
```

Строка 352:

```python
rate is None
```

Строка 352:

```python
rate.value is None
```

Строка 339:

```python
price is not None
```

#### `save_estimate`, строка 455

Строка 487:

```python
revision = old.revision + 1 if old else 1
```

### mvp/src/metall_mvp/workflows/d001_time.py

[mvp/src/metall_mvp/workflows/d001_time.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/d001_time.py)

#### `assemble`, строка 26

Строка 36:

```python
quantity is None
```

#### `recipe_component`, строка 114

Строка 197:

```python
return TimeComponent(
        component_id=recipe.component_id,
        title=recipe.title,
        scope=recipe.scope,
        minutes=minutes,
        basis=basis,
        source=source,
        rationale=recipe.method + ": " + recipe.rationale,
        **context,
    )
```

Строка 125:

```python
return TimeComponent(
            component_id=recipe.component_id,
            title=recipe.title,
            scope=recipe.scope,
            applicability="not_applicable" if recipe.method == "not_applicable" else "required",
            source=recipe.included_in or "",
            rationale=recipe.rationale
            + ("; включено в " + recipe.included_in if recipe.included_in else ""),
            **context,
        )
```

Строка 170:

```python
len(expected) == 1
```

Строка 176:

```python
minutes = numerator / denominator
```

Строка 174:

```python
denominator <= 0
```

Строка 182:

```python
len(expected) > 1
```

#### `calculate`, строка 209

Строка 216:

```python
all_recipes = {
        op.operation_id + "/" + c.component_id: c for op in draft.operations for c in op.components
    }
```

Строка 219:

```python
len(all_recipes) != sum(len(op.components) for op in draft.operations)
```

Строка 267:

```python
gaps = sorted(required - covered)
```

#### `save_time`, строка 301

Строка 340:

```python
value = D001TimeRevision(
        cycle_id=record.cycle_id,
        basis=record.route_basis,
        revision=old.revision + 1 if old else 1,
        previous_revision=old.revision if old else None,
        time_basis=D001TimeBasis(
            route=record.route_basis,
            quantity=basis.quantity,
            operation_ids=tuple(t.operation_id for t in basis.route.operations),
            uncovered_requirements=tuple(
                i.requirement.text for i in basis.route.unassigned_requirements
            ),
            dependencies=(
                DependencyRef(
                    kind="operations",
                    ref=str(basis.operations_revision),
                    fingerprint=basis.operations_sha256,
                ),
            ),
        ),
        operations=operations,
        status="partial" if missing else "sufficient",
        missing=missing,
        actor=command.actor,
        reason=command.reason,
        created_at=datetime.now(UTC),
        evidence=evidence,
    )
```

#### `finish_time`, строка 401

Строка 418:

```python
result = coordinator.drafts.republish(
            source,
            owner,
            publication_id=owner,
            expected_revision=execution.expected_revision + 1,
            actor=record.actor,
            reason="Cycle exact time publication",
            advance_head=False,
        )
```

Строка 441:

```python
candidate = old.model_copy(
            update={
                "revision": old.revision + 1,
                "execution_state": "queued" if completed else "failed",
                "result_status": "partial" if completed else old.result_status,
                "usage": usage,
                "stages": (
                    *replace_stage(
                        old,
                        execution_state="completed" if completed else "failed",
                        result_status=value.status if completed and value else "absent",
                        reason="Time saved; deterministic estimate follows"
                        if completed
                        else error or str(execution.error if execution else "No time execution"),
                    ),
                    *(
                        (
                            CycleStage(
                                stage_key="estimate",
                                execution_state="queued",
                                result_status="absent",
                                attempt_no=1,
                                reason="Deterministic estimate; no model dispatch",
                            ),
                        )
                        if completed
                        else ()
                    ),
                ),
            }
        )
```

#### `apply`, строка 440

Строка 441:

```python
candidate = old.model_copy(
            update={
                "revision": old.revision + 1,
                "execution_state": "queued" if completed else "failed",
                "result_status": "partial" if completed else old.result_status,
                "usage": usage,
                "stages": (
                    *replace_stage(
                        old,
                        execution_state="completed" if completed else "failed",
                        result_status=value.status if completed and value else "absent",
                        reason="Time saved; deterministic estimate follows"
                        if completed
                        else error or str(execution.error if execution else "No time execution"),
                    ),
                    *(
                        (
                            CycleStage(
                                stage_key="estimate",
                                execution_state="queued",
                                result_status="absent",
                                attempt_no=1,
                                reason="Deterministic estimate; no model dispatch",
                            ),
                        )
                        if completed
                        else ()
                    ),
                ),
            }
        )
```

### mvp/src/metall_mvp/workflows/engineering_view.py

[mvp/src/metall_mvp/workflows/engineering_view.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/engineering_view.py)

#### `unknown_auxiliary`, строка 28

Строка 43:

```python
kind, _, position = ref[len(op) + 1 :].partition("/")
```

#### `readable`, строка 143

Строка 150:

```python
text = text.replace(f"{task.operation_id}/{key}/{index}", task.title + ": " + title)
```

#### `present_row`, строка 160

Строка 239:

```python
calculation_summary = tuple(
        f"Проход {i + 1}: {labels[key.rsplit('/', 1)[-1]]} — {value['value'] if value['value'] is not None else 'не установлено'} {UNITS.get(value['unit'], value['unit'])}"
        for i, regime in enumerate(regimes)
        for key, value in regime.get("operands", {}).items()
        if key.rsplit("/", 1)[-1] in labels and value["value"] is not None
    )
```

Строка 245:

```python
return EngineeringRow(
        operation_id=op,
        number=index + 1,
        title=task.title,
        purpose=task.purpose,
        equipment_purpose=task.equipment_purpose
        if task.equipment_purpose is not None
        else task.preliminary_equipment.reason,
        work_plan=task.work_plan
        if task.work_plan is not None
        else (tuple(detail.get("work_plan", ())) or tuple(w.title for w in task.work_items)),
        setup_and_tooling=task.setup_and_tooling
        if task.setup_and_tooling is not None
        else tuple(detail.get("setup_and_tooling", ())),
        control_plan=task.control_plan
        if task.control_plan is not None
        else tuple(detail.get("control_plan", ())),
        parameters=tuple(detail.get("parameters", ())),
        calculation_summary=calculation_summary,
        saved_plan_requires_review=bool(time and time.command.regimes.get(op)),
        material=packet.get("material_grade", "Не установлен"),
        machine=machine.get("title", "Не установлен"),
        before=eng.get("before"),
        after=eng.get("after"),
        state_description=operator_text(
            detail.get("result_state", {}).get("description", "Не описано")
        ),
        flow_volumes_mm3=eng.get("flows_mm3", {}),
        flow_masses_kg=eng.get("flow_masses_kg", {}),
        removed_volume_mm3=eng.get("removed_volume_mm3"),
        removed_mass_kg=eng.get("removed_mass_kg"),
        minutes_per_batch=minutes,
        rub_per_batch=cost.rub_per_batch if cost else None,
        rub_per_unit=cost.rub_per_unit if cost else None,
        regimes=regimes,
        norms=tuple(recipe.model_dump(mode="json") for recipe in norms),
        components=tuple(components),
        formulas=tuple(formulas),
        sources=tuple(dict.fromkeys(s for s in sources if s)),
        limitations=tuple(
            operator_text(readable(v, basis))
            for v in (
                *eng.get("diagnostics", []),
                *[i["message"] for i in detail.get("issues", [])],
                *(
                    (
                        "Предварительное время по норме. Фактическая выполнимость режима и оснащение не проверены.",
                    )
                    if norms
                    else ()
                ),
            )
        ),
    )
```

Строка 176:

```python
minutes += component.minutes * (count if component.scope == "unit" else 1)
```

Строка 216:

```python
position = next(
                (
                    i + 1
                    for i, p in enumerate(regimes)
                    if "machcalc:" + p["pass_id"] == component.component_id
                ),
                None,
            )
```

Строка 173:

```python
minutes is None
```

Строка 173:

```python
component.minutes is None
```

#### `engineering_view`, строка 301

Строка 305:

```python
history = tuple(
        [
            EngineeringChoice(
                value=f"estimate:{r.revision}",
                label=f"Смета {r.revision} · время {r.time.revision} · {r.created_at.date()} · {r.command.reason}",
            )
            for r in reversed(costs.history)
        ]
        + [
            EngineeringChoice(
                value=f"time:{r.revision}",
                label=f"Время {r.revision} · {r.created_at.date()} · {r.command.reason}",
            )
            for r in reversed(times.history)
        ]
    )
```

Строка 352:

```python
estimate.revision == costs.current.revision
```

### mvp/src/metall_mvp/workflows/machining_adapter.py

[mvp/src/metall_mvp/workflows/machining_adapter.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/machining_adapter.py)

#### `cylinder`, строка 33

Строка 39:

```python
len(state.segments) != 1
```

#### `pass_request`, строка 58

Строка 109:

```python
expected = D(detail.engineering.flows_mm3["kerf"]) / count
```

Строка 106:

```python
inner != 0
```

Строка 103:

```python
count is None
```

Строка 103:

```python
cut.cut_count != count
```

Строка 103:

```python
cut.kerf_mm is None
```

Строка 118:

```python
transition.removed_volume_mm3 is None
```

#### `check_response`, строка 158

Строка 190:

```python
expected_volume is not None
```

Строка 210:

```python
minutes < 0
```

Строка 195:

```python
abs(actual - expected_volume) > max(
            D("1e-8"), abs(expected_volume) * D("1e-12")
        )
```
