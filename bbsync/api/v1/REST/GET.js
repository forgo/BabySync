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

module.exports = function GET(type, label, alias, schema, utility) {

    var _ = require('lodash');

    var errors = utility.errors;
    var validate = utility.validate;
    var response = utility.response;
    var db = utility.db;

    var get = function * (next) {
        try {
            // TODO: Be sure this is being requested by authenticated user w/proper privileges

            // No parameter provided in URL
            if ((this.params.id == undefined || this.params.id == null) && _.isEmpty(this.query)) {
                // Return all families
                var allObjects = yield db.user_all(label, alias, schema);
                if (allObjects.success) {
                    return yield response.success(allObjects.data);
                } else {
                    return yield response.invalid(allObjects.errors);
                }
            }
            // Parameter exists in URL
            else {
                // BEGIN: User-Specific Logic
                if(type.user) {
                    // Try to identify existing user
                    var user_test = yield validate.userID(this.params.id, schema, label, alias, schema, db);
                    if (user_test.valid) {
                        return yield response.success(user_test.data);
                    } else {
                        return yield response.invalid(user_test.errors);
                    }
                }
                // END: User-Specific Logic
            }
        } catch (e) {
            // Unknown Error
            return yield response.catchErrors(e, null);
        }
    }

    return get;
};