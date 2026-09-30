# Тестовый WorkPost для Scotty

Три проекта в одном Git-репозитории, без вложенных Git-репозиториев:

| Каталог | Проект | Префикс | Задач |
|---|---|---|---|
| `atlas` | Атлас — продукт | `ta` | 8 |
| `beacon` | Маяк — маркетинг | `tb` | 8 |
| `compass` | Компас — исследования | `tc` | 8 |

У каждого проекта своя локальная Dolt-база в `.beads`. Реестр находится в
`воркспейс/конфигурация/projects.json`; пути в нём заданы относительно `test`.
Scotty читает реестр напрямую через `SCOTTY_PROJECTS_FILE` и обращается к базам
через CLI. `BD_BIN` указывает на `воркспейс/инструменты/scotty-bd.sh`, который
добавляет `--include-comments` к `bd show` для Beads 1.2.2.

## Запуск

Из корня Scotty:

```sh
./test/start-scotty.sh
```

Требуется собранное приложение (`npm run build`). Адрес общей витрины:
<http://localhost:3000/board>. Порт можно изменить через `SCOTTY_TEST_PORT`.
Настройки этого экземпляра хранятся отдельно в `test/.runtime/config`.

## Тестовые данные

В каждом проекте есть эпик, feature в работе, открытый bug с P0, task в статусе
blocked с зависимостью от bug, завершённый chore, отложенный task, закреплённый
decision и закрытый task с меткой `archived`. По умолчанию архивные карточки скрыты:
общая витрина показывает 21 карточку, с переключателем Archived — 24.

Исполнители: `anna`, `boris`, `scotty-agent` и неназначенные задачи. Метки:
`demo`, `release`, `frontend`, `backend`, `urgent`, `qa`, `infra`, `research`,
`human`, `archived`. Приоритеты покрывают P0–P4. У feature есть комментарий.

Документы лежат в `<проект>/features/<номер>/spec.md`. Задачи содержат
`spec_id`, `metadata.workpost.artifacts`, `metadata.workpost.feature_path` и
Markdown-ссылки в Description и Notes. Документы содержат обратные ссылки
в YAML frontmatter (`bead`, `feature_bead`, `related_beads`).

Все задачи синтетические, их можно менять для ручной проверки. Статус closed
обозначает тестовый пример завершённой задачи. Базы локальные, без Dolt remotes
и автоматического JSONL-экспорта; `.beads` исключены из Git. Markdown-документы
доступны с диска; фильтрация локальных ссылок в Scotty остаётся прежней.
