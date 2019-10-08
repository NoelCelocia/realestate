CREATE PROCEDURE "APP_RE"."SPAPP_RE_GENERATENUMBER" ( 
    IN DocType NVARCHAR(20)
)
AS
BEGIN

    IF :DocType = 'Quote' THEN
        SELECT CAST(CAST(IFNULL(MAX("QuoteNum"),'0')  AS INTEGER ) + 1 AS NVARCHAR(9))  "Code" FROM "APP_RE"."T_RE_QUOTE_H";
    ELSEIF :DocType = 'Reservation' THEN
       SELECT CAST(CAST(IFNULL(MAX("ReserveNum"),'0')  AS INTEGER ) + 1 AS NVARCHAR(9))  "Code" FROM "APP_RE"."T_RE_H";
    ELSEIF :DocType = 'Contract' THEN
        SELECT CAST(CAST(IFNULL(MAX("DocNum"),'0')  AS INTEGER ) + 1 AS NVARCHAR(9))  "Code" FROM "APP_RE"."T_RE_H";
    END IF;
     
END