#!/usr/bin/env bash

git clone git@github.com:AcrossTheCloud/TBA21-schema.git docker/schema

# https://hub.docker.com/_/postgres
docker rm tba21_test_postgres

docker-compose up --build -d
