CREATE PROCEDURE "APP_RE"."SPAPP_RE_QUOTATION" (
    IN queryType NVARCHAR(30), IN colValue NVARCHAR(50), colValue2 NVARCHAR(50)
)
AS
BEGIN

    IF :queryType = 'GET_TABLEVIEW' THEN
        SELECT a."Code"
        , a."QuoteNum"
        , a."CustomerCode"
        , b."FirstName" || ' ' || b."MiddleName" || ' ' || b."LastName" as "Name"
        , c."NetPrice"
        , a."CreatedDate"
        FROM "APP_RE"."T_RE_QUOTE_H" a
            INNER JOIN "APP_RE"."M_CUSTOMER" b on a."CustomerCode" = b."CustomerCode"
            INNER JOIN "APP_RE"."T_RE_QUOTE_PRICE_D" c on c."QuoteNum" = a."QuoteNum";
            
    ELSEIF :queryType = 'GET_TABLEVIEWDETAILS' THEN
        SELECT 
        a."Code",
        a."QuoteNum",
        a."UnitCode",
        IFNULL(b."UnitDesc", '') "UnitDesc",
        IFNULL(a."ProjectCode",'') "ProjectCode",
        IFNULL(c."ProjectDesc",'') "ProjectDesc",
        IFNULL(a."Price",0) "Price",
        IFNULL(b."FloorArea",'') "FloorArea"
        FROM "APP_RE"."T_RE_QUOTE_D" a
        LEFT JOIN "APP_RE"."M_UNIT" b on a."UnitCode" = b."UnitCode"
        LEFT JOIN "APP_RE"."M_PROJECT" c on a."ProjectCode" = c."ProjectCode"
        WHERE a."QuoteNum" = :colValue; 
        
    END IF;


    
    
END