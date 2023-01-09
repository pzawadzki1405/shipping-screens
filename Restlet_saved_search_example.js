/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */
define(['N/search','N/record'],

function(search,record) {

		/**
		 * Function called upon sending a GET request to the RESTlet.
		 *
		 * @param {Object} requestParams - Parameters from HTTP request URL; parameters will be passed into function as an Object (for all supported content types)
		 * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
		 * @since 2015.1
		 */
		function doGet(requestParams) {

				var results = [];
				var slice = [];
				var i = 0;

				var mySearch = search.load({
						id: 'customsearch12345' // change to the ID of your saved search
				});

				var resultSet = mySearch.run();

				do {
						slice = resultSet.getRange({ start: i, end: i + 1000 });
						slice.forEach(function(row) {
								var resultObj = {};
								row.columns.forEach(function(column) {
										resultObj[column.name] = row.getValue(column);
										});
								results.push(resultObj);
								i++;
						});
				} while (slice.length >= 1000);

				return JSON.stringify(results);
		}

		return {
				'get': doGet,
		};

});
