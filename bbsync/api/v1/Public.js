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

module.exports = function Public(babySync) {

	var Router = require('koa-router');

	var Public = new Router();

    Public.post('/user', babySync.user.post);
    Public.get('/user', babySync.user.get);
    Public.get('/user/:id', babySync.user.get);
    Public.put('/user', babySync.user.put);
    Public.put('/user/:id', babySync.user.put);
    Public.del('/user', babySync.user.del);
    Public.del('/user/:id', babySync.user.del);

    // ---------------------------
	// BabySync Service Operations
    // ---------------------------
    Public.post('/parent', babySync.createFamily);
    Public.post('/parent/auth', babySync.user.login);

    // After this point should expect token
    // TODO: move these operations to the private section
    Public.get('/parent/find/:id', babySync.findParent);

    Public.put('/parent/join/:id', babySync.joinFamily);
    Public.put('/parent/merge/:id', babySync.mergeFamily);
    Public.put('/parent/detach/:id', babySync.detachFamily);

    Public.post('/activity/:id', babySync.createActivity);
    Public.del('/activity/:id', babySync.deleteActivity);

    Public.post('/baby/:id', babySync.createBaby);
    Public.del('/baby/:id', babySync.deleteBaby);

    Public.post('/timer/:id', babySync.createTimer);
    Public.del('/timer/:id', babySync.deleteTimer);

	return Public;
};