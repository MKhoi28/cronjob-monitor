#!/bin/bash
# CronWatch Security Audit — Fast version (excludes node_modules)
# Run from project root: bash security-audit.sh

EXCLUDE="--exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git --exclude-dir=dist"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass() { echo -e "  ${GREEN}PASS${NC} $1"; }
fail() { echo -e "  ${RED}FAIL${NC} $1"; }
warn() { echo -e "  ${YELLOW}WARN${NC} $1"; }
header() { echo -e "\n${YELLOW}== $1 ==${NC}"; }

# ============================================================
header "AUDIT 1 — Secrets in client files"
# ============================================================

SECRETS=("SUPABASE_SERVICE_ROLE_KEY" "STRIPE_SECRET_KEY" "GEMINI_API_KEY" "CRON_SECRET" "RESEND_API_KEY" "ANTHROPIC_API_KEY")

for secret in "${SECRETS[@]}"; do
  result=$(grep -r "$secret" $EXCLUDE --include="*.tsx" --include="*.ts" \
    components/ hooks/ "app/(dashboard)/" "app/(auth)/" 2>/dev/null)
  if [ -z "$result" ]; then
    pass "$secret not in client files"
  else
    fail "$secret found in client files:"
    echo "$result"
  fi
done

# ============================================================
header "AUDIT 2 — .gitignore"
# ============================================================

for entry in ".env" ".env.local" ".env*.local"; do
  if grep -q "$entry" .gitignore 2>/dev/null; then
    pass "$entry in .gitignore"
  else
    fail "$entry missing from .gitignore"
  fi
done

committed=$(git log --all --full-history -- .env.local 2>/dev/null)
if [ -z "$committed" ]; then
  pass ".env.local never committed to git"
else
  fail ".env.local was committed — rotate ALL keys immediately"
fi

# ============================================================
header "AUDIT 3 — Rate limiting coverage"
# ============================================================

ROUTES=("app/api/ping" "app/api/monitors" "app/api/stripe" "app/api/check-monitors")

for route in "${ROUTES[@]}"; do
  result=$(grep -r "rateLimit" $EXCLUDE --include="*.ts" "$route/" 2>/dev/null)
  if [ -n "$result" ]; then
    pass "$route has rate limiting"
  else
    fail "$route missing rate limiting"
  fi
done

# ============================================================
header "AUDIT 4 — Timing-safe comparison"
# ============================================================

result=$(grep -r "timingSafeEqual" $EXCLUDE --include="*.ts" app/api/check-monitors/ 2>/dev/null)
if [ -n "$result" ]; then
  pass "check-monitors uses timingSafeEqual"
else
  fail "check-monitors not using timingSafeEqual"
fi

bad=$(grep -rn "=== .*SECRET\|SECRET.*===" $EXCLUDE --include="*.ts" app/api/ 2>/dev/null)
if [ -z "$bad" ]; then
  pass "No raw === secret comparisons"
else
  fail "Raw === used for secret comparison: $bad"
fi

# ============================================================
header "AUDIT 5 — XSS / Injection vectors"
# ============================================================

dsi=$(grep -r "dangerouslySetInnerHTML" $EXCLUDE --include="*.tsx" --include="*.ts" . 2>/dev/null)
if [ -z "$dsi" ]; then
  pass "No dangerouslySetInnerHTML usage"
else
  warn "dangerouslySetInnerHTML found — review:"
  echo "$dsi"
fi

svg_escape=$(grep -r "escapeSvg\|escapeHtml" $EXCLUDE --include="*.ts" app/api/badge/ 2>/dev/null)
if [ -n "$svg_escape" ]; then
  pass "SVG badge route escapes user input"
else
  fail "SVG badge route missing escapeSvg() — XSS risk"
fi

email_escape=$(grep -r "escapeHtml" $EXCLUDE --include="*.ts" app/api/check-monitors/ 2>/dev/null)
if [ -n "$email_escape" ]; then
  pass "Email HTML escapes user input"
else
  fail "check-monitors email missing escapeHtml()"
fi

# ============================================================
header "AUDIT 6 — Supabase client usage"
# ============================================================

admin_in_client=$(grep -r "SUPABASE_SERVICE_ROLE_KEY" $EXCLUDE --include="*.tsx" --include="*.ts" \
  components/ hooks/ 2>/dev/null)
if [ -z "$admin_in_client" ]; then
  pass "Service role key not in client components"
else
  fail "Service role key found in client components: $admin_in_client"
fi

# ============================================================
header "AUDIT 7 — Zod validation on API routes"
# ============================================================

for route in "app/api/ping" "app/api/monitors"; do
  result=$(grep -r "safeParse\|pingIdSchema\|createMonitorSchema" $EXCLUDE --include="*.ts" "$route/" 2>/dev/null)
  if [ -n "$result" ]; then
    pass "$route uses input validation"
  else
    fail "$route missing Zod validation"
  fi
done

# ============================================================
header "AUDIT 8 — Stripe webhook"
# ============================================================

sig=$(grep -r "constructEvent" $EXCLUDE --include="*.ts" app/api/stripe/webhook/ 2>/dev/null)
if [ -n "$sig" ]; then
  pass "Stripe webhook verifies signature"
else
  fail "Stripe webhook missing signature verification"
fi

raw_body=$(grep -r "request.text()" $EXCLUDE --include="*.ts" app/api/stripe/webhook/ 2>/dev/null)
if [ -n "$raw_body" ]; then
  pass "Stripe webhook uses raw body"
else
  fail "Stripe webhook may use request.json() — signature will fail"
fi

# ============================================================
header "AUDIT 9 — Middleware coverage"
# ============================================================

mw=$(cat middleware.ts 2>/dev/null)

for route in "/login" "/signup" "/forgot-password" "/api/ping" "/status"; do
  if echo "$mw" | grep -q "$route"; then
    pass "$route in middleware public routes"
  else
    warn "$route not found in middleware — verify manually"
  fi
done

if echo "$mw" | grep -q "check-monitors"; then
  fail "/api/check-monitors is public — remove it"
else
  pass "/api/check-monitors not public (protected by CRON_SECRET)"
fi

# ============================================================
echo -e "\n${YELLOW}== AUDIT COMPLETE ==${NC}"
echo ""
echo "Also run these in Supabase SQL Editor:"
echo "  SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';"
echo "  SELECT tablename, policyname, cmd FROM pg_policies WHERE schemaname = 'public';"