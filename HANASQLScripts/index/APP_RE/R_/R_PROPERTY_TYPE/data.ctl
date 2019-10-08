import data
into table "APP_RE"."R_PROPERTY_TYPE"
from 'data.csv'
    record delimited by '\n'
    field delimited by ','
    optionally enclosed by '"'
error log 'data.err'
