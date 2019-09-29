sap.ui.define([
	"jquery.sap.global",
	"sap/ui/Device",
	"sap/ui/core/Fragment",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/Popover",
	"sap/m/Button",
	"sap/m/library"
], function (jQuery, Device, Fragment, Controller, JSONModel, Popover, Button, mobileLibrary) {
	"use strict";

	return Controller.extend("com.apptech.realestate.controller.Main", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.apptech.realestate.view.Main
		 */

		onInit: function () {
			//this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			// this.model.setData(this.data);
			// this.getView().setModel(this.model);
			//PLACE HOLDER OF PROJECT OBJECT
			this.oMdlMenu = new JSONModel("model/menus.json");
			this.getView().setModel(this.oMdlMenu);

			this.router = this.getOwnerComponent().getRouter();
			this.router.navTo("Dashboard");
			// this.router.attachRoutePatternMatched(this.onRoutePatternMatched.bind(this));
			// this.getView().addEventDelegate({
			// 	onAfterShow: this.onAfterShow.bind(this, this.router),
			// });
		},

		//-------------------------------------------
		onRoutePatternMatched: function (event) {
			var key = event.getParameter("name");
			this.byId("childViewSegmentedButton").setSelectedKey(key);
		},

		onAfterShow: function (router) {
			router.navTo("Dashboard");
		},

		onSelect: function (event) {
			this.router = this.getOwnerComponent().getRouter();
			this.router.navTo(event.getParameter("key"));
		},

		//-------------------------------------------

		onMenuButtonPress: function () {
			var toolPage = this.byId("toolPage");
			toolPage.setSideExpanded(!toolPage.getSideExpanded());
		},

		onIconPress: function (oEvent) {
			this.router.navTo("Dashboard");
		},

		onItemSelect: function (oEvent) {
			var sSelectedMenu = oEvent.getSource().getProperty("selectedKey");
			switch (sSelectedMenu) {
			case "businesspartners":
				this.router.navTo("BusinessPartner");
				break;
			case "pricelist":
				this.router.navTo("Pricelist");
				break;
			case "projects":
				this.router.navTo("Project");
				break;
			case "units":
				this.router.navTo("Unit");
				break;
			case "reservation":
				this.router.navTo("Reservation");
				break;
			case "quotation":
				this.router.navTo("Quotation");
				break;
			case "tax":
				this.router.navTo("TaxMatrix");
				break;
			default:

			} 
		},

		tilePricelist: function (oEvent) {
			var oScrollContainer = this.getView().byId("initialPage");
			var view = sap.ui.view({
				type: sap.ui.core.mvc.ViewType.XML,
				viewName: "com.apptech.realestate.view.Pricelist"
			});

			oScrollContainer.addContent(view);
		}

	});

});