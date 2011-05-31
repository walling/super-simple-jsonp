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
	var head;

	return function(url, callback, timeout) {
		// Default timeout is 5 seconds.
		timeout = (timeout || 5000) | 0;
		if (timeout < 1) timeout = 1;

		// Reference to HTML head element.
		if (!head) {
			head = document.getElementsByTagName('head')[0];
		}

		// Create unique and difficult to guess names for callbacks.
		counter++;
		var callback_success = 'jsonp_' + counter +
			(Math.random() + '0000000000').substr(2, 10);
		var callback_failure = callback_success + '_failure';

		// Setup timer for failure. When it triggers, we assume the request failed.
		var timeout_id = setTimeout('window.' + callback_failure + '()', timeout);

		// Create JSONP script element to inject.
		var script_element = document.createElement('script');
		script_element.type = 'text/javascript';
		script_element.async = true;
		script_element.src = url.replace('=?', '=' + callback_success);

		// Function to cleanup after both success or failure.
		var cleanup = function() {
			clearTimeout(timeout_id);
			head.removeChild(script_element);
			window[callback_success] = undefined;
			window[callback_failure] = undefined;
			try {
				delete window[callback_success];
				delete window[callback_failure];
			} catch (e) {}
		};

		// Callback for success; recieves data by JSONP.
		window[callback_success] = function(data) {
			cleanup();
			callback(undefined, data);
		};

		// Callback for failure; called by timer.
		window[callback_failure] = function() {
			cleanup();
			callback(new Error('JSONP Request Failed for <' + url + '>'));
		};

		// Inject script element, which in turn creates the HTTP request.
		head.appendChild(script_element);
	};
}());
