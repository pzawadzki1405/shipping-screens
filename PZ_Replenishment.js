/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

var best_seller_search_id = 'customsearch4887';
var bin_search_id = 'customsearch5128';
var bin_crossbar_class = [20, 25];
var bin_crossbar_defaults = [30, 150, 150, 1];
var bin_mats_class = [17, 18, 19];
var bin_mats_defaults = [10, 100, 100, 1];

define(['N/ui/serverWidget', 'N/search', 'N/https', 'N/ui/message', 'N/record', 'N/runtime'],

	function(serverWidget, search, https, message, record, runtime) {



		function onRequest(context) {
			try {
				var title = " onRequest ";

					var itemName = context.request.parameters.itemName;
					var typeVal = context.request.parameters.typeVal;
					var itemType = context.request.parameters.itemType;
					var binDone = context.request.parameters.binDone;
					var bestPreffered = context.request.parameters.bestPreffered;
					var bestSold = context.request.parameters.bestSold;

					var form = serverWidget.createForm({
						title: 'Replenishments'
					});


					var typeFieldObj = form.addField({
						id: 'custpage_type',
						type: serverWidget.FieldType.SELECT,
						label: 'Type'
					});
					typeFieldObj.addSelectOption({
						value: '',
						text: ''
					});
					typeFieldObj.addSelectOption({
						value: 'best_seller',
						text: 'best_seller'
					});
					typeFieldObj.addSelectOption({
						value: 'bins',
						text: 'bins'
					});
					typeFieldObj.addSelectOption({
						value: 'replenishments',
						text: 'replenishments'
					});
					if (typeVal){
						form.updateDefaultValues({
							custpage_type: typeVal
						});
						switch(typeVal){
							case 'best_seller':
							form = best_sellerForm(form, bestPreffered, bestSold);
							break;
							case 'bins':
							form = binsForm(form, itemName, itemType, binDone);
							break;
							case 'replenishments':
							form = replenishmentForm(form);
							break;
							default:
							//error message
							break;

						}
					}
					var clientScriptInternalId = returnClientScriptInternalId();
					log.debug("clientScriptInternalId", clientScriptInternalId);

					form.addButton({
						id: 'custpage_submit',
						label: 'Submit',
						functionName: 'submit_button()'
					});
					form.addButton({
						id: 'custpage_transfer',
						label: 'Reset',
						functionName: 'resetPage()'
					});

					form.clientScriptFileId = clientScriptInternalId;
					context.response.writePage(form);



			} catch (err) {
				log.error("Error in onRequest", err);
			}

		}

		function best_sellerForm(form, bestPreffered, bestSold){
			form.addField({
				id: 'custpage_best_preffered',
				type: serverWidget.FieldType.CHECKBOX,
				label: 'PREFFERED BIN'
			});
			form.addField({
				id: 'custpage_best_bin',
				type: serverWidget.FieldType.TEXT,
				label: 'BIN NAME'
			});
			form.addField({
				id: 'custpage_best_sold',
				type: serverWidget.FieldType.TEXT,
				label: 'MIN SOLD IN 1 MONTH'
			});
			var bestsellerList = form.addSublist({
				id: 'custpage_bestlist',
				type: serverWidget.SublistType.LIST,
				label: 'Best sellers'
			});
			bestsellerList.addField({
				id: 'custpage_bestlist_checkbox',
				type: serverWidget.FieldType.CHECKBOX,
				label: 'CHECKBOX'
			});
			bestsellerList.addField({
				id: 'custpage_bestlist_item',
				type: serverWidget.FieldType.TEXT,
				label: 'ITEM'
			});
			bestsellerList.addField({
				id: 'custpage_bestlist_item_id',
				type: serverWidget.FieldType.TEXT,
				label: 'ITEM ID'
			}).updateDisplayType({
				displayType: serverWidget.FieldDisplayType.HIDDEN
			});
			bestsellerList.addField({
				id: 'custpage_bestlist_display',
				type: serverWidget.FieldType.TEXT,
				label: 'DISPLAY NAME'
			});
			bestsellerList.addField({
				id: 'custpage_bestlist_picked',
				type: serverWidget.FieldType.TEXT,
				label: 'PICKED'
			});
			bestsellerList.addField({
				id: 'custpage_bestlist_recomended',
				type: serverWidget.FieldType.TEXT,
				label: 'RECOMENDED BIN'
			});
			try{
			var best_sellerSearch = search.load({ id: 'customsearch4887'});
			var bestfilters = best_sellerSearch.filters;

			if (bestPreffered == 'true'){
				bestPreffered = 'T';
				bestfilters.push(search.createFilter({name: 'preferredbin', join: 'item', operator: search.Operator.IS, values: 'T' }));
				form.updateDefaultValues({
					custpage_best_preffered: bestPreffered
				});
			}
			else{
				bestPreffered = 'F';
				bestfilters.push(search.createFilter({name: 'preferredbin', join: 'item', operator: search.Operator.IS, values: 'F' }));
				form.updateDefaultValues({
					custpage_best_preffered: bestPreffered
				});
			}
			if (bestSold){
				form.updateDefaultValues({
					custpage_best_sold: bestSold
				});
				bestfilters.push(search.createFilter({name: 'lineitempickedquantity', operator: search.Operator.GREATERTHAN, values: bestSold, summary: search.Summary.SUM }));
			}
			else{
				bestfilters.push(search.createFilter({name: 'lineitempickedquantity', operator: search.Operator.GREATERTHAN, values: 20, summary: search.Summary.SUM }));
			}

			//
			best_sellerSearch.filters = bestfilters;

			log.debug("best filters ", best_sellerSearch.filterExpression);

			var results_best_sellerSearch = best_sellerSearch.run();
			var results_best_sellerSearch_array = results_best_sellerSearch.getRange({
				start: 0,
				end: 20
			});

			log.debug("results_best_sellerSearch_array -> ", results_best_sellerSearch_array);

			log.debug("results_stagingSearch_array.lenght -> ", results_best_sellerSearch_array.length);
			for (var i=0;  i < results_best_sellerSearch_array.length; i++){
				bestsellerList.setSublistValue({
					id: 'custpage_bestlist_item',
					line: i,
					value: results_best_sellerSearch_array[i].getText(results_best_sellerSearch.columns[0])
				});
				bestsellerList.setSublistValue({
					id: 'custpage_bestlist_item_id',
					line: i,
					value: results_best_sellerSearch_array[i].getValue(results_best_sellerSearch.columns[0])
				});
				bestsellerList.setSublistValue({
					id: 'custpage_bestlist_display',
					line: i,
					value: results_best_sellerSearch_array[i].getValue(results_best_sellerSearch.columns[1])
				});
				bestsellerList.setSublistValue({
					id: 'custpage_bestlist_picked',
					line: i,
					value: results_best_sellerSearch_array[i].getValue(results_best_sellerSearch.columns[3])
				});
				var recomended = results_best_sellerSearch_array[i].getValue(results_best_sellerSearch.columns[4]);
				if (!recomended){
					recomended = '01-01-A'
				}
				bestsellerList.setSublistValue({
					id: 'custpage_bestlist_recomended',
					line: i,
					value: recomended
				});
			}

			}
			catch(e){
				log.error("error in loading best seller list", e);
			}
			return form;
		}

		function binsForm(form, itemName, itemTypeVal, binDone){
			// form.addField({
			// 	id: 'custpage_label',
			// 	type: serverWidget.FieldType.LABEL,
			// 	label: 'this is bins'
			// });
			form.addField({
				id: 'custpage_bin_done',
				type: serverWidget.FieldType.CHECKBOX,
				label: 'ONLY NOT DONE'
			});
			form.addField({
				id: 'custpage_bin_item',
				type: serverWidget.FieldType.TEXT,
				label: 'item name'
			});
			//var itemName = context.request.parameters.itemName;

			if (itemName){
				form.updateDefaultValues({
					custpage_bin_item: itemName
				});
			}

			var itemType = form.addField({
				id: 'custpage_bin_type',
				type: serverWidget.FieldType.SELECT,
				label: 'Type',
				//source: 'class'
			});

			itemType.addSelectOption({
				value: '',
				text: ''
			});
			itemType.addSelectOption({
				value: 'crossbars',
				text: 'crossbars'
			});
			itemType.addSelectOption({
				value: 'mats',
				text: 'floor mat'
			});

			form.addField({
				id: 'custpage_bin_min',
				type: serverWidget.FieldType.TEXT,
				label: 'BIN MINIMUM'
			});

			form.addField({
				id: 'custpage_bin_max',
				type: serverWidget.FieldType.TEXT,
				label: 'BIN MAXIMUM'
			});

			form.addField({
				id: 'custpage_bin_replen',
				type: serverWidget.FieldType.TEXT,
				label: 'BIN REPLEN'
			});

			form.addField({
				id: 'custpage_bin_round',
				type: serverWidget.FieldType.TEXT,
				label: 'BIN ROUND'
			});

			var binsList = form.addSublist({
				id: 'custpage_binslist',
				type: serverWidget.SublistType.LIST,
				label: 'BIN LIST'
			});
			binsList.addField({
				id: 'custpage_binslist_checkbox',
				type: serverWidget.FieldType.CHECKBOX,
				label: 'CHECKBOX'
			});
			binsList.addField({
				id: 'custpage_binslist_item',
				type: serverWidget.FieldType.TEXT,
				label: 'ITEM'
			});
			binsList.addField({
				id: 'custpage_binslist_bin',
				type: serverWidget.FieldType.TEXT,
				label: 'BIN'
			});
			binsList.addField({
				id: 'custpage_binslist_bin_id',
				type: serverWidget.FieldType.TEXT,
				label: 'BIN ID'
			}).updateDisplayType({
				displayType: serverWidget.FieldDisplayType.HIDDEN
			});
			binsList.addField({
				id: 'custpage_binslist_min',
				type: serverWidget.FieldType.TEXT,
				label: 'MIN'
			});
			binsList.addField({
				id: 'custpage_binslist_max',
				type: serverWidget.FieldType.TEXT,
				label: 'MAX'
			});
			binsList.addField({
				id: 'custpage_binslist_replen',
				type: serverWidget.FieldType.TEXT,
				label: 'RPLN'
			});
			binsList.addField({
				id: 'custpage_binslist_round',
				type: serverWidget.FieldType.TEXT,
				label: 'ROUND'
			});
			try{
			log.debug("item type ", itemTypeVal);
			var binSearch = search.load({ id: 'customsearch5128'});

		  var binfilters = binSearch.filters;
			log.debug("binDone", binDone);

			if (itemName){
				binfilters.push(search.createFilter({name: 'name', operator: search.Operator.CONTAINS, values: itemName }));
			}
			if (itemTypeVal){
				form.updateDefaultValues({
					custpage_bin_type: itemTypeVal
				});
				switch(itemTypeVal){
					case 'crossbars':
					form.updateDefaultValues({
						custpage_bin_min: bin_crossbar_defaults[0],
						custpage_bin_max: bin_crossbar_defaults[1],
						custpage_bin_replen: bin_crossbar_defaults[2],
						custpage_bin_round: bin_crossbar_defaults[3]
					});
					binfilters.push(search.createFilter({name: 'class', operator: search.Operator.ANYOF, values: bin_crossbar_class }));
					break;

					case 'mats':
					form.updateDefaultValues({
						custpage_bin_min: bin_mats_defaults[0],
						custpage_bin_max: bin_mats_defaults[1],
						custpage_bin_replen: bin_mats_defaults[2],
						custpage_bin_round: bin_mats_defaults[3]
					});
					binfilters.push(search.createFilter({name: 'class', operator: search.Operator.ANYOF, values: bin_mats_class }));
					break;

					default:
					break;
				}
			}
			binSearch.filters = binfilters;
			if (binDone){
				switch(binDone){
					case 'true':
					binDone = 'T';
					var binfiler1 = search.createFilter({name: 'custrecord_wmsse_replen_maxqty', join: 'binnumber', operator: search.Operator.ISEMPTY });
					var binfiler2 = search.createFilter({name: 'custrecord_wmsse_replen_minqty', join: 'binnumber', operator: search.Operator.ISEMPTY });
					var binfiler3 = search.createFilter({name: 'custrecord_wmsse_replen_qty', join: 'binnumber', operator: search.Operator.ISEMPTY });
					var binfiler4 = search.createFilter({name: 'custrecord_wmsse_replen_roundqty', join: 'binnumber', operator: search.Operator.ISEMPTY });
					var binFilterExpression = binSearch.filterExpression;
					if (binFilterExpression.length > 0) {    binFilterExpression.push('AND');  }
					binFilterExpression.push([["binnumber.custrecord_wmsse_replen_maxqty","isempty",""], "OR",
					 													["binnumber.custrecord_wmsse_replen_minqty","isempty",""], "OR",
																		["binnumber.custrecord_wmsse_replen_qty","isempty",""], "OR",
																		["binnumber.custrecord_wmsse_replen_roundqty","isempty",""]]);
					binSearch.filterExpression = binFilterExpression;
					//binfilters.push(binfiler1);
					break;

					case 'false':
					binDone = 'F';
					break;

					default:
					break;
				}
				form.updateDefaultValues({
					custpage_bin_done: binDone
				});

			}
			//var binFilterExpression = binSearch.filterExpression;
			log.debug("bin filters ", binSearch.filterExpression);


			var results_binSearch = binSearch.run();
			var results_binSearch_array = results_binSearch.getRange({
				start: 0,
				end: 20
			});

			log.debug("results_binSearch_array", results_binSearch_array);
			log.debug("results_binSearch_array length", results_binSearch_array.length);


			for (var i=0;  i < results_binSearch_array.length; i++){
				binsList.setSublistValue({
					id: 'custpage_binslist_item',
					line: i,
					value: results_binSearch_array[i].getValue(results_binSearch.columns[0])
				});
				//log.debug("wartosc1 ", results_binSearch_array[i].getValue(results_binSearch.columns[0]));
				binsList.setSublistValue({
					id: 'custpage_binslist_bin',
					line: i,
					value: results_binSearch_array[i].getValue(results_binSearch.columns[1])
				});
				binsList.setSublistValue({
					id: 'custpage_binslist_bin_id',
					line: i,
					value: results_binSearch_array[i].getValue(results_binSearch.columns[2])
				});
				var bin_min = results_binSearch_array[i].getValue(results_binSearch.columns[3]);
				if (!bin_min) bin_min = 0;
				var bin_max = results_binSearch_array[i].getValue(results_binSearch.columns[4]);
				if (!bin_max) bin_max = 0;
				var bin_rpln = results_binSearch_array[i].getValue(results_binSearch.columns[5]);
				if (!bin_rpln) bin_rpln = 0;
				var bin_round = results_binSearch_array[i].getValue(results_binSearch.columns[6]);
				if (!bin_round) bin_round = 0;
				binsList.setSublistValue({
					id: 'custpage_binslist_min',
					line: i,
					value: bin_min
				});
				binsList.setSublistValue({
					id: 'custpage_binslist_max',
					line: i,
					value: bin_max
				});
				binsList.setSublistValue({
					id: 'custpage_binslist_replen',
					line: i,
					value: bin_rpln
				});
				binsList.setSublistValue({
					id: 'custpage_binslist_round',
					line: i,
					value: bin_round
				});
				//log.debug("wartosc2 ", results_binSearch_array[i].getValue(results_binSearch.columns[0]));
				}
			}
			catch (e){
				log.error("error in bin list ", e);
			}

			return form;
		}

		function replenishmentForm(form){
			form.addField({
				id: 'custpage_label',
				type: serverWidget.FieldType.LABEL,
				label: 'this is replenishments'
			});
			return form;
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
						values: ["PZ_Replenishment_func.js"]
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
