/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */


define(['N/url', 'N/currentRecord', 'N/record', 'N/search', 'N/https', 'N/ui/dialog'],
	function(url, currentRecord, record, search, https, dialog) {

		function transferStaging(){


			log.debug("Enter button method");
			try{

				//subs 2 to USA
				var subsidiaryId = 2;
		    var locationId = 3;
				var accountId = 58;
		    //var itemId = 1215;
		    //var binNumber = 7648;

		    // var transferStaging = nlapiCreateRecord('bintransfer', {recordmode: 'dynamic'});
		    // transferStaging.setFieldValue('location', locationId);
				// var date = new Date();
				// transferStaging.setFieldValue('trandate', date);
				// //var numLines = 1;
		    // 	transferStaging.selectNewLineItem('inventory');
		    // 	transferStaging.setCurrentLineItemValue('inventory', 'item', 3549);
		    // 	transferStaging.setCurrentLineItemValue('inventory', 'quantity', 5);
				// 	var transferInventoryDetail = transferStaging.createSubrecord('inventorydetail');
				// 	transferInventoryDetail.selectNewLineItem('inventoryassignment');
				// 	transferInventoryDetail.setCurrentLineItemValue('inventoryassignment', 'binnumber', 8139);
				// 	transferInventoryDetail.setCurrentLineItemValue('inventoryassignment', 'tobinnumber', 5605);
				// 	transferInventoryDetail.setCurrentLineItemValue('inventoryassignment', 'quantity', 5);
				// 	transferInventoryDetail.commitLineItem('inventoryassignment');
				// 	transferInventoryDetail.commit();
				//
		    // 	transferStaging.commitLineItem('inventory');
				//
				// 	var recordId = nlapiSubmitRecord(transferStaging);
		    //  //var recordId = transferStaging.save();

				var currRec = currentRecord.get();
				var numLines = currRec.getLineCount({
					sublistId: 'custpage_staginglist'
				});

				var transferStaging = record.create({
				                type: record.Type.BIN_TRANSFER,
				                isDynamic: true
				        });

				        // Set body fields on the purchase order.
				        transferStaging.setValue({
				            fieldId: 'location',
				            value: locationId
				        });
								var date = new Date();
				        transferStaging.setValue({
				            fieldId: 'trandate',
				            value: date
				        });
			 for (var i = 0; i < numLines; i++) {

				        // Create one line in the item sublist.
				        transferStaging.selectNewLine({
				            sublistId: 'inventory'
				        });

								var itemId = currRec.getSublistValue({
									sublistId: 'custpage_staginglist',
									fieldId: 'custpage_staginglist_item_id',
									line: i
								});

				        transferStaging.setCurrentSublistValue({
				            sublistId: 'inventory',
				            fieldId: 'item',
				            value: itemId
				        });

								var itemQuantity = currRec.getSublistValue({
									sublistId: 'custpage_staginglist',
									fieldId: 'custpage_staginglist_available',
									line: i
								});

				        transferStaging.setCurrentSublistValue({
				            sublistId: 'inventory',
				            fieldId: 'quantity',
				            value: itemQuantity
				        });

				        // Create the subrecord for that line.
				        var transferInventoryDetail = transferStaging.getCurrentSublistSubrecord({
				            sublistId: 'inventory',
				            fieldId: 'inventorydetail'
				        });

				        // Add a line to the subrecord's inventory assignment sublist.
				        transferInventoryDetail.selectNewLine({
				            sublistId: 'inventoryassignment'
				        });

				        transferInventoryDetail.setCurrentSublistValue({
				            sublistId: 'inventoryassignment',
				            fieldId: 'quantity',
				            value: itemQuantity
				        });

				        transferInventoryDetail.setCurrentSublistText({
				            sublistId: 'inventoryassignment',
				            fieldId: 'binnumber',
				            text: 'Staging Bin'
				        });
								var itemBin = currRec.getSublistValue({
									sublistId: 'custpage_staginglist',
									fieldId: 'custpage_staginglist_bin',
									line: i
								});
								transferInventoryDetail.setCurrentSublistText({
				            sublistId: 'inventoryassignment',
				            fieldId: 'tobinnumber',
				            text: itemBin
				        });

				        // Save the line in the subrecord's sublist.
				        transferInventoryDetail.commitLine({
				            sublistId: 'inventoryassignment'
				        });

				        // Save the line in the record's sublist
				        transferStaging.commitLine({
				            sublistId: 'inventory'
				        });
				}
				        // Save the record.
				        try {
				            var recId = transferStaging.save();
				            log.debug({
				                title: 'Record created successfully',
				                details: 'Id: ' + recId
				            });
				        } catch (e) {
				            log.error({
				                title: e.name,
				                details: e.message
				            });
				        }


		    log.debug({
		        title: 'Item transfered: ' + transferStaging
		    });
				alert("Item transfered: ", transferStaging);
			}
			catch(err){
				log.error("Error in transferStaging", err);
			}

		}

		function pageInit(scriptContext) {}


		return {
			transferStaging: transferStaging,
			pageInit: pageInit
		};
	});
