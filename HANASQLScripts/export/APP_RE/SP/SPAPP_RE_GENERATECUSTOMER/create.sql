CREATE PROCEDURE "APP_RE"."SPAPP_RE_GENERATECUSTOMER" ( 
    IN lastName NVARCHAR(100)
)
AS
BEGIN
    DECLARE str NVARCHAR(400);
    DECLARE countCustomer NVARCHAR(20);
     
    SELECT LPAD(CASE WHEN COUNT(*) = 0 THEN 1 ELSE COUNT(*) + 1 END,5,'0' ) INTO countCustomer
    FROM "M_CUSTOMER" 
    WHERE "LastName" LIKE LEFT(:lastName, 1) || '%';
    
    SELECT 'C' || UPPER(LEFT(:lastName, 1)) || :countCustomer "Code" FROM DUMMY;
     
END