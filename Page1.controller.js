sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/Label",
	"sap/m/MessageToast",
	"sap/m/Text",
	"sap/m/TextArea",
	'sap/ui/layout/HorizontalLayout',
	'sap/ui/layout/VerticalLayout',
	'sap/ui/unified/DateRange',
	"sap/ui/model/odata/v2/ODataModel"
], function (BaseController, MessageBox, Utilities, History, Button, Dialog, Label, MessageToast, Text, TextArea, HorizontalLayout,
	VerticalLayout, DateRange, ODataModel) {
	"use strict";

	return BaseController.extend("com.sap.build.standard.pmTimesheetGrunt.controller.Page1", {
		handleRouteMatched: function (oEvent) {

			this.clearing();

			this.getView().byId("disp_conf_btn").setVisible(false); //Display confirmation button will remains invisible till the save button is clicked.

			this.getView().byId("combo1").setEditable(false); //Only after selecting the posting date workorder combo box will be enabled.

			this.oModel = new ODataModel("/sap/opu/odata/sap/ZPRJ_PM_APPS_IH_SRV/", true);

		},

		handleCalendarSelect: function (oEvent) { //Posting date selection from the calendar

			this.NewDate = oEvent.getSource()._getFocusedDate()._oUDate.oDate;
			this.editDate = this.NewDate.toISOString();

			this.year = this.editDate.slice(0, 4);
			this.month = this.editDate.slice(5, 7);
			this.date = this.editDate.slice(8, 10);

			this.full = this.year.concat(this.month, this.date); //Actual date format for posting.

			this.getView().byId("combo1").setEditable(true); //Selecting the posting date workorder combo box will be enabled.

		},

		comboboxSelect: function () { //get the selected workorder number form combo box.

			this.work = this.getView().byId("combo1").getSelectedKey();

			this.tableBind(); // calling the table after selecting the workorder.

		},

		tableBind: function () { //Based on selected workorder number list of operations will be bided in the table

			var put = [];

			var oController = this;

			oController.getView().getModel("workorder").setProperty("/wk", this.work); //Setting Global model for using this value in second screen

			var table = oController.getView().byId("tab1"); //Table declaration.

			var sPath = "/TimesheetSet?$filter=WorkOrder eq '" + this.work + "'";

			this.oModel.read(sPath, {

				filters: [new sap.ui.model.Filter("WorkOrder", sap.ui.model.FilterOperator.EQ, this.work)], //"K1-B01-1")],
				success: function (oData, oResponse) {
					//			console.log("oData", oData);

					var len = oData.results.length;

					oController.SystemStatus = oData.results[0].SystemStatus;
					oController.WorkCenter = oData.results[0].WorkCenter;
					oController.ActivityType = oData.results[1].ActivityType;
					oController.UserStatus = oData.results[0].UserStatus;

					oController.getView().byId("sys_st").setValue(oController.SystemStatus);
					oController.getView().byId("wrk").setValue(oController.WorkCenter);
					oController.getView().byId("act_typ").setValue(oController.ActivityType);
					oController.getView().byId("usr_st").setValue(oController.UserStatus);

					for (var i = 1; i < len; i++) {
						var Operation = oData.results[i].Operation;
						var ConfirmationText = oData.results[i].ConfirmationText;
						var WorkCenter = oData.results[i].WorkCenter;
						var Plant = oData.results[i].Plant;
						var ActualWork = oData.results[i].ActualWork;

						var sham = {
							Operation1: Operation,
							ConfirmationText1: ConfirmationText,
							WorkCenter1: WorkCenter,
							Plant1: Plant,
							ActualWork1: ActualWork
						};
						put.push(sham);

					}

					var oTemplate = new sap.m.ColumnListItem({

						cells: [
							new sap.m.ObjectIdentifier({
								title: "{Operation1}",
								text: "{ConfirmationText1}"
							}),
							new sap.m.Text({
								text: "{WorkCenter1}"
							}),
							new sap.m.Text({
								text: "{Plant1}"
							}),
							new sap.m.Input({
								value: "{Empty1}"
							}),
							new sap.m.Input({
								value: "{ActualWork1}",
								width: "80%"
							}),
							new sap.m.Input({
								value: "{Empty2}"
							})
						]
					});

					oController.oModelJson = new sap.ui.model.json.JSONModel();
					oController.oModelJson.setData({
						tabdata: put
					});
					table.setModel(oController.oModelJson);
					table.bindItems("/tabdata", oTemplate);

				}

			});

		},



		save_btn: function () { //Posting function for creating the Time sheet confirmation

			this.table = sap.ui.core.Fragment.byId("results", "tab3"); //Table declaration for showing the response message in a fragment.

			var oCont = this;

			this.array1 = [];

			this.wrkc = this.getView().byId("wrk").getValue();

			this.acttyp = this.getView().byId("act_typ").getValue();

			this.sysst = this.getView().byId("sys_st").getValue();

			var oTable = this.getView().byId("tab1");
			var oTable_len = oTable.getSelectedItems().length; //Getting the length of table for posting & validation

			if (this.full === undefined || this.full === null || this.full === "") {
			
				jQuery.sap.require("sap.m.MessageBox");
				sap.m.MessageBox.alert("Select posting date", {
					title: "Error",
					onClose: null
				});
			} else if (this.work === undefined || this.work === null || this.work === "") {
			
				jQuery.sap.require("sap.m.MessageBox");
				sap.m.MessageBox.alert("Select Workorder No.", {
					title: "Error",
					onClose: null
				});
			} else if (oTable_len <= "0" || oTable_len === null) {
				jQuery.sap.require("sap.m.MessageBox");
				sap.m.MessageBox.alert("Select the operation", {
					title: "Error",
					onClose: null
				});
			} else {
				
								sap.m.MessageBox.show(
					"Do you want to Confirm Timesheet ?", {
						icon: sap.m.MessageBox.Icon.INFORMATION,
						title: "Confirmation Message",
						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
						onClose: function (oAction) {
				
					if (oAction === "YES") {
						
									var tabitems = oTable.getSelectedItems();

				var op;
				var wc;
				var pl;
				var prs;
				var hrs;
				var ct;

				for (var i = 0; i < oTable_len; i++) {

					op = tabitems[i].getCells()[0].getTitle();
					wc = tabitems[i].getCells()[1].getText();
					pl = tabitems[i].getCells()[2].getText();
					prs = tabitems[i].getCells()[3].getValue();
					hrs = tabitems[i].getCells()[4].getValue();
					ct = tabitems[i].getCells()[5].getValue();

					var obj = {
						"Operation": op,
						"WorkOrder": this.work,
						"PostingDate": this.full,
						"Plant": pl,
						"WorkCenter": wc,
						"PersonnelNumber": prs,
						"Description": ct,
						"Hours": hrs
					};

					this.array1.push(obj);

				}

				var postdata = {
					"WorkOrder": this.work,
					"WorkCenter": this.wrkc,
					"SystemStatus": this.sysst,
					"ActivityType": this.acttyp,
					"TimeSheetH2ISet": this.array1,
					"TimeSheetH2RSet": [{
						"WorkOrder": "",
						"Operation": "",
						"Type": "",
						"Message": ""
					}]
				};

				//	console.log("postdata", postdata);
				var sPath = "/TimesheetHeaderSet";
				this.oModel.create(sPath, postdata, {
					success: function (oData, oResponse) {

						console.log("oData", oData);
						
						var typ = oData.Type;
						console.log("typ", typ);

						oCont.msg1 = oData.TimeSheetH2RSet;

						oCont.soitemfrags.open();

						var oTemplate = new sap.m.ColumnListItem({

							cells: [
								new sap.m.Text({
									text: "{Operation}"
								}),
								new sap.m.Text({
									text: "{Message}"
								})
							]
						});

						var c4Model = new sap.ui.model.json.JSONModel();

						c4Model.setData(oCont.msg1);

						oCont.table.setModel(c4Model);
						oCont.table.bindItems("/results", oTemplate);

					}
				});	
						
						
						
						
					}
						}
						
					});	
						
						


			}

		},

		clearing: function (oEvent) { //This function removes the UI screen values.
		
 //Clearing the variables and arrays
			this.wrkc = "";
			this.acttyp = "";
			this.sysst = "";
			this.array1 = [];
			this.work = "";
			this.full = "";

			var tableDel = this.getView().byId("tab1"); //Destroys the table line item
			tableDel.destroyItems();

			this.getView().byId("tab1").removeSelections(true);

			this.getView().byId("cal").destroySelectedDates(true);

			this.getView().byId("combo1").setSelectedKey();

			this.getView().byId("wrk").setValue();

			this.getView().byId("act_typ").setValue();

			this.getView().byId("sys_st").setValue();

			this.getView().byId("usr_st").setValue();

		},

		tableok: function () { //This function closes the message fragment and makes the display confirmation button visible

			this.getView().byId("disp_conf_btn").setVisible(true);

			this.soitemfrags.close();

		},

		_onButtonPress: function (oEvent) { //Display confirmation button which navigates to second page

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("Page2", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		doNavigate: function (sRouteName, oBindingContext, fnPromiseResolve, sViaRelation) {
			var sPath = (oBindingContext) ? oBindingContext.getPath() : null;
			var oModel = (oBindingContext) ? oBindingContext.getModel() : null;

			var sEntityNameSet;
			if (sPath !== null && sPath !== "") {
				if (sPath.substring(0, 1) === "/") {
					sPath = sPath.substring(1);
				}
				sEntityNameSet = sPath.split("(")[0];
			}
			var sNavigationPropertyName;
			var sMasterContext = this.sMasterContext ? this.sMasterContext : sPath;

			if (sEntityNameSet !== null) {
				sNavigationPropertyName = sViaRelation || this.getOwnerComponent().getNavigationPropertyForNavigationWithContext(sEntityNameSet,
					sRouteName);
			}
			if (sNavigationPropertyName !== null && sNavigationPropertyName !== undefined) {
				if (sNavigationPropertyName === "") {
					this.oRouter.navTo(sRouteName, {
						context: sPath,
						masterContext: sMasterContext
					}, false);
				} else {
					oModel.createBindingContext(sNavigationPropertyName, oBindingContext, null, function (bindingContext) {
						if (bindingContext) {
							sPath = bindingContext.getPath();
							if (sPath.substring(0, 1) === "/") {
								sPath = sPath.substring(1);
							}
						} else {
							sPath = "undefined";
						}

						// If the navigation is a 1-n, sPath would be "undefined" as this is not supported in Build
						if (sPath === "undefined") {
							this.oRouter.navTo(sRouteName);
						} else {
							this.oRouter.navTo(sRouteName, {
								context: sPath,
								masterContext: sMasterContext
							}, false);
						}
					}.bind(this));
				}
			} else {
				this.oRouter.navTo(sRouteName);
			}

			if (typeof fnPromiseResolve === "function") {
				fnPromiseResolve();
			}

		},
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("Page1").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

			this.soitemfrags = sap.ui.xmlfragment("results", "com.sap.build.standard.pmTimesheetGrunt.fragments.result", this);
			this.getView().addDependent(this.soitemfrags);

			this.oFormatYyyymmdd = sap.ui.core.format.DateFormat.getInstance({
				pattern: "yyyy-MM-dd",
				calendarType: sap.ui.core.CalendarType.Gregorian
			});

		//	this.workorderCombobox();

		},
		onExit: function () {

			// to destroy templates for bound aggregations when templateShareable is true on exit to prevent duplicateId issue
			var aControls = [{
				"controlId": "sap_uxap_ObjectPageLayout_0-sections-sap_uxap_ObjectPageSection-1-subSections-sap_uxap_ObjectPageSubSection-1-blocks-sap_m_VBox-1562325101900-items-build_simple_form_Form-1562325145537-formContainers-build_simple_form_FormContainer-1-formElements-build_simple_form_FormElement-5-fields-sap_m_ComboBox-1562326464262",
				"groups": ["items"]
			}, {
				"controlId": "sap_uxap_ObjectPageLayout_0-sections-sap_uxap_ObjectPageSection-1-subSections-sap_uxap_ObjectPageSubSection-1-blocks-sap_m_VBox-1562325101900-items-build_simple_form_Form-1562325145537-formContainers-build_simple_form_FormContainer-2-formElements-build_simple_form_FormElement-5-fields-sap_m_ComboBox-1",
				"groups": ["items"]
			}];
			for (var i = 0; i < aControls.length; i++) {
				var oControl = this.getView().byId(aControls[i].controlId);
				if (oControl) {
					for (var j = 0; j < aControls[i].groups.length; j++) {
						var sAggregationName = aControls[i].groups[j];
						var oBindingInfo = oControl.getBindingInfo(sAggregationName);
						if (oBindingInfo) {
							var oTemplate = oBindingInfo.template;
							oTemplate.destroy();
						}
					}
				}
			}

		}
	});
}, /* bExport= */ true);