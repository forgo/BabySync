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

module.exports = function RESTNew(typeKey, label, alias, schema, utility) {

    var errors = utility.errors;
    var validate = utility.validate;
    var response = utility.response;
    var db = utility.db;

    var RESTType = require('./RESTType.js');
    var type = new RESTType(typeKey);

    var POST = require('./POST.js');
    var GET = require('./GET.js');
    var PUT = require('./PUT.js');
    var DEL = require('./DEL.js');
    var post = new POST(type, label, alias, schema, utility);
    var get = new GET(type, label, alias, schema, utility);
    var put = new PUT(type, label, alias, schema, utility);
    var del = new DEL(type, label, alias, schema, utility);

    var restNew = {
        login: null,
        post: post,
        get: get,
        put: put,
        del: del
    };

    restNew.login = login;

    return restNew;
};