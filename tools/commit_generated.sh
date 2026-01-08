#!/usr/bin/env bash
set -euo pipefail

# Commit generated artifacts helper
# Usage in CI (recommended): set TARGET_BRANCH and GITHUB_TOKEN env vars (GITHUB_TOKEN is provided by Actions)
# Example: TARGET_BRANCH=codegen/full-stubs GITHUB_TOKEN=${{ secrets.GITHUB_TOKEN }} ./tools/commit_generated.sh

TARGET_BRANCH="${TARGET_BRANCH:-codegen/full-stubs}"
COMMIT_MSG="${COMMIT_MESSAGE:-chore(codegen): add generated stubs and SDKs}"

echo "Preparing to commit generated artifacts to branch: ${TARGET_BRANCH}"

# Ensure we are in repo root
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

# Check git status
if [ -n "$(git status --porcelain)" ]; then
  echo "Uncommitted changes detected in working tree. These will be included in the commit."
fi

# Create or switch to branch
git fetch origin --prune
if git show-ref --verify --quiet "refs/heads/${TARGET_BRANCH}"; then
  git checkout "${TARGET_BRANCH}"
  git pull origin "${TARGET_BRANCH}" || true
else
  git checkout -b "${TARGET_BRANCH}"
fi

# Add generated directories if they exist
ADDED=false
for path in generators sdks frontend packages; do
  if [ -d "$path" ]; then
    git add "$path" || true
    ADDED=true
  fi
done

# Also add tools/templates/documentation changes if any
git add openapi || true
git add migrations || true

if [ "$ADDED" = false ]; then
  echo "No generated artifacts found to add (generators/, sdks/, frontend/, packages/). Aborting commit."
  exit 0
fi

# Commit
git commit -m "${COMMIT_MSG}" || true

# Push with authentication
if [ -z "${GITHUB_TOKEN:-}" ]; then
  echo "GITHUB_TOKEN not set. Attempting to push with existing auth (may fail in CI)."
  git push -u origin "${TARGET_BRANCH}"
else
  # derive remote url and replace protocol with token
  REMOTE_URL=$(git remote get-url origin)
  if echo "$REMOTE_URL" | grep -qE '^git@'; then
    # SSH URL - push normally (CI runner usually has no SSH keys); fallback to HTTPS
    echo "Origin uses SSH. Attempting push via git remote with token using https URL..."
    HTTPS_URL=$(echo "$REMOTE_URL" | sed -E 's#git@github.com:(.*)#https://github.com/\1#')
    AUTH_URL=$(echo "$HTTPS_URL" | sed -E "s#https://#https://${GITHUB_TOKEN}@#")
    git remote add _auth "$AUTH_URL" 2>/dev/null || git remote set-url _auth "$AUTH_URL"
    git push -u _auth "${TARGET_BRANCH}"
    git remote remove _auth || true
  else
    AUTH_URL=$(echo "$REMOTE_URL" | sed -E "s#https://#https://${GITHUB_TOKEN}@#")
    git remote add _auth "$AUTH_URL" 2>/dev/null || git remote set-url _auth "$AUTH_URL"
    git push -u _auth "${TARGET_BRANCH}"
    git remote remove _auth || true
  fi
fi

echo "Pushed branch ${TARGET_BRANCH} with generated artifacts."
