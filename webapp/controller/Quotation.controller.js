sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"com/apptech/realestate/controller/AppUI5",
	"sap/ui/core/Fragment",
	"sap/m/Dialog",
	"sap/m/ButtonType",
	"sap/m/Button",
	"sap/m/Text",
	"sap/m/MessageBox"
], function (Controller, JSONModel, MessageToast, Filter, FilterOperator, AppUI5, Fragment, Dialog, ButtonType, Button, Text, MessageBox) {
	"use strict";

	return Controller.extend("com.apptech.realestate.controller.Quotation", {
		onRoutePatternMatched: function (event) {
			document.title = "Real Estate - Quotation";
		},

		onInit: function () {
			var route = this.getOwnerComponent().getRouter().getRoute("Quotation");
			route.attachPatternMatched(this.onRoutePatternMatched, this);
			this.bIsAdd = "0";
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			//CREATING COLUMNS
			this.aCols = [];
			this.aColsDetails = [];
			this.columnData = [];
			this.columnDataDetail = [];
			this.oEditRecord = {};
			this.iRecordCount = 0;

			this.hasChangedUnits = false;
			this.hasChangedTerms = false;
			this.hasChangePricing = false;

			this.oPage = this.getView().byId("pageQuotation");

			//CREATING TEMPLATE FOR EDITING AND ADDING
			this.tableId = "tblQuotation";
			this.tableIdDetail = "tblQuotationUnits";
			this.oMdlEditRecord = new JSONModel("model/Quotation.json");
			this.getView().setModel(this.oMdlEditRecord, "oMdlEditRecord");

			this.oMdlAllRecord = new JSONModel();
			this.oMdlAllRecordDetail = new JSONModel();
			this.oMdlAllUnits = new JSONModel();
			this.oTableDetail = this.getView().byId(this.tableIdDetail);

			this.oIconTab = this.getView().byId("tab1");
			this.oIconTab2 = this.getView().byId("tab2");
			this.recordCode = "";
			this.currentDate = new Date();

			this.oTableUnits = this.getView().byId("tblUnits");
			this.oTableSchedule = this.getView().byId("tblSchedule");

			//CREATING DROPDOWN STATUS GROUP
			this.oMdlStatGroup = new JSONModel("model/QuotationStatGroup.json");
			this.getView().setModel(this.oMdlStatGroup, "oMdlStatGroup");

			//CREATING MODEL IN UNIT TABLE
			this.oMdlUnitTable = new JSONModel("model/QuotationUnitTable.json");
			this.getView().setModel(this.oMdlUnitTable, "oMdlUnitTable");

			this.iTotalSellingPrice = 0;

			//CREATING MODEL OF ALL BP
			this.oMdlAllBP = new JSONModel();
			$.ajax({
				url: "/rexsjs/public/rexsjs/ExecQuery.xsjs?dbName=APP_RE&procName=SPAPP_RE_SELECTCOLS&tableName=M_CUSTOMER&selectColumns=CustomerCode,FirstName,MiddleName,LastName",
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
					this.oMdlAllBP.setJSON("{\"allbp\" : " + JSON.stringify(results) + "}");
					this.getView().setModel(this.oMdlAllBP, "oMdlAllBP");
				}
			});

			//CREATING MODEL FOR PRICING TAB
			this.oMdlPricing = new JSONModel("model/QuotationPricing.json");
			this.getView().setModel(this.oMdlPricing, "oMdlPricing");

			//REFERENCE FOR DOCUMENT STATUS
			this.oMdlDocStatus = new JSONModel();
			$.ajax({
				url: "/rexsjs/public/rexsjs/ExecQuery.xsjs?dbName=APP_RE&procName=SPAPP_RE_GETALLDATA&tableName=R_DOC_STATUS",
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
					this.oMdlDocStatus.setJSON("{\"alldocstatus\" : " + JSON.stringify(results) + "}");
					this.getView().setModel(this.oMdlDocStatus, "oMdlDocStatus");
				}
			});

			this.oMdlTerms = new JSONModel("model/QuotationTermsTable.json");
			this.getView().setModel(this.oMdlTerms, "oMdlTerms");

			this.oMdlFinSchemes = new JSONModel("model/QuotationFinSchemes.json");
			this.getView().setModel(this.oMdlFinSchemes, "oMdlFinSchemes");

			//CREATING MODEL OF ALL BP
			this.oMdlTaxes = new JSONModel();
			$.ajax({
				url: "/rexsjs/public/rexsjs/ExecQuery.xsjs?dbName=APP_RE&procName=SPAPP_RE_SELECTCOLS&tableName=M_TAX_MATRIX&selectColumns=TaxCode,TaxDesc,Rate",
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
					this.oMdlTaxes.setJSON("{\"alltaxes\" : " + JSON.stringify(results) + "}");
					this.getView().setModel(this.oMdlTaxes, "oMdlTaxes");
				}
			});
			this.prepareTable(true);

		},

		//TABLE VIEW--------------------------------
		prepareTable: function (bIsInit) {

			var aResults = AppUI5.getHANAData("QUOTATION", "GET_TABLEVIEW", "", "");

			if (aResults.length !== 0) {

				this.aCols = Object.keys(aResults[0]);
				var i;
				this.iRecordCount = aResults.length;
				this.oIconTab.setCount(this.iRecordCount);
				if (bIsInit) {
					for (i = 0; i < this.aCols.length; i++) {
						this.columnData.push({
							"columnName": this.aCols[i]
						});
					}
				}
				this.oMdlAllRecord.setData({
					rows: aResults,
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

		},
		renameColumns: function () {
			this.oTable.getColumns()[0].setVisible(false);
			this.oTable.getColumns()[1].setLabel("Quote Number");
			this.oTable.getColumns()[1].setFilterProperty("QuoteNum");
			this.oTable.getColumns()[2].setLabel("Customer Code");
			this.oTable.getColumns()[3].setFilterProperty("Name");
			this.oTable.getColumns()[4].setLabel("Quote Price");
			this.oTable.getColumns()[4].setFilterProperty("NetPrice");
			this.oTable.getColumns()[5].setLabel("Created Date");
		},
		onSelectStatGroup: function (oEvent) {
			var selectedKey = oEvent.getSource().getSelectedItem().getProperty("key");
			var aResults = [];
			switch (selectedKey) {
			case "1":

				aResults = AppUI5.getHANAData("QUOTATION", "GET_TABLEVIEW", "", "");
				this.oMdlAllRecord.setData({
					rows: aResults,
					columns: this.columnData
				});
				break;
			case "2":

				aResults = AppUI5.getHANAData("QUOTATION", "GET_TABLEVIEW_CREATEDTODAY", "", "");
				this.oMdlAllRecord.setData({
					rows: aResults,
					columns: this.columnData
				});
				break;
			case "3":
				console.log("GET_TABLEVIEW_NOCONTRACT");
				aResults = AppUI5.getHANAData("QUOTATION", "GET_TABLEVIEW_NOCONTRACT", "", "");
				break;
			case "4":
				console.log("GET_TABLEVIEW_WITHCONTRACT");
				aResults = AppUI5.getHANAData("QUOTATION", "GET_TABLEVIEW_WITHCONTRACT", "", "");
				break;
			case "5":
				console.log("GET_TABLEVIEW_SIMILARUNITS");
				aResults = AppUI5.getHANAData("QUOTATION", "GET_TABLEVIEW_SIMILARUNITS", "", "");
				break;
			case "6":
				console.log("GET_TABLEVIEW_CREATEDMONTH");
				aResults = AppUI5.getHANAData("QUOTATION", "GET_TABLEVIEW_CREATEDMONTH", "", "");
				break;
			default:
				break;
			}
		},
		//TABLE VIEW--------------------------------

		//ACTION BUTTON---------------------------
		handleOpen: function (oEvent) {
			var oButton = oEvent.getSource();

			// create action sheet only once
			if (!this._actionSheet) {
				this._actionSheet = sap.ui.xmlfragment(
					"com.apptech.realestate.view.fragments.QuotationActionFragment",
					this
				);

				this.getView().addDependent(this._actionSheet);
			}

			this._actionSheet.openBy(oButton);
		},
		actionSelected: function (oEvent) {
			var oButton = oEvent.getSource();
			switch (oEvent.getSource().getText()) {
			case "Set as Reserved":
				if (this.bIsAdd === "A") {
					MessageToast.show("Save as Quotation first ");
				}

				// this.onSaveProcess();
				MessageToast.show("Set as Reserved");
				break;
			case "View Draft Computation":
				//SPAPP_RE_GENERATEAMORT
				// var aResults = AppUI5.getHANAData("QUOTATION", "GET_TABLEVIEWDETAILS", paramCode, "");
				this.oMdlAllAmortSched = new JSONModel();
				$.ajax({
					url: "/rexsjs/public/rexsjs/ExecQuery.xsjs?dbName=APP_RE&procName=SPAPP_RE_GENERATEAMORT&keyValue=" + this.oMdlEditRecord.getData()
						.EditRecord.QuoteNum,
					type: "GET",
					async: false,
					xhrFields: {
						withCredentials: true
					},
					error: function (xhr, status, error) {

					},
					success: function (json) {},
					context: this
				}).done(function (results) {
					if (results.length <= 0) {

					} else {
						this.oMdlAllAmortSched.setJSON(JSON.stringify(results));
						this.getView().setModel(this.oMdlAllAmortSched, "oMdlAllAmortSched");
					}
				});

				this.oTableAmortSched = new sap.ui.table.Table({
					selectionMode: sap.ui.table.SelectionMode.Single
				});
				this.oTableAmortSched.addColumn(new sap.ui.table.Column({
					label: new sap.m.Label({
						text: "Description"
					}),
					template: new sap.m.Text({
						text: "{oMdlAllAmortSched>Description}"
					})
				}));
				this.oTableAmortSched.addColumn(new sap.ui.table.Column({
					label: new sap.m.Label({
						text: "Due Date"
					}),
					template: new sap.m.Text({
						text: "{path: 'oMdlAllAmortSched>StartDate'}"

					})
				}));
				this.oTableAmortSched.addColumn(new sap.ui.table.Column({
					label: new sap.m.Label({
						text: "Amount"
					}),
					template: new sap.m.Text({
						text: "{path: 'oMdlAllAmortSched>Amount', type: 'sap.ui.model.type.Float', formatOptions: {maxFractionDigits: 2, minFractionDigits: 2} }"

					})
				}));
				this.oTableAmortSched.addColumn(new sap.ui.table.Column({
					label: new sap.m.Label({
						text: "Interest"
					}),
					template: new sap.m.Text({

						text: "{path: 'oMdlAllAmortSched>Interest', type: 'sap.ui.model.type.Float', formatOptions: {maxFractionDigits: 2, minFractionDigits: 2} }"
					})
				}));
				this.oTableAmortSched.addColumn(new sap.ui.table.Column({
					label: new sap.m.Label({
						text: "Rate"
					}),
					template: new sap.m.Text({

						text: "{oMdlAllAmortSched>InterestRate}"
					})
				}));
				this.oTableAmortSched.addColumn(new sap.ui.table.Column({
					label: new sap.m.Label({
						text: "Principal"
					}),
					template: new sap.m.Text({
						text: "{path: 'oMdlAllAmortSched>Principal', type: 'sap.ui.model.type.Float', formatOptions: {maxFractionDigits: 2, minFractionDigits: 2} }"

					})
				}));
				this.oTableAmortSched.addColumn(new sap.ui.table.Column({
					label: new sap.m.Label({
						text: "Running Balance"
					}),
					template: new sap.m.Text({
						text: "{path: 'oMdlAllAmortSched>Running Balance', type: 'sap.ui.model.type.Float', formatOptions: {maxFractionDigits: 2, minFractionDigits: 2} }"

					})
				}));

				this.oMdlAllAmortSched.getData();

				var oAmortSched = {};
				oAmortSched.T_AMORTSCHED_QUOTE = [];
				oAmortSched.T_AMORTSCHED_QUOTE = JSON.parse(JSON.stringify(this.oMdlAllAmortSched.getData()));

				oAmortSched.T_AMORTSCHED_QUOTE.forEach(function (element) {
					AppUI5.renameKey(element, "Running Balance", "DueBalance");
					AppUI5.renameKey(element, "Amount", "DueAmt");
					AppUI5.renameKey(element, "StartDate", "DueDate");
					AppUI5.renameKey(element, "QuoteNum", "DocNum");
					AppUI5.deleteKey(element, "InterestRate");
					AppUI5.addKey(element, "Status", "1");
					AppUI5.addKey(element, "O", "I");
				});

				//DELETE FROM T_AMORTSCHED_QUOTE WHERE DocNum = 1
				$.ajax({
					url: "/rexsjs/public/rexsjs/ExecQuery.xsjs?dbName=APP_RE&procName=SPAPP_RE_DELETE&whereCol1=DocNum&whereVal1=" + this.oMdlEditRecord.getData()
						.EditRecord.QuoteNum + "&whereCol2=&whereVal=",
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

				});

				var resultAjaxCall = AppUI5.postData(oAmortSched);
				if (resultAjaxCall === 0) {} else {
					MessageToast.show("Error");
					jQuery.sap.log.error("Error on actionSelected() Quotation controller");
				}

				this.oTableAmortSched.setModel(this.oMdlAllAmortSched);
				this.oTableAmortSched.bindRows("oMdlAllAmortSched>/");

				if (!this.amortDialog) {
					this.amortDialog = new Dialog({
						title: "Amortization Schedule",
						contentWidth: "70rem",
						contentHeight: "50rem",
						draggable: true,
						content: this.oTableAmortSched,
						endButton: new Button({
							text: "Close",
							press: function () {
								this.amortDialog.close();
							}.bind(this)
						})
					});

					this.getView().addDependent(this.amortDialog);
				}

				this.amortDialog.open();

				break;
			}

			MessageToast.show("Selected action is '" + oEvent.getSource().getText() + "'");
		},
		//ACTION BUTTON---------------------------

		//FOR UNIT TABLE TO POPULATE ------------------
		onAddUnit: function () {
			this.hasChangedUnits = true;
			$.ajax({
				url: "/rexsjs/public/rexsjs/ExecQuery.xsjs?dbName=APP_RE&procName=SPAPP_RE_FRAGMENTTABLE&fragmentTag=ChooseUnit",
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
					this.oMdlAllUnits.setJSON("{\"allunitchoose\" : " + JSON.stringify(results) + "}");
					this.getView().setModel(this.oMdlAllUnits, "oMdlAllUnits");
				}
			});

			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("com.apptech.realestate.view.fragments.UnitChooseDialogFragment", this);
			}

			this.getView().addDependent(this._oDialog);

			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
			this._oDialog.open();

		},
		onRemoveUnit: function (oEvent) {
			this.hasChangedUnits = true;

			var oRow = this.oTableUnits.getBinding().getModel().getData().unitrows[
				this.oTableUnits.getBinding().aIndices[this.oTableUnits.getSelectedIndex()]
			];
			this.iTotalSellingPrice = Math.abs(this.iTotalSellingPrice - oRow.Price);

			this.oMdlPricing.getData().EditRecord.PriceTotal = this.iTotalSellingPrice;
			this.oMdlPricing.getData().EditRecord.GrossPrice = this.iTotalSellingPrice;

			var filteredRows = this.oMdlUnitTable.getData().unitrows.filter(function (value, index, arr) {
				return value.UnitCode !== oRow.UnitCode;
			});

			if (filteredRows.length === 0) {
				//reset pricing and terms
				this.oMdlPricing.getData().EditRecord.PriceTotal = 0.0;
				this.oMdlPricing.getData().EditRecord.GrossPrice = 0.0;
			}

			this.oMdlUnitTable.getData().unitrows = filteredRows;

			this.oMdlUnitTable.refresh();
			this.computePricingTab(false, this.iTotalSellingPrice);

		},
		handleClose: function (oEvent) {

			var oBinding = oEvent.getSource().getBinding("items");
			var aContexts = oEvent.getParameter("selectedContexts");

			if (aContexts !== undefined) {
				var iIndex = parseInt(aContexts[0].sPath.match(/\d+/), 10);
				var selectedObject = aContexts[0].oModel.getData().allunitchoose[iIndex];
				this.oMdlUnitTable.getData().unitrows.push(selectedObject);
				this.iTotalSellingPrice += selectedObject.Price;

				this.oMdlPricing.getData().EditRecord.PriceTotal = this.iTotalSellingPrice;
				this.oMdlPricing.getData().EditRecord.GrossPrice = this.iTotalSellingPrice;

				var aWithoutDummyData = this.oMdlUnitTable.getData().unitrows.filter(function (unitrow) {
					return unitrow.Price > 0;
				});
				this.oMdlUnitTable.getData().unitrows = aWithoutDummyData;
				this.oMdlUnitTable.refresh();
				this.oMdlPricing.refresh();
				oBinding.filter([]);
				this.computePricingTab(false, this.iTotalSellingPrice);
			}

		},
		//FOR UNIT TABLE TO POPULATE ------------------

		//PRICING EVENTS-------------------------
		onChangeTaxCode: function (oEvent) {
			var sTaxCode = oEvent.getParameter("selectedItem").getProperty("key");

			var aTaxCode = this.oMdlTaxes.getData().alltaxes.filter(function (oTax) {
				return oTax.TaxCode == sTaxCode;
			});

			this.oMdlPricing.getData().EditRecord._TaxRate = aTaxCode[0].Rate;
			this.oMdlPricing.getData().EditRecord.TaxAmount = this.oMdlPricing.getData().EditRecord.NetPrice * (this.oMdlPricing.getData().EditRecord
				._TaxRate / 100.00);
			this.oMdlPricing.getData().EditRecord.GrossPrice = this.oMdlPricing.getData().EditRecord.NetPrice - this.oMdlPricing.getData().EditRecord
				.TaxAmount;
			this.oMdlPricing.getData().EditRecord.DiscAmountAVat = this.oMdlPricing.getData().EditRecord.GrossPrice * (this.oMdlPricing.getData()
				.EditRecord.DiscPercentAVat / 100.00);
			var PriceAfVat = this.oMdlPricing.getData().EditRecord.GrossPrice - this.oMdlPricing.getData().EditRecord.DiscAmountAVat;
			this.oMdlPricing.getData().EditRecord.DPAmount = (PriceAfVat) * (this.oMdlPricing.getData().EditRecord.DPPercent / 100.00);

			this.oMdlPricing.getData().EditRecord.DPNetAmount = ((this.oMdlPricing.getData().EditRecord.DPAmount - this.oMdlPricing.getData()
				.EditRecord.RsvFee) < 0) ? 0 : (this.oMdlPricing.getData().EditRecord.DPAmount - this.oMdlPricing.getData()
				.EditRecord.RsvFee);

			this.oMdlPricing.getData().EditRecord.MFAmount = ((PriceAfVat) - this.oMdlPricing.getData().EditRecord.DPNetAmount) * (this.oMdlPricing
				.getData().EditRecord.MFPercent / 100.00);
			this.oMdlPricing.getData().EditRecord.RBAmount = PriceAfVat - this.oMdlPricing.getData().EditRecord.DPNetAmount - this.oMdlPricing.getData()
				.EditRecord.MFAmount;
			this.oMdlPricing.refresh();
		},
		onChangeDiscPercentBVat: function (oEvent) {
			this.oMdlPricing.getData().EditRecord.DiscAmountBVat = this.oMdlPricing.getData().EditRecord.PriceTotal * (parseFloat(oEvent.getParameter(
				"newValue").replace(/,/g, "")) / 100.0);
			this.oMdlPricing.getData().EditRecord.NetPrice = this.oMdlPricing.getData().EditRecord.PriceTotal - this.oMdlPricing.getData().EditRecord
				.DiscAmountBVat;
			this.oMdlPricing.getData().EditRecord.TaxAmount = this.oMdlPricing.getData().EditRecord.NetPrice * (this.oMdlPricing.getData().EditRecord
				._TaxRate / 100);
			this.oMdlPricing.getData().EditRecord.GrossPrice = this.oMdlPricing.getData().EditRecord.NetPrice - this.oMdlPricing.getData().EditRecord
				.TaxAmount;
			this.oMdlPricing.getData().EditRecord.DiscAmountAVat = this.oMdlPricing.getData().EditRecord.GrossPrice * (this.oMdlPricing.getData()
				.EditRecord.DiscPercentAVat / 100.00);
			var FinalGrossPrice = this.oMdlPricing.getData().EditRecord.GrossPrice - this.oMdlPricing.getData().EditRecord.DiscAmountAVat;
			this.oMdlPricing.getData().EditRecord.DPAmount = FinalGrossPrice * (this.oMdlPricing.getData().EditRecord.DPPercent / 100.0);
			this.oMdlPricing.getData().EditRecord.DPNetAmount = ((this.oMdlPricing.getData().EditRecord.DPAmount - this.oMdlPricing.getData()
				.EditRecord.RsvFee) < 0) ? 0 : (this.oMdlPricing.getData().EditRecord.DPAmount - this.oMdlPricing.getData()
				.EditRecord.RsvFee);
			this.oMdlPricing.getData().EditRecord.MFAmount = (FinalGrossPrice) * (this.oMdlPricing.getData().EditRecord.MFPercent / 100.00);
			this.oMdlPricing.getData().EditRecord.RBAmount = (FinalGrossPrice - this.oMdlPricing.getData().EditRecord.DPNetAmount);

		},
		onChangeDiscAmountBVat: function (oEvent) {
			this.oMdlPricing.getData().EditRecord.DiscPercentBVat = (parseFloat(oEvent.getParameter(
				"newValue").replace(/,/g, "")) / this.oMdlPricing.getData().EditRecord.PriceTotal) * 100.00;
			this.oMdlPricing.getData().EditRecord.NetPrice = this.oMdlPricing.getData().EditRecord.PriceTotal - this.oMdlPricing.getData().EditRecord
				.DiscAmountBVat;
			this.oMdlPricing.getData().EditRecord.TaxAmount = this.oMdlPricing.getData().EditRecord.NetPrice * (this.oMdlPricing.getData().EditRecord
				._TaxRate / 100);
			this.oMdlPricing.getData().EditRecord.GrossPrice = this.oMdlPricing.getData().EditRecord.NetPrice - this.oMdlPricing.getData().EditRecord
				.TaxAmount;
			this.oMdlPricing.getData().EditRecord.DiscAmountAVat = this.oMdlPricing.getData().EditRecord.GrossPrice * (this.oMdlPricing.getData()
				.EditRecord.DiscPercentAVat / 100.00);
			var FinalGrossPrice = this.oMdlPricing.getData().EditRecord.GrossPrice - this.oMdlPricing.getData().EditRecord.DiscAmountAVat;
			this.oMdlPricing.getData().EditRecord.DPAmount = FinalGrossPrice * (this.oMdlPricing.getData().EditRecord.DPPercent / 100.0);
			this.oMdlPricing.getData().EditRecord.DPNetAmount = ((this.oMdlPricing.getData().EditRecord.DPAmount - this.oMdlPricing.getData()
				.EditRecord.RsvFee) < 0) ? 0 : (this.oMdlPricing.getData().EditRecord.DPAmount - this.oMdlPricing.getData()
				.EditRecord.RsvFee);
			this.oMdlPricing.getData().EditRecord.MFAmount = (FinalGrossPrice) * (this.oMdlPricing.getData().EditRecord.MFPercent / 100.00);
			this.oMdlPricing.getData().EditRecord.RBAmount = (FinalGrossPrice - this.oMdlPricing.getData().EditRecord.DPNetAmount);
		},
		onChangeDiscPercentAVat: function (oEvent) {
			this.oMdlPricing.getData().EditRecord.DiscAmountAVat = this.oMdlPricing.getData().EditRecord.GrossPrice * (parseFloat(oEvent.getParameter(
				"newValue").replace(/,/g, "")) / 100.00);
			var FinalGrossPrice = this.oMdlPricing.getData().EditRecord.GrossPrice - this.oMdlPricing.getData().EditRecord.DiscAmountAVat;
			this.oMdlPricing.getData().EditRecord.DPAmount = FinalGrossPrice * (this.oMdlPricing.getData().EditRecord.DPPercent / 100.0);
			this.oMdlPricing.getData().EditRecord.DPNetAmount = ((this.oMdlPricing.getData().EditRecord.DPAmount - this.oMdlPricing.getData()
				.EditRecord.RsvFee) < 0) ? 0 : (this.oMdlPricing.getData().EditRecord.DPAmount - this.oMdlPricing.getData()
				.EditRecord.RsvFee);
			this.oMdlPricing.getData().EditRecord.MFAmount = (FinalGrossPrice) * (this.oMdlPricing.getData().EditRecord.MFPercent / 100.00);
			this.oMdlPricing.getData().EditRecord.RBAmount = (FinalGrossPrice - this.oMdlPricing.getData().EditRecord.DPNetAmount);
		},
		onChangeDiscAmountAVat: function (oEvent) {
			this.oMdlPricing.getData().EditRecord.DiscPercentAVat = (parseFloat(oEvent.getParameter(
				"newValue").replace(/,/g, "")) / this.oMdlPricing.getData().EditRecord.GrossPrice) * 100.00;
			var FinalGrossPrice = this.oMdlPricing.getData().EditRecord.GrossPrice - this.oMdlPricing.getData().EditRecord.DiscAmountAVat;
			this.oMdlPricing.getData().EditRecord.DPAmount = FinalGrossPrice * (this.oMdlPricing.getData().EditRecord.DPPercent / 100.0);
			this.oMdlPricing.getData().EditRecord.DPNetAmount = ((this.oMdlPricing.getData().EditRecord.DPAmount - this.oMdlPricing.getData()
				.EditRecord.RsvFee) < 0) ? 0 : (this.oMdlPricing.getData().EditRecord.DPAmount - this.oMdlPricing.getData()
				.EditRecord.RsvFee);
			this.oMdlPricing.getData().EditRecord.MFAmount = (FinalGrossPrice) * (this.oMdlPricing.getData().EditRecord.MFPercent / 100.00);
			this.oMdlPricing.getData().EditRecord.RBAmount = (FinalGrossPrice - this.oMdlPricing.getData().EditRecord.DPNetAmount);
		},
		onChangeDPPercent: function (oEvent) {
			var FinalGrossPrice = this.oMdlPricing.getData().EditRecord.GrossPrice - this.oMdlPricing.getData().EditRecord.DiscAmountAVat;
			this.oMdlPricing.getData().EditRecord.DPAmount = FinalGrossPrice * ((parseFloat(oEvent.getParameter("newValue").replace(/,/g, ""))) /
				100.0);
			this.oMdlPricing.getData().EditRecord.DPNetAmount = ((this.oMdlPricing.getData().EditRecord.DPAmount - this.oMdlPricing.getData()
				.EditRecord.RsvFee) < 0) ? 0 : (this.oMdlPricing.getData().EditRecord.DPAmount - this.oMdlPricing.getData()
				.EditRecord.RsvFee);
			this.oMdlPricing.getData().EditRecord.MFAmount = (FinalGrossPrice) * (this.oMdlPricing.getData().EditRecord.MFPercent / 100.00);
			this.oMdlPricing.getData().EditRecord.RBAmount = (FinalGrossPrice - this.oMdlPricing.getData().EditRecord.DPNetAmount);
		},
		onChangeDPAmount: function (oEvent) {
			var FinalGrossPrice = this.oMdlPricing.getData().EditRecord.GrossPrice - this.oMdlPricing.getData().EditRecord.DiscAmountAVat;
			this.oMdlPricing.getData().EditRecord.DPPercent = (parseFloat(oEvent.getParameter("newValue").replace(/,/g, "")) / FinalGrossPrice) *
				100.00;
			this.oMdlPricing.getData().EditRecord.DPNetAmount = ((this.oMdlPricing.getData().EditRecord.DPAmount - this.oMdlPricing.getData()
				.EditRecord.RsvFee) < 0) ? 0 : (this.oMdlPricing.getData().EditRecord.DPAmount - this.oMdlPricing.getData()
				.EditRecord.RsvFee);
			this.oMdlPricing.getData().EditRecord.MFAmount = (FinalGrossPrice) * (this.oMdlPricing.getData().EditRecord.MFPercent / 100.00);
			this.oMdlPricing.getData().EditRecord.RBAmount = (FinalGrossPrice - this.oMdlPricing.getData().EditRecord.DPNetAmount);
		},
		onChangeRsvFee: function (oEvent) {
			var FinalGrossPrice = this.oMdlPricing.getData().EditRecord.GrossPrice - this.oMdlPricing.getData().EditRecord.DiscAmountAVat;
			this.oMdlPricing.getData().EditRecord.DPNetAmount = ((this.oMdlPricing.getData().EditRecord.DPAmount - (parseFloat(oEvent.getParameter(
				"newValue").replace(/,/g, "")))) < 0) ? 0 : (this.oMdlPricing.getData().EditRecord.DPAmount - (parseFloat(oEvent.getParameter(
				"newValue").replace(/,/g, ""))));
			this.oMdlPricing.getData().EditRecord.MFAmount = (FinalGrossPrice) * (this.oMdlPricing.getData().EditRecord.MFPercent / 100.00);
			this.oMdlPricing.getData().EditRecord.RBAmount = (FinalGrossPrice - this.oMdlPricing.getData().EditRecord.DPNetAmount);

			var rsrvFeeValue = oEvent.getParameter("newValue").replace(/,/g, "");
			if (rsrvFeeValue > 0) {

				var filteredRows = this.oMdlTerms.getData().EditRecord.filter(function (value, index, arr) {
					return (value.LineNum > 1);
				});

				this.oMdlTerms.getData().EditRecord = filteredRows;

				var oReserveRow = {};
				oReserveRow.LineNum = 1;
				oReserveRow.Amount = rsrvFeeValue;
				oReserveRow.TranType = [{
					"Code": "1",
					"Desc": "Reservation"
				}, {
					"Code": "2",
					"Desc": "Downpayment"
				}, {
					"Code": "3",
					"Desc": "Remaining Balance"
				}, {
					"Code": "4",
					"Desc": "Misc Fee"
				}];
				oReserveRow.SelectedTranType = "1";
				oReserveRow.Percent = 100;
				oReserveRow.Interest = 0;
				oReserveRow.Terms = 1;

				oReserveRow.StartDate = (this.currentDate.getMonth() + 1) + "/" + this.currentDate.getDate() + "/" + this.currentDate.getFullYear();
				oReserveRow.FinanceScheme = "5";

				this.oMdlTerms.getData().EditRecord.push(oReserveRow);
				this.oMdlTerms.refresh();

			}
		},
		onChangeMFPercent: function (oEvent) {
			var FinalGrossPrice = this.oMdlPricing.getData().EditRecord.GrossPrice - this.oMdlPricing.getData().EditRecord.DiscAmountAVat;
			this.oMdlPricing.getData().EditRecord.MFAmount = (FinalGrossPrice) * ((parseFloat(oEvent.getParameter("newValue").replace(/,/g, ""))) /
				100.00);
		},
		onChangeMFAmount: function (oEvent) {
			var FinalGrossPrice = this.oMdlPricing.getData().EditRecord.GrossPrice - this.oMdlPricing.getData().EditRecord.DiscAmountAVat;
			this.oMdlPricing.getData().EditRecord.MFPercent = (parseFloat(oEvent.getParameter("newValue").replace(/,/g, "")) / FinalGrossPrice) *
				100.00;
		},
		computePricingTab: function (isClear, startPrice) {
			if (isClear) {
				this.oMdlPricing.getData().EditRecord.GrossPrice = 0;
				this.oMdlPricing.getData().EditRecord.PriceTotal = 0;
				this.oMdlPricing.getData().EditRecord.DiscPercentBVat = 0;
				this.oMdlPricing.getData().EditRecord.DiscAmountBVat = 0;
				this.oMdlPricing.getData().EditRecord.TaxMatrixCode = "1";
				this.oMdlPricing.getData().EditRecord.TaxAmount = 0;
				this.oMdlPricing.getData().EditRecord.PenaltyPercent = 0;
				this.oMdlPricing.getData().EditRecord.NetPrice = 0;
				this.oMdlPricing.getData().EditRecord.DiscPercentAVat = 0;
				this.oMdlPricing.getData().EditRecord.DiscAmountAVat = 0;
				this.oMdlPricing.getData().EditRecord.GrossPrice = 0;
				this.oMdlPricing.getData().EditRecord.EWTRate = 0;
				this.oMdlPricing.getData().EditRecord.DPPercent = 0;
				this.oMdlPricing.getData().EditRecord.DPAmount = 0;
				this.oMdlPricing.getData().EditRecord.RBPercent = 0;
				this.oMdlPricing.getData().EditRecord.RBAmount = 0;
				this.oMdlPricing.getData().EditRecord.MFPercent = 0;
				this.oMdlPricing.getData().EditRecord.MFAmount = 0;
				this.oMdlPricing.refresh();
			} else {

				if (startPrice !== 0) {
					this.oMdlPricing.getData().EditRecord.DiscAmountBVat = this.oMdlPricing.getData().EditRecord.PriceTotal * (this.oMdlPricing.getData()
						.EditRecord.DiscPercentBVat / 100);
					this.oMdlPricing.getData().EditRecord.NetPrice = this.oMdlPricing.getData().EditRecord.PriceTotal - this.oMdlPricing.getData().EditRecord
						.DiscAmountBVat;
					this.oMdlPricing.getData().EditRecord.TaxAmount = this.oMdlPricing.getData().EditRecord.NetPrice * (this.oMdlPricing.getData().EditRecord
						._TaxRate / 100);
					this.oMdlPricing.getData().EditRecord.GrossPrice = this.oMdlPricing.getData().EditRecord.NetPrice - this.oMdlPricing.getData().EditRecord
						.TaxAmount;
					this.oMdlPricing.getData().EditRecord.DiscAmountAVat = this.oMdlPricing.getData().EditRecord.GrossPrice * (this.oMdlPricing.getData()
						.EditRecord.DiscPercentAVat / 100.00);
					var FinalGrossPrice = this.oMdlPricing.getData().EditRecord.GrossPrice - this.oMdlPricing.getData().EditRecord.DiscAmountAVat;
					this.oMdlPricing.getData().EditRecord.DPAmount = FinalGrossPrice * (this.oMdlPricing.getData().EditRecord.DPPercent / 100.0);
					this.oMdlPricing.getData().EditRecord.DPNetAmount = ((this.oMdlPricing.getData().EditRecord.DPAmount - this.oMdlPricing.getData()
						.EditRecord.RsvFee) < 0) ? 0 : (this.oMdlPricing.getData().EditRecord.DPAmount - this.oMdlPricing.getData()
						.EditRecord.RsvFee);
					this.oMdlPricing.getData().EditRecord.MFAmount = (FinalGrossPrice) * (this.oMdlPricing.getData().EditRecord.MFPercent / 100.00);
					this.oMdlPricing.getData().EditRecord.RBAmount = (FinalGrossPrice - this.oMdlPricing.getData().EditRecord.DPNetAmount);
				}

			}

			this.oMdlPricing.refresh();
		},
		onClearAdd: function () {
			try {
				this.oMdlEditRecord.getData().EditRecord.Code = "";
				this.oMdlEditRecord.getData().EditRecord.QuoteNum = "";
				this.oMdlEditRecord.getData().EditRecord.DocStatus = "1";
				this.oMdlEditRecord.getData().EditRecord.CustomerCode = "";
				this.oMdlEditRecord.getData().EditRecord.CustomerName = "";
				this.oMdlEditRecord.getData().EditRecord.Remarks = "";
				this.oMdlEditRecord.refresh();

				this.computePricingTab(true, 0);

				this.oMdlUnitTable.getData().unitrows.length = 0;
				this.oMdlTerms.getData().EditRecord.length = 0;
				this.oMdlTerms.getData().NetDP = 0;
				this.oMdlTerms.getData().NetRB = 0;
				this.oMdlTerms.getData().NetMF = 0;
				this.oMdlUnitTable.refresh();
				this.oMdlTerms.refresh();
				this.oMdlPricing.refresh();

				this.getView().byId("idIconTabBarInlineMode").getItems()[1].setText("RECORD [ADD]");
				var tab = this.getView().byId("idIconTabBarInlineMode");
				tab.setSelectedKey("tab2");

				this.bIsAdd = "A";
			} catch (err) {
				//console.log(err.message);
			}

		},
		//PRICING EVENTS-------------------------

		//TERMS AND SCHEDULE TAB----------------------
		onSelectIconTabBarAddEdit: function (oEvent) {

			this.oMdlTerms.getData().NetDP = this.oMdlPricing.getData().EditRecord.DPNetAmount;
			this.oMdlTerms.getData().NetRB = this.oMdlPricing.getData().EditRecord.RBAmount;
			this.oMdlTerms.getData().NetMF = this.oMdlPricing.getData().EditRecord.MFAmount;

			this.oMdlTerms.refresh();

		},
		onAddSched: function (oEvent) {
			this.hasChangedTerms = true;
			var oReserveRow = {};
			oReserveRow.LineNum = 1;
			oReserveRow.Amount = 0;
			oReserveRow.TranType = [{
				"Code": "1",
				"Desc": "Reservation"
			}, {
				"Code": "2",
				"Desc": "Downpayment"
			}, {
				"Code": "3",
				"Desc": "Remaining Balance"
			}, {
				"Code": "4",
				"Desc": "Misc Fee"
			}];
			oReserveRow.SelectedTranType = "1";
			oReserveRow.Percent = 0;
			oReserveRow.Interest = 0;
			oReserveRow.Terms = 1;
			oReserveRow.StartDate = (this.currentDate.getMonth() + 1) + "/" + this.currentDate.getDate() + "/" + this.currentDate.getFullYear();
			oReserveRow.FinanceScheme = "1";

			this.oMdlTerms.getData().EditRecord.push(oReserveRow);
			this.oMdlTerms.refresh();
		},
		onRemoveSched: function (oEvent) {
			this.oMdlTerms.getData().EditRecord.splice(this.oTableSchedule.getSelectedIndex(), 1);
			this.oMdlTerms.refresh();

		},
		onSelectionChangeTranType: function (oEvent) {
			//console.log("onSelectionChangeTranType");
		},
		onChangeTermPercent: function (oEvent) {
			// 2 / 3 / 4 for DP RB MF getSelectedKey()
			if (oEvent.getSource().getParent().getCells()[0].getSelectedKey() === "1") {
				var dialog = new Dialog({
					title: "Error",
					type: "Message",
					state: "Error",
					content: new Text({
						text: "You cannot breakdown further the Reservation Term."
					}),
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: "OK",
						press: function () {
							dialog.close();
						}
					}),
					afterClose: function () {
						dialog.destroy();
					}
				});
			} else {
				var oRow = oEvent.getSource().getParent();
				var iIndex = oRow.getIndex();
				switch (oEvent.getSource().getParent().getCells()[0].getSelectedKey()) {
				case "2":
					this.oMdlTerms.getData().EditRecord[iIndex].Amount =
						this.oMdlTerms.getData().NetDP * (this.oMdlTerms.getData().EditRecord[iIndex].Percent / 100.00);
					break;
				case "3":
					this.oMdlTerms.getData().EditRecord[iIndex].Amount =
						this.oMdlTerms.getData().NetRB * (this.oMdlTerms.getData().EditRecord[iIndex].Percent / 100.00);
					break;
				case "4":
					this.oMdlTerms.getData().EditRecord[iIndex].Amount =
						this.oMdlTerms.getData().NetMF * (this.oMdlTerms.getData().EditRecord[iIndex].Percent / 100.00);
					break;
				}
			}

		},
		//TERMS AND SCHEDULE TAB----------------------

		//BP FRAGMENT -------------------
		handleValueHelpBP: function () {
			if (!this._oValueHelpDialog) {
				Fragment.load({
					name: "com.apptech.realestate.view.fragments.BPDialogFragment",
					controller: this
				}).then(function (oValueHelpDialog) {
					this._oValueHelpDialog = oValueHelpDialog;
					this.getView().addDependent(this._oValueHelpDialog);
					this._configValueHelpDialog();
					this._oValueHelpDialog.open();
				}.bind(this));
			} else {
				this._configValueHelpDialog();
				this._oValueHelpDialog.open();
			}
		},
		_configValueHelpDialog: function () {
			var sInputValue = this.byId("bpInput").getValue(),
				oModel = this.getView().getModel("oMdlAllBP"),
				aList = oModel.getProperty("/allbp");

			aList.forEach(function (oRecord) {
				oRecord.selected = (oRecord.Name === sInputValue);
			});
		},
		handleValueHelpCloseBP: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			var BPDetails = {};
			if (aContexts && aContexts.length) {
				BPDetails = aContexts.map(function (oContext) {
					var oBPDetails = {};
					oBPDetails.CustomerCode = oContext.getObject().CustomerCode;
					oBPDetails.CustomerName = oContext.getObject().FirstName + " " + oContext.getObject().MiddleName + " " + oContext.getObject().LastName;
					return oBPDetails;
				});
			}
			oEvent.getSource().getBinding("items").filter([]);
			this.oMdlEditRecord.getData().EditRecord.CustomerCode = BPDetails[0].CustomerCode;
			this.oMdlEditRecord.getData().EditRecord.CustomerName = BPDetails[0].CustomerName;
			this.oMdlEditRecord.refresh();
		},
		//BP FRAGMENT -------------------

		//MAIN FUNCTION-------------------------
		onAdd: function (oEvent) {
			this.onClearAdd();
		},
		onSave: function (oEvent) {
			this.oPage.setBusy(true);
			this.onSaveProcess();
			this.oPage.setBusy(false);
		},
		onSaveProcess: function () {

			var oRecord = {};
			var QuoteNum = "";
			oRecord.T_RE_QUOTE_H = [];
			oRecord.T_RE_QUOTE_D = [];
			oRecord.T_RE_QUOTE_PRICE_D = [];
			oRecord.T_TERMS_QUOTE_DP = [];
			oRecord.T_TERMS_QUOTE_RB = [];
			oRecord.T_TERMS_QUOTE_MF = [];

			var oExistingRecordsUnit = [];
			var oExistingRecordsTermDP = [];
			var oExistingRecordsTermRB = [];
			var oExistingRecordsTermMF = [];

			//ON EDIT / ON SAVE RECORD OBJECT
			var oT_RE_QUOTE_H = {};

			var oT_RE_QUOTE_PRICE_D = {};

			var i = 0;

			if (this.bIsAdd === "E") {
				QuoteNum = this.oMdlEditRecord.getData().EditRecord.QuoteNum;

				//Record data for T_RE_QUOTE_H
				oT_RE_QUOTE_H.O = "U";
				oT_RE_QUOTE_H.Code = this.oMdlEditRecord.getData().EditRecord.Code;
				oT_RE_QUOTE_H.QuoteNum = this.oMdlEditRecord.getData().EditRecord.QuoteNum;
				oT_RE_QUOTE_H.DocStatus = "1";
				oT_RE_QUOTE_H.CustomerCode = this.oMdlEditRecord.getData().EditRecord.CustomerCode;

				//Record data for T_RE_QUOTE_D

				oExistingRecordsUnit = AppUI5.getAllDataByColAJAX("", "", this.oMdlEditRecord.getData().EditRecord.QuoteNum,
					"QuoteGetExistingUnits");
				for (i = 0; i < oExistingRecordsUnit.length; i++) {
					oExistingRecordsUnit[i].O = "U";
					oExistingRecordsUnit[i].IsActive = "N";
				}

				oExistingRecordsTermDP = AppUI5.getAllDataByColAJAX("", "", this.oMdlEditRecord.getData().EditRecord.QuoteNum,
					"QuoteGetExistingTermsDP");
				for (i = 0; i < oExistingRecordsTermDP.length; i++) {
					oExistingRecordsTermDP[i].O = "U";
					oExistingRecordsTermDP[i].IsActive = "N";
				}

				oExistingRecordsTermRB = AppUI5.getAllDataByColAJAX("", "", this.oMdlEditRecord.getData().EditRecord.QuoteNum,
					"QuoteGetExistingTermsRB");
				for (i = 0; i < oExistingRecordsTermRB.length; i++) {
					oExistingRecordsTermRB[i].O = "U";
					oExistingRecordsTermRB[i].IsActive = "N";
				}

				oExistingRecordsTermMF = AppUI5.getAllDataByColAJAX("", "", this.oMdlEditRecord.getData().EditRecord.QuoteNum,
					"QuoteGetExistingTermsMF");
				for (i = 0; i < oExistingRecordsTermMF.length; i++) {
					oExistingRecordsTermMF[i].O = "U";
					oExistingRecordsTermMF[i].IsActive = "N";
				}

				//Record Data for T_RE_QUOTE_PRICE_D
				oT_RE_QUOTE_PRICE_D.O = "U";

			} else if (this.bIsAdd === "A") {
				QuoteNum = AppUI5.generateNumber("Quote")[0].Code;

				//Record data for T_RE_QUOTE_H
				oT_RE_QUOTE_H.O = "I";
				oT_RE_QUOTE_H.Code = AppUI5.generateUDTCode();
				oT_RE_QUOTE_H.QuoteNum = QuoteNum;
				oT_RE_QUOTE_H.DocStatus = "1";
				oT_RE_QUOTE_H.CustomerCode = this.oMdlEditRecord.getData().EditRecord.CustomerCode;

				oT_RE_QUOTE_PRICE_D.O = "I";

			} else {
				jQuery.sap.log.error("Please specify actions to perform");
				return;
			}

			//OPERATIONS AFTER EDIT / ADD

			for (i = 0; i < this.oMdlUnitTable.getData().unitrows.length; i++) {
				var oT_RE_QUOTE_D = {};
				oT_RE_QUOTE_D.O = "I";
				oT_RE_QUOTE_D.Code = AppUI5.generateUDTCode();
				oT_RE_QUOTE_D.LineNum = i + 1;
				oT_RE_QUOTE_D.QuoteNum = QuoteNum;
				oT_RE_QUOTE_D.UnitCode = this.oMdlUnitTable.getData().unitrows[i].UnitCode;
				oT_RE_QUOTE_D.Price = this.oMdlUnitTable.getData().unitrows[i].Price;
				oRecord.T_RE_QUOTE_D.push(oT_RE_QUOTE_D);
			}
			Array.prototype.push.apply(oRecord.T_RE_QUOTE_D, oExistingRecordsUnit);

			oRecord.T_RE_QUOTE_H.push(oT_RE_QUOTE_H);

			//Record data for T_RE_QUOTE_PRICE_D
			oT_RE_QUOTE_PRICE_D.Code = (oT_RE_QUOTE_PRICE_D.O === "I") ? AppUI5.generateUDTCode() : this.oMdlPricing.getData().EditRecord.Code;
			oT_RE_QUOTE_PRICE_D.QuoteNum = QuoteNum;
			oT_RE_QUOTE_PRICE_D.PriceTotal = this.oMdlPricing.getData().EditRecord.PriceTotal;
			oT_RE_QUOTE_PRICE_D.PenaltyPercent = this.oMdlPricing.getData().EditRecord.PenaltyPercent;
			oT_RE_QUOTE_PRICE_D.DiscPercentBVat = this.oMdlPricing.getData().EditRecord.DiscPercentBVat;
			oT_RE_QUOTE_PRICE_D.DiscAmountBVat = this.oMdlPricing.getData().EditRecord.DiscAmountBVat;
			oT_RE_QUOTE_PRICE_D.NetPrice = this.oMdlPricing.getData().EditRecord.NetPrice;
			oT_RE_QUOTE_PRICE_D.TaxMatrixCode = this.oMdlPricing.getData().EditRecord.TaxMatrixCode;
			oT_RE_QUOTE_PRICE_D.TaxAmount = this.oMdlPricing.getData().EditRecord.TaxAmount;
			oT_RE_QUOTE_PRICE_D.GrossPrice = this.oMdlPricing.getData().EditRecord.GrossPrice;
			oT_RE_QUOTE_PRICE_D.DiscPercentAVat = this.oMdlPricing.getData().EditRecord.DiscPercentAVat;
			oT_RE_QUOTE_PRICE_D.DiscAmountAVat = this.oMdlPricing.getData().EditRecord.DiscAmountAVat;
			oT_RE_QUOTE_PRICE_D.EWTRate = this.oMdlPricing.getData().EditRecord.EWTRate;
			oT_RE_QUOTE_PRICE_D.RsvFee = this.oMdlPricing.getData().EditRecord.RsvFee;
			oT_RE_QUOTE_PRICE_D.DPPercent = this.oMdlPricing.getData().EditRecord.DPPercent;
			oT_RE_QUOTE_PRICE_D.DPAmount = this.oMdlPricing.getData().EditRecord.DPAmount;
			oT_RE_QUOTE_PRICE_D.DPNetAmount = this.oMdlPricing.getData().EditRecord.DPNetAmount;
			oT_RE_QUOTE_PRICE_D.RBpercent = this.oMdlPricing.getData().EditRecord.RBpercent;
			oT_RE_QUOTE_PRICE_D.RBAmount = this.oMdlPricing.getData().EditRecord.RBAmount;
			oT_RE_QUOTE_PRICE_D.MFPercent = this.oMdlPricing.getData().EditRecord.MFPercent;
			oT_RE_QUOTE_PRICE_D.MFAmount = this.oMdlPricing.getData().EditRecord.MFAmount;

			oRecord.T_RE_QUOTE_PRICE_D.push(oT_RE_QUOTE_PRICE_D);

			// Record data for T_TERMS_QUOTE_DP
			var filteredDPRows = this.oMdlTerms.getData().EditRecord.filter(function (value, index, arr) {
				return value.SelectedTranType === "2" || value.SelectedTranType === "1";
			});

			var d;
			for (d = 0; d < filteredDPRows.length; d++) {
				var iLineNumDP = d + 1;
				var oT_TERMS_QUOTE_DP = {};
				oT_TERMS_QUOTE_DP.O = "I";
				oT_TERMS_QUOTE_DP.Code = AppUI5.generateUDTCode();
				oT_TERMS_QUOTE_DP.QuoteNum = QuoteNum;
				oT_TERMS_QUOTE_DP.LineNum = iLineNumDP;
				oT_TERMS_QUOTE_DP.Amount = filteredDPRows[d].Amount;
				oT_TERMS_QUOTE_DP.Percent = filteredDPRows[d].Percent;
				oT_TERMS_QUOTE_DP.Interest = filteredDPRows[d].Interest;
				oT_TERMS_QUOTE_DP.TranType = filteredDPRows[d].SelectedTranType;
				oT_TERMS_QUOTE_DP.Terms = filteredDPRows[d].Terms;
				oT_TERMS_QUOTE_DP.StartDate = filteredDPRows[d].StartDate;
				oT_TERMS_QUOTE_DP.FinanceScheme = filteredDPRows[d].FinanceScheme;

				oRecord.T_TERMS_QUOTE_DP.push(oT_TERMS_QUOTE_DP);
			}
			Array.prototype.push.apply(oRecord.T_TERMS_QUOTE_DP, oExistingRecordsTermDP);

			//Record data for T_TERMS_QUOTE_RB
			var filteredRBRows = this.oMdlTerms.getData().EditRecord.filter(function (value, index, arr) {
				return value.SelectedTranType === "3";
			});

			var r;
			for (r = 0; r < filteredRBRows.length; r++) {
				var iLineNumRB = r + 1;
				var oT_TERMS_QUOTE_RB = {};
				oT_TERMS_QUOTE_RB.O = "I";
				oT_TERMS_QUOTE_RB.Code = AppUI5.generateUDTCode();
				oT_TERMS_QUOTE_RB.QuoteNum = QuoteNum;
				oT_TERMS_QUOTE_RB.LineNum = iLineNumRB;
				oT_TERMS_QUOTE_RB.Amount = filteredRBRows[r].Amount;
				oT_TERMS_QUOTE_RB.Percent = filteredRBRows[r].Percent;
				oT_TERMS_QUOTE_RB.Interest = filteredRBRows[r].Interest;
				oT_TERMS_QUOTE_RB.Terms = filteredRBRows[r].Terms;
				oT_TERMS_QUOTE_RB.StartDate = filteredRBRows[r].StartDate;
				oT_TERMS_QUOTE_RB.FinanceScheme = filteredRBRows[r].FinanceScheme;

				oRecord.T_TERMS_QUOTE_RB.push(oT_TERMS_QUOTE_RB);
			}

			Array.prototype.push.apply(oRecord.T_TERMS_QUOTE_RB, oExistingRecordsTermRB);

			//Record data for T_TERMS_QUOTE_MF
			var filteredMFRows = this.oMdlTerms.getData().EditRecord.filter(function (value, index, arr) {
				return value.SelectedTranType === "4";
			});

			var m;
			for (m = 0; m < filteredMFRows.length; m++) {
				var iLineNumMF = m + 1;
				var oT_TERMS_QUOTE_MF = {};
				oT_TERMS_QUOTE_MF.O = "I";
				oT_TERMS_QUOTE_MF.Code = AppUI5.generateUDTCode();
				oT_TERMS_QUOTE_MF.QuoteNum = QuoteNum;
				oT_TERMS_QUOTE_MF.LineNum = iLineNumMF;
				oT_TERMS_QUOTE_MF.Amount = filteredMFRows[m].Amount;
				oT_TERMS_QUOTE_MF.Percent = filteredMFRows[m].Percent;
				oT_TERMS_QUOTE_MF.Interest = filteredMFRows[m].Interest;
				oT_TERMS_QUOTE_MF.Terms = filteredMFRows[m].Terms;
				oT_TERMS_QUOTE_MF.StartDate = filteredMFRows[m].StartDate;
				oT_TERMS_QUOTE_MF.FinanceScheme = filteredMFRows[m].FinanceScheme;

				oRecord.T_TERMS_QUOTE_MF.push(oT_TERMS_QUOTE_MF);
			}

			Array.prototype.push.apply(oRecord.T_TERMS_QUOTE_MF, oExistingRecordsTermMF);

			this.oPage.setBusy(false);
			var that = this;

			//SAVING
			MessageBox.show(
				"Do you want to save this record?", {
					styleClass: "sapUiSizeCompact",
					actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
					onClose: function (oAction) {
						if (oAction === sap.m.MessageBox.Action.YES) {
							var resultAjaxCall = AppUI5.postData(oRecord);
							if (resultAjaxCall === 0) {
								MessageToast.show("Saved Successfully " + QuoteNum);
								that.prepareTable(false);
							} else {
								MessageToast.show("Error");
								jQuery.sap.log.error("Error on onSave() Quotation controller");
							}
						}
					}
				}
			);

		},
		onEdit: function (oEvent) {
			var iIndex = this.oTable.getSelectedIndex();
			var sQueryTable = "T_RE_QUOTE_H";
			var sCode = "";
			if (iIndex != -1) {
				var oRowSelected = this.oTable.getBinding().getModel().getData().rows[this.oTable.getBinding().aIndices[iIndex]];
				sCode = oRowSelected.Code;
				//AJAX selected Key

				var oResult = AppUI5.getAllDataByKeyAJAX(sQueryTable, sCode, "QuoteGetHeader");
				oResult = JSON.stringify(oResult).replace("[", "").replace("]", "");
				this.oMdlEditRecord.setJSON("{\"EditRecord\" : " + oResult + "}");
				this.getView().setModel(this.oMdlEditRecord, "oMdlEditRecord");
				this.getView().byId("idIconTabBarInlineMode").getItems()[1].setText("Record Code : " + this.oMdlEditRecord.getData().EditRecord.QuoteNum +
					" [EDIT]");

				var oResult2 = AppUI5.getAllDataByColAJAX("", "", this.oMdlEditRecord.getData().EditRecord.QuoteNum, "QuoteGetUnit");
				var aQuoteUnits = oResult2.filter(function (unit) {
					return unit.IsActive !== "N";
				});
				this.oMdlUnitTable.setJSON("{\"unitrows\" : " + JSON.stringify(aQuoteUnits) + "}");
				this.oMdlUnitTable.refresh();

				var initialValue = 0;
				this.iTotalSellingPrice = this.oMdlUnitTable.getData().unitrows.reduce(function (total, currentValue) {
					return total + currentValue.Price;
				}, initialValue);

				var oResult3 = AppUI5.getAllDataByColAJAX("", "", this.oMdlEditRecord.getData().EditRecord.QuoteNum, "QuoteGetPrice");
				var testResult3 = "{\"EditRecord\" : " + JSON.stringify(oResult3).replace("[", "").replace("]", "") + "}";
				this.oMdlPricing.setJSON(testResult3);
				this.oMdlPricing.refresh();

				var oResult4 = AppUI5.getAllDataByColAJAX("", "", this.oMdlEditRecord.getData().EditRecord.QuoteNum, "QuoteGetTerms");
				for (var i = 0; i < oResult4.length; i++) {
					oResult4[i].TranType = [{
						"Code": "1",
						"Desc": "Reservation"
					}, {
						"Code": "2",
						"Desc": "Downpayment"
					}, {
						"Code": "3",
						"Desc": "Remaining Balance"
					}, {
						"Code": "4",
						"Desc": "Misc Fee"
					}];
				}
				var testResult4 = "{\"EditRecord\" : " + JSON.stringify(oResult4) + "}";
				this.oMdlTerms.setJSON(testResult4);
				this.oMdlTerms.refresh();
			}
			this.recordCode = sCode;
			var tab = this.getView().byId("idIconTabBarInlineMode");
			tab.setSelectedKey("tab2");
			this.bIsAdd = "E";
		},
		validateBeforeOnSave: function (oRecordSave) {

		},
		onSelectionChange: function (oEvent) {
			var iIndex = oEvent.getSource().getSelectedIndex();
			if (iIndex !== -1) {
				var oRowSelected = this.oTable.getBinding().getModel().getData().rows[this.oTable.getBinding().aIndices[iIndex]];
				this.prepareTableDetail(oRowSelected.QuoteNum);
			}

		},
		prepareTableDetail: function (paramCode) {

			var aResults = AppUI5.getHANAData("QUOTATION", "GET_TABLEVIEWDETAILS", paramCode, "");

			if (aResults.length !== 0) {

				this.aColsDetails = Object.keys(aResults[0]);
				var i;

				if (this.columnDataDetail.length <= 0) {
					for (i = 0; i < this.aColsDetails.length; i++) {
						this.columnDataDetail.push({
							"columnName": this.aColsDetails[i]
						});
					}
				}

				this.oMdlAllRecordDetail.setData({
					rows: aResults,
					columns: this.columnDataDetail
				});
				var y = true;

				if (y) {
					this.oTableDetail = this.getView().byId(this.tableIdDetail);
					this.oTableDetail.setModel(this.oMdlAllRecordDetail);

					this.oTableDetail.bindColumns("/columns", function (sId, oContext) {
						var columnName = oContext.getObject().columnName;

						return new sap.ui.table.Column({
							label: columnName,
							template: new sap.m.Text({
								text: "{" + columnName + "}"
							})
						});
					});

					this.oTableDetail.bindRows("/rows");
					this.oTableDetail.setSelectionMode("Single");
					this.oTableDetail.setSelectionBehavior("Row");
					this.renameColumnsDetail();
				}

			}

		},
		renameColumnsDetail: function () {
			this.oTableDetail.getColumns()[0].setVisible(false);
		},

		//MAIN FUNCTION-------------------------
	});

});