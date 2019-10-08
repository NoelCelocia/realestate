CREATE PROCEDURE "APP_RE"."SPAPP_RE_GETTILEDATA" ( 
)

AS
BEGIN 
    
    --SELECT 'X' "TILE" FROM DUMMY;
    SELECT 
        (SELECT COUNT(*) FROM "M_CUSTOMER") "Customers",
        (SELECT COUNT(*) FROM "M_UNIT") "Units",
        (SELECT COUNT(*) FROM "M_PROJECT") "Projects",
        (SELECT COUNT(*) FROM "M_PRICELIST") "Pricelist",
        (SELECT COUNT(*) FROM "M_TAX_MATRIX") "Tax",
        (SELECT COUNT(*) FROM "M_USER") "User"
    FROM DUMMY;
    
    
END