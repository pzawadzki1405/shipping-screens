/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
var PRINT_SEQUENCE_NOT_LAST = "1";
var PRINT_SEQUENCE_LAST = "2";

var LOCKED_NONE = "1";
var LOCKED_WRONG = "2";
var LOCKED_CORRECT = "3";

define(['N/url', 'N/currentRecord', 'N/record', 'N/search', 'N/https', 'N/ui/dialog'],
	function(url, currentRecord, record, search, https, dialog) {

		function changeShippingMethod(){
			log.debug("Enter button method");
			try{
			orderID = 9130445;
			record.submitFields({
				type: record.Type.SALES_ORDER,
				id: orderID,
				values: {
					shipmethod: 54,
				},
			});
			log.debug("Order with id ", orderID, " has been changed.")
		}
		catch(err){
			log.error("Error in changeShippingMethod", err);
		}

		}

		function pageInit(scriptContext) {}


		return {
			changeShippingMethod: changeShippingMethod,
			pageInit: pageInit
		};
	});
