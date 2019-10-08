CREATE PROCEDURE "APP_RE"."SPAPP_RE_GETALLDATA" (IN tableName NVARCHAR(30))
AS
BEGIN
    DECLARE str NVARCHAR(300);
    
    str := 'SELECT * FROM "' || :tableName || '"';
    
    EXECUTE IMMEDIATE :str;
END