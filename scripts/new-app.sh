#!/usr/bin/env bash
# Scaffold a new app from this starter template.
#
# Usage:
#   ./scripts/new-app.sh <app-name> [port]
#
# Example:
#   ./scripts/new-app.sh my-app 3001

set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <app-name> [port]" >&2
  exit 1
fi

APP_NAME="$1"
PORT="${2:-3000}"

# Slugify: lowercase, replace non-[a-z0-9-] with -
APP_SLUG=$(echo "$APP_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]/-/g')

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
TEMPLATE_DIR=$(dirname "$SCRIPT_DIR")
PARENT_DIR=$(dirname "$TEMPLATE_DIR")
TARGET_DIR="$PARENT_DIR/$APP_SLUG"

if [ -d "$TARGET_DIR" ]; then
  echo "Folder '$TARGET_DIR' already exists. Pick another name." >&2
  exit 1
fi

echo
echo "==> Creating new app from nextjs-supabase-starter"
echo "    App     : $APP_NAME"
echo "    Folder  : $TARGET_DIR"
echo "    Port    : $PORT"
echo

echo "==> Copying template..."
cp -R "$TEMPLATE_DIR" "$TARGET_DIR"

for dir in .next node_modules .git coverage out playwright-report; do
  rm -rf "$TARGET_DIR/$dir"
done

echo "==> Configuring package.json..."
# Use node for safe JSON edit (no jq dependency).
node - <<EOF
const fs = require('fs');
const path = require('path');
const pkgPath = path.join('$TARGET_DIR', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
pkg.name = '$APP_SLUG';
pkg.version = '0.1.0';
for (const k of Object.keys(pkg.scripts)) {
  pkg.scripts[k] = pkg.scripts[k].replace(/3000/g, '$PORT');
}
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
EOF

echo "==> Creating .env.local..."
cp "$TARGET_DIR/.env.local.example" "$TARGET_DIR/.env.local"

# Use sed -i with portability for macOS (BSD) vs GNU.
SEDI=(-i)
case "$(uname)" in
  Darwin*) SEDI=(-i '') ;;
esac

sed "${SEDI[@]}" \
  -e "s|APP_NAME=\"My App\"|APP_NAME=\"$APP_NAME\"|" \
  -e "s|NEXT_PUBLIC_APP_NAME=\"My App\"|NEXT_PUBLIC_APP_NAME=\"$APP_NAME\"|" \
  -e "s|APP_PORT=3000|APP_PORT=$PORT|" \
  -e "s|APP_URL=\"http://localhost:3000\"|APP_URL=\"http://localhost:$PORT\"|" \
  -e "s|NEXT_PUBLIC_APP_URL=\"http://localhost:3000\"|NEXT_PUBLIC_APP_URL=\"http://localhost:$PORT\"|" \
  "$TARGET_DIR/.env.local"

echo "==> Initializing git..."
(
  cd "$TARGET_DIR"
  git init -q -b main
  git add .
  git commit -q -m "chore: init from nextjs-supabase-starter"
)

echo
echo "Done! Project '$APP_NAME' created."
echo
echo "Next steps:"
echo "  1. cd '$TARGET_DIR'"
echo "  2. Edit .env.local (Supabase URL + keys)"
echo "  3. npm install"
echo "  4. npx supabase start  (or configure Supabase Cloud)"
echo "  5. npx supabase db reset"
echo "  6. npm run dev  → http://localhost:$PORT"
echo
echo "  Admin setup page: http://localhost:$PORT/setup"
echo
