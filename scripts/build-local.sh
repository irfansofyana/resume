#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
out="${TMPDIR:?TMPDIR must point to a scratch directory}/resume-jekyll"
mkdir -p "$out/sass-cache"

if ! docker image inspect resume-local >/dev/null 2>&1; then
  docker build -t resume-local "$root"
fi

docker run --rm --user "$(id -u):$(id -g)" \
  -e HOME=/home/preview \
  -v "$root:/home/app:ro" -v "$out:/home/preview" \
  -v "$out/sass-cache:/home/app/.sass-cache" \
  -w /home/app resume-local bundle exec jekyll build --destination /home/preview/site
printf 'Built site: %s/site/index.html\n' "$out"
