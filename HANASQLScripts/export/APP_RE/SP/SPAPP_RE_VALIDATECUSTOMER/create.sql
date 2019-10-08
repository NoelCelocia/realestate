CREATE PROCEDURE "APP_RE"."SPAPP_RE_VALIDATECUSTOMER" (IN firstName NVARCHAR(100), 
    IN middleName NVARCHAR(100),
    IN lastName NVARCHAR(100),
    IN emailAdd NVARCHAR(100),
    IN presentAddress NVARCHAR(300),
    IN tinNumber NVARCHAR(100),
    IN mobileNumber NVARCHAR(100)
)
AS
BEGIN
    DECLARE str NVARCHAR(400);
    
    str := 'SELECT COUNT(*) "COUNT" FROM "M_CUSTOMER" " + 
        "WHERE UPPER("FirstName") = UPPER('''|| :firstName ||''') AND UPPER("LastName")= UPPER(''' || :lastName || ''') ';
    
    EXECUTE IMMEDIATE :str;
END