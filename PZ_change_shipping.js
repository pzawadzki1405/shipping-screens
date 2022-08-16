/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget', 'N/search', 'N/https', 'N/ui/message', 'N/record', 'N/runtime'],

	function(serverWidget, search, https, message, record, runtime) {



		function onRequest(context) {
			try {
				var title = " onRequest ";


					var form = serverWidget.createForm({
						title: 'Inventory Counting'
					});

					//********Added for test - Przemyslaw Zawadzki******////
					form.addField({
						id: 'custpage_username',
						type: serverWidget.FieldType.LABEL,
						label: 'TEST BUTTON: '
					});

					var orders = form.addField({
						id: 'custpage_order_id',
						type: serverWidget.FieldType.TEXTAREA,
						label: 'Pick tass low quantity: '
					});
					orders.updateDisplayType({
						displayType: serverWidget.FieldDisplayType.INLINE
					});

					var movements = form.addField({
						id: 'custpage_movements_id',
						type: serverWidget.FieldType.TEXTAREA,
						label: 'Movements: '
					});
					movements.updateDisplayType({
						displayType: serverWidget.FieldDisplayType.INLINE
					});

					var picktaskList = form.addSublist({
						id: 'custpage_picktasklist',
						type: serverWidget.SublistType.LIST,
						label: 'PICK TASK LOW QUANTITY'
					});
					picktaskList.addField({
						id: 'custpage_picktasklist_item',
						type: serverWidget.FieldType.TEXT,
						label: 'ITEM NAME'
					});
					picktaskList.addField({
						id: 'custpage_picktasklist_bin',
						type: serverWidget.FieldType.TEXT,
						label: 'BIN NUMBER'
					});
					picktaskList.addField({
						id: 'custpage_picktasklist_available',
						type: serverWidget.FieldType.TEXT,
						label: 'LOCATION AVAILABLE'
					});
					picktaskList.addField({
						id: 'custpage_picktasklist_date',
						type: serverWidget.FieldType.TEXT,
						label: 'NEXT COUNT DATE'
					});
					picktaskList.addField({
						id: 'custpage_picktasklist_itemid',
						type: serverWidget.FieldType.TEXT,
						label: 'item id'
					}).updateDisplayType({
						displayType: serverWidget.FieldDisplayType.HIDDEN
					});
					picktaskList.addField({
						id: 'custpage_picktasklist_binid',
						type: serverWidget.FieldType.TEXT,
						label: 'bin id'
					}).updateDisplayType({
						displayType: serverWidget.FieldDisplayType.HIDDEN
					});
					picktaskList.addField({
						id: 'custpage_picktasklist_interval',
						type: serverWidget.FieldType.TEXT,
						label: 'COUNT INTERVAL'
					});
					//PICK TASK LOW QUANTITY

					var strOutput = "";
					try{

						var picktaskSearch = search.load({ id: 'customsearch4892'});
						var results_picktask_search = picktaskSearch.run();
						var results_picktask_search_array = results_picktask_search.getRange({
							start: 0,
							end: 100
						});

						log.debug("results_picktask_search_array.length -->: ", results_picktask_search_array.length);

						//FEDEX HOME VAL = 3, USPS PRIORITY = 54
						for (var i = 0; i < results_picktask_search_array.length; i++){
							picktaskList.setSublistValue({
								id: 'custpage_picktasklist_item',
								line: i,
								value: results_picktask_search_array[i].getValue(results_picktask_search.columns[0])
							});
							picktaskList.setSublistValue({
								id: 'custpage_picktasklist_bin',
								line: i,
								value: results_picktask_search_array[i].getText(results_picktask_search.columns[1])
							});
							picktaskList.setSublistValue({
								id: 'custpage_picktasklist_available',
								line: i,
								value: results_picktask_search_array[i].getValue(results_picktask_search.columns[2])
							});
							var date = results_picktask_search_array[i].getValue(results_picktask_search.columns[3]);
							if (!date) date = 0;
							picktaskList.setSublistValue({
								id: 'custpage_picktasklist_date',
								line: i,
								value: date
							});
							picktaskList.setSublistValue({
								id: 'custpage_picktasklist_itemid',
								line: i,
								value: results_picktask_search_array[i].getText(results_picktask_search.columns[4])
							});
							picktaskList.setSublistValue({
								id: 'custpage_picktasklist_binid',
								line: i,
								value: results_picktask_search_array[i].getText(results_picktask_search.columns[5])
							});
							var countInterval = results_picktask_search_array[i].getValue(results_picktask_search.columns[6]);
							if (!countInterval) countInterval = 0;
							picktaskList.setSublistValue({
								id: 'custpage_picktasklist_interval',
								line: i,
								value: countInterval
							});
						}



						for (var i = 0; i < results_picktask_search_array.length; i++){
								strOutput += 'Item: ' + results_picktask_search_array[i].getValue(results_picktask_search.columns[0]) + ' Bin: ' +
								results_picktask_search_array[i].getText(results_picktask_search.columns[1]) +' Location avaible: ' +
								results_picktask_search_array[i].getValue(results_picktask_search.columns[2]) +'\n';
						}

						if (strOutput == ''){
							strOutput = 'NOTHING';
						}
					}
					catch (err){
						 log.error("Error in pick task low quantity", err);
					}
					form.updateDefaultValues({
						custpage_order_id: strOutput
					});

					///MOVEMENTS

					var movementsOutput = "";
					try{
						var movementsSearch = search.load({ id: 'customsearch5382'});
						var results_movements_search = movementsSearch.run();
						var results_movements_search_array = results_movements_search.getRange({
							start: 0,
							end: 100
						});

						log.debug("results_movements_search_array.length -->: ", results_movements_search_array.length);
						var itemName = "";
						var itemAvaible = "";
						for (var i = 0; i < results_movements_search_array.length; i++){

							var inventorySearch = search.load({ id: 'customsearch5388'});
							var inventoryFilters = inventorySearch.filters;
							itemName = results_movements_search_array[i].getText(results_movements_search.columns[2]);
							itemBin = results_movements_search_array[i].getValue(results_movements_search.columns[4]);
							inventoryFilters.push(search.createFilter({ name: 'name', operator: search.Operator.IS, values: itemName}));
							inventoryFilters.push(search.createFilter({ name: 'formulatext', operator: search.Operator.IS, values: itemBin, formula: "{binonhand.binnumber}"}));
							inventorySearch.filters = inventoryFilters;
							var results_inventory_search = inventorySearch.run();
							var results_inventory_search_array = results_inventory_search.getRange({ start: 0, end: 10});
							log.debug("results_inventory_search_array.length -->: ", results_inventory_search_array);
							if (results_inventory_search_array.length == 0){ itemAvaible = 0; }
							else{ itemAvaible = results_inventory_search_array[0].getValue(results_inventory_search.columns[3]);}
							log.debug("itemAvaible -->: ", itemAvaible);

							if (results_movements_search_array[i].getValue(results_movements_search.columns[3]) != itemAvaible){
								movementsOutput += 'DOC: ' + results_movements_search_array[i].getValue(results_movements_search.columns[0]) + ' DATE: ' +
								results_movements_search_array[i].getValue(results_movements_search.columns[1]) +' ITEM: ' +
								results_movements_search_array[i].getText(results_movements_search.columns[2]) +' SNAPSHOT: ' +
								results_movements_search_array[i].getValue(results_movements_search.columns[3]) +' AVAIBLE: ' +
								itemAvaible + '\n';
							}

						}
						for (var i = 0; i < results_movements_search_array.length; i++){

					}

						if (movementsOutput == ''){
							movementsOutput = 'NOTHING';
						}

					}
					catch (err){
						 log.error("Error in movements", err);
					}
					form.updateDefaultValues({
						custpage_movements_id: movementsOutput
					});

					var clientScriptInternalId = returnClientScriptInternalId();
					log.debug("clientScriptInternalId", clientScriptInternalId);

					form.addButton({
						id: 'custpage_print',
						label: 'Create Inventory Count',
						functionName: 'changeShippingMethod()'
					});
					form.addButton({
						id: 'custpage_',
						label: 'Add count interval',
						functionName: 'countInterval()'
					});
					form.clientScriptFileId = clientScriptInternalId;
					context.response.writePage(form);



			} catch (err) {
				log.error("Error in onRequest", err);
			}

		}



		//	The function returns the search result array
		function returnClientScriptInternalId() {

			try {
				log.debug("*******Triggered in returnClientScriptInternalId function********", '*******Triggered in returnClientScriptInternalId function********');
				var searchObject = search.create({
					type: 'folder',
					columns: [{
						name: 'internalid',
						join: 'file'
					}],
					filters: [{
						name: 'name',
						join: 'file',
						operator: 'haskeywords',
						values: ["PZ_change_shipping_func.js"]
					}]
				});

				var searchResults = searchObject.run().getRange({
					start: 0,
					end: 1
				});
				log.debug("searchResults", searchResults);
				var internalId = searchResults[0].getValue({
					name: 'internalid',
					join: 'file'
				});
				return internalId;

			} catch (err) {
				log.error("Error during returnClientScriptInternalId", err);
			}
		}

		//The function validates the value
		function validateValue(data) {
			try {
				if (data != '' && data != undefined && data != null) {
					return true;
				} else {
					return false;
				}
			} catch (err) {
				log.error("Error in validateValue", err);
			}
		}


		function getResults(searchObj) {
			try {
				var start = 0;
				var totalResults = new Array();
				do {
					if (searchObj != null && searchObj != '') {
						var results = searchObj.getRange({
							start: start,
							end: start + 1000
						});
						for (var i = 0; i < results.length; i++) {
							start++;
							totalResults[totalResults.length] = results[i];
						}

					}
				} while (results.length >= 1000);
				return totalResults;
			} catch (err) {
				log.error("Error in getResults", err);
			}
		}


		return {
			onRequest: onRequest
		};

	});
