CREATE COLUMN TABLE "APP_RE"."M_PRICELIST" ("Code" NVARCHAR(50) NOT NULL , "PricelistCode" NVARCHAR(30) NOT NULL , "PricelistDesc" NVARCHAR(75), "UnitCode" NVARCHAR(50), "SellingPrice" DECIMAL(21,6) CS_FIXED, "ValidDateFrom" LONGDATE CS_LONGDATE, "ValidDateTo" LONGDATE CS_LONGDATE, "CreatedDate" LONGDATE CS_LONGDATE, "CreatedBy" NVARCHAR(30), "UpdatedDate" LONGDATE CS_LONGDATE, "UpdatedBy" NVARCHAR(30), PRIMARY KEY ("Code")) UNLOAD PRIORITY 5  AUTO MERGE 