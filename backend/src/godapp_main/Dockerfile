FROM python:3.13-slim

ENV POETRY_VERSION=2.2.1 \
    POETRY_CACHE_DIR=/tmp/poetry_cache


RUN pip install --no-cache-dir poetry==$POETRY_VERSION

RUN poetry config virtualenvs.create false
COPY pyproject.toml poetry.lock README.md /tmp/poetry_build/

WORKDIR /tmp/poetry_build
RUN poetry install --no-interaction --no-ansi --no-root


WORKDIR /src/godapp_main

RUN adduser --disabled-password --gecos '' --uid 1000 octocrm

COPY . .

RUN chown -R octocrm:octocrm /src/godapp_main
USER octocrm

EXPOSE 8000
