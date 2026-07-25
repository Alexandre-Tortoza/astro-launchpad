# Lançamento v0.0.1 — astro-launchpad

## Contexto

O astro-launchpad promete: escolher Astro + CMS + features → projeto pronto para desenvolver e subir via Docker (`docker compose up` → tudo funcionando, incluindo schema/seed do CMS). Para lançar a v0.0.1:

1. **Tudo nas últimas versões compatíveis** — Directus está 1 major atrás (11.13.1 → **12.1.1**), SDK 6 majors atrás (17 → **23**), e o toolchain tem vários majors pendentes (eslint 10, zod 4, vitest 4, TS 6...).
2. **Strapi 5 como segundo CMS** com paridade total ao Directus (decisão do usuário): `--cms strapi` → compose up → CMS com schema + seed + token prontos.
3. **Motion com ou sem** — já verificado: é puramente aditivo (CSS-only, sem deps, base não referencia). Só validar no E2E.
4. **Release automatizado até o fim** (decisão do usuário): commit → push → tag `v0.0.1` → GitHub Actions publica no npm.

Fatos verificados que moldam o plano:

- `packages/create-astro-launchpad/src/docker.ts` é a **fonte da verdade** do Docker gerado (compose completo com bootstrap: postgres → schema → policy → directus → seed → web). Os arquivos Docker em `templates/features/{directus,docker}/` estão **defasados/mortos** (sobrescritos na geração) → deletar.
- **A imagem do Directus 12 removeu npm/npx** — o comando `npx directus bootstrap && npx directus schema apply ...` do gerador quebraria. Trocar por `node /directus/cli.js ...`. Directus 12 usa licença MSCL (tier Core grátis basta; documentar).
- **release.yml não tem `NODE_AUTH_TOKEN`** no passo de publish, e `gh secret list` mostra que **NPM_TOKEN não existe** → blocker do publish (ver Fase H).
- **`doctor` exige `DIRECTUS_URL`** (doctor.ts:107) mas o scaffold nunca escreve essa var no `.env` → corrigir.
- **`examples/` são 5 cascas vazias** (só package.json) e são workspace members → substituir por exemplos gerados pelo próprio CLI.
- `.ai-jail` foi esvaziado pelo ambiente → `git restore .ai-jail`, nunca commitar.
- Postgres alvo: **17-alpine** (Directus 12: "LTS do PostgreSQL"; Strapi 5 recomenda 17; não usar 18).

## Tabela de versões (alvos finais)

| Onde             | Pacote/pin                                            | De                                              | Para                                                         |
| ---------------- | ----------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------ |
| root             | eslint / @eslint/js / globals                         | ^9.39.5 / ^9.39.5 / ^16.5.0                     | ^10.8.0 / ^10.0.1 / ^17.7.0                                  |
| root             | @commitlint/* / lint-staged                           | ^20.5.3 / ^16.4.0                               | ^21.2.1 / ^17.2.0                                            |
| root + workflows | packageManager pnpm                                   | 11.3.0                                          | 11.17.0                                                      |
| CLI              | @clack/prompts / vitest / typescript / @types/node    | ^0.11.0 / ^3.2.6 / ^5.7.2 / ^22.10.1            | ^1.7.0 / ^4.1.10 / ^6.0.3 / ^22.20.1                         |
| base             | astro / @astrojs/sitemap / zod / typescript           | ^7.0.10 / ^3.2.0 / ^3.23.0 / ^5.5.0             | ^7.1.3 / ^3.7.3 / ^4.4.3 / ^6.0.3                            |
| features         | @directus/sdk / tsx / @astrojs/rss / tailwindcss+vite | ^17.0.0 / ^4.20.0 / ^4.0.0 / ^4.0.0             | ^23.0.0 / ^4.23.1 / ^4.0.19 / ^4.3.3                         |
| docker.ts        | node / nginx / postgres / directus                    | 22-alpine / 1.27-alpine / 16.8-alpine / 11.13.1 | **24-alpine** / **1.31-alpine** / **17-alpine** / **12.1.1** |
| novo             | @strapi/strapi (app cms/)                             | —                                               | 5.51.0 exato + pg ^8                                         |

Limites de compatibilidade (não ultrapassar): TS **6.0.x** (typescript-eslint exige `<6.1.0`; TS 7 incompatível), @types/node linha **22** (= engines floor), zod 4 ok (astro 7.1.3 já depende de zod ^4.3.6). Engines `>=22` e matriz CI 22/24 mantidos.

## Fases

### A — Toolchain (root + CLI)

`package.json` root e `packages/create-astro-launchpad/package.json` conforme tabela; pnpm 11.17.0 nos dois workflows; **adicionar `env: NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}` ao passo "Publish the tested artifact" de `.github/workflows/release.yml`**; `pnpm install`. Fallout esperado ~zero (clack 1.x mantém intro/outro/select/text/confirm; config eslint já é flat). Gate: `pnpm check && pnpm build && pnpm audit && pnpm pack:check`.

### B — Templates: bumps + zod 4

`templates/{base,features/*}/package.json` conforme tabela. Única migração de código zod 4: `templates/base/src/lib/blocks/validate.ts:66` — `result.error.format()` → `z.treeifyError(result.error)` (trocar import type por value). Atualizar asserções de versão em `test/integration.test.ts` (linhas ~132, 234, 273). Gate: `pnpm check`, `node scripts/build-presets.mjs` (7 presets buildam com zod 4).

### C — Deduplicação template/gerador

Deletar: `templates/features/directus/{Dockerfile,docker-compose.yml,scripts/}`, `templates/features/docker/{Dockerfile,docker-compose.yml}`. **Manter** `templates/features/docker/docker/nginx.conf` (usado pelo Dockerfile estático gerado) e os `.env.example`. Remover script `cms:setup` do pack directus (manter `cms:seed`/`cms:snapshot`); atualizar `prompts/setup-directus.md`; remover asserção `cms:setup` do integration test. `scripts/build.mjs` copia diretórios inteiros → deleções propagam sozinhas.

### D — Directus 12

1. `docker.ts` `directusServices()`: pins (12.1.1, postgres:17-alpine ×2) e comando do job schema → `node /directus/cli.js bootstrap && node /directus/cli.js schema apply /directus/project/schema/snapshot.json --yes`. SQL do `directus-policy` continua válido no v12 (tabelas directus_users/access/policies inalteradas).
2. `@directus/sdk` ^23 e compilar — os 5 imports do provider (`createDirectus/rest/staticToken/readItems/readSingleton`) existem no SDK atual; majors 18–23 foram majoritariamente type-level. Fallback: maior major que compilar.
3. `scaffold.ts`: adicionar `DIRECTUS_URL=http://localhost:8055` ao `.env` gerado (corrige doctor + dev no host).
4. Regenerar `schema/snapshot.json` num Directus 12 vivo (scaffold em /tmp → compose up → `pnpm cms:snapshot` → copiar de volta → scaffold limpo para validar apply+seed).
5. Docs: `docs/cms-directus.md` + `docs/docker.md` (versões, comando cli.js, nota MSCL).

### E — Strapi 5 (paridade total)

- **CLI**: `types.ts` `CMS_OPTIONS += "strapi"` + helper `isServerCms()`; generalizar gates `cms === "directus"` que significam "CMS server" (`writeAstroConfiguration`, scripts docker); `options.ts` help; `index.ts` next-steps (admin em `:1337/admin`); `doctor.ts` (`STRAPI_ENVIRONMENT`, health `GET /_health` 204, checagem `/api/pages` com bearer).
- **`docker.ts` `strapiServices()`**: postgres:17-alpine + `strapi` (build `./cms`, healthcheck `/_health`, start_period 60s) + `web` (STRAPI_URL=http://strapi:1337). Sem one-shots: schema vai em arquivos no app; admin/token/permissões/seed rodam no bootstrap do próprio Strapi. `.dockerignore` do web ganha `cms`.
- **`.env` gerado** (scaffold.ts): `APP_KEYS` (4× base64), `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET`, `ENCRYPTION_KEY`, `DB_*`, `STRAPI_URL/PORT/PUBLIC_URL`, `STRAPI_ADMIN_EMAIL/PASSWORD` (senha com prefixo `Aa1-` — política do Strapi exige maiúscula+minúscula+dígito), `STRAPI_TOKEN`.
- **Pack `templates/features/strapi/`**: `src/lib/content/strapi.ts` (provider **fetch puro** — Strapi 5 REST é flat, ~60 linhas, zero deps; drafts via `?status=draft`) + override de `src/lib/content/index.ts` (chaveado em `STRAPI_TOKEN`, como o do Directus) + `.env.example` + `prompts/setup-strapi.md` + **`cms/` = app Strapi 5 TS completo**: `package.json` (@strapi/strapi 5.51.0 exato), `Dockerfile` multi-stage node:24-alpine (dev = `npm run develop` com bind mount; prod = build do admin + `npm run start`), `config/*.ts` env-driven, content-types espelhando o modelo Directus (component `shared.section` {section_id, type enum, order, payload json}; collections page/blog-post/author/category/tag/navigation-item/redirect; single type site-setting; draftAndPublish), `seed/data.json` (mesmo conteúdo demo do Directus, slugs como chaves).
- **`cms/src/index.ts` bootstrap idempotente** (mecanismo validado no source do Strapi): (1) admin via `strapi.service('admin::user').create` + `getSuperAdmin()`; (2) **token determinístico**: upsert direto em `strapi.db.query('admin::api-token')` com `accessKey: strapi.service('admin::api-token').hash(process.env.STRAPI_TOKEN)` — o service `create()` ignora accessKey do caller, por isso o upsert direto; type `read-only` autoriza find/findOne sem permission rows; (3) permissões de leitura no role public (rede de segurança); (4) seed via Documents API (`strapi.documents(...).create({ data, status: 'published' })`, guard por `count()`).
- **Tests**: options (`--cms strapi`), integration (arquivos do pack, `.env` com STRAPI_TOKEN/APP_KEYS, compose com `strapi:` e `/_health`, astro.config SSR, sem @directus/sdk), doctor.
- **Docs**: novo `docs/cms-strapi.md` (espelho do cms-directus.md); atualizar README, `docs/{cli,architecture,docker}.md`; `packages/ai-kit/skills/strapi.md` + seção no `cms-modeling.md`.

### F — Examples reais

Remover `examples/*` do `pnpm-workspace.yaml`; deletar os 5 stubs; novo `scripts/build-examples.mjs` que roda o CLI buildado gerando `examples/{landing-markdown,landing-directus,landing-strapi}` (`--preset saas --cms X --yes --skip-install --no-git`), **deletando o `.env` gerado** (tem secrets); `examples/README.md` explicando recriar `.env`. Script raiz `build:examples`. Adicionar `.prettierignore` (`examples/`) e `examples/**` aos ignores de `eslint.config.mjs` (senão `pnpm check` quebra). Não roda em CI (flakiness de EOL na matriz 3-OS); documentado como passo manual em `docs/release-process.md`.

### G — Docs e metadados

`CHANGELOG.md`: fundir `[Unreleased]` numa `## [0.0.1]` reescrita (CLI + 7 presets, Markdown/Directus 12/Strapi 5, Docker automatizado, doctor, ai-kit) com data do release; manter `[Unreleased]` vazio. README (matriz de features + Strapi), ROADMAP (ticks).

### H — Verificação e release

**Gates**: `pnpm check` · `pnpm build` · `pnpm audit` · `pnpm pack:check` · `node scripts/build-presets.mjs`.

**E2E local** (Docker 29.6 disponível; scaffold em /tmp com o CLI buildado):

1. markdown+docker: `docker compose -f compose.prod.yml build` (nginx estático); variantes motion on/off buildam.
2. directus: `compose up -d --build` → `/server/health` 200 → home em `:4321` com conteúdo do seed → `doctor` exit 0 → `down -v`.
3. strapi: `compose up -d --build` → `/_health` 204 → `/admin` acessível → home idêntica em `:4321` → `doctor` exit 0 → `down -v`.

**Release** (ordem): `git restore .ai-jail` → commits (abaixo) → **⛔ blocker NPM_TOKEN**: secret não existe; usuário gera granular access token em npmjs.com e roda `gh secret set NPM_TOKEN` (ou me passa o token para eu setar) — _pausar e pedir aqui_ → `git push origin main` → `gh run watch` (CI verde) → `git tag v0.0.1 && git push origin v0.0.1` → `gh run watch` do release → confirmar `npm view create-astro-launchpad version`. Contingência: falha no publish → corrigir → deletar/recriar tag no mesmo commit (check tag==version continua passando).

**Commits (conventional)**

1. `chore(deps): modernize root and CLI toolchain` (A, inclui release.yml)
2. `feat(template)!: upgrade template stack to zod 4 and latest Astro deps` (B)
3. `refactor(templates): remove docker files superseded by the generator` (C)
4. `feat(directus)!: upgrade to Directus 12 and SDK 23` (D)
5. `feat(cli): add Strapi 5 CMS with full Docker bootstrap parity` (E)
6. `docs(strapi): document the Strapi feature pack` (E-docs)
7. `chore(examples): replace stubs with generated reference projects` (F)
8. `docs(release): finalize 0.0.1 changelog and roadmap` (G)

## Riscos

- **SDK 23 type breaks**: compilar logo após bump; fallback = maior major que compila (compat SDK/server é frouxa).
- **Snapshot v11→v12**: regenerar de instância v12 viva; pior caso, ajustar metadata do snapshot na mão.
- **Upsert em `strapi_api_tokens` usa internals**: mitigado por pin exato 5.51.0, `hash()` do próprio service, e permissões public como fallback (site renderiza mesmo se o token regredir).
- **corepack ausente no node:24-alpine**: verificar no build; fallback `npm i -g corepack` no `dockerBase()`.
- **Primeiro boot do Strapi é lento**: healthcheck com start_period/retries generosos; E2E com timeout longo.
