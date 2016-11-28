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

module.exports = function GET(model, utility) {

    var _ = require('lodash');

    var type = model.type;
    var label = model.label;
    var alias = model.alias;
    var schema = model.schema;

    var errors = utility.errors;
    var validate = utility.validate;
    var response = utility.response;
    var db = utility.db;

    var get = function * (next) {
        try {
            // TODO: Be sure this is being requested by authenticated user w/proper privileges

            // No parameter provided in URL
            if ((this.params.id == undefined || this.params.id == null) && _.isEmpty(this.query)) {

                var allObjects = {};
                if(model.type.user) {
                    // return all users
                    allObjects = yield db.user_all(label, alias, schema);
                } else {
                    // return all objects
                    allObjects = yield db.object_all(label, alias, schema);
                }

                if (allObjects.success) {
                    return yield response.success(allObjects.data);
                } else {
                    return yield response.invalid(allObjects.errors);
                }
            }
            // Parameter exists in URL
            else {
                var id_test = {};
                if(model.type.user) {
                    // validate/identify existing user (calls DB)
                    id_test = yield validate.userID(this.params.id, schema, label, alias, schema, db);
                    // user id heuristics should return user object if valid
                    if (id_test.valid) {
                        return yield response.success(id_test.data);
                    } else {
                        return yield response.invalid(id_test.errors);
                    }
                }
                else {
                    // validate the object ID provided
                    id_test = validate.id(this.params.id);
                    if(id.test.valid) {
                        // unlike user ID validation, regular objects still need DB call
                        var oneObject = yield db.object_by_id(id_test.data.toString(), label, alias, schema);
                        if (oneObject.success) {
                            // need to be sure this gives back an object and not empty array!
                            if (oneObject.data.length == 0) {
                                return yield response.invalid([errors.UNIDENTIFIABLE(this.params.id)]);
                            }
                            return yield response.success(oneObject.data);
                        } else {
                            return yield response.invalid(oneObject.errors);
                        }
                    }
                }
            }
        } catch (e) {
            // Unknown Error
            return yield response.catchErrors(e, null);
        }
    }

    return get;
};