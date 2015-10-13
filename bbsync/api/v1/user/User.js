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

module.exports = function User(db, bcrypt, parse, errors, validate, jwt, utility, _) {

    var user = {
        schema: [{
            attribute: "username",
            type: "text",
            required: true,
            auto: false,
            test: validate.user_username()
        }, {
            attribute: "password",
            type: "password",
            required: true,
            auto: false,
            test: validate.user_password()
        }, {
            attribute: "email",
            type: "text",
            required: true,
            auto: false,
            test: validate.user_email()
        }, {
            attribute: "birthday",
            type: "date",
            required: false,
            auto: false,
            test: validate.user_birthday()
        }, {
            attribute: "phone",
            type: "text",
            required: false,
            auto: false,
            test: validate.user_phone()
        }, {
            attribute: "firstname",
            type: "text",
            required: false,
            auto: false,
            test: validate.user_firstname()
        }, {
            attribute: "lastname",
            type: "text",
            required: false,
            auto: false,
            test: validate.user_lastname()
        }, {
            attribute: "created_on",
            type: "date",
            required: false,
            auto: true
        }, {
            attribute: "updated_on",
            type: "date",
            required: false,
            auto: true
        }, {
            attribute: "login_on",
            type: "date",
            required: false,
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
            // console.log("user.post");
            try {
                // TODO: Be sure this is being requested by authenticated user w/proper privileges

                var user_pre = yield parse(this);
                var user_test = validate.schema(user.schema, user_pre);
                if (user_test.valid) {
                    // Check if username / email already in use
                    var takenErrors = [];
                    var isTaken = false;
                    var checkUsername = yield db.user_username_taken(user_test.data.username);
                    if (checkUsername.success) {
                        if (checkUsername.taken) {
                            isTaken = true;
                            takenErrors.push(errors.USERNAME_TAKEN("username"));
                        }
                    } else {
                        return yield user.invalidPost(user_pre, checkUsername.errors);
                    }
                    var checkEmail = yield db.user_email_taken(user_test.data.email);
                    if (checkEmail.success) {
                        if (checkEmail.taken) {
                            isTaken = true;
                            takenErrors.push(errors.EMAIL_TAKEN("email"));
                        }
                    } else {
                        return yield user.invalidPost(user_pre, checkEmail.errors);
                    }

                    if (isTaken) {
                        return yield user.invalidPost(user_pre, takenErrors);
                    }

                    // Generate salt/hash using bcrypt
                    var salt = yield bcrypt.genSalt(10);
                    var hash = yield bcrypt.hash(user_test.data.password, salt);

                    // Delete password key/value from post object, replace w/hash
                    var pw = user_test.data.password;
                    delete user_test.data.password;
                    user_test.data.hash = hash;

                    // Add automatic date fields
                    var now = new Date();
                    user_test.data.created_on = now;
                    user_test.data.updated_on = now;
                    user_test.data.login_on = "";
                    // Request DB Create Node and Respond Accordingly
                    var create = yield db.user_create(user_test.data);
                    if (create.success) {
                        return yield user.success(create.data);
                    } else {
                        return yield user.invalidPost(user_pre, create.errors);
                    }

                } else {
                    // Request was not valid,
                    return yield user.invalidPost(user_pre, user_test.errors);
                }
            } catch (e) {
                return yield user.catchErrors(e, user_pre);
            }
        },
        get: function * (next) {
            // console.log("user.get");
            try {
                // TODO: Be sure this is being requested by authenticated user w/proper privileges

                // No parameter provided in URL
                if ((this.params.id == undefined || this.params.id == null) && _.isEmpty(this.query)) {
                    // Return all users      
                    var allUsers = yield db.users_all();
                    if (allUsers.success) {
                        return yield user.success(allUsers.data);
                    } else {
                        return yield user.invalid(allUsers.errors);
                    }
                }
                // Parameter exists in URL
                else {
                    // Try to identify existing user
                    var user_test = yield validate.userID(this.params.id, user.schema, db);
                    if (user_test.valid) {
                        return yield user.success(user_test.data);
                    } else {
                        return yield user.invalid(user_test.errors);
                    }
                }
            } catch (e) {
                // Unknown Error
                return yield user.catchErrors(e, null);
            }
        },
        put: function * (next) {
            // console.log("user.put");
            try {
                // TODO: Be sure this is being requested by authenticated user w/proper privileges

                // Request payload
                var user_pre = yield parse(this);

                // No parameter provided in URL
                if ((this.params.id == undefined && this.params.id == null) && _.isEmpty(this.query)) {
                    // Perhaps request is for a batch update
                    // batch_test = validate.schemaForBatchUpdate(user.schema, user_pre);
                    // if (batch_test.valid) {
                    //     // Loop through validated data and perform updates
                    // }
                    // else {
                    //     return yield user.invalidPost(user_pre, batch_test.errors);
                    // }
                    return yield user.invalidPost(user_pre, [errors.UNSUPPORTED()]);
                }
                // Parameter exists in URL
                else {
                    // Try to identify existing user
                    var existingUser = undefined;

                    var user_test = yield validate.userID(this.params.id, user.schema, db);
                    if (user_test.valid) {
                        existingUser = user_test.data;
                    } else {
                        return yield user.invalidPost(user_pre, user_test.errors);
                    }

                    // If we got this far, we must have found a match.
                    // Now validate what we're trying to update
                    user_test = validate.schemaForUpdate(user.schema, user_pre);
                    if (user_test.valid) {
                        // Is the user trying to change their password?
                        if (user_test.data.password) {
                            // Generate new salt/hash using bcrypt
                            var salt = yield bcrypt.genSalt(10);
                            var hash = yield bcrypt.hash(user_test.data.password, salt);
                            // Delete password key/value from update object, replace w/hash
                            var pw = user_test.data.password;
                            delete user_test.data.password;
                            user_test.data.hash = hash;
                        }
                        // Add automatic date fields
                        var now = new Date();
                        user_test.data.updated_on = now;
                        // Request DB update
                        var userUpdate = yield db.user_update(user_test.data, existingUser.id);
                        if (userUpdate.success) {
                            return yield user.success(userUpdate.data);
                        } else {
                            return yield user.invalidPost(user_pre, userUpdate.errors);
                        }
                    } else {
                        return yield user.invalidPost(user_pre, user_test.errors);
                    }
                }
            } catch (e) {
                return yield user.catchErrors(e, user_pre);
            }
        },
        del: function * (next) {
            // console.log("user.del");
            try {
                // TODO: Be sure this is being requested by authenticated user w/proper privileges

                // Request payload
                var user_pre = yield parse(this);

                // No parameter provided in URL
                if (this.params.id == undefined && this.params.id == null) {
                    // Perhaps request is for a batch delete
                    // batch_test = validate.schemaForBatchDelete(user.schema, user_pre);
                    // if (batch_test.valid) {
                    //     // Loop through validated data and perform deletes
                    // }
                    // else {
                    //     return yield user.invalidPost(user_pre, batch_test.errors);
                    // }
                    return yield user.invalidPost(user_pre, [errors.UNSUPPORTED()]);
                }
                // Parameter exists in URL
                else {
                    // Try to identify existing user
                    var existingUser = undefined;

                    // Try to identify existing user
                    var user_test = yield validate.userID(this.params.id, user.schema, db);
                    if (user_test.valid) {
                        existingUser = user_test.data;
                    } else {
                        return yield user.invalidPost(user_pre, user_test.errors);
                    }

                    // If we got this far, we must have found a match to delete.
                    var userDelete = yield db.user_delete_by_id(existingUser.id);
                    if (userDelete.success) {
                        return yield user.success(userDelete.data);
                    } else {
                        return yield user.invalidPost(user_pre, userDelete.errors);
                    }
                }
            } catch (e) {
                return yield user.catchErrors(e, user_pre);
            }
        },
        // identifyFromURL: function(params_id) {
        //     return function * (next) {
        //         // Try to identify existing user
        //         var response = {};
        //         var id_test = validate.id(params_id);
        //         var username_test = validate.attribute(user.schema, params_id, "username");
        //         var email_test = validate.attribute(user.schema, params_id, "email");

        //         if (id_test.valid) {
        //             var userByID = yield db.user_by_id(id_test.data.toString());
        //             if (userByID.success) {
        //                 response.success = true;
        //                 response.data = userByID.data;
        //             } else {
        //                 response.success = false;
        //                 response.errors = userByID.errors;
        //             }
        //         } else if (username_test.valid) {
        //             var userByUsername = yield db.user_by_username(username_test.data);
        //             if (userByUsername.success) {
        //                 response.success = true;
        //                 response.data = userByUsername.data;
        //             } else {
        //                 response.success = false;
        //                 response.errors = userByUsername.errors;
        //             }
        //         } else if (email_test.valid) {
        //             var userByEmail = yield db.user_by_email(email_test.data);
        //             if (userByEmail.success) {
        //                 response.success = true;
        //                 response.data = userByEmail.data;
        //             } else {
        //                 response.success = false;
        //                 response.errors = userByEmail.errors;
        //             }
        //         } else {
        //             response.success = false;
        //             response.errors = [errors.UNIDENTIFIABLE(params_id)];
        //         }

        //         // Need to be sure this gives back a User and not empty array!
        //         // Somehow we detected a valid id/username/email but still wasn't in DB
        //         if (response.success == true && response.data.length == 0) {
        //             response.success = false;
        //             response.errors = [errors.UNIDENTIFIABLE(params_id)];
        //         }
        //         return response;
        //     };
        // },
        catchErrors: function(err, pre) {
            return function * (next) {
                return yield user.invalidPost(pre, [errors.UNKNOWN_ERROR("user --- " + err)]);
            };
        }
    }
    return user;
};