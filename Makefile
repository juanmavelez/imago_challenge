APP_NAME   := imago-challenge

.PHONY: help build up down restart logs shell status clean dev test lint

logs: docker compose logs -f

deploy:
	@echo "Imago challenge..."
	@docker compose down
	@docker compose up -d --build --force-recreate --remove-orphans
	@docker image prune -f
	@echo "Deployed!"
