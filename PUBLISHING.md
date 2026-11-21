# Публикация расширения

## 1. Проверки перед пушем

```bash
npm ci
npm run typecheck
npm run build
npm run check
npm test
git diff --exit-code
```

`npm run build` обязателен: OpenChamber не собирает TypeScript и не ставит
`node_modules` при установке. В репозитории должны лежать готовые
`panel/main.js`, `status/main.js`, `service/main.js` и `dev/preview.js`.
CI (`.github/workflows/ci.yml`) прогоняет эти же шаги и падает, если собранные
файлы не совпадают с исходниками.

## 2. Репозиторий на GitHub

```bash
git remote add origin https://github.com/esykai/openchamber-agent-groceries.git
git branch -M main
git push -u origin main
```

В `package.json` уже заполнены `repository`, `homepage` и `bugs` для
`esykai/openchamber-agent-groceries`; при форке замените их на свой аккаунт.

Перед каталогом репозиторий должен быть **публичным**: приватный URL не
устанавливается у пользователей и не принимается в каталог.

`"private": true` оставлен намеренно: расширение ставится из папки, ZIP или Git,
а не из npm. Уберите его, только если действительно хотите `npm publish`.

## 3. Установка в OpenChamber

**Settings → Extensions → Folder, ZIP, or URL → Add.** Можно вставить:

- абсолютный путь к папке проекта (для разработки);
- путь к `.zip`;
- HTTPS- или SSH-адрес Git-репозитория:

```text
https://github.com/esykai/openchamber-agent-groceries
https://github.com/esykai/openchamber-agent-groceries#v1.13.1
ssh://git@github.com/esykai/openchamber-agent-groceries.git#main
```

После установки OpenChamber покажет диалог разрешений. Расширению нужен
**локальный сервис** (`contributes.service`): он читает `opencode.db` только на
чтение и кладёт PNG/GIF в буфер обмена.

Git-установки обновляются сами. Чтобы выпустить обновление:

1. поднимите `version` в `package.json` и `SERVICE_VERSION` в `service/main.ts`
   (`npm run check` падает, если они разошлись);
2. добавьте запись в `CHANGELOG.md`;
3. выполните `npm run build`;
4. закоммитьте исходники **и** собранные `.js`;
5. поставьте тег `git tag -a vX.Y.Z -m "vX.Y.Z"` и запушьте ветку и тег;
6. в **Settings → Extensions** нажмите **Update** (или дождитесь автопроверки).

Для публичного снапшота поставьте тег на релизный коммит и запушьте его.
Git-установка может закрепиться на теге через `#vX.Y.Z`.

## 4. Каталог сообщества OpenChamber

Расширения сообщества публикуются на странице
**https://openchamber.dev/extensions/**. Это каталог **расширений**, а не
OpenCode-плагинов и не built-in registry OpenChamber; в
`packages/extensions/registry.json` community-расширения не добавляются.

Официальный путь — письмо на **feedback@openchamber.dev**. Тема:

```text
OpenChamber extension for the directory
```

В теле письма:

```text
Extension name: Agent Groceries
Repository URL: https://github.com/esykai/openchamber-agent-groceries
Category: Usage
What it does: Token usage as groceries for OpenChamber: daily, weekly and monthly
spend in packs of buckwheat, with a Work Status card, a rail panel, the hungriest
sessions, and copyable PNG/GIF cards. Local-only; reads OpenCode's SQLite database
read-only.
```

Дополнительно можно написать в Discord OpenChamber:
**https://discord.gg/ZYRSdnwwKA**. Каталог ведёт на GitHub-репозиторий; отдельной
формы загрузки или публикации в npm нет.

Перед письмом проверьте:

- репозиторий публичный и анонимно клонируется;
- тег `v1.13.1` и GitHub Release указывают на проверенный коммит;
- в Git-установке есть `package.json`, `panel/index.html`, `panel/main.js`,
  `status/index.html`, `status/main.js`, `icon.svg`, `service/main.js`;
- README и скриншоты актуальны, лицензия MIT на месте;
- в релизном ZIP нет `node_modules`, `dev`, `src`, TypeScript-исходников и
  `preview-*` (для ручной установки).

Рекомендуемое публичное название — нейтральное **Agent Groceries** (подзаголовок
«How Much Did My Agent Eat?»). X5/7-Eleven лучше оставить темами внутри карточки:
это товарные знаки, и каталог может попросить нейтральное имя или подтверждение
пародийного статуса.

Рекомендуемое описание для каталога:

> **Agent Groceries** — token usage as groceries for OpenChamber:
> the daily, weekly and monthly token spend becomes packs of buckwheat,
> the supply left, and a copyable PNG or animated GIF. Russian and English,
> with a configurable store name.
