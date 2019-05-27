#!/usr/bin/env bash

docker stop tba21_test_postgres
docker rm -f tba21_test_postgres

rm -rf docker/schema


