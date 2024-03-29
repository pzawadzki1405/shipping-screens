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
var scriptid_number = 'customscript4072';
var deploymentid_number = 'customdeploy1';
var replenActive_search_id = 'customsearch5944';


define(['N/url', 'N/currentRecord', 'N/record', 'N/search', 'N/https', 'N/ui/dialog'],
	function(url, currentRecord, record, search, https, dialog) {

		function submit_button(){

			try{

				var currRec = currentRecord.get();
				var typeVal = currRec.getValue({
					fieldId: 'custpage_type'
				});
				var locVal = currRec.getValue({
					fieldId: 'custpage_location'
				});
				if (locVal){
					switch(typeVal){
						case 'best_seller':
						best_button(currRec);
						break;
						case 'bins_count':
						count_button(currRec);
						break;
						case 'bins':
						bin_button(currRec);
						break;
						case 'replenishments':
						replen_button(currRec);
						break;
						default:
						//error message
						break;

					}
				}
				else{
					alert("Please select location");
					return;
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
				var locVal = currRec.getValue({
					fieldId: 'custpage_location'
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

						var itemSku = currRec.getSublistValue({
							sublistId: 'custpage_bestlist',
							fieldId: 'custpage_bestlist_item',
							line: i
						});

						var recomended = currRec.getSublistValue({
							sublistId: 'custpage_bestlist',
							fieldId: 'custpage_bestlist_recomended',
							line: i
						});

						console.log("START making bin for  "+itemSku);

						var bestitemId = record.load({
							type: record.Type.INVENTORY_ITEM,
							id: itemid,
							isDynamic: true,
						});
						var bestitemBin = bestitemId.getSublist({
								sublistId: 'binnumber'
						});

						var numLinesBins = bestitemId.getLineCount({
    						sublistId: 'binnumber'
						});

						console.log("lines num  "+numLinesBins);

						log.debug("binnumber subblist  ", bestitemBin);

						for (var j = numLinesBins; j >= 0; j--){
							bestitemId.selectLine({
    						sublistId: 'binnumber',
    						line: j
							});
							var binLocation = bestitemId.getCurrentSublistValue({
    						sublistId: 'binnumber',
    						fieldId: 'location'
							});
							console.log("binLocation "+binLocation);
							if (binLocation == locVal){

								var binNumberId= bestitemId.getCurrentSublistValue({
									sublistId: 'binnumber',
									fieldId: 'binnumber'
								});

								var binRecord= record.load({
			    				type: record.Type.BIN,
			    				id: binNumberId,
			    				isDynamic: true,
								});

								binRecord.setValue({
									fieldId: 'custrecord_wmsse_replen_maxqty',
									value: ''
								});

								binRecord.setValue({
									fieldId: 'custrecord_wmsse_replen_minqty',
									value: ''
								});

								binRecord.setValue({
									fieldId: 'custrecord_wmsse_replen_qty',
									value: ''
								});

								binRecord.setValue({
									fieldId: 'custrecord_wmsse_replen_roundqty',
									value: ''
								});

								var id = binRecord.save();

								bestitemId.removeLine({
    							sublistId: 'binnumber',
    							line: j
								});


							}
						}

						console.log("lines num  "+numLines);

						bestitemId.selectNewLine({
							sublistId: 'binnumber'
						});
						bestitemId.setCurrentSublistValue({
						    sublistId: 'binnumber',
						    fieldId: 'location',
						    value: locVal
						});

						var binNumberValue = currRec.getValue({
								fieldId: 'custpage_best_bin'
						});
						//
						if(binNumberValue){
							recomended = binNumberValue;
						}

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
						console.log("FINISHED making bin for  "+itemSku);

					}
				}
				alert("FINISHED making bins");
				resetPage("refresh");
			}
			catch(e){
				log.error("error in best button ", e);
			}

		}

		function count_button(currRec){
			try{
				var numLines = currRec.getLineCount({
					sublistId: 'custpage_countlist'
				});
				var locVal = currRec.getValue({
					fieldId: 'custpage_location'
				});

				for (var i = 0; i < numLines; i++) {
					var checkbox = currRec.getSublistValue({
						sublistId: 'custpage_countlist',
						fieldId: 'custpage_countlist_checkbox',
						line: i
					});
					if (checkbox){
						var itemid = currRec.getSublistValue({
							sublistId: 'custpage_countlist',
							fieldId: 'custpage_countlist_item_id',
							line: i
						});

						var itemSku = currRec.getSublistValue({
							sublistId: 'custpage_countlist',
							fieldId: 'custpage_countlist_item',
							line: i
						});

						var recomended = currRec.getSublistValue({
							sublistId: 'custpage_countlist',
							fieldId: 'custpage_countlist_lowest',
							line: i
						});

						console.log("START making bin for  "+itemSku);

						var bestitemId = record.load({
							type: record.Type.INVENTORY_ITEM,
							id: itemid,
							isDynamic: true,
						});
						var bestitemBin = bestitemId.getSublist({
								sublistId: 'binnumber'
						});

						var numLinesBins = bestitemId.getLineCount({
								sublistId: 'binnumber'
						});

						console.log("lines num  "+numLinesBins);

						log.debug("binnumber subblist  ", bestitemBin);

						for (var j = numLinesBins; j >= 0; j--){
							bestitemId.selectLine({
								sublistId: 'binnumber',
								line: j
							});
							var binLocation = bestitemId.getCurrentSublistValue({
								sublistId: 'binnumber',
								fieldId: 'location'
							});
							console.log("binLocation "+binLocation);
							if (binLocation == locVal){

								var binNumberId= bestitemId.getCurrentSublistValue({
									sublistId: 'binnumber',
									fieldId: 'binnumber'
								});

								var binRecord= record.load({
									type: record.Type.BIN,
									id: binNumberId,
									isDynamic: true,
								});

								binRecord.setValue({
									fieldId: 'custrecord_wmsse_replen_maxqty',
									value: ''
								});

								binRecord.setValue({
									fieldId: 'custrecord_wmsse_replen_minqty',
									value: ''
								});

								binRecord.setValue({
									fieldId: 'custrecord_wmsse_replen_qty',
									value: ''
								});

								binRecord.setValue({
									fieldId: 'custrecord_wmsse_replen_roundqty',
									value: ''
								});

								var id = binRecord.save();

								bestitemId.removeLine({
									sublistId: 'binnumber',
									line: j
								});


							}
						}

						console.log("lines num  "+numLines);

						bestitemId.selectNewLine({
							sublistId: 'binnumber'
						});
						bestitemId.setCurrentSublistValue({
								sublistId: 'binnumber',
								fieldId: 'location',
								value: locVal
						});

						var binNumberValue = currRec.getValue({
								fieldId: 'custpage_count_bin'
						});
						//
						if(binNumberValue){
							recomended = binNumberValue;
						}

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
						console.log("FINISHED making bin for  "+itemSku);

					}
				}
				alert("FINISHED making bins");
				resetPage("refresh");
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

			var locVal = currRec.getValue({
				fieldId: 'custpage_location'
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

					var bin_name = currRec.getSublistValue({
						sublistId: 'custpage_binslist',
						fieldId: 'custpage_binslist_item',
						line: i
					});

					console.log("Start making bin for  "+bin_name);

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
					console.log("Finished making bin for  "+bin_name);

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
			resetPage('refresh');
		}
		catch(e){
			console.log("error in bin button ", e);
			log.error("error in bin button", e);
		}
		}

		function replen_button(currRec){
			try{
			var numLines = currRec.getLineCount({
				sublistId: 'custpage_replenlist'
			});

			var locVal = currRec.getValue({
				fieldId: 'custpage_location'
			});

			for (var i = 0; i < numLines; i++) {
				var checkbox = currRec.getSublistValue({
					sublistId: 'custpage_replenlist',
					fieldId: 'custpage_replenlist_checkbox',
					line: i
				});
				if (checkbox){

					var replenishmentItem = currRec.getSublistValue({
						sublistId: 'custpage_replenlist',
						fieldId: 'custpage_replenlist_item',
						line: i
					});

					var replenishmentItemId = currRec.getSublistValue({
						sublistId: 'custpage_replenlist',
						fieldId: 'custpage_replenlist_item_id',
						line: i
					});

					var fromBinName = currRec.getSublistValue({
						sublistId: 'custpage_replenlist',
						fieldId: 'custpage_replenlist_frombin',
						line: i
					});

					var replenishmentQuantity = currRec.getSublistValue({
						sublistId: 'custpage_replenlist',
						fieldId: 'custpage_replenlist_fromavailable',
						line: i
					});

					var replenishmentMaximum = currRec.getSublistValue({
						sublistId: 'custpage_replenlist',
						fieldId: 'custpage_replenlist_maximum',
						line: i
					});

					var replenishmentToAvailable = currRec.getSublistValue({
						sublistId: 'custpage_replenlist',
						fieldId: 'custpage_replenlist_toavailable',
						line: i
					});

					console.log("Start making replenishment for  "+replenishmentItem);

					var replenActiveSearch = search.load({ id: replenActive_search_id});
					var replenfilters = replenActiveSearch.filters;
					replenfilters.push(search.createFilter({name: 'custrecord_wmsse_sku', operator: search.Operator.ANYOF, values: replenishmentItemId }));
					replenfilters.push(search.createFilter({name: 'custrecord_wmsse_wms_location', operator: search.Operator.ANYOF, values: locVal }));
					replenActiveSearch.filters = replenfilters;
					var results_replenActiveSearch = replenActiveSearch.run();
					var results_replenActiveSearch_array = results_replenActiveSearch.getRange({
						start: 0,
						end: 100
					});
					if (results_replenActiveSearch_array.length > 0){
							var sumReplenishment = 0;
							var skipToNext = false;
							for (var j=0;  j < results_replenActiveSearch_array.length; j++){
								//console.log("bin "+results_replenActiveSearch_array[j].getText(replenActiveSearch.columns[1]));
								//console.log("j ",j);
								if (fromBinName == results_replenActiveSearch_array[j].getText(replenActiveSearch.columns[1])){
									alert("You already have replenishment active for SKU "+replenishmentItem+" at location "+fromBinName);
									skipToNext = true;
									continue;
								}
								else{
									sumReplenishment = sumReplenishment + parseInt(results_replenActiveSearch_array[j].getValue(replenActiveSearch.columns[2]));
								}
							}
							console.log("sumReplenishment "+sumReplenishment);
							if (sumReplenishment > 0){
								var maximumInt = parseInt(replenishmentMaximum);
								var toAvailableInt= parseInt(replenishmentToAvailable);
								if ((parseInt(replenishmentToAvailable)+sumReplenishment+parseInt(replenishmentQuantity)) > parseInt(replenishmentMaximum)){
									alert("You exceed maximum for SKU "+replenishmentItem+" and you cant put more replenishment tasks");
									skipToNext = true;
								}

							}
							if (skipToNext == true) continue;
					}
					if ((parseInt(replenishmentToAvailable)+parseInt(replenishmentQuantity)) > parseInt(replenishmentMaximum)){
						alert("You exceed maximum for SKU "+replenishmentItem+" and you cant put more replenishment tasks");
						continue;
					}

					var replenishmentTask = record.create({
							type: 'customrecord_wmsse_trn_opentask',
							//isDynamic: false
					});

					replenishmentTask.setValue({
							fieldId: 'name',
							value: 'Custom replenishment '+ replenishmentItem
					});

					replenishmentTask.setValue({
							fieldId: 'custrecord_wmsse_sku',
							value: replenishmentItemId
					});

					replenishmentTask.setValue({
							fieldId: 'custrecord_wmsse_expe_qty',
							value: replenishmentQuantity
					});

					replenishmentTask.setValue({
							fieldId: 'custrecord_wmsse_wms_status_flag',
							value: 30
					});

					replenishmentTask.setValue({
							fieldId: 'custrecord_wmsse_tasktype',
							value: 17
					});

					var fromBinId = currRec.getSublistValue({
						sublistId: 'custpage_replenlist',
						fieldId: 'custpage_replenlist_frombin_id',
						line: i
					});
					replenishmentTask.setValue({
							fieldId: 'custrecord_wmsse_actbeginloc',
							value: fromBinId
					});

					var toBin = currRec.getSublistValue({
						sublistId: 'custpage_replenlist',
						fieldId: 'custpage_replenlist_tobin_id',
						line: i
					});
					replenishmentTask.setValue({
							fieldId: 'custrecord_wmsse_actendloc',
							value: toBin
					});

					replenishmentTask.setValue({
							fieldId: 'custrecord_wmsse_wms_location',
							value: locVal
					});

					replenishmentTask.setValue({
							fieldId: 'custrecord_wmsse_reccommendedbin',
							value: fromBinId
					});


					var replenishmentId = replenishmentTask.save();
					console.log("Finished making replenishment for  "+replenishmentItem);





				}
			}
			alert("Finished adding replenishments");
			resetPage('refresh');

		}
		catch(error){
			log.debug("error in replen button ", error);
		}
		}

		function pageInit(scriptContext) {}

		function fieldChanged(scriptContext) {
			try{
		if (scriptContext.fieldId == 'custpage_type' || scriptContext.fieldId == 'custpage_location'){
			var currRec = scriptContext.currentRecord;
			var typeVal = currRec.getValue({
				fieldId: 'custpage_type'
			});
			var locationVal = currRec.getValue({
				fieldId: 'custpage_location'
			});
			var suiteletLink = url.resolveScript({
				scriptId: scriptid_number,
				deploymentId: deploymentid_number
			});
			if (typeVal){
				suiteletLink += '&typeVal=' + typeVal;
			}
			if (locationVal){
				suiteletLink += '&locVal=' + locationVal;
			}
			window.onbeforeunload = null;
			window.location.href = suiteletLink;
	}

	if (scriptContext.fieldId == 'custpage_replenishment_consolidation' || scriptContext.fieldId == 'custpage_replenishment_sku' || scriptContext.fieldId == 'custpage_replenishment_minimum'){
		var currRec = scriptContext.currentRecord;
		var consolidation = currRec.getValue({
			fieldId: 'custpage_replenishment_consolidation'
		});
		var typeVal = currRec.getValue({
			fieldId: 'custpage_type'
		});

		var locVal = currRec.getValue({
			fieldId: 'custpage_location'
		});

		var itemName = currRec.getValue({
			fieldId: 'custpage_replenishment_sku'
		});

		var minimum = currRec.getValue({
			fieldId: 'custpage_replenishment_minimum'
		});

		var suiteletLink = url.resolveScript({
			scriptId: scriptid_number,
			deploymentId: deploymentid_number
		});
		if (typeVal){
			suiteletLink += '&typeVal=' + typeVal;
		}
		if (locVal){
			suiteletLink += '&locVal=' + locVal;
		}
		if (consolidation){
			suiteletLink += '&consolidation=' + consolidation;
		}
		if (itemName){
			suiteletLink += '&itemName=' + itemName;
		}
		if (minimum){
			suiteletLink += '&minimum=' + minimum;
		}
		window.onbeforeunload = null;
		window.location.href = suiteletLink;

	}

	if (scriptContext.fieldId == 'custpage_best_preffered' || scriptContext.fieldId == 'custpage_best_sold' || scriptContext.fieldId == 'custpage_best_itemname'){
		var currRec = scriptContext.currentRecord;
		var bestPreffered = currRec.getValue({
			fieldId: 'custpage_best_preffered'
		});
		var typeVal = currRec.getValue({
			fieldId: 'custpage_type'
		});
		var locVal = currRec.getValue({
			fieldId: 'custpage_location'
		});
		var bestSold = currRec.getValue({
			fieldId: 'custpage_best_sold'
		});

		var bestItemName = currRec.getValue({
			fieldId: 'custpage_best_itemname'
		});

		var suiteletLink = url.resolveScript({
			scriptId: scriptid_number,
			deploymentId: deploymentid_number
		});
		if (typeVal){
			suiteletLink += '&typeVal=' + typeVal;
		}
		if (locVal){
			suiteletLink += '&locVal=' + locVal;
		}
		if (bestItemName){
			suiteletLink += '&itemName=' + bestItemName;
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

	if (scriptContext.fieldId == 'custpage_count_preffered'  || scriptContext.fieldId == 'custpage_count_itemname'){
		var currRec = scriptContext.currentRecord;
		var binsPreffered = currRec.getValue({
			fieldId: 'custpage_count_preffered'
		});
		var typeVal = currRec.getValue({
			fieldId: 'custpage_type'
		});
		var locVal = currRec.getValue({
			fieldId: 'custpage_location'
		});


		var bestItemName = currRec.getValue({
			fieldId: 'custpage_count_itemname'
		});

		var suiteletLink = url.resolveScript({
			scriptId: scriptid_number,
			deploymentId: deploymentid_number
		});
		if (typeVal){
			suiteletLink += '&typeVal=' + typeVal;
		}
		if (locVal){
			suiteletLink += '&locVal=' + locVal;
		}
		if (bestItemName){
			suiteletLink += '&itemName=' + bestItemName;
		}
		if (binsPreffered){
			suiteletLink += '&binsPreffered=' + binsPreffered;
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
		var locVal = currRec.getValue({
			fieldId: 'custpage_location'
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
		if (locVal){
			suiteletLink += '&locVal=' + locVal;
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

		function resetPage(refresh){
			if (refresh){
				var suiteletLink = window.location.href;
			}
			else{
			var suiteletLink = url.resolveScript({
				scriptId: scriptid_number,
				deploymentId: deploymentid_number
			});
			}
			window.onbeforeunload = null;
			window.location.href = suiteletLink;
		}

		return {
			submit_button: submit_button,
			best_button:best_button,
			count_button:count_button,
			replen_button:replen_button,
			bin_button:bin_button,
			fieldChanged:fieldChanged,
			resetPage:resetPage,
			pageInit: pageInit
		};
	});
