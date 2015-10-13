// The MIT License (MIT)

// Copyright (c) 2015 Elliott Richerson

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in 
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

var http = require('http');
var https = require('https');
var fs = require('fs');

var V1 = module.exports = require('./v1/V1.js')();

function SSLOptions(activeSSL) {
	if (activeSSL) {
		return {
		    key: fs.readFileSync('v1/auth/ssl/server.key', 'utf8'),
		    cert: fs.readFileSync('v1/auth/ssl/server.crt', 'utf8')
		}
	}
}

function startServer(app, sslOptions) {
	if (sslOptions) {
		return https.createServer(sslOptions, app);
	}
	else {
		return http.createServer(app);
	}
}

var SSLOptionsV1 = {
    key: fs.readFileSync('v1/auth/ssl/digeocache-key.pem', 'utf8'),
    cert: fs.readFileSync('v1/auth/ssl/digeocache.crt', 'utf8')
}

var port = process.env.PORT || 8111;
var env = process.env.NODE_ENV || 'development';

if (!module.parent) {
    console.log("\n--- Starting App on Port ", port, "---");
    var sslOptions = SSLOptions(false);
    startServer(V1.callback(), sslOptions).listen(port);
    // https.createServer(SSLOptionsV1, V1.callback()).listen(port);
} else {
    console.log("\n--- Starting App for Testing ---");
}