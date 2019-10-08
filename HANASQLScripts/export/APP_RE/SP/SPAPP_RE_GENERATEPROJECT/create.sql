CREATE PROCEDURE "APP_RE"."SPAPP_RE_GENERATEPROJECT" ( 

)

AS
BEGIN 
    DECLARE countProject NVARCHAR(20);
     
    SELECT (CASE WHEN COUNT(*) = 0 THEN 1 ELSE COUNT(*) + 1 END ) INTO countProject
    FROM "M_PROJECT" ;    
    
    SELECT :countProject "Code" FROM DUMMY;
     
END