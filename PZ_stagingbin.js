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
						title: 'Staging Bin'
					});

					var stagingList = form.addSublist({
						id: 'custpage_staginglist',
						type: serverWidget.SublistType.LIST,
						label: 'STAGING BIN'
					});
					stagingList.addField({
						id: 'custpage_staginglist_checkbox',
						type: serverWidget.FieldType.CHECKBOX,
						label: 'CHECKBOX'
					});
					stagingList.addField({
						id: 'custpage_staginglist_item',
						type: serverWidget.FieldType.TEXT,
						label: 'ITEM NAME'
					});
					stagingList.addField({
						id: 'custpage_staginglist_item_id',
						type: serverWidget.FieldType.TEXT,
						label: 'ID'
					});
					stagingList.addField({
						id: 'custpage_staginglist_available',
						type: serverWidget.FieldType.TEXT,
						label: 'AVAILABLE'
					});
					stagingList.addField({
						id: 'custpage_staginglist_bin',
						type: serverWidget.FieldType.TEXT,
						label: 'Last time picked'
					});
					stagingList.addField({
						id: 'custpage_staginglist_date',
						type: serverWidget.FieldType.TEXT,
						label: 'Date'
					});
					try{
						var stagingSearch = search.load({ id: 'customsearch5439'});
						var results_stagingSearch = stagingSearch.run();
						var results_stagingSearch_array = results_stagingSearch.getRange({
							start: 0,
							end: 100
						});

						//log.debug("results_stagingSearch -> ", results_stagingSearch);
						//log.debug("results_stagingSearch_array -> ", results_stagingSearch_array);
						log.debug("results_stagingSearch_array.lenght -> ", results_stagingSearch_array.length);


						stagingList.setSublistValue({
							id: 'custpage_staginglist_item',
							line: 0,
							value: results_stagingSearch_array[0].getValue(results_stagingSearch.columns[0])
						});
						stagingList.setSublistValue({
							id: 'custpage_staginglist_item_id',
							line: 0,
							value: results_stagingSearch_array[0].getValue(results_stagingSearch.columns[1])
						});
						stagingList.setSublistValue({
							id: 'custpage_staginglist_available',
							line: 0,
							value: results_stagingSearch_array[0].getValue(results_stagingSearch.columns[2])
						});
						stagingList.setSublistValue({
							id: 'custpage_staginglist_bin',
							line: 0,
							value: results_stagingSearch_array[0].getValue(results_stagingSearch.columns[3])
						});
						stagingList.setSublistValue({
							id: 'custpage_staginglist_date',
							line: 0,
							value: results_stagingSearch_array[0].getValue(results_stagingSearch.columns[4])
						});

						var j=1;
						for (var i=1;  i < results_stagingSearch_array.length; i++){
							if (results_stagingSearch_array[i].getValue(results_stagingSearch.columns[0]) ==
									results_stagingSearch_array[i-1].getValue(results_stagingSearch.columns[0])){
										continue;
							}
							else{
							stagingList.setSublistValue({
								id: 'custpage_staginglist_item',
								line: j,
								value: results_stagingSearch_array[i].getValue(results_stagingSearch.columns[0])
							});
							stagingList.setSublistValue({
								id: 'custpage_staginglist_item_id',
								line: j,
								value: results_stagingSearch_array[i].getValue(results_stagingSearch.columns[1])
							});
							stagingList.setSublistValue({
								id: 'custpage_staginglist_available',
								line: j,
								value: results_stagingSearch_array[i].getValue(results_stagingSearch.columns[2])
							});
							stagingList.setSublistValue({
								id: 'custpage_staginglist_bin',
								line: j,
								value: results_stagingSearch_array[i].getValue(results_stagingSearch.columns[3])
							});
							stagingList.setSublistValue({
								id: 'custpage_staginglist_date',
								line: j,
								value: results_stagingSearch_array[i].getValue(results_stagingSearch.columns[4])
							});
							j=j+1;
						}
						}

					}
					catch(err){
						log.error("error in loading staging list");
					}

					var clientScriptInternalId = returnClientScriptInternalId();
					log.debug("clientScriptInternalId", clientScriptInternalId);

					form.addButton({
						id: 'custpage_transfer',
						label: 'Transfer',
						functionName: 'transferStaging()'
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
						values: ["PZ_stagingbin_func.js"]
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
