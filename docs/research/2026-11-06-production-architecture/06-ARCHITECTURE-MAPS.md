# Карта архитектуры «Подготовки производства»

Дата: 06.11.2026. Статус: описание реализованного основного пути `compact_round` по зафиксированному снимку кода. Ветка `test-2`, HEAD `d9329696188fb1ad9d103ac3ad55908e55d37856`, с незакоммиченными изменениями `compact-detail-intent/1`. Перед подготовкой карты проверено отсутствие содержательных изменений относящихся к ней исходников относительно снимка.

Карта читается сверху вниз: сначала назначение системы, затем исполнители, затем точные границы обмена. Русские подписи объясняют смысл, английские имена обозначают реальные поля, роли и адреса кода. Схемы показывают логические связи; отдельными микросервисами являются только явно обозначенные Go-сервисы.

## 1. Общая архитектура

### 1.1. Что получает оператор

Вопрос схемы: как задача на изготовление превращается в расчёт с проверяемыми основаниями?

```mermaid
flowchart TD
    A["Оператор передаёт чертёж<br/>и задаёт условия заказа"]
    B["Система читает и перепроверяет источник<br/>Получает данные детали и открытые вопросы"]
    C["Система уточняет справочные основания<br/>Материал, заготовка, предварительный маршрут"]
    D["Оператор проверяет данные и карту<br/>Исправляет спорное и явно подтверждает продолжение"]
    E["Система прорабатывает операции<br/>Строит проходы и сохраняет результаты времени"]
    PRICE["Оператор отдельно запускает стоимость<br/>Система применяет ставки, надбавку и резерв"]
    F["Оператор получает результат<br/>Известные суммы, основания и нерешённые вопросы"]
    A --> B --> C --> D --> E --> PRICE --> F
    D -->|"Нужны изменения"| C
    F -.-> G["Полная смета известна только при полном покрытии<br/>Неизвестная работа или цена сохраняется как UNKNOWN"]
```

Основание: [начальный workflow](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/compact_round.py:1013), [подтверждение](F:/projects/metall-dev-2/mvp/src/metall_mvp/api/routes_parts/compact_round.py:438), [сборка сметы](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/estimate.py:224).

### 1.2. Из каких приложений состоит система

Вопрос схемы: где находится управление процессом и какие задачи вынесены в сервисы?

```mermaid
flowchart TB
    OP["Оператор"] --> WEB["Web<br/>Рабочее место в браузере<br/>порт 5173"]
    WEB -->|"Команды и чтение результатов<br/>HTTP /api/v1"| API["Metall API / Python<br/>Управляет процессом и хранит его состояние<br/>порт 8766"]

    API -->|"Чтение и технологические решения"| MODELS["Настроенный провайдер моделей<br/>Четыре роли основного процесса"]

    subgraph SERVICES["Три самостоятельных предметных микросервиса"]
        MAT["splav-parser / Go<br/>Справочные сведения о материалах<br/>порт 8775"]
        STOCK["stock-selection / Go<br/>Подбор круга и раскладка партии<br/>порт 8789"]
        CALC["machining-calc / Go<br/>Численные расчёты обработки<br/>порт 8788"]
    end

    API -->|"Запрос марки и свойств"| MAT
    API -->|"Размерная потребность и условия поставки"| STOCK
    API -->|"Геометрия, режимы и метод расчёта"| CALC
    API --> STORE["Хранилища Metall<br/>Состояния, НСИ, станки и артефакты"]
    TRACE["Trace Console<br/>Диагностика запусков<br/>порт 8077"] -.->|"Только чтение trace.db"| STORE
    TRACE -.->|"Другой режим: API трасс"| API
```

Порты относятся к конфигурации рабочего режима, а не к проверке запущенных сейчас процессов. Временный стенд выбирает свободные порты. Основание: [запускатель](F:/projects/metall-dev-2/mvp/scripts/dev_stack.py:335), [подключение компонентов](F:/projects/metall-dev-2/mvp/src/metall_mvp/main.py:150), [диагностическая консоль](F:/projects/metall-dev-2/trace-console/README.md).

### 1.3. Кто отвечает за сохранённые данные

Вопрос схемы: где исходные факты, где расчётный результат и где его доказательства?

```mermaid
flowchart LR
    API["Metall API"] --> STATE["Состояния и история<br/>trace.db<br/>compact_round_heads / compact_round_history"]
    API --> TRACE["Метаданные исполнения<br/>processing_runs / trace_spans<br/>trace_events / artifacts"]
    API --> FILES["Файлы артефактов<br/>Исходный чертёж, растр<br/>JSON-ответы модельных ролей"]
    API --> NSI["Нормативные данные<br/>nsi_catalog.db и research-каталог<br/>CSV-проекции и выбранные редакции"]
    API --> MACH["Паспорта оборудования<br/>machine_passports.db<br/>Характеристики, режимы, ставки и версии"]
    MAT["Splav"] --> MATDB["splav.db<br/>Материалы и источники"]
    API --> PACK["Неизменяемые JSON-пакеты<br/>Нормы и условия подбора<br/>stock-selection-packages"]
    STOCK["stock-selection"] -->|"Проверенное чтение по ссылке и хешу"| PACK
    UI["Таблицы на экране"] -.->|"Показывают проекцию"| STATE
```

Имена баз являются стандартными путями; настройки могут их переопределять. Строка `artifacts` в SQL хранит метаданные, содержимое артефакта лежит в файле. Старое машинное хранилище Splav отключено; паспорта станков относятся к Metall. Основание: [CompactStore](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/compact_round.py:53), [SQL-трассировка](F:/projects/metall-dev-2/mvp/src/metall_mvp/db/repository.py:55), [паспорта станков](F:/projects/metall-dev-2/mvp/src/metall_mvp/main.py:78), [отключение прежнего каталога](F:/projects/metall-dev-2/splav-parser/cmd/splav-parser/main.go:75).

## 2. Агентская архитектура

### 2.1. Четыре роли и их результаты

Вопрос схемы: какое решение принимает каждая модельная роль и что между ними делает обычная программа?

```mermaid
flowchart TD
    SOURCE["КОД: подготовка источника<br/>Сохранить файл, получить растр и сведения о документе"]
    READ["МОДЕЛЬ: READING<br/>Вход: чертёж и контекст источника<br/>Выход: CompactReading, структурированное чтение"]
    VERIFY["МОДЕЛЬ: VERIFY<br/>Вход: тот же источник и первое чтение<br/>Выход: ReadingVerification, правки и открытые вопросы"]
    ENRICH["КОД: справочное обогащение<br/>Применить допустимые правки, запросить материал<br/>Получить подбор заготовки и сохранить ограничения"]
    PLAN["МОДЕЛЬ: PLANNING<br/>Вход: чтение, материал, заготовка, ограничения<br/>Выход: CompactRoute, предварительные операции"]
    HUMAN["ОПЕРАТОР: проверка и подтверждение<br/>Точные входы, карта, станки и принятые ограничения"]
    DETAIL["МОДЕЛЬ: DETAILING<br/>Вход: подтверждённая карта и расчётный контекст<br/>Выход: compact-detail-intent/1 для её операций"]
    CODE["КОД: локальные проходы и вычисления<br/>Python + Go, затем сборка времени и сметы"]

    SOURCE --> READ --> VERIFY --> ENRICH --> PLAN --> HUMAN --> DETAIL --> CODE
    ENRICH -.-> UNSUP["Неподдержанная область<br/>Сохранить результат и ограничения<br/>Поддержанный круглый проход не продолжать"]
```

Это четыре роли в одном управляемом backend-процессе. Они не являются четырьмя сетевыми микросервисами и не передают задания друг другу напрямую. VERIFY является повторным модельным чтением, а не независимым доказательством правильности неразборчивого знака. Основание: [read_and_plan](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/compact_round.py:1013), [контракты чтения и карты](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/compact_round.py:150), [generate_details](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/compact_round.py:1224).

### 2.2. Как исполняется одна модельная роль

Вопрос схемы: кто передаёт инструкцию, проверяет ответ и сохраняет свидетельства?

```mermaid
sequenceDiagram
    participant W as Workflow Metall
    participant T as Трассировка и артефакты
    participant R as TracedLLMRuntime
    participant P as Настроенный провайдер
    participant V as Проверка контракта

    W->>W: Прочитать инструкцию выбранной роли
    W->>T: Создать дочерний запуск и отметить этап
    W->>R: Передать модель, effort, контекст и output_schema
    Note over W,R: Для READING и VERIFY передаются ссылки на изображение<br/>Транспорт определяется профилем провайдера
    R->>P: Выполнить модельное задание
    P-->>R: Структурированный ответ и сведения исполнения
    R-->>W: Результат вызова
    W->>V: schema.model_validate(parsed_response)
    alt Ответ соответствует структуре
        V-->>W: Принятый объект роли
        W->>T: Сохранить JSON-артефакт и хеш инструкции
        W->>T: Завершить дочерний запуск
    else Ошибка контракта или выполнения
        V-->>W: Диагностика
        W->>T: Зафиксировать ошибку запуска
    end
```

Структурная проверка не подтверждает физическую истинность ответа. В `ask` задан `max_attempts=1`; четыре этапа не означают гарантированно четыре внутренних сетевых обращения или действия инструментов провайдера. Основание: [ask](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/compact_round.py:552), [провайдер и runtime](F:/projects/metall-dev-2/mvp/src/metall_mvp/main.py:190).

### 2.3. Где заканчиваются решения модели и начинаются расчёты

Вопрос схемы: почему технологическая детализация, численный расчёт и смета являются разными результатами?

```mermaid
flowchart TD
    subgraph MODEL["Модель DETAILING: технологический замысел"]
        M1["Работы и их привязки<br/>works, feature_bindings"]
        M2["Станок и установки<br/>machine_id, setup_group, tooling, control"]
        M3["Цели и основания режима<br/>local_pass_plans, regime_proposals"]
        M4["Неподдержанное и спорное<br/>unresolved_goals, calculation_gaps"]
    end

    MODEL --> INTENT["Контракт compact-detail-intent/1<br/>operations: намерения по операциям"]
    INTENT --> PY["Python Metall<br/>Связать цели с принятыми размерами<br/>Применить режимы и построить поддержанные проходы"]
    PY --> GO["Go machining-calc<br/>Посчитать конкретное задание<br/>Геометрия, время и поддержанные нагрузки"]
    GO --> RESULTS["Python Metall<br/>Применить основания времени<br/>Сохранить результаты операций"]
    RESULTS --> COMMAND["Отдельная команда оператора<br/>cost-estimate или machine-estimate"]
    COMMAND --> ASSEMBLY["Python Metall<br/>Собрать стоимость по сохранённым основаниям<br/>Надбавка, резерв и границы полноты"]
    M4 -.-> GAP["Нерешённая работа остаётся видимой<br/>Численный итог может быть частичным"]
    GAP --> ASSEMBLY
```

Новый модельный контракт не принимает готовую смету, собственные минуты и ручной список физических `passes`. Он преобразуется в совместимый `CompactDetail`; чтение прежних сохранённых результатов сохраняется. Основание: [compact_detail_intent.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/compact_detail_intent.py:51), [подготовка операций](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/compact_estimation.py:277), [каталог Go-методов](F:/projects/metall-dev-2/machining-calc/catalog/catalog.go:189).

### 2.4. Почему подтверждение нельзя заменить автоматическим продолжением

Вопрос схемы: что должно совпасть, чтобы начать детализацию и применить её результат?

```mermaid
flowchart TD
    OP["Оператор: Подтвердить и рассчитать"] --> REV{"Ревизия данных актуальна?<br/>expected_revision"}
    REV -->|"Нет"| CONFLICT["HTTP 409<br/>Обновить данные и проверить изменения"]
    REV -->|"Да"| BASIS{"Есть поддержанное чтение и карта?<br/>Нет непринятой заготовки<br/>Нет зависимой смены количества"}
    BASIS -->|"Нет"| CHECK["Исправить или дополнить основание<br/>При необходимости подготовить новую карту"]
    BASIS -->|"Да"| PIN["КОД: закрепить подтверждение<br/>basis_sha256, reviewed_revision<br/>machine_catalog_sha256, ограничения"]
    PIN --> RUN["Разрешить DETAILING<br/>по закреплённым входам"]
    RUN --> FRESH{"Входы и разрешение<br/>по-прежнему действуют?"}
    FRESH -->|"Да"| SAVE["Применить текущий результат<br/>Сохранить новую ревизию"]
    FRESH -->|"Нет"| LATE["Поздний ответ не становится текущим<br/>Сохранённые свидетельства остаются в истории"]
    RESTART["Перезапуск backend"] -.-> INTERRUPT["Незавершённый этап отмечается failed<br/>Новый модельный вызов автоматически не запускается"]
```

В этом compact-пути предварительная карта появляется до показанного подтверждения. Историческая схема D001 с отдельными G1/G2 остаётся другой ветвью API. Основание: [confirm_compact](F:/projects/metall-dev-2/mvp/src/metall_mvp/api/routes_parts/compact_round.py:438), [CompactStore](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/compact_round.py:75), [восстановление после перезапуска](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/compact_round.py:1676).

## 3. Взаимодействие микросервисов и их контракты

### 3.1. Последовательность обмена на основном пути

Вопрос схемы: когда нужен каждый сервис и кто вызывает следующий шаг?

```mermaid
sequenceDiagram
    actor O as Оператор
    participant W as Web
    participant A as Metall API
    participant L as Модельные роли
    participant S as Splav
    participant B as stock-selection
    participant C as machining-calc

    O->>W: Загрузить чертёж
    W->>A: POST /api/v1/runs/recognition/start
    A-->>W: HTTP 202, run_id
    A->>A: Сохранить источник и подготовить растр
    A->>L: READING, затем VERIFY
    L-->>A: Чтение, правки и вопросы
    A->>S: Получить материал и доступные свойства
    S-->>A: Карточка и сведения об источнике
    A->>B: GET /v2/capabilities
    B-->>A: Поддержанные формы, методы и версия
    A->>B: POST /v2/stock-selection/calculate
    B-->>A: Подбор и материальная раскладка
    A->>L: PLANNING
    L-->>A: Предварительная карта
    W->>A: GET /api/v1/runs/{run_id}/compact-round
    A-->>W: Данные для проверки оператором
    O->>W: Подтвердить актуальные входы и карту
    W->>A: POST /api/v1/runs/{run_id}/compact-round/confirm
    A->>L: DETAILING по принятому основанию
    L-->>A: compact-detail-intent/1
    A->>A: Построить локальные проходы и задания
    loop Для сформированных расчётных заданий
        A->>C: POST /v1/calculate
        C-->>A: Метрики или события, статусы и evidence
    end
    A->>A: Применить основания времени, сохранить details
    W->>A: Прочитать обновлённый CompactState
    A-->>W: Результаты операций, ограничения и UNKNOWN
    O->>W: Отдельно запустить расчёт стоимости
    W->>A: POST /api/v1/runs/{run_id}/compact-round/cost-estimate
    A->>A: Свести денежные строки, надбавку и резерв
    A-->>W: CompactState с сохранённым cost_estimate
    W-->>O: Показать сохранённый результат
```

Схема показывает успешную логическую цепочку. Кэш может исключить повторный расчёт подбора; для Splav предусмотрены другие способы получения той же карточки. Новый DETAIL завершается результатами операций: `legacy_estimate=False`, `cost_estimate=None`, `time_estimate=None`. GET только читает состояние. Отдельный `machine-estimate` пересчитывает сохранённые входы по карточкам и затем стоимость; оценочные совместимые команды времени не являются автоматическим шагом новой загрузки. Неполные данные и отказы показаны отдельно в 3.8. Основание: [вход UI](F:/projects/metall-dev-2/web/src/api/hooks/useRuns.ts:349), [сохранение DETAIL](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/compact_round.py:1637), [команды стоимости](F:/projects/metall-dev-2/mvp/src/metall_mvp/api/routes_parts/compact_round.py:671), [кнопка UI](F:/projects/metall-dev-2/web/src/components/route/CompactCostEstimate.tsx:90), [клиент подбора](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/stock_selection.py:253), [HTTP-калькулятор](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/machining_adapter.py:215).

### 3.2. Контракт Web → Metall API

Вопрос схемы: что означает принятие файла и какой командой оператор разрешает следующую модельную работу?

```mermaid
flowchart TD
    UPLOAD["Загрузка: multipart/form-data<br/>source, project_id, document_id<br/>provider_profile, параметры моделей<br/>pipeline_mode = compact_round"]
    START["POST /api/v1/runs/recognition/start"]
    ACCEPTED["HTTP 202<br/>run_id, requested_mode, prompt_mode<br/>Задание принято, результат ещё не готов"]
    READ["GET /api/v1/runs/{run_id}/compact-round"]
    STATE["CompactState / compact-round/1<br/>revision, status, reading, route, details<br/>time_estimate, cost_estimate и ограничения"]
    CONFIRM["Команда подтверждения<br/>expected_revision, confirm_inputs = true<br/>accepted_limitations, restart_details"]
    POST["POST /api/v1/runs/{run_id}/compact-round/confirm"]
    NEXT["HTTP 202 и текущее состояние<br/>Запуск детализации разрешён"]
    DONE["Повтор с тем же актуальным основанием<br/>При уже готовом результате код возвращает его<br/>Новая модельная работа не создаётся молча"]
    ERROR["HTTP 409<br/>Входы изменились, работа выполняется<br/>или условия продолжения не выполнены"]

    UPLOAD --> START --> ACCEPTED --> READ --> STATE
    STATE --> CONFIRM --> POST
    POST --> NEXT
    POST --> DONE
    POST --> ERROR
```

`revision` является версией состояния, `schema_version` является версией его структуры. Это разные понятия. Контракт полного API также сохранён в `mvp/openapi.json`. Основание: [recognition.py](F:/projects/metall-dev-2/mvp/src/metall_mvp/api/routes_parts/recognition.py:553), [CompactConfirmation](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/compact_round.py:557), [CompactState](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/compact_round.py:667).

### 3.3. Контракт Metall → Splav: материал и свойства

Вопрос схемы: как справочная марка превращается в набор свойств с сохранением происхождения?

```mermaid
flowchart TD
    QUERY["Metall: исходная марка материала<br/>Сохранить буквальное назначение чертежа"]
    SEARCH["GET /v1/search?q=марка<br/>Ответ: results со списком кандидатов"]
    IDENTITY{"Найдена допустимая<br/>идентичность марки?"}
    CARD["GET /v1/materials/{id}<br/>Необязательный фильтр sections"]
    RESOLVE["Другой поддержанный вход<br/>GET /v1/resolve?q=марка<br/>resolved, matched_by, material"]
    IDENT["Идентичность и происхождение<br/>id, provider, source_id, grade<br/>source_url, source_hash, updated_at"]
    PROPS["Доступные разделы карточки<br/>chemical_composition, mechanical_properties<br/>physical_properties, hardness, delivery_forms"]
    RESULT["Metall: связать свойства с деталью<br/>Сохранить источник, условия и неопределённость"]
    UNKNOWN["Материал неоднозначен или недоступен<br/>Свойства остаются неизвестными<br/>Чужой аналог не заменяет марку автоматически"]
    MCP["Предусмотренный резервный транспорт<br/>stdio MCP: splav_search / splav_material<br/>Успех зависит от доступного бинарника"]

    QUERY --> SEARCH --> IDENTITY
    IDENTITY -->|"Да"| CARD
    IDENTITY -->|"Нет"| UNKNOWN
    QUERY -.-> RESOLVE
    RESOLVE -->|"resolved и допустимый matched_by"| IDENT
    RESOLVE -->|"Нет подходящей идентичности"| UNKNOWN
    CARD --> IDENT
    CARD --> PROPS
    IDENT --> RESULT
    PROPS --> RESULT
    SEARCH -.->|"HTTP недоступен"| MCP
    MCP -.-> IDENTITY
```

В схеме показаны основные используемые группы карточки; дополнительные необязательные разделы определены в Go-модели. `/v1` является версией HTTP-интерфейса, а не универсальным полем `schema_version` внутри карточки. Основание: [SplavMicroserviceClient](F:/projects/metall-dev-2/mvp/src/metall_mvp/tools/splav_client.py:139), [модель материала](F:/projects/metall-dev-2/splav-parser/internal/model/material.go:5), [идентичность в resolver](F:/projects/metall-dev-2/mvp/src/metall_mvp/tools/splav_client.py:196).

### 3.4. Контракт Metall → stock-selection: запрос

Вопрос схемы: какие факты и расчётные основания нужны, чтобы выбрать прутки?

```mermaid
flowchart TD
    META["Оболочка запроса<br/>schema_version = stock-selection/2<br/>request_id, source_revision"]
    REV["Версии исходных данных<br/>drawing_id, reading_revision<br/>order_revision, settings_revision"]
    FACTS["Прочитанные факты<br/>stock_recognition, recognized_parameters<br/>material_ref, quantity"]
    NUMBER["Число с основанием<br/>value: десятичная строка либо null<br/>unit, basis, source_refs, assumption_id"]
    INPUTS["calculation_inputs для круга<br/>method_id = round-bar/1, parameter_refs<br/>allowed_supply_lengths_mm: 6000 / 12000<br/>selection_policy = min-purchase-length-then-bars/1"]
    PINS["Ссылки на неизменяемые пакеты<br/>norms_snapshot, cutting_profile_ref<br/>Каждая ссылка: id, version, sha256"]
    EVIDENCE["Происхождение и допущения<br/>sources, assumptions"]
    CALL["POST /v2/stock-selection/calculate<br/>Content-Type: application/json"]
    ENGINE["Go: проверить схему, пакеты и входы<br/>Вычислить подбор и материальную раскладку"]

    META --> CALL
    META --- REV
    FACTS --> CALL
    FACTS --- NUMBER
    INPUTS --> CALL
    INPUTS --- PINS
    EVIDENCE --> CALL
    CALL --> ENGINE
```

`quantity.value` является положительным целым либо `null`; остальные численные параметры используют свои типы свидетельств. `calculation_inputs` и отдельные ссылки могут быть `null` согласно схеме, что не даёт права считать отсутствующее основание нулём. Перед расчётом клиент читает `GET /v2/capabilities`; текущий поддержанный метод относится к `round_bar`. Основание: [types.schema.json](F:/projects/metall-dev-2/contracts/stock-selection/v2/types.schema.json), [HTTP-граница](F:/projects/metall-dev-2/stock-selection/selection/http.go:48).

### 3.5. Контракт stock-selection → Metall: результат

Вопрос схемы: что именно выбрано, какие ограничения остались и можно ли повторно использовать ответ?

```mermaid
flowchart TD
    RESPONSE["Ответ stock-selection/2"]
    TRACE["Соответствие запросу<br/>request_id, source_revision, input_sha256<br/>input_canonicalization = stock-input-c14n/1"]
    VERSION["Версия вычисления<br/>engine_version, method_version, selection_policy<br/>norms_snapshot, cutting_profile_ref"]
    MATERIAL["Материальный результат<br/>selected_stock: выбранный круг<br/>piece: длина отделяемого отрезка<br/>batch_plan: прутки и размещение партии<br/>material_balance: расход и остатки"]
    SUPPORT["Состояние метода<br/>status: complete / partial / infeasible / unsupported<br/>calculation_support, basis_status"]
    LIMIT["Что нужно проверить<br/>requires_confirmation, confirmation_reasons<br/>checks, missing_inputs, rejected_candidates<br/>alternatives, assumptions, sources"]
    CACHE["Metall: проверить точное основание<br/>Версии, канонический хеш входа и ответ<br/>Кэш привязан к входу и capabilities"]
    UI["Передать оператору<br/>Назначение чертежа и рекомендацию различать"]
    ERROR["Ошибочный HTTP-ответ<br/>schema_version, request_id, error<br/>В error: code, message, retryable, issues"]

    RESPONSE --> TRACE --> CACHE
    RESPONSE --> VERSION --> CACHE
    RESPONSE --> MATERIAL --> UI
    RESPONSE --> SUPPORT --> UI
    RESPONSE --> LIMIT --> UI
    CACHE --> UI
    ERROR -->|"Сохранить диагностику"| UI
```

Статус `complete` здесь относится к подбору и материальному балансу, а не к готовой смете. Контракт v2 не возвращает операционные `cut_event_groups` и `handling_events`. Основание: [CalculationResponse и Error](F:/projects/metall-dev-2/contracts/stock-selection/v2/types.schema.json), [проверка и кэш клиента](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/stock_selection.py:260).

### 3.6. Контракт Metall ↔ machining-calc

Вопрос схемы: как конкретное вычислительное задание связано с результатом и его формулой?

```mermaid
flowchart TD
    CHOICE["Выбрать реализованный метод и его версию<br/>Каталог: GET /v1/operations<br/>Машинные схемы: GET /v1/schemas"]
    REQ["Запрос schema_version = machcalc/1<br/>method, datasets<br/>Геометрия и режим: geometry + common или regime<br/>Для событий партии: stock_layout"]
    VALUE["Обычный числовой операнд<br/>value: число либо null<br/>origin: source / assumption / demo / unknown<br/>source_refs: id, revision, locator; reason"]
    UNITS["Единицы определены полем метода и схемой<br/>мм, об/мин, мм/об, мин и другие<br/>Произвольный текст формулы не исполняется"]
    HTTP["POST /v1/calculate"]
    GO["Go: контракт, допустимость и арифметика"]
    OUT["Ответ: schema_version, method, outcome<br/>demonstration, conditional, issues, evidence"]
    METRICS["Обычный расчёт: metrics<br/>У каждой метрики: state, value<br/>formula_id, input_paths"]
    EVENTS["Метод партии: events вместо metrics<br/>cut_event_groups, handling_events<br/>Связь с исходным подбором"]
    EVIDENCE["evidence<br/>core_version, catalog_revision<br/>canonical_request, request_sha256, datasets"]
    CHECK["Metall: сверить метод, вход, хеш и единицы<br/>Сохранить независимые известные значения<br/>Проверить возможность полного времени"]

    CHOICE --> REQ --> HTTP --> GO --> OUT
    VALUE --> REQ
    UNITS --> REQ
    OUT --> METRICS --> CHECK
    OUT --> EVENTS --> CHECK
    OUT --> EVIDENCE --> CHECK
```

В снимке ядро `0.5.0`, каталог `machcalc-catalog/6`, девять методов. Десятичные длины специального `stock_layout` передаются строками согласно его собственному контракту, а не обычным `Input<T>`. Состояния `outcome`: `complete`, `partial`, `invalid`, `not_applicable`; состояния метрики: `known`, `unknown`, `invalid`, `not_applicable`. HTTP 200 не доказывает достаточность результата. Основание: [типы и версии](F:/projects/metall-dev-2/machining-calc/calc/types.go:10), [HTTP](F:/projects/metall-dev-2/machining-calc/internal/httpui/server.go:62), [специальный контракт партии](F:/projects/metall-dev-2/machining-calc/calc/bandsaw_batch.go:42), [проверка ответа](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/machining_adapter.py:159).

### 3.7. Как раскладка превращается в события, время и стоимость

Вопрос схемы: почему нельзя получить производственное время или цену непосредственно из числа купленных прутков?

```mermaid
sequenceDiagram
    participant A as Metall API
    participant S as stock-selection
    participant C as machining-calc
    participant P as Python: нормы и смета
    actor O as Оператор

    A->>S: Выбрать круг и комплект поставки
    S-->>A: selected_stock, piece, batch_plan, material_balance
    A->>A: Сохранить результат и его input_sha256
    A->>C: sawing.round.area-rate/1 + геометрия и производительность
    C-->>A: Время одного поддержанного реза и объём пропила
    A->>C: sawing.round.batch-events/1 + stock_layout
    C-->>A: События резов, загрузок и подач
    Note over A,C: События партии не содержат минут и цен<br/>Необоснованное число зажимов остаётся UNKNOWN
    O->>A: Отдельная команда расчёта стоимости
    A->>P: Передать сохранённые события, расчёты и нормы
    P->>P: Учесть частоту per_piece / per_batch и общую наладку
    P->>P: Применить ставки станков, надбавку и резерв
    P-->>A: cost_estimate с основаниями времени и границами полноты
```

Сервисы не вызывают друг друга напрямую: перевод их результатов в следующие задания выполняет Metall. Показаны типы вычислений; конкретный набор вызовов зависит от сформированных работ и достаточности оснований. Основание: [контракт v2](F:/projects/metall-dev-2/contracts/stock-selection/v2/README.md), [проекция времени партии](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/compact_estimation.py:1133), [расчётный workflow](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/compact_round.py:1377).

### 3.8. Неполные данные, ошибки и актуальность

Вопрос схемы: чем отличаются отказ запроса, неизвестное значение и устаревший результат?

```mermaid
flowchart TD
    R["Получен запрос или ответ"] --> K{"Можно использовать<br/>это основание?"}
    K -->|"Нарушена JSON-схема или типы"| CONTRACT["Ошибка контракта<br/>stock-selection: отдельный error-ответ<br/>machining-calc: HTTP 422 для ошибки контракта"]
    K -->|"Неверны хеш, метод или версия"| WRONG["Metall отвергает вычислительное свидетельство<br/>Не подставляет ответ к другому запросу"]
    K -->|"Изменились входы или разрешение"| STALE["Конфликт ревизии / поздний ответ<br/>Текущее состояние не перезаписывается"]
    K -->|"Сервис недоступен"| UNAVAILABLE["Сохранить чтение и диагностику<br/>Зависимый подбор или время остаётся неизвестным"]
    K -->|"Структура верна, но данных недостаточно"| PARTIAL["Частичный предметный результат<br/>Сохранить известные значения и missing_inputs / issues"]
    K -->|"Поддержанная задача и достаточные входы"| VALID["Принять расчёт в его области<br/>Затем проверить полноту всех работ и цен"]
    PARTIAL --> FINAL["Итог для оператора<br/>Известная база отдельно от полного итога<br/>UNKNOWN не равен нулю"]
    VALID --> FINAL
    UNAVAILABLE --> FINAL
```

У ответов разных сервисов разные состояния и поля диагностики; схема не вводит для них общий новый JSON-контракт. `ready` в `CompactState` означает завершение workflow, а не производственную приёмку и не гарантированно полную цену. Основание: [stock HTTP](F:/projects/metall-dev-2/stock-selection/selection/http.go:48), [calc HTTP](F:/projects/metall-dev-2/machining-calc/internal/httpui/server.go:62), [ошибка отдельного прохода](F:/projects/metall-dev-2/mvp/src/metall_mvp/workflows/compact_round.py:1526), [полнота сметы](F:/projects/metall-dev-2/mvp/src/metall_mvp/domain/estimation/estimate.py:224).

## 4. Границы карты и связанные материалы

```mermaid
flowchart LR
    MAP["Эта карта<br/>Реализованный основной compact-путь"] --> PROC["Подробности шагов<br/>01-PROCESS.md"]
    MAP --> FORM["Формулы по категориям<br/>02-FORMULAS.md<br/>03-ADDITIONAL-FORMULAS.md"]
    MAP --> EVID["Основание и точные байты<br/>04-SOURCES-AND-COVERAGE.md<br/>Локальный manifest снимка"]
    MAP -.-> LEGACY["Другие сохранённые API и D001<br/>Не назначаются автоматически новой загрузкой"]
    MAP -.-> LIMIT["Качество нового модельного ответа<br/>Рабочие цены и нормы конкретного задания<br/>Производственная применимость: отдельно проверяются"]
```

Документ описывает реализацию, а не проект новой системы. Рабочие базы и секреты не исследовались; модели и продуктовые API не запускались. [Описание процесса](01-PROCESS.md), [формулы основного пути](02-FORMULAS.md), [дополнительные формулы](03-ADDITIONAL-FORMULAS.md), [реестр снимка](04-SOURCES-AND-COVERAGE.md).
