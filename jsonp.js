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



/**
 * Load data using JSONP request. This performs a GET HTTP request for the
 * given url and invokes callback with the data. The callback always recieves
 * the arguments: err, data. An optional timeout before failing can be
 * specified. Default is 5 seconds. Example:
 *
 *     jsonp('http://api.flickr.com/services/feeds/photos_public.gne?tags=cat' +
 *           '&tagmode=any&format=json&jsoncallback=?', function(err, flickr) {
 *       if (err) {
 *         console.log('Error (' + err + '): Could not find cat pictures.');
 *         return;
 *       }
 *       console.log('Found ' + flickr.items.length + ' cat pictures!');
 *       // Do something with flickr.items
 *     }, 2000);
 */
window.jsonp = (function() {
	var counter = 0; // Used to generate unique callback names.
	var global_name = 'jsonp'; // Name of global hash map storing callbacks.
	var global_map;

	return function(url, callback, timeout) {
		// Default timeout is 5 seconds.
		timeout = (timeout || 5000) | 0;
		if (timeout < 1) timeout = 1;
		var timeout_id;

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

		// Function to cleanup after both success or failure.
		var cleanup = function() {
			clearTimeout(timeout_id);
			delete global_map[callback_name];
			document.body.removeChild(script_element);
		};

		// Callback for success that recieves data by the injected script.
		global_map[callback_name] = function(data) {
			cleanup();
			callback(undefined, data);
		};

		// Setup timer for failure. When it triggers, we assume the request failed.
		var timeout_id = setTimeout(function() {
			cleanup();
			callback(new Error('JSONP Request Failed for ' + url));
		}, timeout);

		// Inject script element, which in turn creates the JSONP request.
		document.body.appendChild(script_element);
	};
}());
