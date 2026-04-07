#!/bin/sh
set -e

# Runtime substitution of API base URL
# The build bakes __NUXT_API_PLACEHOLDER__ into JS/HTML files.
# At container start, replace it with the real URL from NUXT_PUBLIC_API_BASE_URL env var.

if [ -n "${NUXT_PUBLIC_API_BASE_URL}" ]; then
  echo "Replacing API URL placeholder with: ${NUXT_PUBLIC_API_BASE_URL}"
  find /usr/share/nginx/html -type f \( -name "*.html" -o -name "*.js" -o -name "*.mjs" \) -print0 | \
    while IFS= read -r -d '' file; do
      sed -i "s|__NUXT_API_PLACEHOLDER__|${NUXT_PUBLIC_API_BASE_URL}|g" "$file"
    done
  echo "API URL substitution complete."
else
  echo "WARNING: NUXT_PUBLIC_API_BASE_URL not set. API calls will fail."
fi

# Fix logo href if it has double slash (//logo.png → /logo.png)
find /usr/share/nginx/html -type f -name "*.html" -print0 | \
  while IFS= read -r -d '' file; do
    sed -i 's|href="//logo.png"|href="/logo.png"|g' "$file"
  done
