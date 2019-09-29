sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"com/apptech/realestate/controller/AppUI5"
], function (Controller, JSONModel, MessageToast, Filter, FilterOperator, AppUI5) {
	"use strict";
	return Controller.extend("com.apptech.realestate.controller.Unit", {

		onRoutePatternMatched: function (event) {
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			this.prepareTable(false);
		},

		onInit: function () {
			var route = this.getOwnerComponent().getRouter().getRoute("Unit");
			route.attachPatternMatched(this.onRoutePatternMatched, this);

			this.bIsAdd = "0";

			this.tableId = "tblUnit";
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
			this.oMdlEditRecord = new JSONModel("model/Unit.json");
			this.getView().setModel(this.oMdlEditRecord, "oMdlEditRecord");

			//REFERENCES JSON MODELS
			this.oMdlProject = new sap.ui.model.json.JSONModel();
			$.ajax({
				url: "/rexsjs/public/rexsjs/ExecQuery.xsjs?dbName=APP_RE&procName=SPAPP_RE_GETALLDATA&tableName=M_PROJECT",
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
					this.oMdlProject.setJSON("{\"allproject\" : " + JSON.stringify(results) + "}");
					this.getView().setModel(this.oMdlProject, "oMdlProject");
				}
			});
			

			//BUILD TYPE
			this.oMdlBuildType = new sap.ui.model.json.JSONModel();
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
					this.oMdlBuildType.setJSON("{\"allbuildtype\" : " + JSON.stringify(results) + "}");
					this.getView().setModel(this.oMdlBuildType, "oMdlBuildType");
				}
			});

			//UNIT STATUS
			this.oMdlUnitStat = new sap.ui.model.json.JSONModel();
			$.ajax({
				url: "/rexsjs/public/rexsjs/ExecQuery.xsjs?dbName=APP_RE&procName=SPAPP_RE_GETALLDATA&tableName=R_UNIT_STATUS",
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
					this.oMdlUnitStat.setJSON("{\"allunitstat\" : " + JSON.stringify(results) + "}");
					this.getView().setModel(this.oMdlUnitStat, "oMdlUnitStat");
				}
			});

			//PROPERTY TYPE
			this.oMdlPropType = new sap.ui.model.json.JSONModel();
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
					this.oMdlPropType.setJSON("{\"allproptype\" : " + JSON.stringify(results) + "}");
					this.getView().setModel(this.oMdlPropType, "oMdlPropType");
				}
			});

			//HOUSE MODEL
			this.oMdlHouseModel = new sap.ui.model.json.JSONModel();
			$.ajax({
				url: "/rexsjs/public/rexsjs/ExecQuery.xsjs?dbName=APP_RE&procName=SPAPP_RE_GETALLDATA&tableName=R_HOUSE_MODEL",
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
					this.oMdlHouseModel.setJSON("{\"allhousemodel\" : " + JSON.stringify(results) + "}");
					this.getView().setModel(this.oMdlHouseModel, "oMdlHouseModel");
				}
			});

			this.prepareTable(true);

		},

		prepareTable: function (bIsInit) {
			$.ajax({
				url: "/rexsjs/public/rexsjs/ExecQuery.xsjs?dbName=APP_RE&procName=SPAPP_RE_VIEWTABLE&tableName=M_UNIT&parameterCode=0",
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
						this.oTable = this.getView().byId(this.tableId);
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
			this.oTable.getColumns()[1].setLabel("Unit Code");
			this.oTable.getColumns()[1].setFilterProperty("UnitCode");
			this.oTable.getColumns()[2].setLabel("Unit Name");
			this.oTable.getColumns()[2].setFilterProperty("UnitDesc");
			this.oTable.getColumns()[3].setLabel("Unit Status");
			this.oTable.getColumns()[4].setLabel("Project");
			this.oTable.getColumns()[5].setLabel("Floor Area");
		},

		onEdit: function (oEvent) {

			var iIndex = this.oTable.getSelectedIndex();
			var sQueryTable = "M_UNIT";
			var sCode = "";
			if (iIndex !== -1) {
				var oRowSelected = this.oTable.getBinding().getModel().getData().rows[this.oTable.getBinding().aIndices[iIndex]];
				sCode = oRowSelected.Code;
				//AJAX selected Key
				$.ajax({
					url: "/rexsjs/public/rexsjs/ExecQuery.xsjs?dbName=APP_RE&procName=SPAPP_RE_GETALLDATA_BYKEY&tableName=" + sQueryTable +
						"&keyCode=" +
						sCode,
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
						.UnitCode + " [EDIT]");
				});
			}
			this.recordCode = sCode;

			var tab = this.getView().byId("idIconTabBarInlineMode");
			tab.setSelectedKey("tab2");
			this.bIsAdd = false;

		},

		onAdd: function (oEvent) {
			this.onClearAdd();
		},

		onClearAdd: function () {
			this.oMdlEditRecord.getData().EditRecord.Code = "";
			this.oMdlEditRecord.getData().EditRecord.UnitCode = "";
			this.oMdlEditRecord.getData().EditRecord.UnitDesc = "";
			this.oMdlEditRecord.getData().EditRecord.LotNo = "";
			this.oMdlEditRecord.getData().EditRecord.PhaseNo = "";
			this.oMdlEditRecord.getData().EditRecord.BlockNo = "";
			this.oMdlEditRecord.getData().EditRecord.FloorArea = "";
			this.oMdlEditRecord.getData().EditRecord.LotArea = "";
			this.oMdlEditRecord.getData().EditRecord.UnitType = "1";
			this.oMdlEditRecord.getData().EditRecord.HouseModel = "1";
			this.oMdlEditRecord.getData().EditRecord.StandardCost = 0;
			this.oMdlEditRecord.getData().EditRecord.AccumulatedCost = 0;
			this.oMdlEditRecord.getData().EditRecord.PercentComplete = 0;
			this.oMdlEditRecord.getData().EditRecord.PercentUpdateDate = "";
			this.oMdlEditRecord.getData().EditRecord.PrprtyTypeCode = "";
			this.oMdlEditRecord.getData().EditRecord.ProjectCode = "1";
			this.oMdlEditRecord.getData().EditRecord.UnitStatus = "1";
			this.oMdlEditRecord.getData().EditRecord.TurnoverStat = "";
			this.oMdlEditRecord.getData().EditRecord.Notes = "";
			this.oMdlEditRecord.refresh();

			this.getView().byId("idIconTabBarInlineMode").getItems()[1].setText("RECORD [ADD]");
			var tab = this.getView().byId("idIconTabBarInlineMode");
			tab.setSelectedKey("tab2");

			this.bIsAdd = "A";
		},

		onSelectGender: function (oEvent) {
			var sSelectedKeyGender = oEvent.getSource().getProperty("text");
			this.oMdlEditRecord.getData().EditRecord.Gender = sSelectedKeyGender.toUpperCase();
			// console.log("Check box select");
		},

		onSave: function (oEvent) {

			if (this.bIsAdd === "0") {
				return;
			}

			this.oRecord = {};
			this.oRecord.M_UNIT = [];
			this.dataObject = {};
			this.resultAjaxCall = -1;

			if (this.bIsAdd === "A") {
				var tableCode = AppUI5.generateUDTCode();
				//Generate UnitCode
				// Generate UnitCode
				var recordCode = "";
				$.ajax({
					url: "/rexsjs/public/rexsjs/ExecQuery.xsjs?dbName=APP_RE&procName=SPAPP_RE_GENERATEUNIT&" +
						"lotNumber=" + this.oMdlEditRecord.getData().EditRecord.LotNo +
						"&phaseNumber=" + this.oMdlEditRecord.getData().EditRecord.PhaseNo +
						"&blockNumber=" + this.oMdlEditRecord.getData().EditRecord.BlockNo +
						"&projNumber=" + this.oMdlEditRecord.getData().EditRecord.ProjectCode,
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

						//prepareJSON object
						this.dataObject.O = "I";
						this.dataObject.Code = tableCode;
						this.dataObject.UnitCode = recordCode;
						this.dataObject.UnitDesc = this.oMdlEditRecord.getData().EditRecord.UnitDesc;
						this.dataObject.LotNo = this.oMdlEditRecord.getData().EditRecord.LotNo;
						this.dataObject.PhaseNo = this.oMdlEditRecord.getData().EditRecord.PhaseNo;
						this.dataObject.BlockNo = this.oMdlEditRecord.getData().EditRecord.BlockNo;
						this.dataObject.FloorArea = this.oMdlEditRecord.getData().EditRecord.FloorArea;
						this.dataObject.LotArea = this.oMdlEditRecord.getData().EditRecord.LotArea;
						this.dataObject.UnitType = this.oMdlEditRecord.getData().EditRecord.UnitType;
						this.dataObject.HouseModel = this.oMdlEditRecord.getData().EditRecord.HouseModel;
						this.dataObject.StandardCost = this.oMdlEditRecord.getData().EditRecord.StandardCost;
						this.dataObject.AccumulatedCost = this.oMdlEditRecord.getData().EditRecord.AccumulatedCost;
						this.dataObject.PercentComplete = this.oMdlEditRecord.getData().EditRecord.PercentComplete;
						this.dataObject.PercentUpdateDate = this.oMdlEditRecord.getData().EditRecord.PercentUpdateDate;
						this.dataObject.ProjectCode = this.oMdlEditRecord.getData().EditRecord.ProjectCode;
						this.dataObject.UnitStatus = this.oMdlEditRecord.getData().EditRecord.UnitStatus;
						this.dataObject.TurnoverStat = this.oMdlEditRecord.getData().EditRecord.TurnoverStat;
						this.dataObject.Notes = this.oMdlEditRecord.getData().EditRecord.Notes;
						this.oRecord.M_UNIT.push(this.dataObject);

						//AJAX Call for Posting
						this.resultAjaxCall = AppUI5.postData(this.oRecord);
						if (this.resultAjaxCall === 0) {
							MessageToast.show("Saved Successfully " + recordCode);
							this.onClearAdd();
						} else {
							MessageToast.show("Error");
							
						}
					}

				});

			} else {
				//prepareJSON object
				this.oRecord = {};
				this.oRecord.M_UNIT = [];
				this.dataObject = {};
				this.dataObject.O = "U";
				this.dataObject.O = "I";
				this.dataObject.Code = tableCode;
				this.dataObject.UnitCode = recordCode;
				this.dataObject.UnitDesc = this.oMdlEditRecord.getData().EditRecord.UnitDesc;
				this.dataObject.LotNo = this.oMdlEditRecord.getData().EditRecord.LotNo;
				this.dataObject.PhaseNo = this.oMdlEditRecord.getData().EditRecord.PhaseNo;
				this.dataObject.BlockNo = this.oMdlEditRecord.getData().EditRecord.BlockNo;
				this.dataObject.FloorArea = this.oMdlEditRecord.getData().EditRecord.FloorArea;
				this.dataObject.LotArea = this.oMdlEditRecord.getData().EditRecord.LotArea;
				this.dataObject.UnitType = this.oMdlEditRecord.getData().EditRecord.UnitType;
				this.dataObject.HouseModel = this.oMdlEditRecord.getData().EditRecord.HouseModel;
				this.dataObject.StandardCost = this.oMdlEditRecord.getData().EditRecord.StandardCost;
				this.dataObject.AccumulatedCost = this.oMdlEditRecord.getData().EditRecord.AccumulatedCost;
				this.dataObject.PercentComplete = this.oMdlEditRecord.getData().EditRecord.PercentComplete;
				this.dataObject.PercentUpdateDate = this.oMdlEditRecord.getData().EditRecord.PercentUpdateDate;
				this.dataObject.ProjectCode = this.oMdlEditRecord.getData().EditRecord.ProjectCode;
				this.dataObject.UnitStatus = this.oMdlEditRecord.getData().EditRecord.UnitStatus;
				this.dataObject.TurnoverStat = this.oMdlEditRecord.getData().EditRecord.TurnoverStat;
				this.dataObject.Notes = this.oMdlEditRecord.getData().EditRecord.Notes;
				
				this.oRecord.M_UNIT.push(this.dataObject);
				//AJAX Call for Posting
				this.resultAjaxCall = AppUI5.postData(this.oRecord);
				if (this.resultAjaxCall === 0) {
					MessageToast.show("Successfully Updated " + this.oMdlEditRecord.getData().EditRecord.UnitCode);
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
					new Filter("UnitDesc", FilterOperator.Contains, sQuery),
					new Filter("UnitCode", FilterOperator.Contains, sQuery)
				], false);
			}

			this._filter();
		},

		_filter: function () {
			var oFilter = null;

			if (this._oGlobalFilter) {
				oFilter = this._oGlobalFilter;
			}

			this.byId(this.tableId).getBinding().filter(oFilter, "Application");
		},

		clearAllFilters: function (oEvent) {
			var oTable = this.getView().byId(this.tableId);

			this._oGlobalFilter = null;
			this._filter();

			var aColumns = oTable.getColumns();
			for (var i = 0; i < aColumns.length; i++) {
				oTable.filter(aColumns[i], null);
			}
		}

	});
});