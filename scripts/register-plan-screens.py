"""Copy screenshots for the "Общий план" page (input data 0.1–0.6).

Captures come from the QA reports of the source product and are copied byte for
byte: no crop, no retouch. Dates are the capture dates of those reports.
Run from the repository root: python scripts/register-plan-screens.py
"""

import hashlib
import json
from pathlib import Path

from PIL import Image

REPORTS = Path("F:/projects/metall-dev-2/docs/03-reports")
OUT = Path("public/plan")

W4 = "Рабочий сохранённый чертёж №4 «Вал конвейера приводной»."

IMAGES = [
    # 0.1 Технические требования
    {
        "id": "p-req-source",
        "source": "88-input-01-requirements-2026-10-19/main-ui-source-location.jpg",
        "date": "19.10.2026",
        "title": "Требование и его строка на чертеже",
        "note": W4 + " Выбрано требование о неуказанных предельных отклонениях; система подсвечивает его строку на исходном листе.",
    },
    {
        "id": "p-req-edit",
        "source": "118-r09b-tr05-correction-2026-10-21/apply-requirement-form.png",
        "date": "21.10.2026",
        "title": "Исправление требования через обычную форму",
        "note": W4 + " Знак биения правой шейки исправлен по исходному листу; прежняя запись осталась в истории.",
    },
    {
        "id": "p-req-route",
        "source": "127-right-runout-route-review-2026-10-21/main-ui-op060-reload.png",
        "date": "21.10.2026",
        "title": "Исправленное требование в операции маршрута",
        "note": "Операция окончательной обработки шеек после исправления требования о биении. ",
    },
    # 0.2 Поверхности
    {
        "id": "p-surf-registry",
        "source": "89-input-02-surfaces-2026-10-19/main-ui-surface-registry-wide.jpg",
        "date": "19.10.2026",
        "title": "Перечень поверхностей и их размеров",
        "note": W4 + " Каждая поверхность: сторона, роль, размеры и требования, ссылка на место на чертеже.",
    },
    {
        "id": "p-surf-source",
        "source": "94-input-fixes-r01-source-2026-10-19/main-ui-surface-source.jpg",
        "date": "19.10.2026",
        "title": "Переход от поверхности к чертежу",
        "note": W4 + " Для средней шейки открывается знак шероховатости 3,2; система прямо пишет, что границы поверхности и принадлежность базе нужно сверить.",
    },
    # 0.3 Материал
    {
        "id": "p-mat-source",
        "source": "90-input-03-material-2026-10-19/main-ui-material-source.jpg",
        "date": "19.10.2026",
        "title": "Материал и его строка в основной надписи",
        "note": W4 + " «Сталь 45 ГОСТ 1050-2013» подсвечена на листе; марка и стандарт хранятся раздельно.",
    },
    {
        "id": "p-mat-props",
        "source": "109-r05-material-properties-2026-10-20/main-ui-material-values.jpg",
        "date": "20.10.2026",
        "title": "Справочные свойства материала",
        "note": W4 + " Плотность подписана в кг/м³, твёрдость — как запись справочника, заменители — только справочно.",
    },
    # 0.4 Форма и размеры заготовки
    {
        "id": "p-stock-stages",
        "source": "103-r04-stock-stages-2026-10-20/main-ui-stock-stages-16x9.png",
        "date": "20.10.2026",
        "title": "Три стадии заготовки",
        "note": W4 + " Назначение на чертеже не найдено, предварительная рекомендация — круг Ø90 (условно), окончательное задание не сформировано.",
    },
    {
        "id": "p-stock-gost",
        "source": "121-r13-saved-examples-2026-10-21/gost88-vs2006.jpg",
        "date": "21.10.2026",
        "title": "Назначение чертежа отдельно от рекомендации",
        "note": "Вал В.1883: на чертеже назначен круг 30 по ГОСТ 2590-88, система отдельно показывает расчётный круг Ø34. ",
    },
    {
        "id": "p-stock-question",
        "source": "128-technologist-stock-question-2026-10-21/main-ui-question.png",
        "date": "21.10.2026",
        "title": "Вопрос технологу о заготовке",
        "note": "Вал В.1883: назначенный круг 30 не проходит расчёт с учётом кривизны прутка; технолог выбирает решение. ",
    },
    {
        "id": "p-stock-answer",
        "source": "128-technologist-stock-question-2026-10-21/main-ui-answer-reload.png",
        "date": "21.10.2026",
        "title": "Решение технолога сохранено",
        "note": "После перезагрузки страницы выбор технолога и его последствия видны в форме маршрута. ",
    },
    # 0.5 Масса заготовки
    {
        "id": "p-mass-objects",
        "source": "112-r08-mass-objects-2026-10-20/main-ui-mass-objects-16x9.png",
        "date": "20.10.2026",
        "title": "Масса детали и массы заготовки — раздельно",
        "note": W4 + " Масса детали по штампу 31,86 кг, пруток Ø90 × 6000 мм ≈ 298,72 кг, цилиндр Ø90 × 900 мм ≈ 44,81 кг.",
    },
    {
        "id": "p-mass-norms",
        "source": "113-r11-cut-norms-2026-10-21/comment-cut-norms-16x9.png",
        "date": "21.10.2026",
        "title": "Справочник норм отрезки круга",
        "note": "Рабочий справочник: припуск на торец и ширина пропила по диапазонам диаметра. Значения заполнены для примера; нормы цеха вносит заказчик.",
    },
    {
        "id": "p-mass-cut",
        "source": "113-r11-cut-norms-2026-10-21/comment-route-masses-16x9.png",
        "date": "21.10.2026",
        "title": "Длина и масса отрезка по норме",
        "note": W4 + " Отрезок 906 мм ≈ 45,11 кг, 6 заготовок из прутка; рядом пометка, что нормы условные.",
    },
    {
        "id": "p-mass-drawing",
        "source": "97-mass-source-choice-r02-2026-10-19/main-ui-value.jpg",
        "date": "19.10.2026",
        "title": "Масса детали со штампа и её источник",
        "note": W4 + " Пользователь выбирает, что подсветить: значение «31,86» или название поля «Масса».",
    },
    # 0.6 Станки
    {
        "id": "p-mach-catalog",
        "source": "93-input-06-machine-knowledge-2026-10-19/main-ui-machine-catalog.jpg",
        "date": "19.10.2026",
        "title": "База знаний «Станки»",
        "note": "Рабочий каталог: 15 паспортов оборудования в 11 категориях, поиск по тексту.",
    },
    {
        "id": "p-mach-passport",
        "source": "93-input-06-machine-knowledge-2026-10-19/main-ui-machine-passport.jpg",
        "date": "19.10.2026",
        "title": "Паспорт ленточнопильного станка CHENLONG",
        "note": "Рабочий каталог. Строки допустимой массы, минимальной длины отрезки и точности не заполнены — они остаются неизвестными.",
    },
    {
        "id": "p-mach-conflict",
        "source": "124-r14-equipment-ui-2026-10-21/main-ui-passport-conflict.png",
        "date": "21.10.2026",
        "title": "Защита от потери правок паспорта",
        "note": "Каталог изменился в другой вкладке: система не перезаписывает чужую правку и сохраняет введённый текст. ",
    },
]


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    registry = []
    for item in IMAGES:
        source = REPORTS / item["source"]
        data = source.read_bytes()
        with Image.open(source) as image:
            width, height = image.size
            ext = ".png" if image.format == "PNG" else ".jpg"
        target = OUT / (item["id"] + ext)
        target.write_bytes(data)
        registry.append(
            {
                **item,
                "note": item["note"].strip(),
                "file": "/plan/" + target.name,
                "source": "docs/03-reports/" + item["source"],
                "width": width,
                "height": height,
                "sha256": sha256(data),
            }
        )
    Path("src/data/plan-screens.json").write_text(
        json.dumps(registry, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"Registered {len(registry)} plan captures")


if __name__ == "__main__":
    main()
