/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget', 'N/search', 'N/https', 'N/ui/message', 'N/record', 'N/runtime'],

	function(serverWidget, search, https, message, record, runtime) {

		var SHIPPING_METHOD_URL = {
			"fedex": "https://6241176.app.netsuite.com/app/accounting/print/hotprint.nl?regular=T&sethotprinter=T&id=SOINTERNALID&label=UPS%20Shipping%20Labels&printtype=fedexshippinglabel&trantype=itemship&auxtrans=IFINTERNALID",
			"usps": "https://6241176.app.netsuite.com/app/accounting/print/hotprint.nl?regular=T&sethotprinter=T&id=SOINTERNALID&label=UPS%20Shipping%20Labels&printtype=uspsshippinglabel&trantype=itemship&auxtrans=IFINTERNALID"
		}

		function onRequest(context) {
			try {
				var title = " onRequest ";
				if (context.request.method === 'GET') {

					var itemName = context.request.parameters.itemName;
					var carrierVal = context.request.parameters.carrierVal;
					var locationVal = context.request.parameters.locationVal;
					var allowRepeating = context.request.parameters.allowRepeating;
					var selectOrderNo = context.request.parameters.selectOrderNo;
					var waveNumber = context.request.parameters.waveNumber;

					//********Added for test - Przemyslaw Zawadzki******////
					var userName = runtime.getCurrentUser().name;
					var userID = runtime.getCurrentUser().id;
					log.debug("userName -->: ", userName);
					log.debug("userID -->: ", userID);
                    var strOutput = '';
					try{

						var mySearch = search.load({ id: 'customsearchpz_pack_performance_2_4'});
						var results_search = mySearch.run();
						var results_search_array = results_search.getRange({
    					start: 0,
    					end: 20
						});

						log.debug("results_search_array.length -->: ", results_search_array.length);

						//column [0] is timeout, column [1] is username, column [2] orders, column [3] items
						for (var i = 0; i < results_search_array.length; i++){
								if (((results_search_array[i].getValue(results_search.columns[1]))) == userID)
  							strOutput = results_search_array[i].getText(results_search.columns[1]) + ' Orders shipped: ' +
								results_search_array[i].getValue(results_search.columns[2]) +' Items shipped: ' +
							  results_search_array[i].getValue(results_search.columns[3]);
                        }

						if (strOutput == ''){
							strOutput = userName + ' Orders shipped: 0 Items shipped: 0';
   						}
                    }
						catch (err){
 						 log.error("Error in run performance", err);
 					 }
					 //********Added for test - Przemyslaw Zawadzki******////


					if (allowRepeating == true || allowRepeating == 'true') {
						allowRepeating = 'T';
					} else {
						allowRepeating = 'F';
					}
					var form = serverWidget.createForm({
						title: 'Print Integrated Shipping Labels'
					});

					//********Added for test - Przemyslaw Zawadzki******////
					form.addField({
						id: 'custpage_username',
						type: serverWidget.FieldType.LABEL,
						label: 'Performance: ' + strOutput
					});
					//********Added for test - Przemyslaw Zawadzki******////
					form.addField({
						id: 'custpage_item_barcode',
						type: serverWidget.FieldType.TEXT,
						label: 'ITEM NAME/UPC CODE'
					});
					var carrierFieldObj = form.addField({
						id: 'custpage_carrier',
						type: serverWidget.FieldType.SELECT,
						label: 'CARRIER'
					});
					form.addField({
						id: 'custpage_location',
						type: serverWidget.FieldType.SELECT,
						label: 'LOCATION',
						source: 'location'
					});
					form.addField({
						id: 'custpage_allow_repeating',
						type: serverWidget.FieldType.CHECKBOX,
						label: 'ALLOW REPEATING'
					});
					form.addField({
						id: 'custpage_select_order_num',
						type: serverWidget.FieldType.TEXT,
						label: 'SELECT ORDER NUMBER'
					});
					form.addField({
						id: 'custpage_wave_number',
						type: serverWidget.FieldType.SELECT,
						label: 'WAVE NUMBER*',
						source: 'wave'
					});
					var completionPrecFld = form.addField({
						id: 'custpage_completion_perc',
						type: serverWidget.FieldType.PERCENT,
						label: 'WAVE COMPLETION (%)'
					});
					completionPrecFld.updateDisplayType({
						displayType: serverWidget.FieldDisplayType.DISABLED
					});
					var hasGT1QtyFld = form.addField({
						id: 'custpage_has_greater_than_1_qty',
						type: serverWidget.FieldType.CHECKBOX,
						label: 'Has Greater Than 1 Quantity'
					}).updateDisplayType({
						displayType: serverWidget.FieldDisplayType.HIDDEN
					});
					form.addField({
						id: 'custpage_last_selected_line_index',
						type: serverWidget.FieldType.TEXT,
						label: 'LAST SELECTED LINE INDEX'
					}).updateDisplayType({
						displayType: serverWidget.FieldDisplayType.HIDDEN
					});

					carrierFieldObj.addSelectOption({
						value: '0',
						text: ''
					});
					carrierFieldObj.addSelectOption({
						value: 'nonups',
						text: 'FedEx/USPS/More'
					});
					carrierFieldObj.addSelectOption({
						value: 'ups',
						text: 'UPS'
					});

					var sublist = form.addSublist({
						id: 'custpage_print_label',
						type: serverWidget.SublistType.LIST,
						label: 'OPEN FULFILLMENT'
					});
					var printFieldObj = sublist.addField({
						id: 'custpage_print_fulfillment',
						type: serverWidget.FieldType.CHECKBOX,
						label: 'PRINT'
					});

					if (allowRepeating == 'F') {
						sublist.addField({
							id: 'custpage_scan_item_barcode',
							type: serverWidget.FieldType.TEXT,
							label: 'ITEM NAME/UPC CODE'
						}).updateDisplayType({
							displayType: serverWidget.FieldDisplayType.ENTRY
						});
					}
					sublist.addField({
						id: 'custpage_link',
						type: serverWidget.FieldType.TEXT,
						label: 'LINK'
					}).updateDisplayType({
						displayType: serverWidget.FieldDisplayType.HIDDEN
					});
					if (allowRepeating == 'F') {
						sublist.addField({
							id: 'custpage_item_code',
							type: serverWidget.FieldType.TEXT,
							label: 'ITEM NAME'
						});
						sublist.addField({
							id: 'custpage_item_code_hidden',
							type: serverWidget.FieldType.TEXT,
							label: 'ITEM NAME'
						}).updateDisplayType({
							displayType: serverWidget.FieldDisplayType.HIDDEN
						});
						sublist.addField({
							id: 'custpage_item_quantity',
							type: serverWidget.FieldType.INTEGER,
							label: 'ITEM QUANTITY'
						});
						sublist.addField({
							id: 'custpage_item_fullfilment_hiden',
							type: serverWidget.FieldType.TEXT,
							label: 'ITEM FULFILLMENT ID'
						}).updateDisplayType({
							displayType: serverWidget.FieldDisplayType.HIDDEN
						});
						sublist.addField({
							id: 'custpage_upc_code',
							type: serverWidget.FieldType.TEXT,
							label: 'UPC CODE'
						});
						sublist.addField({
							id: 'custpage_upc_code_hidden',
							type: serverWidget.FieldType.TEXT,
							label: 'UPC CODE'
						}).updateDisplayType({
							displayType: serverWidget.FieldDisplayType.HIDDEN
						});
					}

					sublist.addField({
						id: 'custpage_order_no',
						type: serverWidget.FieldType.TEXT,
						label: 'ORDER NO.'
					});
					sublist.addField({
						id: 'custpage_order_date',
						type: serverWidget.FieldType.TEXT,
						label: 'ORDER DATE'
					});
					sublist.addField({
						id: 'custpage_ship_date',
						type: serverWidget.FieldType.TEXT,
						label: 'SHIP VIA'
					});
					sublist.addField({
						id: 'custpage_customer',
						type: serverWidget.FieldType.TEXT,
						label: 'CUSTOMER'
					});

					if (allowRepeating == 'F') {
						sublist.addField({
							id: 'custpage_item_length',
							type: serverWidget.FieldType.TEXT,
							label: 'ITEM LENGTH (Inch)'
						});
						sublist.addField({
							id: 'custpage_item_width',
							type: serverWidget.FieldType.TEXT,
							label: 'ITEM WIDTH (Inch)'
						});
						sublist.addField({
							id: 'custpage_item_height',
							type: serverWidget.FieldType.TEXT,
							label: 'ITEM HEIGHT (Inch)'
						});
						sublist.addField({
							id: 'custpage_item_weight',
							type: serverWidget.FieldType.TEXT,
							label: 'ITEM WEIGHT'
						});
					}
					if (validateValue(itemName)) {
						form.updateDefaultValues({
							custpage_item_barcode: itemName
						})
					} else {
						completionPrecFld.updateDisplayType({
							displayType: serverWidget.FieldDisplayType.HIDDEN
						});
					}
					if (validateValue(carrierVal)) {
						form.updateDefaultValues({
							custpage_carrier: carrierVal
						})
					};
					if (validateValue(locationVal)) {
						form.updateDefaultValues({
							custpage_location: locationVal
						})
					};
					if (validateValue(allowRepeating)) {
						form.updateDefaultValues({
							custpage_allow_repeating: allowRepeating
						})
					};
					if (validateValue(selectOrderNo)) {
						form.updateDefaultValues({
							custpage_select_order_num: selectOrderNo
						})
					};
					if (validateValue(waveNumber)) {
						form.updateDefaultValues({
							custpage_wave_number: waveNumber
						});
					} else {
						completionPrecFld.updateDisplayType({
							displayType: serverWidget.FieldDisplayType.HIDDEN
						});
					}

					var messageVal = '';
					var itemFullfillmentIdArray = [];
					var uniqueItemFulfillId = [];

					if (itemName) {
						var itemInternalId = getItemId(itemName);
						if (!itemInternalId)
							var itemInternalId = searchItemNameAlias(itemName);

						if (itemInternalId != '' && itemInternalId != undefined && itemInternalId != null) {
							var integratedShippingItem = getAllIntegratedShippingItem();
							var ifSearchObj = getItemFulfillment(itemInternalId, carrierVal, locationVal, allowRepeating, selectOrderNo, integratedShippingItem, waveNumber, form);
							log.audit("ifSearchObj", ifSearchObj);

							if (ifSearchObj.length > 0) {
								if (allowRepeating == 'F') {

									var ifInternalIdValue = ifSearchObj[0].getValue({
										name: "internalid",
										sort: search.Sort.ASC,
										summary: "GROUP",
										label: "Internal ID"
									});

									for (var r = 0; r < ifSearchObj.length; r++) {
										var ifInternalIdValue = ifSearchObj[r].getValue({
											name: "internalid",
											sort: search.Sort.ASC,
											summary: "GROUP",
											label: "Internal ID"
										});
										if (uniqueItemFulfillId.indexOf(ifInternalIdValue) == -1) {
											uniqueItemFulfillId.push(ifInternalIdValue);
										}
									}

								}
								if (allowRepeating == 'T') {
									var ifInternalIdValue = ifSearchObj[0].getValue({
										name: "internalid",
										sort: search.Sort.ASC,
										label: "Internal ID"
									});
								}

								log.debug("uniqueItemFulfillId", uniqueItemFulfillId);

								if (uniqueItemFulfillId.length == 1 && allowRepeating == 'F') {
									printFieldObj.updateDisplayType({
										displayType: serverWidget.FieldDisplayType.HIDDEN
									});
								}

								if (validateValue(ifInternalIdValue)) {
									for (var r = 0; r < ifSearchObj.length; r++) {
										if (allowRepeating == 'T') {

											var ifIdVal = ifSearchObj[r].getValue({
												name: "internalid",
												sort: search.Sort.ASC,
												label: "Internal ID"
											});

											var lineId = ifSearchObj[r].getValue({
												name: "line",
												summary: "GROUP",
												label: "Line ID"
											});

											log.debug('lineId', lineId)

											var orderNo = ifSearchObj[r].getValue({
												name: "tranid",
												join: "createdFrom",
												label: "Document Number"
											});
											var ShipDate = ifSearchObj[r].getValue({
												name: "futureshipdate",
												label: "Future Ship Date"
											});
											var CustomerName = ifSearchObj[r].getText({
												name: "entity",
												label: "Name"
											});
											var createdFromSoId = ifSearchObj[r].getValue({
												name: "internalid",
												join: "createdFrom",
												label: "Internal ID"
											});
											var shipMethodVal = ifSearchObj[r].getText({
												name: "shipmethod",
												label: "Ship Via"
											});
											var orderDate = ifSearchObj[r].getValue({
												name: "trandate",
												join: "createdFrom",
												label: "Date"
											});
											var itemNameVal = ifSearchObj[r].getValue({
												name: "itemid",
												join: "item",
												label: "Name"
											});
										}

										if (allowRepeating == 'F') {
											var lineId = ifSearchObj[r].getValue({
												name: "line",
												summary: "GROUP",
												label: "Line ID"
											});
											log.debug('lineId', lineId)
											var ifIdVal = ifSearchObj[r].getValue({
												name: "internalid",
												sort: search.Sort.ASC,
												summary: "GROUP",
												label: "Internal ID"
											});
											var orderNo = ifSearchObj[r].getValue({
												name: "tranid",
												join: "createdFrom",
												summary: "GROUP",
												label: "Document Number"
											});
											var ShipDate = ifSearchObj[r].getValue({
												name: "futureshipdate",
												summary: "GROUP",
												label: "Future Ship Date"
											});
											var CustomerName = ifSearchObj[r].getText({
												name: "entity",
												summary: "GROUP",
												label: "Name"
											});
											var createdFromSoId = ifSearchObj[r].getValue({
												name: "internalid",
												join: "createdFrom",
												summary: "GROUP",
												label: "Internal ID"
											});
											var shipMethodVal = ifSearchObj[r].getText({
												name: "shipmethod",
												summary: "GROUP",
												label: "Ship Via"
											});
											var orderDate = ifSearchObj[r].getValue({
												name: "trandate",
												join: "createdFrom",
												summary: "GROUP",
												label: "Date"
											});
											var itemNameVal = ifSearchObj[r].getValue({
												name: "itemid",
												join: "item",
												summary: "GROUP",
												label: "Name"
											});
											var itemUpcCode = ifSearchObj[r].getValue({
												name: "upccode",
												join: "item",
												summary: "GROUP",
												label: "UPC Code"
											});
											var itemWidth = ifSearchObj[r].getValue({
												name: "custitem_item_width",
												join: "item",
												summary: "GROUP",
												label: "Item Width (inch)"
											});
											var itemWeight = ifSearchObj[r].getValue({
												name: "weight",
												join: "item",
												summary: "GROUP",
												label: "Weight"
											});
											var itemHeight = ifSearchObj[r].getValue({
												name: "custitem_item_height",
												join: "item",
												summary: "GROUP",
												label: "Item Height (inch)"
											});
											var itemLength = ifSearchObj[r].getValue({
												name: "custitem_item_length",
												join: "item",
												summary: "GROUP",
												label: "Item Length (inch)"
											});
											var itemQuantity = ifSearchObj[r].getValue({
												name: "quantity",
												summary: "GROUP",
												label: "Item Quantity"
											});
											if (itemQuantity) {
												if (parseFloat(itemQuantity) > 1) {
													form.updateDefaultValues({
														custpage_has_greater_than_1_qty: "T"
													});
												}
											}
										}

										var carrierName = getShippingItemCarrier(shipMethodVal);
										var urlVal = SHIPPING_METHOD_URL[carrierName]

										newUrlVal = urlVal.replace("SOINTERNALID", createdFromSoId);
										newUrlVal = newUrlVal.replace("IFINTERNALID", ifIdVal);

										if (itemFullfillmentIdArray.indexOf(lineId) == -1 && allowRepeating == 'T') {
											if (validateValue(newUrlVal)) {
												sublist.setSublistValue({
													id: 'custpage_link',
													line: r,
													value: newUrlVal
												});
											}

											if (validateValue(orderNo)) {
												sublist.setSublistValue({
													id: 'custpage_order_no',
													line: r,
													value: orderNo
												});
											}
											if (validateValue(orderDate)) {
												sublist.setSublistValue({
													id: 'custpage_order_date',
													line: r,
													value: orderDate
												});
											}
											if (validateValue(shipMethodVal)) {
												sublist.setSublistValue({
													id: 'custpage_ship_date',
													line: r,
													value: shipMethodVal
												});
											}
											if (validateValue(CustomerName)) {
												sublist.setSublistValue({
													id: 'custpage_customer',
													line: r,
													value: CustomerName
												});
											}
										}
										if (allowRepeating == 'F') {
											if (itemName == itemNameVal || itemName == itemUpcCode) {
												if (validateValue(itemName)) {
													sublist.setSublistValue({
														id: 'custpage_scan_item_barcode',
														line: r,
														value: itemName
													});
												}
											}
											if (uniqueItemFulfillId.length == 1) {
												sublist.setSublistValue({
													id: 'custpage_print_fulfillment',
													line: r,
													value: 'T'
												});
											}
											if (validateValue(ifIdVal)) {
												sublist.setSublistValue({
													id: 'custpage_item_fullfilment_hiden',
													line: r,
													value: ifIdVal
												});
											}
											if (validateValue(newUrlVal)) {
												sublist.setSublistValue({
													id: 'custpage_link',
													line: r,
													value: newUrlVal
												});
											}
											if (validateValue(orderNo)) {
												sublist.setSublistValue({
													id: 'custpage_order_no',
													line: r,
													value: orderNo
												});
											}
											if (validateValue(orderDate)) {
												sublist.setSublistValue({
													id: 'custpage_order_date',
													line: r,
													value: orderDate
												});
											}
											if (validateValue(shipMethodVal)) {
												sublist.setSublistValue({
													id: 'custpage_ship_date',
													line: r,
													value: shipMethodVal
												});
											}
											if (validateValue(CustomerName)) {
												sublist.setSublistValue({
													id: 'custpage_customer',
													line: r,
													value: CustomerName
												});
											}
											if (validateValue(itemLength)) {
												sublist.setSublistValue({
													id: 'custpage_item_length',
													line: r,
													value: itemLength
												});
											}
											if (validateValue(itemWidth)) {
												sublist.setSublistValue({
													id: 'custpage_item_width',
													line: r,
													value: itemWidth
												});
											}
											if (validateValue(itemHeight)) {
												sublist.setSublistValue({
													id: 'custpage_item_height',
													line: r,
													value: itemHeight
												});
											}
											if (validateValue(itemWeight)) {
												sublist.setSublistValue({
													id: 'custpage_item_weight',
													line: r,
													value: itemWeight
												});
											}
											if (validateValue(itemNameVal)) {
												sublist.setSublistValue({
													id: 'custpage_item_code',
													line: r,
													value: itemNameVal
												});
											}
											if (validateValue(itemNameVal)) {
												sublist.setSublistValue({
													id: 'custpage_item_code_hidden',
													line: r,
													value: itemNameVal
												});
											}
											if (validateValue(itemQuantity)) {
												sublist.setSublistValue({
													id: 'custpage_item_quantity',
													line: r,
													value: itemQuantity
												});
											}
											if (validateValue(itemUpcCode)) {
												sublist.setSublistValue({
													id: 'custpage_upc_code',
													line: r,
													value: itemUpcCode
												});
											}
											if (validateValue(itemUpcCode)) {
												sublist.setSublistValue({
													id: 'custpage_upc_code_hidden',
													line: r,
													value: itemUpcCode
												});
											}
											// record.submitFields({
											// 	type: "itemfulfillment",
											// 	id: ifIdVal,
											// 	values: {
											// 		custbody_open_in_print_label: true
											// 	},
											// });
										}
										//itemFullfillmentIdArray.push(ifIdVal);
										itemFullfillmentIdArray.push(lineId);

										log.debug('itemFullfillmentIdArray', JSON.stringify(itemFullfillmentIdArray))
									}
								} else {
									messageVal = "There is no fulfillment.Please check the filters and try again";
								}
							} else {
								messageVal = "There is no fulfillment or the shipment method is not integrated.Please check the filters and try again";
							}
						} else {
							messageVal = "Invalid Item.";
						}
					} else {
						messageVal = "Please enter Item.";
					}

					if (validateValue(messageVal)) {
						form.addPageInitMessage({
							type: message.Type.INFORMATION,
							message: messageVal,
							duration: 0
						});
					}

					var clientScriptInternalId = returnClientScriptInternalId();
					log.debug("clientScriptInternalId", clientScriptInternalId);

					form.addButton({
						id: 'custpage_print',
						label: 'Print',
						functionName: 'printLabel()'
					});
					form.addButton({
						id: 'reset',
						label: 'Reset',
						functionName: 'resetButton'
					});
					if (allowRepeating == 'F') {
						form.addButton({
							id: 'custpage_skiptonext',
							label: 'Skip to Next',
							functionName: 'skipToNext()'
						});
					}

					form.addPageLink({
						type: serverWidget.FormPageLinkType.CROSSLINK,
						title: 'Printed Fulfillments',
						url: 'https://6241176.app.netsuite.com/app/common/search/searchresults.nl?searchid=3004&saverun=T&whence='
					});

					form.clientScriptFileId = clientScriptInternalId;
					context.response.writePage(form);

				}

			} catch (err) {
				log.error("Error in onRequest", err);
			}

		}

		function searchItemNameAlias(itemName) {

			try {
				log.debug('searchItemNameAlias function called');
				var aliasItemInternalId;

				var customrecord_wmsse_sku_aliasSearchObj = search.create({
					type: "customrecord_wmsse_sku_alias",
					filters: [
						["name", "is", itemName]
					],
					columns: ["custrecord_wmsse_alias_item"]
				});

				customrecord_wmsse_sku_aliasSearchObj.run().each(function(result) {
					aliasItemInternalId = result.getValue('custrecord_wmsse_alias_item')
					return false;
				});
				log.debug('aliasItemInternalId ', aliasItemInternalId);

				return aliasItemInternalId
			} catch (e) {
				log.error("Error in searchItemNameAlias", e);
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
						values: ["MN CS PRINT LABEL VALIDATION_v7.js"]
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

		//This function returns the item fulfillment search object
		function getItemFulfillment(itemName, carrierVal, locationVal, allowRepeating, selectOrderNo, shippingMethod, waveNumber, form) {
			var title = ' getItemFulfillment ';
			try {
				var filterArray = [
					["createdfrom.mainline", "is", "T"],
					"and", ["createdfrom.status", "noneof", ["SalesOrd:C", "SalesOrd:H"]],
					"and", ["createdfrom.custbody_on_hold", "is", "F"],
					"and", ["taxline", "is", "F"],
					"and", ["shipping", "is", "F"],
					"and", ["cogs", "is", "F"]
				];
				if (validateValue(carrierVal) && carrierVal != 0) {
					filterArray.push("and");
					filterArray.push(["shipcarrier", "anyof", carrierVal]);
				}

				if (validateValue(shippingMethod)) {
					filterArray.push("and");
					filterArray.push(["shipmethod", "anyof", shippingMethod]);
				}

				if (validateValue(locationVal)) {
					filterArray.push("and");
					filterArray.push(["location", "anyof", locationVal]);
				}

				if (validateValue(selectOrderNo)) {
					filterArray.push("and");
					filterArray.push(["createdfrom.number", "equalto", selectOrderNo]);
				}
				if (allowRepeating == 'F') {
					filterArray.push("and");
					filterArray.push(["custbody_label_printed", "is", 'F']);
					filterArray.push("and");
					filterArray.push(["custbody_open_in_print_label", "is", 'F']);
					filterArray.push("and");
					filterArray.push(["status", "anyof", "ItemShip:B"]);
				}
				if (allowRepeating == 'T') {
					filterArray.push("and");
					filterArray.push(["custbody_label_printed", "is", 'T']);
				}

				if (validateValue(itemName)) {
					filterArray.push("and");
					filterArray.push(["item.internalid", "anyof", itemName]);
				}
				if (validateValue(waveNumber)) {
					var dataObj = getWaveTransactions(waveNumber);
					var waveOrders = dataObj.waveOrders;
					var linesTotal = dataObj.linesTotal;
					var linesPicked = dataObj.linesPicked;
					if (waveOrders.length > 0) {
						filterArray.push("and");
						filterArray.push(["createdfrom", "anyof", waveOrders]);
						var waveCompletionPerc = (linesPicked / linesTotal) * 100
						form.updateDefaultValues({
							custpage_completion_perc: (waveCompletionPerc).toFixed(2)
						});
					}
				}
				var itemfulfillmentSearchObj = search.create({
					type: "itemfulfillment",
					filters: [filterArray],
					columns: [
						search.createColumn({
							name: "custbody_print_label_sequence",
							sort: search.Sort.ASC,
							label: "Print Label Sequence"
						}),
						search.createColumn({
							name: "internalid",
							sort: search.Sort.ASC,
							label: "Internal ID"
						}),
						search.createColumn({
							name: "tranid",
							join: "createdFrom",
							label: "Document Number"
						}),
						search.createColumn({
							name: "internalid",
							join: "createdFrom",
							label: "Internal ID"
						}),
						search.createColumn({
							name: "trandate",
							join: "createdFrom",
							label: "Date"
						}),
						search.createColumn({
							name: "item",
							label: "Item"
						}),
						search.createColumn({
							name: "altname",
							join: "customer",
							label: "Name"
						}),
						search.createColumn({
							name: "futureshipdate",
							label: "Future Ship Date"
						}),
						search.createColumn({
							name: "tranid",
							label: "Document Number"
						}),
						search.createColumn({
							name: "entity",
							label: "Name"
						}),
						search.createColumn({
							name: "custbody_label_printed",
							label: "Label Printed"
						}),
						search.createColumn({
							name: "shipmethod",
							label: "Ship Via"
						})
					]
				});

				if (allowRepeating == 'F') {
					var searchResults = itemfulfillmentSearchObj.run().getRange({
						start: 0,
						end: 1
					});
					if (searchResults.length > 0) {

						var soId = searchResults[0].getValue({
							name: "internalid",
							join: "createdFrom",
							label: "Internal ID"
						});

						log.audit("soId", soId);
						var newItemfulfillmentSearchObj = search.create({
							type: "itemfulfillment",
							filters: [
								["createdfrom.internalid", "anyof", soId],
								"AND", ["taxline", "is", "F"],
								"AND", ["custbody_label_printed", "is", ["F"]],
								"AND", ["custbody_open_in_print_label", "is", ["F"]],
								"AND", ["shipping", "is", "F"],
								"AND", ["cogs", "is", "F"],
								"AND", ["item.type", "noneof", "Kit"],
								"AND", ["status", "anyof", "ItemShip:B"]
							],
							columns: [
								search.createColumn({
									name: "internalid",
									sort: search.Sort.ASC,
									summary: "GROUP",
									label: "Internal ID"
								}),
								search.createColumn({
									name: "tranid",
									join: "createdFrom",
									summary: "GROUP",
									label: "Document Number"
								}),
								search.createColumn({
									name: "internalid",
									join: "createdFrom",
									summary: "GROUP",
									label: "Internal ID"
								}),
								search.createColumn({
									name: "trandate",
									join: "createdFrom",
									summary: "GROUP",
									label: "Date"
								}),
								search.createColumn({
									name: "itemid",
									join: "item",
									summary: "GROUP",
									label: "Name"
								}),
								search.createColumn({
									name: "upccode",
									join: "item",
									summary: "GROUP",
									label: "UPC Code"
								}),
								search.createColumn({
									name: "item",
									summary: "GROUP",
									label: "Item"
								}),
								search.createColumn({
									name: "altname",
									join: "customer",
									summary: "GROUP",
									label: "Name"
								}),
								search.createColumn({
									name: "futureshipdate",
									summary: "GROUP",
									label: "Future Ship Date"
								}),
								search.createColumn({
									name: "tranid",
									summary: "GROUP",
									label: "Document Number"
								}),
								search.createColumn({
									name: "entity",
									summary: "GROUP",
									label: "Name"
								}),
								search.createColumn({
									name: "custbody_label_printed",
									summary: "GROUP",
									label: "Label Printed"
								}),
								search.createColumn({
									name: "custbody_open_in_print_label",
									summary: "GROUP",
									label: "Open in Print Label"
								}),
								search.createColumn({
									name: "shipmethod",
									summary: "GROUP",
									label: "Ship Via"
								}),
								search.createColumn({
									name: "custitem_item_width",
									join: "item",
									summary: "GROUP",
									label: "Item Width (inch)"
								}),
								search.createColumn({
									name: "weight",
									join: "item",
									summary: "GROUP",
									label: "Weight"
								}),
								search.createColumn({
									name: "custitem_item_height",
									join: "item",
									summary: "GROUP",
									label: "Item Height (inch)"
								}),
								search.createColumn({
									name: "custitem_item_length",
									join: "item",
									summary: "GROUP",
									label: "Item Length (inch)"
								}),
								search.createColumn({
									name: "quantity",
									summary: "GROUP",
									label: "Item Quantity"
								}),
								search.createColumn({
									name: "line",
									summary: "GROUP",
									label: "Line ID"
								}),
							]
						});
						var newSearchResults = newItemfulfillmentSearchObj.run().getRange({
							start: 0,
							end: 1000
						});
						return newSearchResults;
					} else {
						return [];
					}
				}

				if (allowRepeating == 'T') {
					log.audit("getResults(itemfulfillmentSearchObj.run())", getResults(itemfulfillmentSearchObj.run()));
					return getResults(itemfulfillmentSearchObj.run());
				}

			} catch (err) {
				log.error("Error in getItemFulfillment", err);
			}
		}

		function getWaveTransactions(waveNumber) {
			var title = " getWaveTransactions ";
			try {
				var waveOrders = [];
				var waveMapObj = {};
				var linesPicked = 0;
				var linesTotal = 0;
				var pickTaskSearch = search.create({
					type: 'picktask',
					filters: [
						search.createFilter({
							name: 'wavename',
							operator: search.Operator.ANYOF,
							values: [waveNumber]
						})
					],
					columns: [
						search.createColumn({
							name: 'internalid',
							join: 'transaction'
						}),
						search.createColumn({
							name: 'wavename'
						}),
						search.createColumn({
							name: 'lineitemstatus'
						})
					]
				});
				var searchResults = [];
				var count = 0;
				var pageSize = 1000;
				var start = 0;
				do {
					var tempData = pickTaskSearch.run().getRange({
						start: start,
						end: start + pageSize
					});
					searchResults = searchResults.concat(tempData);
					count = searchResults.length;
					start += pageSize;
				} while (count == pageSize);
				for (var i = 0; i < searchResults.length; i++) {
					var waveOrder = searchResults[i].getValue({
						name: 'internalid',
						join: 'transaction'
					});
					var lineStatus = searchResults[i].getValue({
						name: 'lineitemstatus',
					});
					if (waveOrders.indexOf(waveOrder) == -1) waveOrders.push(waveOrder);
					linesTotal++;
					if (lineStatus == 'PICKED') {
						linesPicked++;
					}

				}
				var dataObj = {
					waveOrders: waveOrders,
					linesTotal: linesTotal,
					linesPicked: linesPicked
				}
				return dataObj;
			} catch (err) {
				log.error("Error in" + title, err);
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

		//This function returns the item id if available
		function getItemId(itemName) {
			try {
				var itemSearchObj = search.create({
					type: "item",
					filters: [
						["upccode", "is", itemName],
						"OR", ["name", "is", itemName]
					],
					columns: [
						search.createColumn({
							name: "itemid",
							sort: search.Sort.ASC,
							label: "Name"
						}),
						search.createColumn({
							name: "displayname",
							label: "Display Name"
						}),
						search.createColumn({
							name: "internalid",
							label: "Internal ID"
						}),
					]
				});

				var searchResults = itemSearchObj.run().getRange({
					start: 0,
					end: 1000
				});
				log.debug("searchResults -->getItemId", searchResults);
				log.debug("searchResults -->getItemId", searchResults.length);

				if (searchResults.length > 0) {
					var itemId = searchResults[0].getValue({
						name: "internalid",
						label: "Internal ID"
					});
					return itemId;
				} else {
					//********// ADDED FOR TESTS ---  Przemyslaw Zawadzki//

					var AliasSearch = search.load({
						id: 'customsearch4909'
					});
					var searchFilters = AliasSearch.filters;
					searchFilters.push(search.createFilter({
						name: 'name',
						operator: search.Operator.IS,
						values: itemName
					}));
					var Alias_results_search = AliasSearch.run();
					var Alias_results_search_array = Alias_results_search.getRange({
						start: 0,
						end: 100
					});
					log.debug("Alias search array -->getItemId", Alias_results_search_array);
					log.debug("Alias search array -->getItemId", Alias_results_search_array.length);
					if (Alias_results_search_array.length > 0) {
						var itemId = Alias_results_search_array[0].getValue(Alias_results_search.columns[1]);
						return itemId;
					} else {
						return "";
					}

					//********// ADDED FOR TESTS ---  Przemyslaw Zawadzki//

				}

			} catch (err) {
				log.error("Error in getItemId", err);
			}
		}

		//This function returns the array list of integrated shipping item
		function getAllIntegratedShippingItem() {
			try {
				var integratedShippingItemArray = [];

				var shipitemSearchObj = search.create({
					type: "shipitem",
					filters: [
						["isshipperintegrated", "is", "T"]
					],
					columns: [search.createColumn({
						name: "itemid",
						sort: search.Sort.ASC,
						label: "Name"
					})]
				});
				var searchResults = shipitemSearchObj.run().getRange({
					start: 0,
					end: 1000
				});

				for (var r = 0; r < searchResults.length; r++) {
					var shippingItem = searchResults[r].id;
					integratedShippingItemArray.push(shippingItem);
				}
				log.debug("integratedShippingItemArray -->getAllShippingItem", integratedShippingItemArray);

				return integratedShippingItemArray;

			} catch (err) {
				log.error("Error in getAllShippingItem", err);
			}
		}

		//This function returns JSON of the shipping item and carrier if integration is done/carrier is not empty
		function getShippingItemCarrier(carrierVal) {
			try {
				var shippingItemCarrierJSON = {};
				var shipitemSearchObj = search.create({
					type: "shipitem",
					filters: [
						["isshipperintegrated", "is", "T"],
						"AND", ["itemid", "is", carrierVal]
					],
					columns: [
						search.createColumn({
							name: "itemid",
							sort: search.Sort.ASC,
							label: "Name"
						}),
						search.createColumn({
							name: "carrier",
							label: "Carrier"
						})
					]
				});

				var searchResults = shipitemSearchObj.run().getRange({
					start: 0,
					end: 1
				});
				log.debug("searchResults -->getShippingItemCarrier", searchResults);
				log.debug("searchResults -->getShippingItemCarrier", searchResults.length);

				var Carrier = searchResults[0].getValue({
					name: "carrier",
					label: "Carrier"
				});
				return Carrier;
			} catch (err) {
				log.error("Error in getShippingItemCarrier", err);
			}
		}

		return {
			onRequest: onRequest
		};

	});
