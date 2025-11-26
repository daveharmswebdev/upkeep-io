#!/bin/bash
# Validates that apps/backend/tsconfig.json has required settings for production deployment
# See CLAUDE.md "PROTECTED CONFIGURATION" section for details

set -e

TSCONFIG_PATH="apps/backend/tsconfig.json"
ERRORS=0

echo "Validating $TSCONFIG_PATH..."

# Check if file exists
if [ ! -f "$TSCONFIG_PATH" ]; then
    echo "ERROR: $TSCONFIG_PATH not found"
    exit 1
fi

# Check for rootDir: "./src"
if ! grep -q '"rootDir":\s*"./src"' "$TSCONFIG_PATH"; then
    echo "ERROR: Missing or incorrect 'rootDir: \"./src\"' in $TSCONFIG_PATH"
    echo "       This setting is required for correct dist/ output structure."
    echo "       Without it, server.js will be at dist/apps/backend/src/server.js instead of dist/server.js"
    ERRORS=$((ERRORS + 1))
fi

# Check that path aliases point to dist/*, not src/*
if grep -q '"@domain/\*":\s*\[.*libs/domain/src' "$TSCONFIG_PATH"; then
    echo "ERROR: @domain/* path alias points to src/ instead of dist/"
    echo "       Path aliases must point to libs/*/dist/* for production deployment."
    ERRORS=$((ERRORS + 1))
fi

if grep -q '"@validators/\*":\s*\[.*libs/validators/src' "$TSCONFIG_PATH"; then
    echo "ERROR: @validators/* path alias points to src/ instead of dist/"
    echo "       Path aliases must point to libs/*/dist/* for production deployment."
    ERRORS=$((ERRORS + 1))
fi

if grep -q '"@auth/\*":\s*\[.*libs/auth/src' "$TSCONFIG_PATH"; then
    echo "ERROR: @auth/* path alias points to src/ instead of dist/"
    echo "       Path aliases must point to libs/*/dist/* for production deployment."
    ERRORS=$((ERRORS + 1))
fi

# Check that path aliases DO point to dist/*
if ! grep -q '"@domain/\*":\s*\[.*libs/domain/dist' "$TSCONFIG_PATH"; then
    echo "ERROR: @domain/* path alias not found or doesn't point to dist/"
    ERRORS=$((ERRORS + 1))
fi

if [ $ERRORS -gt 0 ]; then
    echo ""
    echo "VALIDATION FAILED: $ERRORS error(s) found"
    echo ""
    echo "These settings are critical for production deployment on Render."
    echo "See CLAUDE.md 'PROTECTED CONFIGURATION' section for details."
    echo ""
    echo "If you're fixing TypeScript errors, try these alternatives:"
    echo "  1. Run 'npm run build' to compile libs to their dist/ folders"
    echo "  2. Clean stale files: find libs -path '*/src/*.js' -delete"
    echo "  3. Check CLAUDE.md for troubleshooting steps"
    exit 1
fi

echo "Validation passed: $TSCONFIG_PATH has correct production settings"
exit 0
