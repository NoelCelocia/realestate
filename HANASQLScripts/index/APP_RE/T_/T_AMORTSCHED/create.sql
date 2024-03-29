CREATE COLUMN TABLE "APP_RE"."T_AMORTSCHED" ("Code" NVARCHAR(50) NOT NULL , 
"LineNum" INTEGER CS_INT, 
"TranLineNum" INTEGER CS_INT,
"DocNum" INTEGER CS_INT, "DueDate" LONGDATE CS_LONGDATE, "Description" NVARCHAR(300), "TranType" NVARCHAR(20), "DueBreakdownAmt" DECIMAL(21,6) CS_FIXED, "DueAmt" DECIMAL(21,6) CS_FIXED, "DueBalance" DECIMAL(21,6) CS_FIXED, "Status" NVARCHAR(10), "CreatedDate" LONGDATE CS_LONGDATE, "CreatedBy" NVARCHAR(30), "UpdatedDate" LONGDATE CS_LONGDATE, "UpdatedBy" NVARCHAR(30), PRIMARY KEY ("Code")) UNLOAD PRIORITY 5  AUTO MERGE 