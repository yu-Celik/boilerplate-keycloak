.PHONY: up down logs reset build-theme init-realm export-realm backup

## Start all services
up:
	docker compose up -d
	@echo "Waiting for Keycloak to be healthy..."
	@docker compose exec keycloak sh -c 'until { printf "HEAD /health/ready HTTP/1.0\r\n\r\n" >&0; grep "HTTP/1.0 200"; } 0<>/dev/tcp/localhost/9000 2>/dev/null; do sleep 2; done'
	@echo "Keycloak is ready. Initializing realm data..."
	@$(MAKE) init-realm
	@echo ""
	@echo "✔ All services are up:"
	@echo "  Keycloak:  http://localhost:3991"
	@echo "  Next.js:   http://localhost:3990"
	@echo "  Mailpit:   http://localhost:3992"

## Stop all services
down:
	docker compose down

## View logs
logs:
	docker compose logs -f

## Reset everything (delete volumes, rebuild)
reset:
	docker compose down -v
	$(MAKE) up

## Build Keycloakify theme JAR
build-theme:
	cd keycloakify && npm install && npm run build
	@echo "Theme JAR built: keycloakify/dist/"

## Initialize realm data (organizations, demo user membership)
init-realm:
	@docker compose exec -T keycloak bash /opt/keycloak/data/import/init-realm.sh || true

## Export current realm configuration
export-realm:
	docker compose exec keycloak /opt/keycloak/bin/kc.sh export --dir /tmp/export --realm boilerplate
	docker compose cp keycloak:/tmp/export/boilerplate-realm.json ./configs/realm-export.json
	@echo "Realm exported to configs/realm-export.json"

## Backup PostgreSQL database
backup:
	bash backups/pg-backup.sh
	@echo "Backup complete. Check backups/ directory."
