FROM postgres:10
MAINTAINER Dan Wood <daniel@acrossthecloud.net>

ENV PG_MAJOR 10
ENV POSTGIS_MAJOR 2.4

# http://apt.postgresql.org/pub/repos/apt/
RUN apt-get update \
   && apt-get install -y \
       postgresql-$PG_MAJOR-postgis-$POSTGIS_MAJOR \
       postgresql-$PG_MAJOR-postgis-scripts \
  && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /docker-entrypoint-initdb.d
RUN chmod 777 /usr/local/bin/docker-entrypoint.sh

COPY $PWD/docker/schema/schema.sql /docker-entrypoint-initdb.d/0.schema.sql
COPY $PWD/docker/schema/seeds/* /docker-entrypoint-initdb.d/
