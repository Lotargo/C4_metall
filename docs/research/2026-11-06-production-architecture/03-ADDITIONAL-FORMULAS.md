# Формулы дополнительных, оценочных и прежних ветвей

Дата: 06.11.2026. Основание: [README](README.md), [реестр исходников](04-SOURCES-AND-COVERAGE.md).

Все основные и дополнительные категории собраны в самостоятельном [каталоге с описанием применения](07-FORMULA-CATALOG-AND-APPLICATION.md).

Этот документ сохраняет вычисления, которые есть в продукте за пределами девяти методов Go и основного пути новой compact-загрузки. Наличие формулы или HTTP-обработчика не доказывает её обязательный вызов в текущем сценарии. Точные выражения повторяющихся реализаций приведены в [05-SOURCE-REGISTER](05-SOURCE-REGISTER.md).

## 1. Дополнительные геометрические примитивы и габариты

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

AG06 относится к прежней упрощённой оценке кандидата. Его `max(0,...)` не является правилом, разрешающим отрицательный съём в строгой проверке фактического перехода. AG07 не превращает полезный остаток в стружку. AG08/AG09 используются для габаритной оценки некруглых сечений, а не для объявления всех форм поддержанными сервисом `stock-selection`.

Код: [geometry_primitives.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/geometry_primitives.py:17), [strategies.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/engine_parts/strategies.py:152), [preliminary_stock.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/preliminary_stock.py:465), [route_planning.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/route_planning.py:522).

## 2. Прежний подбор прутка: допуск и кривизна разделены

```text
AB01 C=A+B, B - верхнее отклонение готового размера с исходным знаком
AB02 stock_min=A1−abs(B1), если B1 в этой модели хранится как положительная величина
AB03 пригодность сечения: stock_min≥C
AB04 k_percent=c%/100; k_mm_per_m=q/1000
```

В текущей реализации `bar_stock_selection.guaranteed_section_size` кривизна не вычитается из гарантированного размера сечения: она рассматривается отдельно. Старое имя `satisfies_literal_condition` сохранено, но не доказывает исполнение старого неравенства из плана.

Отдельная оценка круглой заготовки/установки:

```text
AB05 curvature_diameter_deduction=L_cut·c%/100
AB06 required_stock_min=D_required+curvature_diameter_deduction
AB07 remaining_radial_surplus=(D_stock,min−required_stock_min)/2
AB08 setup_bound=L_basis·c%/100
AB09 radial_surplus=(D_stock,min−D_required)/2
AB10 residual=radial_surplus−setup_bound
```

AB05/AB07 относятся к предварительной оценке отрезка, AB08/AB10 - к другой оценке установки. Их нельзя складывать как две независимые обязательные поправки одного метода или подменять ими S07 нового Go-сервиса.

Код: [bar_stock_selection.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/bar_stock_selection.py:114), [round_stock_planning.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/round_stock_planning.py:66), [round_stock_curvature.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/round_stock_curvature.py:64).

## 3. Прежний раскрой прутка

```text
AC01 piece_consumption=L_blank+k
AC02 parts_per_bar=floor(L_supply/piece_consumption)
AC03 bars_required=ceil(N/parts_per_bar)
AC04 total_requested=bars_required·L_supply
AC05 consumed=N·piece_consumption
AC06 waste=total_requested−consumed
```

`plan_cutting` сравнивает доступные варианты поставки своим ключом. Этот более простой расчёт не является новой раскладкой S01–S32: в нём не следует дописывать уже якобы учтённые начальные обрезки, погрешности упора и зажимной хвост, если их нет во входах метода.

Другой прежний предварительный helper:

```text
AC07 L_cut=L_base+2·face_allowance
AC08 pieces=floor(L_supply/(L_cut+k))
AC09 L_piece=L_developed+reserve, если доступна развёрнутая длина
AC10 consumed=N·L_piece+cut_count·k+end_waste
AC11 available=L_supply·supply_bar_count
```

Код: [blank_contract.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/blank_contract.py:322), [route_planning.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/route_planning.py:204).

## 4. Листовой подбор и прямоугольный раскрой

### 4.1. Проверки толщины и формата

```text
AS01 thickness_min=thickness_nom+δ_lower
AS02 thickness_required=thickness_part+δ_upper+allowance
AS03 thickness_min≥thickness_required
AS04 (W_sheet≥W_piece и L_sheet≥L_piece)
       либо (W_sheet≥L_piece и L_sheet≥W_piece), если допустим поворот
AS05 flatness_coefficient=flatness_mm_per_m/1000
```

AS05 преобразует представление коэффициента, но не означает, что плоскостность автоматически вычитается из толщины во всех проверках. Реальная область подтверждённых допусков/сортамента контролируется отдельно.

### 4.2. Сетка одинаковых прямоугольников

```text
AS06 columns=floor((W_sheet+k)/(W_piece+k))
AS07 rows=floor((L_sheet+k)/(L_piece+k))
AS08 capacity=columns·rows
AS09 sheets=ceil(N/capacity)
AS10 requested_area=sheets·W_sheet·L_sheet
AS11 blank_area=N·W_piece·L_piece
AS12 waste_area=requested_area−blank_area
```

Сравниваются обе ориентации; для равной вместимости действует детерминированный порядок кода. Выбор формата минимизирует закупаемую площадь, затем число листов и размеры формата. Выбор толщины дополнительно ставит минимальную подходящую толщину первым критерием. Это сеточная раскладка одинаковых прямоугольников, не оптимальный фигурный nesting и не расчёт лазерного времени.

Код: [sheet_stock_selection.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/sheet_stock_selection.py:199), [sheet_cutting.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/sheet_cutting.py:74).

## 5. Трубная заготовка и гарантированные пределы

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
```

В прежнем selector при неизвестной длине допускается отдельная ограниченная оценка; это не доказательство фактической поставки нужной длины. Верхний наружный и нижний стеночный допуски берутся из применимой полосы нормы:

```text
AT12 deviation=band_value, если единица полосы мм
AT13 deviation=nominal·band_percent/100, если единица полосы проценты
AT14 q_mm_per_m/1000 - преобразование прямолинейности в коэффициент
```

В этом selector не исполняется произвольная строковая формула из JSON. Прямолинейность не превращается скрыто в другую поправку внутреннего диаметра. Проверенные допустимые сочетания диаметра/стенки берутся из нормативной матрицы; наличие пары чисел не доказывает стандартность сочетания.

Код: [tube_stock_selection.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/tube_stock_selection.py:181), [stock_formula_rules.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/stock_formula_rules.py:273), [gost_8732_verified.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/gost_8732_verified.py:52).

## 6. Справочная теоретическая масса сортамента

Это формулы исходного справочного отображения для принятой базовой плотности стали, а не универсальная замена фактической плотности материала детали. Размеры в мм.

```text
AM01 круг, кг/м: m'=0,0061654·D²
AM02 квадрат, кг/м: m'=0,00785·S²
AM03 шестигранник, кг/м: m'=0,006798·S²
AM04 лист, кг/м²: m''=7,85·s
AM05 труба, кг/м: m'=0,0246615·s·(D−s)
AM06 масса отрезка, кг: m=m'·L_mm/1000
```

Часть справочных масс округляется до 0,001, отображаемая масса отрезка в соответствующей проекции до 0,01. Это округление представления не должно переноситься на точный расчётный баланс. Плотность в SI для общего геометрического расчёта используется по G06 основного каталога.

Код: [NSI gost_8732_verified.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/gost_8732_verified.py:225), [builtin_blank_resolution.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/builtin_blank_resolution.py:363).

## 7. Развёртка гнутого круглого прутка

Геометрический модуль существует в проекте. Это не делает гибку поддержанной основной ветвью `compact_round`: явная неподдержанная форма/гибка блокирует её детализацию.

### 7.1. Радиус осевой линии, угол и касательные

```text
BG01 R_axis=R_inside+d/2
BG02 R_axis=R_outside−d/2
BG03 α_turn=180°−α_internal, если размер задан внутренним углом
BG03a α_turn=atan2(y,x)·180/π для поддержанного задания угла уклоном
BG04 l_arc=π·R_axis·α_turn/180
BG05 setback=R_axis·tan(α_turn·π/360), для α_turn<180°
BG06 l_tangent=l_virtual−Σsetback_adjacent
BG07 L_developed=Σl_tangent+Σl_arc
```

Для разворота на 180° нужны длины до точек касания; бесконечный отступ от теоретической вершины не применяется. Отрицательная касательная означает недостаточное/противоречивое основание.

Интервальные зависимости:

```text
BG08 R_axis,min=R_inside,min+d_min/2; R_axis,max=R_inside,max+d_max/2
BG09 R_axis,min=R_outside,min−d_max/2; R_axis,max=R_outside,max−d_min/2
BG10 α_turn,min=180−α_internal,max; α_turn,max=180−α_internal,min
BG11 l_arc,min=πR_minα_min/180; l_arc,max=πR_maxα_max/180
BG12 l_tangent,min=l_min−Σsetback_max
BG13 l_tangent,max=l_max−Σsetback_min
```

### 7.2. Ортогональная П-образная деталь

`W`, `H` - наружные габариты, `d` - диаметр прутка, `R1/R2` - радиусы осевой линии.

```text
BG14 l_left=H−d/2−R1
BG15 l_middle=W−d−R1−R2
BG16 l_right=H−d/2−R2
BG17 L=W+2H−2d+(π/2−2)·(R1+R2)
BG18 R_i≥d/2; R1+R2≤W−d
BG19 R_i≤H−d/2; R_i≤W−1,5d
```

При недостающем радиусе код может вернуть ограниченный диапазон, а не выбранное за пользователя число. Обозначим `c=π/2−2<0`:

```text
BG20 sum_R,max=min(ΣR_i,max, W_max−d_min)
BG21 L_min=W_min+2H_min−2d_max+c·sum_R,max
BG22 L_max=W_max+2H_max−2d_min+c·ΣR_i,min
```

Для номинальных габаритов строится аналогичный диапазон номинальной длины. Верхние/номинальные длины округляются вверх, нижние вниз с квантом 0,001 мм. Если общая траектория не даёт конечной верхней границы, результат остаётся неизвестным; пространственный габарит не подставляется вместо развёрнутой длины. Код: [bent_round_bar.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/bent_round_bar.py:240).

## 8. Геометрические проверки станка и закрепления

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

Для EQ08/EQ09 показан случай включённых границ; код дополнительно учитывает открытые/закрытые концы интервала. Если интервал пересекает предел или его нужная граница неизвестна, состояние `unverified`. Диапазон из двух известных крайних значений не объявляется непрерывным без опубликованного способа регулирования. Отсутствие подходящей ступени означает конфликт только при подтверждённой полноте опубликованного набора; иначе результат непроверен.

Проверки выполняются только по известным применимым пределам и условиям комплектации/режима. Неизвестный предел не доказывает пригодность. Прочность зажима, изгибная жёсткость, критическая частота вращения и силы закрепления этими неравенствами не рассчитываются. EQ07 выбирает область применения режима/профиля, а не заменяет силовой расчёт.

Код: [machine_checks.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/machine_checks.py), [round_workholding.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/round_workholding.py:48), [compact_estimation.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/compact_estimation.py:219).

## 9. Оценочные движения для неполностью заданной обработки

Область: `automatic_machining`, `feature_time` и автоматическая оценка оставшегося времени. Числа подач, глубин, запасов и долей берутся из закреплённой политики; отсутствующие реальные данные не становятся подтверждёнными.

### 9.1. По заданному элементу

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
```

Для фаски/конуса собственные правила повторов сохраняются, AU12 относится к соответствующему фрезерному пути. Это оценка движений, не универсальная геометрическая модель фрезерного съёма или силы.

### 9.2. По ограниченной габаритной гипотезе

```text
AU13 span=L_envelope·span_ratio, ограниченный объявленным элементом при наличии
AU14 turn/boring repeats=max(1,ceil(D·radial_ratio/ap))
AU15 turn/boring L_feed=span+2·approach
AU16 facing/drilling proxy_path=min(D,L)·span_ratio+2·approach
AU17 milling_depth=D·radial_ratio; proxy_width=D/2
AU18 milling_layers=max(1,ceil(depth/ap))
AU19 milling_repeats=layers·lanes+finish_passes
AU20 milling_L_feed=span+tool_effective+2·approach
```

Объявленные локальные ширина/глубина могут ограничить габаритную гипотезу; конкретные правила и отсутствие данных приведены в буквальном реестре. Такие proxy-размеры не записываются обратно как измерения чертежа.

### 9.3. Шлифование и линейная оценка реза

```text
AU21 grinding_layers=ceil(radial_allowance/radial_step)
AU22 grinding_repeats=max(1,2·(grinding_layers+sparkout_passes))
AU23 grinding_L_feed=L_contact+2·approach
AU24 linear_saw_L_feed=D+2·approach; repeats=1
```

AU24 не равна точной зависимости пиления по площади SA02. Здесь вызывается метод линейного движения по оценочному пути. Время всех таких движений рассчитывается через `motion.linear-feed/1`.

### 9.4. Верхний сценарий

```text
AU25 repeats_upper=ceil(repeats_base·repeat_factor)
AU26 feed_upper_scenario=feed_base·slowdown_factor
AU27 t_base=L_base·repeats_base/u_base
AU28 t_upper=L_upper·repeats_upper/u_upper
```

Коэффициент `slowdown_factor` является числом политики, умножающим соответствующий подающий операнд. Знак названия не даёт права самостоятельно делить или умножать на обратное число. Верхняя оценка является сценарной, а не гарантированной физической границей.

Код: [automatic_machining.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/automatic_machining.py:317), [feature_time.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/feature_time.py:301).

## 10. Профильная оценка сервисных работ и временного резерва

Это обычный Python-код; слово service здесь обозначает класс вспомогательной работы, не отдельный HTTP-микросервис.

```text
AP01 m_tier=m_source·mass_multiplier, если известна только конечная/неуточнённая масса
AP02 base=(minutes_base·event_count + change_minutes_base·tool_changes)·scale_base
AP03 upper=(minutes_upper·event_count + change_minutes_upper·tool_changes)·scale_upper
```

Слагаемое смен инструмента применяется только в своей области handling/family. Для термической ветви выбирается отдельно закреплённый диапазон `with/without/uncertain`, а не вычисляется универсальная температура/мощность печи.

```text
AP04 setup/handling нескольких станций: Σt_station
AP05 inspection нескольких станций: max(t_station)
AP06 returns_remaining=max(0, generated_returns−thread_returns_already_counted)
AP07 return_events=max(1,returns_remaining) в оценке соответствующей неопределённой работы
AP08 return_budget=minutes_per_return·return_events
AP09 thermal_allocated_per_piece=T_thermal,batch/N при известном N
AP10 time_reserve=T_upper,batch−T_base,batch при известных полных сценариях
```

Общий термический бюджет может храниться отдельно от неизвестных повторяемых услуг, без деления на неизвестное количество. Покрытие работ, валюта, профиль и происхождение ограничивают применимость этих сумм.

Оценочный габарит заготовки при недостаточных исходных данных:

```text
AP11 D_proxy=D_finished+2·radial_allowance либо явный diameter_default политики
AP12 L_proxy=L_finished+2·face_allowance либо явный length_default политики
AP13 m_proxy=π·D_proxy²·L_proxy·density_kg_per_mm³/4
```

Гипотеза используется для выбора уровня сервисной оценки и не подменяет подтверждённую заготовку. Код: [automatic_time_policy.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/automatic_time_policy.py:247), [automatic_time.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/automatic_time.py:285), [automatic_compact_time.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/automatic_compact_time.py:134).

## 11. Прежние денежные расчёты

### 11.1. Упрощённое расчётное ядро

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
```

Ставки труда и станка здесь являются отдельными составляющими конкретной прежней модели. Нельзя добавлять их к уже комплексной ставке станка новой сметы без отдельного основания, иначе возникает двойное начисление. Прежний простой выбор кандидата может минимизировать массу среди прошедших проверки; это другой критерий, чем оптимизация поставки нового stock-selection.

Код: [costing.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/engine_parts/costing.py:33), [costing_stage.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/engine_parts/costing_stage.py:113), [operations.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/engine_parts/operations.py:447), [basic_selection.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/basic_selection.py:13).

### 11.2. Cycle/accepted estimate и совместимые проекции

```text
LC13 T_operation=Σ(component_minutes·frequency_multiplier)
LC14 C_operation=round_0,01(T_operation·Rчас/60)
LC15 C_material,batch=round_0,01(m_kg·price_per_kg·N), когда вход задан на деталь
LC16 C_accounted=Σизвестных денежных строк
LC17 C_total=C_accounted только при полном необходимом покрытии
LC18 C_unit=round_0,01(C_total/N)
LC19 T_legacy,batch=t_legacy,piece·N+t_setup
LC20 C_legacy,batch=T_legacy,batch·Rчас/60
```

В accepted-estimate материальный баланс может уже давать массу всей партии: тогда `C_material,batch=m_batch·price_per_kg`, без повторного умножения на `N`. Явные потери включают объявленные концевые и дополнительные потери; полезный остаток/кредит обрабатывается по выбранному экономическому основанию. `accounted` не объявляется полной себестоимостью при недостающих строках.

Код: [cycle_estimate.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/cycle_estimate.py:153), [accepted_estimate.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/accepted_estimate.py:115), [refresh_legacy_quantity](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/compact_estimation.py:987).

### 11.3. Прежняя D001-политика оплаты материала и зачёта остатка

```text
LC21 m_paid,batch=m_paid,unit·N, если явно задан оплачиваемый расход на деталь
LC22 m_cut+kerf,unit=m_cut·(L_cut+k)/L_cut, если выбрана оплата отрезка с пропилом
LC23 capacity=floor((L_supply−L_end)/(L_cut+k))
LC24 bars=ceil(N/capacity)
LC25 m_gross=m_bar·bars
LC26 m_reusable=max(0,m_gross−m_bar/L_supply·(bars·L_end+N·(L_cut+k)))
LC27 m_paid,batch=m_gross−m_credit
LC28 0≤m_credit≤m_reusable
```

Кредит остатка задаётся явно; остаток неизвестного владельца не вычитается автоматически. При оплате целых прутков пропил уже входит в оплаченный материал и второй раз к массе прутков не прибавляется. Это самостоятельная прежняя экономическая политика, а не стоимость, возвращаемая новым сервисом подбора. Источник: [d001_estimate.procurement](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/d001_estimate.py:189).

### 11.4. Прежние рецепты времени D001

```text
LC29 t_recipe=numerator/denominator при согласованных единицах и положительном знаменателе
LC29a direct: t=minutes; length_feed: t=L_mm/u_mm_per_min
LC29b volume_rate: t=V_mm³/Q_mm³_per_min
LC30 T_route=T_setup+N·t_unit
LC31 t_route,unit=T_route/N при известном N и полном T_route
```

Рецепты содержат конкретный метод, операнды и источники. Реестр D001 содержит `direct`, `length_feed`, `volume_rate`; отдельного `area_rate` в нём нет. Ветвь не создаёт отсутствующую производительность из ожидаемого времени; включённые и неприменимые компоненты обрабатываются отдельно. Это исполнение прежних декларативных рецептов, которое не доказывает наличие нового физического Go-метода для любого процесса. Источники: [d001_time.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/d001_time.py:114), [route_time.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/route_time.py:182).

## 12. Подготовка изображений и координат

Эти формулы являются служебными преобразованиями источника, не геометрией детали и не производственными нормами.

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

Нормализация provider bbox дополнительно ограничивает края и минимальный ненулевой размер по правилам модели. Это защита представления области, а не восстановление точной позиции нечитаемого знака. Нет универсального вывода размеров детали в мм из пиксельной длины любого растрового чертежа.

Код: [raster.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/tools/raster.py:36), [recognition/models.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/recognition/models.py:24).

## 13. Служебное время выполнения

```text
SYS01 elapsed_ms=round(max(0,perf_counter_now−started)·1000,3)
```

Это длительность выполнения программы/модельного этапа. Она не является временем изготовления детали и не подставляется в ставку станка. Источник: [elapsed_timings](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/compact_round.py:619).

## 14. Что не следует объявлять реализованной формулой

- `t=V/Q`, `t=A/Q_area`, `t=L/Q_linear` из инженерного плана являются общими ориентирами. Поддержанный конкретный метод, входы и единицы проверяются по коду; наличие ориентира не создаёт метод для каждого процесса.
- Строки описательных формул Go и `machining_formula_text.json` документируют выполняемый код. Входной текст формулы не исполняется как произвольное выражение.
- Таблицы IT, отклонений, коэффициентов, режимов станков, норм услуг и цен содержат данные. Нельзя выдавать табличное/введённое значение за результат универсального физического закона.
- Расчёт НДС, курсов валют, продажной цены, оптимальной прибыли, точного винтового объёма резьбы, полной силовой модели сверления/канавки, универсального фигурного nesting и печного теплового баланса не подтверждён приведёнными реализациями.
- Численная полнота не означает инженерную или производственную приёмку. Проверочные пределы оборудования, исходное назначение заготовки, качество источника и неизвестные обязательные работы сохраняют собственные статусы.
