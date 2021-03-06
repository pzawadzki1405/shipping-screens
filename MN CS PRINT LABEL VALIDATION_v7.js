/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
var PRINT_SEQUENCE_NOT_LAST = "1";
var PRINT_SEQUENCE_LAST = "2";
define(['N/url', 'N/currentRecord', 'N/record', 'N/search', 'N/https', 'N/ui/dialog'],
	function(url, currentRecord, record, search, https, dialog) {
		function printLabel() {
			try {
				var lineIndex = -1;
				var currRec = currentRecord.get();
				var waveNumber = currRec.getValue({
					fieldId: 'custpage_wave_number'
				});
				if (waveNumber) {
					var allowRepeating = currRec.getValue({
						fieldId: 'custpage_allow_repeating'
					});

					if (allowRepeating != true) {

						var numLines = currRec.getLineCount({
							sublistId: 'custpage_print_label'
						});
						for (var r = 0; r < numLines; r++) {
							var scannedItem = currRec.getSublistValue({
								sublistId: 'custpage_print_label',
								fieldId: 'custpage_scan_item_barcode',
								line: r
							});
							var printVal = currRec.getSublistValue({
								sublistId: 'custpage_print_label',
								fieldId: 'custpage_print_fulfillment',
								line: r
							});
							console.log("scannedItem", scannedItem);

							if (printVal == true && lineIndex == -1) {
								lineIndex = r
							}
							if (printVal == true) {
								if ((scannedItem == "" || scannedItem == null || scannedItem == undefined)) {
									alert("Please scan all selected items");
									return false;
								}
							}
						}

						if (lineIndex == -1) {
							alert("Please select atleast one item");
							return false;
						}
						console.log("lineIndex", lineIndex);
						var linkVal = currRec.getSublistValue({
							sublistId: 'custpage_print_label',
							fieldId: 'custpage_link',
							line: lineIndex
						});
					} else {
						var numLines = currRec.getLineCount({
							sublistId: 'custpage_print_label'
						});
						for (var r = 0; r < numLines; r++) {
							var printVal = currRec.getSublistValue({
								sublistId: 'custpage_print_label',
								fieldId: 'custpage_print_fulfillment',
								line: r
							});
							if (printVal == true) {
								var linkVal = currRec.getSublistValue({
									sublistId: 'custpage_print_label',
									fieldId: 'custpage_link',
									line: r
								});
								break;
							}
						}
					}
					console.log("linkVal", linkVal);
					var resetPage = url.resolveScript({
						scriptId: 'customscript_mn_sl_print_lable_v7',
						deploymentId: 'customdeploy1'
					});
					resetPage += "&waveNumber=" + waveNumber;
					var currentUrl = window.location.origin;
					window.onbeforeunload = null;
					if (allowRepeating != true) {
						var res = linkVal.split("&auxtrans=");
						record.submitFields({
							type: "itemfulfillment",
							id: res[1],
							values: {
								shipstatus: 'C',
								custbody_label_printed: true,
								custbody_open_in_print_label: true
							},
						});
						var windowObj = window.open(linkVal);
						windowObj.focus();
						windowObj.onblur = function() {
							windowObj.close();
							windowObj.opener.onbeforeunload = null;
							windowObj.opener.location.reload();
							window.location.href = currentUrl + resetPage;
						};
						windowObj.addEventListener('load', function() {
							setTimeout(function() {
								windowObj.close();
								windowObj.opener.onbeforeunload = null;
								windowObj.opener.location.reload();
								window.location.href = currentUrl + resetPage;
							}, 8000);
						});

					} else {
						var windowObj = window.open(linkVal);
						windowObj.focus();
						windowObj.onblur = function() {
							windowObj.close();
							window.location.href = currentUrl + resetPage;
						};
						windowObj.addEventListener('load', function() {
							setTimeout(function() {
								windowObj.close();
								window.location.href = currentUrl + resetPage;
							}, 8000);
						});
					}
				} else {
					// dialog.alert({
					// 	title: 'Wave Number is not selected!',
					// 	message: 'Please select wave number before clicking on Print button.'
					// });
					alert('Please select wave number before clicking on Print button.');
				}
			} catch (err) {
				console.log("Error in printLabel", err);
			}
		}

		function resetButton() {
			var currRec = currentRecord.get();
			var resetPage = url.resolveScript({
				scriptId: 'customscript_mn_sl_print_lable_v7',
				deploymentId: 'customdeploy1'
			});
			var lineCount = currRec.getLineCount({
				sublistId: 'custpage_print_label'
			});
			if (lineCount > 0) {
				var ifIdVal = currRec.getSublistValue({
					sublistId: 'custpage_print_label',
					fieldId: 'custpage_item_fullfilment_hiden',
					line: 0
				});
				if (ifIdVal) {
					record.submitFields({
						type: "itemfulfillment",
						id: ifIdVal,
						values: {
							custbody_open_in_print_label: false
						},
					});
				}
			}
			var currentUrl = window.location.origin;
			window.onbeforeunload = null;
			window.location.href = currentUrl + resetPage;
		}

		function pageInit(scriptContext) {
			var title = " pageInit() ";
			try {
				var currRec = scriptContext.currentRecord;
				var hasGT1Qty = currRec.getValue('custpage_has_greater_than_1_qty');
				console.log(title + "hasGT1Qty", hasGT1Qty);
				if (hasGT1Qty == "T" || hasGT1Qty == true) {
					alert("Please note that an Item in lines has Quantity greater than 1.")
				}
				checkAndSetOpenInPrintLabel(currRec);
			} catch (e) {
				console.log("Error in" + title, e);
			}
		}

		function fieldChanged(scriptContext) {
			var title = " fieldChanged ";
			try {
				var currRec = scriptContext.currentRecord;

				if (scriptContext.sublistId == 'custpage_print_label' && scriptContext.fieldId == 'custpage_scan_item_barcode') {
					checkAndSetOpenInPrintLabel(currRec);
					var itemCode = currRec.getCurrentSublistValue({
						sublistId: 'custpage_print_label',
						fieldId: 'custpage_item_code_hidden'
					});
					var itemUpcCode = currRec.getCurrentSublistValue({
						sublistId: 'custpage_print_label',
						fieldId: 'custpage_upc_code_hidden'
					});
					var scanedItem = currRec.getCurrentSublistValue({
						sublistId: 'custpage_print_label',
						fieldId: 'custpage_scan_item_barcode'
					});

					if (scanedItem != itemCode && scanedItem != itemUpcCode) {
						alert("Invalid Item.");
						currRec.setCurrentSublistValue({
							sublistId: 'custpage_print_label',
							fieldId: 'custpage_scan_item_barcode',
							value: "",
							ignoreFieldChange: true
						});
						currRec.commitLine({
							sublistId: 'custpage_print_label'
						});
						document.getElementById('custpage_scan_item_barcode' + Number(currRec.getCurrentSublistIndex({
							sublistId: 'custpage_print_label'
						}) + 1)).focus();
						return false;
					} else {
						var numLines = currRec.getLineCount({
							sublistId: 'custpage_print_label'
						});
						for (var r = 0; r < numLines; r++) {
							var scannedItem = currRec.getSublistValue({
								sublistId: 'custpage_print_label',
								fieldId: 'custpage_scan_item_barcode',
								line: r
							});
							if ((scannedItem == "" || scannedItem == null || scannedItem == undefined)) {
								document.getElementById('custpage_scan_item_barcode' + Number(r + 1)).focus();
								break;
							}
						}

					}
				}
				if (scriptContext.sublistId == 'custpage_print_label' && scriptContext.fieldId == 'custpage_print_fulfillment') {
					var lastSelectedLineIndex = currRec.getValue({
						fieldId: 'custpage_last_selected_line_index'
					});
					var currIndex = currRec.getCurrentSublistIndex({
						sublistId: 'custpage_print_label'
					});
					if (lastSelectedLineIndex != '' && lastSelectedLineIndex != undefined && lastSelectedLineIndex != null) {

						var lineNum = currRec.selectLine({
							sublistId: 'custpage_print_label',
							line: lastSelectedLineIndex
						});
						currRec.setCurrentSublistValue({
							sublistId: 'custpage_print_label',
							fieldId: 'custpage_print_fulfillment',
							value: false,
							ignoreFieldChange: true
						});
						currRec.commitLine({
							sublistId: 'custpage_print_label'
						});
						currRec.setValue({
							fieldId: 'custpage_last_selected_line_index',
							value: currIndex
						});
					} else {
						currRec.setValue({
							fieldId: 'custpage_last_selected_line_index',
							value: currIndex
						});
					}
					return true;
				}
				var fieldArray = ['custpage_item_barcode', 'custpage_carrier', 'custpage_location', 'custpage_allow_repeating', 'custpage_select_order_num', 'custpage_wave_number']
				var itemName = currRec.getValue({
					fieldId: 'custpage_item_barcode'
				});
				var carrierVal = currRec.getValue({
					fieldId: 'custpage_carrier'
				});
				var locationVal = currRec.getValue({
					fieldId: 'custpage_location'
				});
				var allowRepeating = currRec.getValue({
					fieldId: 'custpage_allow_repeating'
				});
				var selectOrderNo = currRec.getValue({
					fieldId: 'custpage_select_order_num'
				});
				var waveNumber = currRec.getValue({
					fieldId: 'custpage_wave_number'
				});
				if (fieldArray.indexOf(scriptContext.fieldId) != -1) {
					itemName = currRec.getValue({
						fieldId: 'custpage_item_barcode'
					});

					if (itemName) {
						if (waveNumber) {
							var suiteletLink = url.resolveScript({
								scriptId: 'customscript_mn_sl_print_lable_v7',
								deploymentId: 'customdeploy1'
							});
							suiteletLink += '&itemName=' + itemName;
							suiteletLink += '&carrierVal=' + carrierVal;
							suiteletLink += '&locationVal=' + locationVal;
							suiteletLink += '&allowRepeating=' + allowRepeating;
							suiteletLink += '&selectOrderNo=' + selectOrderNo;
							suiteletLink += '&waveNumber=' + waveNumber;

							// var lineCount = currRec.getLineCount({
							// 	sublistId: 'custpage_print_label'
							// });
							// if (lineCount > 0) {
							// 	var ifIdVal = currRec.getSublistValue({
							// 		sublistId: 'custpage_print_label',
							// 		fieldId: 'custpage_item_fullfilment_hiden',
							// 		line: 0
							// 	});
							// 	if (ifIdVal) {
							// 		record.submitFields({
							// 			type: "itemfulfillment",
							// 			id: ifIdVal,
							// 			values: {
							// 				custbody_open_in_print_label: false
							// 			}
							// 		});
							// 	}
							// }
							window.onbeforeunload = null;
							window.location.href = suiteletLink;
						} else {
							alert('Please also select wave number.');
						}
					}
				}
				return true;

			} catch (err) {
				console.log("Error in fieldChanged", err);
			}
		}

		function checkAndSetOpenInPrintLabel(recObj) {
			var title = " checkAndSetOpenInPrintLabel() ";
			try {
				var scannedItemsCount = 0;
				var lineCount = recObj.getLineCount({
					sublistId: 'custpage_print_label'
				});
				for (var i = 0; i < lineCount; i++) {
					var itemCode = recObj.getSublistValue({
						sublistId: 'custpage_print_label',
						fieldId: 'custpage_item_code_hidden',
						line: i
					});
					var itemUpcCode = recObj.getSublistValue({
						sublistId: 'custpage_print_label',
						fieldId: 'custpage_upc_code_hidden',
						line: i
					});
					var itemScan = recObj.getSublistValue({
						sublistId: 'custpage_print_label',
						fieldId: 'custpage_scan_item_barcode',
						line: i
					});
					if (itemScan) {
						if (itemScan == itemCode || itemScan == itemUpcCode) {
							scannedItemsCount++;
						}
					}
				}
				if (lineCount > 0) {
					var ifIdVal = recObj.getSublistValue({
						sublistId: 'custpage_print_label',
						fieldId: 'custpage_item_fullfilment_hiden',
						line: 0
					});
					if (ifIdVal) {
						if (scannedItemsCount == lineCount) {
							var updatedFulfillment = record.submitFields({
								type: "itemfulfillment",
								id: ifIdVal,
								values: {
									custbody_open_in_print_label: true
								}
							});
							console.log(title + "updatedFulfillment TRUE", updatedFulfillment);
						} else {
							var updatedFulfillment = record.submitFields({
								type: "itemfulfillment",
								id: ifIdVal,
								values: {
									custbody_open_in_print_label: false
								}
							});
							console.log(title + "updatedFulfillment FALSE", updatedFulfillment);
						}
					}
				}
			} catch (e) {
				console.error("Error in" + title, e);
			}
		}

		function skipToNext() {
			var title = " skipToNext() ";
			try {
				var currIfIdVal;
				var currRec = currentRecord.get();
				var itemName = currRec.getValue({
					fieldId: 'custpage_item_barcode'
				});
				var carrierVal = currRec.getValue({
					fieldId: 'custpage_carrier'
				});
				var locationVal = currRec.getValue({
					fieldId: 'custpage_location'
				});
				var allowRepeating = currRec.getValue({
					fieldId: 'custpage_allow_repeating'
				});
				var selectOrderNo = currRec.getValue({
					fieldId: 'custpage_select_order_num'
				});
				var waveNumber = currRec.getValue({
					fieldId: 'custpage_wave_number'
				});
				if (allowRepeating == false || allowRepeating == 'F') {
					var suiteletLink = url.resolveScript({
						scriptId: 'customscript_mn_sl_print_lable_v7',
						deploymentId: 'customdeploy1'
					});
					suiteletLink += '&itemName=' + itemName;
					suiteletLink += '&carrierVal=' + carrierVal;
					suiteletLink += '&locationVal=' + locationVal;
					suiteletLink += '&allowRepeating=' + allowRepeating;
					suiteletLink += '&selectOrderNo=' + selectOrderNo;
					suiteletLink += '&waveNumber=' + waveNumber;

					var lineCount = currRec.getLineCount({
						sublistId: 'custpage_print_label'
					});
					if (lineCount > 0) {
						currIfIdVal = currRec.getSublistValue({
							sublistId: 'custpage_print_label',
							fieldId: 'custpage_item_fullfilment_hiden',
							line: 0
						});
					}
					if (currIfIdVal) {
						var shippingMethod = getAllIntegratedShippingItem();
						var otherFulfillmentsArr = getOtherFulfillmentsArr(itemName, carrierVal, locationVal, allowRepeating, selectOrderNo, waveNumber, currIfIdVal, shippingMethod);
						console.log(title + "otherFulfillmentsArr", otherFulfillmentsArr);
						for (var i = 0; i < otherFulfillmentsArr.length; i++) {
							var ifIdVal = otherFulfillmentsArr[i];
							if (ifIdVal) {
								record.submitFields({
									type: "itemfulfillment",
									id: ifIdVal,
									values: {
										custbody_print_label_sequence: PRINT_SEQUENCE_NOT_LAST
									}
								});
							}
						}
						record.submitFields({
							type: "itemfulfillment",
							id: currIfIdVal,
							values: {
								custbody_print_label_sequence: PRINT_SEQUENCE_LAST
							}
						});
					}
					// if (currIfIdVal) {
					// 	record.submitFields({
					// 		type: "itemfulfillment",
					// 		id: currIfIdVal,
					// 		values: {
					// 			custbody_open_in_print_label: false
					// 		}
					// 	});
					// }
					window.onbeforeunload = null;
					window.location.href = suiteletLink;
				}
			} catch (e) {
				console.error("Error in" + title, e);
			}
		}

		function getOtherFulfillmentsArr(itemName, carrierVal, locationVal, allowRepeating, selectOrderNo, waveNumber, currIfIdVal, shippingMethod) {
			var title = " getOtherFulfillmentsArr() ";
			try {
				var dataArr = [];
				var filterArray = [
					["createdfrom.mainline", "is", "T"],
					"and", ["createdfrom.status", "noneof", ["SalesOrd:C", "SalesOrd:H"]],
					"and", ["createdfrom.custbody_on_hold", "is", "F"],
					"and", ["taxline", "is", "F"],
					"and", ["shipping", "is", "F"],
					"and", ["cogs", "is", "F"],
					"and", ["internalid", "noneof", [currIfIdVal]]
				];
				if (carrierVal && carrierVal != 0) {
					filterArray.push("and");
					filterArray.push(["shipcarrier", "anyof", carrierVal]);
				}
				if (shippingMethod) {
					filterArray.push("and");
					filterArray.push(["shipmethod", "anyof", shippingMethod]);
				}
				if (locationVal) {
					filterArray.push("and");
					filterArray.push(["location", "anyof", locationVal]);
				}
				if (selectOrderNo) {
					filterArray.push("and");
					filterArray.push(["createdfrom.number", "equalto", selectOrderNo]);
				}
				filterArray.push("and");
				filterArray.push(["custbody_label_printed", "is", 'F']);
				filterArray.push("and");
				filterArray.push(["custbody_open_in_print_label", "is", 'F']);
				filterArray.push("and");
				filterArray.push(["status", "anyof", "ItemShip:B"]);
				if (itemName) {
					filterArray.push("and");
					filterArray.push(["item.internalid", "anyof", itemName]);
				}
				if (waveNumber) {
					var waveOrders = getWaveTransactions(waveNumber);
					if (waveOrders.length > 0) {
						filterArray.push("and");
						filterArray.push(["createdfrom", "anyof", waveOrders]);
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
						})
					]
				});
				var searchResults = itemfulfillmentSearchObj.run().getRange({
					start: 0,
					end: 1000
				});
				for (var i = 0; i < searchResults.length; i++) {
					var fulfillmentId = searchResults[i].getValue({
						name: "internalid"
					});
					if (dataArr.indexOf(fulfillmentId) == -1) dataArr.push(fulfillmentId);
				}
				return dataArr;
			} catch (e) {
				console.error("Error in" + title, e);
			}
		}

		function getWaveTransactions(waveNumber) {
			var title = " getWaveTransactions ";
			try {
				var waveOrders = [];
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
					if (waveOrders.indexOf(waveOrder) == -1) waveOrders.push(waveOrder);
				}
				return waveOrders;
			} catch (err) {
				log.error("Error in" + title, err);
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
				console.log("integratedShippingItemArray -->getAllShippingItem", integratedShippingItemArray);

				return integratedShippingItemArray;

			} catch (err) {
				log.error("Error in getAllShippingItem", err);
			}
		}
		return {
			fieldChanged: fieldChanged,
			printLabel: printLabel,
			resetButton: resetButton,
			pageInit: pageInit,
			skipToNext: skipToNext
		};
	});