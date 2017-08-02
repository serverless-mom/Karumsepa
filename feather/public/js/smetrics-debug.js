/* 
 * create on-screen debug console that we can SEE what is going on
 * also, nigthwatch can create listeners to easily wait until events have occured
 * 
 * Usage:
 *		- can include w/ a script tag at the footer of the page 
 *		- copy and paste into F-12 console w/ AnalyticLogger.isVisible = 1
 *		- inject w/ test framework after the body has loaded
 */


//if we copy/paste or inject multiple times
if (typeof AnalyticLogger != 'undefined' && typeof AnalyticLogger.interval != 'undefined')
		clearTimeout(AnalyticLogger.interval);

var AnalyticLogger = function ( ) {};
AnalyticLogger.frameId = 'AnalyticLoggerFrame';
AnalyticLogger.filter = '//smetrics.hpe.com';
AnalyticLogger.cssDiv = 'AnalyticLoggerFrameCss';
AnalyticLogger.intervalMiliSec = 2000;
AnalyticLogger.watchVars = ['events', 'products', 'v1', 'v8', 'c8', 'v34', 'v93', 'v95', 'c13', 'c50', 'cc'];
AnalyticLogger.countEvents = 0;
AnalyticLogger.isVisible = 1;
	AnalyticLogger.interval = null;

/**
 * turn a string into an object for ONLY the vars on the watchVars list
 * @param string url
 * @return object
 */
AnalyticLogger.parseUrl = function (url) {
	var out = {};
	var queries = url.replace(/^\?/, '').split('&');
	for (var i = 0; i < queries.length; i++) {
		split = queries[i].split('=');
		if (AnalyticLogger.watchVars.indexOf(split[0]) >= 0)
			out[split[0]] = split[1];
	}
	return out;
};
/**
 * format the vars if they are not empty
 * each has a class of var-{NAME}
 * @param object 
 * @return string
 */
AnalyticLogger.formatVars = function (vars) {
	return AnalyticLogger.watchVars.map(function (itm) {
		var out = '';
		if (typeof vars[itm] != 'undefined' && vars[itm].length > 0)
			out = '<span class="var-' + itm + '"><b>' + itm + '</b>: ' + decodeURIComponent((vars[itm] + '').replace(/\+/g, '%20')) + '</span>';
		return out;
	}).join(' ');
};
/**
 * add the event to the box
 * @param {object} urlObject 
 */
AnalyticLogger.onNewEvent = function (urlObject) {

	if (typeof urlObject != 'undefined' && typeof urlObject.name != 'undefined' && urlObject.name.indexOf(AnalyticLogger.filter) >= 0) {
		//console.log(urlObject.name);
		var vars = AnalyticLogger.parseUrl(urlObject.name);
		//console.log(vars);
		var strFormattedVars = vars.length < 1 ? urlObject.name : AnalyticLogger.formatVars(vars);
		$('#' + AnalyticLogger.frameId).prepend($('<div class="analytics-Event"> </div>').append($(strFormattedVars)));
	}
};
AnalyticLogger.watchForChange = function () {
	var allEvents = window.performance.getEntries();
		console.log('allEvents:' + allEvents.length+'  ~'+AnalyticLogger.intervalMiliSec);

	if (allEvents.length > AnalyticLogger.countEvents) {
		//loop the events that we've not yet seen
		for (var i = AnalyticLogger.countEvents - 1; i < allEvents.length; i++) {
			AnalyticLogger.onNewEvent(allEvents[i]);
		}
		AnalyticLogger.countEvents = allEvents.length;
		console.log('AnalyticLogger.countEvents:' + AnalyticLogger.countEvents);

	}
	AnalyticLogger.interval = setTimeout(AnalyticLogger.watchForChange, AnalyticLogger.intervalMiliSec);
};


AnalyticLogger.init = function () {
	if (AnalyticLogger.interval != null)
		clearTimeout(AnalyticLogger.interval);

	$('#' + AnalyticLogger.frameId).remove();
	$('#' + AnalyticLogger.cssDiv).remove();
	var $frame = $('<div id="' + AnalyticLogger.frameId + '"' + (AnalyticLogger.isVisible ? '' : ' style="display:none;"') + '>&nbsp;</div>');
	var $cssDiv = $('<div id="' + AnalyticLogger.cssDiv + '"><style>' +
			"#" + AnalyticLogger.frameId + "{border:2px solid brown;width:650px;height:70px;overflow:scroll;" +
			"position:absolute;top:2px;left:2px;z-index:99999;font-size:14pt;" +
			"background-color:rgba(255,255,255,0.85);padding:5px;}" +
			"#" + AnalyticLogger.frameId + ":hover{ height:500px; }" +
			"#" + AnalyticLogger.frameId + " .analytics-Event{border-top:1px solid brown;}" +
			"#" + AnalyticLogger.frameId + " .analytics-Event span{display:inline-block;min-width:200px;}" +
			"</style></div>");

	$('body').append($frame);
	if (AnalyticLogger.isVisible)
		$('body').append($cssDiv);
	AnalyticLogger.interval =
			setTimeout(AnalyticLogger.watchForChange, AnalyticLogger.intervalMiliSec);
	//(JSON.stringify(	 ));
};

//make it all happen w/
AnalyticLogger.init();

