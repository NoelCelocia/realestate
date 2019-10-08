CREATE COLUMN TABLE "APP_RE"."T_RE_PRICE_D" ("Code" NVARCHAR(50) NOT NULL , "QuoteNum" NVARCHAR(10), "ReserveNum" NVARCHAR(10), "DocNum" NVARCHAR(10), "PriceTotal" DECIMAL(21,6) CS_FIXED, "DiscPercentBVat" DECIMAL(21,6) CS_FIXED, "DiscAmountBVat" DECIMAL(21,6) CS_FIXED, "TaxMatrixCode" NVARCHAR(5), "TaxAmount" DECIMAL(21,6) CS_FIXED, "DiscPercentAVat" DECIMAL(21,6) CS_FIXED, "DiscAmountAVat" DECIMAL(21,6) CS_FIXED, "GrossPrice" DECIMAL(21,6) CS_FIXED, "EWTRate" DECIMAL(21,6) CS_FIXED, "RsvFee" DECIMAL(21,6) CS_FIXED, "DPPercent" DECIMAL(21,6) CS_FIXED, "DPAmount" DECIMAL(21,6) CS_FIXED, "RBPercent" DECIMAL(21,6) CS_FIXED, "RBAmount" DECIMAL(21,6) CS_FIXED, "MFPercent" DECIMAL(21,6) CS_FIXED, "MFAmount" DECIMAL(21,6) CS_FIXED, "CreatedDate" LONGDATE CS_LONGDATE, "CreatedBy" NVARCHAR(30), "UpdatedDate" LONGDATE CS_LONGDATE, "UpdatedBy" NVARCHAR(30), PRIMARY KEY ("Code")) UNLOAD PRIORITY 5  AUTO MERGE 