include .env
export

MIGRATION_DIR=database/migrations
DB_CONTAINER=url_shortener_db

.PHONY: docker-up docker-down migration-up migration-down create-migration status

dev:
	node src/server.js

dev-watch:
	nodemon src/server.js

docker-up:
	docker compose up -d

docker-down:
	docker compose down

create-migration:
	@migrate create -ext sql -dir $(MIGRATION_DIR) -seq $(name)

migration-up:
	@migrate -path $(MIGRATION_DIR) -database "$(DATABASE_URL)" up

migration-down:
	@migrate -path $(MIGRATION_DIR) -database "$(DATABASE_URL)" down 1

migrate-version:
	@migrate -path $(MIGRATION_DIR) -database "$(DATABASE_URL)" version

psql:
	docker exec -it $(DB_CONTAINER) psql -U $(POSTGRES_USER) -d $(POSTGRES_DB)
