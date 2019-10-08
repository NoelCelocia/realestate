CREATE PROCEDURE "APP_RE"."SPAPP_RE_VIEWTABLE" ( IN tableName NVARCHAR(200) ,IN parameterCode NVARCHAR(50))
AS
BEGIN 
     IF :tableName = 'M_PROJECT' THEN
        SELECT "Code"
        ,IFNULL("ProjectCode",'') "ProjectCode"
        ,IFNULL("ProjectDesc",'') "ProjectDesc"
        ,IFNULL("ProjArea",'') "ProjArea"
        ,IFNULL("ProjLocation",'') "ProjLocation"
        ,IFNULL("IsActive",'') "IsActive"
        FROM "APP_RE"."M_PROJECT"
        ORDER BY "CreatedDate";
    END IF;

    IF :tableName = 'M_CUSTOMER' THEN
        SELECT "Code"
        , "CustomerCode"
        , "FirstName" || ' ' || "MiddleName" || ' ' || "LastName" "Name"
        , IFNULL("MobileNo",'') "MobileNo"
        , IFNULL("Email",'') "Email"
        , IFNULL("CreatedDate" , '') "CreatedDate"
        FROM "APP_RE"."M_CUSTOMER"
        ORDER BY "CreatedDate";
        
    END IF;
    
   
    
    IF :tableName = 'M_UNIT' THEN
        SELECT a."Code"
        , IFNULL(a."UnitCode", '') "UnitCode"
        , IFNULL(a."UnitDesc", '') "UnitDesc"
        , IFNULL(b."Desc", '') "Desc"
        , IFNULL(c."ProjectDesc", '') "ProjectDesc"
        , IFNULL(a."FloorArea", '') "FloorArea"
        FROM "APP_RE"."M_UNIT" a 
            LEFT JOIN "APP_RE"."R_UNIT_STATUS" b on a."UnitStatus" = b."Code"
            LEFT JOIN "APP_RE"."M_PROJECT" c on c."ProjectCode" = a."ProjectCode";
    END IF;
    
    IF :tableName = 'M_PRICELIST' THEN
        SELECT 1 "PricelistDesc"
        , 2 "UnitCode"
        , 3 "SellingPrice"
        , 4 "ValidDateFrom"
        , 5 "ValidDateTo"
        FROM APP_RE."M_PRICELIST";
    END IF;
    
    IF :tableName = 'M_TAX_MATRIX' THEN
        SELECT 
        a."Code"
        , a."TaxCode"
        , a."TaxDesc"
        , b."Desc"
        , a."AmountLimitFrom"
        , a."AmountLimitTo"
        , a."Rate"
        FROM "APP_RE"."M_TAX_MATRIX" a
        LEFT JOIN "APP_RE"."R_BUILD_TYPE" b on b."Code" = a."BuildTypeCode";
    END IF;
    
    
    IF :tableName = 'T_RE_H' THEN
        SELECT "Code"
        , "DocNum"
        , "DocStatus"
        , "CustomerCode"
        , "RsvDate"
        , "CreatedDate"
        , "RunningBalance"
        FROM "APP_RE"."T_RE_H";
    END IF;
    
    IF :tableName = 'T_RE_D' THEN
        SELECT 
        a."Code",
        a."DocNum",
        a."UnitCode",
        IFNULL(b."UnitDesc", '') "UnitDesc",
        IFNULL(a."ProjectCode",'') "ProjectCode",
        IFNULL(c."ProjectDesc",'') "ProjectDesc",
        IFNULL(a."Price",0) "Price",
        IFNULL(b."FloorArea",'') "FloorArea"
        FROM "APP_RE"."T_RE_D" a
        LEFT JOIN "APP_RE"."M_UNIT" b on a."UnitCode" = b."UnitCode"
        LEFT JOIN "APP_RE"."M_PROJECT" c on a."ProjectCode" = c."ProjectCode"
        WHERE a."DocNum" = :parameterCode;
    END IF;
    
    
    
END