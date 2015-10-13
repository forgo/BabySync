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

module.exports = function Public(admin, adminLogin, user, userLogin, family, parent) {

	var Router = require('koa-router');

	var Public = new Router();

	// admin login
	Public.post('/auth/admin', adminLogin.post);

	// user signup and login
	Public.post('/user', user.post);
	Public.post('/auth/user', userLogin.post);

	// Family REST Operations
    // Geocache routes
    Public.post('/family', family.post);
    Public.get('/family', family.get);
    Public.get('/family/:id', family.get);
    Public.put('/family', family.put);
    Public.put('/family/:id', family.put);
    Public.del('/family', family.del);
    Public.del('/family/:id', family.del);

    Public.post('/parent', parent.post);
    Public.get('/parent', parent.get);
    Public.get('/parent/:id', parent.get);
    Public.put('/parent', parent.put);
    Public.put('/parent/:id', parent.put);
    Public.del('/parent', parent.del);
    Public.del('/parent/:id', parent.del);

	return Public;
};