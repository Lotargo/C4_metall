# Полный каталог формул и порядок их применения

Подготовка производства. Дата: 06.11.2026.

Сначала приведён единый каталог по категориям; затем для каждой категории описаны исходные данные, алгоритм, место исполнения, сохранение результата и дальнейшая подстановка. Каталог включает формулы, расчётные условия, правила округления и явные состояния `UNKNOWN`: это 369 пронумерованных записей в 35 категориях, а не 369 независимых физических законов. Одинаковая зависимость может повторяться в разных методах с разным смыслом пути, объёма или оплаты.

Основание — исходники `F:/projects/metall-dev-2`, ветка `test-2`, HEAD `d9329696188fb1ad9d103ac3ad55908e55d37856` **вместе с захваченными незакоммиченными изменениями**. Дата документа не означает новый продуктовый прогон. Точный снимок, хеши и границы проверки приведены в [реестре источников](04-SOURCES-AND-COVERAGE.md), буквальные варианты выражений по функциям — в [проверочном реестре](05-SOURCE-REGISTER.md).

Полнота здесь относится к обследованным предметным вычислениям проекта: единицы, размеры/допуски, материал, заготовка/раскладка, геометрия, проходы, режимы, время, нагрузки/энергия, стоимость/резервы, дополнительные и прежние расчётные ветви, подготовка изображения и программные таймеры. Данные рабочих БД, секреты и фактические локальные коммерческие настройки не читались. Хеши, номера ревизий, сетевые повторы, сортировка строк и верстка не являются дополнительными инженерными методиками.

## I. Каталог формул по категориям

Размеры по умолчанию — мм, площади — мм², объёмы — мм³, время обработки — мин, обороты — об/мин, скорость резания — м/мин, подача движения — мм/мин, плотность — кг/м³. Отступления указаны явно. `ceil` округляет вверх до целого, `floor` вниз; `Σ` суммирует только определённую область; `max/min` выбирают границу. `UNKNOWN` означает недостаточное основание, а не численный ноль. Индекс `known` — известная часть, `full` — полный результат с достаточным покрытием.

Каждая буква определяется внутри категории: например, P как шаг резьбы, P как мощность и префикс записей P не являются одной величиной. Коэффициенты таблиц/профилей — входные данные, а не автоматически вычисляемые константы.

| Категория | Записи | Где применяется | Описание |
| --- | --- | --- | --- |
| U — Единицы и численное представление | U01–U06 (6) | Общие преобразования | [Разбор](#применение-u) |
| D — Размеры, отклонения и размерные цепи | D01–D09 (9) | Основные и дополнительные геометрические основания | [Разбор](#применение-d) |
| S — Подбор круглого проката и раскладка партии | S01–S32 (32) | Основной Go-сервис stock-selection/2 | [Разбор](#применение-s) |
| B — События резки партии | B01–B07 (7) | Доступный Go-метод sawing.round.batch-events/1 | [Разбор](#применение-b) |
| G — Объёмы, массы и материальный баланс | G01–G16 (16) | Геометрические модули; применимость зависит от представления | [Разбор](#применение-g) |
| P — Локальное построение проходов | P01–P15 (15) | Основной путь Python перед вызовом Go | [Разбор](#применение-p) |
| K — Кинематика постоянных оборотов | K01–K06 (6) | Общее основание методов обработки | [Разбор](#применение-k) |
| T — Продольное наружное точение | T01–T06 (6) | Go-метод turning.longitudinal.constant-n/1 | [Разбор](#применение-t) |
| F — Торцовка | F01–F05 (5) | Go-метод turning.facing.constant-n/1 | [Разбор](#применение-f) |
| L — Сила, мощность и крутящий момент | L01–L06 (6) | Поддержанные токарные/расточные модели Go | [Разбор](#применение-l) |
| R — Расточка | R01–R10 (10) | Go-метод turning.boring.constant-n/1 | [Разбор](#применение-r) |
| DR — Сверление | DR01–DR09 (9) | Go-метод drilling.axial.constant-n/1 | [Разбор](#применение-dr) |
| GR — Радиальная канавка | GR01–GR08 (8) | Go-метод turning.grooving.constant-n/1 | [Разбор](#применение-gr) |
| TH — Резьбовой ход | TH01–TH08 (8) | Go-метод turning.thread.constant-n/1 | [Разбор](#применение-th) |
| SA — Ленточнопильный рез по площади | SA01–SA04 (4) | Go-метод sawing.round.area-rate/1 | [Разбор](#применение-sa) |
| MF — Явное линейное движение | MF01–MF05 (5) | Go-метод motion.linear-feed/1 | [Разбор](#применение-mf) |
| TM — Нормы, суммирование времени и партия | TM01–TM10 (10) | Основные результаты операций; итоговый снимок — по отдельной ветви | [Разбор](#применение-tm) |
| EN — Модельная нагрузка и энергия | EN01–EN02 (2) | Python-сводка поддержанных метрик | [Разбор](#применение-en) |
| C — Денежные строки, партия, надбавка и округление | C01–C12 (12) | Отдельная команда стоимости Python | [Разбор](#применение-c) |
| RS — Резерв стоимости и полнота итога | RS01–RS06 (6) | Python-реестр резервных групп | [Разбор](#применение-rs) |
| Q — Численная согласованность расчётов | Q01–Q03 (3) | Адаптер, методы Go и проверочный контур | [Разбор](#применение-q) |
| W — Сопоставление с Walter | W01–W02 (2) | Методическое сравнение; не производственное начисление | [Разбор](#применение-w) |
| AG — Дополнительная геометрия и сравнение масс | AG01–AG10 (10) | Дополнительные и прежние геометрические модули | [Разбор](#применение-ag) |
| AB — Прежние проверки прутка и кривизны | AB01–AB10 (10) | Дополнительные/прежние Python-селекторы | [Разбор](#применение-ab) |
| AC — Прежний раскрой прутка | AC01–AC11 (11) | Прежние Python-контракты и helpers | [Разбор](#применение-ac) |
| AS — Лист и сеточный раскрой | AS01–AS12 (12) | Дополнительная/прежняя ветвь; не фигурный nesting | [Разбор](#применение-as) |
| AT — Трубный прокат и нормативные пределы | AT01–AT14 (14) | Дополнительный/прежний трубный selector | [Разбор](#применение-at) |
| AM — Справочная масса сортамента | AM01–AM06 (6) | Каталожное отображение с принятой плотностью стали | [Разбор](#применение-am) |
| BG — Развёртка гнутого круглого прутка | BG01–BG22 (23) | Дополнительный геометрический модуль; вне основного compact DETAIL | [Разбор](#применение-bg) |
| EQ — Пригодность оборудования и области режимов | EQ01–EQ12 (12) | Проверки Python по известным пределам/условиям | [Разбор](#применение-eq) |
| AU — Оценочные пути и повторы обработки | AU01–AU28 (28) | Отдельные профильные/совместимые сценарии времени | [Разбор](#применение-au) |
| AP — Профильные услуги и временной резерв | AP01–AP13 (13) | Отдельная оценочная ветвь Python | [Разбор](#применение-ap) |
| LC — Прежние экономические и временные расчёты | LC01–LC31 (34) | Раздельные legacy/cycle/accepted/D001-ветви | [Разбор](#применение-lc) |
| IM — Рендер чертежа и области изображения | IM01–IM08 (8) | Служебные преобразования до чтения модели | [Разбор](#применение-im) |
| SYS — Длительность исполнения программы | SYS01–SYS01 (1) | Диагностика; вне времени изготовления | [Разбор](#применение-sys) |

### U. Единицы и численное представление

**Область:** Общие преобразования.

**Обозначения:** x — значение величины; factor — масштаб единицы относительно общей базы; α — угол; t — время; coefficient и power_of_ten — поля численного представления Splav.

```text
U01  x_target = x_source · factor_source / factor_target
U02  1 м = 1000 мм; 1 см = 10 мм; 1 дюйм = 25,4 мм; 1 мкм = 0,001 мм
U03  1 г = 0,001 кг; 1 мм³ = 10⁻⁹ м³; 100 мм² = 1 см²; 1000 мм³ = 1 см³
U04  α_rad = α_deg·π/180; α_deg = α_rad·180/π
U05  t_час = t_мин/60
U06  value_scaled = coefficient·10^power_of_ten для численного поля Splav
```

[Порядок применения U](#применение-u).

### D. Размеры, отклонения и размерные цепи

**Область:** Основные и дополнительные геометрические основания.

**Обозначения:** x_nom — номинал; δ_lower/δ_upper — подписанные отклонения; IT — взятая из таблицы ширина допуска; allowance — припуск; D/s — наружный диаметр/стенка; L_i — звено цепи.

```text
D01  x_min = x_nom + δ_lower
D02  x_max = x_nom + δ_upper
D03  x_required_external = x_nom + δ_upper + allowance
D04  d_inner,max = D_nom + δD_upper − 2·(s_nom + δs_lower)
D05  L_chain,nom = ΣL_i,nom
D06  L_chain,min = ΣL_i,min; L_chain,max = ΣL_i,max
D07  H: δ_lower=0, δ_upper=IT
D08  h: δ_lower=−IT, δ_upper=0
D09  symmetric: δ_lower=−IT/2, δ_upper=IT/2
```

[Порядок применения D](#применение-d).

### S. Подбор круглого проката и раскладка партии

**Область:** Основной Go-сервис stock-selection/2.

**Обозначения:** D_f/L_f — потребность детали; D_s/L_s — прокат; z_l/z_r — торцевые припуски; e−/e+ — положительные величины недобора/перебора отрезки; s — шаг упора; c% — кривизна в процентах; h — тело начальной обрезки; H — число начальных резов на пруток; k — пропил; g — хвост; N — детали; n6/n12 — прутки 6/12 м; c6/c12 — вместимость; b_j/q_j — число прутков/деталей на пруток в группе.

```text
S01  D_required = max(D_f, D_technology_min), если технологический минимум задан
S02  L_required = L_f + z_l + z_r
S03  L_target = L_required + e−                         без известного шага упора
S04  L_target = s·ceil((L_required + e−)/s)              с известным s>0
S05  L_allocated = L_target + e+
S06  reserve_cut = L_allocated − L_required
S07  D_effective = D_s + δD− − L_allocated·c%/100
S08  пригодность по сечению: D_effective > D_required
S09  L_available = L_s + δL−, если δL− известно
S10  L_available = L_s, если выбрано явное номинальное допущение
S11  capacity = max(0, floor((L_available − h − H·k − g)/(L_allocated + k)))
S12  n6·c6 + n12·c12 ≥ N; n6,n12 - целые неотрицательные
S13  минимизировать лексикографически (6000·n6 + 12000·n12, n6+n12)
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

[Порядок применения S](#применение-s).

### B. События резки партии

**Область:** Доступный Go-метод sawing.round.batch-events/1.

**Обозначения:** N/B — число деталей/прутков; separation_kerf_mm и head_trim_kerf_mm — суммарная длина потерь; k — ширина одного пропила; H_total/H_per_bar — начальные резы всего/на пруток.

```text
B01  N = Σ(bar_count·allocated_pieces_per_bar)
B02  B = Σbar_count
B03  k = separation_kerf_mm/N
B04  H_total = head_trim_kerf_mm/k
B05  H_per_bar = H_total/B, должно быть целым неотрицательным
B06  separation_count=N; head_trim_count=H_total
B07  bar_load_count=B; piece_feed_count=N; clamp_count=UNKNOWN
```

[Порядок применения B](#применение-b).

### G. Объёмы, массы и материальный баланс

**Область:** Геометрические модули; применимость зависит от представления.

**Обозначения:** A — площадь мм²; V — объём мм³; D/d — наружный/внутренний диаметр; L — длина; ρ — кг/м³; z — осевая координата; direction — направление; offset — смещение.

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
G11  V_supply = A·L_supply
G12  V_pieces = A·L_piece·N
G13  V_kerf = A·k·N_cuts
G14  V_end_loss = A·L_end_loss; V_additional_loss = A·L_additional_loss
G15  L_remnant = L_supply − (N·L_piece + N_cuts·k + L_end_loss + L_additional_loss)
G16  V_remnant = A·L_remnant
```

[Порядок применения G](#применение-g).

### P. Локальное построение проходов

**Область:** Основной путь Python перед вызовом Go.

**Обозначения:** start/stop/current — размер состояния; step — шаг размера; a/ap_max — радиальная глубина/предел; z_remaining — оставляемый припуск; width/tool_width — канавка/резец; covered — уже снятая полоса; L_contact/L_approach/L_exit — контакт/подход/выход.

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
P10  n_width_positions=ceil(width/tool_width)
P11  start_i=min(i·tool_width, width−tool_width), i=0..n−1
P12  end_i=start_i+tool_width
P13  new_width_i=end_i−covered_before
P14  covered_after=max(covered_before,end_i)
P15  overlap_width_i=tool_width−new_width_i
```

[Порядок применения P](#применение-p).

### K. Кинематика постоянных оборотов

**Область:** Общее основание методов обработки.

**Обозначения:** n — об/мин; v — м/мин; D_ref — опорный диаметр мм; f — мм/об; u — мм/мин; L — мм; t — мин; Q — см³/мин.

```text
K01  n = 1000·v/(π·D_ref)
K02  v = π·n·D_ref/1000
K03  u = n·f
K04  t_feed = L_feed/u
K05  t_engaged = L_contact/u
K06  Q_average = V/(1000·t_feed), если t_feed>0
```

[Порядок применения K](#применение-k).

### T. Продольное наружное точение

**Область:** Go-метод turning.longitudinal.constant-n/1.

**Обозначения:** D/d — диаметр до/после; a — радиальная глубина; L — контактная длина; A_removed — площадь снимаемого кольца; u/n — подача/обороты.

```text
T01  d=D−2a
T02  A_removed=π·a·(D−a)
T03  V=A_removed·L
T04  Q=A_removed·u/1000
T05  t=L/u
T06  v_mean=π·n·(D−a)/1000
```

[Порядок применения T](#применение-t).

### F. Торцовка

**Область:** Go-метод turning.facing.constant-n/1.

**Обозначения:** D/d — наружная/внутренняя граница радиального хода; a — осевой снимаемый слой; L — радиальный контактный путь; u/n — подача/обороты.

```text
F01  L=(D−d)/2
F02  V=π·(D−d)·(D+d)·a/4
F03  t=L/u
F04  Q=V/(1000t)=π·(D+d)·a·u/2000
F05  v_mean=π·n·(D+d)/2000
```

[Порядок применения F](#применение-f).

### L. Сила, мощность и крутящий момент

**Область:** Поддержанные токарные/расточные модели Go.

**Обозначения:** h — толщина стружки мм; κ — угол в плане, градусы; γ — передний угол, численное значение в градусах по принятой эмпирической модели; kc11/mc — коэффициенты материала; kc — Н/мм²; Ft — Н; P — кВт; T_cut — Н·м; η — КПД.

```text
L01  h=f·sin(κ·π/180)
L02  kc=kc11·h^(−mc)·(1−γ/100)
L03  Ft=kc·a·f
L04  P_cut=Ft·v_mean/60000
L05  T_cut=P_cut·30000/(π·n)
L06  P_drive=P_cut/η
```

[Порядок применения L](#применение-l).

### R. Расточка

**Область:** Go-метод turning.boring.constant-n/1.

**Обозначения:** d0/d1 — внутренний диаметр до/после; a — радиальная глубина; A — площадь снимаемого кольца; L_contact/L_feed — контакт/подающий путь; v_mean — средняя скорость контакта.

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

[Порядок применения R](#применение-r).

### DR. Сверление

**Область:** Go-метод drilling.axial.constant-n/1.

**Обозначения:** D — диаметр сверла; θ — полный угол при вершине, градусы; h_tip — высота конуса; H_full — глубина полного диаметра; H_material — толщина материала; e — явный выход; A — площадь круга.

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

[Порядок применения DR](#применение-dr).

### GR. Радиальная канавка

**Область:** Go-метод turning.grooving.constant-n/1.

**Обозначения:** b_tool/b_new — полная ширина инструмента/новая снимаемая ширина; D/d — радиальные границы; fr — мм/об радиальной подачи; L_feed — явный подающий путь.

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

[Порядок применения GR](#применение-gr).

### TH. Резьбовой ход

**Область:** Go-метод turning.thread.constant-n/1.

**Обозначения:** P — шаг однозаходной резьбы мм; L_feed/L_return — рабочий/обратный путь; u_return — подача возврата; spring — пружинный проход.

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

[Порядок применения TH](#применение-th).

### SA. Ленточнопильный рез по площади

**Область:** Go-метод sawing.round.area-rate/1.

**Обозначения:** D — диаметр круга мм; A — мм²; R — производительность по площади см²/мин; k — пропил мм; t_cut — мин; Q_kerf — см³/мин.

```text
SA01 A=πD²/4
SA02 t_cut=(A/100)/R
SA03 V_kerf=A·k
SA04 Q_kerf=R·k/10
```

[Порядок применения SA](#применение-sa).

### MF. Явное линейное движение

**Область:** Go-метод motion.linear-feed/1.

**Обозначения:** L — путь одного движения мм; r — число повторов; u — мм/мин; n — об/мин; f — мм/об; z_eff — эффективное число зубьев; fz — мм/зуб.

```text
MF01 L_total=L·r
MF02 u=u_effective
MF03 u=n·f
MF04 u=n·z_eff·fz
MF05 t=L_total/u
```

[Порядок применения MF](#применение-mf).

### TM. Нормы, суммирование времени и партия

**Область:** Основные результаты операций; итоговый снимок — по отдельной ветви.

**Обозначения:** τ_e — норма одного события мин; count_e — число событий; t_j — время прохода; N — количество деталей; setup — общее время партии; known/full — известная часть/полный результат.

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

[Порядок применения TM](#применение-tm).

### EN. Модельная нагрузка и энергия

**Область:** Python-сводка поддержанных метрик.

**Обозначения:** P_drive,j — известная модельная мощность привода кВт; t_j — соответствующее время контакта/резания мин; E — кВт·ч.

```text
EN01 P_known,max=max(P_drive,j) по известным модельным значениям
EN02 E_known=Σ(P_drive,j·t_j/60), кВт·ч
```

[Порядок применения EN](#применение-en).

### C. Денежные строки, партия, надбавка и округление

**Область:** Отдельная команда стоимости Python.

**Обозначения:** Rчас — ставка за час; unit_price/quantity — цена/количество строки; N — детали партии; K — коэффициент надбавки; bucket — одна валюта и price_basis; q — денежный квант.

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

[Порядок применения C](#применение-c).

### RS. Резерв стоимости и полнота итога

**Область:** Python-реестр резервных групп.

**Обозначения:** B_group — база выбранных work keys; ratio — доля; upper_amount — верхний денежный сценарий; amount — явно заданный резерв; bucket — валюта/ценовое основание.

```text
RS01 B_group=ΣC_key
RS02 R_ratio=B_group·ratio
RS03 R_upper=max(0, upper_amount−B_group)
RS04 R_explicit=amount при method=manual_amount
RS05 R_unknown=UNKNOWN при method=unknown или недостаточном основании
RS06 R_bucket=ΣR_group, только если все нужные R_group известны
```

[Порядок применения RS](#применение-rs).

### Q. Численная согласованность расчётов

**Область:** Адаптер, методы Go и проверочный контур.

**Обозначения:** actual/expected — сравниваемые значения одной единицы; abs_tol/rel_tol — абсолютный/относительный допуск арифметики.

```text
Q01 abs(actual−expected) ≤ max(abs_tol, rel_tol·abs(expected))
Q02 constant-n close: abs(a−b) ≤ max(10⁻⁹, 10⁻¹⁰·max(abs(a),abs(b)))
Q03 сверка объёма адаптером Metall: abs(V_Go−V_expected) ≤ max(10⁻⁸,abs(V_expected)·10⁻¹²)
```

[Порядок применения Q](#применение-q).

### W. Сопоставление с Walter

**Область:** Методическое сравнение; не производственное начисление.

**Обозначения:** F_Walter/T_Walter — показатели сравниваемой методики; η — КПД; 9554 и 30000/π — коэффициенты сравниваемых определений момента.

```text
W01 F_cut=F_Walter·η
W02 T_cut=T_Walter·(30000/π)/9554
```

[Порядок применения W](#применение-w).

### AG. Дополнительная геометрия и сравнение масс

**Область:** Дополнительные и прежние геометрические модули.

**Обозначения:** D1/D2 — диаметры усечённого конуса; a/b — стороны; S — размер шестигранника между гранями; V_blank/V_finished — объёмы; m_stamp/m_final — масса штампа/расчёта.

```text
AG01 V_frustum = π·L·(D1²+D1·D2+D2²)/12
AG02 V_rect = a·b·L
AG03 A_hex = √3·S²/2; V_hex = √3·S²·L/2, S - размер между гранями
AG04 V_bore = π·d²·L/4
AG05 V_finished,hollow = max(0, V_finished,solid−V_bore)
AG06 V_removed,preliminary = max(0, V_blank−V_finished,simplified)
AG07 material_utilization = V_finished/V_blank при V_blank>0
AG08 D_enclosing_square = S·√2
AG09 D_enclosing_hex = 2·S/√3
AG10 Δm_relative = (m_final−m_stamp)/m_stamp при допустимой m_stamp>0
```

[Порядок применения AG](#применение-ag).

### AB. Прежние проверки прутка и кривизны

**Область:** Дополнительные/прежние Python-селекторы.

**Обозначения:** A/B — размер готовой детали/верхнее отклонение; A1/B1 — размер проката/величина отклонения в конкретной старой модели; c%/q — кривизна в процентах/мм на метр; L_basis — база установки.

```text
AB01 C=A+B, B - верхнее отклонение готового размера с исходным знаком
AB02 stock_min=A1−abs(B1), если B1 в этой модели хранится как положительная величина
AB03 пригодность сечения: stock_min≥C
AB04 k_percent=c%/100; k_mm_per_m=q/1000
AB05 curvature_diameter_deduction=L_cut·c%/100
AB06 required_stock_min=D_required+curvature_diameter_deduction
AB07 remaining_radial_surplus=(D_stock,min−required_stock_min)/2
AB08 setup_bound=L_basis·c%/100
AB09 radial_surplus=(D_stock,min−D_required)/2
AB10 residual=radial_surplus−setup_bound
```

[Порядок применения AB](#применение-ab).

### AC. Прежний раскрой прутка

**Область:** Прежние Python-контракты и helpers.

**Обозначения:** L_blank/L_supply — отрезок/поставка; k — пропил; N — потребность; face_allowance — торцевой припуск; L_developed — развёрнутая длина; reserve — запас.

```text
AC01 piece_consumption=L_blank+k
AC02 parts_per_bar=floor(L_supply/piece_consumption)
AC03 bars_required=ceil(N/parts_per_bar)
AC04 total_requested=bars_required·L_supply
AC05 consumed=N·piece_consumption
AC06 waste=total_requested−consumed
AC07 L_cut=L_base+2·face_allowance
AC08 pieces=floor(L_supply/(L_cut+k))
AC09 L_piece=L_developed+reserve, если доступна развёрнутая длина
AC10 consumed=N·L_piece+cut_count·k+end_waste
AC11 available=L_supply·supply_bar_count
```

[Порядок применения AC](#применение-ac).

### AS. Лист и сеточный раскрой

**Область:** Дополнительная/прежняя ветвь; не фигурный nesting.

**Обозначения:** W/L — ширина/длина; thickness — толщина; k — междетальный пропил; N — количество; flatness — мм/м; requested/blank/waste_area — закупленная/полезная/остаточная площадь.

```text
AS01 thickness_min=thickness_nom+δ_lower
AS02 thickness_required=thickness_part+δ_upper+allowance
AS03 thickness_min≥thickness_required
AS04 (W_sheet≥W_piece и L_sheet≥L_piece)
       либо (W_sheet≥L_piece и L_sheet≥W_piece), если допустим поворот
AS05 flatness_coefficient=flatness_mm_per_m/1000
AS06 columns=floor((W_sheet+k)/(W_piece+k))
AS07 rows=floor((L_sheet+k)/(L_piece+k))
AS08 capacity=columns·rows
AS09 sheets=ceil(N/capacity)
AS10 requested_area=sheets·W_sheet·L_sheet
AS11 blank_area=N·W_piece·L_piece
AS12 waste_area=requested_area−blank_area
```

[Порядок применения AS](#применение-as).

### AT. Трубный прокат и нормативные пределы

**Область:** Дополнительный/прежний трубный selector.

**Обозначения:** D/d — наружный/внутренний диаметр; s — стенка; δ — подписанное отклонение; inner_allowance — припуск отверстия в данной модели; band — применимая нормативная полоса.

```text
AT01 d_nom=D_nom−2s_nom
AT02 D_outer,min=D_nom+δD_lower
AT03 s_min=s_nom+δs_lower
AT04 d_inner,max=D_nom+δD_upper−2·(s_nom+δs_lower)
AT05 d_inner,lower_deviation=δD_lower−2δs_upper
AT06 d_inner,upper_deviation=δD_upper−2δs_lower
AT07 required_hole=d_part,min−inner_allowance
AT08 required_length=L_part+length_allowance
AT09 D_outer,min≥D_outer,required
AT10 d_inner,max≤required_hole
AT11 d_nom>0; L_available≥required_length при известной доступной длине
AT12 deviation=band_value, если единица полосы мм
AT13 deviation=nominal·band_percent/100, если единица полосы проценты
AT14 q_mm_per_m/1000 - преобразование прямолинейности в коэффициент
```

[Порядок применения AT](#применение-at).

### AM. Справочная масса сортамента

**Область:** Каталожное отображение с принятой плотностью стали.

**Обозначения:** D/S/s — диаметр/сторона или размер между гранями/толщина; m′ — кг/м; m″ — кг/м²; L — мм.

```text
AM01 круг, кг/м: m'=0,0061654·D²
AM02 квадрат, кг/м: m'=0,00785·S²
AM03 шестигранник, кг/м: m'=0,006798·S²
AM04 лист, кг/м²: m''=7,85·s
AM05 труба, кг/м: m'=0,0246615·s·(D−s)
AM06 масса отрезка, кг: m=m'·L_mm/1000
```

[Порядок применения AM](#применение-am).

### BG. Развёртка гнутого круглого прутка

**Область:** Дополнительный геометрический модуль; вне основного compact DETAIL.

**Обозначения:** d — диаметр прутка; R_axis — радиус оси; α_turn — угол поворота; l_virtual — размер до теоретической вершины; W/H — наружный габарит П-образной детали; c=π/2−2<0.

```text
BG01 R_axis=R_inside+d/2
BG02 R_axis=R_outside−d/2
BG03 α_turn=180°−α_internal, если размер задан внутренним углом
BG03a α_turn=atan2(y,x)·180/π для поддержанного задания угла уклоном
BG04 l_arc=π·R_axis·α_turn/180
BG05 setback=R_axis·tan(α_turn·π/360), для α_turn<180°
BG06 l_tangent=l_virtual−Σsetback_adjacent
BG07 L_developed=Σl_tangent+Σl_arc
BG08 R_axis,min=R_inside,min+d_min/2; R_axis,max=R_inside,max+d_max/2
BG09 R_axis,min=R_outside,min−d_max/2; R_axis,max=R_outside,max−d_min/2
BG10 α_turn,min=180−α_internal,max; α_turn,max=180−α_internal,min
BG11 l_arc,min=πR_minα_min/180; l_arc,max=πR_maxα_max/180
BG12 l_tangent,min=l_min−Σsetback_max
BG13 l_tangent,max=l_max−Σsetback_min
BG14 l_left=H−d/2−R1
BG15 l_middle=W−d−R1−R2
BG16 l_right=H−d/2−R2
BG17 L=W+2H−2d+(π/2−2)·(R1+R2)
BG18 R_i≥d/2; R1+R2≤W−d
BG19 R_i≤H−d/2; R_i≤W−1,5d
BG20 sum_R,max=min(ΣR_i,max, W_max−d_min)
BG21 L_min=W_min+2H_min−2d_max+c·sum_R,max
BG22 L_max=W_max+2H_max−2d_min+c·ΣR_i,min
```

[Порядок применения BG](#применение-bg).

### EQ. Пригодность оборудования и области режимов

**Область:** Проверки Python по известным пределам/условиям.

**Обозначения:** required/available — требование/возможность; min/max — границы интервала; D/L/m — габариты/масса; L/D — относительный вылет/глубина для области профиля.

```text
EQ01 D_workpiece≤D_machine,max
EQ02 L_workpiece≤L_machine,max
EQ03 m_workpiece≤m_machine,max
EQ04 z_global=direction·z_local+offset
EQ05 grip_length=z_end−z_start≥grip_min
EQ06 interval_overlap=[max(a,start), min(b,end)] для пересекающихся интервалов
EQ07 depth_to_diameter=L_work/D_reference
EQ08 верхний предел: совместимо при R_max≤A_max; конфликт при R_min>A_max
EQ09 нижний предел: совместимо при R_min≥A_min; конфликт при R_max<A_min
EQ10 непрерывный режим: требуемый интервал содержится в опубликованном объединении доступных диапазонов
EQ11 дискретный режим: требуемое точное значение совпадает с опубликованной ступенью
EQ12 точное требование инструмента: required_value=available_value
```

[Порядок применения EQ](#применение-eq).

### AU. Оценочные пути и повторы обработки

**Область:** Отдельные профильные/совместимые сценарии времени.

**Обозначения:** ap — глубина слоя; tool — диаметр инструмента; lanes/layers/repeats — полосы/слои/повторы; span/depth/width — оценочные размеры; approach — подход; ratio/factor — закреплённые параметры политики.

```text
AU01 фаска 45°: L_contact=leg·√2
AU02 конусный ход: L_contact=sqrt(L_axial²+((D_large−D_small)/2)²)
AU03 конусные слои: repeats=ceil((D_large−D_small)/(2·ap))+1
AU04 для плоского среза круга: r=D/2; depth=r−offset
AU05 width_chord=2·sqrt(r²−offset²)
AU06 tool_effective=min(tool_diameter, width)
AU07 lanes=1+ceil(max(width−tool_effective,0)/(tool_effective·stepover_ratio))
AU08 layers=ceil((depth+allowance)/ap)
AU09 slot_path=max(span−tool_effective,0)
AU10 face_path=span+tool_effective
AU11 L_feed=selected_path+2·approach
AU12 repeats=count·(layers·lanes+finish_passes)
AU13 span=L_envelope·span_ratio, ограниченный объявленным элементом при наличии
AU14 turn/boring repeats=max(1,ceil(D·radial_ratio/ap))
AU15 turn/boring L_feed=span+2·approach
AU16 facing/drilling proxy_path=min(D,L)·span_ratio+2·approach
AU17 milling_depth=D·radial_ratio; proxy_width=D/2
AU18 milling_layers=max(1,ceil(depth/ap))
AU19 milling_repeats=layers·lanes+finish_passes
AU20 milling_L_feed=span+tool_effective+2·approach
AU21 grinding_layers=ceil(radial_allowance/radial_step)
AU22 grinding_repeats=max(1,2·(grinding_layers+sparkout_passes))
AU23 grinding_L_feed=L_contact+2·approach
AU24 linear_saw_L_feed=D+2·approach; repeats=1
AU25 repeats_upper=ceil(repeats_base·repeat_factor)
AU26 feed_upper_scenario=feed_base·slowdown_factor
AU27 t_base=L_base·repeats_base/u_base
AU28 t_upper=L_upper·repeats_upper/u_upper
```

[Порядок применения AU](#применение-au).

### AP. Профильные услуги и временной резерв

**Область:** Отдельная оценочная ветвь Python.

**Обозначения:** m_tier — масса выбора уровня; minutes_base/upper — нормы сценариев; event_count/tool_changes — события/смены; scale — коэффициент; N — детали; proxy — гипотеза политики.

```text
AP01 m_tier=m_source·mass_multiplier, если известна только конечная/неуточнённая масса
AP02 base=(minutes_base·event_count + change_minutes_base·tool_changes)·scale_base
AP03 upper=(minutes_upper·event_count + change_minutes_upper·tool_changes)·scale_upper
AP04 setup/handling нескольких станций: Σt_station
AP05 inspection нескольких станций: max(t_station)
AP06 returns_remaining=max(0, generated_returns−thread_returns_already_counted)
AP07 return_events=max(1,returns_remaining) в оценке соответствующей неопределённой работы
AP08 return_budget=minutes_per_return·return_events
AP09 thermal_allocated_per_piece=T_thermal,batch/N при известном N
AP10 time_reserve=T_upper,batch−T_base,batch при известных полных сценариях
AP11 D_proxy=D_finished+2·radial_allowance либо явный diameter_default политики
AP12 L_proxy=L_finished+2·face_allowance либо явный length_default политики
AP13 m_proxy=π·D_proxy²·L_proxy·density_kg_per_mm³/4
```

[Порядок применения AP](#применение-ap).

### LC. Прежние экономические и временные расчёты

**Область:** Раздельные legacy/cycle/accepted/D001-ветви.

**Обозначения:** H — часы; R — ставка; m_paid/m_gross/m_credit — оплаченная/валовая/зачтённая масса; N — детали; capacity/bars — вместимость/прутки; numerator/denominator — операнды рецепта.

```text
LC01 C_material=m_kg·price_per_kg
LC02 C_material=m_kg/1000·price_per_tonne
LC03 C_material=L_mm/1000·price_per_m
LC03a C_material=price_per_piece для расчётной единичной заготовки
LC04 H_labor=H_setup,labor+N·H_labor,piece
LC05 H_machine=H_setup,machine+N·H_machine,piece
LC06 C_labor=H_labor·R_labor
LC07 C_machine=H_machine·R_machine
LC08 C_operation=C_labor+C_machine
LC09 H_setup=setup_minutes/60
LC10 H_per_part=minutes_per_unit·multiplicity/60
LC11 C_batch=N·C_material,piece+ΣC_operation,batch
LC12 C_piece=C_batch/N
LC13 T_operation=Σ(component_minutes·frequency_multiplier)
LC14 C_operation=round_0,01(T_operation·Rчас/60)
LC15 C_material,batch=round_0,01(m_kg·price_per_kg·N), когда вход задан на деталь
LC16 C_accounted=Σизвестных денежных строк
LC17 C_total=C_accounted только при полном необходимом покрытии
LC18 C_unit=round_0,01(C_total/N)
LC19 T_legacy,batch=t_legacy,piece·N+t_setup
LC20 C_legacy,batch=T_legacy,batch·Rчас/60
LC21 m_paid,batch=m_paid,unit·N, если явно задан оплачиваемый расход на деталь
LC22 m_cut+kerf,unit=m_cut·(L_cut+k)/L_cut, если выбрана оплата отрезка с пропилом
LC23 capacity=floor((L_supply−L_end)/(L_cut+k))
LC24 bars=ceil(N/capacity)
LC25 m_gross=m_bar·bars
LC26 m_reusable=max(0,m_gross−m_bar/L_supply·(bars·L_end+N·(L_cut+k)))
LC27 m_paid,batch=m_gross−m_credit
LC28 0≤m_credit≤m_reusable
LC29 t_recipe=numerator/denominator при согласованных единицах и положительном знаменателе
LC29a direct: t=minutes; length_feed: t=L_mm/u_mm_per_min
LC29b volume_rate: t=V_mm³/Q_mm³_per_min
LC30 T_route=T_setup+N·t_unit
LC31 t_route,unit=T_route/N при известном N и полном T_route
```

[Порядок применения LC](#применение-lc).

### IM. Рендер чертежа и области изображения

**Область:** Служебные преобразования до чтения модели.

**Обозначения:** W/H — пиксели или размеры страницы в соответствующем шаге; DPI — разрешение PDF; scale — масштаб рендера; bbox — границы области; margin_ratio — относительный отступ.

```text
IM01 scale=min(requested_scale, max_dimension/max(W,H), sqrt(max_pixels/(W·H)))
IM02 PDF_requested_scale=DPI/72
IM03 W_render=max(1,round(W·scale)); H_render=max(1,round(H·scale))
IM04 whole_page_scale=min(1,whole_page_max_dimension/max(W,H))
IM05 x_norm=x_provider/1000 для явно распознанного представления 0..1000
IM06 dx_margin=(x1−x0)·margin_ratio; dy_margin=(y1−y0)·margin_ratio
IM07 expanded_bbox=clip_to_0..1(x0−dx,y0−dy,x1+dx,y1+dy)
IM08 pixel_bbox=(floor(x0W),floor(y0H),ceil(x1W),ceil(y1H)), с ограничением по изображению
```

[Порядок применения IM](#применение-im).

### SYS. Длительность исполнения программы

**Область:** Диагностика; вне времени изготовления.

**Обозначения:** perf_counter — монотонный программный таймер в секундах; elapsed_ms — длительность этапа в миллисекундах.

```text
SYS01 elapsed_ms=round(max(0,perf_counter_now−started)·1000,3)
```

[Порядок применения SYS](#применение-sys).

## II. Как формулы работают в проекте

### Цепочка от источника к денежному результату

Оператор загружает чертёж и условия заказа. Служебные IM готовят изображение для моделей. Чтение/перепроверка устанавливают факты и неизвестные; числа из модели ещё должны пройти контракты, происхождение и подтверждение. U/D нормализуют единицы и пределы. S подбирает поддержанную заготовку и раскладку; B переводит её в события. DETAILING после подтверждения задаёт технологические намерения, Python P строит проходы, а Go K/T/F/L/R/DR/GR/TH/SA/MF вычисляет конкретные численные задания. TM сохраняет известные/полные минуты операций, EN — доступную нагрузку.

В новом рабочем запуске этот этап **останавливается на результатах операций**. По умолчанию `legacy_estimate=False`; `estimate={}`, `cost_estimate=None`, `time_estimate=None`. Отдельная команда оператора `cost-estimate` применяет C/RS к сохранённым основаниям и текущим ставкам. `machine-estimate` сначала пересчитывает сохранённую геометрию/режимы, затем стоимость. Оценочные AU/AP и прежние LC вызываются своими ветвями; они не являются скрытым обязательным продолжением новой загрузки.

Основание: [конец основного расчёта](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/compact_round.py:1626), [cost-estimate](F:/projects/metall-dev-2/mvp/src/metall_mvp/api/routes_parts/compact_round.py:671), [machine-estimate](F:/projects/metall-dev-2/mvp/src/metall_mvp/api/routes_parts/compact_round.py:713), [кнопка стоимости UI](F:/projects/metall-dev-2/web/src/components/route/CompactCostEstimate.tsx:90), [кнопка технического пересчёта](F:/projects/metall-dev-2/web/src/components/route/CompactMachineEstimate.tsx:18).

Предметные вычисления исполняются обычным Python/Go-кодом. Модель читает источник и предлагает технологическое содержание в контракте; строка с формулой в её тексте не превращается в исполняемую математическую программу. Недостаточность фактов, конфликты и непокрытые работы сохраняются на следующем шаге.

### Какие метрики переходят в следующие расчёты

| Методы / категории | Результат расчётного метода | Куда поступает |
| --- | --- | --- |
| `turning.longitudinal.constant-n/1`, `turning.facing.constant-n/1`, `sawing.round.area-rate/1` — T/F/SA | `metrics.cut_time_min` | Минуты прохода, затем известное/полное время операции TM |
| `turning.boring.constant-n/1`, `drilling.axial.constant-n/1`, `turning.grooving.constant-n/1` — R/DR/GR | `metrics.feed_time_min` | Минуты полного объявленного подающего хода, затем TM |
| `turning.thread.constant-n/1` — TH | Известный `cycle_time_min` имеет приоритет; иначе `feed_time_min` | Полный цикл либо известный рабочий ход с непокрытым возвратом |
| `motion.linear-feed/1` — MF/AU | `metrics.feed_time_min` | Явные `time_work_results` либо отдельный оценочный прогноз |
| Поддержанная геометрия — T/F/R/DR/GR/SA | `metrics.removed_volume_mm3` | Сохранённая геометрическая метрика и проверка адаптера; не готовая цена материала |
| Поддержанная силовая модель — L/R | Мощность привода и время соответствующего контакта/резания | `details[].load_summary`, EN; без автоматического энергетического начисления |
| `sawing.round.batch-events/1` — B | Количества событий | TM09/TM10 и инвентарь работ в `cost_inputs`, без собственных минут/цен |
| C/RS | Строки, суммы и состояния полноты | Сохранённый `cost_estimate`, затем экран стоимости |

Выбор временной метрики определён в [check_response](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/machining_adapter.py:199), сведение проходов — в [calculate_details](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/compact_round.py:1536), дополнительные работы — в [evaluate_time_works](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/compact_work_time.py:54), проекция на деньги — в [cost_inputs](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/compact_estimation.py:1251). Следующие подразделы раскрывают алгоритм каждой категории.


### Применение U

**Единицы и численное представление. Записи U01–U06; область: Общие преобразования.**

**Исходные данные.** Размеры приходят из подтверждённого чтения/паспортных данных, режимы — из численных оснований, плотность и другие свойства — из справочного ответа. У каждого значения проверяются единица, допустимость и происхождение. Число без единицы нельзя автоматически принять за мм или минуты.

**Порядок.** Сначала приводятся совместимые единицы через отношение масштабов U01; U02–U05 фиксируют наиболее важные частные переходы. Углы в тригонометрии переводятся в радианы. Для свойств Splav U06 раскрывает десятичный коэффициент, затем проверяется/преобразуется единица свойства. Само раскрытие числа не подтверждает, что свойство является плотностью нужного материала.

**Дальнейшее использование.** Нормализованные размеры подставляются в D/S/G/P и геометрию Go, плотность — в G06, минуты и часовая ставка — в C01. Преобразование минут в часы выполняется один раз при начислении стоимости. Оно не изменяет сохранённое производственное время в минутах.

**Реализация и основания:** [passport/units.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/passport/units.py:72), [Go units](F:/projects/metall-dev-2/machining-calc/units), [Раскрытие чисел Splav](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/splav_material_runtime.py:251).

### Применение D

**Размеры, отклонения и размерные цепи. Записи D01–D09; область: Основные и дополнительные геометрические основания.**

**Исходные данные.** Нужны номиналы, подписанные отклонения и применимые записи НСИ. Допуск из таблицы выбирается по стандарту, диапазону размера и обозначению; здесь нет универсальной формулы, восстанавливающей любую посадку из одного названия.

**Порядок.** D01/D02 складывают номинал с отклонением. Внешняя потребность D03 добавляет требуемый припуск к верхней границе. Внутренний гарантированный размер трубы D04 получает неблагоприятное сочетание наружного диаметра и толщины. Поддержанная линейная цепь D05/D06 суммирует номиналы и предельные длины. D07–D09 размещают известную ширину IT для H, h или симметричного поля.

**Дальнейшее использование.** Пределы становятся потребностью подбора S01/S02, входом трубных/листовых проверок AT/AS и целями геометрических переходов P/G. Это предельные размеры детали, а не готовые режимы. Неопределённое отклонение не объявляется нулевым; известный номинал можно сохранить отдельно от неизвестной гарантированной границы.

**Реализация и основания:** [stock_fit_safety.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/stock_fit_safety.py:40), [axial_length_chain.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/axial_length_chain.py:62), [linear_tolerance_rules.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/linear_tolerance_rules.py:68), [tolerances.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/tolerances.py:113).

### Применение S

**Подбор круглого проката и раскладка партии. Записи S01–S32; область: Основной Go-сервис stock-selection/2.**

**Исходные данные.** Python готовит запрос `stock-selection/2`: распознанная форма, размерная потребность, количество и закреплённые JSON-пакеты норм/условий. Go читает пакеты по ссылкам с хешами. Отдельно сохраняются назначение исходного чертежа и рассчитанная рекомендация; рекомендация не меняет назначение сама.

**Порядок.** S01–S06 получают длину отрезка: припуски, компенсация недобора, округление вверх по известному шагу, затем запас на перебор. S07/S08 проверяют эффективный диаметр со строгим `>`; равенство недостаточно. S09–S11 считают доступную длину и вместимость после начальной обрезки, её пропилов и хвоста. Без известного отклонения длины используется только явно разрешённое номинальное допущение. Неподдержанная форма возвращает ограничение.

Сначала выбирается минимальный подходящий диаметр. Для него S12–S17 ищут комплект прутков, минимизируя закупаемую номинальную длину, затем число прутков. Критерий не является минимумом рублей или обрезков. После выбора S18–S32 раскладывают фактические группы и проверяют баланс. Остаток уже содержит оставшийся хвост: добавлять хвост повторно как потерю нельзя.

**Сохранение и подстановка.** Ответ содержит `selected_stock`, `piece`, `batch_plan`, `material_balance` и `input_sha256`; Python сохраняет проверенный ответ и кэш. Диаметр/длина выбранной применимой заготовки идут в детализацию, геометрию отрезки и проверки станка. Баланс и группы идут в B. Сам ответ не содержит производственных минут и цен; стоимость материала требует отдельного экономического основания.

**Реализация и основания:** [engine.go](F:/projects/metall-dev-2/stock-selection/selection/engine.go:233), [layout.go](F:/projects/metall-dev-2/stock-selection/selection/layout.go:5), [decimal.go](F:/projects/metall-dev-2/stock-selection/selection/decimal.go:96).

### Применение B

**События резки партии. Записи B01–B07; область: Доступный Go-метод sawing.round.batch-events/1.**

**Исходные данные.** Метод получает сохранённую материальную раскладку, а не произвольное количество со слов пользователя. B01/B02 пересчитывают количество деталей и прутков из групп. Проверяются положительность, точные десятичные отношения и согласованность итогов.

**Порядок.** B03 восстанавливает единичный пропил из суммарного разделительного пропила и N. B04/B05 получают число начальных резов и требуют целое допустимое значение на пруток. B06/B07 создают события разделения, начальной обрезки, загрузки и подачи. Число зажимов остаётся `UNKNOWN`, когда раскладка не содержит достаточного основания.

**Подстановка.** События сохраняются в результате расчёта отрезки с привязкой к тому же входу подбора. `_stock_batch_time_items` использует загрузки и начальные резы для TM09/TM10, только если совпадают текущий хеш, количество и применимые нормы/резы. Количество событий не является минутами. Разделительные резы детали, общая загрузка прутков и наладка различаются, чтобы одна работа не начислялась дважды.

**Реализация и основания:** [bandsaw_batch.go](F:/projects/metall-dev-2/machining-calc/calc/bandsaw_batch.go:1), [формульный реестр](F:/projects/metall-dev-2/machining-calc/calc/formulas.go:12).

### Применение G

**Объёмы, массы и материальный баланс. Записи G01–G16; область: Геометрические модули; применимость зависит от представления.**

**Исходные данные.** Требуются поддержанное представление геометрии, согласованные оси/координаты и численные размеры. Масса требует отдельной плотности с источником. Наличие записанной массы в штампе не означает, что плотность или геометрия уже подтверждены.

**Порядок.** G01–G04 считают круг/кольцо и их призматические объёмы. G09 приводит локальные оси к общей системе; G10 получает габарит. G05 суммирует разрешённые неперекрывающиеся участки. При допустимом переходе G07 вычисляет разность состояний, G06/G08 переводят объём в массу. Недопустимый отрицательный съём не следует исправлять нулём: `max(0,...)` существует только в отдельных прежних упрощениях AG.

G11–G16 относятся к геометрическому балансу: объём поставки, деталей, пропилов, концов и остатка. Количество резов/потери берутся из конкретного контракта; остаток не объявляется стружкой автоматически.

**Подстановка.** Геометрические объёмы и массы доступны паспортным/расчётным проекциям, проверкам оборудования EQ и экономическим ветвям с подтверждённой базой оплаты. В новом Go-расчёте объём каждого прохода выводится своим методом T/F/R/DR/GR/SA. Ни вычисленная масса, ни материальный баланс сами по себе не создают строку `material` в новой смете.

**Реализация и основания:** [geometry_primitives.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/geometry_primitives.py:13), [round_geometry.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/round_geometry.py:112).

### Применение P

**Локальное построение проходов. Записи P01–P15; область: Основной путь Python перед вызовом Go.**

**Исходные данные.** DETAILING задаёт технологические цели и режимные основания; Python связывает их с принятыми размерами и применимым состоянием материала. Новый intent не передаёт готовый ручной список физических проходов. `prepare_operation` выбирает режим, после чего `plan_passes` строит поддержанную последовательность.

**Порядок.** P01/P02 оставляют заданный радиальный припуск. P03/P04 разбивают разность на слои, последний слой ограничен остатком. Для наружного/внутреннего диаметра размерный шаг равен `2·ap_max`; для торца — `ap_max` по осевой глубине. P05/P06 получают фактическую радиальную глубину каждого слоя. P07–P09 различают контакт и полный путь подачи; явный путь имеет приоритет перед суммой.

P10–P15 строят положения канавочного резца. Последнее положение может перекрываться: полный ход сохраняется, но `newly_removed_width_mm` учитывает только новую полосу. `overlap_width_mm` равна ширине резца минус новая ширина. Нельзя уменьшать время перекрытого хода пропорционально новому объёму.

**Подстановка.** Слои превращаются в `passes`, затем `calculator_request` собирает задания Go. Геометрия/состояния сохраняются в `calculation_inputs`, запросы и ответы — в `details[].calculations`. Продольный прежний Go-метод использует контактную `cut_length_mm`; подходы/выходы/возвраты требуют отдельного покрытия времени, хотя полный путь известен планировщику.

**Реализация и основания:** [pass_planning.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/pass_planning.py:351), [manual_passes.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/manual_passes.py:88), [Сохранение расчётных входов](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/compact_round.py:1313).

### Применение K

**Кинематика постоянных оборотов. Записи K01–K06; область: Общее основание методов обработки.**

**Исходные данные.** Нужны режимные величины и определённый опорный диаметр. В основной подготовке заполненные рабочие режимы карточки станка имеют собственное происхождение и могут заменять справочный профиль; название марки станка само по себе не задаёт чисел.

**Порядок.** K01/K02 переводят скорость и обороты при согласованном `D_ref`. Если контракт допускает одновременно n и v, их согласованность проверяется Q02. K03 получает подачу в минуту. K04/K05 различают время полного подающего движения и время контакта. K06 усредняет объём по полному времени подачи.

**Подстановка.** n/u поступают в T/F/R/DR/GR/TH; `t_feed`, `t_engaged` и Q возвращаются как разные метрики. Средняя производительность по полному ходу не подставляется вместо контактной нагрузки. Эти зависимости не реализуют автоматически постоянную скорость резания по всему изменяющемуся радиусу.

**Реализация и основания:** [engine.go](F:/projects/metall-dev-2/machining-calc/calc/engine.go:270), [resolveConstantN](F:/projects/metall-dev-2/machining-calc/calc/boring.go:79).

### Применение T

**Продольное наружное точение. Записи T01–T06; область: Go-метод turning.longitudinal.constant-n/1.**

**Исходные данные.** Один проход получает наружный диаметр, радиальную глубину, контактную длину и режим. Его a уже определена планировщиком, а не восстановлена из ожидаемого времени.

**Порядок.** T01 выводит конечный диаметр, T02 — площадь кольца, T03 — снятый объём. T04/T05 рассчитывают производительность и время контактного хода. T06 берёт средний диаметр кольца для средней скорости силовой модели L.

**Подстановка.** Go возвращает объём/время/производительность и доступные нагрузки с evidence. Python сохраняет ответ, принимает минуты через адаптер и суммирует их в `known_machine_minutes_per_part`; полное время присваивается только при покрытии обязательных работ. Время подготовки и свободного движения не возникает из T05 автоматически.

**Реализация и основания:** [engine.go](F:/projects/metall-dev-2/machining-calc/calc/engine.go:225).

### Применение F

**Торцовка. Записи F01–F05; область: Go-метод turning.facing.constant-n/1.**

**Исходные данные.** Заданы кольцевая область торца, осевая глубина слоя и режим. Python строит осевые слои с учётом оставляемого припуска.

**Порядок.** F01 переводит разность диаметров в радиальный путь, F02 считает объём слоя. F03 делит контактный путь на подачу, F04 получает объёмную производительность, F05 — среднюю скорость на выбранном кольце. Множители 2 и 4 обусловлены переходом от диаметров к радиусам и площадью круга.

**Подстановка.** Время идёт в сумму проходов TM; средняя скорость — в силу/мощность L; объём остаётся самостоятельной метрикой. Подход к торцу, выход, наладка и вспомогательные действия требуют собственных оснований покрытия.

**Реализация и основания:** [engine.go](F:/projects/metall-dev-2/machining-calc/calc/engine.go:250).

### Применение L

**Сила, мощность и крутящий момент. Записи L01–L06; область: Поддержанные токарные/расточные модели Go.**

**Исходные данные.** Нужны подача, глубина, углы, коэффициенты материала и КПД с допустимыми единицами/диапазонами. Профиль и источник коэффициентов являются частью основания. Отсутствующий коэффициент не выводится из мощности станка.

**Порядок.** L01 считает толщину стружки. L02 корректирует удельную силу по толщине и принятой зависимости переднего угла. L03 умножает её на площадь среза `a·f`. L04 переводит работу силы при средней скорости в кВт, L05 — в момент, L06 делит на КПД для модельной мощности привода.

**Подстановка.** Поддержанные нагрузки возвращаются в метриках Go и идут в `load_summary`: максимум и энергия EN. Их используют проверки пригодности там, где есть соответствующие известные пределы/условия. Это не отдельная денежная строка. Модуль не переносит ту же силовую модель автоматически на сверление, резьбу, канавку или любой станок.

**Реализация и основания:** [engine.go](F:/projects/metall-dev-2/machining-calc/calc/engine.go:265), [boring.go](F:/projects/metall-dev-2/machining-calc/calc/boring.go:265).

### Применение R

**Расточка. Записи R01–R10; область: Go-метод turning.boring.constant-n/1.**

**Исходные данные.** Заданы начальный и конечный внутренние диаметры, контактная длина, полный путь и согласованный режим постоянных оборотов. Python проверяет переход от состояния и строит слои; пустое отверстие нельзя выдумать из конечного размера.

**Порядок.** R01–R03 определяют глубину, площадь и объём. R04 отдельно считает контакт и полный путь. R05/R06 возвращают установившуюся и среднюю производительность. R07–R10 вычисляют контактную скорость, мощность и момент с силовой моделью L. Воздушная часть хода увеличивает время подачи, но не объём и не контактную мощность.

**Подстановка.** Для времени операции принимается подходящая временная метрика метода. Контактные значения используются для EN; диаметры и глубины — для проверки станка/области режима EQ. Два определения Q сохраняются различимыми и не используются для обратной подгонки исходной геометрии.

**Реализация и основания:** [boring.go](F:/projects/metall-dev-2/machining-calc/calc/boring.go:265).

### Применение DR

**Сверление. Записи DR01–DR09; область: Go-метод drilling.axial.constant-n/1.**

**Исходные данные.** Контракт различает глухое и сквозное отверстие. Нужны диаметр, подача/обороты и достаточные данные пути. Для вывода требуемого хода дополнительно нужны угол вершины и соответствующие глубина/толщина/выход.

**Порядок.** DR01/DR02 задают сечение и идеальную коническую вершину. Для глухого отверстия DR03 добавляет вершину к глубине полного диаметра; DR05 считает цилиндр и треть конусного объёма. Для сквозного DR04 включает проход вершины и выход, но DR06 снимает только объём находившегося в детали материала. DR07–DR09 считают полный ход и две производительности.

**Подстановка.** Метрики сохраняются с заданием и идут в время/покрытие TM. Без достаточной геометрии соответствующая метрика остаётся неизвестной. Метод не моделирует цикл стружколомания/периодических выводов и не создаёт полную силовую модель сверления.

**Реализация и основания:** [drilling.go](F:/projects/metall-dev-2/machining-calc/calc/drilling.go:1).

### Применение GR

**Радиальная канавка. Записи GR01–GR08; область: Go-метод turning.grooving.constant-n/1.**

**Исходные данные.** Каждый радиальный врез получает два разных размера ширины из P: ширину резца и новую полосу съёма. Проверяется GR01. Нужны диаметры, режим и известный либо выводимый путь.

**Порядок.** GR02/GR03 получают контактный и при разрешённых условиях полный путь. GR04 считает только новый объём. GR05/GR06 сохраняют полный радиальный ход и его время, даже если финальное положение перекрывает уже снятую полосу. GR07/GR08 различают контактную и усреднённую производительность.

**Подстановка.** Время каждого вреза суммируется в TM, новая геометрия — в последовательность состояний. Неизвестная силовая модель канавки остаётся неизвестной; уменьшение новой ширины не разрешает пропорционально уменьшить полный ход.

**Реализация и основания:** [grooving.go](F:/projects/metall-dev-2/machining-calc/calc/grooving.go:1).

### Применение TH

**Резьбовой ход. Записи TH01–TH08; область: Go-метод turning.thread.constant-n/1.**

**Исходные данные.** В поддержанной области подача за оборот равна шагу однозаходной резьбы. Число ходов/глубины являются отдельным технологическим основанием, а не результатом формулы винтового объёма. Для полного цикла нужны длина и подача возврата либо явный нулевой возврат.

**Порядок.** TH01–TH03 считают рабочее движение. TH04–TH06 добавляют возврат, если он определён; отсутствие значения не равно явно заданному нулю TH05. Для пружинного хода номинальный новый объём и Q нулевые при положительном времени TH07. Для режущего резьбового хода точный объём/производительность остаются `UNKNOWN` TH08.

**Подстановка.** Workflow предпочитает известный `cycle_time_min`. Если известен только рабочий ход, возврат сохраняется как непокрытая работа, а не исчезает из полного времени. Обратное движение, уже включённое в цикл, не должно второй раз попасть в оценочный бюджет возвратов AP06.

**Реализация и основания:** [thread_turning.go](F:/projects/metall-dev-2/machining-calc/calc/thread_turning.go:1).

### Применение SA

**Ленточнопильный рез по площади. Записи SA01–SA04; область: Go-метод sawing.round.area-rate/1.**

**Исходные данные.** Заданы диаметр выбранного круга, ширина пропила и производительность применимого профиля/карточки. В основном workflow диаметр задания сверяется с выбранным номиналом проката.

**Порядок.** SA01 вычисляет площадь сечения. SA02 переводит мм² в см² и делит на производительность. SA03 считает объём пропила, SA04 связывает его с площадной производительностью. Скорость полотна — отдельная величина; подстановка её вместо R размерностно неверна.

**Подстановка.** Время единичного разделительного реза относится к детали. Для начальной обрезки партии `_head_cut_time` ищет единственное подходящее сохранённое основание реза по диаметру, пропилу и профилю; затем TM10 умножает его на число событий. Загрузка прутка считается своей нормой TM09, не через площадь.

**Реализация и основания:** [bandsaw.go](F:/projects/metall-dev-2/machining-calc/calc/bandsaw.go:1), [Проекция начального реза](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/compact_estimation.py:1099).

### Применение MF

**Явное линейное движение. Записи MF01–MF05; область: Go-метод motion.linear-feed/1.**

**Исходные данные.** Вход объявляет один режим подачи: готовая минутная подача, подача на оборот или подача на зуб. Нужны путь и число повторов. Проверяются операнды выбранного режима; неподтверждённые режимы не подбираются из ожидаемого времени.

**Порядок.** MF01 разворачивает повторы в суммарный путь, одна из MF02–MF04 получает u, MF05 делит путь на u. Этот метод не вычисляет снятый объём, силы и мощность.

**Подстановка.** `evaluate_time_works` использует его для явных дополнительных работ времени и сохраняет `time_work_results` с входом, запросом, ответом и минутами. `project_time_works` привязывает время к нужным работам; покрытие должно быть полным, без пересечений и ниже известной суммы опускаться не может. Оценочные движения AU также вызывают этот метод, сохраняя оценочное происхождение.

**Реализация и основания:** [linear_feed.go](F:/projects/metall-dev-2/machining-calc/calc/linear_feed.go:1), [Дополнительные работы](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/compact_work_time.py:54), [Привязка покрытия времени](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/work_time_inputs.py:166).

### Применение TM

**Нормы, суммирование времени и партия. Записи TM01–TM10; область: Основные результаты операций; итоговый снимок — по отдельной ветви.**

**Исходные данные.** Минуты берутся из проверенных ответов Go, явных допустимых работ и применимых закреплённых норм. Работы имеют частоту `per_piece` или `per_batch`, общую группу наладки и состояние покрытия. Нормы — исходные данные, а не физические константы.

**Порядок.** TM01/TM02 умножают норму на события в своей области и суммируют. TM03 сохраняет известную часть проходов. TM04 допускает полную сумму только при достаточности всех необходимых проходов/работ. TM05–TM08 распространяют повторяемое время на N и добавляют общие события ровно один раз. При неизвестном N фиксированная известная часть не обязана исчезать, но повторяемый итог не выдумывается.

TM09/TM10 описывают связь раскладки с временем: загрузка — норма на число прутков, начальный рез — применимое время единичного реза на число начальных резов. Для этих строк проверяются актуальность подбора, единственный владелец пильной операции и применимость оснований.

**Сохранение и подстановка.** Обычный DETAIL сохраняет в `details` поля `known_machine_minutes_per_part`, а при полноте — `machine_minutes_per_part`, `total_minutes_per_part`, `batch_minutes`; это не автоматический `time_estimate`. Денежная команда проецирует сохранённые основания в строки C. `build_manufacturing_time` отдельно строит снимок полного/известного времени для вызывающих его оценочных/совместимых ветвей.

**Реализация и основания:** [apply_time_profiles](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/compact_estimation.py:837), [calculate_details](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/compact_round.py:1377), [time_estimate.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/time_estimate.py:265), [Загрузки и начальные резы партии](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/compact_estimation.py:1133), [Поля времени операции](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/compact_round.py:1555).

### Применение EN

**Модельная нагрузка и энергия. Записи EN01–EN02; область: Python-сводка поддержанных метрик.**

**Исходные данные.** `load_summary` читает сохранённые ответы проходов и выбирает согласованную пару мощности и времени. Для контактной расточной нагрузки берётся контактное время; нельзя умножать её на произвольно увеличенное полное время воздушных движений.

**Порядок.** EN01 берёт максимум только известных модельных значений. EN02 суммирует энергию соответствующих интервалов. Неизвестные нагрузки не превращаются в ноль и не дают полного энергетического баланса.

**Сохранение и подстановка.** Сводка хранится в `details[].load_summary` и может показываться с ограничениями оборудования. Она не включает всю электроэнергию станка, холостой ход, вспомогательные потребители и не является измеренным пиком. В новой смете нет автоматического начисления `E·тариф_электроэнергии`; стоимость C01 строится от времени и ставки.

**Реализация и основания:** [load_summary](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/compact_estimation.py:1048).

### Применение C

**Денежные строки, партия, надбавка и округление. Записи C01–C12; область: Отдельная команда стоимости Python.**

**Условие запуска.** После сохранённых результатов оператор запускает `cost-estimate`. Обработчик проверяет ревизию, состояние, наличие `details` и влияние количества; получает текущие ставки карточек и вызывает `build_cost_snapshot`. Он не запускает модель или повторное вычисление проходов. Команда `machine-estimate` сначала пересчитывает сохранённые технические входы по карточкам, затем собирает стоимость. GET только читает.

**Порядок.** `cost_inputs` строит независимый инвентарь обязательных работ и строки времени/цены. Ставки карточек привязываются к операциям, включённые категории инструмента/накладных не начисляются второй раз. C01–C03 выбираются по типу строки. C04–C06 переводят повторяемую строку на партию. Перед C07 обходятся `included`-ссылки, проверяются циклы/пропуски, исключаются дубли общей наладки; разные валюты и ценовые основания не смешиваются.

C08/C09 применяют надбавку один раз к известной обработке, исключая `material` и `material-credit`. Повторный пересчёт берёт исходную базу, а не ранее увеличенную сумму. C10/C11 добавляют надбавку и известный резерв. C12 задаёт `ROUND_HALF_UP` и квант валюты: исходные `computed_batch_amount` суммируются без денежного округления каждой строки, затем округляются база группы, резерв и отдельно надбавка. Браузерное форматирование не заменяет этот порядок.

**Сохранение и подстановка.** Сохраняется `cost_estimate` со строками, инвентарём, totals, закреплёнными ставками, коэффициентом, состояниями и хешем входа. UI показывает известную обработку, надбавку, промежуточную сумму, резерв и полный итог только при полноте. Отсутствующий материал/цена/работа остаётся неизвестным. Синтетическая цена `mock/demo/fixture` не становится коммерческой; независимо известные минуты сохраняются.

**Реализация и основания:** [estimate.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/estimate.py:24), [apply_processing_markup](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/estimate.py:183), [pricing.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/pricing.py:16), [Команда стоимости](F:/projects/metall-dev-2/mvp/src/metall_mvp/api/routes_parts/compact_round.py:671), [Денежное округление](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/estimate.py:24), [Группировка сумм](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/estimate.py:289).

### Применение RS

**Резерв стоимости и полнота итога. Записи RS01–RS06; область: Python-реестр резервных групп.**

**Исходные данные.** Резервная группа явно задаёт охватываемые работы и метод: `manual_amount`, `manual_ratio`, `scenario` либо `unknown`. Универсального метода `none` нет; явная нулевая сумма допустима как численный ввод соответствующего метода.

**Порядок.** RS01 собирает базу по закреплённым ключам и денежной группе. Для относительного/сценарного резерва нужна полная подходящая база. RS02 умножает её на долю; RS03 берёт положительную разницу верхней суммы и базы; RS04 использует явно заданную сумму со своим основанием. RS05 сохраняет неизвестность, RS06 суммирует только при известности всех необходимых групп.

**Подстановка.** Результат поступает в денежную сборку C11. Наличие известной обработки не разрешает публиковать полный итог без необходимого резерва/работ. Временной резерв AP10 имеет единицу минут и не подставляется как денежная сумма без отдельного допустимого основания.

**Реализация и основания:** [reserve.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/reserve.py:28), [сборка состояний](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/estimate.py:224).

### Применение Q

**Численная согласованность расчётов. Записи Q01–Q03; область: Адаптер, методы Go и проверочный контур.**

**Порядок.** Q01 — общая форма численного сравнения с допусками конкретной метрики. Q02 применяется при согласовании постоянных оборотов и связанных режимных чисел. Q03 — проверка переданного ожидаемого объёма в `check_response`. До принятия минут адаптер проверяет метод, версии, канонический запрос/хеш, наборы данных, outcome и состояние метрики; отдельная явная проверка единицы времени в этом helper есть для `motion.linear-feed/1`.

**Граница проверки.** В текущем цикле `compact_round.calculate_details` параметр `expected_volume` берётся из уже возвращённой метрики Go. Поэтому Q03 именно в этом вызове не является независимым пересчётом геометрического объёма Python. Само наличие условия в адаптере не доказывает независимую двойную проверку.

**Дальнейшее использование.** Только принятые минуты/ответы идут в TM и C. Ошибка или неизвестная метрика оставляет расчёт/работу неполными. Эти допуски не являются допусками изготовления, запасом материала или точностью эмпирической нормы.

**Реализация и основания:** [METHODS.md](F:/projects/metall-dev-2/machining-calc/docs/METHODS.md:101), [boring.go](F:/projects/metall-dev-2/machining-calc/calc/boring.go:103), [machining_adapter.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/machining_adapter.py:189), [Источник expected_volume](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/compact_round.py:1529), [Проверка ответа](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/machining_adapter.py:158).

### Применение W

**Сопоставление с Walter. Записи W01–W02; область: Методическое сравнение; не производственное начисление.**

**Назначение.** Эти зависимости описывают согласование определений при сравнении расчётного ядра с Walter. W01 устраняет различие трактовки силы с учётом КПД; W02 согласует использованные коэффициенты перевода мощности/оборотов в момент.

**Алгоритм и результат.** Сначала сравниваются одинаковые входы, единицы и определения метрик, затем применяется соответствующая зависимость сравнения. Это методическое/проверочное основание, а не скрытая поправка рабочего ответа.

**Подстановка.** W не прибавляется к L и не начисляет стоимость. Рабочие показатели вычисляются явными формулами выбранного метода; сравнение должно сохранять версии метода, коэффициенты и исходные определения.

**Реализация и основания:** [WALTER.md](F:/projects/metall-dev-2/machining-calc/docs/WALTER.md), [METHODS.md](F:/projects/metall-dev-2/machining-calc/docs/METHODS.md:85).

### Применение AG

**Дополнительная геометрия и сравнение масс. Записи AG01–AG10; область: Дополнительные и прежние геометрические модули.**

**Исходные данные и порядок.** Геометрические примитивы считают усечённый конус AG01, прямоугольник AG02, шестигранник AG03 и отверстие AG04. Прежняя упрощённая стратегия AG05/AG06 вычитает геометрию с ограничением нулём; её нельзя переносить в строгую проверку нового перехода. AG07 считает использование объёма, AG08/AG09 — охватывающий круг квадратного/шестигранного сечения.

**Применение.** Эти результаты используются в прежней предварительной оценке заготовки, габаритах и массовых сравнениях. AG10 сравнивает расчётную массу с допустимой ненулевой массой из штампа: знаменатель — именно масса штампа. Расхождение служит диагностике, а не автоматической правке чертежа.

**Подстановка.** Объёмы могут идти в G06/LC при наличии плотности/экономического основания; охватывающий диаметр — в соответствующие габаритные проверки. Они не делают все формы поддержанными сервисом S и не разрешают считать полезный остаток стружкой.

**Реализация и основания:** [geometry_primitives.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/geometry_primitives.py:17), [strategies.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/engine_parts/strategies.py:152), [preliminary_stock.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/preliminary_stock.py:465), [route_planning.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/route_planning.py:522).

### Применение AB

**Прежние проверки прутка и кривизны. Записи AB01–AB10; область: Дополнительные/прежние Python-селекторы.**

**Порядок.** AB01–AB03 проверяют гарантированное сечение прежнего selector. Здесь `guaranteed_section_size` учитывает отклонение размера, а кривизна рассматривается отдельно. Знак B1 определяется контрактом этой модели: модуль не разрешает механически применять `abs` ко всем подписанным отклонениям проекта.

AB04 переводит представления кривизны. AB05–AB07 относятся к предварительному отрезку: поправка на длину и оставшийся радиальный запас. AB08–AB10 относятся к другому расчёту установки и её базы.

**Подстановка.** Результаты остаются в прежних/дополнительных оценках пригодности и установочного запаса. Их нельзя суммировать как две обязательные поправки одного метода или подставлять вместо S07/S08: новый Go-сервис имеет собственное строгое условие и собственную формулу эффективного диаметра.

**Реализация и основания:** [bar_stock_selection.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/bar_stock_selection.py:114), [round_stock_planning.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/round_stock_planning.py:66), [round_stock_curvature.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/round_stock_curvature.py:64).

### Применение AC

**Прежний раскрой прутка. Записи AC01–AC11; область: Прежние Python-контракты и helpers.**

**Порядок.** AC01–AC06 делят длину поставки на единичный расход, округляют вместимость вниз, число прутков вверх, затем находят закупаемую длину и остаток. При нулевой вместимости допустимого плана нет. AC07/AC08 — отдельный предварительный helper с двумя торцевыми припусками. При наличии развёртки AC09 использует её, а не габарит согнутой детали; AC10/AC11 описывают другой явно заданный баланс.

**Применение и подстановка.** Результаты нужны соответствующим прежним проекциям заготовки/маршрута и стоимости LC. Это не алгоритм нового подбора S: нельзя считать уже учтёнными начальные обрезки, допуски отрезки или зажимной хвост, которых нет во входах конкретного старого метода.

**Реализация и основания:** [blank_contract.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/blank_contract.py:322), [route_planning.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/route_planning.py:204).

### Применение AS

**Лист и сеточный раскрой. Записи AS01–AS12; область: Дополнительная/прежняя ветвь; не фигурный nesting.**

**Исходные данные и порядок.** Сначала AS01–AS05 проверяют гарантированную толщину, потребность, формат и допустимость поворота. Коэффициент плоскостности не вычитается автоматически из толщины. Для каждого допустимого формата и ориентации AS06/AS07 считают целое число одинаковых прямоугольников по двум осям. Прибавление k в числителе соответствует отсутствию дополнительного промежутка за последней деталью.

AS08/AS09 получают вместимость и число листов. Сравниваются обе ориентации, затем закупаемая площадь, число листов и детерминированные размеры формата; при выборе толщины минимальная подходящая толщина имеет свой приоритет. AS10–AS12 вычисляют площади.

**Подстановка.** Получается отдельный план поставки/остатка листа для соответствующего selector. Он не даёт времени лазера, плазмы или фрезы; для времени нужны реальные операции и нормы. Сетка одинаковых прямоугольников не объявляется универсальной раскладкой фигур.

**Реализация и основания:** [sheet_stock_selection.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/sheet_stock_selection.py:199), [sheet_cutting.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/sheet_cutting.py:74).

### Применение AT

**Трубный прокат и нормативные пределы. Записи AT01–AT14; область: Дополнительный/прежний трубный selector.**

**Порядок.** AT01–AT06 строят номинальный внутренний диаметр и неблагоприятные пределы из наружного диаметра и стенки. AT07/AT08 задают потребность отверстия и длины. AT09–AT11 одновременно проверяют достаточный наружный размер, не слишком большое исходное отверстие, положительный просвет и известную длину. При неизвестной длине ограниченная прежняя оценка не подтверждает поставку.

AT12/AT13 раскрывают числовую норму полосы: мм напрямую либо процент от нужного номинала. AT14 меняет единицу прямолинейности; не добавляет скрытую поправку к внутреннему диаметру. Допустимые сочетания диаметра/стенки выбираются по проверенной матрице, а не только по положительности чисел.

**Подстановка.** Предельная геометрия участвует в трубной пригодности/свидетельствах и последующих прежних геометрических проекциях. Произвольная строка формулы из JSON не исполняется. Этот модуль не является поддержкой трубы новым S-сервисом при неподдержанной форме.

**Реализация и основания:** [tube_stock_selection.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/tube_stock_selection.py:181), [stock_formula_rules.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/stock_formula_rules.py:273), [gost_8732_verified.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/gost_8732_verified.py:52).

### Применение AM

**Справочная масса сортамента. Записи AM01–AM06; область: Каталожное отображение с принятой плотностью стали.**

**Порядок.** AM01–AM05 вычисляют теоретическую удельную массу круга, квадрата, шестигранника, листа и трубы с фиксированными справочными коэффициентами. AM06 переводит линейную массу в массу отрезка. В соответствующих проекциях масса сортамента округляется до 0,001, отображаемая масса отрезка — до 0,01.

**Применение и подстановка.** Это данные/представление справочника и встроенного разрешения заготовок. Их удобно показывать рядом с сортаментом, но нельзя без основания подменять ими G06 с фактической плотностью материала или точный материальный баланс. Денежное начисление требует явного выбора оплачиваемой массы и цены LC/C.

**Реализация и основания:** [NSI gost_8732_verified.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/gost_8732_verified.py:225), [builtin_blank_resolution.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/builtin_blank_resolution.py:363).

### Применение BG

**Развёртка гнутого круглого прутка. Записи BG01–BG22; область: Дополнительный геометрический модуль; вне основного compact DETAIL.**

**Исходные данные.** Нужны тип размерной схемы, радиусы/их пределы, углы, прямые участки и диаметр. Различаются размеры до касательных и до теоретической вершины. Пространственный габарит не заменяет развёрнутую длину.

**Порядок.** BG01–BG03a переводят внутренний/наружный радиус в осевой и внутренний угол/уклон в угол поворота. BG04–BG07 складывают дуги и касательные, вычитая примыкающие отступы. Для 180° бесконечный отступ не применяется: нужны точки касания. BG08–BG13 распространяют интервалы, меняя местами неблагоприятные границы при вычитании.

BG14–BG19 описывают поддержанную ортогональную П-образную схему и ограничения. BG20–BG22 вычисляют ограниченный диапазон при недостающих радиусах; отрицательный c требует верхней суммы радиусов для нижней длины. Верхние/номинальные оценки округляются вверх, нижние вниз до 0,001 мм. Если конечной верхней границы нет, результат неизвестен.

**Подстановка.** Развёрнутая длина может использоваться прежним AC09. Это геометрическая осевая модель, без универсального закона пластической деформации/K-фактора. Наличие модуля не включает гибку в основной compact-путь: явно неподдержанная форма/гибка ограничивает его детализацию.

**Реализация и основания:** [bent_round_bar.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/bent_round_bar.py:240).

### Применение EQ

**Пригодность оборудования и области режимов. Записи EQ01–EQ12; область: Проверки Python по известным пределам/условиям.**

**Исходные данные.** Назначенный станок имеет карточку, опубликованные ограничения, условия комплектации и способ регулирования. Размеры/масса поступают из применимой геометрии; режимы — из выбранного расчёта/профиля. Неизвестный предел не доказывает пригодность.

**Порядок.** EQ01–EQ06 проверяют известные габариты, массу, координаты и удержание. EQ07 вычисляет отношение L/D для отбора применимого профиля — это не силовой расчёт жёсткости. EQ08/EQ09 сравнивают предельные требования с учётом открытых/закрытых границ; если интервал пересекает предел, результат может быть `unverified`, а не произвольное принятие номинала.

EQ10 требует покрытия диапазона опубликованным объединением непрерывных интервалов. EQ11 сопоставляет точное требование с дискретными ступенями, EQ12 — точные свойства инструмента. Два известных края не доказывают непрерывное регулирование. Отсутствующая ступень доказывает конфликт лишь при подтверждённой полноте набора.

**Подстановка.** В `details` сохраняются `machine_basis`, `machine_checks`, `equipment_state`. `incompatible` снимает допустимость соответствующей прежней денежной проекции; непроверенные условия остаются видимыми. Формулы не вычисляют прочность зажима, критическую частоту или изгибную жёсткость.

**Реализация и основания:** [machine_checks.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/machine_checks.py), [round_workholding.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/round_workholding.py:48), [compact_estimation.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/compact_estimation.py:219).

### Применение AU

**Оценочные пути и повторы обработки. Записи AU01–AU28; область: Отдельные профильные/совместимые сценарии времени.**

**Условие запуска.** Эти формулы вызываются оценочными модулями `automatic_machining`/`feature_time` для оставшихся работ по выбранной политике. Новый обычный DETAIL не запускает весь автоматический прогноз после себя. Значения политики и proxy-геометрия сохраняют оценочное происхождение.

**Порядок.** AU01–AU03 считают пути фаски/конуса и специфические повторы. AU04/AU05 выводят хорду плоского среза круга. AU06–AU12 ограничивают эффективный инструмент, считают полосы/слои, выбирают путь паза либо плоскости, добавляют подходы и повторения. Правило AU12 не переносится автоматически на любую другую обработку.

AU13–AU20 используют ограниченную габаритную гипотезу, когда локальной геометрии не хватает; известные размеры элемента могут её ограничивать. AU21–AU24 оценивают возвратно-поступательное шлифование и линейный рез. Последний не равен SA02 по площади. AU25/AU26 формируют верхний сценарий: повторы округляются вверх, подающий операнд умножается на заданный фактор замедления, без самовольного обращения коэффициента.

**Подстановка.** Сформированные путь/повторы/подача передаются в Go `motion.linear-feed/1`; AU27/AU28 соответствуют его временам базового/верхнего сценария. Результаты идут в оценочный `time_estimate` и временной резерв AP10. Proxy-размеры не записываются как измеренные размеры чертежа, верхняя оценка не является доказанной физической границей.

**Реализация и основания:** [automatic_machining.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/automatic_machining.py:317), [feature_time.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/feature_time.py:301), [Условие запуска прогноза](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/compact_round.py:1637).

### Применение AP

**Профильные услуги и временной резерв. Записи AP01–AP13; область: Отдельная оценочная ветвь Python.**

**Исходные данные.** Политика закрепляет нормы, диапазоны, коэффициенты, уровни размеров/массы, термический сценарий и область покрытия. Слово service означает вид вспомогательной работы, а не отдельный HTTP-сервис.

**Порядок.** AP01 увеличивает известную конечную/неуточнённую массу для выбора уровня, если нет массы заготовки. AP11–AP13 могут построить явно оценочный габарит/массу. AP02/AP03 умножают нормы на события и коэффициенты; смены инструмента добавляются только в предусмотренной области handling/family. Для нескольких станций setup/handling суммируются AP04, inspection использует максимум AP05.

AP06–AP08 исключают уже учтённые резьбовые возвраты и рассчитывают оставшийся бюджет соответствующей неопределённой работы. Термическая ветвь берёт выбранный `with/without/uncertain` диапазон. AP09 делит общий термический бюджет на N только при известном положительном количестве. AP10 вычитает полный базовый сценарий из полного верхнего; при неполноте полного резерва нет.

**Сохранение и подстановка.** Оценочный прогноз хранит базовое/верхнее время, предположения и покрытие. Он не подменяет факты исходного чтения, выбранную заготовку или производственно подтверждённую норму. Временной резерв в минутах отличается от денежного резерва RS.

**Реализация и основания:** [automatic_time_policy.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/automatic_time_policy.py:247), [automatic_time.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/automatic_time.py:285), [automatic_compact_time.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/automatic_compact_time.py:134).

### Применение LC

**Прежние экономические и временные расчёты. Записи LC01–LC31; область: Раздельные legacy/cycle/accepted/D001-ветви.**

**Упрощённое ядро LC01–LC12.** Цена материала выбирается по основанию кг/тонна/метр/штука. Труд и станок имеют отдельные часы наладки и повторяемые часы, умножаются на свои ставки и складываются. Партия включает повторяемый материал и операции, единичный итог делится на N. Эта старая модель не разрешает добавить отдельный труд к уже комплексной новой ставке станка — это дало бы двойное начисление.

**Cycle/accepted/совместимость LC13–LC20.** Компоненты времени учитываются по частоте; денежные суммы округляются по правилам соответствующего модуля. Известная сумма `accounted` отделена от полного итога. Если accepted-баланс уже дал массу партии, материал оплачивается `m_batch·price_per_kg` без второго N. LC19/LC20 применяются к прежней проекции сохранённых строк, а не доказывают автоматическую сборку новой сметы после DETAIL.

**D001-оплата материала LC21–LC28.** Выбирается явный расход на деталь, отрезок с пропилом либо целые прутки. Для целых прутков отдельно рассчитываются вместимость, число, валовая масса и потенциально пригодный остаток. Кредит задаётся явно и не превышает пригодный остаток. Пропил уже входит в массу оплаченных целых прутков: прибавлять его второй раз нельзя. Неизвестный владелец/условие зачёта не означает бесплатный остаток.

**D001-рецепты LC29–LC31.** `direct` использует явные минуты, `length_feed` делит мм на мм/мин, `volume_rate` — мм³ на мм³/мин; знаменатель положителен, единицы проверяются. Отдельного метода `area_rate` в этом реестре нет. После покрытия компонентов повторяемое время распространяется на N и добавляется общая наладка.

**Результат.** Каждая ветвь сохраняет свои результаты/свидетельства и состояния полноты. Их формулы включены для полного охвата проекта, но разные экономические модели не складываются между собой и не выдаются за новый основной Go-расчёт.

**Реализация и основания:** [costing.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/engine_parts/costing.py:33), [costing_stage.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/engine_parts/costing_stage.py:113), [operations.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/engine_parts/operations.py:447), [basic_selection.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/basic_selection.py:13), [cycle_estimate.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/cycle_estimate.py:153), [accepted_estimate.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/accepted_estimate.py:115), [refresh_legacy_quantity](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/compact_estimation.py:987), [d001_estimate.procurement](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/d001_estimate.py:189), [d001_time.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/d001_time.py:114), [route_time.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/route_time.py:182).

### Применение IM

**Рендер чертежа и области изображения. Записи IM01–IM08; область: Служебные преобразования до чтения модели.**

**Исходные данные.** Из файла получают размер страницы/изображения и технические ограничения растрового представления. PDF задаёт свой базовый масштаб через 72 точки на дюйм. Координаты области могут приходить в поддержанном нормализованном представлении.

**Порядок.** IM01 выбирает минимальный масштаб, удовлетворяющий запрошенному разрешению, максимальной стороне и числу пикселей. IM02/IM03 переводят DPI и округляют размер рендера. IM04 ограничивает общий вид. IM05 распознаёт представление 0..1000, IM06/IM07 добавляют поля и ограничивают рамку, IM08 переводит её в целочисленное пиксельное вырезание с округлением наружу.

**Подстановка.** Растр, общий вид и допустимые фрагменты становятся входом READING/VERIFY. Эти выражения не переводят пиксельную длину детали в мм и не доказывают размер по картинке без размерного основания. Положение нечитаемого знака не восстанавливается одной нормализацией bbox.

**Реализация и основания:** [raster.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/tools/raster.py:36), [recognition/models.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/recognition/models.py:24).

### Применение SYS

**Длительность исполнения программы. Записи SYS01–SYS01; область: Диагностика; вне времени изготовления.**

**Порядок.** SYS01 вычитает момент старта, ограничивает отрицательное значение нулём в соответствующем helper, переводит секунды в миллисекунды и округляет до трёх знаков. В отдельных локальных таймерах используется та же разность без дополнительного `max`, поскольку таймер монотонный.

**Сохранение и подстановка.** Поля `timings_ms`, в том числе calculator/local_planning/work_time, показывают длительность работы программы и вызовов. Эти миллисекунды не подставляются в TM как время изготовления, не умножаются на ставку станка C01 и не являются энергией производства.

**Реализация и основания:** [elapsed_timings](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/compact_round.py:619).

## III. Сквозной пример подстановки

Это условные арифметические значения для объяснения связей, а не параметры рабочего чертежа, каталога или станка.

Пусть круг имеет D=40 мм, один продольный слой a=1 мм, контакт L=50 мм, n=500 об/мин и f=0,2 мм/об. K03 даёт u=100 мм/мин. T01 даёт d=38 мм; T02 — A=39π мм²; T03 — V=1950π≈6126,106 мм³; T05 — t=0,5 мин. T04 даёт Q=3,9π≈12,252 см³/мин. Эти 0,5 минуты описывают один контактный ход, без автоматически добавленных подхода, наладки или смены детали.

Если отдельно и допустимо задано вспомогательное время 0,1 мин/деталь, общая наладка 10 мин и N=20, то при полном покрытии рассматриваемой работы TM05/TM06 дают t_piece=0,6 мин и T_batch=22 мин. При ставке 1000 ₽/ч C01 даёт 366,666… ₽ до денежного округления. Для одной валюты/ценового основания C12 даёт базу 366,67 ₽; при K=1,20 C09 считает надбавку от неокруглённой обработки и даёт 73,33 ₽, C10 — 440,00 ₽. Подготовительная, повторяемая и включённая работа должны остаться раздельно прослеживаемыми, даже когда их допустимые суммы попадают в одну денежную группу.

Даже эта известная сумма не является полной сметой детали, если отсутствуют материал, другие обязательные работы или необходимый резерв. Мощность можно получить только после задания коэффициентов/углов/КПД L; из времени и ставки их вывести нельзя. Длительность вызова калькулятора SYS никак не меняет эти производственные минуты.

## IV. Как проверять полноту и актуальность

Для каждого расчётного результата проверяются не только число и единица, но и метод/версия, источник операндов, соответствие текущему входу, состояние метрики и охват работ. Новый тариф меняет денежный снимок C; изменение режима требует технического пересчёта; изменение геометрии/количества может потребовать перепроверки зависимых целей, заготовки и проходов. Поздний результат не должен заменять более новую ревизию.

Документ сводит все записи каталогов [основных формул](02-FORMULAS.md) и [дополнительных ветвей](03-ADDITIONAL-FORMULAS.md) без потери идентификаторов. Буквальные выражения и повторяющиеся варианты доступны в [05-SOURCE-REGISTER.md](05-SOURCE-REGISTER.md). Полнота словаря формул не означает, что все категории вызываются на каждом задании. Таблицы IT, отклонений, свойств, режимов, норм и цен являются входными наборами; отсутствие записи не разрешает придумать значение.

В реализации не подтверждены универсальный точный объём резьбового профиля, полная силовая модель каждого процесса, произвольный фигурный nesting, тепловой баланс печи, автоматическая конвертация валют и расчёт НДС. Их нельзя достроить в описание как якобы используемые формулы. Фактические условия методов, неподдержанные формы и ограничения отмечены в соответствующих категориях.

Проверка исходников подтверждает реализацию в зафиксированном состоянии. Она не подтверждает новый запуск модели, качество распознавания рабочего чертежа, применимость нормы на производстве или инженерную приёмку итоговой сметы. Все материалы этого комплекта подготовлены локально.
