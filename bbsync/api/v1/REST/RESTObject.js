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

module.exports = function RESTObject(Template, utility) {

    var template = new Template(utility.validate)

    //TODO: try catch for conformance here, anything special?
    var Model = require('../Models/Model.js');
    var model = new Model(template);

    var POST = require('./POST.js');
    var GET = require('./GET.js');
    var PUT = require('./PUT.js');
    var DEL = require('./DEL.js');
    var post = new POST(model, utility);
    var get = new GET(model, utility);
    var put = new PUT(model, utility);
    var del = new DEL(model, utility);

    var restObject = {
        // Data
        template: template,
        model: model,
        // REST Middleware 
        login: null,
        post: post,
        get: get,
        put: put,
        del: del
    };

    if(model.type.user) {
        var LOGIN = require('./LOGIN.js');
        var login = new LOGIN(model, utility);
        restObject.login = login;
    }

    return restObject;
};