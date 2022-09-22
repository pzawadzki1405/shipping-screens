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

					var itemName = context.request.parameters.itemName;
					var form = serverWidget.createForm({
						title: 'RMA'
					});


					form.addField({
						id: 'custpage_itemname_filter',
						type: serverWidget.FieldType.TEXT,
						label: 'ITEM NAME'
					});
					form.updateDefaultValues({
						custpage_itemname_filter: itemName
					});
					var rmaList = form.addSublist({
						id: 'custpage_rmalist',
						type: serverWidget.SublistType.LIST,
						label: 'RMA'
					});
					rmaList.addField({
						id: 'custpage_rmalist_checkbox',
						type: serverWidget.FieldType.CHECKBOX,
						label: 'CHECKBOX'
					});
					rmaList.addField({
						id: 'custpage_rmalist_item',
						type: serverWidget.FieldType.TEXT,
						label: 'ITEM NAME'
					});
					rmaList.addField({
						id: 'custpage_rmalist_item_id',
						type: serverWidget.FieldType.TEXT,
						label: 'ID'
					}).updateDisplayType({
						displayType: serverWidget.FieldDisplayType.HIDDEN
					});
					rmaList.addField({
						id: 'custpage_rmalist_item_display',
						type: serverWidget.FieldType.TEXT,
						label: 'Display name'
					});
					rmaList.addField({
						id: 'custpage_rmalist_available',
						type: serverWidget.FieldType.TEXT,
						label: 'AVAILABLE'
					});
					rmaList.addField({
						id: 'custpage_rmalist_date',
						type: serverWidget.FieldType.TEXT,
						label: 'Last time received'
					});
					rmaList.addField({
						id: 'custpage_rmalist_print',
						type: serverWidget.FieldType.TEXT,
						label: 'Print'
					});
					try{
						var rmaSearch = search.load({ id: 'customsearch5453'});
						if (itemName){
							var rmafilters = rmaSearch.filters;
							rmafilters.push(search.createFilter({name: 'name', operator: search.Operator.CONTAINS, values: itemName }));
							rmaSearch.filters = rmafilters;
						}
						var results_rmaSearch = rmaSearch.run();
						var results_rmaSearch_array = results_rmaSearch.getRange({
							start: 0,
							end: 100
						});

						//log.debug("results_stagingSearch -> ", results_stagingSearch);
						//log.debug("results_stagingSearch_array -> ", results_stagingSearch_array);
						log.debug("results_stagingSearch_array.lenght -> ", results_rmaSearch_array.length);

					for (var i=0;  i < results_rmaSearch_array.length; i++){
						rmaList.setSublistValue({
							id: 'custpage_rmalist_item',
							line: i,
							value: results_rmaSearch_array[i].getValue(results_rmaSearch.columns[0])
						});
						rmaList.setSublistValue({
							id: 'custpage_rmalist_item_id',
							line: i,
							value: results_rmaSearch_array[i].getValue(results_rmaSearch.columns[1])
						});
						rmaList.setSublistValue({
							id: 'custpage_rmalist_item_display',
							line: i,
							value: results_rmaSearch_array[i].getValue(results_rmaSearch.columns[2])
						});
						rmaList.setSublistValue({
							id: 'custpage_rmalist_available',
							line: i,
							value: results_rmaSearch_array[i].getValue(results_rmaSearch.columns[3])
						});
						rmaList.setSublistValue({
							id: 'custpage_rmalist_date',
							line: i,
							value: results_rmaSearch_array[i].getValue(results_rmaSearch.columns[4])
						});
						rmaList.setSublistValue({
							id: 'custpage_rmalist_print',
							line: i,
							value: '<a href="https://6241176.app.netsuite.com/app/site/hosting/scriptlet.nl?script=726&deploy=1&compid=6241176&item_id='+
							results_rmaSearch_array[i].getValue(results_rmaSearch.columns[1])+
							'&item_type=InvtPart" target="_blank">Print Label</a>'
						});
					}


					}
					catch(err){
						log.error("error in loading RMA list");
					}

					var clientScriptInternalId = returnClientScriptInternalId();
					log.debug("clientScriptInternalId", clientScriptInternalId);

					form.addButton({
						id: 'custpage_transfer',
						label: 'Remove from RMA',
						functionName: 'removeRMA()'
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
						values: ["PZ_RMA_func.js"]
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
