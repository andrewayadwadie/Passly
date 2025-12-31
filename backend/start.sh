#!/bin/bash
# Wait for DB to be ready (handled by docker-compose depends_on healthcheck)
# Run migrations
export PYTHONPATH=$PYTHONPATH:.
alembic upgrade head
# Start application
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
