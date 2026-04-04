<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-04 -->

# features/organization/lib

## Purpose
Organization management library — CRUD operations, active org resolution, email domain utilities, and shared Keycloak Admin API client.

## Key Files

| File | Description |
|------|-------------|
| `keycloak-client.ts` | **Shared service account client used by all features.** Caches service account token (30s expiry buffer). Exports `getServiceAccountToken()` and `adminFetch(path, init)` helper (auto-injects Bearer token + Content-Type). Token caching prevents unnecessary token endpoint calls. |
| `organization-admin.ts` | Organization CRUD: `listOrganizations()`, `getOrganization(orgId)`, `getOrgByAlias(alias)`, `updateOrganization()`, `createOrganization()`, `deleteOrganization()`. Helpers: `isAutoJoinEnabled(orgId)`, `hasVerifiedDomain(orgId, domain)`. All use shared `adminFetch`. |
| `active-org.ts` | Active org resolution: `getActiveOrgId()` reads `active-org` cookie + validates against session orgs. Returns KC org ID or `null` for `__all__` mode. `getAllOrgIds()` returns all org IDs from session for cross-org aggregation. |
| `email-domain.ts` | Domain classification: `extractDomain(email)`, `isPublicDomain(domain)` using `free-email-domains` package. `suggestOrgName(email)` returns capitalized domain or `null` for public domains. Used during onboarding. |

## For AI Agents

### Working In This Directory
- `keycloak-client.ts` is the **single source of Admin API authentication** — imported by all features
- Token caching: `getServiceAccountToken()` checks expiry and refreshes only if needed
- `adminFetch` auto-injects authorization header and sets `Content-Type: application/json`
- Never call `getServiceAccountToken()` directly in features — use `adminFetch` wrapper

### Shared Service Account Authentication
```typescript
// In any feature that needs Admin API:
import { adminFetch } from '@/features/organization/lib/keycloak-client.ts';

// Or the shared alias:
import { adminFetch } from '@/features/shared/lib/keycloak-client.ts';

// Use it directly — authorization is automatic
const orgs = await adminFetch('/organizations');
```

### Token Caching Strategy
```typescript
// Caches token for up to 30 minutes, with 30s buffer before expiry
// If current time < expiresAt - 30s, use cached token
// Otherwise, fetch new token and cache with new expiry

// This prevents:
// - Expired token errors (30s buffer catches clock skew)
// - Token endpoint spam (reuse same token for 30min)
```

### Active Org Resolution Pattern
```typescript
// In RSC that needs to determine org context:
const orgId = await getActiveOrgId();
if (!orgId) {
  // User is in __all__ mode — show cross-org dashboard
} else {
  // User is viewing specific org — filter data by orgId
}

// For cross-org queries:
const allOrgIds = await getAllOrgIds();
const data = await Promise.all(
  allOrgIds.map(id => fetchOrgData(id))
);
```

### Organization CRUD Pattern
```typescript
// Create org
await createOrganization({
  name: "Acme Corp",
  alias: "acme-corp",
  attributes: { industry: "Tech" }
});

// Update org
await updateOrganization(orgId, {
  enabled: false  // Suspend org
});

// Delete org (cascade deletes members)
await deleteOrganization(orgId);
```

### Email Domain Classification
```typescript
// During registration/onboarding:
const domain = extractDomain(userEmail);  // "gmail.com"
const isPublic = isPublicDomain(domain);  // true
const suggestedName = suggestOrgName(userEmail);  // null

// If professional domain:
const domain = extractDomain("alice@acme.com");
const suggestedName = suggestOrgName("alice@acme.com");  // "Acme"
```

### KC Admin API Endpoints Used
- `GET /admin/realms/{realm}/organizations` — list all orgs
- `GET /admin/realms/{realm}/organizations/{orgId}` — get org details
- `PATCH /admin/realms/{realm}/organizations/{orgId}` — update org
- `POST /admin/realms/{realm}/organizations` — create org
- `DELETE /admin/realms/{realm}/organizations/{orgId}` — delete org
- `POST /realms/{realm}/protocol/openid-connect/token` — refresh service account token
