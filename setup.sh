#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────
#  Jarvim — script de setup
# ─────────────────────────────────────────────

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()    { echo -e "${GREEN}[setup]${NC} $1"; }
warn()    { echo -e "${YELLOW}[warn]${NC}  $1"; }
error()   { echo -e "${RED}[erreur]${NC} $1"; exit 1; }

# ── 1. Prérequis ──────────────────────────────
info "Vérification des prérequis..."

command -v node >/dev/null 2>&1 || error "Node.js est requis. Installe-le sur https://nodejs.org"
command -v npm  >/dev/null 2>&1 || error "npm est requis."

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  error "Node.js >= 20 requis (version actuelle : $(node -v))"
fi

info "Node $(node -v) / npm $(npm -v) détectés."

# ── 2. Variables d'environnement ──────────────
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

copy_env_if_missing() {
  local dir="$1"
  local example="$dir/.env.example"
  local target="$dir/.env"

  if [ ! -f "$target" ]; then
    if [ -f "$example" ]; then
      cp "$example" "$target"
      warn ".env créé depuis .env.example dans '$dir'. Renseigne les valeurs avant de démarrer."
    else
      warn "Aucun .env ni .env.example trouvé dans '$dir'."
    fi
  else
    info ".env déjà présent dans '$dir', ignoré."
  fi
}

info "Configuration des fichiers .env..."
copy_env_if_missing "$ROOT_DIR"
copy_env_if_missing "$ROOT_DIR/apps/api"
copy_env_if_missing "$ROOT_DIR/apps/web"

# ── 3. Installation des dépendances ───────────
info "Installation des dépendances npm (workspaces)..."
cd "$ROOT_DIR"
npm install

# ── 4. Génération du client Prisma ────────────
info "Génération du client Prisma..."
cd "$ROOT_DIR/apps/api"
npx prisma generate

# ── 5. Migrations ────────────────────────────
info "Application des migrations Prisma..."
npx prisma migrate deploy

# ── Fin ───────────────────────────────────────
echo ""
info "Setup terminé. Pour démarrer le projet :"
echo ""
echo "    npm run dev"
echo ""
