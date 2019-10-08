import data
into table "APP_RE"."M_CUSTOMER_DOC"
from 'data.csv'
    record delimited by '\n'
    field delimited by ','
    optionally enclosed by '"'
error log 'data.err'
