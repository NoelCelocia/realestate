CREATE COLUMN TABLE "APP_RE"."R_CUSTOM_LABEL" ("Code" NVARCHAR(50) NOT NULL , "UserDefined1" NVARCHAR(300), "UserDefined2" NVARCHAR(300), "UserDefined3" NVARCHAR(300), "UserDefined4" NVARCHAR(300), "UserDefined5" NVARCHAR(300), "CreatedDate" DATE CS_DAYDATE, "CreatedBy" NVARCHAR(30), "UpdatedDate" DATE CS_DAYDATE, "UpdatedBy" NVARCHAR(30), PRIMARY KEY ("Code")) UNLOAD PRIORITY 5  AUTO MERGE 