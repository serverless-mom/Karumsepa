/* 
 * test pushing stuff to feathersjs
 * this is just for testing porposes
 */

	process.exit();

var fs = require('fs');
var strDoc = fs.readFileSync('/var/www/funnelenvy/nightwatch/reports/es_1501076306753.json', "utf8");
var doc = JSON.parse(strDoc);
//console.log(JSON.stringify(doc));
var request = require('request');
request.post('http://localhost:3030/hpe/', {form: doc}, function (error, response, body) {
	if (!error && response.statusCode === 200) {
		console.log(body);
	} else {
		console.log(error);
	}
	process.exit();
});