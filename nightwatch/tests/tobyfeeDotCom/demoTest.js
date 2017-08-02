// nightwatch --test tests/tobyfeeDotCom/demoTest.js

module.exports = {
	'Example Test, do not run me for serious': function(browser) {
		browser
			.url('http://tobyfee.com')
			.assert.containsText('#main', 'Night Watch')
			.end();
	}
};
