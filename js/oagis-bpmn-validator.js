/*
The MIT License (MIT)

Copyright (c) 2013 Trisotech

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/**
 * This class is a result holder that contains the validation results
 */
function OAGISBPMNValidatorResults() {
	this.bpmnns = 'http://www.omg.org/spec/BPMN/20100524/MODEL';
	this.items = {};
	this.messages = {};
	this.dataobjects = {};
	this.datastores = {};	
	this.properties = {};	
};

/**
 * This class is a OAGIS BPMN 2.0 validator. It check that the passed XML file contains Messages, Data Objects and Data Stores defined using the OAGIS schema.
 * @param {dom} and xml file that is defined using the BPMN 2.0 schema
 *
 */
function OAGISBPMNValidator(dom) {
	var OAGISNS = 'http://www.openapplications.org/oagis/9';
	var $dom = $(dom);
	var seed = 1;

	this.result = new OAGISBPMNValidatorResults();
	this.result.bpmnns = dom.firstChild.namespaceURI
	
	/**
	 * Validate the xml file passed in the constructor. After this call, the result attribute will contains the validation results
	 */
	this.validate = function() {
		var itemDefinitions = dom.getElementsByTagNameNS(this.result.bpmnns,'itemDefinition');
		for(var i = 0; i < itemDefinitions.length; i++) {
			this.validateItemDefinition(itemDefinitions[i]);
			console.log(itemDefinitions[i].qname);
		}

		var messages = dom.getElementsByTagNameNS(this.result.bpmnns,'message');
		for(var i = 0; i < messages.length; i++) {
			this.validateMessage(messages[i]);
		}

		var dataObjects = dom.getElementsByTagNameNS(this.result.bpmnns,'dataObject');
		for(var i = 0; i < dataObjects.length; i++) {
			this.validateDataObject(dataObjects[i]);
		}

		var dataInputs = dom.getElementsByTagNameNS(this.result.bpmnns,'dataInput');
		for(var i = 0; i < dataInputs.length; i++) {
			this.validateDataInput(dataInputs[i]);
		}
		
		var dataOutputs = dom.getElementsByTagNameNS(this.result.bpmnns,'dataOutput');
		for(var i = 0; i < dataOutputs.length; i++) {
			this.validateDataOutput(dataOutputs[i]);
		}		

		var properties = dom.getElementsByTagNameNS(this.result.bpmnns,'property');
		for(var i = 0; i < properties.length; i++) {
			this.validateProperty(properties[i]);
		}		

		
		var dataStores = dom.getElementsByTagNameNS(this.result.bpmnns,'dataStore');
		for(var i = 0; i < dataStores.length; i++) {
			this.validateDataStore(dataStores[i]);
		}
		
	}
	
	this.namespaceURL = function(ns, element) {
		var tentativeURL;
				
		if(!element){
			$element = $dom.children().first();
		} else {		
			$element = $(element);
		}
		
		while($element.parent().length == 1) {
			if(!ns) { 
				tentativeURL = $element.attr('xmlns');
			} else {
				tentativeURL = $element.attr('xmlns:'+ns);
			}
			if(tentativeURL){
				return tentativeURL;
			}
			$element = $($element.parent());
		}
		return tentativeURL;
	}
	
	this.validateItemDefinition = function(mf) {
		var $mf = $(mf)
		var id = $mf.attr('id');
		if (!id) {
			id='ItemDefinition-noid-' + seed++;
		}
		var structureRef = $mf.attr('structureRef');
		var itemDefinitionNS = structureRef.substring(0, structureRef.indexOf(':'));
		var oagisElementName = structureRef.substring(itemDefinitionNS.length == 0 ? 0 : itemDefinitionNS.length + 1);
		var itemDefinitionURL = this.namespaceURL(itemDefinitionNS, mf);
		if( itemDefinitionURL == OAGISNS ) {
			if ($.inArray(oagisElementName, bods) != -1) {
				this.result.items[id] = { oagis: true, type: 'bod', valid: true, element: oagisElementName, xml: mf};
			} else if ($.inArray(oagisElementName, nouns) != -1) {
				this.result.items[id] = { oagis: true, type: 'noun', valid: true, element: oagisElementName, xml: mf};
			} else {
				this.result.items[id] = { oagis: true, type: 'unknown', valid: false, element: oagisElementName, xml: mf};
			}
		} else {
			this.result.items[id] = { oagis: false, element: structureRef, xml: mf};
		}
		
	};
	
	this.validateBPMNElement = function(bpmnElement, itemRefName, elementName, into, bods) {
		var $bpmnElement = $(bpmnElement);
		var id = $bpmnElement.attr('id');
		if (!id) {
			id= elementName + '-noid-' + seed++;
		}
		var itemRef = $bpmnElement.attr(itemRefName);
		var label = $bpmnElement.attr('name');
		if (!label){
			label = id;
		}
		if(itemRef) {
			if(itemRef.indexOf(':') > 0){
				itemRef = itemRef.substring(itemRef.indexOf(':') + 1);
			}
			var item = this.result.items[itemRef];
			if(item) {
				if (item.oagis) {
					if(item.type == (bods ? 'bod' : 'noun')) {
						into[id] = { oagis: true, defined: true , valid: true , item: item, label: label, xml: bpmnElement};
					} else {
						into[id] = { oagis: true, defined: true , valid: false , item: item, label: label, xml: bpmnElement};
					}
				} else {
					into[id] = { oagis: false, defined: true , item: item, label: label, xml: bpmnElement};				
				}
			} else {
				into[id] = { oagis: false, defined: 'invalid', label: label, xml: bpmnElement};
			}
		} else {
			into[id] = { oagis: false, defined: false, label: label, xml: bpmnElement};
		}
	};
	
	this.validateMessage = function(message) {
		return this.validateBPMNElement(message, 'itemRef', 'Message', this.result.messages, true);
	};

	this.validateDataObject = function(dataobject) {
		return this.validateBPMNElement(dataobject, 'itemSubjectRef', 'Data-Object', this.result.dataobjects, false);
	};

	this.validateDataInput = function(datainput) {
		return this.validateBPMNElement(datainput, 'itemSubjectRef', 'Data-Input', this.result.dataobjects, false);
	};
	this.validateDataOutput = function(dataoutput) {
		return this.validateBPMNElement(dataoutput, 'itemSubjectRef', 'Data-Output', this.result.dataobjects, false);
	};
	this.validateProperty = function(property) {
		return this.validateBPMNElement(property, 'itemSubjectRef', 'Property', this.result.properties, false);
	};
	
	this.validateDataStore = function(datastore) {
		return this.validateBPMNElement(datastore, 'itemSubjectRef', 'Data-Store', this.result.datastores, false);
	};
	
	//OAGIS 9.6 Nouns
	var nouns = [
		'ActualLedger',
		'AllocateResource',
		'BOM',
		'BudgetLedger',
		'CarrierRoute',
		'Catalog',
		'ChartOfAccounts',
		'CommercialInvoice',
		'Configuration',
		'ConfirmWIP',
		'CostingActivity',
		'Credit',
		'CreditStatus',
		'CreditTransfer',
		'CreditTransferIST',
		'CurrencyExchangeRate',
		'CustomerPartyMaster',
		'DebitTransfer',
		'DebitTransferIST',
		'DispatchList',
		'EmployeeWorkSchedule',
		'EmployeeWorkTime',
		'EngineeringChangeOrder',
		'EngineeringWorkDocument',
		'Field',
		'HazardousMaterialShipmentDocument',
		'InspectDelivery',
		'InventoryBalance',
		'InventoryConsumption',
		'InventoryCount',
		'Invoice',
		'InvoiceLedgerEntry',
		'IssueInventory',
		'ItemMaster',
		'ItemNonconformance',
		'JournalEntry',
		'Location',
		'LocationService',
		'MaintenanceOrder',
		'MatchDocument',
		'MergeWIP',
		'MoveInventory',
		'MoveWIP',
		'OnlineOrder',
		'OnlineSession',
		'Operation',
		'Opportunity',
		'PartyMaster',
		'PartyScreen',
		'PartyScreenResponse',
		'Payable',
		'PaymentStatus',
		'PaymentStatusIST',
		'Personnel',
		'PickList',
		'PlanningSchedule',
		'PriceList',
		'ProductAvailability',
		'ProductionOrder',
		'ProductionPerformance',
		'ProductionSchedule',
		'ProjectAccounting',
		'ProjectMaster',
		'PurchaseOrder',
		'Quote',
		'Receivable',
		'ReceiveDelivery',
		'ReceiveItem',
		'RecoverWIP',
		'RemittanceAdvice',
		'RequireProduct',
		'Requisition',
		'RFQ',
		'RiskControlLibrary',
		'Routing',
		'SalesLead',
		'SalesOrder',
		'SequenceSchedule',
		'Shipment',
		'ShipmentSchedule',
		'ShipmentUnit',
		'ShippersExportDeclaration',
		'ShippersLetterOfInstruction',
		'SplitWIP',
		'SupplierPartyMaster',
		'Table',
		'UOMGroup',
		'WarehouseShippingAdvice',
		'WarehouseShippingOrder',
		'WarrantyClaim',
		'WIPStatus'];	

	// OAGIS 9.6 BODs
	var bods = [
		'AcknowledgeAllocateResource',
		'AcknowledgeCommercialInvoice',
		'AcknowledgeConfirmWIP',
		'AcknowledgeCostingActivity',
		'AcknowledgeCredit',
		'AcknowledgeCreditStatus',
		'AcknowledgeCreditTransfer',
		'AcknowledgeCreditTransferIST',
		'AcknowledgeDebitTransfer',
		'AcknowledgeDebitTransferIST',
		'AcknowledgeDispatchList',
		'AcknowledgeEmployeeWorkTime',
		'AcknowledgeEngineeringChangeOrder',
		'AcknowledgeEngineeringWorkDocument',
		'AcknowledgeHazardousMaterialShipmentDocument',
		'AcknowledgeInspectDelivery',
		'AcknowledgeInventoryBalance',
		'AcknowledgeInventoryConsumption',
		'AcknowledgeInventoryCount',
		'AcknowledgeInvoice',
		'AcknowledgeIssueInventory',
		'AcknowledgeJournalEntry',
		'AcknowledgeMaintenanceOrder',
		'AcknowledgeMatchDocument',
		'AcknowledgeMergeWIP',
		'AcknowledgeMoveInventory',
		'AcknowledgeMoveWIP',
		'AcknowledgeOnlineOrder',
		'AcknowledgeOperation',
		'AcknowledgeOpportunity',
		'AcknowledgePaymentStatus',
		'AcknowledgePaymentStatusIST',
		'AcknowledgePickList',
		'AcknowledgeProductAvailability',
		'AcknowledgeProductionOrder',
		'AcknowledgeProductionPerformance',
		'AcknowledgeProductionSchedule',
		'AcknowledgePurchaseOrder',
		'AcknowledgeQuote',
		'AcknowledgeReceiveDelivery',
		'AcknowledgeReceiveItem',
		'AcknowledgeRecoverWIP',
		'AcknowledgeRemittanceAdvice',
		'AcknowledgeRequireProduct',
		'AcknowledgeRequisition',
		'AcknowledgeRFQ',
		'AcknowledgeRiskControlLibrary',
		'AcknowledgeSalesLead',
		'AcknowledgeSalesOrder',
		'AcknowledgeShipment',
		'AcknowledgeShipmentUnit',
		'AcknowledgeShippersExportDeclaration',
		'AcknowledgeShippersLetterOfInstruction',
		'AcknowledgeSplitWIP',
		'AcknowledgeWarrantyClaim',
		'AcknowledgeWIPStatus',
		'AddPurchaseOrder',
		'AddQuote',
		'AddRequisition',
		'AddRFQ',
		'AddSalesOrder',
		'AllocateCostingActivity',
		'CancelDispatchList',
		'CancelEmployeeWorkTime',
		'CancelEngineeringChangeOrder',
		'CancelEngineeringWorkDocument',
		'CancelInspectDelivery',
		'CancelInventoryBalance',
		'CancelInvoice',
		'CancelMaintenanceOrder',
		'CancelPickList',
		'CancelProductionOrder',
		'CancelPurchaseOrder',
		'CancelQuote',
		'CancelReceiveDelivery',
		'CancelRequireProduct',
		'CancelRequisition',
		'CancelRFQ',
		'CancelSalesOrder',
		'ChangeConfirmWIP',
		'ChangeCredit',
		'ChangeCreditStatus',
		'ChangeDispatchList',
		'ChangeEmployeeWorkTime',
		'ChangeEngineeringChangeOrder',
		'ChangeEngineeringWorkDocument',
		'ChangeInspectDelivery',
		'ChangeInventoryBalance',
		'ChangeInvoice',
		'ChangeMaintenanceOrder',
		'ChangeOnlineOrder',
		'ChangeOpportunity',
		'ChangePickList',
		'ChangeProductionOrder',
		'ChangePurchaseOrder',
		'ChangeQuote',
		'ChangeReceiveDelivery',
		'ChangeRequireProduct',
		'ChangeRequisition',
		'ChangeRFQ',
		'ChangeSalesLead',
		'ChangeSalesOrder',
		'ConfirmBOD',
		'CreateMaintenanceOrder',
		'CreateProductionOrder',
		'CreateRequisition',
		'GetActualLedger',
		'GetAllocateResource',
		'GetBOM',
		'GetBudgetLedger',
		'GetCarrierRoute',
		'GetCatalog',
		'GetChartOfAccounts',
		'GetCommercialInvoice',
		'GetConfirmWIP',
		'GetCostingActivity',
		'GetCredit',
		'GetCreditStatus',
		'GetCreditTransfer',
		'GetCreditTransferIST',
		'GetCurrencyExchangeRate',
		'GetCustomerPartyMaster',
		'GetDebitTransfer',
		'GetDebitTransferIST',
		'GetDispatchList',
		'GetEmployeeWorkSchedule',
		'GetEmployeeWorkTime',
		'GetEngineeringChangeOrder',
		'GetEngineeringWorkDocument',
		'GetField',
		'GetHazardousMaterialShipmentDocument',
		'GetInspectDelivery',
		'GetInventoryBalance',
		'GetInventoryConsumption',
		'GetInventoryCount',
		'GetInvoice',
		'GetInvoiceLedgerEntry',
		'GetIssueInventory',
		'GetItemMaster',
		'GetJournalEntry',
		'GetListActualLedger',
		'GetListBOM',
		'GetListInventoryCount',
		'GetListItemMaster',
		'GetListMaintenanceOrder',
		'GetListPickList',
		'GetListProductionOrder',
		'GetListPurchaseOrder',
		'GetListQuote',
		'GetListReceiveDelivery',
		'GetListRequisition',
		'GetListRFQ',
		'GetListRouting',
		'GetListSalesOrder',
		'GetListUOMGroup',
		'GetLocation',
		'GetLocationService',
		'GetMaintenanceOrder',
		'GetMatchDocument',
		'GetMergeWIP',
		'GetMoveInventory',
		'GetMoveWIP',
		'GetOnlineOrder',
		'GetOnlineSession',
		'GetOperation',
		'GetOpportunity',
		'GetPartyMaster',
		'GetPayable',
		'GetPaymentStatus',
		'GetPaymentStatusIST',
		'GetPersonnel',
		'GetPickList',
		'GetPlanningSchedule',
		'GetPriceList',
		'GetProductAvailability',
		'GetProductionOrder',
		'GetProductionPerformance',
		'GetProductionSchedule',
		'GetProjectAccounting',
		'GetProjectMaster',
		'GetPurchaseOrder',
		'GetQuote',
		'GetReceivable',
		'GetReceiveDelivery',
		'GetReceiveItem',
		'GetRecoverWIP',
		'GetRemittanceAdvice',
		'GetRequireProduct',
		'GetRequisition',
		'GetRFQ',
		'GetRiskControlLibrary',
		'GetRouting',
		'GetSalesLead',
		'GetSalesOrder',
		'GetSequenceSchedule',
		'GetShipment',
		'GetShipmentSchedule',
		'GetShipmentUnit',
		'GetShippersExportDeclaration',
		'GetShippersLetterOfInstruction',
		'GetSplitWIP',
		'GetSupplierPartyMaster',
		'GetUOMGroup',
		'GetWarrantyClaim',
		'GetWIPStatus',
		'IssueMoveInventory',
		'ListActualLedger',
		'ListBOM',
		'ListInventoryCount',
		'ListItemMaster',
		'ListMaintenanceOrder',
		'ListPickList',
		'ListProductionOrder',
		'ListPurchaseOrder',
		'ListQuote',
		'ListReceiveDelivery',
		'ListRequisition',
		'ListRFQ',
		'ListRouting',
		'ListSalesOrder',
		'ListUOMGroup',
		'LoadActualLedger',
		'LoadBudgetLedger',
		'LoadInvoiceLedgerEntry',
		'LoadMatchDocument',
		'LoadPayable',
		'LoadProjectAccounting',
		'LoadReceivable',
		'NotifyAllocateResource',
		'NotifyBOM',
		'NotifyCarrierRoute',
		'NotifyCatalog',
		'NotifyChartOfAccounts',
		'NotifyCommercialInvoice',
		'NotifyCredit',
		'NotifyCreditStatus',
		'NotifyCurrencyExchangeRate',
		'NotifyCustomerPartyMaster',
		'NotifyDispatchList',
		'NotifyEmployeeWorkSchedule',
		'NotifyEmployeeWorkTime',
		'NotifyEngineeringChangeOrder',
		'NotifyEngineeringWorkDocument',
		'NotifyField',
		'NotifyHazardousMaterialShipmentDocument',
		'NotifyInspectDelivery',
		'NotifyInventoryBalance',
		'NotifyInventoryConsumption',
		'NotifyInventoryCount',
		'NotifyInvoice',
		'NotifyItemMaster',
		'NotifyLocation',
		'NotifyMaintenanceOrder',
		'NotifyOnlineOrder',
		'NotifyOperation',
		'NotifyOpportunity',
		'NotifyPartyMaster',
		'NotifyPersonnel',
		'NotifyPickList',
		'NotifyPlanningSchedule',
		'NotifyPriceList',
		'NotifyProductionOrder',
		'NotifyProductionPerformance',
		'NotifyProductionSchedule',
		'NotifyProjectMaster',
		'NotifyPurchaseOrder',
		'NotifyQuote',
		'NotifyRemittanceAdvice',
		'NotifyRequisition',
		'NotifyRFQ',
		'NotifyRiskControlLibrary',
		'NotifyRouting',
		'NotifySalesLead',
		'NotifySalesOrder',
		'NotifySequenceSchedule',
		'NotifyShipment',
		'NotifyShipmentSchedule',
		'NotifyShipmentUnit',
		'NotifyShippersExportDeclaration',
		'NotifyShippersLetterOfInstruction',
		'NotifySupplierPartyMaster',
		'NotifyUOMGroup',
		'NotifyWarrantyClaim',
		'PostCostingActivity',
		'PostJournalEntry',
		'PostMatchDocument',
		'ProcessAllocateResource',
		'ProcessCommercialInvoice',
		'ProcessConfirmWIP',
		'ProcessCredit',
		'ProcessCreditStatus',
		'ProcessCreditTransfer',
		'ProcessCreditTransferIST',
		'ProcessDebitTransfer',
		'ProcessDebitTransferIST',
		'ProcessDispatchList',
		'ProcessEmployeeWorkTime',
		'ProcessEngineeringChangeOrder',
		'ProcessEngineeringWorkDocument',
		'ProcessHazardousMaterialShipmentDocument',
		'ProcessInspectDelivery',
		'ProcessInventoryBalance',
		'ProcessInventoryConsumption',
		'ProcessInventoryCount',
		'ProcessInvoice',
		'ProcessIssueInventory',
		'ProcessMaintenanceOrder',
		'ProcessMergeWIP',
		'ProcessMoveInventory',
		'ProcessMoveWIP',
		'ProcessOnlineOrder',
		'ProcessOperation',
		'ProcessOpportunity',
		'ProcessPaymentStatus',
		'ProcessPaymentStatusIST',
		'ProcessPickList',
		'ProcessProductAvailability',
		'ProcessProductionOrder',
		'ProcessPurchaseOrder',
		'ProcessQuote',
		'ProcessReceiveDelivery',
		'ProcessReceiveItem',
		'ProcessRecoverWIP',
		'ProcessRemittanceAdvice',
		'ProcessRequireProduct',
		'ProcessRequisition',
		'ProcessRFQ',
		'ProcessRiskControlLibrary',
		'ProcessSalesLead',
		'ProcessSalesOrder',
		'ProcessShipment',
		'ProcessShipmentUnit',
		'ProcessShippersExportDeclaration',
		'ProcessShippersLetterOfInstruction',
		'ProcessSplitWIP',
		'ProcessWarrantyClaim',
		'ProcessWIPStatus',
		'ReceiveMoveInventory',
		'ReceiveProductionOrder',
		'ReceivePurchaseOrder',
		'RespondConfirmWIP',
		'RespondCredit',
		'RespondCreditStatus',
		'RespondDispatchList',
		'RespondEmployeeWorkTime',
		'RespondEngineeringChangeOrder',
		'RespondEngineeringWorkDocument',
		'RespondInspectDelivery',
		'RespondInventoryBalance',
		'RespondInvoice',
		'RespondMaintenanceOrder',
		'RespondOnlineOrder',
		'RespondOpportunity',
		'RespondPickList',
		'RespondProductionOrder',
		'RespondPurchaseOrder',
		'RespondQuote',
		'RespondReceiveDelivery',
		'RespondRequireProduct',
		'RespondRequisition',
		'RespondRFQ',
		'RespondSalesLead',
		'RespondSalesOrder',
		'ShowActualLedger',
		'ShowAllocateResource',
		'ShowBOM',
		'ShowBudgetLedger',
		'ShowCarrierRoute',
		'ShowCatalog',
		'ShowChartOfAccounts',
		'ShowCommercialInvoice',
		'ShowConfirmWIP',
		'ShowCostingActivity',
		'ShowCredit',
		'ShowCreditStatus',
		'ShowCreditTransfer',
		'ShowCreditTransferIST',
		'ShowCurrencyExchangeRate',
		'ShowCustomerPartyMaster',
		'ShowDebitTransfer',
		'ShowDebitTransferIST',
		'ShowDispatchList',
		'ShowEmployeeWorkSchedule',
		'ShowEmployeeWorkTime',
		'ShowEngineeringChangeOrder',
		'ShowEngineeringWorkDocument',
		'ShowField',
		'ShowHazardousMaterialShipmentDocument',
		'ShowInspectDelivery',
		'ShowInventoryBalance',
		'ShowInventoryConsumption',
		'ShowInventoryCount',
		'ShowInvoice',
		'ShowInvoiceLedgerEntry',
		'ShowIssueInventory',
		'ShowItemMaster',
		'ShowJournalEntry',
		'ShowLocation',
		'ShowLocationService',
		'ShowMaintenanceOrder',
		'ShowMatchDocument',
		'ShowMergeWIP',
		'ShowMoveInventory',
		'ShowMoveWIP',
		'ShowOnlineOrder',
		'ShowOnlineSession',
		'ShowOperation',
		'ShowOpportunity',
		'ShowPartyMaster',
		'ShowPayable',
		'ShowPaymentStatus',
		'ShowPaymentStatusIST',
		'ShowPersonnel',
		'ShowPickList',
		'ShowPlanningSchedule',
		'ShowPriceList',
		'ShowProductAvailability',
		'ShowProductionOrder',
		'ShowProductionPerformance',
		'ShowProductionSchedule',
		'ShowProjectAccounting',
		'ShowProjectMaster',
		'ShowPurchaseOrder',
		'ShowQuote',
		'ShowReceivable',
		'ShowReceiveDelivery',
		'ShowReceiveItem',
		'ShowRecoverWIP',
		'ShowRemittanceAdvice',
		'ShowRequireProduct',
		'ShowRequisition',
		'ShowRFQ',
		'ShowRiskControlLibrary',
		'ShowRouting',
		'ShowSalesLead',
		'ShowSalesOrder',
		'ShowSequenceSchedule',
		'ShowShipment',
		'ShowShipmentSchedule',
		'ShowShipmentUnit',
		'ShowShippersExportDeclaration',
		'ShowShippersLetterOfInstruction',
		'ShowSplitWIP',
		'ShowSupplierPartyMaster',
		'ShowUOMGroup',
		'ShowWarrantyClaim',
		'ShowWIPStatus',
		'SyncAllocateResource',
		'SyncBOM',
		'SyncCarrierRoute',
		'SyncCatalog',
		'SyncChartOfAccounts',
		'SyncCommercialInvoice',
		'SyncCredit',
		'SyncCreditStatus',
		'SyncCurrencyExchangeRate',
		'SyncCustomerPartyMaster',
		'SyncDispatchList',
		'SyncEmployeeWorkSchedule',
		'SyncEmployeeWorkTime',
		'SyncEngineeringChangeOrder',
		'SyncEngineeringWorkDocument',
		'SyncField',
		'SyncHazardousMaterialShipmentDocument',
		'SyncInspectDelivery',
		'SyncInventoryBalance',
		'SyncInventoryConsumption',
		'SyncInventoryCount',
		'SyncInvoice',
		'SyncItemMaster',
		'SyncLocation',
		'SyncMaintenanceOrder',
		'SyncOnlineOrder',
		'SyncOperation',
		'SyncOpportunity',
		'SyncPartyMaster',
		'SyncPersonnel',
		'SyncPickList',
		'SyncPlanningSchedule',
		'SyncPriceList',
		'SyncProductionOrder',
		'SyncProductionPerformance',
		'SyncProductionSchedule',
		'SyncProjectMaster',
		'SyncPurchaseOrder',
		'SyncQuote',
		'SyncRemittanceAdvice',
		'SyncRequisition',
		'SyncRFQ',
		'SyncRiskControlLibrary',
		'SyncRouting',
		'SyncSalesLead',
		'SyncSalesOrder',
		'SyncSequenceSchedule',
		'SyncShipment',
		'SyncShipmentSchedule',
		'SyncShipmentUnit',
		'SyncShippersExportDeclaration',
		'SyncShippersLetterOfInstruction',
		'SyncSupplierPartyMaster',
		'SyncUOMGroup',
		'SyncWarrantyClaim',
		'UpdateConfirmWIP',
		'UpdateCredit',
		'UpdateCreditStatus',
		'UpdateDispatchList',
		'UpdateEmployeeWorkTime',
		'UpdateEngineeringChangeOrder',
		'UpdateEngineeringWorkDocument',
		'UpdateInspectDelivery',
		'UpdateInventoryBalance',
		'UpdateInventoryCount',
		'UpdateInvoice',
		'UpdateMaintenanceOrder',
		'UpdateMatchDocument',
		'UpdateOnlineOrder',
		'UpdateOpportunity',
		'UpdatePickList',
		'UpdateProductionOrder',
		'UpdatePurchaseOrder',
		'UpdateQuote',
		'UpdateReceiveDelivery',
		'UpdateRequireProduct',
		'UpdateRequisition',
		'UpdateRFQ',
		'UpdateSalesLead',
		'UpdateSalesOrder'];
	
}; 