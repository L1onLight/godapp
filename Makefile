dev-run:
	docker compose \
  -f docker-compose/compose.base.yaml \
  -f docker-compose/compose.services.yaml \
  -f docker-compose/compose.django.yaml \
  up --build

dev-down:
	docker compose \
  -f docker-compose/compose.base.yaml \
  -f docker-compose/compose.services.yaml \
  -f docker-compose/compose.django.yaml \
  down --remove-orphans

migrate:
	docker compose \
  -f docker-compose/compose.base.yaml \
  -f docker-compose/compose.services.yaml \
  -f docker-compose/compose.django.yaml \
  exec godapp_main python manage.py migrate

makemigrations:
	docker compose \
  -f docker-compose/compose.base.yaml \
  -f docker-compose/compose.services.yaml \
  -f docker-compose/compose.django.yaml \
  exec godapp_main python manage.py makemigrations

createsuperuser:
	docker compose \
  -f docker-compose/compose.base.yaml \
  -f docker-compose/compose.services.yaml \
  -f docker-compose/compose.django.yaml \
  exec godapp_main python manage.py createsuperuser

startapp:
	docker compose \
  -f docker-compose/compose.base.yaml \
  -f docker-compose/compose.services.yaml \
  -f docker-compose/compose.django.yaml \
  exec godapp_main python manage.py startapp $(NAME)

tail:
	docker compose \
  -f docker-compose/compose.base.yaml \
  -f docker-compose/compose.services.yaml \
  -f docker-compose/compose.django.yaml \
  logs -f godapp_main

dev-fe:
	docker compose \
  -f docker-compose/compose.base.yaml \
  -f docker-compose/compose.frontend.yaml \
  up -d

dev-fe-down:
	docker compose \
  -f docker-compose/compose.base.yaml \
  -f docker-compose/compose.frontend.yaml \
  down