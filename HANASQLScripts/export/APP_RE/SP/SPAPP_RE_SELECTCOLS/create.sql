CREATE PROCEDURE "APP_RE"."SPAPP_RE_SELECTCOLS" ( IN tableName NVARCHAR(200),  IN selectColumns NVARCHAR(200))
AS
BEGIN 
    DECLARE str NVARCHAR(800);
    str := 'SELECT "' || REPLACE(:selectColumns, ',', '","') || '" FROM "APP_RE"."' || tableName || '" ; ';
    
    EXECUTE IMMEDIATE :str;
     
END