Super Simple JSONP
==================

This is a super simple implementation of JSONP in client-side JavaScript, which
handles errors in an elegant way. Read the below license, which is the closest
I get to releasing this software in the public domain.

The file `jsonp.js` contains the implementation. You can minify it if you want.

The file `jsonp-usage-example.html` is just an example how to use it to query
Flickr for cat pictures with a timeout of 2 seconds.

Happy hacking!

— [Bjarke Walling](https://twitter.com/walling)


Install
-------

Install it with Mud:

    npm install -g mud        # If you haven't already! :-)
    mud install jsonp         # Install this JavaScript module
    mud server                # Run local server, which enables development

Read more about Mud package manager at <http://mudhub.org/>.


Usage
-----

Look in the inline documentation or the example to see how you use it. For
local development, just start `mud server` and in your HTML:

    <script src="http://mudhub.org/dev"></script>
    <script>
      var jsonp = require('jsonp');
      // use it here
    </script>

To deploy, use `mud inline your.html` or to just minify the module:

    mud modules jsonp --global --compile > jsonp.min.js

You can also use --compile-advanced for more aggressive optimizations (which I
did not test yet). The minifier is Closure. Read more at the
[Mud website](http://mudhub.org/).


Error handling
--------------

If the connection fails or the URL does not exists, the request will fail with
a generic JSONP Request Failed message. This is also the case if the result is
null, undefined or the internal JSONP callback was called without any
arguments. The webservice can signal errors using `{"error":"Total Failure"}`.


License
-------

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
