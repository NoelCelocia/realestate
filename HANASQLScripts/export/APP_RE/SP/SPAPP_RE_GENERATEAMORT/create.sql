CREATE PROCEDURE "APP_RE"."SPAPP_RE_GENERATEAMORT" ( 
    IN keyValue NVARCHAR(100)
)
AS
BEGIN

    DECLARE counter INT;
    DECLARE counter2 INT;
    
    DECLARE countDP INT;
    DECLARE countTermsDP INT;
    DECLARE startDate DATE;
    DECLARE amount DECIMAL(21,6);
    
    DECLARE countRB INT;
    DECLARE countTermsRB INT;
    
    DECLARE countMF INT;
    DECLARE countTermsMF INT;
    
    SELECT COUNT(*) INTO countDP  
    FROM "APP_RE"."T_TERMS_QUOTE_DP" 
    WHERE "QuoteNum" = :keyValue and "LineNum" <> '1'
        ;
        
    SELECT COUNT(*) INTO countRB
    FROM "APP_RE"."T_TERMS_QUOTE_RB" 
    WHERE "QuoteNum" = :keyValue;
        
    SELECT COUNT(*) INTO countMF 
    FROM "APP_RE"."T_TERMS_QUOTE_MF" 
    WHERE "QuoteNum" = :keyValue;
    
    CREATE LOCAL TEMPORARY TABLE "#TEMPDP"
    as
    (
    SELECT  top 0 "Code", "QuoteNum", "StartDate", "Amount", "Interest"
        FROM "APP_RE"."T_TERMS_QUOTE_DP"
    );
    
    CREATE LOCAL TEMPORARY TABLE "#TEMPRB"
    as
    (
    SELECT  top 0 "Code", "QuoteNum", "StartDate", "Amount", "Interest"
        FROM "APP_RE"."T_TERMS_QUOTE_RB"
    );
    
    CREATE LOCAL TEMPORARY TABLE "#TEMPMF"
    as
    (
    SELECT  top 0 "Code", "QuoteNum", "StartDate", "Amount", "Interest"
        FROM "APP_RE"."T_TERMS_QUOTE_MF"
    );
    
    
    counter = 1;
    WHILE :counter <= :countDP DO
        SELECT "Terms"
        INTO countTermsDP
        FROM "APP_RE"."T_TERMS_QUOTE_DP" 
        WHERE "QuoteNum" = :keyValue
            and "LineNum" = :counter+1;
        
        counter2 = 1;
        WHILE :counter2 <= :countTermsDP DO
            INSERT INTO "#TEMPDP"
            SELECT "Code", "QuoteNum", ADD_MONTHS("StartDate", :counter2) "StartDate", "Amount" / "Terms" , "Terms"
            FROM "APP_RE"."T_TERMS_QUOTE_DP"
            WHERE "QuoteNum" = :keyValue and "LineNum" = :counter+1;
            
            counter2 = counter2 + 1;
        END WHILE;
        
        counter = counter + 1;
    END WHILE;
    ---------------------------------------------------------
    counter = 0;
    WHILE :counter <= :countRB DO
        SELECT "Terms"
        INTO countTermsRB
        FROM "APP_RE"."T_TERMS_QUOTE_RB" 
        WHERE "QuoteNum" = :keyValue
            and "LineNum" = :counter+1;
        
        counter2 = 1;
        WHILE :counter2 <= :countTermsRB DO
            INSERT INTO "#TEMPRB"
            SELECT "Code", "QuoteNum", ADD_MONTHS("StartDate", :counter2) "StartDate", "Amount" / "Terms" , "Interest"
            FROM "APP_RE"."T_TERMS_QUOTE_RB"
            WHERE "QuoteNum" = :keyValue and "LineNum" = :counter+1;
            
            counter2 = counter2 + 1;
        END WHILE;
        
        counter = counter + 1;
    END WHILE;
    ---------------------------------------------------------
    counter = 1;
    WHILE :counter <= :countMF DO
        SELECT "Terms", "StartDate", "Amount" 
        INTO countTermsDP, startDate, amount  
        FROM "APP_RE"."T_TERMS_QUOTE_MF" 
        WHERE "QuoteNum" = '1' 
            and "LineNum" = :counter+1;
        
        counter2 = 1;
        WHILE :counter2 <= :countTermsDP DO
            INSERT INTO "#TEMPMF"
            SELECT "Code", "QuoteNum", ADD_MONTHS("StartDate", :counter2) "StartDate", "Amount" / "Terms" , "Interest"
            FROM "APP_RE"."T_TERMS_QUOTE_MF"
            WHERE "QuoteNum" = :keyValue and "LineNum" = :counter+1;
            
            counter2 = counter2 + 1;
        END WHILE;
        
        counter = counter + 1;
    END WHILE;
    
    SELECT * FROM "#TEMPDP"
    UNION ALL
    SELECT * FROM "#TEMPRB"
    UNION ALL
    SELECT * FROM "#TEMPMF";
    
     
END