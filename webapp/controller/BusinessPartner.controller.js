sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"com/apptech/realestate/controller/AppUI5"
], function (Controller, JSONModel, MessageToast, Filter, FilterOperator, AppUI5) {
	"use strict";
	return Controller.extend("com.apptech.realestate.controller.BusinessPartner", {

		onRoutePatternMatched: function (event) {
			this.prepareTable(false);
		},

		onInit: function () {
			var route = this.getOwnerComponent().getRouter().getRoute("BusinessPartner");
			route.attachPatternMatched(this.onRoutePatternMatched, this);

			this.bIsAdd = true;
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
			this.oMdlEditRecord = new JSONModel("model/BusinessPartner.json");
			this.getView().setModel(this.oMdlEditRecord, "oMdlEditRecord");

			//REFERENCES JSON MODELS
			this.oMdlCivilStats = new JSONModel("model/AllCivilStats.json");
			this.getView().setModel(this.oMdlCivilStats, "oMdlCivilStats");

			this.oMdlDocumentsTab = new JSONModel("model/BusinessPartnerDocs.json");
			this.getView().setModel(this.oMdlDocumentsTab, "oMdlDocumentsTab");
			
			this.oMdlBPStatus = new JSONModel();
			
			$.ajax({
				url: "/rexsjs/public/rexsjs/ExecQuery.xsjs?dbName=APP_RE&procName=SPAPP_RE_GETALLDATA&tableName=R_BP_STATUS",
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
					this.oMdlBPStatus.setJSON("{\"allbpstatus\" : " + JSON.stringify(results) + "}");
					this.getView().setModel(this.oMdlBPStatus, "oMdlBPStatus");
				}
			});
			

			this.prepareTable(true);

		},

		prepareTable: function (bIsInit) {
			$.ajax({
				url: "/rexsjs/public/rexsjs/ExecQuery.xsjs?dbName=APP_RE&procName=SPAPP_RE_VIEWTABLE&tableName=M_CUSTOMER&parameterCode=0",
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
						this.oTable = this.getView().byId("tblBP");
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
			this.oTable.getColumns()[1].setLabel("Customer Code");
			this.oTable.getColumns()[1].setFilterProperty("CustomerCode");
			this.oTable.getColumns()[2].setLabel("Full Name");
			this.oTable.getColumns()[2].setFilterProperty("Name");
			this.oTable.getColumns()[3].setLabel("Mobile Number");
			this.oTable.getColumns()[4].setLabel("Email Address");
			this.oTable.getColumns()[5].setLabel("Created Date");
		},

		onEdit: function (oEvent) {

			var iIndex = this.oTable.getSelectedIndex();
			var sQueryTable = "M_CUSTOMER";
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
						.CustomerCode + " [EDIT]");
				});

				var jsonDOC = AppUI5.getAllByColumn("M_CUSTOMER_DOC", "CustomerCode", this.oMdlEditRecord.getData().EditRecord.CustomerCode);
				this.oMdlDocumentsTab.setJSON("{\"EditRecord\" : " + jsonDOC + "}");

			}
			this.recordCode = sCode;

			var tab = this.getView().byId("idIconTabBarInlineMode");
			tab.setSelectedKey("tab2");
			this.bIsAdd = false;

		},

		onAdd: function (oEvent) {
		
			this.oMdlEditRecord.getData().EditRecord.CustomerCode = "";
			this.oMdlEditRecord.getData().EditRecord.StatusCode = 1;
			this.oMdlEditRecord.getData().EditRecord.FirstName = "";
			this.oMdlEditRecord.getData().EditRecord.MiddleName = "";
			this.oMdlEditRecord.getData().EditRecord.LastName = "";
			this.oMdlEditRecord.getData().EditRecord.Title = "";
			this.oMdlEditRecord.getData().EditRecord.AcadTitle = "";
			this.oMdlEditRecord.getData().EditRecord.BirthDate = "01/01/1950";
			this.oMdlEditRecord.getData().EditRecord.BirthPlace = "";
			this.oMdlEditRecord.getData().EditRecord.Gender = "";
			this.oMdlEditRecord.getData().EditRecord.Nationality = "";
			this.oMdlEditRecord.getData().EditRecord.CivilStat = "";
			this.oMdlEditRecord.getData().EditRecord.SpouseName = "";
			this.oMdlEditRecord.getData().EditRecord.TIN = "";
			this.oMdlEditRecord.getData().EditRecord.Email = "";
			this.oMdlEditRecord.getData().EditRecord.LandlineNo = "";
			this.oMdlEditRecord.getData().EditRecord.MobileNo = "";
			this.oMdlEditRecord.getData().EditRecord.ContactPerson = "";
			this.oMdlEditRecord.getData().EditRecord.CntctRelation = "";
			this.oMdlEditRecord.getData().EditRecord.AddressLine1 = "";
			this.oMdlEditRecord.getData().EditRecord.AddressLine2 = "";
			this.oMdlEditRecord.getData().EditRecord.City = "";
			this.oMdlEditRecord.getData().EditRecord.Province = "";
			this.oMdlEditRecord.getData().EditRecord.Country = "";
			this.oMdlEditRecord.getData().EditRecord.PostalCode = "";
			this.oMdlEditRecord.getData().EditRecord.CompanyWork = "";
			this.oMdlEditRecord.getData().EditRecord.EmailWork = "";
			this.oMdlEditRecord.getData().EditRecord.LandlineNoWork = "";
			this.oMdlEditRecord.getData().EditRecord.MobileNoWork = "";
			this.oMdlEditRecord.getData().EditRecord.AddressLine1Work = "";
			this.oMdlEditRecord.getData().EditRecord.AddressLine2Work = "";
			this.oMdlEditRecord.getData().EditRecord.CityWork = "";
			this.oMdlEditRecord.getData().EditRecord.ProvinceWork = "";
			this.oMdlEditRecord.getData().EditRecord.CountryWork = "";
			this.oMdlEditRecord.getData().EditRecord.PostalCodeWork = "";
			this.oMdlEditRecord.getData().EditRecord.WorkingYears = 0;
			this.oMdlEditRecord.getData().EditRecord.PositionWork = "";
			this.oMdlEditRecord.getData().EditRecord.ARAccount = "";
			this.oMdlEditRecord.getData().EditRecord.MktGroup = "";
			this.oMdlEditRecord.getData().EditRecord.MktClassification = "";
			this.oMdlEditRecord.getData().EditRecord.MktCustomerSource = "";
			this.oMdlEditRecord.getData().EditRecord.MktUserDefined1 = "";
			this.oMdlEditRecord.getData().EditRecord.MktUserDefined2 = "";
			this.oMdlEditRecord.getData().EditRecord.MktUserDefined3 = "";
			this.oMdlEditRecord.getData().EditRecord.MktUserDefined4 = "";
			this.oMdlEditRecord.getData().EditRecord.MktUserDefined5 = "";
			this.oMdlEditRecord.refresh();

			this.getView().byId("idIconTabBarInlineMode").getItems()[1].setText("RECORD [ADD]");
			var tab = this.getView().byId("idIconTabBarInlineMode");
			tab.setSelectedKey("tab2");
			this.bIsAdd = true;
		},

		onSelectGender: function (oEvent) {
			var sSelectedKeyGender = oEvent.getSource().getProperty("text");
			this.oMdlEditRecord.getData().EditRecord.Gender = sSelectedKeyGender.toUpperCase();

		},

		onSave: function (oEvent) {
			if (this.bIsAdd) {
				var tableCode = AppUI5.generateUDTCode();
				//Generate CustomerCode
				var customerCode = "";
				$.ajax({
					url: "/rexsjs/public/rexsjs/ExecQuery.xsjs?dbName=APP_RE&procName=SPAPP_RE_GENERATECUSTOMER&lastName=" + this.oMdlEditRecord
						.getData().EditRecord.LastName,
					type: "GET",
					async: false,
					xhrFields: {
						withCredentials: true
					},
					error: function (xhr, status, error) {
						jQuery.sap.log.error("This should never have happened!");
					},
					success: function (json) {
						customerCode = json[0].Code;
					},
					context: this
				}).done(function (results) {
					if (results) {
						customerCode = results[0].Code;
					}
				});
				//prepareJSON object
				var oCustomer = {};
				oCustomer.M_CUSTOMER = [];
				var dataObjectCustomer = {};
				dataObjectCustomer.O = "I";
				dataObjectCustomer.Code = tableCode;
				dataObjectCustomer.CustomerCode = customerCode;
				dataObjectCustomer.StatusCode = this.oMdlEditRecord.getData().EditRecord.StatusCode;
				dataObjectCustomer.FirstName = this.oMdlEditRecord.getData().EditRecord.FirstName;
				dataObjectCustomer.MiddleName = this.oMdlEditRecord.getData().EditRecord.MiddleName;
				dataObjectCustomer.LastName = this.oMdlEditRecord.getData().EditRecord.LastName;
				dataObjectCustomer.Title = this.oMdlEditRecord.getData().EditRecord.Title;
				dataObjectCustomer.AcadTitle = this.oMdlEditRecord.getData().EditRecord.AcadTitle;
				dataObjectCustomer.BirthDate = AppUI5.getDatePostingFormat(this.oMdlEditRecord.getData().EditRecord.BirthDate);
				dataObjectCustomer.BirthPlace = this.oMdlEditRecord.getData().EditRecord.BirthPlace;
				dataObjectCustomer.Gender = this.oMdlEditRecord.getData().EditRecord.Gender;
				dataObjectCustomer.Nationality = this.oMdlEditRecord.getData().EditRecord.Nationality;
				dataObjectCustomer.CivilStat = this.oMdlEditRecord.getData().EditRecord.CivilStat;
				dataObjectCustomer.SpouseName = this.oMdlEditRecord.getData().EditRecord.SpouseName;
				dataObjectCustomer.TIN = this.oMdlEditRecord.getData().EditRecord.TIN;
				dataObjectCustomer.Email = this.oMdlEditRecord.getData().EditRecord.Email;
				dataObjectCustomer.LandlineNo = this.oMdlEditRecord.getData().EditRecord.LandlineNo;
				dataObjectCustomer.MobileNo = this.oMdlEditRecord.getData().EditRecord.MobileNo;
				dataObjectCustomer.ContactPerson = this.oMdlEditRecord.getData().EditRecord.ContactPerson;
				dataObjectCustomer.CntctRelation = this.oMdlEditRecord.getData().EditRecord.CntctRelation;
				dataObjectCustomer.AddressLine1 = this.oMdlEditRecord.getData().EditRecord.AddressLine1;
				dataObjectCustomer.AddressLine2 = this.oMdlEditRecord.getData().EditRecord.AddressLine2;
				dataObjectCustomer.City = this.oMdlEditRecord.getData().EditRecord.City;
				dataObjectCustomer.Province = this.oMdlEditRecord.getData().EditRecord.Province;
				dataObjectCustomer.Country = this.oMdlEditRecord.getData().EditRecord.Country;
				dataObjectCustomer.PostalCode = this.oMdlEditRecord.getData().EditRecord.PostalCode;
				dataObjectCustomer.CompanyWork = this.oMdlEditRecord.getData().EditRecord.CompanyWork;
				dataObjectCustomer.EmailWork = this.oMdlEditRecord.getData().EditRecord.EmailWork;
				dataObjectCustomer.LandlineNoWork = this.oMdlEditRecord.getData().EditRecord.LandlineNoWork;
				dataObjectCustomer.MobileNoWork = this.oMdlEditRecord.getData().EditRecord.MobileNoWork;
				dataObjectCustomer.AddressLine1Work = this.oMdlEditRecord.getData().EditRecord.AddressLine1Work;
				dataObjectCustomer.AddressLine2Work = this.oMdlEditRecord.getData().EditRecord.AddressLine2Work;
				dataObjectCustomer.CityWork = this.oMdlEditRecord.getData().EditRecord.CityWork;
				dataObjectCustomer.ProvinceWork = this.oMdlEditRecord.getData().EditRecord.ProvinceWork;
				dataObjectCustomer.CountryWork = this.oMdlEditRecord.getData().EditRecord.CountryWork;
				dataObjectCustomer.PostalCodeWork = this.oMdlEditRecord.getData().EditRecord.PostalCodeWork;
				dataObjectCustomer.WorkingYears = this.oMdlEditRecord.getData().EditRecord.WorkingYears;
				dataObjectCustomer.PositionWork = this.oMdlEditRecord.getData().EditRecord.PositionWork;
				dataObjectCustomer.ARAccount = this.oMdlEditRecord.getData().EditRecord.ARAccount;
				dataObjectCustomer.MktGroup = this.oMdlEditRecord.getData().EditRecord.MktGroup;
				dataObjectCustomer.MktClassification = this.oMdlEditRecord.getData().EditRecord.MktClassification;
				dataObjectCustomer.MktCustomerSource = this.oMdlEditRecord.getData().EditRecord.MktCustomerSource;
				dataObjectCustomer.MktUserDefined1 = this.oMdlEditRecord.getData().EditRecord.MktUserDefined1;
				dataObjectCustomer.MktUserDefined2 = this.oMdlEditRecord.getData().EditRecord.MktUserDefined2;
				dataObjectCustomer.MktUserDefined3 = this.oMdlEditRecord.getData().EditRecord.MktUserDefined3;
				dataObjectCustomer.MktUserDefined4 = this.oMdlEditRecord.getData().EditRecord.MktUserDefined4;
				dataObjectCustomer.MktUserDefined5 = this.oMdlEditRecord.getData().EditRecord.MktUserDefined5;

				oCustomer.M_CUSTOMER.push(dataObjectCustomer);
				//AJAX Call for Posting
				var resultAjaxCall = AppUI5.postData(oCustomer);
				if (resultAjaxCall === 0) {
					MessageToast.show("Saved Successfully");
				} else {
					MessageToast.show("Error");
				}
			} else {
				//prepareJSON object
				oCustomer = {};
				oCustomer.M_CUSTOMER = [];
				dataObjectCustomer = {};
				dataObjectCustomer.O = "U";
				dataObjectCustomer.Code = this.oMdlEditRecord.getData().EditRecord.Code;
				dataObjectCustomer.CustomerCode = this.oMdlEditRecord.getData().EditRecord.CustomerCode;
				dataObjectCustomer.StatusCode = this.oMdlEditRecord.getData().EditRecord.StatusCode;
				dataObjectCustomer.FirstName = this.oMdlEditRecord.getData().EditRecord.FirstName;
				dataObjectCustomer.MiddleName = this.oMdlEditRecord.getData().EditRecord.MiddleName;
				dataObjectCustomer.LastName = this.oMdlEditRecord.getData().EditRecord.LastName;
				dataObjectCustomer.BirthDate = AppUI5.getDatePostingFormat(this.oMdlEditRecord.getData().EditRecord.BirthDate);
				dataObjectCustomer.BirthPlace = this.oMdlEditRecord.getData().EditRecord.BirthPlace;
				dataObjectCustomer.Gender = this.oMdlEditRecord.getData().EditRecord.Gender;
				dataObjectCustomer.Nationality = this.oMdlEditRecord.getData().EditRecord.Nationality;
				dataObjectCustomer.CivilStat = this.oMdlEditRecord.getData().EditRecord.CivilStat;
				dataObjectCustomer.TIN = this.oMdlEditRecord.getData().EditRecord.TIN;
				dataObjectCustomer.Email = this.oMdlEditRecord.getData().EditRecord.Email;
				dataObjectCustomer.LandlineNo = this.oMdlEditRecord.getData().EditRecord.LandlineNo;
				dataObjectCustomer.MobileNo = this.oMdlEditRecord.getData().EditRecord.MobileNo;
				dataObjectCustomer.ContactPerson = this.oMdlEditRecord.getData().EditRecord.ContactPerson;
				dataObjectCustomer.CntctRelation = this.oMdlEditRecord.getData().EditRecord.CntctRelation;
				dataObjectCustomer.WorkNatureBusiness = this.oMdlEditRecord.getData().EditRecord.WorkNatureBusiness;
				dataObjectCustomer.FundSource = this.oMdlEditRecord.getData().EditRecord.FundSource;
				dataObjectCustomer.WorkingYears = this.oMdlEditRecord.getData().EditRecord.WorkingYears;
				dataObjectCustomer.Referral = this.oMdlEditRecord.getData().EditRecord.Referral;
				dataObjectCustomer.CustomerCode = this.oMdlEditRecord.getData().EditRecord.CustomerCode;
				dataObjectCustomer.FirstName = this.oMdlEditRecord.getData().EditRecord.FirstName;
				dataObjectCustomer.MiddleName = this.oMdlEditRecord.getData().EditRecord.MiddleName;
				dataObjectCustomer.LastName = this.oMdlEditRecord.getData().EditRecord.LastName;
				dataObjectCustomer.Title = this.oMdlEditRecord.getData().EditRecord.Title;
				dataObjectCustomer.AcadTitle = this.oMdlEditRecord.getData().EditRecord.AcadTitle;
				dataObjectCustomer.BirthDate = this.oMdlEditRecord.getData().EditRecord.BirthDate;
				dataObjectCustomer.BirthPlace = this.oMdlEditRecord.getData().EditRecord.BirthPlace;
				dataObjectCustomer.Gender = this.oMdlEditRecord.getData().EditRecord.Gender;
				dataObjectCustomer.Nationality = this.oMdlEditRecord.getData().EditRecord.Nationality;
				dataObjectCustomer.CivilStat = this.oMdlEditRecord.getData().EditRecord.CivilStat;
				dataObjectCustomer.SpouseName = this.oMdlEditRecord.getData().EditRecord.SpouseName;
				dataObjectCustomer.TIN = this.oMdlEditRecord.getData().EditRecord.TIN;
				dataObjectCustomer.Email = this.oMdlEditRecord.getData().EditRecord.Email;
				dataObjectCustomer.LandlineNo = this.oMdlEditRecord.getData().EditRecord.LandlineNo;
				dataObjectCustomer.MobileNo = this.oMdlEditRecord.getData().EditRecord.MobileNo;
				dataObjectCustomer.ContactPerson = this.oMdlEditRecord.getData().EditRecord.ContactPerson;
				dataObjectCustomer.CntctRelation = this.oMdlEditRecord.getData().EditRecord.CntctRelation;
				dataObjectCustomer.AddressLine1 = this.oMdlEditRecord.getData().EditRecord.AddressLine1;
				dataObjectCustomer.AddressLine2 = this.oMdlEditRecord.getData().EditRecord.AddressLine2;
				dataObjectCustomer.City = this.oMdlEditRecord.getData().EditRecord.City;
				dataObjectCustomer.Province = this.oMdlEditRecord.getData().EditRecord.Province;
				dataObjectCustomer.Country = this.oMdlEditRecord.getData().EditRecord.Country;
				dataObjectCustomer.PostalCode = this.oMdlEditRecord.getData().EditRecord.PostalCode;
				dataObjectCustomer.CompanyWork = this.oMdlEditRecord.getData().EditRecord.CompanyWork;
				dataObjectCustomer.EmailWork = this.oMdlEditRecord.getData().EditRecord.EmailWork;
				dataObjectCustomer.LandlineNoWork = this.oMdlEditRecord.getData().EditRecord.LandlineNoWork;
				dataObjectCustomer.MobileNoWork = this.oMdlEditRecord.getData().EditRecord.MobileNoWork;
				dataObjectCustomer.AddressLine1Work = this.oMdlEditRecord.getData().EditRecord.AddressLine1Work;
				dataObjectCustomer.AddressLine2Work = this.oMdlEditRecord.getData().EditRecord.AddressLine2Work;
				dataObjectCustomer.CityWork = this.oMdlEditRecord.getData().EditRecord.CityWork;
				dataObjectCustomer.ProvinceWork = this.oMdlEditRecord.getData().EditRecord.ProvinceWork;
				dataObjectCustomer.CountryWork = this.oMdlEditRecord.getData().EditRecord.CountryWork;
				dataObjectCustomer.PostalCodeWork = this.oMdlEditRecord.getData().EditRecord.PostalCodeWork;
				dataObjectCustomer.WorkingYears = this.oMdlEditRecord.getData().EditRecord.WorkingYears;
				dataObjectCustomer.PositionWork = this.oMdlEditRecord.getData().EditRecord.PositionWork;
				dataObjectCustomer.ARAccount = this.oMdlEditRecord.getData().EditRecord.ARAccount;
				dataObjectCustomer.MktGroup = this.oMdlEditRecord.getData().EditRecord.MktGroup;
				dataObjectCustomer.MktClassification = this.oMdlEditRecord.getData().EditRecord.MktClassification;
				dataObjectCustomer.MktCustomerSource = this.oMdlEditRecord.getData().EditRecord.MktCustomerSource;
				dataObjectCustomer.MktUserDefined1 = this.oMdlEditRecord.getData().EditRecord.MktUserDefined1;
				dataObjectCustomer.MktUserDefined2 = this.oMdlEditRecord.getData().EditRecord.MktUserDefined2;
				dataObjectCustomer.MktUserDefined3 = this.oMdlEditRecord.getData().EditRecord.MktUserDefined3;
				dataObjectCustomer.MktUserDefined4 = this.oMdlEditRecord.getData().EditRecord.MktUserDefined4;
				dataObjectCustomer.MktUserDefined5 = this.oMdlEditRecord.getData().EditRecord.MktUserDefined5;
				oCustomer.M_CUSTOMER.push(dataObjectCustomer);
				//AJAX Call for Posting
				resultAjaxCall = AppUI5.postData(oCustomer);
				if (resultAjaxCall === 0) {
					MessageToast.show("Successfully Updated " + this.oMdlEditRecord.getData().EditRecord.Code);
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
					new Filter("Name", FilterOperator.Contains, sQuery),
					new Filter("CustomerCode", FilterOperator.Contains, sQuery)
				], false);
			}

			this._filter();
		},

		_filter: function () {
			var oFilter = null;

			if (this._oGlobalFilter) {
				oFilter = this._oGlobalFilter;
			}

			this.byId("tblBP").getBinding().filter(oFilter, "Application");
		},

		clearAllFilters: function (oEvent) {
			var oTable = this.getView().byId("tblBP");

			this._oGlobalFilter = null;
			this._filter();

			var aColumns = oTable.getColumns();
			for (var i = 0; i < aColumns.length; i++) {
				oTable.filter(aColumns[i], null);
			}
		}

	});
});