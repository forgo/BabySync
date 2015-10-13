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

module.exports = function Geocache(db, bcrypt, parse, errors, validate, jwt, utility, _, userSchema) {

    var geocache = {
        schema: [{
            attribute: "title",
            type: String,
            required: true,
            auto: false,
            test: validate.geocache_title()
        }, {
            attribute: "message",
            type: String,
            required: true,
            auto: false,
            test: validate.geocache_message()
        }, {
            attribute: "lat",
            type: Number,
            required: true,
            auto: false,
            test: validate.geocache_lat()
        }, {
            attribute: "lng",
            type: Number,
            auto: false,
            required: true,
            auto: false,
            test: validate.geocache_lng()
        }, {
            attribute: "currency",
            type: String,
            required: true,
            auto: false,
            test: validate.geocache_currency()
        }, {
            attribute: "amount",
            type: Number,
            required: true,
            auto: false,
            test: validate.geocache_amount()
        }, {
            attribute: "is_physical",
            type: Boolean,
            required: true,
            auto: false,
            test: validate.geocache_is_physical()
        }, {
            attribute: "delay",
            type: Number,
            required: true,
            auto: false,
            test: validate.geocache_delay()
        }, {
            attribute: "drop_count",
            type: Number,
            required: true,
            auto: true
        }, {
            attribute: "created_on",
            type: Date,
            required: true,
            auto: true
        }, {
            attribute: "updated_on",
            type: Date,
            required: true,
            auto: true
        }],
        success: function(data) {
            return function * (next) {
                var json = utility.json_response(data, null);
                this.type = "application/json";
                this.body = json;
            };
        },
        invalid: function(errors) {
            return function * (next) {
                var json = utility.json_response(null, errors);
                this.type = "application/json";
                this.body = json;
            };
        },
        invalidPost: function(pre, errors) {
            return function * (next) {
                // Remove Password From Returned Prefill
                if (pre && pre.password) {
                    delete pre.password;
                }
                var json = utility.json_response(pre, errors);
                this.type = "application/json";
                this.body = json;
            };
        },
        post: function * (next) {
            // console.log("geocache.post");
            try {
                // TODO: Be sure this is being requested by authenticated geocache w/proper privileges

                var geocache_pre = yield parse(this);
                var geocache_test = validate.schema(geocache.schema, geocache_pre);
                if (geocache_test.valid) {

                    // Add automatic fields
                    var now = new Date();
                    geocache_test.data.created_on = now;
                    geocache_test.data.updated_on = now;
                    geocache_test.data.drop_count = 1;

                    // TODO: Other Auto Geocache Fields for Initial Seeding


                    // Request DB Create Node and Respond Accordingly
                    var create = yield db.geocache_create(geocache_test.data);
                    if (create.success) {
                        return yield geocache.success(create.data);
                    } else {
                        return yield geocache.invalidPost(geocache_pre, create.errors);
                    }
                } else {
                    // Request was not valid,
                    return yield geocache.invalidPost(geocache_pre, geocache_test.errors);
                }
            } catch (e) {
                return yield geocache.catchErrors(e, geocache_pre);
            }
        },
        get: function * (next) {
            // console.log("geocache.get");
            try {
                // TODO: Be sure this is being requested by authenticated geocache w/proper privileges

                // No parameter provided in URL
                if ((this.params.id == undefined || this.params.id == null) && _.isEmpty(this.query)) {
                    // Return all geocaches      
                    var allGeocaches = yield db.geocaches_all();
                    if (allGeocaches.success) {
                        return yield geocache.success(allGeocaches.data);
                    } else {
                        return yield geocache.invalid(allGeocaches.errors);
                    }
                }
                // Parameter exists in URL
                else {
                    // Try to identify existing user
                    var userIDFilter = undefined;

                    // First extract user from query parameters and test if valid
                    if (this.query.user) {
                        var user_test = yield validate.userID(this.query.user, userSchema, db);
                        if (user_test.valid) {
                            userIDFilter = user_test.data.id;
                        } else {
                            user_test.errors.push(errors.QUERY_PARAM_INVALID("?user="));
                            return yield geocache.invalid(user_test.errors);
                        }
                    }
                    // Build remaining filter options based on valid URL params
                    var filter = yield validate.geocache_query_filter(this.query);
                    console.log("FILTER = ", JSON.stringify(filter, null, 4));
                    if (filter.valid) {
                        // Do Some Filtering Business here.
                        filter.data.user = userIDFilter;
                        var filterGeocaches = yield db.geocaches_by_filter(filter.data);
                        if (filterGeocaches.success) {
                            return yield geocache.success(filterGeocaches.data);
                        } else {
                            return yield geocache.invalid(filterGeocaches.errors);
                        }
                    } else {
                        return yield geocache.invalid(filter.errors);
                    }

                }
            } catch (e) {
                // Unknown Error
                return yield geocache.catchErrors(e, null);
            }
        },
        put: function * (next) {
            // console.log("geocache.put");
            try {
                // TODO: Be sure this is being requested by authenticated geocache w/proper privileges

                // Request payload
                var geocache_pre = yield parse(this);

                // No parameter provided in URL
                if ((this.params.id == undefined && this.params.id == null) && _.isEmpty(this.query)) {
                    // Perhaps request is for a batch update
                    // batch_test = validate.schemaForBatchUpdate(geocache.schema, geocache_pre);
                    // if (batch_test.valid) {
                    //     // Loop through validated data and perform updates
                    // }
                    // else {
                    //     return yield geocache.invalidPost(geocache_pre, batch_test.errors);
                    // }
                    return yield geocache.invalidPost(geocache_pre, [errors.UNSUPPORTED()]);
                }
                // Parameter exists in URL
                else {
                    // Try to identify existing geocache
                    var existingGeocache = undefined;
                    var findGeocache = yield geocache.identifyFromURL(this.params.id);
                    if (findGeocache.success) {
                        existingGeocache = findGeocache.data;
                    } else {
                        return yield geocache.invalidPost(geocache_pre, findGeocache.errors);
                    }
                    // If we got this far, we must have found a match.
                    // Now validate what we're trying to update
                    geocache_test = validate.schemaForUpdate(geocache.schema, geocache_pre);
                    if (geocache_test.valid) {
                        // Is the geocache trying to change their password?
                        if (geocache_test.data.password) {
                            // Generate new salt/hash using bcrypt
                            var salt = yield bcrypt.genSalt(10);
                            var hash = yield bcrypt.hash(geocache_test.data.password, salt);
                            // Delete password key/value from update object, replace w/hash
                            var pw = geocache_test.data.password;
                            delete geocache_test.data.password;
                            geocache_test.data.hash = hash;
                        }
                        // Add automatic date fields
                        var now = new Date();
                        geocache_test.data.updated_on = now;
                        // Request DB update
                        var geocacheUpdate = yield db.geocache_update(geocache_test.data, existingGeocache.id);
                        if (geocacheUpdate.success) {
                            return yield geocache.success(geocacheUpdate.data);
                        } else {
                            return yield geocache.invalidPost(geocache_pre, geocacheUpdate.errors);
                        }
                    } else {
                        return yield geocache.invalidPost(geocache_pre, geocache_test.errors);
                    }
                }
            } catch (e) {
                return yield geocache.catchErrors(e, geocache_pre);
            }
        },
        del: function * (next) {
            // console.log("geocache.del");
            try {
                // TODO: Be sure this is being requested by authenticated geocache w/proper privileges

                // Request payload
                var geocache_pre = yield parse(this);

                // No parameter provided in URL
                if (this.params.id == undefined || this.params.id == null) {
                    // Perhaps request is for a batch delete
                    // batch_test = validate.schemaForBatchDelete(geocache.schema, geocache_pre);
                    // if (batch_test.valid) {
                    //     // Loop through validated data and perform deletes
                    // }
                    // else {
                    //     return yield geocache.invalidPost(geocache_pre, batch_test.errors);
                    // }
                    return yield geocache.invalidPost(geocache_pre, [errors.UNSUPPORTED()]);
                }
                // Parameter exists in URL
                else {
                    // Try to identify existing geocache
                    var existingGeocache = undefined;
                    var findGeocache = yield geocache.identifyFromURL(this.params.id);
                    if (findGeocache.success) {
                        existingGeocache = findGeocache.data;
                    } else {
                        return yield geocache.invalidPost(geocache_pre, findGeocache.errors);
                    }
                    // If we got this far, we must have found a match to delete.
                    var geocacheDelete = yield db.geocache_delete_by_id(existingGeocache.id);
                    if (geocacheDelete.success) {
                        return yield geocache.success(geocacheDelete.data);
                    } else {
                        return yield geocache.invalidPost(geocache_pre, geocacheDelete.errors);
                    }
                }
            } catch (e) {
                return yield geocache.catchErrors(e, geocache_pre);
            }
        },
        mixed: function * (next) {
            try {
                // No parameter provided in URL
                if ((this.params.id == undefined || this.params.id == null) && _.isEmpty(this.query)) {
                    // Return all geocaches      
                    var allGeocaches = yield db.geocaches_all();
                    if (allGeocaches.success) {
                        return yield geocache.success(allGeocaches.data);
                    } else {
                        return yield geocache.invalid(allGeocaches.errors);
                    }
                }
                // Parameter exists in URL
                else {}





            } catch (e) {
                return yield geocache.catchErrors(e, null);
            }
        },
        identifyFromURL: function(params_id) {
            return function * (next) {
                // Try to identify existing geocache
                var response = {};
                var id_test = validate.id(params_id);
                var username_test = validate.attribute(geocache.schema, params_id, "username");
                var email_test = validate.attribute(geocache.schema, params_id, "email");

                if (id_test.valid) {
                    var geocacheByID = yield db.geocache_by_id(id_test.data.toString());
                    if (geocacheByID.success) {
                        response.success = true;
                        response.data = geocacheByID.data;
                    } else {
                        response.success = false;
                        response.errors = geocacheByID.errors;
                    }
                } else if (username_test.valid) {
                    var geocacheByUsername = yield db.geocache_by_username(username_test.data);
                    if (geocacheByUsername.success) {
                        response.success = true;
                        response.data = geocacheByUsername.data;
                    } else {
                        response.success = false;
                        response.errors = geocacheByUsername.errors;
                    }
                } else if (email_test.valid) {
                    var geocacheByEmail = yield db.geocache_by_email(email_test.data);
                    if (geocacheByEmail.success) {
                        response.success = true;
                        response.data = geocacheByEmail.data;
                    } else {
                        response.success = false;
                        response.errors = geocacheByEmail.errors;
                    }
                } else {
                    response.success = false;
                    response.errors = [errors.UNIDENTIFIABLE(params_id)];
                }

                // Need to be sure this gives back an Geocache and not empty array!
                // Somehow we detected a valid id/username/email but still wasn't in DB
                if (response.success == true && response.data.length == 0) {
                    response.success = false;
                    response.errors = [errors.UNIDENTIFIABLE(params_id)];
                }
                return response;
            };
        },
        catchErrors: function(err, pre) {
            return function * (next) {
                return yield geocache.invalidPost(pre, [errors.UNKNOWN_ERROR("geocache --- " + err)]);
            };
        }
    }
    return geocache;
};