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

module.exports = function REST(fxns, schema, validate, errors, label) {

    var parse = require('co-body');
    var _ = require('lodash');

    var rest = {
        json_response: function(data, errorsArray) {
            var obj = {};
            if (data) {
                obj.data = data;
            }
            if (errorsArray) {
                obj.errors = errorsArray;
            }
            return JSON.stringify(obj, null, 4);
        },
        success: function(data) {
            return function * (next) {
                var json = rest.json_response(data, null);
                this.type = "application/json";
                this.body = json;
            };
        },
        invalid: function(errors) {
            return function * (next) {
                var json = rest.json_response(null, errors);
                this.type = "application/json";
                this.body = json;
            };
        },
        invalidPost: function(pre, errors) {
            return function * (next) {
                var json = rest.json_response(pre, errors);
                this.type = "application/json";
                this.body = json;
            };
        },
        post: function * (next) {
            try {
                // TODO: Be sure this is being requested by authenticated user w/proper privileges

                var object_pre = yield parse(this);
                var object_test = validate.schema(schema, object_pre);
                if (object_test.valid) {

                    // Add automatic date fields
                    // TODO: actually use schema to determine auto and create?
                    // OR? Remove autos from schema, are they needed for anything else?
                    var now = new Date();
                    object_test.data.created_on = now;
                    object_test.data.updated_on = now;
                    // Request DB Create Node and Respond Accordingly
                    var create = yield fxns.post(object_test.data);
                    if (create.success) {
                        return yield rest.success(create.data);
                    } else {
                        return yield rest.invalidPost(object_pre, create.errors);
                    }
                } else {
                    // Request was not valid,
                    return yield rest.invalidPost(object_pre, object_test.errors);
                }
            } catch (e) {
                return yield rest.catchErrors(e, object_pre);
            }
        },
        get: function * (next) {
            try {
                // TODO: Be sure this is being requested by authenticated user w/proper privileges

                // No parameter provided in URL
                if ((this.params.id == undefined || this.params.id == null) && _.isEmpty(this.query)) {
                    // Return all families
                    var allObjects = yield fxns.getAll();
                    if (allObjects.success) {
                        return yield rest.success(allObjects.data);
                    } else {
                        return yield rest.invalid(allObjects.errors);
                    }
                }
                // Parameter exists in URL
                else {
                    // Validate the ID provided
                    var id_test = validate.id(this.params.id);
                    if (id_test.valid) {
                        var oneObject = yield fxns.getOne(id_test.data.toString());
                        if (oneObject.success) {
                            // Need to be sure this gives back an object and not empty array!
                            if (oneObject.data.length == 0) {
                                return yield rest.invalid([errors.UNIDENTIFIABLE(this.params.id)]);
                            }
                            return yield rest.success(oneObject.data);
                        } else {
                            return yield rest.invalid(oneObject.errors);
                        }

                    } else {
                        return yield rest.invalid([errors.UNIDENTIFIABLE(this.params.id)]);
                    }
                }
            } catch (e) {
                // Unknown Error
                return yield rest.catchErrors(e, null);
            }
        },
        put: function * (next) {
            // console.log("object.put");
            try {
                // TODO: Be sure this is being requested by authenticated user w/proper privileges

                // Request payload
                var object_pre = yield parse(this);

                // No parameter provided in URL
                if ((this.params.id == undefined && this.params.id == null) && _.isEmpty(this.query)) {
                    // Perhaps request is for a batch update
                    // batch_test = validate.schemaForBatchUpdate(schema, object_pre);
                    // if (batch_test.valid) {
                    //     // Loop through validated data and perform updates
                    // }
                    // else {
                    //     return yield rest.invalidPost(object_pre, batch_test.errors);
                    // }
                    return yield rest.invalidPost(object_pre, [errors.UNSUPPORTED()]);
                }
                // Parameter exists in URL
                else {
                    // Try to identify existing object
                    var existingObject = undefined;

                    // Validate the ID provided
                    var id_test = validate.id(this.params.id);
                    if (id_test.valid) {
                        existingObject = yield fxns.getOne(id_test.data.toString());
                        if (!existingObject.success) {
                            return yield rest.invalidPost(object_pre, existingObject.errors);
                        }
                    } else {
                        return yield rest.invalidPost(object_pre, [errors.UNIDENTIFIABLE(this.params.id)]);
                    }

                    // Need to be sure this gives back an object and not empty array!
                    if (existingObject.data.length == 0) {
                        return yield rest.invalidPost(object_pre, [errors.UNIDENTIFIABLE(this.params.id)]);
                    }

                    // If we got this far, we must have found a match.
                    // Now validate what we're trying to update
                    object_test = validate.schemaForUpdate(schema, object_pre);
                    if (object_test.valid) {
                        // Add automatic date fields
                        // TODO: actually use schema to determine auto and create?
                        // OR? Remove autos from schema, are they needed for anything else?
                        var now = new Date();
                        object_test.data.updated_on = now;
                        // Request DB update
                        var objectUpdate = yield fxns.put(object_test.data, existingObject.data.id);
                        if (objectUpdate.success) {
                            return yield rest.success(objectUpdate.data);
                        } else {
                            return yield rest.invalidPost(object_pre, objectUpdate.errors);
                        }
                    } else {
                        return yield rest.invalidPost(object_pre, object_test.errors);
                    }
                }
            } catch (e) {
                return yield rest.catchErrors(e, object_pre);
            }
        },
        del: function * (next) {
            // console.log("object.del");
            try {
                // TODO: Be sure this is being requested by authenticated user w/proper privileges

                // Request payload
                var object_pre = yield parse(this);

                // No parameter provided in URL
                if (this.params.id == undefined && this.params.id == null) {
                    // Perhaps request is for a batch delete
                    // batch_test = validate.schemaForBatchDelete(schema, object_pre);
                    // if (batch_test.valid) {
                    //     // Loop through validated data and perform deletes
                    // }
                    // else {
                    //     return yield rest.invalidPost(object_pre, batch_test.errors);
                    // }
                    return yield rest.invalidPost(object_pre, [errors.UNSUPPORTED()]);
                }
                // Parameter exists in URL
                else {
                    // Try to identify existing object
                    var existingObject = undefined;

                    // Validate the ID provided
                    var id_test = validate.id(this.params.id);
                    if (id_test.valid) {
                        existingObject = yield fxns.getOne(id_test.data.toString());
                        if (!existingObject.success) {
                            return yield rest.invalid(existingObject.errors);
                        }
                    } else {
                        return yield rest.invalid([errors.UNIDENTIFIABLE(this.params.id)]);
                    }

                    // Need to be sure this gives back an object and not empty array!
                    if (existingObject.data.length == 0) {
                        return yield rest.invalid([errors.UNIDENTIFIABLE(this.params.id)]);
                    }

                    // If we got this far, we must have found a match to delete.
                    var objectDelete = yield fxns.del(existingObject.data.id);
                    if (objectDelete.success) {
                        return yield rest.success(objectDelete.data);
                    } else {
                        return yield rest.invalid(objectDelete.errors);
                    }
                }
            } catch (e) {
                return yield rest.catchErrors(e, object_pre);
            }
        },
        catchErrors: function(err, pre) {
            return function * (next) {
                var errs = [errors.UNKNOWN_ERROR(label)];
                if (!err.success && err.errors) {
                    errs = err.errors;
                }
                return yield rest.invalidPost(pre, errs);
            };
        }
    }
    return rest;
};