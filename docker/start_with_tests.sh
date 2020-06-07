#!/usr/bin/env bash

bash ./docker/stop.sh > /dev/null 2>&1 # ignore the output

# https://hub.docker.com/_/postgres
docker rm tba21_test_postgres > /dev/null 2>&1 # ignore the output

echo -e '\033[1;32m#### LAUNCHING DOCKER ####\033[m'
docker-compose up --build -d

echo -e '\033[0;33m#### WAITING FOR INITD SCRIPTS TO RUN ON DOCKER ####\033[m'
sleep 15

export PGUSER=postgres
export PGPASSWORD=postgres
export PGHOST=127.0.0.1
export PGPORT=5432
export PGDATABASE=tba21
export PGSSL=false

export UPLOADS_TABLE=tba21.s3uploads
export TYPES_TABLE=tba21.types
export ITEMS_TABLE=tba21.items
export COLLECTIONS_TABLE=tba21.collections
export COLLECTIONS_ITEMS_TABLE=tba21.collections_items
export COLLECTION_COLLECTIONS_TABLE=tba21.collection_collections
export CONCEPT_TAGS_TABLE=tba21.concept_tags
export KEYWORD_TAGS_TABLE=tba21.keyword_tags
export SHORT_PATHS_TABLE=tba21.short_paths
export PROFILES_TABLE=tba21.profiles
export ANNOUNCEMENTS_TABLE=tba21.announcements

npm run lint
jest -i --coverage --detectOpenHandles --bail

echo -e '\033[0;33m#### STOPPING DOCKER ####\033[m'
bash ./docker/stop.sh > /dev/null 2>&1 # ignore the output
