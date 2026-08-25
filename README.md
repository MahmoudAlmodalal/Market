# Souqi

Django 5 + DRF marketplace backend. Specs: `SRS.md` · `API.md` · `DB_DESIGN.md` · plan in `PLAN.md`.

## Run

```sh
cp .env.example .env
python3 -c "import secrets; print(secrets.token_urlsafe(64))"   # paste into SECRET_KEY
docker compose up --build
```

The api container runs `migrate` then `collectstatic` before gunicorn. Health check lands in P02.
