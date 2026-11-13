# Источники, границы покрытия и проверка

Дата: 06.11.2026. Статус: комплект Markdown подготовлен; проверка по исходникам и независимая арифметическая проверка записи алгоритма выполнены. Продуктовый прогон и производственная приёмка не выполнялись.

## 1. Основание снимка

- Исходный продукт: `F:/projects/metall-dev-2`.
- Ветка при захвате: `test-2`.
- HEAD при захвате: `d9329696188fb1ad9d103ac3ad55908e55d37856`.
- Рабочее дерево содержит незакоммиченные изменения; описание включает их фактические байты.
- Штатный `scripts/capture-source.mjs` выполнен в отдельной исследовательской папке. `scripts/capture-splav.mjs` добавил три Go-файла из того же HEAD с проверкой нормализованного совпадения с рабочим деревом.
- Дополнительный захват включил Go-ядра, HTTP/MCP-адаптеры, контракты, запускатель, конфигурацию Web и диагностическую консоль.
- Всего сохранено 833 исходных файлов. Во время штатного захвата и захвата дополнений изменений захватываемых байтов не обнаружено.
- Основной `.evidence` лендинга не обновлялся. Отдельный снимок: [manifest.json](F:/projects/C4_metall/outputs/architecture-2026-11-06/.evidence/manifest.json).

Оригиналы исходного продукта не изменялись. Рабочие базы, секреты и `.env` не читались и не копировались. Наличие регистрации/обработчика проверено по коду, без запуска API, моделей, Go-бинарников или тестов исходного продукта.

## 2. Покрытие

| Участок | Что проверено | Где описано |
| --- | --- | --- |
| Web → API | Значение pipeline_mode, multipart-загрузка, команды compact, подтверждение | 01-PROCESS |
| Модели и workflow | READING, VERIFY, PLANNING, DETAILING, новый intent, условия запуска и актуальности | 01-PROCESS |
| Сервисы | Запускатель, порты, подключение клиентов, HTTP-границы, отключение прежней базы станков Splav | 01-PROCESS |
| Подбор круга | Длины отрезка, допуски/кривизна, вместимость, комплект 6/12 м, баланс | 02-FORMULAS |
| Все девять Go-методов | Каталог, описания формул, выполняемая арифметика, область метрик | 02-FORMULAS и 05-SOURCE-REGISTER |
| Python-обвязка | Проходы, временные нормы, машинные ограничения, деньги, надбавка, резерв | 02-FORMULAS |
| Дополнительные формы/ветви | Труба, лист, прямоугольник, шестигранник, гибка, прежний раскрой и D001-смета | 03-ADDITIONAL-FORMULAS |
| Оценочные сценарии | Линейные движения, профили услуг, нижняя/верхняя оценка, энергетическая область | 02/03 |
| Численные преобразования | Единицы, плотность, bbox/растр, округление и допуски сверки | 02/03 |
| Единый каталог и применение | 369 формульных записей в 35 категориях; входы, алгоритмы, сохранение, следующие потребители | 07-FORMULA-CATALOG-AND-APPLICATION |
| Карты архитектуры | Общая архитектура, модельные роли, последовательность, границы и контракты сервисов | 06-ARCHITECTURE-MAPS |

Буквальный Go-реестр содержит 83 формульных записей. AST-поиск Python дал 2609 выражений в 537 функциях 118 файлов. Это счётчик синтаксических кандидатов, а не число независимых инженерных формул. Повторные реализации и служебные выражения не искусственно увеличивают число методов.

Встроенный `domain/formula_reference.py` является собственным ограниченным индексатором Python. Его discovery_scope не охватывает все Go-методы, compact-сборку и все оценочные ветви. Поэтому его ответ не использовался как единственное доказательство полноты.

## 3. Проверка арифметики и материалов

- Замкнутая запись S14–S17 проверена независимо от исполняемого кода продукта полным перебором допустимых комплектов: 25920 сочетаний количества и вместимостей. Во всех случаях совпали минимальная закупаемая длина и минимальное число прутков.
- Произвольные значения рабочего чертежа, тарифы, плотности и нормы не подставлялись. Небольшие синтетические проверки проверяют только запись зависимости, не технологию.
- Проверены Markdown-структура, уникальность обозначений внутри каждого документа и локальные ссылки. Все 19 Mermaid-схем документов 01/06 успешно разобраны и отрисованы в браузере установленной версией Mermaid.
- В самостоятельном документе 07 сохранены без изменения все 369 записей каталогов 02/03; у каждой из 35 категорий есть описание применения. Включены явные правила перекрытия канавки, загрузок/начальных резов партии и денежного округления. Синтетический пример геометрии, времени и денег проверен независимо без импорта кода продукта.
- `npm run verify:evidence` и `npm run build` лендинга пройдены. Сборка содержит прежние 11 страниц; новые исследовательские MD не включены в публикуемую коллекцию. Сохраняется существующее предупреждение о размере JS-пакетов.
- Ссылки на локальные исходники проверяются по наличию файла и допустимости номера строки в снимке. В живом дереве строки могут сдвинуться; точное основание задаёт SHA-256 ниже.
- Полнота человеческого каталога понимается в предметной области README. Арифметические индексы сами по себе не доказывают математическую корректность, применимость нормы или достижение инженерной цели.

При повторной трассировке исправлено прежнее упрощение карт 01/06: новый DETAIL сохраняет результаты операций и по умолчанию не собирает `cost_estimate`/`time_estimate`. Стоимость вызывается отдельной командой оператора; совместимые оценочные команды отделены от нового основного пути. Также в 07 явно отмечено, что текущий compact-вызов передаёт адаптеру ожидаемый объём из ответа самого Go, поэтому это не независимый геометрический пересчёт.

Проверочные материалы: [проверка Markdown](F:/projects/C4_metall/outputs/architecture-2026-11-06/markdown-validation.json), [охват каталога](F:/projects/C4_metall/outputs/architecture-2026-11-06/formula-application-coverage.json), [проверка применения, примера и исходного снимка](F:/projects/C4_metall/outputs/architecture-2026-11-06/formula-application-validation.json). Никакая публикация не выполнялась.

## 4. Состояние источника после подготовки

HEAD при проверке: `d9329696188fb1ad9d103ac3ad55908e55d37856`.

Файлы, байты которых изменились после зафиксированного снимка: 0.

Содержательных изменений захваченных файлов при этой проверке не обнаружено.

Для файлов, взятых штатным Go-дополнением из HEAD, совпадение проверено после нормализации CRLF/LF; SHA-256 снимка относится к HEAD-байтам. Только переводы строк отличаются у: `splav-parser/internal/storage/sqlite.go`.

Если другой исполнитель продолжит правки, этот комплект останется описанием указанного снимка. Он не обновляется автоматически. Старые отчёты и планы использованы только как навигация; существенные утверждения опираются на код.

## 5. Реестр использованных и проиндексированных файлов

Ссылка ведёт в исходный рабочий каталог. SHA-256 относится к байтам отдельного снимка, а не к предположению о текущем HEAD. Полный manifest также содержит прочие захваченные файлы.

| Исходник | SHA-256 снимка |
| --- | --- |
| [library/nsi/defaults/formulas.json](F:/projects/metall-dev-2/library/nsi/defaults/formulas.json) | `e04dccbbb4e3aa77059da8f7e7f504a73e3b5a9367f68a7cb981aa557d54e4e9` |
| [library/nsi/defaults/linear_tolerances.json](F:/projects/metall-dev-2/library/nsi/defaults/linear_tolerances.json) | `b6cfb68ea9fab85ae770d3105cc98f5208abc8fb0db1c3f55d28dc220f6627ed` |
| [library/nsi/estimation/manifest.json](F:/projects/metall-dev-2/library/nsi/estimation/manifest.json) | `a904a5f34930df59f09302b028fa8860974bed2265402c45a3b7770829be5069` |
| [library/nsi/estimation/profiles-1.json](F:/projects/metall-dev-2/library/nsi/estimation/profiles-1.json) | `865416741e79ed26f8953d6ea444d2e4b762243668961aa89b63416546b541ee` |
| [library/nsi/estimation/time-policy-2.json](F:/projects/metall-dev-2/library/nsi/estimation/time-policy-2.json) | `20e3aa70425c10eea81dbc8f139fca46e5ca25701f08ea75b5b05b35121beb6e` |
| [machining-calc/calc/bandsaw.go](F:/projects/metall-dev-2/machining-calc/calc/bandsaw.go) | `f6ca3ea0611ad57148f346a2a8c5ddfb939bce5f95fe8ba1cf2e771464eff905` |
| [machining-calc/calc/bandsaw_batch.go](F:/projects/metall-dev-2/machining-calc/calc/bandsaw_batch.go) | `0f1c97bf75bee79a4231769c7df1934f7814b5d1442d727c52c52aeb73637704` |
| [machining-calc/calc/boring.go](F:/projects/metall-dev-2/machining-calc/calc/boring.go) | `9eef2553ba88cf52f753d49027de8474be8548d77c49f5e5d9edbdb6bfe1fa68` |
| [machining-calc/calc/drilling.go](F:/projects/metall-dev-2/machining-calc/calc/drilling.go) | `ddd4b2fa4f79078a36c0a892a19072c59c3b46db745fd03e23a8fe15888528b9` |
| [machining-calc/calc/engine.go](F:/projects/metall-dev-2/machining-calc/calc/engine.go) | `47bb4d5fdaafd6a3efc424ff421a0f07a80c8bfa9e157ada9a624b511a48b0c7` |
| [machining-calc/calc/formulas.go](F:/projects/metall-dev-2/machining-calc/calc/formulas.go) | `847230c0dd4bdaf86bceda7c61447338a99f410fab629b794557c740c4371334` |
| [machining-calc/calc/grooving.go](F:/projects/metall-dev-2/machining-calc/calc/grooving.go) | `bf8d680d2c322734f945f8a95ac68cbfa7ec3f485297649f5dd558bde1aef54b` |
| [machining-calc/calc/linear_feed.go](F:/projects/metall-dev-2/machining-calc/calc/linear_feed.go) | `658a122fe16f19867fe7ec258252ea67522985fb619bafe97bc3756dccee28ca` |
| [machining-calc/calc/thread_turning.go](F:/projects/metall-dev-2/machining-calc/calc/thread_turning.go) | `ee26be7dc919ab5e200d3c4e40198a7a8c7cf7e0470fa1feae29e08b30897861` |
| [machining-calc/catalog/catalog.go](F:/projects/metall-dev-2/machining-calc/catalog/catalog.go) | `16ee55e036ea621fc124a44a82c0029f6a43c7ca4e9db3c6df75fe4aefcf68ff` |
| [machining-calc/docs/METHODS.md](F:/projects/metall-dev-2/machining-calc/docs/METHODS.md) | `f5e73cc25d3821774899e021c9dd2d767b0e76c175f38c152eb9af97bbd9c127` |
| [machining-calc/docs/WALTER.md](F:/projects/metall-dev-2/machining-calc/docs/WALTER.md) | `796b400a3d6e255082691d498a47e58e6761588a5ba08c48f0529a13d0dd5afd` |
| [mvp/scripts/dev_stack.py](F:/projects/metall-dev-2/mvp/scripts/dev_stack.py) | `3f3473a89b924a131a77481e157d822303df22d9e4a238af829f9663f8a01578` |
| [mvp/src/metall_mvp/api/routes_parts/compact_round.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/api/routes_parts/compact_round.py) | `0ec7845563c1b43456804929a3099bcccfd31da563bb90f7daf45c6f2632022b` |
| [mvp/src/metall_mvp/api/routes_parts/recognition.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/api/routes_parts/recognition.py) | `c07c2e7ddf18b6bdcea758c8404bfc7853e753dc86c6eae95732aa91b815201f` |
| [mvp/src/metall_mvp/config.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/config.py) | `26f789bfc70120ed884faae90f5e4de84d5c15843b3c440ca0084f0d7a633cd4` |
| [mvp/src/metall_mvp/db/repository.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/db/repository.py) | `7b80403b80a215887b879070a9122f19d19dfea42d0f678b54bae2771c84d674` |
| [mvp/src/metall_mvp/db/tolerances.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/db/tolerances.py) | `483e4f485c5fef3de89cb82c0e59890e4168c21450553d22626cbb8117dd3197` |
| [mvp/src/metall_mvp/domain/accepted_estimate.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/accepted_estimate.py) | `64a52aad4476b6f6137c9fef632647d5b328ec21b40b0dd4949820f8095462ae` |
| [mvp/src/metall_mvp/domain/calculation/axial_length_chain.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/axial_length_chain.py) | `5849f544c344a3ad56c2cd54b7a6bbf55a9c7a3766ac959fcee6e2ed70606338` |
| [mvp/src/metall_mvp/domain/calculation/bar_stock_assortment.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/bar_stock_assortment.py) | `f67871445d94027d25300c7262f1b9f28643b8fe9ac7ddfd00069d0e3621f787` |
| [mvp/src/metall_mvp/domain/calculation/bar_stock_selection.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/bar_stock_selection.py) | `a17492cced74680e80c37d20083579d7272dc646c2221a88be48929f10f493e4` |
| [mvp/src/metall_mvp/domain/calculation/basic_selection.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/basic_selection.py) | `76df2228f8c8da17f6d83d84fb263a92b90062fa310d96c40750319a6b8e21a3` |
| [mvp/src/metall_mvp/domain/calculation/bent_round_bar.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/bent_round_bar.py) | `c3b3793377fe34c7a6370c555a7cc492f872cf8c96acbf16dc3fc17e1494223a` |
| [mvp/src/metall_mvp/domain/calculation/blank_contract.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/blank_contract.py) | `7e9ac391ae8f0bead66cf71ec8f940fd7eef5862ee820f4802e5c6ba5a68cc22` |
| [mvp/src/metall_mvp/domain/calculation/blank_preview.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/blank_preview.py) | `bb8bd489309124eae822494911f73f41e8ffde8c79a6c7f19ce178ef5df30e16` |
| [mvp/src/metall_mvp/domain/calculation/blank_requirement_resolver.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/blank_requirement_resolver.py) | `18bdebde06813add92378154e93c05f8c1ad136806f7c40255412664938aba50` |
| [mvp/src/metall_mvp/domain/calculation/builtin_blank_resolution.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/builtin_blank_resolution.py) | `af8fe2a5d5277e951f2ddc6a27eaaa5d390bc19ced481c3080dd3bf19bb11737` |
| [mvp/src/metall_mvp/domain/calculation/customer_bar_resolution.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/customer_bar_resolution.py) | `86322aefa68919a344b53a92f8668944f4449b4376f2c08c336e00e4d86d97b9` |
| [mvp/src/metall_mvp/domain/calculation/customer_requirement.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/customer_requirement.py) | `df3d25f7912b30dc0fdbcd3cccdc0618d440457e122a5858c5e4d9e7d1cca6fd` |
| [mvp/src/metall_mvp/domain/calculation/customer_sheet_resolution.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/customer_sheet_resolution.py) | `97bb94cbd18be90ffe1c715a8576c013a9e2d2716e4ed4064ff0faff0c9f8fbd` |
| [mvp/src/metall_mvp/domain/calculation/customer_tube_resolution.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/customer_tube_resolution.py) | `c7c535ebaec8d19c8f14d4e7342a6c4369c3d68316dd8a2384a24d6a4e9828ca` |
| [mvp/src/metall_mvp/domain/calculation/engine.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/engine.py) | `d4c8b4880fd6509233e65374cf7f105a1f0d4a8fc432d6fa76aa7bab2ba9fea3` |
| [mvp/src/metall_mvp/domain/calculation/engine_parts/blank_selection.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/engine_parts/blank_selection.py) | `bd6542c8b329961a96472a12fb7436147e45a3b644b1c3458c2fc30560838ccc` |
| [mvp/src/metall_mvp/domain/calculation/engine_parts/common.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/engine_parts/common.py) | `b1f1649ab5a340f66a1e831ca3cab19fb740ccc52ba54156d6262027cf1828ac` |
| [mvp/src/metall_mvp/domain/calculation/engine_parts/costing.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/engine_parts/costing.py) | `80afc82f58267da7eb4022238ed4d9af720110166d318a3a6a001a69eb66765d` |
| [mvp/src/metall_mvp/domain/calculation/engine_parts/costing_stage.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/engine_parts/costing_stage.py) | `0e70d0156512f433ce5c0e6c73e75357d34138570b75b5b8fc399ace89f0c0e7` |
| [mvp/src/metall_mvp/domain/calculation/engine_parts/eligibility.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/engine_parts/eligibility.py) | `7ff197ee0b0d30ef263cd4d9e42c1faaa7ab5d5ed945c66575606690745b2d22` |
| [mvp/src/metall_mvp/domain/calculation/engine_parts/fingerprint.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/engine_parts/fingerprint.py) | `a49d585bc08999f84a167b472c681c5dc4b5d7be7759558f55c90ab1e0211f0e` |
| [mvp/src/metall_mvp/domain/calculation/engine_parts/operations.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/engine_parts/operations.py) | `e99b634f47b3a753d44813e240bd2e3bcf587c3e833173de42c876bd034cede6` |
| [mvp/src/metall_mvp/domain/calculation/engine_parts/part_model.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/engine_parts/part_model.py) | `2780696535f927a22a416b26a561c57629cf817df8d7a0fd056cdffed37cdfe8` |
| [mvp/src/metall_mvp/domain/calculation/engine_parts/pipeline.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/engine_parts/pipeline.py) | `645bc4203596b8ebb64d245f883ff104ab2de5e9b884535bf5ed620150ac1f3e` |
| [mvp/src/metall_mvp/domain/calculation/engine_parts/result_builder.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/engine_parts/result_builder.py) | `e6a32aa90524020a4f44e2c077ab74edac1a97758018382c8c19516cb9e42ad5` |
| [mvp/src/metall_mvp/domain/calculation/engine_parts/strategies.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/engine_parts/strategies.py) | `2fdd0e510ad02500d512a88d5a4eda9d2cd8d664ffba04f6c11a0352967d234f` |
| [mvp/src/metall_mvp/domain/calculation/engine_parts/structured_blank.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/engine_parts/structured_blank.py) | `3aaeb7e31ec28f9585e24f26be0fd59dc634655e61b8035a305c06698f969a0d` |
| [mvp/src/metall_mvp/domain/calculation/engine_parts/technical_requirements.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/engine_parts/technical_requirements.py) | `08a894cbd573e93c93cfa44550936ef004f1d85d4afe63afd3f81a7dbd73b85b` |
| [mvp/src/metall_mvp/domain/calculation/estimate_xlsx.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/estimate_xlsx.py) | `2e7718862ecc3355ca1c591957ceb2437faff741d76121e384625eae2429426d` |
| [mvp/src/metall_mvp/domain/calculation/geometry_primitives.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/geometry_primitives.py) | `06af2c813d4ae0b3be2bab4bf8bc96e2693e585ab6fc841330dbcee9f6032634` |
| [mvp/src/metall_mvp/domain/calculation/gost_8732_verified.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/gost_8732_verified.py) | `36e2e0896daacedc64e6154b12f0d4568e95d938a8514715107610878643c434` |
| [mvp/src/metall_mvp/domain/calculation/machine_basis.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/machine_basis.py) | `909770423d744d8b52f272967969ec73f9b85e3a75257b6f06a7417a0b6662ca` |
| [mvp/src/metall_mvp/domain/calculation/machine_checks.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/machine_checks.py) | `10a82f36dbc8d1a59743d18a83847014d221c5d4ee78d79f6da7f12c23dfdc18` |
| [mvp/src/metall_mvp/domain/calculation/material_basis.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/material_basis.py) | `e43aea4380691e12e915f846ba76110e872073b51a97cbf8e5e304104cc51245` |
| [mvp/src/metall_mvp/domain/calculation/models.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/models.py) | `ef5fe92a1c3605d14eb78b9e432d2f92d100d3889d1193c0c4198b11cacbe9ac` |
| [mvp/src/metall_mvp/domain/calculation/preliminary_stock.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/preliminary_stock.py) | `556da66b1f8c62cc97dde201b48d4635286b8266d26b203f8e2cd97dbc4e9d9c` |
| [mvp/src/metall_mvp/domain/calculation/process_surfaces.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/process_surfaces.py) | `ee47725bd2f822043d87b64d553a6916d0994708b0c27626798c8d8899abbba5` |
| [mvp/src/metall_mvp/domain/calculation/rough_sheet_stock.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/rough_sheet_stock.py) | `7d5a5ee06e5a01d97d7897847fe430ae8760cc14ffb8f08e3c697ab6d5ff527b` |
| [mvp/src/metall_mvp/domain/calculation/round_geometry.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/round_geometry.py) | `82f9ad20bf089df593d247f61ba43e005b42378386c0dbd89a2275c10ea4edfe` |
| [mvp/src/metall_mvp/domain/calculation/round_process.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/round_process.py) | `0d23fa69146ab08fc9b2fe5c40c01ef7565aeca386ad5275664851881c450f9a` |
| [mvp/src/metall_mvp/domain/calculation/round_stock_curvature.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/round_stock_curvature.py) | `7d2aebd8f887d81d0af31d0e5fc71a622fddc690d0b5e362495fb1f40023c83f` |
| [mvp/src/metall_mvp/domain/calculation/round_stock_planning.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/round_stock_planning.py) | `8cf3386796c9aea01b21c2f606e0427ad74cadbab087c0e238b50cfd5a242cd3` |
| [mvp/src/metall_mvp/domain/calculation/round_workholding.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/round_workholding.py) | `a0604835ef814fda0df0b9df016c179d4ede3552ddcf0231c406f4eb3a1e215e` |
| [mvp/src/metall_mvp/domain/calculation/sheet_cutting.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/sheet_cutting.py) | `ab9c5e31ce011f1e5ac9955a17e3e97eb7a518d211469bff3dc77994c75563d2` |
| [mvp/src/metall_mvp/domain/calculation/sheet_stock_assortment.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/sheet_stock_assortment.py) | `798693577652132b49f490ff900b51a596590240a442d6d7f810377e9fccb3cd` |
| [mvp/src/metall_mvp/domain/calculation/sheet_stock_selection.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/sheet_stock_selection.py) | `0ae1351e94ddac8b8141ea7547a7fe05d1d0d22c2762d725fab0b3e5ec6d3b73` |
| [mvp/src/metall_mvp/domain/calculation/stock_calculation_basis.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/stock_calculation_basis.py) | `f1a9886430afdd3cc1031a341ba0dee3bedd5258b5aa50faf922d85d0ccab855` |
| [mvp/src/metall_mvp/domain/calculation/stock_form_preview.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/stock_form_preview.py) | `16da9cf99d780db5076044d62f8c9a226d6f98fcad03682fc588c130178f3a96` |
| [mvp/src/metall_mvp/domain/calculation/stock_screening_assessment.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/stock_screening_assessment.py) | `044b783ac4ed39e32a5fd40a40bc9f2153887bc974429a6e98fce326959a6890` |
| [mvp/src/metall_mvp/domain/calculation/stock_selection_policy.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/stock_selection_policy.py) | `d4142e8b3b90aa83dbb0658f79a287b7e678833f1649c8ba49dacec5ea960c07` |
| [mvp/src/metall_mvp/domain/calculation/stock_selection_preview.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/stock_selection_preview.py) | `1e14124ae899935b49025d7e9b6bf8a62b7a187e3492890f536d2e697a03e419` |
| [mvp/src/metall_mvp/domain/calculation/tube_stock_selection.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/calculation/tube_stock_selection.py) | `602f91ce2e64d03e88d3071ea3effbd29c9b36ca93150c93a02320568111700d` |
| [mvp/src/metall_mvp/domain/compact_detail_intent.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/compact_detail_intent.py) | `c399485561d8aa8f577573c98f1862bbe6ac8118756cb1f8fc697858489ea8a6` |
| [mvp/src/metall_mvp/domain/compact_round.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/compact_round.py) | `301dfe252311d20dcbe0db2c116b63d0e1b138dbcc8fa38de71d17d86d7dbf63` |
| [mvp/src/metall_mvp/domain/cycle_estimate.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/cycle_estimate.py) | `9e8e8ee760de64ce70ce2f023706f1567adc55e5c5d21877ba5c5e4300642c6c` |
| [mvp/src/metall_mvp/domain/d001_estimate.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/d001_estimate.py) | `2f643c17de54fbe6c7a5f94bfd1d1a79d64e0292cd0579fa1ba987f2025dbc7b` |
| [mvp/src/metall_mvp/domain/d001_time.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/d001_time.py) | `e0beae45b1e42ba82b3ad90d22bfe40ce828e762418f738468b9474061a4f262` |
| [mvp/src/metall_mvp/domain/estimation/automatic_machining.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/automatic_machining.py) | `b1141928620b82d06bd5a0d12e4995213c64e703a04622f977fdf2de977c53ad` |
| [mvp/src/metall_mvp/domain/estimation/automatic_time.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/automatic_time.py) | `bce5ec6af772a13ddcfeb245f09a280152556572d0c24543d93b829c3b2b1db4` |
| [mvp/src/metall_mvp/domain/estimation/automatic_time_policy.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/automatic_time_policy.py) | `a15fe42e8d128aa1ad30e45cad04f3759e15d6ef68467630631e5888d7b64d71` |
| [mvp/src/metall_mvp/domain/estimation/calculation_readiness.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/calculation_readiness.py) | `f0eeb66d5be9c37b11c2b3be0c2aaf6c6e65c587493cf7f0cd807df7e14823ac` |
| [mvp/src/metall_mvp/domain/estimation/contracts.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/contracts.py) | `6feb4c8744161ad146d538823983f539cd8f0148d940cdd28e3c7bc2d316196a` |
| [mvp/src/metall_mvp/domain/estimation/estimate.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/estimate.py) | `80f54427bd1717dcf2462fd8185ed978739581c96681f4408a839dc77e42a12d` |
| [mvp/src/metall_mvp/domain/estimation/feature_bindings.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/feature_bindings.py) | `ecda567dc0bdcf84d0adf567154257d5f340b73584651602284de68f145d4778` |
| [mvp/src/metall_mvp/domain/estimation/feature_time.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/feature_time.py) | `3543f232bddc6a489a3abc12ac984cc9e2d6dc4830de82ed9694411f3448eba9` |
| [mvp/src/metall_mvp/domain/estimation/handoffs.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/handoffs.py) | `e9d6c2a8a9f62f9c36567f00cf77eb703de044b119a283926d7cdbbd7fd658bb` |
| [mvp/src/metall_mvp/domain/estimation/manual_passes.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/manual_passes.py) | `88437bf25f432c7f3b46941d252bc401b8db54eb314b8c068c15365c58755cc7` |
| [mvp/src/metall_mvp/domain/estimation/pass_planning.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/pass_planning.py) | `df90b7459e980776f0090300b1bdf4bb8fc006565232458aa0d9f3d89090da96` |
| [mvp/src/metall_mvp/domain/estimation/pricing.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/pricing.py) | `59aea385f827527627188fc533a8df6e9d877ce0c742a366418fd79f405c2149` |
| [mvp/src/metall_mvp/domain/estimation/profiles.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/profiles.py) | `614d2d1a6fbc89dd99c8a1d7236336273fdb140802c8942f32832475d55c0147` |
| [mvp/src/metall_mvp/domain/estimation/reserve.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/reserve.py) | `ec5634f5e4dac0b649c0550a01c1abd7cf130aa9ea5917165e90b71835c99f75` |
| [mvp/src/metall_mvp/domain/estimation/time_estimate.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/time_estimate.py) | `262e18cfe51da02f3a33cb9c679a03d6f6b1daaef99ca8cfeb6cee17194faa2b` |
| [mvp/src/metall_mvp/domain/estimation/work_scope.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/work_scope.py) | `3fb179d0c873eb37868830fc9ec1d109318073387cb862139f6b2a584dae483b` |
| [mvp/src/metall_mvp/domain/estimation/work_time_inputs.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/work_time_inputs.py) | `02d3362d551ee20d51e6cc79ea7d9ee5b03cb8c275a4709412dd74c0a30901b5` |
| [mvp/src/metall_mvp/domain/machine_regimes.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/machine_regimes.py) | `6482447012c146144708f0cc23665b0ebc22c552734fcf4b1f8aee57bd6b3efd` |
| [mvp/src/metall_mvp/domain/machining_time.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/machining_time.py) | `2295cdd290a8bcbe68a9fbcb3b228f27579a66ca73f1e4f58f46190ab044fcab` |
| [mvp/src/metall_mvp/domain/nsi/assortment_golden.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/assortment_golden.py) | `ea4326e213c46c8d400b696c14d3a0ed4a7e4cb261604e8fdf643b9b3747d91f` |
| [mvp/src/metall_mvp/domain/nsi/builtin_assortment.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/builtin_assortment.py) | `2454abdf3d5924460dc4ab3ebe2aa7f3821bcaf43194b7465c4a5ed886f83eb4` |
| [mvp/src/metall_mvp/domain/nsi/builtin_assortment_runtime.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/builtin_assortment_runtime.py) | `f19ee7700103e8e463ea3f8278d8726ef0a0033808d3997967ad08551dfea5bb` |
| [mvp/src/metall_mvp/domain/nsi/builtin_assortment_versioning.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/builtin_assortment_versioning.py) | `8752edde0d9157ef5d5a32e57371e7dd5937a9132cd7fb9d3c67d01b144fa9d7` |
| [mvp/src/metall_mvp/domain/nsi/catalog_runtime.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/catalog_runtime.py) | `5769f9ac4f891114c3a197862ce23f740d56ddb76c95b7bb5e2aca74ca77e478` |
| [mvp/src/metall_mvp/domain/nsi/cut_norms.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/cut_norms.py) | `415d2d46aff9931493d80835d026a601064cc2d9cc28a66b180ccc25348addeb` |
| [mvp/src/metall_mvp/domain/nsi/editable_candidates.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/editable_candidates.py) | `dd45141993f18c710c2fc4c1efaa1a9eadbe48ce682d4da6e9d7a4334683f4d1` |
| [mvp/src/metall_mvp/domain/nsi/editable_csv_sync.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/editable_csv_sync.py) | `040a5020252fff699d7715938257c1bf9b55be5ccf178c80a28c79b16f0844b8` |
| [mvp/src/metall_mvp/domain/nsi/editable_exports.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/editable_exports.py) | `95c6331a858e232efd139f47777890c7d55ca9596003ceaacc5cb529b95ac7df` |
| [mvp/src/metall_mvp/domain/nsi/editable_revision_service.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/editable_revision_service.py) | `ec0cb8490e8886a8b7b038e0b6b87905db5515ce24a9693afbc3f4dce2b1f8f0` |
| [mvp/src/metall_mvp/domain/nsi/editable_runtime.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/editable_runtime.py) | `43d1a1785e22cc006cc9e2a77c0423d77830af45e118df136e4b0e77c20b1606` |
| [mvp/src/metall_mvp/domain/nsi/editable_schema_registry.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/editable_schema_registry.py) | `044da9ad9784739c38e2a11db6b37b669bd4aa3d0758588e099369ae47d13dc2` |
| [mvp/src/metall_mvp/domain/nsi/editable_table_defaults.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/editable_table_defaults.py) | `4f71f716632abafdc42a5702b6e85dfa08cb0ee488b6a3e3cec140e62fbf7b24` |
| [mvp/src/metall_mvp/domain/nsi/editable_tables.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/editable_tables.py) | `f54a42220d2935bcad9482776a945ea5012c9156bd7501c81d23a8bb378ea89c` |
| [mvp/src/metall_mvp/domain/nsi/fixtures.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/fixtures.py) | `c587df38738ee21aa30dc23854a661533c6b2e79060fac0f95475caf0ffdff97` |
| [mvp/src/metall_mvp/domain/nsi/gost_8732_verified.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/gost_8732_verified.py) | `01d9c4d916982eee1c8d4e0434f3eb1cfe14893c21aa8041a2eac775e7ea5201` |
| [mvp/src/metall_mvp/domain/nsi/linear_tolerance_rules.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/linear_tolerance_rules.py) | `0abae040b0fed6a01819bd17884fb131e6dec6cd9a4c74f02167ec76e175721f` |
| [mvp/src/metall_mvp/domain/nsi/master_data.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/master_data.py) | `6b6bc97fa184b33ecccaa0765f51fd66b00b6d368252dff1c5984aada1a32ccd` |
| [mvp/src/metall_mvp/domain/nsi/material_calculation_binding.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/material_calculation_binding.py) | `a93057a8a31f14b2ed7aa21992015c471feee4206e8944e68472c2c8fdcaadec` |
| [mvp/src/metall_mvp/domain/nsi/material_catalog_extraction.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/material_catalog_extraction.py) | `47cbb60b4940fbbab51a169d4792bdac0c148e565b00511314cb53368ff1de1b` |
| [mvp/src/metall_mvp/domain/nsi/material_evidence.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/material_evidence.py) | `b32419da88cae7d226e416bdf4a66cfdd3b963c792038161ae4f95d0c846ce35` |
| [mvp/src/metall_mvp/domain/nsi/material_extraction.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/material_extraction.py) | `feee4ae51e85e8effd5ffe7d6d83a873d265ac5400e74c6cdd13ad960ee77ce6` |
| [mvp/src/metall_mvp/domain/nsi/material_html.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/material_html.py) | `aa3a7efa86baabfffa395937a553f74a78129124a510cf8219546d6cfd0829a8` |
| [mvp/src/metall_mvp/domain/nsi/material_product_policy.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/material_product_policy.py) | `60ee62639ac06a84ae476c9331cced06dde45c62f371ffc4298346acd3940b7e` |
| [mvp/src/metall_mvp/domain/nsi/material_source_settings.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/material_source_settings.py) | `71bf6ca607f13c7c5ef4162f8f399d9fb848233b6a533d8da0026e13d9b27ded` |
| [mvp/src/metall_mvp/domain/nsi/material_sources.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/material_sources.py) | `c5359d50a8590cf3b86af02fcedf16d45d45dab3612f19f8ecf2bda9f01f0fd4` |
| [mvp/src/metall_mvp/domain/nsi/models.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/models.py) | `f378dacf4a21ccb60a5a27bbbd3ad26829dfe8dfea93003ca6079ef821d8f6b1` |
| [mvp/src/metall_mvp/domain/nsi/research.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/research.py) | `0dddc91ab450c1c29e15c26c66d4ff38bd314aa9672c815c0e7d5220c3d733ec` |
| [mvp/src/metall_mvp/domain/nsi/runtime_bridge.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/runtime_bridge.py) | `851585771a16042eed321b4bfd5cd4053c9f0a54eeab594c7f98195fd0e470ca` |
| [mvp/src/metall_mvp/domain/nsi/service.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/service.py) | `f99628132bc3bb2c0c7292b4e4ea8d68d8dc38b6eb6f44edef5c90df696220ef` |
| [mvp/src/metall_mvp/domain/nsi/splav_material_runtime.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/splav_material_runtime.py) | `4745aa5c11db806dd542951612c47790163c932d1b960e41db49eb491b32b011` |
| [mvp/src/metall_mvp/domain/nsi/splav_stock_runtime.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/splav_stock_runtime.py) | `bbfef0730807b69d47f8a82ccb92a4c4603c0cb8497eaa147c80f040d188fb52` |
| [mvp/src/metall_mvp/domain/nsi/standard_form_scope.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/standard_form_scope.py) | `c2c833e5a87f083dbe330947b9b646a1023e5ae10eb9ee8d37a939051309d856` |
| [mvp/src/metall_mvp/domain/nsi/stock_curvature.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/stock_curvature.py) | `2129c87a530b5a961cbc8045a86432c5356da22ad4dfef8d3a84ad2e57d212cf` |
| [mvp/src/metall_mvp/domain/nsi/stock_formula_rules.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/stock_formula_rules.py) | `7b3ba9afb153d5b63449d5835b61cb3eb71c270c77e27c799d5187fbe144a6db` |
| [mvp/src/metall_mvp/domain/nsi/stock_selection_package.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/stock_selection_package.py) | `52d6fb17e9dbdf745dca4d95ddbe71f1230d5e7f66d566c120c8c96d5be72a44` |
| [mvp/src/metall_mvp/domain/nsi/tolerances.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/nsi/tolerances.py) | `831f8c6eb95007dd64ac4991d22ec5bef04e0ed6b5766e6c26a2980ee4d67948` |
| [mvp/src/metall_mvp/domain/passport/physical_geometry.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/passport/physical_geometry.py) | `f92d578c5eef3c4047030559bd9e3966babb2219cbf59c15b17548de5953a896` |
| [mvp/src/metall_mvp/domain/passport/units.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/passport/units.py) | `7b73b862a24a1c8f951fded65c13f3b6a2ad82b27d4ede2b6ef5322208fadc91` |
| [mvp/src/metall_mvp/domain/recognition/autonomous_parts/mass.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/recognition/autonomous_parts/mass.py) | `e40517abedc8f65ffb4b2d15144bd264c2c23a587a4f953ecfbd2f260d840b26` |
| [mvp/src/metall_mvp/domain/recognition/models.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/recognition/models.py) | `efcebaaddae1ef68e3d5c743cda1bfbbb2412da97a86487ed585412093c686a1` |
| [mvp/src/metall_mvp/domain/route_planning.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/route_planning.py) | `9855fbff39c02bd64fda37ae8e9302950418cef85643d98326afbea7273ac57c` |
| [mvp/src/metall_mvp/domain/route_time.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/route_time.py) | `50dd89ac7d22dfca8b1856cc640e8e5967bf2e810e2851c66c17c0c420ad0fc7` |
| [mvp/src/metall_mvp/main.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/main.py) | `83e41248ad2056c0121136ebaa5499ebb1b05bc574b70b68dd85f7abf915d780` |
| [mvp/src/metall_mvp/sheet_tolerance_policy.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/sheet_tolerance_policy.py) | `b7d68fe4ae3b571481894ed8ff55b508c22c710458be23c624efd2aed979fa4d` |
| [mvp/src/metall_mvp/stock_fit_safety.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/stock_fit_safety.py) | `310c1a33a49300346cd78920bda3732e58670e1bd0cef3ab1d57135d8c82536a` |
| [mvp/src/metall_mvp/tools/raster.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/tools/raster.py) | `3f2fcd737940dc10a02dd3e1cdffcbc5f1f8929a8cc8b410ddf0b17f037afb49` |
| [mvp/src/metall_mvp/workflows/accepted_estimate.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/accepted_estimate.py) | `1cbdcc349fdf069952ea499669968dd71d0f880121f02abe666d857f2b55a2d6` |
| [mvp/src/metall_mvp/workflows/automatic_compact_time.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/automatic_compact_time.py) | `ac4539729409bc8e56e4aa18f70ed1c96f93b6a55935a5f95c6fe5fea47ba544` |
| [mvp/src/metall_mvp/workflows/compact_estimation.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/compact_estimation.py) | `d2c84a8de1b7205c45e6fd532a5363453754748c4e6db4c0229a4583eb76114e` |
| [mvp/src/metall_mvp/workflows/compact_regime_proposals.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/compact_regime_proposals.py) | `57ffbe5fc7bf51b8bff3b583550e049758d0042501df3dc0e137ee0fb0ba9251` |
| [mvp/src/metall_mvp/workflows/compact_round.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/compact_round.py) | `b21156419ce62ae36ddfcc014004c0269f659d67896d9e558e805e9dd422d8e6` |
| [mvp/src/metall_mvp/workflows/cutting_calculation.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/cutting_calculation.py) | `040b1a9f2cbeb4377b21a7bf042fb33039f878588fae28e2a5ae4cadcda366c1` |
| [mvp/src/metall_mvp/workflows/d001_estimate.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/d001_estimate.py) | `711c89295490755e07bfe376c7a0b3bfe260e21701a4e1a53821abd033e9598f` |
| [mvp/src/metall_mvp/workflows/d001_time.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/d001_time.py) | `8b46ad1f1dd09e2f7a512f6523c2eb523d4e8593904a24dde357c3f64032b63c` |
| [mvp/src/metall_mvp/workflows/engineering_view.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/engineering_view.py) | `85bde6d553b65773735183940d688a2b14f9ebccffa951d4e10f75035a7177c8` |
| [mvp/src/metall_mvp/workflows/machining_adapter.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/machining_adapter.py) | `0fb7d2b7ded1f0baf9f515ddc2b08ada7bb306441ef0badf16fb2db266e8ea57` |
| [mvp/src/metall_mvp/workflows/stock_selection.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/stock_selection.py) | `592c152fb8529ca275f3b75fa34cfda74c7fe66a9d0bd47469b3742ee8091914` |
| [splav-parser/cmd/splav-parser/main.go](F:/projects/metall-dev-2/splav-parser/cmd/splav-parser/main.go) | `4fae6a70a781c9640d4475068d7114895c3dc5816b7c90dda94d027a82d869e0` |
| [stock-selection/selection/decimal.go](F:/projects/metall-dev-2/stock-selection/selection/decimal.go) | `95574838b922035446e39becb3aeb0eec56869279c370be8fe46e8a9609c927c` |
| [stock-selection/selection/engine.go](F:/projects/metall-dev-2/stock-selection/selection/engine.go) | `9716b921e6df99c0b334460ed9fb5d08749c22cd5b1594bfef3d7f0f797a915f` |
| [stock-selection/selection/http.go](F:/projects/metall-dev-2/stock-selection/selection/http.go) | `2837076bc187e9eb3021c11dfacf1c60706daf9bb1b8304513ad33fae117438e` |
| [stock-selection/selection/layout.go](F:/projects/metall-dev-2/stock-selection/selection/layout.go) | `645bd0f875356a89d9cd82f604b1301c8c8926053b68fa4b985f0fdd3aba6820` |
| [web/src/api/hooks/useRuns.ts](F:/projects/metall-dev-2/web/src/api/hooks/useRuns.ts) | `fb9269c2a2e7aa7268d84376d1bbfbcdc056248fa49333a7adadb0ed731150a2` |
| [web/vite.config.ts](F:/projects/metall-dev-2/web/vite.config.ts) | `8ce7da3d4d7012604458860888eaa0546782e047e2c69462df826701107ebd60` |

## 6. Открытые вопросы

1. Качество и производственная применимость новых ответов DETAIL по `compact-detail-intent/1` требуют отдельной проверки; наличие нового контракта в рабочем дереве не закрывает её.
2. Действующие рабочие CSV, профили, формульные политики и карточки оборудования могут переопределять исходные наборы. Их фактическая конфигурация и редакции в этом исследовании UNKNOWN.
3. Полнота времени и стоимости конкретной детали, её материальные цены, неоценённые работы и резерв не определялись.
4. Выбор следующей архитектуры или перенос ответственности между сервисами не выполнен: комплект фиксирует существующую реализацию и позволяет отдельно обсудить её изменение.
