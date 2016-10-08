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

module.exports = function REST(label, alias, schema, utility) {

    var parse = require('co-body');
    var _ = require('lodash');

    var errors = utility.errors;
    var validate = utility.validate;
    var response = utility.response;
    var db = utility.db;

    var rest = {
        post: function * (next) {
            try {
                // TODO: Be sure this is being requested by authenticated user w/proper privileges

                var payload = yield parse(this);
                var object_test = validate.schema(schema, payload);
                if (object_test.valid) {

                    // Add automatic date fields
                    var now = new Date();
                    object_test.data.created_on = now;
                    object_test.data.updated_on = now;
                    // Request DB Create Node and Respond Accordingly
                    var create = yield db.object_create(object_test.data, label, alias, schema);
                    if (create.success) {
                        return yield response.success(create.data);
                    } else {
                        return yield response.invalidPayload(payload, create.errors);
                    }
                } else {
                    // Request was not valid,
                    return yield response.invalidPayload(payload, object_test.errors);
                }
            } catch (e) {
                return yield response.catchErrors(e, payload);
            }
        },
        get: function * (next) {
            try {
                // TODO: Be sure this is being requested by authenticated user w/proper privileges

                // No parameter provided in URL
                if ((this.params.id == undefined || this.params.id == null) && _.isEmpty(this.query)) {
                    // Return all families
                    var allObjects = yield db.object_all(label, alias, schema);
                    if (allObjects.success) {
                        return yield response.success(allObjects.data);
                    } else {
                        return yield response.invalid(allObjects.errors);
                    }
                }
                // Parameter exists in URL
                else {
                    // Validate the ID provided
                    var id_test = validate.id(this.params.id);
                    if (id_test.valid) {
                        var oneObject = yield db.object_by_id(id_test.data.toString(), label, alias, schema);
                        if (oneObject.success) {
                            // Need to be sure this gives back an object and not empty array!
                            if (oneObject.data.length == 0) {
                                return yield response.invalid([errors.UNIDENTIFIABLE(this.params.id)]);
                            }
                            return yield response.success(oneObject.data);
                        } else {
                            return yield response.invalid(oneObject.errors);
                        }

                    } else {
                        return yield response.invalid([errors.UNIDENTIFIABLE(this.params.id)]);
                    }
                }
            } catch (e) {
                // Unknown Error
                return yield response.catchErrors(e, null);
            }
        },
        put: function * (next) {
            // console.log("object.put");
            try {
                // TODO: Be sure this is being requested by authenticated user w/proper privileges

                // Request payload
                var payload = yield parse(this);

                // No parameter provided in URL
                if ((this.params.id == undefined && this.params.id == null) && _.isEmpty(this.query)) {
                    // Perhaps request is for a batch update
                    // batch_test = validate.schemaForBatchUpdate(schema, payload);
                    // if (batch_test.valid) {
                    //     // Loop through validated data and perform updates
                    // }
                    // else {
                    //     return yield response.invalidPayload(payload, batch_test.errors);
                    // }
                    return yield response.invalidPayload(payload, [errors.UNSUPPORTED()]);
                }
                // Parameter exists in URL
                else {
                    // Try to identify existing object
                    var existingObject = undefined;

                    // Validate the ID provided
                    var id_test = validate.id(this.params.id);
                    if (id_test.valid) {
                        existingObject = yield db.object_by_id(id_test.data.toString(), label, alias, schema);
                        if (!existingObject.success) {
                            return yield response.invalidPayload(payload, existingObject.errors);
                        }
                    } else {
                        return yield response.invalidPayload(payload, [errors.UNIDENTIFIABLE(this.params.id)]);
                    }

                    // Need to be sure this gives back an object and not empty array!
                    if (existingObject.data.length == 0) {
                        return yield response.invalidPayload(payload, [errors.UNIDENTIFIABLE(this.params.id)]);
                    }

                    // If we got this far, we must have found a match.
                    // Now validate what we're trying to update
                    object_test = validate.schemaForUpdate(schema, payload);
                    if (object_test.valid) {
                        // Add automatic date fields
                        var now = new Date();
                        object_test.data.updated_on = now;
                        // Request DB update
                        var objectUpdate = yield db.object_update(existingObject.data.id, object_test.data, label, alias, schema);
                        if (objectUpdate.success) {
                            return yield response.success(objectUpdate.data);
                        } else {
                            return yield response.invalidPayload(payload, objectUpdate.errors);
                        }
                    } else {
                        return yield response.invalidPayload(payload, object_test.errors);
                    }
                }
            } catch (e) {
                return yield response.catchErrors(e, payload);
            }
        },
        del: function * (next) {
            // console.log("object.del");
            try {
                // TODO: Be sure this is being requested by authenticated user w/proper privileges

                // Request payload
                var payload = yield parse(this);

                // No parameter provided in URL
                if (this.params.id == undefined && this.params.id == null) {
                    // Perhaps request is for a batch delete
                    // batch_test = validate.schemaForBatchDelete(schema, payload);
                    // if (batch_test.valid) {
                    //     // Loop through validated data and perform deletes
                    // }
                    // else {
                    //     return yield response.invalidPayload(payload, batch_test.errors);
                    // }
                    return yield response.invalidPayload(payload, [errors.UNSUPPORTED()]);
                }
                // Parameter exists in URL
                else {
                    // Try to identify existing object
                    var existingObject = undefined;

                    // Validate the ID provided
                    var id_test = validate.id(this.params.id);
                    if (id_test.valid) {
                        existingObject = yield db.object_by_id(id_test.data.toString(), label, alias, schema);
                        if (!existingObject.success) {
                            return yield response.invalid(existingObject.errors);
                        }
                    } else {
                        return yield response.invalid([errors.UNIDENTIFIABLE(this.params.id)]);
                    }

                    // Need to be sure this gives back an object and not empty array!
                    if (existingObject.data.length == 0) {
                        return yield response.invalid([errors.UNIDENTIFIABLE(this.params.id)]);
                    }

                    // If we got this far, we must have found a match to delete.
                    var objectDelete = yield db.object_delete_by_id(existingObject.data.id, label, alias)
                    if (objectDelete.success) {
                        return yield response.success(objectDelete.data);
                    } else {
                        return yield response.invalid(objectDelete.errors);
                    }
                }
            } catch (e) {
                return yield response.catchErrors(e, payload);
            }
        }
    }
    return rest;
};