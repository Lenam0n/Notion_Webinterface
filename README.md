# Notion Pipeline — Monorepo

Ein Workspace‑Monorepo mit **Frontend (Vite/React)**, **API (Express/TypeScript)** und zwei **Packages** für gemeinsame Typen sowie Notion‑Adapter (polymorph). Ziel: Ein einheitlicher Prozessfluss (Firma → Ansprechpartner → Job) für **verschiedene Notion‑Datenbankschemata**, austauschbar über Adapter.

---

## Inhaltsverzeichnis

- [Notion Pipeline — Monorepo](#notion-pipeline--monorepo)
  - [Inhaltsverzeichnis](#inhaltsverzeichnis)
  - [Überblick](#überblick)
  - [Projektstruktur](#projektstruktur)
  - [Voraussetzungen](#voraussetzungen)
  - [Installation](#installation)
  - [Environment‑Konfiguration](#environmentkonfiguration)
    - [API (`apps/api/.env`)](#api-appsapienv)
    - [Frontend (`apps/frontend/.env.development`)](#frontend-appsfrontendenvdevelopment)
  - [Build \& Start](#build--start)
    - [Alles bauen (Pakete → API → Frontend)](#alles-bauen-pakete--api--frontend)
    - [Entwicklungsmodus (API + Frontend parallel)](#entwicklungsmodus-api--frontend-parallel)
    - [Nur API](#nur-api)
    - [Nur Frontend](#nur-frontend)
    - [Produktion (gebaut) starten](#produktion-gebaut-starten)
  - [Kommandos \& Cheatsheet](#kommandos--cheatsheet)
    - [Dependencies installieren (gezielt pro Workspace)](#dependencies-installieren-gezielt-pro-workspace)
    - [Pakete bauen in richtiger Reihenfolge](#pakete-bauen-in-richtiger-reihenfolge)
    - [Scripts (Root `package.json`)](#scripts-root-packagejson)
  - [API Endpoints](#api-endpoints)
    - [Health](#health)
    - [Notion Schema validieren](#notion-schema-validieren)
    - [Einzelne Company verarbeiten](#einzelne-company-verarbeiten)
    - [Bulk Sync (Liste)](#bulk-sync-liste)
    - [cURL‑Beispiel](#curlbeispiel)
  - [Frontend Nutzung](#frontend-nutzung)
  - [Entwicklungs‑Notes](#entwicklungsnotes)
  - [Troubleshooting](#troubleshooting)
    - [„Cannot find module '@shared/types' / '@notion/adapters'“ (TS2307)](#cannot-find-module-sharedtypes--notionadapters-ts2307)
    - [„Relative import paths need explicit file extensions …“ (TS2835)](#relative-import-paths-need-explicit-file-extensions--ts2835)
    - [Frontend: „Property 'env' does not exist on type 'ImportMeta'“](#frontend-property-env-does-not-exist-on-type-importmeta)
    - [„TS6133: is declared but its value is never read“](#ts6133-is-declared-but-its-value-is-never-read)
    - [404 beim Frontend‑Remote‑Sync](#404-beim-frontendremotesync)
  - [Neue Notion‑Adapter hinzufügen](#neue-notionadapter-hinzufügen)
  - [Deployment / Produktion](#deployment--produktion)
    - [Produktion bauen](#produktion-bauen)
    - [API starten (prod)](#api-starten-prod)
    - [Frontend ausliefern](#frontend-ausliefern)
    - [Docker (optional, Skizze)](#docker-optional-skizze)
  - [Quick‑Start (Kurzfassung)](#quickstart-kurzfassung)

---

## Überblick

- **Frontend**: Kleines UI zum Erfassen von Firmen + Ansprechpartnern.

  - **Lokal speichern** → JSON via Vite‑Middleware (`/api/contacts` → `src/data/contacts.json`)
  - **Online syncen** → POST an das API‑Backend (`/v1/companies`) → Notion über Adapter.

- **API**: Nimmt Einträge an, validiert mit `zod` und orchestriert die Prozesskette:

  1. Firma upserten (DB_3)
  2. Ansprechpartner upserten (DB_2) + Backlink in DB_3 (optional)
  3. Job/Anschreiben in DB_1 upserten
  4. Firma auf „schon beworben“ markieren

- **Packages**:
  - `@shared/types`: Zod‑Schemas & TypeScript‑Typen (Frontend + API teilen sich das gleiche DTO).
  - `@notion/adapters`: `INotionAdapter` + `DefaultNotionAdapter` (dein Mapping auf DB_1/DB_2/DB_3). Weitere Adapter = neue Klassen.

---

## Projektstruktur

```powershell
repo/
├─ package.json # Root scripts (dev/build/start)
├─ pnpm-workspace.yaml # Workspaces: apps/, packages/
├─ .gitignore
├─ apps/
│ ├─ frontend/ # Vite/React
│ │ ├─ package.json
│ │ ├─ tsconfig.json
│ │ ├─ vite.config.ts # + JSON-API Middleware (local)
│ │ ├─ .env.development # VITE_API_BASE=http://localhost:8787
│ │ └─ src/
│ │ ├─ main.tsx, App.tsx
│ │ ├─ components/{CompanyForm,ContactsList,Sidebar}.tsx
│ │ ├─ services/contactService.ts
│ │ ├─ env.d.ts # Vite Typings (ImportMetaEnv)
│ │ └─ data/contacts.json # lokale JSON-DB
│ └─ api/ # Express API
│ ├─ package.json
│ ├─ tsconfig.json
│ ├─ .env.example
│ └─ src/
│ ├─ server.ts # Routen /v1/health /v1/validate /v1/companies /v1/sync
│ ├─ env.ts # Zod-Env-Parsing (PORT, ADAPTER, Notion-IDs)
│ └─ adapterFactory.ts # Adapter-Instanz je nach Env
└─ packages/
├─ shared/
│ ├─ package.json # exports + types
│ ├─ tsconfig.json # declaration true, dist/*
│ └─ src/
│ ├─ types.ts # Zod Schemas (Address, Ansprechpartner, CompanyEntry, Options)
│ └─ index.ts # export *
└─ notion-adapters/
├─ package.json # depends on @shared/types
├─ tsconfig.json
└─ src/
├─ INotionAdapter.ts
├─ default/DefaultNotionAdapter.ts
└─ index.ts
```

---

## Voraussetzungen

- **Node.js** ≥ 18
- **pnpm** (empfohlen): `npm i -g pnpm`
- Zugriff auf einen Notion‑Token + Datenbank‑IDs (DB_1/DB_2/DB_3) für den Default‑Adapter

---

## Installation

```bash
cd repo
pnpm install
```

**Hinweis**: pnpm legt ein zentrales `node_modules` im Root an und verlinkt Workspaces. Interne Pakete (`@shared/types`, `@notion/adapters`) werden automatisch symlinked.

## Environment‑Konfiguration

### API (`apps/api/.env`)

Kopiere `.env.example` zu `.env` und fülle:

```env
PORT=8787
ADAPTER=default

NOTION_TOKEN=your-secret-token
NOTION_DB_1_ID=...
NOTION_DB_2_ID=...
NOTION_DB_3_ID=...
```

### Frontend (`apps/frontend/.env.development`)

```ini
VITE_API_BASE=http://localhost:8787
```

## Build & Start

### Alles bauen (Pakete → API → Frontend)

```bash
pnpm build
```

### Entwicklungsmodus (API + Frontend parallel)

```bash
pnpm dev
```

- **API**: <http://localhost:8787>

  - Health: `GET /v1/health` → `{ ok: true }`

- **Frontend**: <http://localhost:5173>

### Nur API

```bash
pnpm --filter api dev
```

### Nur Frontend

```bash
pnpm --filter frontend dev
```

### Produktion (gebaut) starten

```bash
pnpm --filter api start     # node dist/server.js
pnpm --filter frontend preview
```

## Kommandos & Cheatsheet

### Dependencies installieren (gezielt pro Workspace)

```bash
pnpm add <paket> --filter frontend        # nur im Frontend
pnpm add <paket> --filter api             # nur in API
pnpm add <paket> --filter @shared/types   # nur im shared Package
pnpm add -D <paket> --filter frontend     # Dev-Dep im Frontend
```

### Pakete bauen in richtiger Reihenfolge

```bash
pnpm --filter @shared/types --filter @notion/adapters --filter api --filter frontend build
```

### Scripts (Root `package.json`)

`pnpm dev` → API + Frontend parallel

`pnpm build` → Pakete, dann Apps

`pnpm start` → gebaute API + Frontend Preview

## API Endpoints

### Health

```bash
GET /v1/health
→ 200 { ok: true }
```

### Notion Schema validieren

```bash
POST /v1/validate
→ 200 { ok: true } | 400 { ok: false, error: "Notion Schema Mismatch: ..." }
```

### Einzelne Company verarbeiten

```bash
POST /v1/companies
Content-Type: application/json
{
  "entry": {
    "name": "Acme GmbH",
    "adresse": { "straße":"Musterweg 1", "plz":"50667", "ort":"Köln" },
    "ansprechpartner": { "name": "Max Mustermann", "linkedin": "https://..." }
  },
  "options": { "defaultJobName":"Initiativbewerbung", "defaultJobUrl":"", "defaultApplyDate":"2025-08-18" }
}
→ 200 { ok: true } | 400 { ok:false, error:"..." }
```

### Bulk Sync (Liste)

```bash
POST /v1/sync
{ "list":[ ...CompanyEntry[] ], "options": { ... } }
→ 200 { ok:true } | 400 { ok:false, error:"..." }
```

### cURL‑Beispiel

```bash
curl -X POST http://localhost:8787/v1/companies \
  -H "Content-Type: application/json" \
  -d '{"entry":{"name":"Acme GmbH","adresse":{"straße":"Musterweg 1","plz":"50667","ort":"Köln"},"ansprechpartner":{"name":"Max"}},"options":{"defaultJobName":"Initiativbewerbung"}}'
```

## Frontend Nutzung

1. **Neue Firma erfassen**: Formular auf `/` ausfüllen
2. **Lokal speichern**: Button „Lokal speichern (JSON)“ → Eintrag landet in `src/data/contacts.json`
3. **Direkt in Notion syncen**: Button „Direkt in Notion syncen“ → POST an API mit `VITE_API_BASE`
4. **Alle Firmen ansehen**: Navigation „Alle Firmen“ → liest `GET /api/contacts` (lokale JSON)

> Die lokale JSON‑Liste ist ein Offline/Fallback‑Modus und unabhängig vom Notion‑Sync.

## Entwicklungs‑Notes

- **Polymorphie via Adapter**: `INotionAdapter` definiert den Prozess. `DefaultNotionAdapter` implementiert dein bestehendes Mapping (DB_1/DB_2/DB_3).

- **Schema‑Check**: `POST /v1/validate` prüft vorab Notion‑Property‑Typen (klare Fehlermeldungen statt 400er vom Notion‑API).

- **Zod‑Schemas** (`@shared/types`): identische Validierung in API und optional im Frontend.

- **Vite‑Middleware**: `vite.config.ts` bietet eine kleine JSON‑API zum lokalen Speichern.

- **Env‑Typing Frontend**: `src/env.d.ts` deklariert ImportMetaEnv.VITE_API_BASE.

## Troubleshooting

### „Cannot find module '@shared/types' / '@notion/adapters'“ (TS2307)

- Stelle sicher, dass die Packages gebaut sind:

```bash
pnpm --filter @shared/types build
pnpm --filter @notion/adapters build
```

- Prüfe `packages/\*/package.json`:

  - `"types": "dist/index.d.ts"`

  - `exports` zeigt auf `dist`

- In `apps/api/package.json` sollten die Workspace‑Deps eingetragen sein:

```json
"dependencies": {
  "@shared/types": "workspace:*",
  "@notion/adapters": "workspace:*",
  ...
}
```

- VS Code: TypeScript Server neu starten (Cmd/Ctrl‑Shift‑P → „TypeScript: Restart TS server“)

### „Relative import paths need explicit file extensions …“ (TS2835)

- In `apps/api/tsconfig.json` Bundler‑Resolution nutzen:

```json
{ "compilerOptions": { "module":"ESNext", "moduleResolution":"Bundler", ... } }
```

- Dann sind `.js`‑Endungen in TS‑Imports nicht nötig.

### Frontend: „Property 'env' does not exist on type 'ImportMeta'“

`apps/frontend/src/env.d.ts` hinzufügen:

```ts
/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_API_BASE: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

### „TS6133: is declared but its value is never read“

- Unbenutzte Variablen/Im-porte entfernen oder mit `_` prefixen:

```ts
const [, setCompanies] = useState<Company[]>([]);
// oder: import { useState } from "react"; // ohne default React
```

### 404 beim Frontend‑Remote‑Sync

- Läuft die API wirklich auf `http://localhost:8787`?

- Stimmt `VITE_API_BASE` in `apps/frontend/.env.development`?

- CORS wird standardmäßig im API aktiviert (falls geändert, prüfen).

## Neue Notion‑Adapter hinzufügen

1. Datei anlegen: `packages/notion-adapters/src/myAdapter/MyAdapter.ts`
2. Implementieren:
   - `class MyAdapter implements INotionAdapter { ... }`
   - Eigene Property‑Namen/Relationen für deine DBs
3. Exportieren: In `packages/notion-adapters/src/index.ts` export hinzufügen
4. Factory registrieren: In `apps/api/src/adapterFactory.ts` neue `case "myAdapter"`:
5. Env setzen: `ADAPTER=myAdapter` in `apps/api/.env`
6. Builden:

   ```bash
   pnpm --filter @notion/adapters build
   pnpm --filter api build
   ```

7. Testen: `POST /v1/validate`, `POST /v1/companies`

**Hinweis**: Der **Prozessfluss** bleibt identisch. Nur das **Mapping** (Property‑Namen, optionale Relationen) ändert sich.

## Deployment / Produktion

### Produktion bauen

```bash
pnpm build
```

### API starten (prod)

```bash
cd apps/api
node dist/server.js
# oder im Root:
pnpm --filter api start
```

### Frontend ausliefern

`pnpm --filter frontend build` erzeugt `apps/frontend/dist`

Statisch via Nginx/Netlify/Vercel hosten oder

`pnpm --filter frontend preview` lokal prüfen

### Docker (optional, Skizze)

Multi‑stage Dockerfile pro App (API, Frontend) oder ein Compose mit beiden Diensten

API: Node 20‑Alpine, `node dist/server.js`

Frontend: Build → statisch aus Nginx

## Quick‑Start (Kurzfassung)

```bash
# 1) Install
pnpm install

# 2) Envs setzen
cp apps/api/.env.example apps/api/.env   # füllen!
# Frontend: VITE_API_BASE=http://localhost:8787

# 3) Build
pnpm build

# 4) Dev parallel
pnpm dev
# Frontend: http://localhost:5173
# API:      http://localhost:8787  (GET /v1/health)
```
