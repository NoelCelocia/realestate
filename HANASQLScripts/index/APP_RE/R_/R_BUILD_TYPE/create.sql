CREATE COLUMN TABLE "APP_RE"."R_BUILD_TYPE" ("Code" NVARCHAR(50) NOT NULL , "Desc" NVARCHAR(50), "OtherDesc" NVARCHAR(50), "IsActive" NVARCHAR(5), "Remarks" NVARCHAR(500), "CreatedDate" LONGDATE CS_LONGDATE, "CreatedBy" NVARCHAR(30), "UpdatedDate" LONGDATE CS_LONGDATE, "UpdatedBy" NVARCHAR(30), PRIMARY KEY ("Code")) UNLOAD PRIORITY 5  AUTO MERGE 