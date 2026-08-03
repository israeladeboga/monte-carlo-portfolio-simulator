#!/usr/bin/env bash
#
# Sync frontend/ in this monorepo from the Lovable-connected repo.
#
# The frontend is authored in Lovable (which auto-commits to its own repo);
# this monorepo keeps a mirror under frontend/. Run this to pull the latest UI.
# Each run produces one commit authored by you, so attribution stays yours.
#
# Usage:
#   scripts/sync-frontend.sh                          # clone the remote (uses your GitHub auth)
#   scripts/sync-frontend.sh ../future-wealth-sim     # mirror an existing local clone (no auth)
#
set -euo pipefail

REMOTE="https://github.com/israeladeboga/future-wealth-sim.git"
BRANCH="main"
PREFIX="frontend"

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

src="${1:-}"
cleanup=""
if [ -z "$src" ]; then
  tmp="$(mktemp -d)"
  cleanup="$tmp"
  echo "Cloning $REMOTE ($BRANCH) ..."
  git clone --depth 1 --branch "$BRANCH" "$REMOTE" "$tmp" >/dev/null
  src="$tmp"
fi

srchash="$(git -C "$src" rev-parse --short HEAD)"
echo "Mirroring frontend @ $srchash into $PREFIX/ ..."
rm -rf "$PREFIX"
mkdir -p "$PREFIX"
git -C "$src" archive HEAD | tar -x -C "$PREFIX"

[ -n "$cleanup" ] && rm -rf "$cleanup"

git add -A "$PREFIX"
if git diff --cached --quiet; then
  echo "No changes — frontend already up to date."
else
  git commit -q -m "sync: frontend from Lovable @ $srchash"
  echo "Committed frontend sync @ $srchash. Push when ready."
fi
