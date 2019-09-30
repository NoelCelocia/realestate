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
	"sap/m/Text"
], function (Controller, JSONModel, MessageToast, Filter, FilterOperator, AppUI5, Fragment, Dialog, ButtonType, Button, Text) {
	"use strict";

	return Controller.extend("com.apptech.realestate.controller.Quotation", {

		onRoutePatternMatched: function (event) {
			document.title = "Real Estate - Quotation";
		},

		onInit: function () {
			var route = this.getOwnerComponent().getRouter().getRoute("Quotation");
			route.attachPatternMatched(this.onRoutePatternMatched, this);

			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

			this.bIsAdd = "0";
			this.oIconTab = this.getView().byId("tab1");
			this.oIconTab2 = this.getView().byId("tab2");
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

			//CREATING TEMPLATE FOR EDITING AND ADDING
			this.oMdlEditRecord = new JSONModel("model/Quotation.json");
			this.getView().setModel(this.oMdlEditRecord, "oMdlEditRecord");

			//CREATING MODEL FOR 
			this.oMdlPricing = new JSONModel("model/QuotationPricing.json");
			this.getView().setModel(this.oMdlPricing, "oMdlPricing");

			this.oMdlAllUnits = new JSONModel();

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

		},

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
			MessageToast.show("Selected action is '" + oEvent.getSource().getText() + "'");
		},
		//ACTION BUTTON---------------------------

		//FOR UNIT TABLE TO POPULATE ------------------
		onAddUnit: function () {
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
			var oRow = this.oTableUnits.getBinding().getModel().getData().unitrows[
				this.oTableUnits.getBinding().aIndices[this.oTableUnits.getSelectedIndex()]
			];
			this.iTotalSellingPrice = this.iTotalSellingPrice - oRow.SellingPrice;

			this.oMdlPricing.getData().EditRecord.PriceTotal = this.iTotalSellingPrice;
			this.oMdlPricing.getData().EditRecord.GrossPrice = this.iTotalSellingPrice;

			var filteredRows = this.oMdlUnitTable.getData().unitrows.filter(function (value, index, arr) {
				return value.UnitCode !== oRow.UnitCode;
			});

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
				this.iTotalSellingPrice += selectedObject.SellingPrice;

				this.oMdlPricing.getData().EditRecord.PriceTotal = this.iTotalSellingPrice;
				this.oMdlPricing.getData().EditRecord.GrossPrice = this.iTotalSellingPrice;

				var aWithoutDummyData = this.oMdlUnitTable.getData().unitrows.filter(function (unitrow) {
					return unitrow.SellingPrice > 0;
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

				oReserveRow.StartDate = (this.currentDate.getMonth() + 1) + "-" + this.currentDate.getDate() + "-" + this.currentDate.getFullYear();
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
				this.oMdlPricing.getData().EditRecord.DiscPercentBVat = "";
				this.oMdlPricing.getData().EditRecord.DiscAmountBVat = 0;
				this.oMdlPricing.getData().EditRecord.TaxMatrixCode = "1";
				this.oMdlPricing.getData().EditRecord.TaxAmount = 0;
				this.oMdlPricing.getData().EditRecord.NetPrice = 0;
				this.oMdlPricing.getData().EditRecord.DiscPercentAVat = "";
				this.oMdlPricing.getData().EditRecord.DiscAmountAVat = 0;
				this.oMdlPricing.getData().EditRecord.GrossPrice = 0;
				this.oMdlPricing.getData().EditRecord.EWTRate = "";
				this.oMdlPricing.getData().EditRecord.DPPercent = "";
				this.oMdlPricing.getData().EditRecord.DPAmount = 0;
				this.oMdlPricing.getData().EditRecord.RBPercent = "";
				this.oMdlPricing.getData().EditRecord.RBAmount = 0;
				this.oMdlPricing.getData().EditRecord.MFPercent = "";
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
				console.log(err.message);
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
			oReserveRow.StartDate = (this.currentDate.getMonth() + 1) + "-" + this.currentDate.getDate() + "-" + this.currentDate.getFullYear();
			oReserveRow.FinanceScheme = "1";

			this.oMdlTerms.getData().EditRecord.push(oReserveRow);
			this.oMdlTerms.refresh();
		},
		onRemoveSched: function (oEvent) {
			this.oMdlTerms.getData().EditRecord.splice(this.oTableSchedule.getSelectedIndex(), 1);
			this.oMdlTerms.refresh();

		},

		onSelectionChangeTranType: function (oEvent) {
			console.log("onSelectionChangeTranType");
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
			}else{
				var oRow = oEvent.getSource().getParent();
				var iIndex = oRow.getIndex();
				switch(oEvent.getSource().getParent().getCells()[0].getSelectedKey()){
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

		},
		validateBeforeOnSave: function (oRecordSave) {

		}

		//MAIN FUNCTION-------------------------
	});

});