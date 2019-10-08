CREATE PROCEDURE "APP_RE"."SPAPP_RE_GETALLDATA_BYKEY" (IN tableName NVARCHAR(30), IN keyValue NVARCHAR(100), IN queryType NVARCHAR(50))
AS
BEGIN
    DECLARE str NVARCHAR(300);
    
    IF :queryType = 'QuoteGetHeader' THEN
        SELECT 
            a.* 
            , b."FirstName" || ' ' || b."MiddleName" || ' ' || b."LastName" "CustomerName"
        FROM "APP_RE"."T_RE_QUOTE_H" a 
            INNER JOIN "APP_RE"."M_CUSTOMER" b on a."CustomerCode" = b."CustomerCode"
        WHERE a."Code" = TO_NVARCHAR(:keyValue);
    ELSE
        str := 'SELECT * FROM "' || :tableName || '" WHERE "Code" = TO_NVARCHAR(''' || :keyValue || ''')';
        EXECUTE IMMEDIATE :str;
    END IF;
    
    
END