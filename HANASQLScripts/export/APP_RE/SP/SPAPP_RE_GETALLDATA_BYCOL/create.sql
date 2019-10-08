CREATE PROCEDURE "APP_RE"."SPAPP_RE_GETALLDATA_BYCOL" (IN tableName NVARCHAR(30), IN colName NVARCHAR(50), IN colValue NVARCHAR(100), IN queryType NVARCHAR(50))
AS
BEGIN
    DECLARE str NVARCHAR(300);
    
    
    IF :queryType = 'QuoteGetExistingUnits' THEN
            SELECT "Code"
            , "QuoteNum"
            FROM "APP_RE"."T_RE_QUOTE_D"
            WHERE "QuoteNum" = :colValue;
            
    ELSEIF :queryType = 'QuoteGetExistingTermsDP' THEN
            SELECT "Code"
            , "QuoteNum"
            FROM "APP_RE"."T_TERMS_QUOTE_DP"
            WHERE "QuoteNum" = :colValue;
    
    ELSEIF :queryType = 'QuoteGetExistingTermsRB' THEN
            SELECT "Code"
            , "QuoteNum"
            FROM "APP_RE"."T_TERMS_QUOTE_RB"
            WHERE "QuoteNum" = :colValue;
    
    ELSEIF :queryType = 'QuoteGetExistingTermsMF' THEN
            SELECT "Code"
            , "QuoteNum"
            FROM "APP_RE"."T_TERMS_QUOTE_MF"
            WHERE "QuoteNum" = :colValue;
            
    ELSEIF :queryType = 'QuoteGetTerms' THEN
            SELECT "Code"
            , "QuoteNum"
            , "LineNum"
            , "TranType" || '' "SelectedTranType"
            , "Amount"
            , "Percent"
            , "Interest"
            , "Terms"
            , "StartDate"
            , "FinanceScheme"
            , "OldDocNum"
            , "Remarks"
            FROM "APP_RE"."T_TERMS_QUOTE_DP"
            WHERE "QuoteNum" = :colValue
            UNION ALL
            SELECT "Code"
            , "QuoteNum"
            , "LineNum"
            , '3' || '' "SelectedTranType"
            , "Amount"
            , "Percent"
            , "Interest"
            , "Terms"
            , "StartDate"
            , "FinanceScheme"
            , "OldDocNum"
            , "Remarks"
            FROM "APP_RE"."T_TERMS_QUOTE_RB"
            WHERE "QuoteNum" = :colValue
            UNION ALL
            SELECT "Code"
            , "QuoteNum"
            , "LineNum"
            , '4' || '' "SelectedTranType"
            , "Amount"
            , "Percent"
            , "Interest"
            , "Terms"
            , "StartDate"
            , "FinanceScheme"
            , "OldDocNum"
            , "Remarks"
            FROM "APP_RE"."T_TERMS_QUOTE_MF"
            WHERE "QuoteNum" = :colValue;
    
    ELSEIF :queryType = 'QuoteGetPrice' THEN
            SELECT a.* , b."Rate" "_TaxRate"
            FROM "APP_RE"."T_RE_QUOTE_PRICE_D" a
            INNER JOIN "APP_RE"."M_TAX_MATRIX" b on b."TaxCode" = a."TaxMatrixCode"
            WHERE TO_NVARCHAR("QuoteNum") = TO_NVARCHAR(:colValue);
        
    ELSEIF :queryType = 'QuoteGetUnit' THEN
            SELECT 
                a.* 
                , b."UnitDesc"
                , b."LotArea"
            FROM "APP_RE"."T_RE_QUOTE_D" a 
                INNER JOIN "APP_RE"."M_UNIT" b on a."UnitCode" = b."UnitCode"
            WHERE TO_NVARCHAR("QuoteNum") = TO_NVARCHAR(:colValue);
        
    ELSEIF :queryType = 'QuoteGetHeader' THEN
            SELECT 
                a.* 
            FROM "APP_RE"."T_RE_QUOTE_H" a 
                INNER JOIN "APP_RE"."M_CUSTOMER" b on a."CustomerCode" = b."CustomerCode"
            WHERE TO_NVARCHAR(:colName) = TO_NVARCHAR(:colValue);
        
    ELSE
            str := 'SELECT * FROM "' || :tableName || '" WHERE TO_NVARCHAR("' || :colName || '") = TO_NVARCHAR(''' || :colValue || ''')';
            EXECUTE IMMEDIATE :str;
        
    END IF;
    
    
END