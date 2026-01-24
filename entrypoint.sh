#!/bin/bash
set -e

# ==============================================
# Runtime Environment Configuration for SPA
# ==============================================
# This script generates env.js at container startup,
# allowing API URL changes without rebuilding the image.

ENV_JS_PATH="/usr/share/nginx/html/env.js"

echo "🚀 Generating runtime environment configuration..."

# Generate env.js with runtime environment variables
cat > "$ENV_JS_PATH" << EOF
// Runtime environment configuration - Generated at container startup
// Do not edit manually - this file is overwritten on each container start
window.__ENV__ = {
  VITE_API_BASE_URL: "${VITE_API_BASE_URL:-http://localhost:8000}",
};
EOF

echo "✅ Runtime env.js generated at $ENV_JS_PATH"
echo "   VITE_API_BASE_URL: ${VITE_API_BASE_URL:-http://localhost:8000}"

# Execute the main command (nginx)
exec "$@"
