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

				//var suiteletURL = "file:///C:/Users/wareh/Downloads/FedEx_Shipping_Label_1659387368195.pdf";

				//subs 2 to USA
				var subsidiaryId = 2;
		    var locationId = 3;
				var accountId = 58;
		    //var itemId = 1215;
		    //var binNumber = 7648;

				var currRec = currentRecord.get();
				var numLines = currRec.getLineCount({
					sublistId: 'custpage_picktasklist'
				});

		    var inventoryCount = record.create({
		        type: record.Type.INVENTORY_COUNT,
		        isDynamic: true
		    });
		    inventoryCount.setValue({
		        fieldId: 'subsidiary',
		        value: subsidiaryId
		    });
		    inventoryCount.setValue({
		        fieldId: 'location',
		        value: locationId
		    });
				inventoryCount.setValue({
		        fieldId: 'account',
		        value: accountId
		    });

				//var numLines = 1;
				for (var i = 0; i < numLines; i++) {
					var itemName = currRec.getSublistValue({
						sublistId: 'custpage_picktasklist',
						fieldId: 'custpage_picktasklist_item',
						line: i
					});
		    	inventoryCount.selectNewLine({
		        	sublistId: 'item'
		    	});
					var itemId = currRec.getSublistValue({
						sublistId: 'custpage_picktasklist',
						fieldId: 'custpage_picktasklist_itemid',
						line: i
					});
		    	inventoryCount.setCurrentSublistValue({
		        	sublistId: 'item',
		        	fieldId: 'item',
		        	value: itemId
		    	});
					var binNumber = currRec.getSublistValue({
						sublistId: 'custpage_picktasklist',
						fieldId: 'custpage_picktasklist_binid',
						line: i
					});
		    	inventoryCount.setCurrentSublistValue({
		        	sublistId: 'item',
		        	fieldId: 'binnumber',
		        	value: binNumber
		    	});
		    	inventoryCount.commitLine({
		        	sublistId: 'item'
		    	});
				}

		    var recordId = inventoryCount.save();


		    log.debug({
		        title: 'Inventory Count Created: ' + inventoryCount
		    });
				alert("Inventory Count Created: ", inventoryCount);
			}
			catch(err){
				log.error("Error in changeShippingMethod", err);
			}

		}

		function countInterval(){

			try{
				var currRec = currentRecord.get();
				var numLines = currRec.getLineCount({
					sublistId: 'custpage_picktasklist'
				});
				for (var i = 0; i < numLines; i++) {
					var interval = currRec.getSublistValue({
						sublistId: 'custpage_picktasklist',
						fieldId: 'custpage_picktasklist_interval',
						line: i
					});
					if((!interval) || (interval == 0)){
						var itemId = currRec.getSublistValue({
							sublistId: 'custpage_picktasklist',
							fieldId: 'custpage_picktasklist_itemid',
							line: i
						});
						var ItemLocationIDSearch = search.create({
							type: search.Type.ITEM_LOCATION_CONFIGURATION,
							filters: [ ['item', 'anyof', itemId], "AND", ['location', 'anyof', 3] ],
							columns: [ 'item', 'internalid' ]
						});
						var ItemLocationIDSearchResults = ItemLocationIDSearch.run();
						var ItemLocationIDSearchResultsArray = ItemLocationIDSearchResults.getRange({ start:0, end: 1});
						//log.debug("ItemLocationIDSearchResults.lenght", ItemLocationIDSearchResultsArray.length);
						//log.debug("ItemLocationID", ItemLocationID);
						if (ItemLocationIDSearchResultsArray.length > 0){
							var ItemLocationID = ItemLocationIDSearchResultsArray[0].getValue({
								name: "internalid"
							});
							//log.debug("ItemLocationID", ItemLocationID);
							var id = record.submitFields({
	    					type: record.Type.ITEM_LOCATION_CONFIGURATION,
	    					id: ItemLocationID,
	    					values: {
	        				invtcountinterval: 90
	    					}
							});
						}


					}
				}
				alert("Count interval added!");


			}
			catch(err){
				log.error("Error in countInterval()", err);
			}


		}

		function pageInit(scriptContext) {}


		return {
			changeShippingMethod: changeShippingMethod,
			countInterval: countInterval,
			pageInit: pageInit
		};
	});
