# Jarvim — Gestionnaire de projets Kanban

Application de gestion de projets en mode Kanban avec authentification, collaboration d'équipe et partage de boards.

---

## Stack technique

| Couche          | Technologie                              |
| --------------- | ---------------------------------------- |
| Frontend        | React 19 + Vite + TypeScript             |
| Backend         | NestJS + TypeScript                      |
| Base de données | PostgreSQL + Prisma ORM                  |
| Auth            | JWT (access token + refresh token)       |
| UI              | shadcn/ui + Tailwind CSS v4              |
| Monorepo        | npm workspaces + Turbo                   |

---

## Prérequis

- Node.js >= 20
- npm >= 10
- PostgreSQL >= 14

---

## Installation

```bash
git clone <url-du-repo>
cd jarvim

# Setup automatique (dépendances + env + Prisma)
./setup.sh
```

Le script `setup.sh` :
- vérifie les prérequis
- crée les fichiers `.env` depuis les `.env.example` s'ils sont absents
- installe les dépendances npm (workspaces)
- génère le client Prisma

Pour appliquer les migrations en même temps :

```bash
RUN_MIGRATIONS=true ./setup.sh
```

---

## Variables d'environnement

### `apps/api/.env`

```env
DATABASE_URL="postgres://<user>:<password>@localhost:5433/<database>?schema=public"
JWT_SECRET="<your-jwt-secret>"
FRONT_URL="http://localhost:5173"
```

### `apps/web/.env`

```env
VITE_API_URL=http://localhost:3000
```

---

## Lancer le projet

```bash
# À la racine
npm run dev
```

- Frontend : http://localhost:5173
- Backend  : http://localhost:3000

---

## Base de données

```bash
cd apps/api

# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate deploy

# (optionnel) Interface d'administration
npx prisma studio
```

---

## Architecture

### Monorepo

```
jarvim/
├── apps/
│   ├── api/          # Backend NestJS
│   └── web/          # Frontend React + Vite
├── setup.sh          # Script d'installation
└── turbo.json
```

### Frontend

```
apps/web/src/
├── components/
│   ├── AppLayout.tsx
│   ├── CardDetailModal.tsx
│   ├── ProtectedRoute.tsx
│   ├── PublicRoute.tsx
│   └── ShareBoardModal.tsx
└── pages/
    ├── Landing.tsx           # /
    ├── Login.tsx             # /login
    ├── Register.tsx          # /register
    ├── OAuthCallback.tsx     # /oauth/callback
    ├── Home.tsx              # /boards
    ├── BoardView.tsx         # /boards/:id
    ├── SharedBoardView.tsx   # /shared/:token
    ├── AcceptInvitation.tsx  # /invitations/:token
    └── Profil.tsx            # /profile
```

### Backend

```
apps/api/src/
├── auth/        # Authentification (JWT + Local)
├── users/       # Gestion des utilisateurs
├── projects/    # Boards, tâches, membres, partage
└── prisma/      # Service Prisma
```

---

## API — Endpoints principaux

### Auth — `/auth`

| Méthode | Route            | Description              |
| ------- | ---------------- | ------------------------ |
| POST    | `/auth/register` | Créer un compte          |
| POST    | `/auth/login`    | Se connecter             |
| POST    | `/auth/refresh`  | Rafraîchir l'access token|
| POST    | `/auth/logout`   | Se déconnecter           |

### Projets — `/projects`

| Méthode | Route                               | Description                  |
| ------- | ----------------------------------- | ---------------------------- |
| GET     | `/projects`                         | Lister ses projets           |
| POST    | `/projects`                         | Créer un projet              |
| GET     | `/projects/:id`                     | Détail d'un projet           |
| PATCH   | `/projects/:id`                     | Modifier un projet           |
| DELETE  | `/projects/:id`                     | Supprimer un projet          |
| POST    | `/projects/:id/favorite`            | Basculer en favori           |
| POST    | `/projects/:id/share-link`          | Générer un lien de partage   |
| DELETE  | `/projects/:id/share-link`          | Révoquer le lien de partage  |
| POST    | `/projects/:id/invitations`         | Inviter un membre par email  |
| POST    | `/projects/invitations/accept`      | Accepter une invitation      |
| GET     | `/projects/:id/members`             | Lister les membres           |
| PATCH   | `/projects/:id/members/:userId`     | Modifier le rôle d'un membre |
| DELETE  | `/projects/:id/members/:userId`     | Retirer un membre            |
| POST    | `/projects/:id/tasks`               | Créer une tâche              |
| PATCH   | `/projects/:id/tasks/:taskId`       | Modifier une tâche           |
| DELETE  | `/projects/:id/tasks/:taskId`       | Supprimer une tâche          |

### Routes publiques (sans auth)

| Méthode | Route                          | Description                       |
| ------- | ------------------------------ | --------------------------------- |
| GET     | `/projects/shared/:shareToken` | Accéder à un board partagé        |
| GET     | `/projects/invitations/:token` | Consulter une invitation          |

---

## Modèles de données

| Modèle              | Description                                     |
| ------------------- | ----------------------------------------------- |
| `User`              | Compte utilisateur                              |
| `Project`           | Board Kanban                                    |
| `ProjectMember`     | Appartenance d'un utilisateur à un projet       |
| `ProjectFavorite`   | Projets marqués en favoris                      |
| `ProjectStatus`     | Colonnes du board (ex : À faire, En cours, Done)|
| `Task`              | Carte de tâche avec priorité, assignee, deadline|
| `ProjectInvitation` | Invitation par email avec token et expiration   |
| `RefreshToken`      | Tokens de rafraîchissement JWT                  |
| `TaskActivity`      | Journal d'audit des modifications               |

---

## Rôles

| Rôle     | Droits                                      |
| -------- | ------------------------------------------- |
| `owner`  | Tous les droits, suppression du projet      |
| `admin`  | Gestion des membres, tâches et statuts      |
| `member` | Lecture et modification des tâches          |

---

## Contribuer

1. Créer une branche depuis `main` : `feat/<ticket>-<description>`
2. Appliquer les conventions de commit (Conventional Commits, en français)
3. Ouvrir une PR avec le template fourni
