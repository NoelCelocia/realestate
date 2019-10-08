CREATE PROCEDURE "APP_RE"."SPAPP_RE_GENERATEPRICELIST" ( 

)

AS
BEGIN 
    DECLARE countPricelist NVARCHAR(20);
     
    SELECT LPAD(CASE WHEN COUNT(*) = 0 THEN 1 ELSE COUNT(*) + 1 END,5,'0' ) INTO countPricelist
    FROM "M_PRICELIST" ;    
    
    SELECT 'PL' || :countPricelist "Code" FROM DUMMY;
     
END