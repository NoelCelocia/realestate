CREATE COLUMN TABLE "APP_RE"."M_CUSTOMER_DOC" ("Code" NVARCHAR(50) NOT NULL , "CustomerCode" NVARCHAR(50) NOT NULL , "DocAttachmentCode" NVARCHAR(50), "DocFileName" NVARCHAR(50), "CreatedDate" DATE CS_DAYDATE, "CreatedBy" NVARCHAR(30), "UpdatedDate" DATE CS_DAYDATE, "UpdatedBy" NVARCHAR(30), PRIMARY KEY ("Code")) UNLOAD PRIORITY 5  AUTO MERGE 