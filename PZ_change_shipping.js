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
						title: 'Print Integrated Shipping Labels'
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
						label: 'Orders: '
					});
					orders.updateDisplayType({
						displayType: serverWidget.FieldDisplayType.INLINE
					});

					var strOutput = "";
					try{
						var mySearch = search.load({ id: 'customsearch5235'});
						var results_search = mySearch.run();
						var results_search_array = results_search.getRange({
							start: 0,
							end: 20
						});

						log.debug("results_search_array.length -->: ", results_search_array.length);

						//FEDEX HOME VAL = 3, USPS PRIORITY = 54

						for (var i = 0; i < results_search_array.length; i++){
								strOutput = 'Document Nr: ' + results_search_array[i].getValue(results_search.columns[0]) + ' iternal Id: ' +
								results_search_array[i].getValue(results_search.columns[1]) +' Item: ' +
								results_search_array[i].getText(results_search.columns[2]) +' Ship Via(Text): ' +
								results_search_array[i].getText(results_search.columns[3]) +' Ship Via(Value): ' +
								results_search_array[i].getValue(results_search.columns[3]) +'\n';
						}

						if (strOutput == ''){
							strOutput = 'NOTHING';
						}
					}
					catch (err){
						 log.error("Error in USPS REAR BUMBER SEARCH", err);
					}

					form.updateDefaultValues({
						custpage_order_id: strOutput
					});

					var clientScriptInternalId = returnClientScriptInternalId();
					log.debug("clientScriptInternalId", clientScriptInternalId);

					form.addButton({
						id: 'custpage_print',
						label: 'Change shipping',
						functionName: 'changeShippingMethod()'
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
