var chromedriver = require('chromedriver');
var path = require('path');
var driverInstanceCI;

function isRunningInCI() {
  return this.test_settings.globals.integration;
}

function startChromeDriver() {
  if (isRunningInCI.call(this)) {
    var location = path.join(__dirname, '../bin/chromedriver');
    driverInstanceCI = require('child_process').execFile(location, []);
    return;
  }

  chromedriver.start();
}

function stopChromeDriver() {
  if (isRunningInCI.call(this)) {
    driverInstanceCI && driverInstanceCI.kill();
    return;
  }

  chromedriver.stop();
}



module.exports = {
  abortOnAssertionFailure: false,
  reporter: function(results, cb) {
    console.log('::::::::::::::::::::results:::::::::::::::::::::::::');
    //console.log(results);
    //	console.log(JSON.stringify(results));

    //		//tmpfor debug
    //		var fs = require('fs');
    //		fs.writeFileSync('./reports/lastrun_'+(new Date).getTime()+'.json',JSON.stringify(results));


    var request = require('request');
    //		request.post('http://app.pol-wp/echo.php', {form: {data: results}}, function (error, response, body) {
    request.post('http://127.0.0.1:8089/test/email', {
      form: {
        data: JSON.stringify(results)
      }
    }, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        console.log(body);
      } else {
        console.log(error);
      }
      cb();
    });

    console.log('::::::::::::::::::::results:::::::::::::::::::::::::');

  },

  'ci-server': {
    integration: true
  },

  before: function(done) {
    startChromeDriver.call(this);

    done();
  },

  after: function(done) {
    stopChromeDriver.call(this);

    done();
  }

};
