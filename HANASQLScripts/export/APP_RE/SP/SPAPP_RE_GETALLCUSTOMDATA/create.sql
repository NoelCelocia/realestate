CREATE PROCEDURE "APP_RE"."SPAPP_RE_GETALLCUSTOMDATA" ( IN selectName NVARCHAR(200))
AS
BEGIN 
    
    IF :selectName = 'GETREHEADER' THEN
        SELECT a."Code"
        , a."DocNum"
        , a."CustomerCode"
        , c."FirstName" || ' ' || c."MiddleName" || ' ' || c."LastName" "Name"
        , d."UnitCodes"
        , b."Desc" "DocStatus"
        FROM "T_RE_H" a 
            LEFT JOIN "R_DOC_STATUS" b on a."DocStatus" = b."Code" 
            LEFT JOIN "M_CUSTOMER" c on c."CustomerCode" = a."CustomerCode"
            LEFT JOIN (SELECT "DocNum", STRING_AGG("UnitCode", ',')  "UnitCodes"
                       FROM "T_RE_D"
                       GROUP BY "DocNum") d on d."DocNum" = a."DocNum";                       
    END IF; 
     
END