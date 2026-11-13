# Формулы: основной путь и расчётное ядро

Дата: 06.11.2026. Основание: снимок рабочего дерева, указанный в [README](README.md). Дополнительные и прежние ветви: [03-ADDITIONAL-FORMULAS](03-ADDITIONAL-FORMULAS.md). Буквальные формульные записи и выражения: [05-SOURCE-REGISTER](05-SOURCE-REGISTER.md).

Единый каталог всех категорий с последующим подробным описанием алгоритмов, сохранения и подстановки результатов: [07-FORMULA-CATALOG-AND-APPLICATION.md](07-FORMULA-CATALOG-AND-APPLICATION.md).

## 1. Единицы, обозначения и неизвестные данные

В формулах обработки, если не оговорено другое:

| Обозначение | Смысл | Единица |
| --- | --- | --- |
| `D`, `d`, `a`, `L`, `b`, `k` | Диаметры, глубины, длины, ширины, пропил | мм |
| `A`, `V` | Площадь и объём | мм², мм³ |
| `v`, `n`, `u`, `f`, `fz` | Скорость резания, обороты, минутная подача, подача на оборот/зуб | м/мин, об/мин, мм/мин, мм/об, мм/зуб |
| `t`, `Q` | Время и объёмная производительность | мин, см³/мин |
| `κ`, `γ`, `θ` | Главный угол, передний угол, угол вершины сверла | градусы |
| `ρ`, `m`, `N` | Плотность, масса, количество деталей | кг/м³, кг, шт. |
| `Rчас`, `C` | Ставка и стоимость в одной валюте/ценовом основании | деньги/ч, деньги |

Буквы локальны категории: например, `k` в раскладке означает ширину пропила, а в линейном движении число повторов. Эти величины не смешиваются. `UNKNOWN`/`null` не являются нулями. Для нулевого значения нужен собственный подтверждённый смысл.

Общие преобразования:

```text
U01  x_target = x_source · factor_source / factor_target
U02  1 м = 1000 мм; 1 см = 10 мм; 1 дюйм = 25,4 мм; 1 мкм = 0,001 мм
U03  1 г = 0,001 кг; 1 мм³ = 10⁻⁹ м³; 100 мм² = 1 см²; 1000 мм³ = 1 см³
U04  α_rad = α_deg·π/180; α_deg = α_rad·180/π
U05  t_час = t_мин/60
U06  value_scaled = coefficient·10^power_of_ten для численного поля Splav
```

Совместимость размерностей проверяется; перевод градусов в радианы обязателен для тригонометрии. Код: [passport/units.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/passport/units.py:72), [Go units](F:/projects/metall-dev-2/machining-calc/units).

## 2. Размеры, пределы и геометрическая потребность

```text
D01  x_min = x_nom + δ_lower
D02  x_max = x_nom + δ_upper
D03  x_required_external = x_nom + δ_upper + allowance
D04  d_inner,max = D_nom + δD_upper − 2·(s_nom + δs_lower)
D05  L_chain,nom = ΣL_i,nom
D06  L_chain,min = ΣL_i,min; L_chain,max = ΣL_i,max
```

`δ_lower` и `δ_upper` имеют исходный знак. Отрицательное верхнее отклонение не превращается в модуль. Если нужный предел неизвестен, гарантированная потребность также неизвестна; номинальная оценка маркируется отдельно. Суммирование размерной цепи применимо только к установленной последовательности размеров, а не к произвольным числам чертежа.

Поддержанная табличная интерпретация линейных допусков:

```text
D07  H: δ_lower=0, δ_upper=IT
D08  h: δ_lower=−IT, δ_upper=0
D09  symmetric: δ_lower=−IT/2, δ_upper=IT/2
```

`IT` берётся из закреплённой таблицы ширин. В resolver реализованы IT9/IT14 в объявленных интервалах до 3150 мм; универсальная степенная формула ISO для любого квалитета здесь не вычисляется. Резьбовые отклонения также берутся из поддержанных проверенных записей, а не из придуманной общей зависимости.

Код: [stock_fit_safety.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/stock_fit_safety.py:40), [axial_length_chain.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/axial_length_chain.py:62), [linear_tolerance_rules.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/linear_tolerance_rules.py:68), [tolerances.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/tolerances.py:113).

## 3. Подбор круга и раскладка партии

Область: `stock-selection/2`, метод `round-bar/1`. Расчётные десятичные длины в Go представлены точными рациональными числами. Операционные минуты и цена в эту область не входят.

### 3.1. Потребность детали и длина отделяемого отрезка

Обозначения: `L_f` и `D_f` являются потребностью по принятому пределу либо отдельно обозначенному номинальному основанию; `z_l`, `z_r` - торцевые припуски; `e−`, `e+` - неотрицательные величины минусовой/плюсовой ошибки отрезки; `s` - шаг упора, если подтверждён.

```text
S01  D_required = max(D_f, D_technology_min), если технологический минимум задан
S02  L_required = L_f + z_l + z_r
S03  L_target = L_required + e−                         без известного шага упора
S04  L_target = s·ceil((L_required + e−)/s)              с известным s>0
S05  L_allocated = L_target + e+
S06  reserve_cut = L_allocated − L_required
```

`L_required`, `L_target` и `L_allocated` различаются. Максимальный расход материала при положительной ошибке не равен минимально требуемой длине готового отрезка.

### 3.2. Эффективный диаметр и проверка вместимости

`D_s` - номинал прутка; `δD−` - его нижнее отклонение со знаком; `c%` - кривизна в процентах длины; `L_s` - номинальная длина 6000/12000; `δL−` - известное нижнее отклонение длины; `h` - тело начальной обрезки; `H` - число её пропилов на пруток; `g` - минимальный зажимной остаток.

```text
S07  D_effective = D_s + δD− − L_allocated·c%/100
S08  пригодность по сечению: D_effective > D_required
S09  L_available = L_s + δL−, если δL− известно
S10  L_available = L_s, если выбрано явное номинальное допущение
S11  capacity = max(0, floor((L_available − h − H·k − g)/(L_allocated + k)))
```

Проверка S08 строго положительная: равенство отвергается этим методом. Кривизна здесь уменьшает эффективный диаметр по длине выделенного отрезка; это не формула деформирования стержня. Отсутствие параметров не означает нулевую кривизну, нулевой хвост или нулевую ошибку реза.

### 3.3. Цель выбора комплекта

Сначала выбирается минимальный подходящий номинальный диаметр, затем для него решается задача поставки. `c6`, `c12` - вместимость 6/12-метрового прутка; `n6`, `n12` - их количества.

```text
S12  n6·c6 + n12·c12 ≥ N; n6,n12 - целые неотрицательные
S13  минимизировать лексикографически (6000·n6 + 12000·n12, n6+n12)
```

Это минимизация закупаемой длины, затем числа прутков, а не минимизация денежной стоимости или цены остатка. Неизвестное `N` допускает геометрический подбор, но не полный комплект и баланс партии.

Буквальный алгоритм `Optimize`:

```text
S14  если c6=0: n12=ceil(N/c12), n6=0
S15  если c12=0: n6=ceil(N/c6), n12=0
S16  если c12≥2c6:
       n12=floor(N/c12), r=N mod c12
       r=0: n6=0
       0<r≤c6: n6=1
       r>c6: n12=n12+1, n6=0
S17  если 0<c12<2c6:
       u=ceil(N/c6), Δ=2c6−c12, spare=u·c6−N
       n12=min(floor(spare/Δ), floor(u/2)); n6=u−2n12
```

### 3.4. Группы прутков и баланс

Для группы `j`: `b_j` одинаковых прутков, на каждом `q_j` отрезков. Хвост `g` ограничивает вместимость; он остаётся внутри остатка и не списывается второй раз как отдельная потеря.

```text
S18  consumed_j = h + H·k + q_j·(L_allocated+k)
S19  remnant_j = L_available,j − consumed_j
S20  N = Σ(b_j·q_j); B = Σb_j
S21  purchase_length = Σ(b_j·L_nominal,j)
S22  available_length = Σ(b_j·L_available,j)
S23  supply_shortfall_reserve = purchase_length − available_length
S24  allocated_piece_length = N·L_allocated
S25  required_piece_length = N·L_required
S26  finished_envelope_length = N·L_f
S27  face_allowance_length = N·(z_l+z_r)
S28  cut_tolerance_reserve = N·(L_allocated−L_required)
S29  separation_kerf = N·k
S30  head_trim_body = B·h; head_trim_kerf = B·H·k
S31  layout_remnants = Σ(b_j·remnant_j)
S32  available_length = allocated_piece_length + separation_kerf
                            + head_trim_body + head_trim_kerf + layout_remnants
```

Код: [engine.go](F:/projects/metall-dev-2/stock-selection/selection/engine.go:233), [layout.go](F:/projects/metall-dev-2/stock-selection/selection/layout.go:5), [decimal.go](F:/projects/metall-dev-2/stock-selection/selection/decimal.go:96).

## 4. События отрезки партии

Метод `sawing.round.batch-events/1` читает проекцию сохранённого баланса. Он проверяет численную согласованность и возвращает события; времени и цены у него нет.

```text
B01  N = Σ(bar_count·allocated_pieces_per_bar)
B02  B = Σbar_count
B03  k = separation_kerf_mm/N
B04  H_total = head_trim_kerf_mm/k
B05  H_per_bar = H_total/B, должно быть целым неотрицательным
B06  separation_count=N; head_trim_count=H_total
B07  bar_load_count=B; piece_feed_count=N; clamp_count=UNKNOWN
```

`k` должен быть точным положительным десятичным числом в области контракта; неделимое количество резов не округляется. Число зажимов не выводится из числа отрезков. Код: [bandsaw_batch.go](F:/projects/metall-dev-2/machining-calc/calc/bandsaw_batch.go:1), [формульный реестр](F:/projects/metall-dev-2/machining-calc/calc/formulas.go:12).

## 5. Геометрия, объём и масса

В основном пути используются поддержанные цилиндрические/кольцевые состояния, а также результаты конкретных методов обработки. Другие примитивы сохранены в проекте и перечислены отдельно.

```text
G01  A_round = πD²/4
G02  A_ring = π(D²−d²)/4
G03  V_cylinder = πD²L/4
G04  V_ring = π(D²−d²)L/4
G05  V_sections = ΣV_i по неперекрывающимся допустимым участкам
G06  m = V_mm³·10⁻⁹·ρ_кг/м³
G07  V_removed = V_before − V_after для допустимого перехода
G08  m_removed = V_removed·10⁻⁹·ρ
G09  z_global = direction·z_local + offset
G10  L_envelope = max(z_end) − min(z_start); D_envelope = max(D_outer)
```

Для материального разделения:

```text
G11  V_supply = A·L_supply
G12  V_pieces = A·L_piece·N
G13  V_kerf = A·k·N_cuts
G14  V_end_loss = A·L_end_loss; V_additional_loss = A·L_additional_loss
G15  L_remnant = L_supply − (N·L_piece + N_cuts·k + L_end_loss + L_additional_loss)
G16  V_remnant = A·L_remnant
```

Отделённый полезный отрезок и сохранённый остаток не являются стружкой. Конфликт геометрии, перекрытие частей или неизвестная плотность не исправляются скрытой подстановкой.

Код: [geometry_primitives.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/geometry_primitives.py:13), [round_geometry.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/round_geometry.py:112).

## 6. Построение проходов в Python

Модель задаёт технологическую цель; код разворачивает поддержанную геометрию.

### 6.1. Цилиндрические слои и торцы

```text
P01  D_stop,наруж = D_target + 2·z_remaining
P02  d_stop,расточка = d_target − 2·z_remaining
P03  n_layers = ceil(abs(stop−start)/step)
P04  next = current + direction·min(step, abs(stop−current))
P05  радиальная глубина наружного слоя a=(D_before−D_after)/2
P06  радиальная глубина расточки a=(d_after−d_before)/2
P07  L_feed = L_contact + L_approach + L_exit, если явный путь не задан
P08  L_facing,contact=(D_outer−D_inner)/2
P09  L_facing,feed=L_facing,contact+L_approach+L_exit
```

Для цилиндрических планов шаг изменения диаметра соответствует удвоенной максимальной радиальной глубине, то есть `step=2·ap_max`. Для осевых слоёв торцовки используется соответствующий осевой шаг. Последний слой может быть меньше максимального; оставляемый припуск не снимается автоматически.

В первоначальном Go-методе продольного точения `cut_length_mm` равен длине контакта. Локальный план отдельно хранит полный `feed_travel_mm`, но это не расширяет автоматически время и объём старого метода: подвод, выход и возврат требуют самостоятельного покрытия. Для новых методов с отдельными `L_feed`/`L_contact` смысл путей различается явно.

### 6.2. Канавка и количество повторов

```text
P10  n_width_positions=ceil(width/tool_width)
P11  start_i=min(i·tool_width, width−tool_width), i=0..n−1
P12  end_i=start_i+tool_width
P13  new_width_i=end_i−covered_before
P14  covered_after=max(covered_before,end_i)
P15  overlap_width_i=tool_width−new_width_i
```

Перекрытая ширина не списывается повторно. Сверление и пиление формируют столько заданий, сколько явно объявлено в локальном плане; неподдержанный цикл сохраняется как нерешённая цель, вместо выдуманной последовательности.

Код: [pass_planning.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/pass_planning.py:351), [manual_passes.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/manual_passes.py:88).

## 7. Кинематика при постоянных оборотах

```text
K01  n = 1000·v/(π·D_ref)
K02  v = π·n·D_ref/1000
K03  u = n·f
K04  t_feed = L_feed/u
K05  t_engaged = L_contact/u
K06  Q_average = V/(1000·t_feed), если t_feed>0
```

В первых методах продольного точения/торцовки опорным является исходный наружный диаметр. В новых методах опорный диаметр передаётся явно; у расточки дополнительно проверяется его согласование с конечным диаметром отверстия. Если одновременно заданы `n` и `v/D_ref`, противоречие делает зависимые метрики недопустимыми.

Обороты и подача должны быть положительными. Нулевой путь допускает нулевое время по правилам конкретного метода; неизвестный путь не заменяется нулём. Наладка, возвраты и скрытые циклы не входят в `L_feed` без собственного основания.

Код: [engine.go](F:/projects/metall-dev-2/machining-calc/calc/engine.go:270), [resolveConstantN](F:/projects/metall-dev-2/machining-calc/calc/boring.go:79).

## 8. Продольное точение

Метод `turning.longitudinal.constant-n/1`. `D` - начальный диаметр; `a` - радиальная глубина; `L` - заданная длина рабочего движения.

```text
T01  d=D−2a
T02  A_removed=π·a·(D−a)
T03  V=A_removed·L
T04  Q=A_removed·u/1000
T05  t=L/u
T06  v_mean=π·n·(D−a)/1000
```

Для положительного съёма `D>0`, `0<a<D/2`. Нулевой слой не доказывает выполненную обработку. Используется площадь кольцевого слоя; приближение `Q=v·a·f` не подменяет выполненную формулу T04. Код: [engine.go](F:/projects/metall-dev-2/machining-calc/calc/engine.go:225).

## 9. Торцовка

Метод `turning.facing.constant-n/1`. `D`, `d` - наружный/внутренний диаметры кольца; `a` - осевой слой.

```text
F01  L=(D−d)/2
F02  V=π·(D−d)·(D+d)·a/4
F03  t=L/u
F04  Q=V/(1000t)=π·(D+d)·a·u/2000
F05  v_mean=π·n·(D+d)/2000
```

`D>0`, `0≤d<D`, `a≥0`. Торцовка не назначает новый продольный диаметр. При `d=0` математическое время доступно, но нулевая скорость у центра не подтверждает пригодность режима/инструмента. Код: [engine.go](F:/projects/metall-dev-2/machining-calc/calc/engine.go:250).

## 10. Силовая модель точения и расточки

```text
L01  h=f·sin(κ·π/180)
L02  kc=kc11·h^(−mc)·(1−γ/100)
L03  Ft=kc·a·f
L04  P_cut=Ft·v_mean/60000
L05  T_cut=P_cut·30000/(π·n)
L06  P_drive=P_cut/η
```

`h` - толщина стружки в мм; `kc`, `kc11` - Н/мм²; `Ft` - тангенциальная сила в Н; `T` - Н·м; `P` - кВт; `η` - доля, `0<η≤1`. Условия модели: `0<κ<180°`, `−90<γ<90°`, `kc11>0`, `0≤mc<1`.

Коэффициенты должны относиться к материалу, состоянию и инструменту. Отсутствие коэффициентов сохраняет кинематику/время, но не даёт силовые показатели. КПД применяется к приводу, а не как повторный множитель силы резания. Средние показатели не являются динамическими пиками, расчётом закрепления или доказательством жёсткости.

Код: [engine.go](F:/projects/metall-dev-2/machining-calc/calc/engine.go:265), [boring.go](F:/projects/metall-dev-2/machining-calc/calc/boring.go:265).

## 11. Расточка

Метод `turning.boring.constant-n/1`. `d0>0` - исходное отверстие; `d1` - конечное отверстие; `L_contact` - длина контакта с материалом; `L_feed` - весь объявленный осевой ход.

```text
R01  a=(d1−d0)/2
R02  A=π·(d1−d0)·(d1+d0)/4
R03  V=A·L_contact
R04  t_engaged=L_contact/u; t_feed=L_feed/u
R05  Q_steady=A·u/1000
R06  Q_average=V/(1000·t_feed)
R07  v_mean=π·n·(d0+d1)/2000
R08  P_engaged=Ft·v_mean/60000
R09  T_engaged=Ft·(d0+d1)/4000
R10  P_drive,engaged=P_engaged/η
```

R09 равна L05 при известных согласованных оборотах. Длина свободного движения не увеличивает объём контакта; мощность контакта не усредняется автоматически по воздушным ходам. Исходник и формульный реестр: [boring.go](F:/projects/metall-dev-2/machining-calc/calc/boring.go:265).

## 12. Сверление

Метод `drilling.axial.constant-n/1`, простой осевой цикл. `θ` - полный угол идеальной конической вершины; `H_full` - глубина цилиндрической части глухого отверстия; `H_material` - толщина материала сквозного отверстия; `e` - явный дополнительный выход.

```text
DR01 A=πD²/4
DR02 h_tip=D/(2·tan(θ·π/360))
DR03 L_required,blind=H_full+h_tip
DR04 L_required,through=H_material+h_tip+e
DR05 V_blind=A·(H_full+h_tip/3)
DR06 V_through=A·H_material
DR07 t_feed=L_feed/(n·f)
DR08 Q_steady=A·n·f/1000
DR09 Q_average=V/(1000·t_feed)
```

При достаточной объявленной геометрии и неизвестном явном пути код может принять `L_feed=L_required`; известный недостаточный путь не удлиняется молча. Конусный выход и воздушный ход не добавляют объём материала сквозного отверстия. Прерывистый цикл, повторные выводы и существующая полость требуют собственной поддержанной модели; силовая модель сверления в этом методе не заявлена. Код: [drilling.go](F:/projects/metall-dev-2/machining-calc/calc/drilling.go:1).

## 13. Радиальная канавка

Метод `turning.grooving.constant-n/1`. `b_tool` - ширина инструмента; `b_new` - новая неперекрытая осевая ширина; `fr` - радиальная подача на оборот.

```text
GR01 0≤b_new≤b_tool
GR02 L_contact=(D−d)/2
GR03 L_feed=L_contact, только при неизвестном явном пути и достаточной геометрии
GR04 V=π·(D−d)·(D+d)·b_new/4
GR05 u=n·fr
GR06 t_feed=L_feed/u; t_contact=(D−d)/(2·n·fr)
GR07 Q_contact=V/(1000·t_contact)
GR08 Q_average=V/(1000·t_feed)
```

Это средняя производительность по меняющемуся радиусу. Перекрытия учитывает планировщик; Go получает новую ширину отдельным операндом. Силовой модели канавки нет. Код: [grooving.go](F:/projects/metall-dev-2/machining-calc/calc/grooving.go:1).

## 14. Резьбовой ход

Метод `turning.thread.constant-n/1`: однозаходная цилиндрическая резьба. `P` - шаг, `L_feed` - осевой рабочий путь, `L_return`, `u_return` - явно заданный возврат.

```text
TH01 f_axial=P
TH02 u=n·P
TH03 t_feed=L_feed/(n·P)
TH04 t_return=L_return/u_return
TH05 t_return=0 при явно заданном L_return=0
TH06 t_cycle=t_feed+t_return
TH07 V_spring=0; Q_spring=0 при положительном t_feed
TH08 V_cut=UNKNOWN; Q_cut=UNKNOWN
```

Путь является осевым, не длиной винтовой линии. Известная независимая подача должна совпадать с шагом. Число проходов, профиль резьбы, врезания и синхронизация не выводятся из одного шага. Точный винтовой съём версии 1 не заменяется кольцевой оболочкой. Код: [thread_turning.go](F:/projects/metall-dev-2/machining-calc/calc/thread_turning.go:1).

## 15. Ленточнопильный рез

Метод `sawing.round.area-rate/1`: один поперечный рез сплошного круга. `R` - эффективная площадная производительность в см²/мин; `k` - ширина пропила с разводкой; `v_band` - отдельно заданная скорость полотна.

```text
SA01 A=πD²/4
SA02 t_cut=(A/100)/R
SA03 V_kerf=A·k
SA04 Q_kerf=R·k/10
```

`v_band` не подставляется вместо `R` или подачи рамы. Отрезок и остаток не входят в `V_kerf`. При неизвестном `R` время неизвестно; при неизвестном `k` время по известному `R` может сохраняться, а потери неизвестны. Применимость `R` к материалу, полотну, станку и охлаждению требует основания. Код: [bandsaw.go](F:/projects/metall-dev-2/machining-calc/calc/bandsaw.go:1).

## 16. Явное линейное движение

Метод `motion.linear-feed/1`. `r` - целое число повторов; `z_eff` - эффективное число зубьев; `fz` - подача на зуб. Используется один выбранный способ задания подачи.

```text
MF01 L_total=L·r
MF02 u=u_effective
MF03 u=n·f
MF04 u=n·z_eff·fz
MF05 t=L_total/u
```

Метод не восстанавливает геометрию, объём или нагрузки по известному времени/пути. Он применяется также к явно помеченным оценочным движениям дополнительных сценариев. Код: [linear_feed.go](F:/projects/metall-dev-2/machining-calc/calc/linear_feed.go:1).

## 17. Нормы вспомогательного времени и итог партии

`τ_e` - минуты на событие из применимой нормы; `count_e` - число событий по основанию. Частота `per_piece`/`per_batch` является частью данных.

```text
TM01 t_aux = Σ(τ_e·count_e) для выбранной повторяемой области
TM02 t_setup = Σ(τ_e·count_e) для общих событий партии
TM03 t_machine,known = Σt_j только по известным проходам
TM04 t_machine,full = Σt_j, если все обязательные проходы/работы покрыты
TM05 t_piece = t_machine,full+t_aux
TM06 T_batch = N·t_piece+t_setup
TM07 t_allocated_per_piece = T_batch/N при известном N>0 и полном T_batch
TM08 T_known = T_known_fixed + N·t_known_piece, когда такое сведение определено
TM09 T_loading,batch = τ_loading·bar_load_count
TM10 T_head_trim,batch = t_one_head_cut·head_trim_count
```

Общая наладка с одинаковым `setup_group` учитывается один раз. Включённые работы не дублируются. Известная сумма TM03/TM08 не равна полному производственному времени; неизвестное количество не позволяет умножать повторяемые работы и распределять общую наладку. Код: [apply_time_profiles](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/compact_estimation.py:837), [calculate_details](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/compact_round.py:1377), [time_estimate.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/time_estimate.py:265).

## 18. Нагрузка и энергия

```text
EN01 P_known,max=max(P_drive,j) по известным модельным значениям
EN02 E_known=Σ(P_drive,j·t_j/60), кВт·ч
```

Учитываются только подходящие интервалы расчётной обработки/контакта. Вспомогательные и холостые энергозатраты не включаются автоматически. Максимум известных средних мощностей не является измеренным пиком нагрузки станка. Полная энергия неизвестна, если отсутствует необходимая мощность или длительность. Код: [load_summary](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/compact_estimation.py:1048).

## 19. Строки стоимости и надбавка

```text
C01 C_time=t_min·Rчас/60
C02 C_unit=unit_price·quantity
C03 C_direct=явно заданная допустимая сумма
C04 factor=N для per_piece; factor=1 для per_batch
C05 C_line,batch=C_line·factor
C06 T_line,batch=t_line·factor
C07 Base_bucket=ΣC_unique,line,batch по одной валюте и price_basis
C08 Processing_bucket=ΣC_line,batch, исключая material и material-credit
C09 Markup_bucket=round_money(Processing_bucket·(K−1)), K≥1
C10 Subtotal_bucket=round_money(Base_bucket)+Markup_bucket
C11 Total_bucket=Subtotal_bucket+Reserve_bucket, если резерв известен
C12 round_money(x)=quantize_HALF_UP(x,q); q=1 для JPY,
    q=0,001 для KWD/BHD/OMR; q=0,01 для остальных валют этого метода
```

`C_unit.quantity` является количеством позиции строки; `factor` - отдельная частота этой строки на партию. Их нельзя без проверки данных считать одним и тем же `N` и удваивать количество. Алгоритм всегда пересобирает надбавку от исходных уникальных строк, не начисляет её поверх прежней надбавки/резерва. Разные валюты и ценовые основания не складываются.

Округление денег: `ROUND_HALF_UP`; квант 1 для JPY, 0,001 для KWD/BHD/OMR, 0,01 для остальных поддержанных денежных строк. Коммерчески недопустимое происхождение цены даёт неизвестную цену, сохраняя независимое время. Источники: [estimate.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/estimate.py:24), [apply_processing_markup](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/estimate.py:183), [pricing.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/pricing.py:16).

## 20. Резервы и полнота

Внутри выбранной группы резерва суммируются только её канонические неповторяющиеся основания в одной денежной группе.

```text
RS01 B_group=ΣC_key
RS02 R_ratio=B_group·ratio
RS03 R_upper=max(0, upper_amount−B_group)
RS04 R_explicit=amount при method=manual_amount
RS05 R_unknown=UNKNOWN при method=unknown или недостаточном основании
RS06 R_bucket=ΣR_group, только если все нужные R_group известны
```

Численные способы являются альтернативами: `manual_amount`, `manual_ratio`, `scenario`. Нулевой резерв можно задать явной допустимой суммой; отдельного метода `none` в этом контракте нет. Без выбранной группы резерв неизвестен. Резерв не закрывает отсутствующую обязательную работу или цену. Полный итог требует полного покрытия обязательных денежных работ и известного резерва. Отдельно проверяется полнота времени. Источник: [reserve.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/reserve.py:28), [сборка состояний](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/estimate.py:224).

## 21. Проверка численной согласованности

```text
Q01 abs(actual−expected) ≤ max(abs_tol, rel_tol·abs(expected))
Q02 constant-n close: abs(a−b) ≤ max(10⁻⁹, 10⁻¹⁰·max(abs(a),abs(b)))
Q03 сверка объёма адаптером Metall: abs(V_Go−V_expected) ≤ max(10⁻⁸,abs(V_expected)·10⁻¹²)
```

Q01 применяется в численных контролях с отдельными допусками метрик; Q02 непосредственно используется для согласования постоянных оборотов/диаметров; Q03 проверяет ожидаемый объём в адаптере. Это допуски арифметики, а не допуски изготовления и не погрешность эмпирической нормы. Известный недопустимый вход не маскируется неизвестным или допуском. Источники: [METHODS.md](F:/projects/metall-dev-2/machining-calc/docs/METHODS.md:101), [boring.go](F:/projects/metall-dev-2/machining-calc/calc/boring.go:103), [machining_adapter.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/machining_adapter.py:189).

## 22. На какие внешние методики ориентируется ядро

Для первоначальных формул точения использован Walter Machining Calculator как предметный ориентир, с отдельной фиксацией собственных определений силы, момента и геометрии слоя. Это не сетевой вызов Walter на каждом расчёте. Калькулятор считает локальным Go-кодом.

Преобразования только для сопоставления сохранённых контролей Walter:

```text
W01 F_cut=F_Walter·η
W02 T_cut=T_Walter·(30000/π)/9554
```

W01/W02 не являются дополнительной надбавкой рабочего расчёта. Они согласуют разные определения показателей в сравнении. Поля метода, версии, формульные ID и ссылки на описание сохраняют конкретную применённую зависимость. Источник: [WALTER.md](F:/projects/metall-dev-2/machining-calc/docs/WALTER.md), [METHODS.md](F:/projects/metall-dev-2/machining-calc/docs/METHODS.md:85).

Полного численного ядра фрезерования, шлифования, термообработки, покрытия, сварки и электроэрозии как девяти перечисленных методов здесь нет. Такие работы могут иметь явно введённое время, профильную оценку или оставаться UNKNOWN; универсальные формулы `t=V/Q`, `t=A/Q_area`, `t=L/Q_linear` из планов сами по себе не подтверждают реализацию каждого процесса.

## 23. Где находятся данные для формул

| Данные | Исходный набор в снимке | Ограничение |
| --- | --- | --- |
| Ширины линейных допусков | [linear_tolerances.json](F:/projects/metall-dev-2/library/nsi/defaults/linear_tolerances.json) | Табличные проверенные значения, а не общий генератор всех квалитетов |
| Полосы нормативных поправок и типы встроенных операций | [formulas.json](F:/projects/metall-dev-2/library/nsi/defaults/formulas.json) | Политика не является произвольным исполняемым текстом формулы |
| Профили обработки и вспомогательного времени | [profiles-1.json](F:/projects/metall-dev-2/library/nsi/estimation/profiles-1.json) | Нужны применимая область, явный выбор и закреплённая редакция |
| Оценочные диапазоны сервисных работ | [manifest.json](F:/projects/metall-dev-2/library/nsi/estimation/manifest.json), [time-policy-2.json](F:/projects/metall-dev-2/library/nsi/estimation/time-policy-2.json) | Рабочая политика выбирается по manifest/настройкам; наличие файла не доказывает её выбор конкретным сохранённым расчётом |
| Рабочие режимы и цены конкретного станка | Паспорт оборудования и его выбранная редакция | Текущая рабочая БД в этом исследовании не открывалась; конкретные значения UNKNOWN |

Исходный набор и фактически выбранная рабочая редакция могут отличаться. В каталоге не назначаются новые скорости, подачи, ставки или коэффициенты вместо отсутствующего основания.
