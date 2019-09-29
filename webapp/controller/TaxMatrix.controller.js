sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"com/apptech/realestate/controller/AppUI5"
], function (Controller, JSONModel, MessageToast, Filter, FilterOperator, AppUI5) {
	"use strict";

	return Controller.extend("com.apptech.realestate.controller.TaxMatrix", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.apptech.realestate.view.TaxMatrix
		 */

		onRoutePatternMatched: function (event) {
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			this.prepareTable(false);
		},
		onInit: function () {
			//TO REFRESH TABLE EVERY VISIT TO TAX_MATRIX PAGE
			var route = this.getOwnerComponent().getRouter().getRoute("TaxMatrix");
			route.attachPatternMatched(this.onRoutePatternMatched, this);
			
			this.bIsAdd = "0";

			this.tableId = "tblTax";
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
			this.oMdlEditRecord = new JSONModel("model/TaxMatrix.json");
			this.getView().setModel(this.oMdlEditRecord, "oMdlEditRecord");

			//REFERENCES JSON MODELS
			this.oMdlAllBuildType = new sap.ui.model.json.JSONModel();
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
					this.oMdlAllBuildType.setJSON("{\"allbuildtype\" : " + JSON.stringify(results) + "}");
					this.getView().setModel(this.oMdlAllBuildType, "oMdlAllBuildType");
				}
			});

			this.prepareTable(true);

		},

		prepareTable: function (bIsInit) {
			$.ajax({
				url: "/rexsjs/public/rexsjs/ExecQuery.xsjs?dbName=APP_RE&procName=SPAPP_RE_VIEWTABLE&tableName=M_TAX_MATRIX&parameterCode=0",
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
			this.oTable.getColumns()[1].setLabel("Tax Code");
			this.oTable.getColumns()[1].setFilterProperty("TaxCode");
			this.oTable.getColumns()[2].setLabel("Tax Name");
			this.oTable.getColumns()[2].setFilterProperty("TaxDesc");
			this.oTable.getColumns()[3].setLabel("Build Type");
			this.oTable.getColumns()[4].setLabel("Amount Limit From");
			this.oTable.getColumns()[4].setLabel("Amount Limit To");
			this.oTable.getColumns()[5].setLabel("Rate");
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.apptech.realestate.view.TaxMatrix
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.apptech.realestate.view.TaxMatrix
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.apptech.realestate.view.TaxMatrix
		 */
		//	onExit: function() {
		//
		//	}

	});

});