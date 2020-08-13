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

				this.pageFlag = this.getView().getModel("workorder").getProperty("/flags");
				console.log("this.pageFlag", this.pageFlag);
				if (this.pageFlag === "X") {
					this.rebindoftable();
				}

				this.oModel = new ODataModel("/sap/opu/odata/sap/ZPRJ_PM_APPS_IH_SRV/", true);

			//	this.user = parent.sap.ushell.Container.getUser().getId();
			//	console.log("user", this.user);

				this.today = new Date();
				console.log("today1", this.today);

				this.dd = String(this.today.getDate()).padStart(2, '0');
				console.log("dd", this.dd);

				this.mm = String(this.today.getMonth() + 1).padStart(2, '0'); //January is 0!
				console.log("mm", this.mm);

				this.yyyy = this.today.getFullYear();
				console.log("yyyy", this.yyyy);

				this.currentDate = (this.yyyy + this.mm + this.dd);
				console.log("this.currentDate", this.currentDate);

				this.getView().getModel("workorder").setProperty("/Displayconfirmation", false);

				var sPath = "/OperationUserStatusSet";
				var oModel = new ODataModel('/sap/opu/odata/sap/ZPRJ_PM_APPS_IH_SRV/', true);
				var ocont = this;
				oModel.read(sPath, {
					success: function (oData, oResponse) {
						var c5Model = new sap.ui.model.json.JSONModel();
						c5Model.setSizeLimit(3600);
						c5Model.setData(oData);
						var t6 = ocont.getView().byId("workcenter1");
						t6.setModel(c5Model);
						var workcenter = ocont.getView().byId("workcenter1");
						var oItems = new sap.ui.core.ListItem({
							key: "{StatusCode}",
							text: "{StatusCode} {Description}"
						});
						//	var oSorter = new sap.ui.model.Sorter("PoNumber");
						workcenter.bindAggregation("items", {
							path: '/results',
							template: oItems

						});
					}
				});

				var designation = window.location.origin;
				if (designation === "https://webidetesting3284792-ba293bd41.dispatcher.us1.hana.ondemand.com" || designation ===
					"https://flpnwc-ba293bd41.dispatcher.us1.hana.ondemand.com") {
					this.getView().byId("Dashboard").setVisible(true);
				} else {
					this.getView().byId("Dashboard").setVisible(false);
				}
				
				var sPath = "/WorkCenterF4Set";
				var oModel = new ODataModel('/sap/opu/odata/sap/ZPM_WORKORDER_SRV_01/', true);
				var that = this;
				oModel.read(sPath, {
					success: function (oData, oResponse) {
						var count = oData.results.length;
						that.getView().getModel("workorder").setSizeLimit(count);
						that.getView().getModel("workorder").setProperty("/WorkcentF4", oData.results);
					}
				});
			},

			_updateText: function (oCalendar) {
				this.flag = "Date";
			},

			Goooo: function () {

				var check = this.getView().byId("cal").getValue();
				var check1 = this.getView().byId("work_inp").getValue();
				var check2 = this.getView().byId("workcent_inp").getValue();

				if (check === "" && check1 === "" && check2 === "") {

					jQuery.sap.require("sap.m.MessageBox");
					sap.m.MessageBox.alert("Please provide value to to display workorder.", {
						title: "Error",
						onClose: null
					});

				} else {

					if (this.flag === "Date") {
						var aSelectedDates = this.getView().byId("cal").getValue();

						this.year = aSelectedDates.slice(6, 10);
						this.month = aSelectedDates.slice(3, 5);
						this.date = aSelectedDates.slice(0, 2);

						/*this.newdat = this.date + "." + this.month + "." + this.year;*/

						this.newdat = aSelectedDates;
						this.full = this.year.concat(this.month, this.date); //Actual date format for posting.
						console.log("this.full", this.full);

						if (this.full > this.currentDate) {
							jQuery.sap.require("sap.m.MessageBox");
							sap.m.MessageBox.alert("Selected date is greater than current date.", {
								title: "Error",
								onClose: null
							});
							this.plntcnt = 0;

						} else {
							var tableDel = this.getView().byId("tab1"); //Destroys the table line item
							tableDel.destroyItems();
							//	this.validation();
							this.workorderCombobox();
						}
					} else if (this.flag === "Workorder") {
						var wk = this.getView().byId("work_inp").getValue();
						var puts = [];
						var sPath = "/WorkOrderF4Set?$filter= WorkOrder eq '" + wk + "'";
						var oModel = new sap.ui.model.odata.ODataModel('/sap/opu/odata/sap/ZPRJ_PM_APPS_IH_SRV/', true);
						var ocont = this;
						var tables = ocont.getView().byId("tab2");
						oModel.read(sPath, {
							success: function (oData, oResponse) {
								ocont.plntcnt = oData.results.length;

								if (ocont.plntcnt === 0) {
									jQuery.sap.require("sap.m.MessageBox");
									sap.m.MessageBox.alert("Please check the workorder number.", {
										title: "Error",
										onClose: null
									});
								} else {

									for (var i = 0; i < ocont.plntcnt; i++) {
										var WorkOrder = oData.results[i].WorkOrder;
										var Description = oData.results[i].Description;
										var CreatedOn = oData.results[i].CreatedOn;
										var MainWkCntr = oData.results[i].MainWkCntr;
										var Plant = oData.results[i].Plant;
										var work = {
											WorkOrder: WorkOrder,
											Description: Description,
											CreatedOn: CreatedOn,
											MainWkCntr: MainWkCntr,
											Plant: Plant,
											Status: "None"
										};
										puts.push(work);
									}
									var oModelccd = new sap.ui.model.json.JSONModel(); // created a JSON model        
									oModelccd.setData({ // Set the data to the model using the JSON object defined already  
										tabdatas: puts
									});
									tables.setModel(oModelccd);
								}
							}
						});
					} else if (this.flag === "Workcenter") {
						var wks = this.getView().byId("workcent_inp").getValue();
						var putss = [];
						var sPaths = "/WorkOrderF4Set?$filter= MainWkCntr eq '" + wks + "'";
						var oModels = new sap.ui.model.odata.ODataModel('/sap/opu/odata/sap/ZPRJ_PM_APPS_IH_SRV/', true);
						var oconts = this;
						var tables = oconts.getView().byId("tab2");
						oModels.read(sPaths, {
							success: function (oData, oResponse) {
								oconts.plntcnt = oData.results.length;
								if (oconts.plntcnt === 0) {
									jQuery.sap.require("sap.m.MessageBox");
									sap.m.MessageBox.alert("Please check the Workcenter number.", {
										title: "Error",
										onClose: null
									});
								} else {
									for (var i = 0; i < oconts.plntcnt; i++) {
										var WorkOrder = oData.results[i].WorkOrder;
										var Description = oData.results[i].Description;
										var CreatedOn = oData.results[i].CreatedOn;
										var MainWkCntr = oData.results[i].MainWkCntr;
										var Plant = oData.results[i].Plant;
										var work = {
											WorkOrder: WorkOrder,
											Description: Description,
											CreatedOn: CreatedOn,
											MainWkCntr: MainWkCntr,
											Plant: Plant,
											Status: "None"
										};
										putss.push(work);
									}
									var oModelccd = new sap.ui.model.json.JSONModel(); // created a JSON model        
									oModelccd.setData({ // Set the data to the model using the JSON object defined already  
										tabdatas: putss
									});
									tables.setModel(oModelccd);
								}
							}
						});
					}

				}

			},

			workorderCombobox: function () {
				var puts = [];
				var sPath = "/WorkOrderF4Set?$filter= CreatedOn eq '" + this.newdat + "'";
				var oModel = new sap.ui.model.odata.ODataModel('/sap/opu/odata/sap/ZPRJ_PM_APPS_IH_SRV/', true);
				console.log("ocont.newdat", this.newdat);

				var ocont = this;
				var tables = ocont.getView().byId("tab2");
				oModel.read(sPath, {
					success: function (oData, oResponse) {

						ocont.plntcnt = oData.results.length;
						//	console.log("countable:", plntcnt);

						if (ocont.plntcnt === '0') {

							jQuery.sap.require("sap.m.MessageBox");
							sap.m.MessageBox.alert("No Workorder for the Date " + ocont.newdat, {
								title: "Information",
								onClose: null
							});

							this.getView().byId("tab2").setNoDataText("No workorder for the selected Date");
							this.getView().byId("tab1").setNoDataText("No operations available");

						} else {

							for (var i = 0; i < ocont.plntcnt; i++) {
								var WorkOrder = oData.results[i].WorkOrder;
								var Description = oData.results[i].Description;
								var CreatedOn = oData.results[i].CreatedOn;
								var MainWkCntr = oData.results[i].MainWkCntr;
								var Plant = oData.results[i].Plant;

								var work = {
									WorkOrder: WorkOrder,
									Description: Description,
									CreatedOn: CreatedOn,
									MainWkCntr: MainWkCntr,
									Plant: Plant,
									Status: "None"
								};
								puts.push(work);

							}

							var oModelccd = new sap.ui.model.json.JSONModel(); // created a JSON model        
							oModelccd.setData({ // Set the data to the model using the JSON object defined already  
								tabdatas: puts
							});
							tables.setModel(oModelccd);

						}

					}

				});

			},

			/*			categoryCombo: function () {

							var sPath = "/UserStatusSet";
							var oModel = new ODataModel('/sap/opu/odata/sap/ZPM_WORKORDER_SRV_01/', true);
							var ocont = this;

							oModel.read(sPath, {
								success: function (oData, oResponse) {
									var count = oData.results.length;
									console.log("count", count);
									var c4Model = new sap.ui.model.json.JSONModel();
									c4Model.setSizeLimit(count);
									c4Model.setData(oData);
									var t5 = ocont.getView().byId("tab_com");
									t5.setModel(c4Model);
									var vescombo = ocont.getView().byId("tab_com");
									var oItems = new sap.ui.core.ListItem({
										key: "{Status}",
										text: "{StatusText}"
									});
									vescombo.bindAggregation("items", {
										path: '/results',
										template: oItems

									});

								}
							});

						},*/

			_workorder_livechange: function () {
				this.flag = "Workorder";

				/*	var tableDel = this.getView().byId("tab1"); //Destroys the table line item
					tableDel.destroyItems();*/

			},
			HomeButton: function () {

				var that = this;
				sap.m.MessageBox.show(
					"Do you want to exit?", {
						icon: sap.m.MessageBox.Icon.INFORMATION,
						title: "Confirmation Message",
						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
						onClose: function (oAction) {
							if (oAction === "YES") {

								window.location.replace(
									"https://dashboarddesigngrunt-ba293bd41.dispatcher.us1.hana.ondemand.com/index.html?hc_reset#/PM"
								);
							}
						}
					});
			},
			worcentre_livechange: function () {
				this.flag = "Workcenter";
				/*			var tableDel = this.getView().byId("tab1"); //Destroys the table line item
							tableDel.destroyItems();*/

			},

			tableBind: function (oEvent) { //Based on selected workorder number list of operations will be bided in the table
				this.getView().getModel("workorder").setProperty("/Displayconfirmation", true);
				var put = [];
				var path = oEvent.getParameter("listItem").getBindingContext().getPath();
				var idx = parseInt(path.substring(path.lastIndexOf('/') + 1));
				var data = this.getView().byId("tab2").getModel().getData();
				for (var i = 0; i < data.tabdatas.length; i++) {
					data.tabdatas[i].Status = "None";
				}
				this.getView().byId("tab2").getModel().refresh(true);
				if (data.tabdatas[idx].Status == "None") {
					data.tabdatas[idx].Status = "Success";
				} else {
					data.tabdatas[idx].Status = "None";
				}
				this.plant = oEvent.getParameter("listItem").getBindingContext().getObject().Plant;
				this.wrkcenter = oEvent.getParameter("listItem").getBindingContext().getObject().MainWkCntr;
				var filters = [];
				var sPath = "/PersonResponsibleF4Set";
				var oModel = new ODataModel('/sap/opu/odata/sap/ZPM_WORKORDER_SRV_01/', true);
				filters.push(new sap.ui.model.Filter("Arbpl", sap.ui.model.FilterOperator.EQ, this.wrkcenter));
				filters.push(new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, this.plant));
				oModel.read(sPath, {
					filters: filters,
					success: function (oData, oResponse) {

						var c5Model = new sap.ui.model.json.JSONModel();
						c5Model.setSizeLimit(3600);
						c5Model.setData(oData);
						var t6 = this.getView().byId("personres");
						t6.setModel(c5Model);
						var workcenter = this.getView().byId("personres");
						var oItems = new sap.ui.core.ListItem({
							key: "{Pernr}",
							text: "{Pernr} {Short}"
						});
						//	var oSorter = new sap.ui.model.Sorter("PoNumber");
						workcenter.bindAggregation("items", {
							path: '/results',
							template: oItems
						});
					}.bind(this)
				});

				this.getView().byId("tab2").getModel().refresh(true);

				this.work = oEvent.getParameter("listItem").getBindingContext().getObject().WorkOrder;

				//	var put = [];

				var oController = this;

				oController.getView().getModel("workorder").setProperty("/wk", this.work); //Setting Global model for using this value in second screen

				var table = oController.getView().byId("tab1"); //Table declaration.

				var sPath = "/TimesheetSet?$filter=WorkOrder eq '" + this.work + "'";

				this.oModel.read(sPath, {

					filters: [new sap.ui.model.Filter("WorkOrder", sap.ui.model.FilterOperator.EQ, this.work)], //"K1-B01-1")],
					success: function (oData, oResponse) {
						var len = oData.results.length;
						for (var i = 0; i < len; i++) {
							var Operation = oData.results[i].Operation;
							var ConfirmationText = oData.results[i].ConfirmationText;
							var WorkCenter = oData.results[i].WorkCenter;
							var PersonnelNo = oData.results[i].PersonnelNo;
							var PlannedHrs = oData.results[i].PlannedHrs;
							var ActualWork = oData.results[i].ActualWork;
							var UserStatus = oData.results[i].UserStatus;
							var ActivityType = oData.results[i].ActivityType;

							var sham = {
								Operation1: Operation,
								ConfirmationText1: ConfirmationText,
								WorkCenter1: WorkCenter,
								PersonnelNo1: PersonnelNo,
								PlannedHrs: PlannedHrs,
								ActualWork1: ActualWork,
								UserStatus1: UserStatus,
								ActivityType1: ActivityType
							};
							put.push(sham);
							this.getView().getModel("workorder").setProperty("/oper", put);
						}
						this.getView().byId("tab1").getModel().refresh(true);
					}.bind(this)

				});

			},

			rebindoftable: function () {
				this.getView().getModel("workorder").setProperty("/Displayconfirmation", true);
				var put = [];
				this.getView().getModel("workorder").setProperty("/oper", []);
				var filters = [];
				var sPath = "/PersonResponsibleF4Set";
				var oModel = new ODataModel('/sap/opu/odata/sap/ZPM_WORKORDER_SRV_01/', true);
				filters.push(new sap.ui.model.Filter("Arbpl", sap.ui.model.FilterOperator.EQ, this.wrkcenter));
				filters.push(new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, this.plant));
				oModel.read(sPath, {
					filters: filters,
					success: function (oData, oResponse) {

						var c5Model = new sap.ui.model.json.JSONModel();
						c5Model.setSizeLimit(3600);
						c5Model.setData(oData);
						var t6 = this.getView().byId("personres");
						t6.setModel(c5Model);
						var workcenter = this.getView().byId("personres");
						var oItems = new sap.ui.core.ListItem({
							key: "{Pernr}",
							text: "{Pernr} {Short}"
						});
						//	var oSorter = new sap.ui.model.Sorter("PoNumber");
						workcenter.bindAggregation("items", {
							path: '/results',
							template: oItems
						});
					}.bind(this)
				});

				var oController = this;

				var table = oController.getView().byId("tab1"); //Table declaration.

				var sPath = "/TimesheetSet?$filter=WorkOrder eq '" + this.work + "'";

				this.oModel.read(sPath, {

					filters: [new sap.ui.model.Filter("WorkOrder", sap.ui.model.FilterOperator.EQ, this.work)], //"K1-B01-1")],
					success: function (oData, oResponse) {
						var len = oData.results.length;
						for (var i = 0; i < len; i++) {
							var Operation = oData.results[i].Operation;
							var ConfirmationText = oData.results[i].ConfirmationText;
							var WorkCenter = oData.results[i].WorkCenter;
							var PersonnelNo = oData.results[i].PersonnelNo;
							var PlannedHrs = oData.results[i].PlannedHrs;
							var ActualWork = oData.results[i].ActualWork;
							var UserStatus = oData.results[i].UserStatus;
							var ActivityType = oData.results[i].ActivityType;

							var sham = {
								Operation1: Operation,
								ConfirmationText1: ConfirmationText,
								WorkCenter1: WorkCenter,
								PersonnelNo1: PersonnelNo,
								PlannedHrs: PlannedHrs,
								ActualWork1: ActualWork,
								UserStatus1: UserStatus,
								ActivityType1: ActivityType
							};
							put.push(sham);
							this.getView().getModel("workorder").setProperty("/oper", put);
						}
						this.getView().byId("tab1").getModel().refresh(true);
					}.bind(this)

				});

			},

			save_btn: function (oEvent) { //Posting function for creating the Time sheet confirmation

				this.table = sap.ui.core.Fragment.byId("results", "tab3"); //Table declaration for showing the response message in a fragment.

				this.array1 = [];
				var blank_fld = [];
				var val_fld = [];
				var oCont = this;

				var oTable = this.getView().byId("tab1");
				var tablelength = oTable.getItems().length;
				var a = oTable.getSelectedContextPaths().length;

				this.noRemain = this.getView().byId("noRemainingWorkid").getSelected();
				if (this.noRemain === true) {
					this.noRemain = "X";
				} else {
					this.noRemain = "";
				}

				for (var i = 0; i < tablelength; i++) {

					var act_time = oTable.getItems()[i].getCells()["5"].getValue();
					if (act_time <= 0) {
						var inf = {
							act_time: act_time
						};
						blank_fld.push(inf);
						var blank_fld_len = blank_fld.length;
					} else {
						var val = {
							act_time: act_time
						};
						val_fld.push(val);
						var val_fld_len = val_fld.length;
					}

				}

				if (blank_fld_len === tablelength) {
					jQuery.sap.require("sap.m.MessageBox");
					sap.m.MessageBox.alert("Please provide Actual hours to confirm", {
						title: "Information",
						onClose: null
					});
				} else {
					this.Posting();
				}

			},

			Posting: function () {

				var oTable = this.getView().byId("tab1");
				var oTable_len = oTable.getItems().length;

				//	var tabitems = oTable.getSelectedItems();

				for (var i = 0; i < oTable_len; i++) {
					var fcnf = oTable.getItems()[i].getCells()["0"].getSelected();
					var op = oTable.getItems()[i].getCells()["1"].getTitle();
					var wc = oTable.getItems()[i].getCells()["2"].getText();
					var prn = oTable.getItems()[i].getCells()["3"].getValue();
					var ph = oTable.getItems()[i].getCells()["4"].getText();
					var ah = oTable.getItems()[i].getCells()["5"].getValue();
					var ct = oTable.getItems()[i].getCells()["6"].getValue();
					var sus = oTable.getItems()[i].getCells()["7"].getValue();
					var at = oTable.getItems()[i].getCells()["8"].getValue();

					if (fcnf === true) {
						this.fcnf = "X";
					} else {
						this.fcnf = "";
					}

					var Split_prn = prn.split(" ");
					this.splitprn = Split_prn[0];

					var Split_sus = sus.split(" ");
					this.splitsus = Split_sus[0];

					if (ah === "") {

					} else {

						var obj = {
							"Operation": op,
							"WorkOrder": this.work,
							"PostingDate": "",
							"Plant": "",
							"WorkCenter": wc,
							"PersonnelNumber": this.splitprn,
							"Description": ct,
							"Hours": ah,
							"ActType": at,
							"FinalConfirmation": this.fcnf,
							"UserStatus": this.splitsus
						};

						this.array1.push(obj);

					}

				}

				var postdata = {
					"WorkOrder": this.work,
					"WorkCenter": wc,
					"SystemStatus": "",
					"ActivityType": "",
					"NoRemainingWork": this.noRemain,
					"TimeSheetH2ISet": this.array1,
					"TimeSheetH2RSet": [{
						"WorkOrder": "",
						"Operation": "",
						"Type": "",
						"Message": ""
					}]
				};

				var oCont = this;

				var put1 = [];

				console.log("postdata", postdata);
				var sPath = "/TimesheetHeaderSet";

				this.oModel.create(sPath, postdata, {
					success: function (oData, oResponse) {
						console.log("oData", oData);
						var tablen = oData.TimeSheetH2RSet.results.length;

						for (var j = 0; j < tablen; j++) {

							var Type = oData.TimeSheetH2RSet.results[j].Type;

							if (Type === "I") {

								Type = "Information";

							} else if (Type === "S") {

								Type = "Success";

							} else if (Type === "E") {

								Type = "Error";

							} else if (Type === "W") {

								Type = "Warning";

							}

							var Operation = oData.TimeSheetH2RSet.results[j].Operation;

							var Message = oData.TimeSheetH2RSet.results[j].Message;

							var obj = {
								Type2: Type,
								Operation: Operation,
								Message: Message
							};

							put1.push(obj);

						}

						oCont.soitemfrags.open();

						var oTemplate = new sap.m.ColumnListItem({

							cells: [
								new sap.m.Text({
									text: "{Type2}"
								}),
								new sap.m.Text({
									text: "{Operation}"
								}),
								new sap.m.Text({
									text: "{Message}"
								})
							]
						});

						oCont.oModelJson = new sap.ui.model.json.JSONModel();
						oCont.oModelJson.setData({
							tabdata1: put1
						});
						oCont.table.setModel(oCont.oModelJson);
						oCont.table.bindItems("/tabdata1", oTemplate);

					}
				});

			},

			clearing: function (oEvent) { //This function removes the UI screen values.

				this.getView().byId("workcent_inp").setValue();

				this.getView().byId("work_inp").setValue();

				this.getView().byId("cal").setValue();
			},

			clearingforDate: function () {

				this.wrkc = "";
				this.acttyp = "";
				this.sysst = "";
				this.array1 = [];
				this.work = "";
				//	this.full = "";

				var tableDel = this.getView().byId("tab1"); //Destroys the table line item
				tableDel.destroyItems();

				var tableDel2 = this.getView().byId("tab2"); //Destroys the table line item
				tableDel2.destroyItems();

				this.getView().byId("finalConfirmationid").setSelected(false);

				this.getView().byId("noRemainingWorkid").setSelected(false);

				this.getView().byId("tab1").removeSelections(true);

				this.getView().byId("cal").setValue();

				/*				this.getView().byId("wrk").setValue();

								this.getView().byId("act_typ").setValue();

								this.getView().byId("sys_st").setValue();

								this.getView().byId("usr_st").setValue();*/

			},

			tableok: function () { //This function closes the message fragment and makes the display confirmation button visible

				var inf_arr = [];

				var err_arr = [];

				this.soitemfrags.close();
				this.rebindoftable();
				var rowItems = sap.ui.core.Fragment.byId("results", "tab3").getItems();

				var tablength = rowItems.length;
				console.log("tablength", tablength);

				for (var i = 0; i < tablength; i++) {

					var item = rowItems[i];

					var Cells = item.getCells();

					var tp = Cells[0].getText();

					if (tp === "Information") {

						/*						var inf = {
													tp: tp
												};

												inf_arr.push(inf);

												var len_inf = inf_arr.length;*/

					} else if (tp === "Error") {

						/*						var err = {
													tp: tp
												};

												err_arr.push(err);

												var len_err = err_arr.length;*/

					}

				}

				/*				if (len_err === tablength) {

									this.getView().byId("disp_conf_btn").setVisible(false);

								} else {

									this.getView().byId("disp_conf_btn").setVisible(true);

								}*/

			},

			_onButtonPress: function (oEvent) { //Display confirmation button which navigates to second page
				var dat = this.getView().byId("cal").getValue();
				var len = this.getView().getModel("workorder").getProperty("/oper");

				// if (dat === undefined || dat === null || dat === "") {

				// 	jQuery.sap.require("sap.m.MessageBox");
				// 	sap.m.MessageBox.alert("Select Created Date", {
				// 		title: "Information",
				// 		onClose: null
				// 	});

				// } else if (this.work === undefined || this.work === null || this.work === "") {

				// 	jQuery.sap.require("sap.m.MessageBox");
				// 	sap.m.MessageBox.alert("Select Workorder number", {
				// 		title: "Information",
				// 		onClose: null
				// 	});

				// } else {

				var oBindingContext = oEvent.getSource().getBindingContext();
				return new Promise(function (fnResolve) {
					this.doNavigate("Page2", oBindingContext, fnResolve, "");
				}.bind(this)).catch(function (err) {
					if (err !== undefined) {
						MessageBox.error(err.message);
					}
				});
				// }
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
					sNavigationPropertyName = sViaRelation || this.getOwnerComponent().getNavigationPropertyForNavigationWithContext(
						sEntityNameSet,
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

				var oModel = new sap.ui.model.json.JSONModel({
					count: 0
				});
				this.getView().setModel(oModel);

				this.oFormatYyyymmdd = sap.ui.core.format.DateFormat.getInstance({
					pattern: "yyyy-MM-dd",
					calendarType: sap.ui.core.CalendarType.Gregorian
				});

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
	},
	/* bExport= */
	true);