sap.ui.define([
	"sap/m/MessageBox"
], function (MessageBox) {
	"use strict";
	return ("com.apptech.realestate.controller.AppUI5", {

		/*
		Guide on improving Apptech JS library:
		1. Make sure that all functions are independent to the your app. Always use method parameters to get necessary data.
		2. Always return a value; and don't interact with the calling js.
		*/
		/*
		Generic function helper to create table.
		@@ params : Table Name
					Table Description
					Table Type  - ("bott_Document","bott_DocumentLines",
									"bott_MasterData","bott_MasterDataLines",
									"bott_NoObject","bott_NoObjectAutoIncrement")
		*/
		createTable: function (sTableName, sDescription, sTableType) {
			var tableInfo = {};
			tableInfo.TableName = sTableName;
			tableInfo.TableDescription = sDescription;
			tableInfo.TableType = sTableType;

			var stringTableInfo = JSON.stringify(tableInfo);
			$.ajax({
				url: "/destinations/APP_SL/b1s/v1/UserTablesMD",
				data: stringTableInfo,
				type: "POST",
				async: false,
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					return error;
				},
				success: function (json) {
					return 0;
				},
				context: this
			});

		},

		/*
		Generic function helper to create field.
		@@ params : Field Name
					Field Description
					Table Name - ex. "@APP_OAMS"
					Field Type - ("db_Alpha", "db_Date","db_Float","db_Memo","db_Numeric")
					Field SubType - ("st_Percentage", "st_Price", "st_Quantity", "st_Rate", "st_Sum", "st_Image")
					Character Size 
		*/
		createField: function (sFieldName, sDescription, sTableName, sType, sSubType, iSize) {
			var oFieldInfo = {};
			if (sFieldName === undefined || sDescription === undefined || sTableName === undefined) {
				return -1;
			}

			oFieldInfo.Description = sDescription;
			oFieldInfo.Name = sFieldName;
			oFieldInfo.TableName = sTableName;
			oFieldInfo.Type = sType;

			if (iSize === undefined || sType === "db_Numeric") {
				iSize = 11;
			}

			oFieldInfo.EditSize = iSize;
			oFieldInfo.Size = iSize;

			if (sType === "db_Float" || (!sSubType === undefined)) {
				oFieldInfo.SubType = sSubType;
			}

			var dataString = JSON.stringify(oFieldInfo);

			$.ajax({
				url: "/destinations/APP_SL/b1s/v1/UserFieldsMD",
				data: dataString,
				type: "POST",
				async: false,
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					return error;
				},
				success: function (json) {

					return 0;
				},
				context: this
			});

			return -1;

		},

		createMandatoryFields: function (sTableName) {
			// createField()
			this.createField("App_CreatedDate", "Created Date", sTableName, "db_Date", undefined, undefined);
			this.createField("App_CreatedBy", "Created By", sTableName, "db_Alpha", undefined, undefined);
			this.createField("App_UpdatedDate", "Updated Date", sTableName, "db_Date", undefined, undefined);
			this.createField("App_UpdatedBy", "Created By", sTableName, "db_Alpha", undefined, undefined);
			/*
			U_App_CreatedDate
			U_App_CreatedBy
			U_App_UpdatedDate
			U_App_UpdatedBy
			*/
		},

		generateUDTCode: function () {

			var generatedCode = "";

			$.ajax({
				url: "/rexsjs/public/rexsjs/ExecQuery.xsjs?dbName=APP_RE&procName=SPAPP_RE_GETCODE", //https:<server>/b1s/v1/Login
				type: "GET",
				async: false,
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					jQuery.sap.log.error("This should never have happened!");
				},
				success: function (json) {
					generatedCode = json[0][""];

				},
				context: this
			}).done(function (results) {
				if (results) {
					generatedCode = results[0][""];

				}
			});

			return generatedCode;

		},

		generateDocNum: function (sTableName) {
			var docNum = 0;

			$.ajax({
				url: "/rexsjs/public/rexsjs/ExecQuery.xsjs?dbName=APP_RE&procName=SPAPP_RE_GETDOCNUM&tableName=" +
					sTableName,
				type: "GET",
				async: false,
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					jQuery.sap.log.error("This should never have happened!");
				},
				success: function (json) {
					docNum = json[0][""];

				},
				context: this
			}).done(function (results) {
				if (results) {
					docNum = results[0][""];

				}
			});

			return docNum;
		},

		prepareBatchRequestBody: function (oRequest) {

			var batchRequest = "";

			var beginBatch = "--a\nContent-Type: multipart/mixed;boundary=b\n\n";
			var endBatch = "--b--\n--a--";

			batchRequest = batchRequest + beginBatch;

			var objectUDT = "";
			for (var i = 0; i < oRequest.length; i++) {

				objectUDT = oRequest[i];
				batchRequest = batchRequest + "--b\nContent-Type:application/http\nContent-Transfer-Encoding:binary\n\n";
				batchRequest = batchRequest + "POST /b1s/v1/" + objectUDT.tableName;
				batchRequest = batchRequest + "\nContent-Type: application/json\n\n";
				batchRequest = batchRequest + JSON.stringify(objectUDT.data) + "\n\n";
			}

			batchRequest = batchRequest + endBatch;

			return batchRequest;

		},

		getTodaysDate: function () {
			var today = new Date();
			var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
			return date;
		},

		replaceKeyJSON: function (keyToBeReplace, newKey, oJSON) {
			var strJSON = JSON.stringify(oJSON);
			strJSON = strJSON.replace(/\"keyToBeReplace":/g, "\"newKey\":");
			return JSON.parse(strJSON);
		},

		postData: function (oPostData, sURL) {
			var returnValue = 0;
			$.ajax({
				url: "/rexsjs/public/rexsjs/PostData.xsjs?dbName=APP_RE",
				type: "POST",
				async: false,
				data: JSON.stringify(oPostData),
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					returnValue = -1;
					jQuery.sap.log.error("error on AppUi5.postData() " + xhr.responseText);
				},
				success: function (json) {},
				context: this
			}).done(function (results) {
				if (results) {
					returnValue = 0;
				}
			});

			return returnValue;
		},

		getAllByColumn: function (tableName, columnName, columnValue) {
			var getAllByColumnURL = "/rexsjs/public/rexsjs/ExecQuery.xsjs?dbName=APP_RE&procName=SPAPP_RE_GETALLDATA_BYCOL&tableName=" +
				tableName + "&colName=" + columnName + "&colValue=" + columnValue;
			$.ajax({
				url: getAllByColumnURL,
				type: "GET",
				async: false,
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					jQuery.sap.log.error("error on AppUi5.getAllByColumn() " + xhr.responseText);
				},
				success: function (json) {},
				context: this
			}).done(function (results) {
				if (results.length <= 0) {
					return results;
				}
			});
		},

		getDatePostingFormat: function (sDate) {
			var year = new Date(sDate).getYear() + 1900;
			var month = new Date(sDate).getMonth() + 1;
			var date = new Date(sDate).getDate();
			return month + "/" + date + "/" + year;
		},

		generateNumber: function (sDocType) {
			var generateNumberURL = "";
			switch (sDocType) {
			case "Quote":
				generateNumberURL = "/rexsjs/public/rexsjs/ExecQuery.xsjs?dbName=APP_RE&procName=SPAPP_RE_GENERATENUMBER&DocType=Quote";
				break;
			case "Reservation":
				generateNumberURL = "/rexsjs/public/rexsjs/ExecQuery.xsjs?dbName=APP_RE&procName=SPAPP_RE_GENERATENUMBER&DocType=Reservation";
				break;
			case "Contract":
				generateNumberURL = "/rexsjs/public/rexsjs/ExecQuery.xsjs?dbName=APP_RE&procName=SPAPP_RE_GENERATENUMBER&DocType=Contract";
				break;
			}
			var returnCode = [];
			$.ajax({
				url: generateNumberURL,
				type: "GET",
				async: false,
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					jQuery.sap.log.error("error on AppUi5.generateNumber() " + xhr.responseText);
				},
				success: function (json) {},
				context: this
			}).done(function (results) {
				if (results.length > 0) {
					returnCode = results;
				} else {
					returnCode = [];
				}
			});

			return returnCode;
		},

		//Returning and array of all columns and rows for specific table in specified Key Column
		//If error, this will return empty array
		getAllDataByKeyAJAX: function (sTableName, sKeyCode, sQueryType) {
			var aReturnResult = [];
			$.ajax({
				url: "/rexsjs/public/rexsjs/ExecQuery.xsjs?dbName=APP_RE&procName=SPAPP_RE_GETALLDATA_BYKEY&tableName=" + sTableName +
					"&keyCode=" + sKeyCode + "&queryType=" + sQueryType,
				type: "GET",
				xhrFields: {
					withCredentials: true
				},
				async: false,
				error: function (xhr, status, error) {
					return [];
				},
				success: function (json) {},
				context: this
			}).done(function (results) {
				if (results.length <= 0) {
					aReturnResult = [];
				} else {
					aReturnResult = results;
				}
			});

			return aReturnResult;
		},

		getHANAData: function (sModule, sQueryType, sKey, sKey2) {
			var aReturnResult = [];
			var sURL = "/rexsjs/public/rexsjs/ExecQuery.xsjs?dbName=APP_RE&procName=SPAPP_RE_" + sModule + "&queryType=" + sQueryType +
				"&colValue=" + sKey + "&colValue=" + sKey2;
			$.ajax({
				url: sURL,
				type: "GET",
				async: false,
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					aReturnResult = [];
				},
				success: function (json) {},
				context: this
			}).done(function (results) {
				if (results.length <= 0) {
					aReturnResult = [];
				} else {
					aReturnResult = results;
				}
			});
			return aReturnResult;

		},

		getAllDataByColAJAX: function (sTableName, sColName, sColValue, sQueryType) {
			var aReturnResult = [];
			$.ajax({
				url: "/rexsjs/public/rexsjs/ExecQuery.xsjs?dbName=APP_RE&procName=SPAPP_RE_GETALLDATA_BYCOL&tableName=" + sTableName +
					"&colName=" + sColName + "&colValue=" + sColValue + "&queryType=" + sQueryType,
				type: "GET",
				async: false,
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					aReturnResult = [];
				},
				success: function (json) {},
				context: this
			}).done(function (results) {
				if (results.length <= 0) {
					aReturnResult = [];
				} else {
					aReturnResult = results;
				}
			});
			return aReturnResult;
		},

		renameKey: function (obj, old_key, new_key) {
			if (old_key !== new_key) {
				Object.defineProperty(obj, new_key, Object.getOwnPropertyDescriptor(obj, old_key));
				delete obj[old_key]; 
			}
		},
		
		deleteKey: function(obj, delete_key){
			delete obj[delete_key];
		},
		
		addKey: function(obj, add_key, add_value){
			obj[add_key] = add_value;
		}

	});

});