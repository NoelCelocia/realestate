import data
into table "APP_RE"."T_RE_QUOTE_H"
from 'data.csv'
    record delimited by '\n'
    field delimited by ','
    optionally enclosed by '"'
error log 'data.err'
