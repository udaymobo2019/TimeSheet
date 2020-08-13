var sText;
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

	return BaseController.extend("com.sap.build.standard.pmTimesheetGrunt.controller.Page2", {

		handleRouteMatched: function (oEvent) {

			this.workorder = this.getView().getModel("workorder").getProperty("/wk", this.work); //Global model method for bringing the selected workorder number from screen one
			console.log("this.workorder", this.workorder);
			this.getView().byId("obj").setObjectTitle(this.workorder);

			this.listBind();
			this.flag = "X";
			console.log("this.flag", this.flag)
			this.getView().getModel("workorder").setProperty("/flags", this.flag);

		},

		busyDialog: function () {
			this.BusyDialog.open();
			jQuery.sap.delayedCall(1500, this, function () {
				this.BusyDialog.close();
			});
		},

		listBind: function () { //This function binds the value selected from first screen and display the list of confirmations

			//	this.busyDialog();

			var put = [];
			var oController = this;

			var table = oController.getView().byId("tab2");
			var oModel = new ODataModel("/sap/opu/odata/sap/ZPRJ_PM_APPS_IH_SRV/", true);

			var sPath = "/TimeSheetDisplaySet?$filter=WorkOrder eq '" + this.workorder + "'";

			oModel.read(sPath, {

				filters: [new sap.ui.model.Filter("WorkOrder", sap.ui.model.FilterOperator.EQ, this.workorder)], //"K1-B01-1")],

				success: function (oData, oResponse) {
					console.log("oData", oData);

					var len = oData.results.length;

					if (len === 0) {
						oController.getView().byId("tab2").setNoDataText("There is no Confirmation available for the selected workorder");
						var tableDel2 = oController.getView().byId("tab2"); //Destroys the table line item
						tableDel2.destroyItems();
					} else {
						for (var i = 0; i < len; i++) {

							var Operation = oData.results[i].Operation;
							var PersonnelNumber = oData.results[i].PersonnelNumber;
							var EmployeeName = oData.results[i].EmployeeName;
							var ConfirmationNumber = oData.results[i].ConfirmationNumber;
							var ConfirmationCounter = oData.results[i].ConfirmationCounter;
							var ActualWork = oData.results[i].ActualWork;
							var ConfirmationText = oData.results[i].ConfirmationText;
							var PostingDate = oData.results[i].PostingDate;

							var year = PostingDate.slice(0, 4);
							var month = PostingDate.slice(4, 6);
							var date = PostingDate.slice(6, 9);
							var fulldate = (date + "." + month + "." + year);

							var CancelledTimeSheet = oData.results[i].CancelledTimeSheet;
							var CancelledConfirmation = oData.results[i].CancelledConfirmation;

							if (CancelledConfirmation > '00000000') {

								var sucess1 = "Success";
								var priority22 = "Cancelled";

								var state_01 = priority22;
								var sucess123 = sucess1;
								var ordertype = state_01;
								console.log(ordertype);

								var sham = {
									Operation1: Operation,
									PersonnelNumber1: PersonnelNumber,
									EmployeeName1: EmployeeName,
									ConfirmationNumber1: ConfirmationNumber,
									ConfirmationCounter1: ConfirmationCounter,
									ActualWork1: ActualWork,
									ConfirmationText1: ConfirmationText,
									PostingDate1: fulldate,
									CancelledTimeSheet1: CancelledTimeSheet,
									prioritystate: state_01,
									State: ordertype,
									Suceess: sucess123

								};

								put.push(sham);
								var oTemplate = new sap.m.ColumnListItem({

									cells: [
										new sap.m.ObjectNumber({
											number: "{Operation1}"
										}),
										new sap.m.Text({
											text: "{PersonnelNumber1}"
										}),
										new sap.m.Text({
											text: "{EmployeeName1}"
										}),
										new sap.m.Text({
											text: "{ConfirmationNumber1}"
										}),
										new sap.m.Text({
											text: "{ConfirmationCounter1}"
										}),
										new sap.m.Text({
											text: "{ActualWork1}"
										}),
										new sap.m.Text({
											text: "{ConfirmationText1}"
										}),
										new sap.m.Text({
											text: "{PostingDate1}"
										}),
										new sap.m.ObjectNumber({
											number: "{State}",
											state: "{Suceess}"
										})
									]
								});

								oController.oModelJson = new sap.ui.model.json.JSONModel();
								oController.oModelJson.setData({
									tabdata: put
								});
								table.setModel(oController.oModelJson);
								table.bindItems("/tabdata", oTemplate);

							} else {
								//	var sucess = "Success";
								var warning = "Error";
								var priority23 = "Open";

								var state_02 = priority23;
								var warn1 = warning;
								ordertype = state_02;
								console.log(ordertype);
								var sham = {
									Operation1: Operation,
									PersonnelNumber1: PersonnelNumber,
									EmployeeName1: EmployeeName,
									ConfirmationNumber1: ConfirmationNumber,
									ConfirmationCounter1: ConfirmationCounter,
									ActualWork1: ActualWork,
									ConfirmationText1: ConfirmationText,
									PostingDate1: fulldate,
									CancelledTimeSheet1: CancelledTimeSheet,
									prioritystate: state_02,
									State: ordertype,
									warning: warn1

								};

								put.push(sham);

								var oTemplate = new sap.m.ColumnListItem({

									cells: [
										new sap.m.ObjectNumber({
											number: "{Operation1}"
										}),
										new sap.m.Text({
											text: "{PersonnelNumber1}"
										}),
										new sap.m.Text({
											text: "{EmployeeName1}"
										}),
										new sap.m.Text({
											text: "{ConfirmationNumber1}"
										}),
										new sap.m.Text({
											text: "{ConfirmationCounter1}"
										}),
										new sap.m.Text({
											text: "{ActualWork1}"
										}),
										new sap.m.Text({
											text: "{ConfirmationText1}"
										}),
										new sap.m.Text({
											text: "{PostingDate1}"
										}),
										new sap.m.ObjectNumber({
											number: "{State}",
											state: "{warning}"
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
						}

					}

				}

			});

		},

		canceltimeEnt: function () { //Function for message box with text area for recording the confirmation text

			var oTable = this.getView().byId("tab2");
			var oTable_len = oTable.getSelectedItems().length;

			if (oTable_len <= "0" || oTable_len === null) {
				jQuery.sap.require("sap.m.MessageBox");
				sap.m.MessageBox.alert("Select line item", {
					title: "Error",
					onClose: null
				});
			} else {

				var oCont = this;
				var dialog = new Dialog({
					title: 'Confirm',
					type: 'Message',
					content: [
						new HorizontalLayout({
							content: [
								new VerticalLayout({
									width: "100%",
									height: "100%",
									content: [
										new Label({
											text: 'Are you sure you want to Cancel the Time Entry?',
											text1: " ",
											labelFor: 'submitDialogTextarea'
										}),
									]
								})
							]
						}),

						new TextArea('submitDialogTextarea', {

							liveChange: function (oEvent) {
								sText = oEvent.getParameter('value');
								var parent = oEvent.getSource().getParent();
								//alert(sText);
								parent.getBeginButton().setEnabled(sText.length > 0);
							},
							width: '100%',
							placeholder: 'Add note'
						})
					],
					beginButton: new Button({
						text: 'Submit',
						enabled: false,
						press: function () {
							sText = sap.ui.getCore().byId('submitDialogTextarea').getValue();
							oCont.cancelPost();
							dialog.close();
						}
					}),
					endButton: new Button({
						text: 'Cancel',
						press: function () {
							dialog.close();
						}
					}),
					afterClose: function () {
						dialog.destroy();
					}
				});

				dialog.open();

			}

		},

		cancelPost: function (oEvent) { //Posting function for cancel time entry

			var that = this;

			var table = this.getView().byId("tab2");
			var item = table.getSelectedItem();

			var ConfirmationNumber = item.getCells()[3].getText();
			var ConfirmationCounter = item.getCells()[4].getText();
			var PostingDate = item.getCells()[7].getText();

			var date = PostingDate.slice(0, 2);
			var month = PostingDate.slice(3, 5);
			var year = PostingDate.slice(6, 10);
			var full = year.concat(month, date);

			if (ConfirmationNumber === undefined) {
				jQuery.sap.require("sap.m.MessageBox");
				sap.m.MessageBox.alert("Select Date", {
					title: "Error",
					onClose: null
				});
			} else {

				var oModel3 = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZPRJ_PM_APPS_IH_SRV/", true);

				var postdata = {
					"ConfirmationNumber": ConfirmationNumber,
					"ConfirmationCounter": ConfirmationCounter,
					"ConfirmationText": sText,
					"PostingDate": full,
					"Type": "",
					"Message": ""
				};

				console.log("postdata", postdata);
				var sPath = "/TimeSheetCancelSet";

				oModel3.create(sPath, postdata, {
					success: function (oData, oResponse) {
						console.log("oData", oData);
						//	console.log(oResponse, "oResponse");
						var msg1 = oData.Message;
						console.log(msg1);
						var typ = oData.Type;
						console.log(typ, "typ");

						if (typ === "S") {
							jQuery.sap.require("sap.m.MessageBox");
							sap.m.MessageBox.confirm(msg1 + " ", {
								icon: sap.m.MessageBox.Icon.SUCCESS,
								title: "Success",
								actions: [sap.m.MessageBox.Action.OK],
								onClose: function (oAction) {
									if (oAction === "OK") {

										that.listBind();

									}
								}.bind(this)
							});
							var message = false;
						} else {

							if (typ === "E") {
								sap.m.MessageBox.warning(msg1 + " ", {
									icon: sap.m.MessageBox.Icon.WARNING,
									title: "Warning",
									actions: [sap.m.MessageBox.Action.OK],

									onClose: function (oAction) {

										if (oAction === "OK") {

										}
									}.bind(this)

								});
								message = false;
							}

						}

					}
				});

			}

		},

		closefun: function () { //This function reloads the screen after posting

			var endColumn = this.getOwnerComponent().getSemanticHelper().getCurrentUIState().columnsVisibility.endColumn;
			var nextPage;
			var nextLevel = 0;

			var actionsButtonsInfo = this.getOwnerComponent().getSemanticHelper().getCurrentUIState().actionButtonsInfo;

			var nextLayout = actionsButtonsInfo.midColumn.closeColumn;
			nextLayout = nextLayout ? nextLayout : this.getOwnerComponent().getSemanticHelper().getNextUIState(0).layout;

			if (endColumn) {
				nextLevel = 1;
				nextLayout = actionsButtonsInfo.endColumn.closeColumn;
				nextLayout = nextLayout ? nextLayout : this.getOwnerComponent().getSemanticHelper().getNextUIState(1).layout;
			}

			var pageName = this.oView.sViewName.split('.');
			pageName = pageName[pageName.length - 1];
			var routePattern = this.oRouter.getRoute(pageName).getPattern().split('/');
			var contextFilter = new RegExp('^:.+:$');
			var pagePattern = routePattern.filter(function (pattern) {
				var contextPattern = pattern.match(contextFilter);
				return contextPattern === null || contextPattern === undefined;
			});

			nextPage = pagePattern[nextLevel];
			this.oRouter.navTo(nextPage, {
				layout: nextLayout
			});

		},

		Back_to_timesheet: function () {

			var tableclear = this.getView().byId("tab2");
			tableclear.destroyItems();
			//	this.closefun();

			this.oRouter.navTo("Page1", {
				layout: "OneColumn"
			});
			
			this.getView().getModel("workorder").setProperty("/Displayconfirmation", true);




		},

		onInit: function () {

			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("Page2").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

			this.BusyDialog = sap.ui.xmlfragment("busyfragment", "com.sap.build.standard.pmTimesheetGrunt.fragments.busy", this);
			this.getView().addDependent(this.BusyDialog);

		}
	});
}, /* bExport= */ true);