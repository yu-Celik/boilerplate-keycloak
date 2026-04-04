#!/bin/bash
# Initialize Keycloak realm data that cannot be imported via realm-export.json
# This script creates organizations and memberships via the Admin CLI

set -e

KCADM="/opt/keycloak/bin/kcadm.sh"
REALM="boilerplate"

echo "=== Initializing realm data ==="

# Authenticate as bootstrap admin
$KCADM config credentials \
  --server http://localhost:8080 \
  --realm master \
  --user "$KC_BOOTSTRAP_ADMIN_USERNAME" \
  --password "$KC_BOOTSTRAP_ADMIN_PASSWORD"

# Check if organization already exists
EXISTING_ORG=$($KCADM get organizations -r "$REALM" --fields alias 2>/dev/null | grep -c '"demo-org"' || true)

if [ "$EXISTING_ORG" -gt 0 ]; then
  echo "Organization 'demo-org' already exists. Checking membership..."
  ORG_ID=$($KCADM get organizations -r "$REALM" --fields id,alias 2>/dev/null | python3 -c "import sys,json;orgs=json.load(sys.stdin);print(next(o['id'] for o in orgs if o['alias']=='demo-org'))" 2>/dev/null)
else
  echo "Creating organization 'demo-org'..."
  ORG_ID=$($KCADM create organizations -r "$REALM" \
    -s name="Demo Organization" \
    -s alias="demo-org" \
    -s "domains=[{\"name\":\"demo.com\",\"verified\":true}]" \
    -i 2>/dev/null)
  echo "Organization created: $ORG_ID"
fi

# Find the test user
USER_ID=$($KCADM get users -r "$REALM" -q email=user@demo.com --fields id --format csv --noquotes 2>/dev/null | head -1)

if [ -z "$USER_ID" ]; then
  echo "Test user 'user@demo.com' not found. Skipping membership."
  exit 0
fi

# Check if user is already a member
MEMBER_COUNT=$($KCADM get "organizations/$ORG_ID/members" -r "$REALM" --fields email 2>/dev/null | grep -c "user@demo.com" || true)

if [ "$MEMBER_COUNT" -eq 0 ]; then
  echo "Adding user $USER_ID to organization $ORG_ID..."
  # KC nightly API expects the user ID as a plain string body
  $KCADM create "organizations/$ORG_ID/members" -r "$REALM" -b "\"$USER_ID\"" 2>/dev/null || true
  echo "Member added."
else
  echo "User already a member of demo-org."
fi

# Assign realm-management roles to the service account
echo "Configuring service account roles..."
SA_CLIENT_ID=$($KCADM get clients -r "$REALM" -q clientId=boilerplate-service --fields id --format csv --noquotes 2>/dev/null | head -1)

if [ -n "$SA_CLIENT_ID" ]; then
  SA_USER_ID=$($KCADM get "clients/$SA_CLIENT_ID/service-account-user" -r "$REALM" --fields id --format csv --noquotes 2>/dev/null | head -1)
  RM_CLIENT_ID=$($KCADM get clients -r "$REALM" -q clientId=realm-management --fields id --format csv --noquotes 2>/dev/null | head -1)

  if [ -n "$SA_USER_ID" ] && [ -n "$RM_CLIENT_ID" ]; then
    # Get role IDs for the roles we need
    for ROLE_NAME in manage-users view-users manage-realm view-realm manage-clients view-clients; do
      ROLE_JSON=$($KCADM get "clients/$RM_CLIENT_ID/roles/$ROLE_NAME" -r "$REALM" 2>/dev/null || true)
      if [ -n "$ROLE_JSON" ]; then
        $KCADM create "users/$SA_USER_ID/role-mappings/clients/$RM_CLIENT_ID" -r "$REALM" -b "[$ROLE_JSON]" 2>/dev/null || true
      fi
    done
    echo "Service account roles configured."
  fi
fi

# Fix account-console client scopes (may be missing after realm import)
echo "Fixing account-console client scopes..."
AC_CLIENT_ID=$($KCADM get clients -r "$REALM" -q clientId=account-console --fields id --format csv --noquotes 2>/dev/null | head -1)

if [ -n "$AC_CLIENT_ID" ]; then
  for SCOPE_NAME in profile email roles web-origins acr basic; do
    SCOPE_ID=$($KCADM get client-scopes -r "$REALM" -q name=$SCOPE_NAME --fields id --format csv --noquotes 2>/dev/null | head -1)
    if [ -n "$SCOPE_ID" ]; then
      $KCADM update "clients/$AC_CLIENT_ID/default-client-scopes/$SCOPE_ID" -r "$REALM" 2>/dev/null || true
    fi
  done
  echo "Account-console scopes fixed."
fi

# Assign platform-admin realm role to the seed user
echo "Assigning platform-admin role to user@demo.com..."
PLATFORM_ADMIN_ROLE_JSON=$($KCADM get roles -r "$REALM" -q name=platform-admin 2>/dev/null | python3 -c "import sys,json;roles=json.load(sys.stdin);print(json.dumps(next((r for r in roles if r['name']=='platform-admin'), None)))" 2>/dev/null || true)
if [ -n "$PLATFORM_ADMIN_ROLE_JSON" ] && [ "$PLATFORM_ADMIN_ROLE_JSON" != "null" ] && [ -n "$USER_ID" ]; then
  $KCADM create "users/$USER_ID/role-mappings/realm" -r "$REALM" -b "[$PLATFORM_ADMIN_ROLE_JSON]" 2>/dev/null || true
  echo "platform-admin role assigned."
else
  echo "Could not assign platform-admin role (role or user not found)."
fi

echo "=== Realm initialization complete ==="
echo "  Organization: demo-org ($ORG_ID)"
echo "  Member: user@demo.com ($USER_ID)"
