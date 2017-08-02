/** https://raw.githubusercontent.com/aedile/nightwatch-analytics/master/tests/assertions/hasRequest.js
 * Custom assertion to test if an analytics request has been made.  Follows
 * the same pattern used for manual testing - define a filter to find the
 * appropriate request and then check to make sure that the parameters
 * are set properly.  Returns true if ANY request matches criteria.
 * @param filter - A string to filter against URL requests for the page.
 * @param params - An object of parameters to match against the request.
 */
var urlParser = require('url');
exports.assertion = function (filter, params) {
	/**
	 * The message which will be used in the test output and
	 * inside the XML reports
	 * @type {string}
	 */
	this.message = "Checking for request with params " + JSON.stringify(params);

	/**
	 * A value to perform the assertion on. If a function is
	 * defined, its result will be used.
	 * @type {function|*}
	 */
	this.expected = (function () {
		if (typeof params === 'undefined') {
			return "a request matching '" + filter + "' exists";
		} else {
			return "a request matching '" + filter + "' with params " + JSON.stringify(params) + " exists";
		}
	})();

	this.isValid = function (str) {
		return (str != 'no matching records' && str.indexOf('Param Found to be wrong:') != 0);
	};
	/**
	 * Pass message handler.
	 * @param result
	 */
	this.pass = function (result) {
		console.log('FOUND IN:');
		console.log(result);
		return this.isValid(result);// result != 'no matching records' && result.indexOf('Param Found to be wrong:') != 0;
	};

	/**
	 * Process result of command and return a value to the pass function.
	 * @param result The value returned from the command function.
	 * @returns {string} the first matching record or 'no matching records'
	 */
	this.value = function (result) {
		var answer = result.value.map(this.findInResult).reduce(function (answer, current) {
			var isValid = function (str) {//todo DRY it out
				return (str != 'no matching records' && str.indexOf('Param Found to be wrong:') != 0);
			};
			if (isValid(answer)) {
				return answer;
			} else if (!isValid(answer)) {
				if (isValid(current)) {
					return current;
				} else if (current.indexOf('Param Found to be wrong:') != 0) {
					return current;//this will over-write
				}
			}

			return answer;
		}, 'no matching records');
		//No record found
		return answer;
	};
	/**
	 * 
	 * @param {type} record
	 * @return {String} 
	 */
	this.findInResult = function (record) {

		var urlObject = urlParser.parse(record.name, true);
		if (urlObject.href.indexOf(filter) >= 0) {
//			console.log('\n------record ------');
//			console.log(record.name);
			var passed = false;
			// Check all params exist and match what's in the url.
			for (var key in params) {
				// Param exists.
				if (key in urlObject.query) {
					//todo rewrite the logic here to be more clear

					// If they don't match, this is not our record, break out of loop.
					if (urlObject.query[key].length > 0 && params[key] == '*') {
						passed = true;
						break;
					} else if (urlObject.query[key].length > 0 && params[key].indexOf('*') >= 0) {
						var haystack = urlObject.query[key].toUpperCase();
						var needle = params[key].split('*').join('').toUpperCase();
						if (haystack.indexOf(needle) >= 0) {  //remove * and see if string is in the haystack
							//for now, if it has wildcard, but has length more that one, then do a LIKE '%phrase%' style search
							passed = true;
							break;
						}
					} else if (urlObject.query[key] != params[key]) {
						return 'Param Found to be wrong: "' + urlObject.query[key] + '" != "' + params[key] + '"';

					} else if (urlObject.query[key] == params[key]) {
						passed = true;
						break;
					}
				}
				// Param doesn't exist, this is not our record, break out of loop.
				else {
					passed = false;
					break;
				}
			}
			if (passed) {
				return record.name;
			}
		}

		//No record found
		return 'no matching records';
	};

	/**
	 * Performs a protocol command/action and its result is
	 * passed to the value method via the callback argument.
	 * @type {function}
	 */
	this.command = function (callback) {
		this.api.getRequests(callback);
		return this;
	};

};