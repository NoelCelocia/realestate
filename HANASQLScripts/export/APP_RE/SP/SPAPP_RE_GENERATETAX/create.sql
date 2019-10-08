CREATE PROCEDURE "APP_RE"."SPAPP_RE_GENERATETAX" ( 

)

AS
BEGIN 
    DECLARE countTax NVARCHAR(20);
     
    SELECT LPAD(CASE WHEN COUNT(*) = 0 THEN 1 ELSE COUNT(*) + 1 END,5,'0' ) INTO countTax
    FROM "M_TAX_MATRIX" ;    
    
    SELECT 'T' || :countTax "Code" FROM DUMMY;
     
END