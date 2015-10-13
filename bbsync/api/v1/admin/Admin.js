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

module.exports = function Admin(db, bcrypt, parse, errors, validate, jwt, utility, _) {

    var admin = {
        schema: [{
            attribute: "username",
            type: "text",
            required: true,
            auto: false,
            test: validate.admin_username()
        }, {
            attribute: "password",
            type: "password",
            required: true,
            auto: false,
            test: validate.admin_password()
        }, {
            attribute: "email",
            type: "text",
            required: true,
            auto: false,
            test: validate.admin_email()
        }, {
            attribute: "birthday",
            type: "date",
            required: false,
            auto: false,
            test: validate.admin_birthday()
        }, {
            attribute: "phone",
            type: "text",
            required: false,
            auto: false,
            test: validate.admin_phone()
        }, {
            attribute: "firstname",
            type: "text",
            required: false,
            auto: false,
            test: validate.admin_firstname()
        }, {
            attribute: "lastname",
            type: "text",
            required: false,
            auto: false,
            test: validate.admin_lastname()
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
            // console.log("admin.post");
            try {
                // TODO: Be sure this is being requested by authenticated admin w/proper privileges
                var claims = this.state.jwtdata;
                if (!claims.admin) {
                    return yield admin.invalid([errors.UNPRIVILEGED(claims.username)]);
                }

                var admin_pre = yield parse(this);
                var admin_test = validate.schema(admin.schema, admin_pre);
                if (admin_test.valid) {
                    // Check if username / email already in use
                    var takenErrors = [];
                    var isTaken = false;
                    var checkUsername = yield db.admin_username_taken(admin_test.data.username);
                    if (checkUsername.success) {
                        if (checkUsername.taken) {
                            isTaken = true;
                            takenErrors.push(errors.USERNAME_TAKEN("username"));
                        }
                    }
                    else {
                        return yield admin.invalidPost(admin_pre, checkUsername.errors);
                    }
                    var checkEmail = yield db.admin_email_taken(admin_test.data.email);
                    if (checkEmail.success) {
                        if (checkEmail.taken) {
                            isTaken = true;
                            takenErrors.push(errors.EMAIL_TAKEN("email"));
                        }
                    }
                    else {
                        return yield admin.invalidPost(admin_pre, checkEmail.errors);
                    }

                    if (isTaken) {
                        return yield admin.invalidPost(admin_pre, takenErrors);
                    }

                    // Generate salt/hash using bcrypt
                    var salt = yield bcrypt.genSalt(10);
                    var hash = yield bcrypt.hash(admin_test.data.password, salt);

                    // Delete password key/value from post object, replace w/hash
                    var pw = admin_test.data.password;
                    delete admin_test.data.password;
                    admin_test.data.hash = hash;

                    // Add automatic date fields
                    var now = new Date();
                    admin_test.data.created_on = now;
                    admin_test.data.updated_on = now;
                    admin_test.data.login_on = "";
                    // Request DB Create Node and Respond Accordingly
                    var create = yield db.admin_create(admin_test.data);
                    if (create.success) {
                        return yield admin.success(create.data);
                    }
                    else {
                        return yield admin.invalidPost(admin_pre, create.errors);
                    }

                }
                else {
                    // Request was not valid,
                    return yield admin.invalidPost(admin_pre, admin_test.errors);
                }
            }
            catch (e) {
                return yield admin.catchErrors(e, admin_pre);
            }
        },
        get: function * (next) {
            // console.log("admin.get");
            try {
                // TODO: Be sure this is being requested by authenticated admin w/proper privileges
                var claims = this.state.jwtdata;
                if (!claims.admin) {
                    return yield admin.invalid([errors.UNPRIVILEGED(claims.username)]);
                }

                // No parameter provided in URL
                if ((this.params.id == undefined || this.params.id == null) && _.isEmpty(this.query)) {
                    // Return all admins 
                    var allAdmins = yield db.admins_all();
                    if (allAdmins.success) {
                        return yield admin.success(allAdmins.data);
                    }
                    else {
                        return yield admin.invalid(allAdmins.errors);
                    }
                }
                // Parameter exists in URL
                else {
                    // Try to identify existing admin
                    var findAdmin = yield admin.identifyFromURL(this.params.id);
                    if (findAdmin.success) {
                        return yield admin.success(findAdmin.data);
                    }
                    else {
                        return yield admin.invalid(findAdmin.errors);
                    }
                }
            }
            catch (e) {
                // Unknown Error
                return yield admin.catchErrors(e, null);
            }
        },
        put: function * (next) {
            // console.log("admin.put");
            try {
                // TODO: Be sure this is being requested by authenticated admin w/proper privileges
                var claims = this.state.jwtdata;
                if (!claims.admin) {
                    return yield admin.invalid([errors.UNPRIVILEGED(claims.username)]);
                }

                // Request payload
                var admin_pre = yield parse(this);

                // No parameter provided in URL
                if ((this.params.id == undefined && this.params.id == null) && _.isEmpty(this.query)) {
                    // Perhaps request is for a batch update
                    // batch_test = validate.schemaForBatchUpdate(admin.schema, admin_pre);
                    // if (batch_test.valid) {
                    //     // Loop through validated data and perform updates
                    // }
                    // else {
                    //     return yield admin.invalidPost(admin_pre, batch_test.errors);
                    // }
                    return yield admin.invalidPost(admin_pre, [errors.UNSUPPORTED()]);
                }
                // Parameter exists in URL
                else {
                    // Try to identify existing admin
                    var existingAdmin = undefined;
                    var findAdmin = yield admin.identifyFromURL(this.params.id);
                    if (findAdmin.success) {
                        existingAdmin = findAdmin.data;
                    }
                    else {
                        return yield admin.invalidPost(admin_pre, findAdmin.errors);
                    }
                    // If we got this far, we must have found a match.
                    // Now validate what we're trying to update
                    admin_test = validate.schemaForUpdate(admin.schema, admin_pre);
                    if (admin_test.valid) {
                        // Is the admin trying to change their password?
                        if (admin_test.data.password) {
                            // Generate new salt/hash using bcrypt
                            var salt = yield bcrypt.genSalt(10);
                            var hash = yield bcrypt.hash(admin_test.data.password, salt);
                            // Delete password key/value from update object, replace w/hash
                            var pw = admin_test.data.password;
                            delete admin_test.data.password;
                            admin_test.data.hash = hash;
                        }
                        // Add automatic date fields
                        var now = new Date();
                        admin_test.data.updated_on = now;
                        // Request DB update
                        var adminUpdate = yield db.admin_update(admin_test.data, existingAdmin.id);
                        if (adminUpdate.success) {
                            return yield admin.success(adminUpdate.data);
                        }
                        else {
                            return yield admin.invalidPost(admin_pre, adminUpdate.errors);
                        }
                    }
                    else {
                        return yield admin.invalidPost(admin_pre, admin_test.errors);
                    }
                }
            }
            catch (e) {
                return yield admin.catchErrors(e, admin_pre);
            }
        },
        del: function * (next) {
            // console.log("admin.del");
            try {
                // TODO: Be sure this is being requested by authenticated admin w/proper privileges
                var claims = this.state.jwtdata;
                if (!claims.admin) {
                    return yield admin.invalid([errors.UNPRIVILEGED(claims.username)]);
                }

                // Request payload
                var admin_pre = yield parse(this);

                // No parameter provided in URL
                if (this.params.id == undefined && this.params.id == null) {
                    // Perhaps request is for a batch delete
                    // batch_test = validate.schemaForBatchDelete(admin.schema, admin_pre);
                    // if (batch_test.valid) {
                    //     // Loop through validated data and perform deletes
                    // }
                    // else {
                    //     return yield admin.invalidPost(admin_pre, batch_test.errors);
                    // }
                    return yield admin.invalidPost(admin_pre, [errors.UNSUPPORTED()]);
                }
                // Parameter exists in URL
                else {
                    // Try to identify existing admin
                    var existingAdmin = undefined;
                    var findAdmin = yield admin.identifyFromURL(this.params.id);
                    if (findAdmin.success) {
                        existingAdmin = findAdmin.data;
                    }
                    else {
                        return yield admin.invalidPost(admin_pre, findAdmin.errors);
                    }
                    // If we got this far, we must have found a match to delete.
                    var adminDelete = yield db.admin_delete_by_id(existingAdmin.id);
                    if (adminDelete.success) {
                        return yield admin.success(adminDelete.data);
                    }
                    else {
                        return yield admin.invalidPost(admin_pre, adminDelete.errors);
                    }
                }
            }
            catch (e) {
                return yield admin.catchErrors(e, admin_pre);
            }
        },
        identifyFromURL: function(params_id) {
            return function * (next) {
                // Try to identify existing admin
                var response = {};
                var id_test = validate.id(params_id);
                var username_test = validate.attribute(admin.schema, params_id, "username");
                var email_test = validate.attribute(admin.schema, params_id, "email");

                if (id_test.valid) {
                    var adminByID = yield db.admin_by_id(id_test.data.toString());
                    if (adminByID.success) {
                        response.success = true;
                        response.data = adminByID.data;
                    }
                    else {
                        response.success = false;
                        response.errors = adminByID.errors;
                    }
                }
                else if (username_test.valid) {
                    var adminByUsername = yield db.admin_by_username(username_test.data);
                    if (adminByUsername.success) {
                        response.success = true;
                        response.data = adminByUsername.data;
                    }
                    else {
                        response.success = false;
                        response.errors = adminByUsername.errors;
                    }
                }
                else if (email_test.valid) {
                    var adminByEmail = yield db.admin_by_email(email_test.data);
                    if (adminByEmail.success) {
                        response.success = true;
                        response.data = adminByEmail.data;
                    }
                    else {
                        response.success = false;
                        response.errors = adminByEmail.errors;
                    }
                }
                else {
                    response.success = false;
                    response.errors = [errors.UNIDENTIFIABLE(params_id)];
                }

                // Need to be sure this gives back an Admin and not empty array!
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
                return yield admin.invalidPost(pre, [errors.UNKNOWN_ERROR("admin --- " + JSON.stringify(err))]);
            };
        }
    }
    return admin;
};