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

module.exports = function Parent(REST, db, validate, errors) {

    var schema = [{
        attribute: "name",
        type: "String",
        required: true,
        auto: false,
        test: validate.parent_name()
    }, {
        attribute: "email",
        type: "String",
        required: true,
        auto: false,
        test: validate.parent_email()
    }, {
        attribute: "facebookID",
        type: "String",
        required: true,
        auto: false,
        test: validate.parent_facebook_id()
    }, {
        attribute: "created_on",
        type: "Date",
        required: false,
        auto: true
    }, {
        attribute: "updated_on",
        type: "Date",
        required: false,
        auto: true
    }];

    var fxns = {
        post: db.parent_create.bind(db),
        getOne: db.parent_by_facebook_id.bind(db),
        getAll: db.parents_all.bind(db),
        put: db.parent_update.bind(db),
        del: db.parent_delete_by_id.bind(db)
    };
    var parentREST = new REST(fxns, schema, validate, errors, "Parent");

    var parent = {
        schema: schema,
        post: parentREST.post,
        get: parentREST.get,
        put: parentREST.put,
        del: parentREST.del
    }
    return parent;
};