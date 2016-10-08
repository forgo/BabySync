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

module.exports = function DEL(type, label, alias, schema, utility) {

    var parse = require('co-body');
    var _ = require('lodash');

    var errors = utility.errors;
    var validate = utility.validate;
    var response = utility.response;
    var db = utility.db;

    var del = function * (next) {
        // console.log("object.del");
        try {
            // TODO: Be sure this is being requested by authenticated user w/proper privileges

            // Request payload
            var object_pre = yield parse(this);
            
            // No parameter provided in URL
            if ((this.params.id == undefined && this.params.id == null) && _.isEmpty(this.query)) {
                // TODO: Batch DEL deletes (embedded IDs in request body)
                // TODO: distinguish batch updates for user/non-user
                // Perhaps request is for a batch delete
                // batch_test = validate.schemaForBatchDelete(schema, object_pre);
                // if (batch_test.valid) {
                //     // Loop through validated data and perform deletes
                // }
                // else {
                //     return yield response.invalidPost(object_pre, batch_test.errors);
                // }
                return yield response.invalidPost(object_pre, [errors.UNSUPPORTED()]);
            }
            // Parameter exists in URL
            else {
                // Try to identify existing object
                var existingObject = undefined;
                var id_test = {};

                if(type.user) {
                    // validate/identify existing user (calls DB)
                    id_test = yield validate.userID(this.params.id, schema, label, alias, schema, db);
                    // user id heuristics should return user object if valid
                    if (id_test.valid) {
                        // hold on to existing object is found valid
                        existingObject = id_test.data
                    } else {
                        // can't delete an object we can't find
                        return yield response.invalidPost(object_pre, id_test.errors);
                    }
                } else {
                    // validate the ID provided
                    id_test = validate.id(this.params.id);
                    if (id_test.valid) {
                        // unlike user ID validation, regular objects still need DB call
                        existingObject = yield db.object_by_id(id_test.data.toString(), label, alias, schema);
                        if (!existingObject.success) {
                            // can't delete an object we can't find
                            return yield response.invalid(existingObject.errors);
                        }
                    } else {
                        return yield response.invalid([errors.UNIDENTIFIABLE(this.params.id)]);
                    }
                }

                // Need to be sure this gives back an object and not empty array!
                if (existingObject.data.length == 0) {
                    return yield response.invalid([errors.UNIDENTIFIABLE(this.params.id)]);
                }

                // if we got this far, we must have found a match to delete
                // request DB delete
                var objectDelete = yield db.user_delete_by_id(existingObject.id, label, alias);
                console.log(objectDelete);

                if (objectDelete.success) {
                    return yield response.success(objectDelete.data);
                } else {
                    return yield response.invalid(objectDelete.errors);
                }
            }
        } catch (e) {
            return yield response.catchErrors(e, object_pre);
        }
    }

    return del;
};