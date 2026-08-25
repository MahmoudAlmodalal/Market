FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
RUN chmod +x entrypoint.sh

# migrate + collectstatic run at boot, not build: compose mounts ./api over /app,
# which would discard anything staged into the image.
ENTRYPOINT ["./entrypoint.sh"]
CMD ["gunicorn", "souqi.wsgi:application", "--bind", "0.0.0.0:8000"]
