#!/bin/bash
. .env



pg_dump -d $FROM_CONNSTRING --disable-triggers --clean --if-exists \
        -n data_science -n public -n sprocket -n history -n mledb -v \
         --exclude-table=mledb.psyonix_api_result \
         | sed -e 's/sprocket_main/sprocket_staging/' -r -e 's/developer_main-[a-zA-Z0-9-]+/developer_main/' \
               -e 's/DROP ((SCHEMA|TABLE|SEQUENCE|TYPE|MATERIALIZED VIEW|VIEW|FUNCTION)[a-zA-Z _.-]+);/DROP \1 CASCADE\;/'
        > schema.sql
cat schema.sql | psql --single-transaction -d $TO_CONNSTRING -v ON_ERROR_STOP=1
