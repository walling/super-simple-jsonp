/*

LICENSE

Permission is granted to use, modify, and / or redistribute at will.

This includes removing authorship notices, re-use of code parts in other
software (with or without giving credit), and / or creating a commercial
product based on it.

This permission is not revocable by the author.

This software is provided as-is. Use it at your own risk. There is no warranty
whatsoever, neither expressed nor implied, and by using this software you
accept that the author(s) shall not be held liable for any loss of data, loss
of service, or other damages, be they incidental or consequential. Your only
option other than accepting this is not to use the software at all.

*/



var counter = 0; // Used to generate unique callback names.
var global_name = 'jsonp'; // Name of global hash map storing callbacks.
var global_map;
var noop = function() {};

/**
 * Load data using JSONP request. This performs a GET HTTP request for the
 * given url and invokes callback with the data. The callback always recieves
 * the arguments: err, data. An optional timeout before failing can be
 * specified. Default is 5 seconds. An optional strict mode can be enabled,
 * where more error handling is done on the JSONP result, ie. `null` and
 * `{"error":"Msg"}` are interpreted as errors. Strict mode is default off.
 *
 * Example:
 *
 *     var cancel_flickr = jsonp('http://api.flickr.com/services/feeds' +
 *                               '/photos_public.gne?tags=cat&tagmode=any' +
 *                               '&format=json&jsoncallback=?',
 *                               {timeout: 2000, strict: true},
 *                               function(err, flickr) {
 *       if (err) {
 *         console.log('Error (' + err + '): Could not find cat pictures.');
 *         return;
 *       }
 *       console.log('Found ' + flickr.items.length + ' cat pictures!');
 *       // Do something with flickr.items
 *     });
 *     
 *     // Maybe you want to cancel the request to find cat pictures on Flickr:
 *     cancel_flickr();
 */
module.exports = function(url, options, callback) {
	// Options are optional.
	if (callback === undefined) {
		callback = options;
	}
	callback = callback || noop;

	// Default timeout is 5 seconds.
	var timeout = (options.timeout || 5000) | 0;
	if (timeout < 1) timeout = 1;
	var failure_timer;

	// Reference to hash map or this function storing callbacks.
	if (!global_map) {
		global_map = window[global_name] = window[global_name] || {};
	}

	// Create unique and difficult to guess names for callbacks.
	counter++;
	var randomness = (Math.random() + '0000000000').substr(2, 10);
	var callback_name = 'request' + counter + randomness;

	// Create JSONP script element to inject.
	var script_element = document.createElement('script');
	script_element.type = 'text/javascript';
	script_element.async = true;
	script_element.src = url.replace('=?', '=' + global_name + '.' + callback_name);

	// Funktion to invoke callback with result and cleanup.
	var result = function(data) {
		result = noop; // The result must only be provided once.

		// Cleanup after both success or failure.
		clearTimeout(failure_timer);
		delete global_map[callback_name];
		script_element.onreadystatechange = undefined;
		script_element.onerror = undefined;
		script_element.parentNode.removeChild(script_element);
		script_element = undefined; // So MSIE does not leak memory.

		// Invoke callback with either error or actual data.
		if (data === undefined || (data === null && options.strict)) {
			callback(new Error('JSONP Request Failed for ' + url));
		} else if (data.error !== undefined && options.strict) {
			callback(new Error('' + data.error)); // Error response in strict mode.
		} else {
			callback(undefined, data);
		}
	};
	var failure = function() {
		result(undefined);
	};

	// Callback for success that recieves data by the injected script.
	global_map[callback_name] = result;

	// Setup timer for failure. When it triggers, we assume the request failed.
	var failure_timer = setTimeout(failure, timeout);

	// Fail faster if we know that the script is supposed to be executed.
	script_element.onreadystatechange = function() {
		if (this.readyState === 'loaded' || this.readyState === 'complete') {
			failure();
		}
	};
	script_element.onerror = failure;

	// Inject script element, which in turn creates the JSONP request.
	document.body.appendChild(script_element);

	// Return function that cancels this JSONP request.
	return function() {
		callback = noop; // Disable callback on cancel.
		result(0);
	};
};
