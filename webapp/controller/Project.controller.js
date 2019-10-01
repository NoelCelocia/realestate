sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"com/apptech/realestate/controller/AppUI5"
], function (Controller, JSONModel, MessageToast, Filter, FilterOperator, AppUI5) {
	"use strict";
	return Controller.extend("com.apptech.realestate.controller.Project", {
		onRoutePatternMatched: function (event) {
			this.prepareTable(false);
		},
		onInit: function () {
			var route = this.getOwnerComponent().getRouter().getRoute("Project");
			route.attachPatternMatched(this.onRoutePatternMatched, this);
			this.bIsAdd = "0";
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			//CREATING COLUMNS
			this.aCols = [];
			this.columnData = [];
			this.oEditRecord = {};
			this.iRecordCount = 0;
			
			this.oIconTab = this.getView().byId("tab1");
			this.oIconTab2 = this.getView().byId("tab2");
			this.recordCode = "";
			// GETTING DATA
			// CREATING DYNAMIC TABLE BINDING
			this.oMdlAllRecord = new JSONModel();
			//CREATING TEMPLATE FOR EDITING AND ADDING
			this.oMdlEditRecord = new JSONModel("model/Project.json");
			this.getView().setModel(this.oMdlEditRecord, "oMdlEditRecord");
			//REFERENCES JSON MODELS
			this.oMdlProjectStatus = new JSONModel("model/AllProjectStatus.json");
			this.getView().setModel(this.oMdlProjectStatus, "oMdlProjectStatus");
			                     
			
			this.oMdlBuildTypes = new JSONModel();
			$.ajax({
				url: "/rexsjs/public/rexsjs/ExecQuery.xsjs?dbName=APP_RE&procName=SPAPP_RE_GETALLDATA&tableName=R_BUILD_TYPE",
				type: "GET",
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					MessageToast.show(error);
				},
				success: function (json) {},
				context: this
			}).done(function (results) {
				if (results) {
					this.oMdlBuildTypes.setJSON("{\"allbuildtypes\" : " + JSON.stringify(results) + "}");
					this.getView().setModel(this.oMdlBuildTypes, "oMdlBuildTypes");
				}
			});
			this.prepareTable(true);
		},
		prepareTable: function (bIsInit) {
			$.ajax({
				url: "/rexsjs/public/rexsjs/ExecQuery.xsjs?dbName=APP_RE&procName=SPAPP_RE_VIEWTABLE&tableName=M_PROJECT&parameterCode=0",
				type: "GET",
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					MessageToast.show(error);
				},
				success: function (json) {},
				context: this
			}).done(function (results) {
				if (results) {
					this.aCols = Object.keys(results[0]);
					var i;
					this.iRecordCount = results.length;
					this.oIconTab.setCount(this.iRecordCount);
					if (bIsInit) {
						for (i = 0; i < this.aCols.length; i++) {
							this.columnData.push({
								"columnName": this.aCols[i]
							});
						}
					}
					this.oMdlAllRecord.setData({
						rows: results,
						columns: this.columnData
					});
					if (bIsInit) {
						this.oTable = this.getView().byId("tblProj");
						this.oTable.setModel(this.oMdlAllRecord);
						this.oTable.bindColumns("/columns", function (sId, oContext) {
							var columnName = oContext.getObject().columnName;
							return new sap.ui.table.Column({
								label: columnName,
								template: new sap.m.Text({
									text: "{" + columnName + "}"
								})
							});
						});
						this.oTable.bindRows("/rows");
						this.oTable.setSelectionMode("Single");
						this.oTable.setSelectionBehavior("Row");
						this.renameColumns();
					}
				}
			});
		},
		renameColumns: function () {
			this.oTable.getColumns()[0].setVisible(false);
			this.oTable.getColumns()[1].setLabel("Project Code");
			this.oTable.getColumns()[1].setFilterProperty("ProjectCode");
			this.oTable.getColumns()[2].setLabel("Project Description");
			this.oTable.getColumns()[2].setFilterProperty("Name");
			this.oTable.getColumns()[3].setLabel("Project Area");
			this.oTable.getColumns()[4].setLabel("Project Location");
			this.oTable.getColumns()[5].setLabel("Project Status");
		},
		onEdit: function (oEvent) {
			var iIndex = this.oTable.getSelectedIndex();
			var sQueryTable = "M_PROJECT";
			var sCode = "";
			if (iIndex != -1) {
				var oRowSelected = this.oTable.getBinding().getModel().getData().rows[this.oTable.getBinding().aIndices[iIndex]];
				sCode = oRowSelected.Code;
				//AJAX selected Key
				$.ajax({
					url: "/rexsjs/public/rexsjs/ExecQuery.xsjs?dbName=APP_RE&procName=SPAPP_RE_GETALLDATA_BYKEY&tableName=" + sQueryTable +
						"&keyCode=" + sCode,
					type: "GET",
					xhrFields: {
						withCredentials: true
					},
					error: function (xhr, status, error) {
						MessageToast.show(error);
					},
					success: function (json) {},
					context: this
				}).done(function (results) {
					if (results.length <= 0) {
						return;
					}
					var oResult = JSON.stringify(results).replace("[", "").replace("]", "");
					this.oMdlEditRecord.setJSON("{\"EditRecord\" : " + oResult + "}");
					this.getView().setModel(this.oMdlEditRecord, "oMdlEditRecord");
					this.getView().byId("idIconTabBarInlineMode").getItems()[1].setText("Record Code : " + this.oMdlEditRecord.getData().EditRecord
						.ProjectCode + " [EDIT]");
				});
			}
			this.recordCode = sCode;
			var tab = this.getView().byId("idIconTabBarInlineMode");
			tab.setSelectedKey("tab2");
			this.bIsAdd = "E";
		},
		onAdd: function (oEvent) {
			this.oMdlEditRecord.getData().EditRecord.Code = "";
			this.oMdlEditRecord.getData().EditRecord.ProjectCode = "";
			this.oMdlEditRecord.getData().EditRecord.ProjectDesc = "";
			this.oMdlEditRecord.getData().EditRecord.ProjArea = "";
			this.oMdlEditRecord.getData().EditRecord.ProjLocation = "";
			this.oMdlEditRecord.getData().EditRecord.BuildTypeCode = 1;
			this.oMdlEditRecord.getData().EditRecord.ProjStatus = "Planning"; 
			this.oMdlEditRecord.getData().EditRecord.IsActive = "";
			this.oMdlEditRecord.refresh();
			this.getView().byId("idIconTabBarInlineMode").getItems()[1].setText("RECORD [ADD]");
			var tab = this.getView().byId("idIconTabBarInlineMode");
			tab.setSelectedKey("tab2");
			this.bIsAdd = "A";
		},
		onSelectGender: function (oEvent) {
			var sSelectedKeyGender = oEvent.getSource().getProperty("text");
			this.oMdlEditRecord.getData().EditRecord.Gender = sSelectedKeyGender.toUpperCase(); // console.log("Check box select");
		},
		onSave: function (oEvent) {
			if (this.bIsAdd === "0") {
				return;
			}
			if (this.bIsAdd === "A") {
				var tableCode = AppUI5.generateUDTCode();
				//Generate Code
				var recordCode = "";
				$.ajax({
					url: "/rexsjs/public/rexsjs/ExecQuery.xsjs?dbName=APP_RE&procName=SPAPP_RE_GENERATEPROJECT",
					type: "GET",
					async: false,
					xhrFields: {
						withCredentials: true
					},
					error: function (xhr, status, error) {
						jQuery.sap.log.error("This should never have happened!");
					},
					success: function (json) {
						recordCode = json[0].Code;
					},
					context: this
				}).done(function (results) {
					if (results) {
						recordCode = results[0].Code;
					}
				});
				//prepareJSON object
				var oRecord = {};
				oRecord.M_PROJECT = [];
				var dataObject = {};
				dataObject.O = "I";
				dataObject.Code = tableCode;
				dataObject.ProjectCode = recordCode;
				dataObject.ProjectDesc = this.oMdlEditRecord.getData().EditRecord.ProjectDesc;
				dataObject.ProjArea = this.oMdlEditRecord.getData().EditRecord.ProjArea;
				dataObject.ProjLocation = this.oMdlEditRecord.getData().EditRecord.ProjLocation;
				dataObject.IsActive = this.oMdlEditRecord.getData().EditRecord.IsActive;
				dataObject.BuildTypeCode = this.oMdlEditRecord.getData().EditRecord.BuildTypeCode;
				dataObject.ProjStatus = this.oMdlEditRecord.getData().EditRecord.ProjStatus;
				dataObject.BuildType = this.oMdlEditRecord.getData().EditRecord.BuildType;
				oRecord.M_PROJECT.push(dataObject);
				//AJAX Call for Posting
				var resultAjaxCall = AppUI5.postData(oRecord);
				if (resultAjaxCall === 0) {
					MessageToast.show("Saved Successfully " + recordCode);
				} else {
					MessageToast.show("Error");
				}
			} else {
				//prepareJSON object
				oRecord = {};
				oRecord.M_PROJECT = [];
				dataObject = {};
				dataObject.O = "U";
				dataObject.Code = this.oMdlEditRecord.getData().EditRecord.Code;
				dataObject.ProjectCode = this.oMdlEditRecord.getData().EditRecord.ProjectCode;
				dataObject.ProjectDesc = this.oMdlEditRecord.getData().EditRecord.ProjectDesc;
				dataObject.ProjArea = this.oMdlEditRecord.getData().EditRecord.ProjArea;
				dataObject.ProjLocation = this.oMdlEditRecord.getData().EditRecord.ProjLocation;
				dataObject.BuildTypeCode = this.oMdlEditRecord.getData().EditRecord.BuildTypeCode;
				dataObject.IsActive = this.oMdlEditRecord.getData().EditRecord.IsActive;
				dataObject.ProjStatus = this.oMdlEditRecord.getData().EditRecord.ProjStatus;
				oRecord.M_PROJECT.push(dataObject);
				//AJAX Call for Posting
				resultAjaxCall = AppUI5.postData(oRecord);
				if (resultAjaxCall === 0) {
					MessageToast.show("Successfully Updated " + this.oMdlEditRecord.getData().EditRecord.ProjectCode);
				} else {
					MessageToast.show("Error");
				}
			}
			this.prepareTable(false);
		},
		filterGlobally: function (oEvent) {
			var sQuery = oEvent.getParameter("query");
			this._oGlobalFilter = null;
			if (sQuery) {
				this._oGlobalFilter = new Filter([
					new Filter("ProjectDesc", FilterOperator.Contains, sQuery),
					new Filter("ProjectCode", FilterOperator.Contains, sQuery)
				], false);
			}
			this._filter();
		},
		_filter: function () {
			var oFilter = null;
			if (this._oGlobalFilter) {
				oFilter = this._oGlobalFilter;
			}
			this.byId("tblProj").getBinding().filter(oFilter, "Application");
		},
		clearAllFilters: function (oEvent) {
			var oTable = this.getView().byId("tblProj");
			this._oGlobalFilter = null;
			this._filter();
			var aColumns = oTable.getColumns();
			for (var i = 0; i < aColumns.length; i++) {
				oTable.filter(aColumns[i], null);
			}
		},
		/**
		 *@memberOf com.apptech.realestate.controller.Project
		 */
		onChangeProjStatus: function (oEvent) {
			var sSelectedKeyProjStatus = oEvent.getSource().getProperty("selectedKey");
			this.oMdlEditRecord.getData().EditRecord.ProjStatus = sSelectedKeyProjStatus;
		}
	});
});