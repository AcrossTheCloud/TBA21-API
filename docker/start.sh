#!/usr/bin/env bash

bash ./docker/stop.sh > /dev/null 2>&1 # ignore the output

# https://hub.docker.com/_/postgres
docker rm tba21_test_postgres > /dev/null 2>&1 # ignore the output

echo -e '\033[1;32m#### LAUNCHING DOCKER ####\033[m'
docker-compose up --build -d

echo -e '\033[0;33m#### WAITING FOR INITD SCRIPTS TO RUN ON DOCKER ####\033[m'
sleep 15


echo -e '\033[0;32m#### Postgres should be up now, :) ####\033[m'
