# Jarvim — Gestionnaire de projets Kanban

Application full-stack de gestion de projets en mode Kanban : boards collaboratifs, gestion des membres, partage par lien et invitations par email. Intègre également un serveur MCP pour piloter les projets via Claude.

---

## Stack technique

| Couche          | Technologie                                    |
| --------------- | ---------------------------------------------- |
| Frontend        | React 19 + Vite 6 + TypeScript                 |
| Backend         | NestJS 11 + TypeScript                         |
| Base de données | PostgreSQL + Prisma 7 (driver adapter `pg`)    |
| Auth            | JWT — access token en mémoire + refresh token httpOnly cookie |
| UI              | Tailwind CSS v4 + shadcn/ui (thème eDEX-UI)    |
| Monorepo        | npm workspaces + Turbo                         |
| MCP             | `@modelcontextprotocol/sdk` (serveur stdio)    |

---

## Prérequis

- Node.js >= 20
- npm >= 11
- PostgreSQL >= 14 (port `5433` par défaut dans les `.env`)

---

## Installation

```bash
git clone <url-du-repo>
cd jarvim

# Setup automatique : .env, dépendances, Prisma generate + migrate
./setup.sh
```

Le script `setup.sh` :
1. Vérifie Node.js >= 20
2. Copie les `.env.example` → `.env` si absents (à remplir avant de démarrer)
3. Lance `npm install` (workspaces)
4. Génère le client Prisma (`prisma generate`)
5. Applique les migrations (`prisma migrate deploy`)

> **Important** : renseigne les valeurs dans `apps/api/.env` (base de données, JWT secret) avant de démarrer.

---

## Variables d'environnement

### `apps/api/.env`

```env
DATABASE_URL="postgres://<user>:<password>@localhost:5433/<database>?schema=public"
JWT_SECRET="<secret-32-caracteres-minimum>"
FRONT_URL="http://localhost:5173"
```

### `apps/web/.env`

```env
VITE_API_URL=http://localhost:3000
```

---

## Lancer le projet

```bash
# À la racine — démarre api + web en parallèle (Turbo)
npm run dev
```

| Service   | URL                       |
| --------- | ------------------------- |
| Frontend  | http://localhost:5173     |
| Backend   | http://localhost:3000     |

---

## Base de données

```bash
cd apps/api

# Générer le client Prisma (obligatoire après chaque modif du schéma)
npx prisma generate

# Appliquer les migrations
npx prisma migrate deploy

# Créer une nouvelle migration (dev seulement)
npx prisma migrate dev --name <nom>

# Interface d'administration
npx prisma studio
```

> Le client Prisma est généré dans `apps/api/prisma/generated/prisma/client/`.

---

## Architecture

```
jarvim/
├── apps/
│   ├── api/              # Backend NestJS
│   │   ├── src/
│   │   │   ├── auth/     # Auth JWT + Local (Passport)
│   │   │   ├── users/    # CRUD utilisateurs
│   │   │   ├── projects/ # Boards, tâches, membres, partage
│   │   │   └── prisma/   # PrismaService (driver adapter pg)
│   │   └── prisma/
│   │       ├── schema.prisma
│   │       └── migrations/
│   └── web/              # Frontend React + Vite
│       ├── src/
│       │   ├── components/   # Layout, modales, guards de routes
│       │   └── pages/        # Une page par route
│       ├── features/
│       │   ├── auth/         # Formulaires, hook useAuth, actions API
│       │   └── projects/     # Actions API projets
│       └── shared/
│           ├── components/   # UI (shadcn) + Sidebar
│           ├── lib/          # apiFetch, gestion token
│           └── types/        # Types partagés
├── mcp-server-nest/      # Serveur MCP (stdio) — outils Claude
├── setup.sh              # Script d'installation
├── turbo.json
└── package.json          # Racine du monorepo (npm workspaces)
```

### Routes frontend

| Route                  | Page                  | Accès       |
| ---------------------- | --------------------- | ----------- |
| `/`                    | Landing               | Public      |
| `/login`               | Login                 | Public      |
| `/register`            | Register              | Public      |
| `/boards`              | Home (liste projets)  | Authentifié |
| `/boards/:id`          | BoardView (Kanban)    | Authentifié |
| `/profile`             | Profil                | Authentifié |
| `/shared/:token`       | SharedBoardView       | Public      |
| `/invitations/:token`  | AcceptInvitation      | Public      |

---

## API — Endpoints

### Auth — `/auth`

| Méthode | Route            | Accès  | Description               |
| ------- | ---------------- | ------ | ------------------------- |
| POST    | `/auth/register` | Public | Créer un compte           |
| POST    | `/auth/login`    | Public | Se connecter              |
| POST    | `/auth/refresh`  | Public | Rafraîchir l'access token |
| POST    | `/auth/logout`   | JWT    | Se déconnecter            |

### Utilisateurs — `/users`

| Méthode | Route          | Accès | Description              |
| ------- | -------------- | ----- | ------------------------ |
| GET     | `/users`       | JWT   | Lister les utilisateurs  |
| GET     | `/users/:id`   | JWT   | Détail d'un utilisateur  |
| PATCH   | `/users/:id`   | JWT   | Modifier son profil      |
| DELETE  | `/users/:id`   | JWT   | Supprimer son compte     |

### Projets — `/projects`

| Méthode | Route                               | Description                  |
| ------- | ----------------------------------- | ---------------------------- |
| GET     | `/projects`                         | Lister ses projets           |
| POST    | `/projects`                         | Créer un projet              |
| GET     | `/projects/:id`                     | Détail d'un projet           |
| PATCH   | `/projects/:id`                     | Renommer un projet           |
| DELETE  | `/projects/:id`                     | Supprimer un projet          |
| POST    | `/projects/:id/favorite`            | Basculer en favori           |
| PATCH   | `/projects/:id/statuses/:statusId`  | Renommer une colonne         |
| DELETE  | `/projects/:id/statuses/:statusId`  | Supprimer une colonne        |
| POST    | `/projects/:id/tasks`               | Créer une tâche              |
| PATCH   | `/projects/:id/tasks/:taskId`       | Modifier une tâche           |
| DELETE  | `/projects/:id/tasks/:taskId`       | Supprimer une tâche          |
| POST    | `/projects/:id/share-link`          | Générer un lien de partage   |
| DELETE  | `/projects/:id/share-link`          | Révoquer le lien de partage  |
| POST    | `/projects/:id/invitations`         | Inviter un membre par email  |
| GET     | `/projects/:id/members`             | Lister les membres           |
| PATCH   | `/projects/:id/members/:userId`     | Modifier le rôle d'un membre |
| DELETE  | `/projects/:id/members/:userId`     | Retirer un membre            |

### Routes publiques (sans auth)

| Méthode | Route                               | Description                |
| ------- | ----------------------------------- | -------------------------- |
| GET     | `/projects/shared/:shareToken`      | Board en lecture seule     |
| GET     | `/projects/invitations/:token`      | Consulter une invitation   |
| POST    | `/projects/invitations/accept`      | Accepter une invitation    |

---

## Modèles de données

| Modèle              | Description                                       |
| ------------------- | ------------------------------------------------- |
| `User`              | Compte utilisateur (email, display_name, hash)    |
| `Project`           | Board Kanban (nom, owner, share_token)            |
| `ProjectMember`     | Appartenance avec rôle (owner/admin/member)       |
| `ProjectFavorite`   | Projets épinglés par un utilisateur               |
| `ProjectStatus`     | Colonnes du board (nom, couleur, ordre)           |
| `Task`              | Carte avec titre, description, priorité, deadline |
| `ProjectInvitation` | Invitation email avec token (expiration 7 jours)  |
| `RefreshToken`      | Tokens de rafraîchissement (nettoyage auto)       |
| `TaskActivity`      | Journal d'audit des actions                       |

---

## Rôles

| Rôle     | Droits                                                   |
| -------- | -------------------------------------------------------- |
| `owner`  | Tous les droits, gestion du lien de partage, suppression |
| `admin`  | Inviter des membres, gérer les tâches et colonnes        |
| `member` | Créer et modifier des tâches                             |

---

## Serveur MCP

Le dossier `mcp-server-nest/` contient un serveur MCP (stdio) permettant à Claude d'interagir avec les projets Jarvim via des outils dédiés : `list_projects`, `list_tasks`, `create_task`, `update_task`, `invite_member`, etc.

---

## Contribuer

1. Créer une branche depuis `main` : `feat/<ticket>-<description>`
2. Conventions de commit : Conventional Commits, messages en français
3. Après toute modification du `schema.prisma` : `npx prisma generate` + nouvelle migration
4. Ouvrir une PR avec description des changements
