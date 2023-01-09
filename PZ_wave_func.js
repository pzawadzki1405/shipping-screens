/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
var PRINT_SEQUENCE_NOT_LAST = "1";
var PRINT_SEQUENCE_LAST = "2";

var LOCKED_NONE = "1";
var LOCKED_WRONG = "2";
var LOCKED_CORRECT = "3";

define(['N/url', 'N/currentRecord', 'N/record', 'N/search', 'N/https', 'N/ui/dialog'],
	function(url, currentRecord, record, search, https, dialog) {

		function createWave(){

			try{

			}
			catch(err){
				log.error("Error in createWave", err);
			}

		}

		function updateWave(){

			try{

			}
			catch(err){
				log.error("Error in createWave", err);
			}


		}

		function pageInit(scriptContext) {}


		return {
			createWave: createWave,
			updateWave: updateWave,
			pageInit: pageInit
		};
	});
