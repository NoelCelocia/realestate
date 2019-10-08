CREATE PROCEDURE "APP_RE"."SPAPP_RE_FRAGMENTTABLE" ( IN fragmentTag NVARCHAR(200))
AS
BEGIN 

    IF :fragmentTag = 'ChooseUnit' THEN
        select a."Code"
        ,   a."UnitCode"
        ,   a."UnitDesc"
        ,   b."Desc"
        ,   a."LotArea"
        ,   IFNULL(c."SellingPrice", 0) "Price"

        FROM "APP_RE"."M_UNIT" a
            LEFT JOIN "APP_RE"."R_UNIT_STATUS" b on a."UnitStatus" = b."Code"
            INNER JOIN "APP_RE"."M_PRICELIST" c on c."UnitCode" = a."UnitCode" and c."PricelistCode" = '1';
    END IF;

END