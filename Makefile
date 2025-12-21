dev-run:
	docker compose \
  -f docker-compose/compose.base.yaml \
  -f docker-compose/compose.django.yaml \
  up --build

dev-down:
	docker compose \
  -f docker-compose/compose.base.yaml \
  -f docker-compose/compose.django.yaml \
  down -v

migrate:
	docker compose \
  -f docker-compose/compose.base.yaml \
  -f docker-compose/compose.django.yaml \
  exec godapp_main python manage.py migrate

makemigrations:
	docker compose \
  -f docker-compose/compose.base.yaml \
  -f docker-compose/compose.django.yaml \
  exec godapp_main python manage.py makemigrations
