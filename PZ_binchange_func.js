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



				var currRec = currentRecord.get();
				var numLines = currRec.getLineCount({
					sublistId: 'custpage_binlist'
				});


			 for (var i = 0; i < numLines; i++) {
				 var bin_id = currRec.getSublistValue({
					 sublistId: 'custpage_binlist',
					 fieldId: 'custpage_binlist_id',
					 line: i
				 });
				 var bin_zone = currRec.getSublistValue({
					 sublistId: 'custpage_binlist',
					 fieldId: 'custpage_binlist_newzone',
					 line: i
				 });

				 var binRecord= record.load({
					 type: record.Type.BIN,
					 id: bin_id,
					 isDynamic: true,
				 });

				 binRecord.setText({
					 fieldId: 'zone',
					 text: bin_zone,
				 });

				 var id = binRecord.save();
				 console.log("done bin "+i);
				 //alert("bin changed \n"+id);
				}
				alert("DONE!!!");




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
