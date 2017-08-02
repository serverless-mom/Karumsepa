module.exports = {
	'email service': function (client) {
		client
				.url('http://127.0.0.1:8089/test/email') 
				.waitForElementVisible('div', 2000)
				.assert.containsText('div', 'good')
				.end();
	}
};