CREATE PROCEDURE "APP_RE"."SPAPP_RE_GENERATEAMORT" ( 
    IN keyValue NVARCHAR(100)
)
AS
BEGIN

    DECLARE counter INT;
    DECLARE counter2 INT;
    DECLARE counter3 INT;
    
    DECLARE countDP INT;
    DECLARE countTermsDP INT;
    DECLARE startDate DATE;
    DECLARE amount DECIMAL(21,6);
    
    DECLARE countRB INT;
    DECLARE countTermsRB INT;
    
    DECLARE countMF INT;
    DECLARE countTermsMF INT;
    
    
    DECLARE dpRemainingBalance DECIMAL(21,6);
    DECLARE rbRemainingBalance DECIMAL(21,6);
    DECLARE mfRemainingBalance DECIMAL(21,6);
    DECLARE interestDP DECIMAL(21,6);
    DECLARE interestRB DECIMAL(21,6);
    DECLARE interestMF DECIMAL(21,6);
    
    
    DECLARE monthsToPay DECIMAL(21,6);
    
    DECLARE annualizedInt DECIMAL(16,9);
    DECLARE amortFactor DECIMAL(17,10);
    DECLARE amortValue DECIMAL(16,9);
    DECLARE mfRunningBal DECIMAL(16,9);
    DECLARE currInterest DECIMAL(16,9);
    DECLARE dpAmount DECIMAL(16,9);
    DECLARE rbAmount DECIMAL(16,9);
    DECLARE mfAmount DECIMAL(16,9);
    
    
    SELECT SUM("Terms")
    INTO monthsToPay
    FROM (
        SELECT SUM("Terms") "Terms" FROM "APP_RE"."T_TERMS_QUOTE_DP"
        WHERE "IsActive" IS NULL and "QuoteNum" = :keyValue and "TranType" <> 1
        UNION ALL
        SELECT SUM("Terms") "Terms" FROM "APP_RE"."T_TERMS_QUOTE_RB"
        WHERE "IsActive" IS NULL and "QuoteNum" = :keyValue
        UNION ALL
        SELECT SUM("Terms") "Terms" FROM "APP_RE"."T_TERMS_QUOTE_MF"
        WHERE "IsActive" IS NULL and "QuoteNum" = :keyValue
    );
    
    select 
    TO_DECIMAL("DPNetAmount", 16,10) "DP", TO_DECIMAL("RBAmount", 16,10) "RB", TO_DECIMAL("MFAmount", 16,10) "MF"
    INTO dpRemainingBalance, rbRemainingBalance, mfRemainingBalance
    FROM "APP_RE"."T_RE_QUOTE_PRICE_D"
    WHERE "QuoteNum" = :keyValue;
    
    SELECT COUNT(*) INTO countDP  
    FROM "APP_RE"."T_TERMS_QUOTE_DP" 
    WHERE "QuoteNum" = :keyValue and "TranType" = '2' and "IsActive" IS NULL;
        
    SELECT COUNT(*) INTO countRB
    FROM "APP_RE"."T_TERMS_QUOTE_RB" 
    WHERE "QuoteNum" = :keyValue and "IsActive" IS NULL;
        
    SELECT COUNT(*) INTO countMF 
    FROM "APP_RE"."T_TERMS_QUOTE_MF" 
    WHERE "QuoteNum" = :keyValue and "IsActive" IS NULL;
    
    
    CREATE LOCAL TEMPORARY TABLE "#TEMPDP"
    as
    (
    SELECT  top 0 '123123123123123.00001' "Code", "QuoteNum"
    , 'DOWNPAYMENT 999999' "Description"
    ,  "StartDate"
    , 124234243.00000000001 "Amount"
    , 124234243.00000000001 "Interest"
    , 124234243.00000000001 "InterestRate"
    , 124234243.00000000001 "Principal"
    ,  124234243.00000000001 "Running Balance"
        FROM "APP_RE"."T_TERMS_QUOTE_DP"
    );
    CREATE LOCAL TEMPORARY TABLE "#TEMPRB"
    as
    (
    SELECT  top 0 '123123123123123.00001' "Code", "QuoteNum"
    , 'INSTALLMENT 999999' "Description"
    ,  "StartDate"
    , 124234243.00000000001 "Amount"
    , 124234243.00000000001 "Interest"
    , 124234243.00000000001 "InterestRate"
    , 124234243.00000000001 "Principal"
    ,  124234243.00000000001 "Running Balance"
    FROM "APP_RE"."T_TERMS_QUOTE_RB"
    );
    CREATE LOCAL TEMPORARY TABLE "#TEMPMF"
    as
    (
    SELECT  top 0 '123123123123123.00001' "Code", "QuoteNum"
    , 'INSTALLMENT 999999' "Description"
    ,  "StartDate"
    , 124234243.00000000001 "Amount"
    , 124234243.00000000001 "Interest"
    , 124234243.00000000001 "InterestRate"
    , 124234243.00000000001 "Principal"
    ,  124234243.00000000001 "Running Balance"
        FROM "APP_RE"."T_TERMS_QUOTE_MF"
    );
    
    
    counter = 0;
    counter3 = 0;
    WHILE :counter < :countDP DO
    
        counter3 = counter3 + 1;    
        
        SELECT "Terms", "Interest", "Amount"
        INTO countTermsDP, interestDP, dpAmount
        FROM (
        SELECT "Terms", "Interest", "Amount",
            ROW_NUMBER() OVER (ORDER BY "Terms" DESC) "rown"
        FROM "APP_RE"."T_TERMS_QUOTE_DP" 
        WHERE "QuoteNum" = :keyValue
            and "TranType" = '2'
        ) a 
        WHERE a."rown" = :counter+1;
        
        annualizedInt = (interestDP/100) / 12.0;
    
        SELECT CASE WHEN (1 - POWER((1+ :annualizedInt), (:countTermsDP*-1))) = 0 THEN 0 ELSE :annualizedInt /  (1 - POWER((1+ :annualizedInt), (:countTermsRB*-1))) END
        INTO amortFactor
        FROM DUMMY;
        
        amortValue = dpAmount * amortFactor;
        SELECT CASE WHEN (:amortFactor = 0) THEN dpAmount / countTermsDP ELSE dpAmount * amortFactor END
        INTO amortValue
        FROM DUMMY;
        
        counter2 = 1;
        WHILE :counter2 <= :countTermsDP DO
            
            currInterest = dpAmount * annualizedInt;
            
            INSERT INTO "#TEMPDP"
            SELECT 
                (SELECT "APP_RE"."FNAPP_RE_GENERATECODE"() FROM DUMMY) "Code"
                , a."QuoteNum"
                , 'Downpayment ' || counter3 "Description"
                , ADD_MONTHS("StartDate", :counter2) "StartDate"
                , amortValue
                , currInterest
                , b."Interest"
                , amortValue - currInterest 
                , dpRemainingBalance - (amortValue - currInterest)
            FROM (
                SELECT "Code"
                ,"QuoteNum"
                , ROW_NUMBER() OVER (ORDER BY "Terms" DESC) "rown"
                FROM "APP_RE"."T_TERMS_QUOTE_DP" 
                WHERE "QuoteNum" = :keyValue
                    and "TranType" = '2'
            ) a 
            INNER JOIN "APP_RE"."T_TERMS_QUOTE_DP" b on a."Code" = b."Code"
            WHERE a."rown" = :counter+1;
            
            
            counter2 = counter2 + 1;
            counter3 = counter3 + 1;
            
            dpRemainingBalance = dpRemainingBalance - (amortValue - currInterest);
            dpAmount = dpAmount - (amortValue - currInterest);
        END WHILE;
        
        counter3 = counter3 - 1;
        counter = counter + 1;
    END WHILE;
    
    ------------------------------------------------------------
    counter = 0;
    counter3 = 0;
    WHILE :counter < :countRB DO
    
        counter3 = counter3 + 1;    
        
        SELECT "Terms", "Interest", "Amount"
        INTO countTermsRB, interestRB, rbAmount
        FROM "APP_RE"."T_TERMS_QUOTE_RB" 
        WHERE "QuoteNum" = :keyValue
            and "LineNum" = :counter+1;
        
        annualizedInt = (interestRB/100) / 12.0;
        
        SELECT CASE WHEN (1 - POWER((1+ :annualizedInt), (:countTermsRB*-1))) = 0 THEN 0 ELSE :annualizedInt /  (1 - POWER((1+ :annualizedInt), (:countTermsRB*-1))) END
        INTO amortFactor
        FROM DUMMY;
        
        amortValue = rbAmount * amortFactor;
        SELECT CASE WHEN (:amortFactor = 0) THEN rbAmount / countTermsRB ELSE rbAmount * amortFactor END
        INTO amortValue
        FROM DUMMY;
        
        counter2 = 1;
        WHILE :counter2 <= :countTermsRB DO
            
            currInterest = rbAmount * annualizedInt;
            
            INSERT INTO "#TEMPRB"
            SELECT
            (SELECT "APP_RE"."FNAPP_RE_GENERATECODE"() FROM DUMMY) "Code"
            , "QuoteNum"
            , 'Installment ' || counter3 "Description"
            ,  ADD_MONTHS("StartDate", :counter2) "StartDate"
            , amortValue --monthlyDue
            ,  currInterest  --interestAmount
            , "Interest" --interestRate
            , amortValue - currInterest --principal
            , rbRemainingBalance - (amortValue - currInterest) --runningBalance2
            FROM "APP_RE"."T_TERMS_QUOTE_RB"
            WHERE "QuoteNum" = :keyValue and "LineNum" = :counter+1;
            
            counter2 = counter2 + 1;
            counter3 = counter3 + 1;
            
            rbRemainingBalance = rbRemainingBalance - (amortValue - currInterest);
            rbAmount = rbAmount - (amortValue - currInterest);
        END WHILE;
        
        counter3 = counter3 - 1;
        counter = counter + 1;
    END WHILE;
    ---------------------------------------------------------------
    counter = 0;
    counter3 = 0;
    WHILE :counter < :countMF DO
    
        counter3 = counter3 + 1;    
        
        SELECT "Terms", "Interest", "Amount"
        INTO countTermsMF, interestMF, mfAmount
        FROM "APP_RE"."T_TERMS_QUOTE_MF" 
        WHERE "QuoteNum" = :keyValue
            and "LineNum" = :counter+1;
        
        annualizedInt = (interestMF/100) / 12.0;
        
        SELECT CASE WHEN (1 - POWER((1+ :annualizedInt), (:countTermsMF*-1))) = 0 THEN 0 ELSE :annualizedInt /  (1 - POWER((1+ :annualizedInt), (:countTermsMF*-1))) END
        INTO amortFactor
        FROM DUMMY;
        
        amortValue = mfAmount * amortFactor;
        SELECT CASE WHEN (:amortFactor = 0) THEN mfAmount / countTermsMF ELSE mfAmount * amortFactor END
        INTO amortValue
        FROM DUMMY;
        
        counter2 = 1;
        WHILE :counter2 <= :countTermsMF DO
            
            currInterest = mfAmount * annualizedInt;
            
            INSERT INTO "#TEMPMF"
            SELECT 
            (SELECT "APP_RE"."FNAPP_RE_GENERATECODE"() FROM DUMMY) "Code"
            , "QuoteNum"
            , 'Misc Fee ' || counter3 "Description"
            ,  ADD_MONTHS("StartDate", :counter2) "StartDate"
            , amortValue --monthlyDue
            ,  currInterest  --interestAmount
            , "Interest" --interestRate
            , amortValue - currInterest --principal
            , mfRemainingBalance - (amortValue - currInterest) --runningBalance2
            FROM "APP_RE"."T_TERMS_QUOTE_MF"
            WHERE "QuoteNum" = :keyValue and "LineNum" = :counter+1;
            
            counter2 = counter2 + 1;
            counter3 = counter3 + 1;
            
            mfRemainingBalance = mfRemainingBalance - (amortValue - currInterest);
            mfAmount = mfAmount - (amortValue - currInterest);
        END WHILE;
        
        counter3 = counter3 - 1;
        counter = counter + 1;
    END WHILE;
    
    
    -- ---------------------------------------------------------
    SELECT
        "Code", "QuoteNum"
        ,'Reservation Fee' "Description"
        , TO_DATE("StartDate") "StartDate"
        , TO_DECIMAL("Amount", 16,2) "Amount"
        ,0 "Interest"
        , 0"InterestRate"
        ,TO_DECIMAL("Amount", 16,2) "Principal"
        ,0 "Running Balance"
    FROM "APP_RE"."T_TERMS_QUOTE_DP"
    WHERE "TranType" = '1' and "QuoteNum" = :keyValue
    
    UNION ALL
    
     SELECT 
         "Code", "QuoteNum"
        ,"Description"
        , TO_DATE("StartDate") "StartDate"
        ,TO_DECIMAL("Amount", 16,2) "Amount"
        ,TO_DECIMAL("Interest", 16,2) "Interest"
        ,"InterestRate"
        ,TO_DECIMAL("Principal", 16,2) "Principal"
        ,TO_DECIMAL("Running Balance", 16,2) "Running Balance"
     FROM "#TEMPDP"
     UNION ALL
     SELECT 
          "Code", "QuoteNum"
        ,"Description"
        , TO_DATE("StartDate") "StartDate"
        ,TO_DECIMAL("Amount", 16,2) "Amount"
        ,TO_DECIMAL("Interest", 16,2) "Interest"
        ,"InterestRate"
        ,TO_DECIMAL("Principal", 16,2) "Principal"
        ,TO_DECIMAL("Running Balance", 16,2) "Running Balance"
    FROM "#TEMPRB"
    UNION ALL
     SELECT  "Code", "QuoteNum"
        ,"Description"
        , TO_DATE("StartDate") "StartDate"
        ,TO_DECIMAL("Amount", 16,2) "Amount"
        ,TO_DECIMAL("Interest", 16,2) "Interest"
        ,"InterestRate"
        ,TO_DECIMAL("Principal", 16,2) "Principal"
        ,TO_DECIMAL("Running Balance", 16,2) "Running Balance"
    FROM "#TEMPMF";
    
     
END