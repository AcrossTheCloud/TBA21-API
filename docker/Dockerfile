FROM circleci/postgres:12-alpine-postgis
MAINTAINER Matthew Berryman <matthew@acrossthecloud.net>

# Clear the init folder for we don't run postgis.sh again.
RUN rm -rf /docker-entrypoint-initdb.d/*

COPY schema/schema.sql /docker-entrypoint-initdb.d/0.schema.sql
COPY schema/seeds/* /docker-entrypoint-initdb.d/
