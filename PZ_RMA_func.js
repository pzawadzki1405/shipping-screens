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

define(['N/url', 'N/currentRecord', 'N/record', 'N/search', 'N/https', 'N/ui/dialog'],
	function(url, currentRecord, record, search, https, dialog) {

		function removeRMA(){

			try{

				var subsidiaryId = USA_subsidiary;
		    var locationId = USA_rma_location;
				var accountId = 58;
				//var itemId = 400;
				//var itemQuantity = 1;
				var adjBin = 'NEW RMA';
				var currRec = currentRecord.get();
				var numLines = currRec.getLineCount({
						sublistId: 'custpage_rmalist'
					});


				var rmaAdjustement = record.create({
												type: record.Type.INVENTORY_ADJUSTMENT,
												isDynamic: true
				});
				var date = new Date();
			 rmaAdjustement.setValue({
					 fieldId: 'trandate',
					 value: date
			 });
				rmaAdjustement.setValue({
						fieldId: 'subsidiary',
						value: subsidiaryId
				});
				rmaAdjustement.setValue({
						fieldId: 'location',
						value: locationId
				});
				rmaAdjustement.setValue({
						fieldId: 'adjlocation',
						value: locationId
				});
				rmaAdjustement.setValue({
						fieldId: 'account',
						value: accountId
				});
				rmaAdjustement.setValue({
						fieldId: 'memo',
						value: 'RMA Adjustement'
				});
				// rmaAdjustement.setValue({
				// 		fieldId: 'customform',
				// 		value: 10
				// });
				for (var i=0; i < numLines; i++){
					var checkbox = currRec.getSublistValue({
						sublistId: 'custpage_rmalist',
						fieldId: 'custpage_rmalist_checkbox',
						line: i
					});
					if (checkbox){
						var itemid = currRec.getSublistValue({
							sublistId: 'custpage_rmalist',
							fieldId: 'custpage_rmalist_item_id',
							line: i
						});
						var item = currRec.getSublistValue({
							sublistId: 'custpage_rmalist',
							fieldId: 'custpage_rmalist_item',
							line: i
						});
						rmaAdjustement.selectNewLine({
								sublistId: 'inventory'
						});
						rmaAdjustement.setCurrentSublistValue({
								sublistId: 'inventory',
								fieldId: 'item',
								value: itemid
						});
						rmaAdjustement.setCurrentSublistValue({
								sublistId: 'inventory',
								fieldId: 'location',
								value: locationId
						});

						var itemQuantity = prompt("How many of item "+item+" do you want to remove?");
						var rmaQuantity = currRec.getSublistValue({
							sublistId: 'custpage_rmalist',
							fieldId: 'custpage_rmalist_available',
							line: i
						});
						if (itemQuantity <=0){
							alert("You entered wrong number");
							continue;
						}
						if (itemQuantity > rmaQuantity){
							alert("There is not enough items "+item+" in RMA");
							continue;
						}
						else{
							itemQuantity = itemQuantity*(-1);
						}
						rmaAdjustement.setCurrentSublistValue({
								sublistId: 'inventory',
								fieldId: 'adjustqtyby',
								value: itemQuantity
						});
						var reason = prompt("Why do you want to remove item "+item+"?");
						rmaAdjustement.setCurrentSublistValue({
								sublistId: 'inventory',
								fieldId: 'memo',
								value: reason
						});
						var rmaInventoryDetail = rmaAdjustement.getCurrentSublistSubrecord({
								sublistId: 'inventory',
								fieldId: 'inventorydetail'
						});
						rmaInventoryDetail.selectNewLine({
								sublistId: 'inventoryassignment'
						});
						rmaInventoryDetail.setCurrentSublistValue({
						    sublistId: 'inventoryassignment',
						     fieldId: 'issueinventorynumber',
						     value: 'lotNumber'
						});
						rmaInventoryDetail.setCurrentSublistText({
								sublistId: 'inventoryassignment',
								fieldId: 'binnumber',
								text: adjBin
						});
						rmaInventoryDetail.setCurrentSublistValue({
								sublistId: 'inventoryassignment',
								fieldId: 'quantity',
								value: itemQuantity
						});
						rmaInventoryDetail.commitLine({
								sublistId: 'inventoryassignment'
						});
						//log.debug("commited inventory detail" , rmaInventoryDetail);
						rmaAdjustement.commitLine({
								sublistId: 'inventory'
						});
						//log.debug("commited inventory adjust" , rmaAdjustement);
					}
				}
				//




				//


				try {
						var linesRmaRemove = rmaAdjustement.getLineCount({sublistId: 'inventory'});
						if (linesRmaRemove > 0){
							var recId = rmaAdjustement.save();
							log.debug({
									title: 'Record created successfully',
									details: 'Id: ' + recId
								});
								alert("You successfully removed items from RMA");
								resetPage();
						}
						else {
							alert("You need to select items to remove");
							resetPage();
						}
				} catch (e) {
						log.error("Error in transferStaging", e);
				}

				//	var response = prompt(" Please enter something ");
				//	alert("You enetered "+response);
			}
			catch(err){
				log.error("Error in transferStaging", err);
			}

		}

		function pageInit(scriptContext) {}

		function fieldChanged(scriptContext) {
			try{
			if (scriptContext.fieldId == 'custpage_itemname_filter'){
				var currRec = scriptContext.currentRecord;
				var itemName = currRec.getValue({
					fieldId: 'custpage_itemname_filter'
				});
				var suiteletLink = url.resolveScript({
					scriptId: 'customscript3261',
					deploymentId: 'customdeploy1'
				});
				suiteletLink += '&itemName=' + itemName;
				window.onbeforeunload = null;
				window.location.href = suiteletLink;
		}

		// if (scriptContext.sublistId == 'custpage_rmalist' && scriptContext.fieldId == 'custpage_rmalist_checkbox'){
		// 		var currRec = scriptContext.currentRecord;
		// 	var currIndex = currRec.getCurrentSublistIndex({sublistId: 'custpage_rmalist'});
		// 	var numLines = currRec.getLineCount({
		// 		sublistId: 'custpage_rmalist'
		// 	});
		// 	console.log("currIndex", currIndex);
		// 	console.log("numLines", numLines);
		// 	for (var i=0; i < numLines; i++){
		// 		if (i != currIndex){
		// 			// currRec.setCurrentSublistValue({
		// 			// 	sublistId : 'custpage_rmalist',
		// 			// 	fieldId : 'custpage_rmalist_checkbox',
		// 			// 	line: i,
		// 			// 	value: false
		// 			// });
		//
		// 		}
		// 	}
		// }
	}
	catch(error){
		//alert("Error in field changed", error);
		console.log("error ", error);
		log.debug("Error in field changed", error);
	}

		}

		function resetPage(){
			// try{
			// var currRec = currentRecord.get();
			// var numLines = currRec.getLineCount({
			// 		sublistId: 'custpage_rmalist'
			// 	});
			//
			// 	for (var i=0; i < numLines; i++){
			// 		var checkbox = currRec.getSublistValue({
			// 			sublistId: 'custpage_rmalist',
			// 			fieldId: 'custpage_rmalist_checkbox',
			// 			line: i
			// 		});
			// 		//log.debug("checkbox ", i, " value ", checkbox);
			// 		if (checkbox){
			// 			var item = currRec.getSublistValue({
			// 				sublistId: 'custpage_rmalist',
			// 				fieldId: 'custpage_rmalist_item',
			// 				line: i
			// 			});
			// 			alert("you selected item"+item);
			// 		}
			// 	}
			// }
			// catch(e){
			// 	log.error("error in reset page",e);
			// }
			var suiteletLink = url.resolveScript({
				scriptId: 'customscript3261',
				deploymentId: 'customdeploy1'
			});
			window.onbeforeunload = null;
			window.location.href = suiteletLink;
		}

		return {
			removeRMA: removeRMA,
			fieldChanged:fieldChanged,
			resetPage:resetPage,
			pageInit: pageInit
		};
	});
