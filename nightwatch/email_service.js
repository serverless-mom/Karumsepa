// node email_service.js 
const http = require('http');

const hostname = '127.0.0.1';
const port = 8089;

var emailRules = {//todo put in seperate JSON file to be reloaded by email_service.js when it changes
	'default': {'on_fail': 'jjw303@gmail.com'},
	'hpe/accessories_carousel': {'on_fail': ['jjw303@gmail.com', 'test@test.com'],
		'on_fail_description': 'Log in and Look for at least 4 Add To Cart Icons.'},
	'hpe/b2b_search': {'on_fail': ['jjw303@gmail.com', 'test@test.com'], 'on_fail_description': " Log into b2b.hpe.com and cofirm that a search for '831064-S01' shows 'HPE ProLiant ML30 Gen9 tower server with one Intel Xeon E3-1220 v5 processor' and has an Add to Cart Icon"},
	'hpe/demo_petrox': {'on_fail': ['jjw303@gmail.com', 'test@test.com']},
	'hpe/elite_product_comparison': {'on_fail': ['jjw303@gmail.com', 'test@test.com'],
		'on_fail_description': 'Log into b2b.hpe.com and firm that checkboxes show for compairing products. Looks for .fe_compairText'},
	'hpe/itg_marketplace_ph2_prelaunch_changes': {'on_fail': ['jjw303@gmail.com', 'test@test.com'],
		'on_fail_description': 'Phone number displayed in ".partner_content" is 1-800-700-1000.'},
	'hpe/itg_marketplace_quickspecs': {'on_fail': ['jjw303@gmail.com', 'test@test.com'],
		'on_fail_description': 'Look at a product page, find the #QuickSpecsIFramePDf DOM item and check if it is an embeded PDF.'},
	'hpe/itg_marketplace_server_titles': {'on_fail': ['jjw303@gmail.com', 'test@test.com'],
		'on_fail_description': "Server title does not contain '290W'."},
	'hpe/itg_search': {'on_fail': ['jjw303@gmail.com', 'test@test.com'],
		'on_fail_description': 'Log into itg.b2b.hpe.com and search for 727021-B21 and look for "HP ProLiant BL460c Gen9 E5-v3" in the results.'},
	'hpe/search_funcion': {'on_fail': ['jjw303@gmail.com', 'test@test.com'],
		'on_fail_description': " GoTo b2b.hpe.com, Log in. Confirm the title of the page is PETROX, then search for router. Results should include 'U3JK0E'."}
};

/**
 * merge in any extra data needed like `on_fail_description` and `created`
 * @param object doc
 * @return object
 */
var annotateResults = function (doc) {
	doc.created = new Date();
	doc.errmessages= [];//strange that this is outputting a string
	for (var property in doc.modules) {
		if (doc.modules.hasOwnProperty(property)) {
			if (typeof emailRules[property] != 'undefined' && typeof emailRules[property].on_fail_description != 'undefined') {
			//	console.log("FOUND IT:" + emailRules[property].on_fail_description);
				doc.modules[property]['on_fail_description'] = emailRules[property].on_fail_description;
				doc.modules[property]['errmessages'] = [];
			}
		}
	}

	return doc;
};

/**
 * call the featherjs server to add the test run to the database.
 * We do it this way so that we can instantly notify anyone viewing the dashbaord
 * @param object data
 * @param function done callback
 */
var insertTest = function (data, done) {
	var doc = annotateResults(data);
	
		//tmpfor debug
		var fs = require('fs');
		fs.writeFileSync('./reports/es_'+(new Date).getTime()+'.json',JSON.stringify(doc));
	//console.log(JSON.stringify(doc));
	var request = require('request');
//		request.post('http://localhost:3030/hpe/', {form: {data: doc}}, function (error, response, body) {
	request.post('http://localhost:3030/hpe/', {form: doc}, function (error, response, body) {
		if (!error && response.statusCode === 200) {
			console.log(body);
		} else {
			console.log(error);
		}
		done();
	});

};
var onTestPost = function (req, res) {
	var qs = require('querystring');
	var body = '';
	req.on('data', function (data) {
		body += data;
		// Too much POST data, kill the connection!
		// 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
		if (body.length > 1e7)
			req.connection.destroy();
	});

	req.on('end', function () {
		if (body.length > 12) {
			var post = qs.parse(body);
			//   post['data'] 
			insertTest(JSON.parse(post.data), function () {
				res.end('<html><body><div>good</div></body></html>');
			});
			console.log(JSON.parse(post.data));
		} else {
			res.end('<html><body><div>empty</div></body></html>');
		}
	});

};

/**
 * @depricated
 * @param {type} res
 * @return {Function}
 */
var renderDashboard = function (res) {
	return function (err, data) {
		if (err) {
			return console.log(err);
		}
		var view = {
			title: "Dashboard of tests"
		};
		var out = require('mustache').render(data, view);
		console.log(out);
		res.end(out);
	};
};

const server = http.createServer((req, res) => {
	var url = require('url');
	var pathName = url.parse(req.url).pathname;

	res.statusCode = 200;

	console.log('pathName:' + pathName);
	var url = require('url');
	var pathName = url.parse(req.url).pathname;
//poormans router
	if (pathName == '/test/email') {
		onTestPost(req, res);

	} else { //if (pathName != '/') {
		res.setHeader('Content-Type', 'text/plain');
		return res.end('' + pathName);
		//} else {


	}

});

server.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`);
});

