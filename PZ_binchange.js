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
						title: 'Change Bin'
					});

					var binList = form.addSublist({
						id: 'custpage_binlist',
						type: serverWidget.SublistType.LIST,
						label: 'STAGING BIN'
					});
					binList.addField({
						id: 'custpage_binlist_checkbox',
						type: serverWidget.FieldType.CHECKBOX,
						label: 'CHECKBOX'
					});
					binList.addField({
						id: 'custpage_binlist_bin',
						type: serverWidget.FieldType.TEXT,
						label: 'BIN NAME'
					});
					binList.addField({
						id: 'custpage_binlist_id',
						type: serverWidget.FieldType.TEXT,
						label: 'ID'
					});
					binList.addField({
						id: 'custpage_binlist_zone',
						type: serverWidget.FieldType.TEXT,
						label: 'ZONE'
					});

					binList.addField({
						id: 'custpage_binlist_newzone',
						type: serverWidget.FieldType.TEXT,
						label: 'NEW ZONE'
					});

					try{
						var binSearch = search.load({ id: 'customsearch6588'});
						var results_binSearch = binSearch.run();
						var results_binSearch_array = results_binSearch.getRange({
							start: 0,
							end: 100
						});

						//log.debug("results_binSearch -> ", results_binSearch);
						//log.debug("results_binSearch_array -> ", results_binSearch_array);
						log.debug("results_binSearch_array.lenght -> ", results_binSearch_array.length);

						var j=1;
						for (var i=0;  i < results_binSearch_array.length; i++){


							binList.setSublistValue({
								id: 'custpage_binlist_bin',
								line: i,
								value: results_binSearch_array[i].getValue(results_binSearch.columns[0])
							});
							binList.setSublistValue({
								id: 'custpage_binlist_id',
								line: i,
								value: results_binSearch_array[i].getText(results_binSearch.columns[1])
							});
							binList.setSublistValue({
								id: 'custpage_binlist_zone',
								line: i,
								value: results_binSearch_array[i].getText(results_binSearch.columns[2])
							});

							binList.setSublistValue({
								id: 'custpage_binlist_newzone',
								line: i,
								value: results_binSearch_array[i].getValue(results_binSearch.columns[0]).substring(0,5)
							});


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
						values: ["PZ_binchange_func.js"]
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
