/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget', 'N/search', 'N/https', 'N/ui/message', 'N/record', 'N/url', 'N/runtime'],
	function(serverWidget, search, https, message, record, url, runtime) {
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
					if (allowRepeating == true || allowRepeating == 'true') {
						allowRepeating = 'T';
					} else {
						allowRepeating = 'F';
					}

					var form = serverWidget.createForm({
						title: 'Print Integrated Shipping Labels'
					});

					//**********************************************************//
					var userName = runtime.getCurrentUser().name;
					var userID = runtime.getCurrentUser().id;

					form.addField({
						id: 'custpage_user_id',
						type: serverWidget.FieldType.TEXT,
						label: 'userId: '
					}).updateDisplayType({
						displayType: serverWidget.FieldDisplayType.HIDDEN
					});
					form.updateDefaultValues({
						custpage_user_id: userID
					});
					//**********************************************************//


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
					}).updateDisplayType({
						displayType: serverWidget.FieldDisplayType.HIDDEN
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
						type: serverWidget.FieldType.TEXT,
						label: 'WAVE COMPLETION'
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
					var packagesBtn = sublist.addButton({
						id: 'crud_packages',
						label: 'Create/Delete Packages',
						functionName: 'crud_pkg'
					})
					var shipMethodBtn = sublist.addButton({
						id: 'edit_shipmethod',
						label: 'Edit Shipping Method',
						functionName: 'edit_shipmethod'
					})
					var addrShipBtn = sublist.addButton({
						id: 'edit_shipaddress',
						label: 'Edit Shipping Address',
						functionName: 'edit_shipaddress'
					})
					var printFieldObj = sublist.addField({
						id: 'custpage_print_fulfillment',
						type: serverWidget.FieldType.CHECKBOX,
						label: 'PRINT'
					});
					var lableStatusFieldObj = sublist.addField({
						id: 'custpage_print_lable_status',
						type: serverWidget.FieldType.TEXT,
						label: 'AV40 Label Statue'
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
								label: 'ITEM CODE'
							})
							/*.updateDisplayType({
							displayType: serverWidget.FieldDisplayType.HIDDEN
							});*/
						sublist.addField({
							id: 'custpage_item_quantity',
							type: serverWidget.FieldType.INTEGER,
							label: 'ITEM QUANTITY'
						});
						sublist.addField({
							id: 'custpage_item_quantity_to_capture',
							type: serverWidget.FieldType.INTEGER,
							label: 'ENTER ITEM QUANTITY'
						}).updateDisplayType({
							displayType: serverWidget.FieldDisplayType.ENTRY
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
						id: 'custpage_if_no',
						type: serverWidget.FieldType.TEXT,
						label: 'Fulfillment #'
					});
					/*.updateDisplayType({
					displayType: serverWidget.FieldDisplayType.INLINE
					});*/
					sublist.addField({
						id: 'custpage_sublist_carrier',
						type: serverWidget.FieldType.TEXT,
						label: 'Carrier'
					});
					sublist.addField({
						id: 'custpage_sublist_carrier_service',
						type: serverWidget.FieldType.TEXT,
						label: 'Carrier Service'
					});
					sublist.addField({
						id: 'custpage_order_date',
						type: serverWidget.FieldType.TEXT,
						label: 'ORDER DATE'
					});
					sublist.addField({
						id: 'custpage_ship_date',
						type: serverWidget.FieldType.TEXT,
						label: 'SHIP DATE'
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
							label: 'ITEM LENGTH (CM)'
						});
						sublist.addField({
							id: 'custpage_item_width',
							type: serverWidget.FieldType.TEXT,
							label: 'ITEM WIDTH (CM)'
						});
						sublist.addField({
							id: 'custpage_item_height',
							type: serverWidget.FieldType.TEXT,
							label: 'ITEM HEIGHT (CM)'
						});
						sublist.addField({
							id: 'custpage_item_weight',
							type: serverWidget.FieldType.TEXT,
							label: 'ITEM WEIGHT'
						});
					}
					sublist.addField({
						id: 'custpage_etail_chann',
						type: serverWidget.FieldType.TEXT,
						label: 'Etail'
					});
					//  sublist.addField({
					//     id: 'custpage_ship_pkg_cr',
					//     type: serverWidget.FieldType.URL,
					//     label: 'Shipping Packages Screen'
					// }).linkText='Create/Delete'
					sublist.addField({
						id: 'custpage_sub_item_type',
						type: serverWidget.FieldType.TEXT,
						label: 'Item Type'
					}).updateDisplayType({
						displayType: serverWidget.FieldDisplayType.HIDDEN
					});
					sublist.addField({
						id: 'custpage_sub_tranid',
						type: serverWidget.FieldType.TEXT,
						label: 'tranid'
					}).updateDisplayType({
						displayType: serverWidget.FieldDisplayType.HIDDEN
					});
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
							//var integratedShippingItem = getAllIntegratedShippingItem();
							var integratedShippingItem = ['53', '60078'];
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
								var lineNumber = 0;

								if (validateValue(ifInternalIdValue)) {
									for (var r = 0; r < ifSearchObj.length; r++) {
										var itemType = ifSearchObj[r].getValue({
											name: "type",
											join: "item",
											summary: "GROUP"
										});
										if (itemType == 'InvtPart') {

											var seachItemInternalId = ifSearchObj[r].getValue({
												name: "internalid",
												join: "item",
												summary: "GROUP"
											});

											sublist.setSublistValue({
												id: 'custpage_sub_item_type',
												line: lineNumber,
												value: itemType
											});
											log.debug('item type', itemType)
											if (allowRepeating == 'T') {
												var ifIdVal = ifSearchObj[r].getValue({
													name: "internalid",
													sort: search.Sort.ASC,
													label: "Internal ID"
												});
												var orderNo = ifSearchObj[r].getValue({
													name: "tranid",
													join: "createdFrom",
													label: "Document Number"
												});
												var ifNumber = ifSearchObj[r].getValue({
													name: "tranid",
													summary: "GROUP",
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
													name: "custbody_av40_shipping_type",
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
												var ifNumber = ifSearchObj[r].getValue({
													name: "tranid",
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
												var CustomerId = ifSearchObj[r].getValue({
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
													name: "custbody_av40_shipping_type",
													summary: "GROUP",
													label: "Ship Via"
												});
												var shipCarrierSerivceVal = ifSearchObj[r].getText({
													name: "custbody_av40_shipping_select",
													summary: "GROUP"
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

												var itemDescription = ifSearchObj[r].getValue({
													name: "salesdescription",
													join: "item",
													summary: "GROUP"
												});

												var itemUpcCode = ifSearchObj[r].getValue({
													name: "upccode",
													join: "item",
													summary: "GROUP",
													label: "UPC Code"
												});
												var itemWidth = ifSearchObj[r].getValue({
													name: "custitem_item_width_cm",
													join: "item",
													summary: "GROUP",
													label: "Item Width (inch)"
												});
												var itemWeight = ifSearchObj[r].getValue({
													name: "custitem_item_weight_kg",
													join: "item",
													summary: "GROUP",
													label: "Weight"
												});
												var itemHeight = ifSearchObj[r].getValue({
													name: "custitem_item_height_cm",
													join: "item",
													summary: "GROUP",
													label: "Item Height (inch)"
												});
												var itemLength = ifSearchObj[r].getValue({
													name: "custitem_item_length_cm",
													join: "item",
													summary: "GROUP",
													label: "Item Length (inch)"
												});
												var itemQuantity = ifSearchObj[r].getValue({
													name: "quantity",
													summary: "GROUP",
													label: "Item Quantity"
												});
												var etailVal = ifSearchObj[r].getText({
													name: "custbody_celigo_etail_channel",
													summary: "GROUP"
												});
												if (itemQuantity) {
													if (parseFloat(itemQuantity) > 1) {
														form.updateDefaultValues({
															custpage_has_greater_than_1_qty: "T"
														});
													}
												}
											}
											var itemNameFlValue = null;
											var itemDisplayNameDe = ifSearchObj[r].getValue({
												name: "custitem_omac_display_name_de",
												join: "item",
												summary: "GROUP"
											});
											var itemDisplayName = ifSearchObj[r].getValue({
												name: "displayname",
												join: "item",
												summary: "GROUP"
											});
											if (itemDisplayNameDe) itemNameFlValue = itemDisplayNameDe;
											else itemNameFlValue = itemDisplayName;
											var newUrlVal = null;
											/*var carrierName = getShippingItemCarrier(shipMethodVal);
											var urlVal = SHIPPING_METHOD_URL[carrierName]
											if (urlVal)
											newUrlVal = urlVal.replace("SOINTERNALID", createdFromSoId);
											if (newUrlVal)
											newUrlVal = newUrlVal.replace("IFINTERNALID", ifIdVal);*/
											log.debug('ifIdVal 438 ==> ', ifIdVal)
											var pdfFile = search.lookupFields({
												type: 'itemfulfillment',
												id: ifIdVal,
												columns: ['custbody_av40_label_pdf']
											});
											log.debug('pdfFile   ==> ', pdfFile);
											log.debug('pdfFile  length  ==> ', pdfFile.custbody_av40_label_pdf.length);
											var pdfFileId
											if (pdfFile.custbody_av40_label_pdf.length >= 1)
												pdfFileId = pdfFile.custbody_av40_label_pdf[0].value
											log.debug('pdfFileId   ==> ', pdfFileId);
											var lableStatus = null;
											if (pdfFileId) lableStatus = 'Yes';
											else if (!pdfFileId) lableStatus = 'No';
											if (itemFullfillmentIdArray.indexOf(ifIdVal) == -1 && allowRepeating == 'T') {

												sublist.setSublistValue({
													id: 'custpage_print_lable_status',
													line: lineNumber,
													value: lableStatus
												});
												if (validateValue(newUrlVal)) {
													sublist.setSublistValue({
														id: 'custpage_link',
														line: lineNumber,
														value: newUrlVal
													});
												}
												if (validateValue(createdFromSoId) && orderNo) {
													sublist.setSublistValue({
														id: 'custpage_order_no',
														line: lineNumber,
														value: '<a target="_blank" href="https://6241176.app.netsuite.com/app/accounting/transactions/salesord.nl?id=' + createdFromSoId + '&whence=">' + orderNo + '</a>'
													});
													sublist.setSublistValue({
														id: 'custpage_if_no',
														line: lineNumber,
														value: '<a target="_blank" href="https://6241176.app.netsuite.com/app/accounting/transactions/itemship.nl?id=' + ifIdVal + '&whence=">' + ifNumber + '</a>'
													});
													sublist.setSublistValue({
														id: 'custpage_sub_tranid',
														line: lineNumber,
														value: ifNumber
													});
												}
												if (validateValue(orderDate)) {
													sublist.setSublistValue({
														id: 'custpage_order_date',
														line: lineNumber,
														value: orderDate
													});
												}
												if (validateValue(ShipDate)) {
													sublist.setSublistValue({
														id: 'custpage_ship_date',
														line: lineNumber,
														value: ShipDate
													});
												}
												if (validateValue(CustomerName)) {
													sublist.setSublistValue({
														id: 'custpage_customer',
														line: lineNumber,
														value: '<a target="_blank" href="https://6241176.app.netsuite.com/app/common/entity/custjob.nl?id=' + CustomerId + '&whence=">' + CustomerName + '</a>'
													});
												}
											}
											if (allowRepeating == 'F') {
												//if (itemName == itemNameVal || itemName == itemUpcCode) {
												sublist.setSublistValue({
													id: 'custpage_print_lable_status',
													line: lineNumber,
													value: lableStatus
												});
												if (validateValue(itemNameVal) && (itemType != 'InvtPart' || itemNameVal == itemName || itemInternalId == seachItemInternalId)) {
													sublist.setSublistValue({
														id: 'custpage_scan_item_barcode',
														line: lineNumber,
														value: itemNameVal
													});
												}
												//}
												if (uniqueItemFulfillId.length == 1) {
													sublist.setSublistValue({
														id: 'custpage_print_fulfillment',
														line: lineNumber,
														value: 'T'
													});
												}
												if (validateValue(ifIdVal)) {
													sublist.setSublistValue({
														id: 'custpage_item_fullfilment_hiden',
														line: lineNumber,
														value: ifIdVal
													});
												}
												if (validateValue(newUrlVal)) {
													sublist.setSublistValue({
														id: 'custpage_link',
														line: lineNumber,
														value: newUrlVal
													});
												}
												if (validateValue(createdFromSoId) && orderNo) {
													sublist.setSublistValue({
														id: 'custpage_order_no',
														line: lineNumber,
														value: '<a target="_blank" href="https://6241176.app.netsuite.com/app/accounting/transactions/salesord.nl?id=' + createdFromSoId + '&whence=">' + orderNo + '</a>'
													});
												}
												sublist.setSublistValue({
													id: 'custpage_if_no',
													line: lineNumber,
													value: '<a target="_blank" href="https://6241176.app.netsuite.com/app/accounting/transactions/itemship.nl?id=' + ifIdVal + '&whence=">' + ifNumber + '</a>'
												});
												if (validateValue(orderDate)) {
													sublist.setSublistValue({
														id: 'custpage_order_date',
														line: lineNumber,
														value: orderDate
													});
												}
												if (validateValue(ShipDate)) {
													sublist.setSublistValue({
														id: 'custpage_ship_date',
														line: lineNumber,
														value: ShipDate
													});
												}
												if (validateValue(CustomerName)) {
													sublist.setSublistValue({
														id: 'custpage_customer',
														line: lineNumber,
														value: '<a target="_blank" href="https://6241176.app.netsuite.com/app/common/entity/custjob.nl?id=' + CustomerId + '&whence=">' + CustomerName + '</a>'
													});
												}
												if (validateValue(itemLength)) {
													sublist.setSublistValue({
														id: 'custpage_item_length',
														line: lineNumber,
														value: itemLength
													});
												}
												if (validateValue(itemWidth)) {
													sublist.setSublistValue({
														id: 'custpage_item_width',
														line: lineNumber,
														value: itemWidth
													});
												}
												if (validateValue(itemHeight)) {
													sublist.setSublistValue({
														id: 'custpage_item_height',
														line: lineNumber,
														value: itemHeight
													});
												}
												if (validateValue(itemWeight)) {
													sublist.setSublistValue({
														id: 'custpage_item_weight',
														line: lineNumber,
														value: itemWeight
													});
												}
												if (validateValue(itemDisplayName)) {
													sublist.setSublistValue({
														id: 'custpage_item_code',
														line: lineNumber,
														value: itemDisplayName
													});
												}
												if (validateValue(itemNameVal)) {
													sublist.setSublistValue({
														id: 'custpage_item_code_hidden',
														line: lineNumber,
														value: itemNameVal
													});
												}
												if (validateValue(itemQuantity)) {
													log.debug('itemQuantity amin', itemQuantity)
													sublist.setSublistValue({
														id: 'custpage_item_quantity',
														line: lineNumber,
														value: itemQuantity
													});

													if (Number(itemQuantity) == 1) {
														log.debug('itemQuantity if ', itemQuantity)
														sublist.setSublistValue({
															id: 'custpage_item_quantity_to_capture',
															line: lineNumber,
															value: itemQuantity
														});
													} else if (Number(itemQuantity) > 1) {
														log.debug('itemQuantity else ', itemQuantity)
														sublist.setSublistValue({
															id: 'custpage_item_quantity_to_capture',
															line: lineNumber,
															value: null
														});
													}
												}
												if (validateValue(itemUpcCode)) {
													sublist.setSublistValue({
														id: 'custpage_upc_code',
														line: lineNumber,
														value: itemUpcCode
													});
												}
												if (validateValue(itemUpcCode)) {
													sublist.setSublistValue({
														id: 'custpage_upc_code_hidden',
														line: lineNumber,
														value: itemUpcCode
													});
												}
												if (validateValue(shipMethodVal)) {
													sublist.setSublistValue({
														id: 'custpage_sublist_carrier',
														line: lineNumber,
														value: shipMethodVal
													});
												}
												if (validateValue(shipCarrierSerivceVal)) {
													sublist.setSublistValue({
														id: 'custpage_sublist_carrier_service',
														line: lineNumber,
														value: shipCarrierSerivceVal
													});
												}
												if (validateValue(etailVal)) {
													sublist.setSublistValue({
														id: 'custpage_etail_chann',
														line: lineNumber,
														value: etailVal
													});
												}
												sublist.setSublistValue({
													id: 'custpage_ship_pkg_cr',
													line: lineNumber,
													value: generateSuiteletUrl(ifIdVal, ifNumber)
												});

												sublist.setSublistValue({
													id: 'custpage_itf_id',
													line: lineNumber,
													value: ifIdVal
												});

												//button style="background-color:#FF7F7F;"><a href="${}</a></button>
												// record.submitFields({
												// 	type: "itemfulfillment",
												// 	id: ifIdVal,
												// 	values: {
												// 		custbody_open_in_print_label: true
												// 	},
												// });
												lineNumber++;
											}
											log.debug('ifIdVal==>', ifIdVal)
											itemFullfillmentIdArray.push(ifIdVal);
										}
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
					/*form.addButton({
					id: 'custpage_print',
					label: 'Print',
					functionName: 'printLabel()'
					});*/

					form.addButton({
						id: 'custpage_printbutton',
						label: 'Print',
						functionName: 'printLabelLocked'
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

		function generateSuiteletUrl(id, ifNumber) {
			var output = url.resolveScript({
				scriptId: 'customscript_av_set_ship_add_sl',
				deploymentId: 'customdeploy_av_set_ship_addr_sl',
				returnExternalUrl: false
			});

			return `${output}&itfID=${id}&tranid=${ifNumber}`;
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
						values: ["PZ AV MN CS PRINT LABEL VALIDATION_v8.js"]
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
			log.debug('getItemFulfillment values', JSON.stringify({
				itemName: itemName,
				carrierVal: carrierVal,
				locationVal: locationVal,
				allowRepeating: allowRepeating,
				selectOrderNo: selectOrderNo,
				shippingMethod: shippingMethod,
				waveNumber: waveNumber,
				form: form
			}));
			var title = ' getItemFulfillment ';
			try {
				var filterArray = [
					["createdfrom.mainline", "is", "T"],
					"AND", ["createdfrom.status", "noneof", ["SalesOrd:C", "SalesOrd:H"]],
					"AND", ["createdfrom.custbody_on_hold", "is", "F"],
					"AND", ["taxline", "is", "F"],
					/*"AND", ["shipping", "is", "F"],*/
					"AND", ["cogs", "is", "F"]
				];
				/*if (validateValue(carrierVal) && carrierVal != 0) {
				filterArray.push("and");
				filterArray.push(["shipcarrier", "anyof", carrierVal]);
				}*/
				/*if (validateValue(shippingMethod)) {
				filterArray.push("and");
				filterArray.push(["custbody_av40_shipping_type", "anyof", shippingMethod]);
				}*/
				if (validateValue(locationVal)) {
					filterArray.push("AND");
					filterArray.push(["location", "anyof", locationVal]);
				}
				if (validateValue(selectOrderNo)) {
					filterArray.push("AND");
					filterArray.push(["createdfrom.number", "equalto", selectOrderNo]);
				}
				if (allowRepeating == 'F') {
					filterArray.push("AND");
					filterArray.push(["custbody_label_printed", "is", 'F']);
					filterArray.push("AND");
					filterArray.push(["custbody_open_in_print_label", "is", 'F']);
					filterArray.push("AND");
					filterArray.push(["status", "anyof", "ItemShip:A", "ItemShip:B"]);
				}
				if (allowRepeating == 'T') {
					filterArray.push("AND");
					filterArray.push(["custbody_label_printed", "is", 'T']);
				}
				if (validateValue(itemName)) {
					filterArray.push("AND");
					filterArray.push(["item.internalid", "anyof", itemName]);
				}
				log.debug('filterArray values', JSON.stringify(filterArray));
				/*[
				["createdfrom.mainline", "is", "T"],
				"and", ["createdfrom.status", "noneof", ["SalesOrd:C", "SalesOrd:H"]],
				"and", ["createdfrom.custbody_on_hold", "is", "F"],
				"and", ["taxline", "is", "F"],
				"and", ["shipping", "is", "F"],
				"and", ["cogs", "is", "F"],
				"and", ["createdfrom.number", "equalto", "147519"],
				"and", ["custbody_label_printed", "is", "F"],
				"and", ["custbody_open_in_print_label", "is", "F"],
				"and", ["status", "anyof", "ItemShip:A"],
				"and", ["item.internalid", "anyof", "715"]
				]*/
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
							custpage_completion_perc: `${linesPicked}/${linesTotal}` || (waveCompletionPerc).toFixed(2)
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
							name: "custbody_av40_shipping_type",
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
								/*"AND", ["item.type", "noneof", "Kit"],*/
								"AND", ["status", "anyof", "ItemShip:A", "ItemShip:B"]
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
								// Carrier service
								search.createColumn({
									name: "custbody_av40_shipping_type",
									summary: "GROUP",
									label: "Ship Via"
								}),
								search.createColumn({
									name: "custitem_item_width_cm",
									join: "item",
									summary: "GROUP",
									label: "Item Width (inch)"
								}),
								search.createColumn({
									name: "custitem_item_weight_kg",
									join: "item",
									summary: "GROUP",
									label: "Weight"
								}),
								search.createColumn({
									name: "custitem_item_height_cm",
									join: "item",
									summary: "GROUP",
									label: "Item Height (inch)"
								}),
								search.createColumn({
									name: "custitem_item_length_cm",
									join: "item",
									summary: "GROUP",
									label: "Item Length (inch)"
								}),
								search.createColumn({
									name: "quantity",
									summary: "GROUP",
									label: "Item Quantity"
								}),
								//Shipping carrier
								search.createColumn({
									name: "custbody_av40_shipping_select",
									summary: "GROUP",
									label: "Shipping carrier"
								}),
								search.createColumn({
									name: "custbody_celigo_etail_channel",
									summary: "GROUP",
									label: "Etail"
								}),
								search.createColumn({
									name: "type",
									join: "item",
									summary: "GROUP"
								}),
								search.createColumn({
									name: "internalid",
									join: "item",
									summary: "GROUP"
								}),
								search.createColumn({
									name: "salesdescription",
									join: "item",
									summary: "GROUP"
								}),
								search.createColumn({
									name: "custitem_omac_display_name_de",
									join: "item",
									summary: "GROUP"
								}),
								search.createColumn({
									name: "displayname",
									join: "item",
									summary: "GROUP"
								})
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
				log.debug('getWaveTransactions Data==>', JSON.stringify(dataObj))
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
					return "";
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
				if (searchResults.length > 0) {
					var Carrier = searchResults[0].getValue({
						name: "carrier",
						label: "Carrier"
					});
				}
				return Carrier;
			} catch (err) {
				log.error("Error in getShippingItemCarrier", err);
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
		return {
			onRequest: onRequest
		};
	});
