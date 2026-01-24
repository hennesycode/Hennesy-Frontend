#!/bin/bash
set -e

ENV_JS_PATH="/usr/share/nginx/html/env.js"

echo "🚀 Generating runtime environment configuration..."

cat > "$ENV_JS_PATH" << EOF
// Runtime environment configuration - Generated at container startup
// Do not edit manually - this file is overwritten on each container start
window.__ENV__ = {
  VITE_API_BASE_URL: "${VITE_API_BASE_URL:-https://api.hennesy.pro}",
};
EOF

echo "✅ Runtime env.js generated at $ENV_JS_PATH"
echo "   VITE_API_BASE_URL: ${VITE_API_BASE_URL:-https://api.hennesy.pro}"

exec "$@"
