/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
var Germany_location = 4;
var Germany_subsidiary = 5;
var USA_subsidiary = 2;
var USA_location = 3;
var USA_rma_location = 6;
var Germany_rma_location = 8;
var scriptid_number = 'customscript3017';
var deploymentid_number = 'customdeploy1';

define(['N/url', 'N/currentRecord', 'N/record', 'N/search', 'N/https', 'N/ui/dialog'],
	function(url, currentRecord, record, search, https, dialog) {

		function submit_button(){

			try{

				var currRec = currentRecord.get();
				var typeVal = currRec.getValue({
					fieldId: 'custpage_type'
				});
				switch(typeVal){
					case 'best_seller':
					best_button(currRec);
					break;
					case 'bins':
					bin_button(currRec);
					break;
					case 'replenishments':

					break;
					default:
					//error message
					break;

				}

			}
			catch(err){
				log.error("Error in submit button", err);
			}

		}

		function best_button(currRec){
			try{
				var numLines = currRec.getLineCount({
					sublistId: 'custpage_bestlist'
				});

				for (var i = 0; i < numLines; i++) {
					var checkbox = currRec.getSublistValue({
						sublistId: 'custpage_bestlist',
						fieldId: 'custpage_bestlist_checkbox',
						line: i
					});
					if (checkbox){
						var itemid = currRec.getSublistValue({
							sublistId: 'custpage_bestlist',
							fieldId: 'custpage_bestlist_item_id',
							line: i
						});
						var recomended = currRec.getSublistValue({
							sublistId: 'custpage_bestlist',
							fieldId: 'custpage_bestlist_recomended',
							line: i
						});
						// var id = record.submitFields({
						// 	type: record.Type.INVENTORY_ITEM,
						// 	id: itemid,
						// 	values: {
						// 		binnumber: recomended,
						// 		preferredbin: true
						// 	}
						// });
						var bestitemId = record.load({
							type: record.Type.INVENTORY_ITEM,
							id: itemid,
							isDynamic: true,
						});
						var bestitemBin = bestitemId.getSublist({
								sublistId: 'binnumber'
						});
						bestitemId.selectNewLine({
							sublistId: 'binnumber'
						});
						bestitemId.setCurrentSublistValue({
						    sublistId: 'binnumber',
						    fieldId: 'location',
						    value: USA_location
						});
						bestitemId.setCurrentSublistText({
						    sublistId: 'binnumber',
						    fieldId: 'binnumber',
						    text: recomended
						});
						bestitemId.setCurrentSublistValue({
						    sublistId: 'binnumber',
						    fieldId: 'preferredbin',
						    value: true
						});
						bestitemId.commitLine({
								sublistId: 'binnumber'
						});
						bestitemId.save();
						log.debug("record saved");
						// var id = record.load({
						// 	type: record.Type.INVENTORY_ITEM,
						// 	id: 7045,
						// });
						//
						// log.debug("id to jest ", id.getSublistValue({
						// 	sublistId: 'binnumber',
    				// 	fieldId: 'binnumber',
    				// 	line: 0}
						// ));
						//console.log("id to jest ", id.getValue({fieldId: 'binnumber'}));

					}
				}
			}
			catch(e){
				log.error("error in best button ", e);
			}

		}

		function bin_button(currRec){

			try{
			var numLines = currRec.getLineCount({
				sublistId: 'custpage_binslist'
			});

			for (var i = 0; i < numLines; i++) {
				var checkbox = currRec.getSublistValue({
					sublistId: 'custpage_binslist',
					fieldId: 'custpage_binslist_checkbox',
					line: i
				});
				if (checkbox){
					var bin_id = currRec.getSublistValue({
						sublistId: 'custpage_binslist',
						fieldId: 'custpage_binslist_bin_id',
						line: i
					});
					var bin_min = currRec.getValue({
							fieldId: 'custpage_bin_min'
					});
					var bin_max = currRec.getValue({
							fieldId: 'custpage_bin_max'
					});
					var bin_rpln = currRec.getValue({
							fieldId: 'custpage_bin_replen'
					});
					var bin_round = currRec.getValue({
							fieldId: 'custpage_bin_round'
					});

					var binRecord= record.load({
    				type: record.Type.BIN,
    				id: bin_id,
    				isDynamic: true,
					});

					binRecord.setValue({
						fieldId: 'custrecord_wmsse_replen_maxqty',
						value: bin_max,
					});

					binRecord.setValue({
						fieldId: 'custrecord_wmsse_replen_minqty',
						value: bin_min,
					});

					binRecord.setValue({
						fieldId: 'custrecord_wmsse_replen_qty',
						value: bin_rpln,
					});

					binRecord.setValue({
						fieldId: 'custrecord_wmsse_replen_roundqty',
						value: bin_round,
					});

					var id = binRecord.save();

					// var id = record.submitFields({
					// 	type: record.Type.BIN,
					// 	id: bin_id,
					// 	values: {
					// 		// custrecord_wmsse_replen_roundqty: bin_round,
					// 		// custrecord_wmsse_replen_qty: bin_rpln,
					// 		// custrecord_wmsse_replen_minqty: bin_min,
					// 		custrecord_wmsse_replen_maxqty: bin_max
					//
					// 	}
					// });
					log.debug("id to jest ", id);

				}
			}
			alert("BINS successfully changed");
			resetPage();
		}
		catch(e){
			console.log("error in bin button ", e);
			log.error("error in bin button", e);
		}
		}

		function pageInit(scriptContext) {}

		function fieldChanged(scriptContext) {
			try{
		if (scriptContext.fieldId == 'custpage_type'){
			var currRec = scriptContext.currentRecord;
			var typeVal = currRec.getValue({
				fieldId: 'custpage_type'
			});
			var suiteletLink = url.resolveScript({
				scriptId: scriptid_number,
				deploymentId: deploymentid_number
			});
			suiteletLink += '&typeVal=' + typeVal;
			window.onbeforeunload = null;
			window.location.href = suiteletLink;
	}
	if (scriptContext.fieldId == 'custpage_best_preffered' || scriptContext.fieldId == 'custpage_best_sold'){
		var currRec = scriptContext.currentRecord;
		var bestPreffered = currRec.getValue({
			fieldId: 'custpage_best_preffered'
		});
		var typeVal = currRec.getValue({
			fieldId: 'custpage_type'
		});
		var bestSold = currRec.getValue({
			fieldId: 'custpage_best_sold'
		});
		var suiteletLink = url.resolveScript({
			scriptId: scriptid_number,
			deploymentId: deploymentid_number
		});
		if (typeVal){
			suiteletLink += '&typeVal=' + typeVal;
		}
		if (bestPreffered){
			suiteletLink += '&bestPreffered=' + bestPreffered;
		}
		if (bestSold){
			suiteletLink += '&bestSold=' + bestSold;			
		}
		window.onbeforeunload = null;
		window.location.href = suiteletLink;
	}
	if (scriptContext.fieldId == 'custpage_bin_item' || scriptContext.fieldId == 'custpage_bin_type' || scriptContext.fieldId == 'custpage_bin_done'){
		var currRec = scriptContext.currentRecord;
		var itemName = currRec.getValue({
			fieldId: 'custpage_bin_item'
		});
		var typeVal = currRec.getValue({
			fieldId: 'custpage_type'
		});
		var itemtype = currRec.getValue({
			fieldId: 'custpage_bin_type'
		});
		var binDone = currRec.getValue({
			fieldId: 'custpage_bin_done'
		});
		var suiteletLink = url.resolveScript({
			scriptId: scriptid_number,
			deploymentId: deploymentid_number
		});
		if (typeVal){
			suiteletLink += '&typeVal=' + typeVal;
		}
		if (itemtype){
			suiteletLink += '&itemType=' + itemtype;
		}
		if (itemName){
			suiteletLink += '&itemName=' + itemName;
		}
		if (binDone){
			suiteletLink += '&binDone=' + binDone;
		}
		window.onbeforeunload = null;
		window.location.href = suiteletLink;
	}

	}
	catch(error){
		//alert("Error in field changed", error);
		console.log("error ", error);
		log.debug("Error in field changed", error);
	}

		}

		function resetPage(){

			var suiteletLink = url.resolveScript({
				scriptId: scriptid_number,
				deploymentId: deploymentid_number
			});
			window.onbeforeunload = null;
			window.location.href = suiteletLink;
		}

		return {
			submit_button: submit_button,
			best_button:best_button,
			bin_button:bin_button,
			fieldChanged:fieldChanged,
			resetPage:resetPage,
			pageInit: pageInit
		};
	});
