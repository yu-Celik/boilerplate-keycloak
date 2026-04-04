<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-04 | Updated: 2026-04-04 -->

# backups

## Purpose
Database backup scripts and snapshots for the Keycloak PostgreSQL database. Enables point-in-time recovery, environment reset, and disaster recovery workflows. Backups are created manually via the Makefile and can be restored to reinitialize the Keycloak realm state.

## Key Files

| File | Description |
|------|-------------|
| `pg-backup.sh` | Bash script that creates a compressed PostgreSQL dump of the Keycloak database. Generates timestamped backup files (`keycloak_YYYYMMDD_HHMMSS.sql.gz`). Run manually or via `make backup`. |
| `keycloak_20260331_171150.sql.gz` | Example snapshot of Keycloak PostgreSQL database. Compressed SQL dump that can be restored to recreate realm state at backup time. |

## Subdirectories
None. This directory contains only backup scripts and database snapshots.

## For AI Agents

### Working In This Directory

**Create a backup:**
```bash
make backup  # Creates timestamped backup in backups/
```

**Restore from a backup:**
```bash
# Stop services
make down

# Remove volume to force restore
docker volume rm boilerplate-keycloak_keycloak-db

# Start services (they will auto-import from realm-export.json)
make up
```

**Manual database dump:**
```bash
docker compose exec -T postgres pg_dump -U keycloak keycloak | gzip > backups/keycloak_$(date +%Y%m%d_%H%M%S).sql.gz
```

**Manual database restore:**
```bash
docker compose down
docker volume rm boilerplate-keycloak_keycloak-db
docker compose up -d postgres
sleep 10
gunzip < backups/keycloak_YYYYMMDD_HHMMSS.sql.gz | docker compose exec -T postgres psql -U keycloak keycloak
docker compose up -d keycloak app
```

### Backup Strategy

1. **Automatic realm initialization** — `configs/realm-export.json` is imported at container startup via `--import-realm`
2. **Manual backups** — Use `make backup` before major changes (new features, config updates)
3. **Point-in-time recovery** — Restore a snapshot to revert realm state (users, orgs, clients, etc.)
4. **Data retention** — Backups accumulate in this directory; clean up old files manually or via cron

### Common Patterns

- **Before production deployment**: `make backup` creates a recovery point
- **After realm config changes**: Run `make export-realm` to update `configs/realm-export.json`, then commit
- **Testing scenario**: Restore a known-good backup, run tests, then discard
- **Disaster recovery**: Restore latest backup to recover from accidental data loss

## Dependencies

### Internal
- `../docker-compose.yml` — defines PostgreSQL service and volume
- `../configs/realm-export.json` — provides reproducible realm initialization (primary recovery method)
- `../Makefile` — provides `backup` and `down` commands

### External
- **PostgreSQL 16** — database engine (`postgres` service in docker-compose.yml)
- **gzip** — compression utility (for creating `.sql.gz` files)
- **Bash** — shell script runtime

<!-- MANUAL: -->
