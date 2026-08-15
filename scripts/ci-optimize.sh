#!/usr/bin/env bash
#
# Optimize images and commit the result, from CI.
#
# The naive version of this rebased its own commit onto whatever the CMS had
# pushed in the meantime. That conflicts: the optimizer rewrites the image path
# inside a content JSON, and Keystatic may have just edited the same file. Git
# has no way to merge those two.
#
# So instead of replaying our change onto a newer base, we throw our work away
# and redo it on the newer base. Recomputing is cheap and can never conflict.
#
# All logic lives here rather than in the workflow YAML on purpose: if the repo
# token ever lacks `workflow` scope, pushing .github/workflows fails server-side
# but this file can still be edited and pushed normally.
set -euo pipefail

git config user.name  "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"

for attempt in 1 2 3; do
  echo "--- attempt $attempt ---"

  # Always start from the current tip, discarding anything from a prior attempt.
  git fetch origin main
  git reset --hard origin/main

  npm run optimize:images

  if [ -z "$(git status --porcelain)" ]; then
    echo "nothing to optimize"
    exit 0
  fi

  git add -A
  git commit -m "Compress uploaded images [skip-optimize]"

  # A plain push, never a force: if someone landed a commit while we worked the
  # push is rejected, and the next attempt recomputes on top of their work.
  if git push origin HEAD:main; then
    echo "pushed on attempt $attempt"
    exit 0
  fi

  echo "push rejected -- another commit landed first, recomputing"
done

echo "gave up after 3 attempts; the next upload will pick these images up anyway"
exit 1
