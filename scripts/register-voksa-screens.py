"""Copy screenshots for the VoksaTech research page.

VoksaTech captures are cropped to the working panel: the account header with the
user's login is never published. Crops change framing only; pixels are not
retouched. Metall captures from the same atlas are copied byte for byte.
Run from the repository root: python scripts/register-voksa-screens.py
"""

import hashlib
import json
from pathlib import Path

from PIL import Image

RESEARCH = Path("F:/projects/metall-dev-2/voksa-metall-comparison")
ATLAS = "ui-atlas/2026-10-13/"
OUT = Path("public/voksa")

# crop: (left, top, right, bottom) in source pixels; None keeps the file unchanged.
IMAGES = [
    {
        "id": "v-passport",
        "source": ATLAS + "reference/user-provided-passport.png",
        "crop": (712, 128, 1920, 884),
        "date": "13.10.2026",
        "title": "ВоксаТех: утверждение паспорта детали",
        "note": "Паспорт контрольного синтетического вала на паузе перед утверждением. Тёмная тема кабинета; снимок пользователя, обрезан до рабочей области.",
    },
    {
        "id": "v-stock",
        "source": ATLAS + "screenshots/01-passport-stock.jpg",
        "crop": (740, 60, 1250, 720),
        "date": "13.10.2026",
        "title": "ВоксаТех: назначенная поковка и альтернатива формы",
        "note": "Свежий бесплатный паспорт контрольного вала до правок. Шапка аккаунта и левая панель обрезаны.",
    },
    {
        "id": "v-surfaces",
        "source": ATLAS + "screenshots/05-surface-provenance.jpg",
        "crop": (730, 60, 1260, 720),
        "date": "13.10.2026",
        "title": "ВоксаТех: поверхности, сторона и координаты Z",
        "note": "Свежий бесплатный паспорт контрольного вала до правок. Шапка аккаунта и левая панель обрезаны.",
    },
    {
        "id": "v-quality",
        "source": ATLAS + "screenshots/13-quality-panel.jpg",
        "crop": (480, 60, 1280, 720),
        "date": "13.10.2026",
        "title": "ВоксаТех: сводка проверки готового примера",
        "note": "Сохранённый общий пример «Скоба», партия 100. Шапка аккаунта и левая панель обрезаны.",
    },
    {
        "id": "v-route",
        "source": ATLAS + "screenshots/14-route-card.jpg",
        "crop": (480, 60, 1280, 720),
        "date": "13.10.2026",
        "title": "ВоксаТех: маршрутная карта с переходами",
        "note": "Сохранённый общий пример «Скоба». Шапка аккаунта и левая панель обрезаны.",
    },
    {
        "id": "v-economics",
        "source": ATLAS + "screenshots/16-economics-breakdown.jpg",
        "crop": (480, 60, 1280, 720),
        "date": "13.10.2026",
        "title": "ВоксаТех: из чего сложилась трудоёмкость",
        "note": "Сохранённый общий пример «Скоба». Шапка аккаунта и левая панель обрезаны.",
    },
    {
        "id": "v-price",
        "source": ATLAS + "screenshots/32-plita-price.jpg",
        "crop": (480, 60, 1280, 720),
        "date": "13.10.2026",
        "title": "ВоксаТех: цена детали и партии",
        "note": "Сохранённый общий пример «Плита», партия 1000. Шапка аккаунта и левая панель обрезаны.",
    },
    {
        "id": "m-status",
        "source": ATLAS + "screenshots/M03-route.jpg",
        "crop": None,
        "date": "13.10.2026",
        "title": "Подготовка производства: маршрут и его статус",
        "note": "Сохранённая ревизия 9 запуска от 09.10.2026, другой чертёж. Скопировано без изменений.",
    },
    {
        "id": "m-estimate",
        "source": ATLAS + "screenshots/M04-estimate-empty.jpg",
        "crop": None,
        "date": "13.10.2026",
        "title": "Подготовка производства: смета до согласованного результата",
        "note": "Запуск от 09.10.2026, другой чертёж. Скопировано без изменений.",
    },
]


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    registry = []
    for item in IMAGES:
        source = RESEARCH / item["source"]
        original = source.read_bytes()
        target = OUT / (item["id"] + ".jpg")
        if item["crop"] is None:
            target.write_bytes(original)
        else:
            with Image.open(source) as image:
                image.convert("RGB").crop(item["crop"]).save(
                    target, "JPEG", quality=90, optimize=True
                )
        with Image.open(target) as image:
            width, height = image.size
        registry.append(
            {
                **{k: v for k, v in item.items() if k != "crop"},
                "file": "/voksa/" + target.name,
                "source": "voksa-metall-comparison/" + item["source"],
                "sourceSha256": sha256(original),
                "crop": list(item["crop"]) if item["crop"] else None,
                "width": width,
                "height": height,
                "sha256": sha256(target.read_bytes()),
            }
        )
    Path("src/data/voksa-screens.json").write_text(
        json.dumps(registry, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"Registered {len(registry)} research captures")


if __name__ == "__main__":
    main()
