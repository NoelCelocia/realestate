CREATE PROCEDURE "APP_RE"."SPAPP_RE_GENERATEUNIT" ( 
    IN lotNumber NVARCHAR(100),
    IN phaseNumber NVARCHAR(100),
    IN blockNumber NVARCHAR(100),
    IN projNumber NVARCHAR(100)
)
AS
BEGIN
    DECLARE cntDuplicate INTEGER;
    
    SELECT COUNT(*) INTO cntDuplicate 
    FROM "M_UNIT" 
    WHERE UPPER("UnitCode") = UPPER(:projNumber || :blockNumber || :phaseNumber || :lotNumber);
    
    IF :cntDuplicate = 0 THEN
        SELECT UPPER(:projNumber || :blockNumber || :phaseNumber || :lotNumber) "Code" FROM DUMMY;
    ELSE
        SELECT '0' "Code"  FROM DUMMY;
    END IF;
     
END