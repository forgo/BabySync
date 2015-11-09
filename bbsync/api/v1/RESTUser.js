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

module.exports = function RESTUser(label, alias, schema, db, validate, errors, response) {

    var parse = require('co-body');
    var _ = require('lodash');
    var bcrypt = require('co-bcrypt');
    var fs = require('fs');
    var jwt = require('koa-jwt');
    var req = require('koa-request');

    var restUser = {
// -----------------------------------------------------------------------------
// START USER SPECIFIC LOGIC
// -----------------------------------------------------------------------------
login: function * (next) {
    try {
        var login_pre = yield parse(this);
        var login_test = yield validate.login(schema, login_pre, req);
        console.log("login_test = ", login_test);
        if (login_test.valid) {
            // See if this username or email exists in the user database
            var userToCompare = null;
            if (login_test.isEmailAsUsername) {
                var userByEmail = yield db.user_by_email_for_login(login_test.data.email, label, alias, schema);

                console.log("userByEmail = ", userByEmail);

                if (userByEmail.success) {
                    if (userByEmail.data.length == 0) {
                        // Email not found (only return generic login failure error for security purposes)
                        return yield response.invalidPost(login_pre, [errors.LOGIN_FAILURE()]);
                    } else {
                        userToCompare = userByEmail.data;
                    }
                } else {
                    return yield response.invalidPost(login_pre, [errors.LOGIN_FAILURE()]);
                }
            } else {
                var userByUsername = yield db.user_by_username_for_login(login_test.data.username, label, alias, schema);
                if (userByUsername.success) {
                    if (userByUsername.data.length == 0) {
                        // Username not found (only return generic login failure error for security purposes)
                        return yield response.invalidPost(login_pre, [errors.LOGIN_FAILURE("username not found")]);
                    } else {
                        userToCompare = userByUsername.data;
                    }
                } else {
                    return yield response.invalidPost(login_pre, [errors.LOGIN_FAILURE("invalid field values")]);
                }
            }

            // User Exists Once In DB, Compare Passwords
            if (yield bcrypt.compare(login_test.data.password, userToCompare.hash)) {
                // Password Correct!
                // Udpate "login_on" Date for User
                var now = new Date();
                var userLoginTimeUpdate = {
                    login_on: now
                };

                var userUpdate = yield db.user_update(userToCompare.id, userLoginTimeUpdate, label, alias, schema);
                if (userUpdate.success) {
                    // You've logged in successfuly
                    // Set and return JWT
                    var privateKey = fs.readFileSync('v1/auth/ssl/demo.rsa');
                    var claims = {
                        iss: "digeocache",
                        username: userToCompare.username,
                        user: true
                    };
                    var token = jwt.sign(claims, privateKey, {
                        algorithm: 'RS256',
                        expiresInMinutes: 120
                    });

                    var responseObject = { token: token };
                    if(login_test.isEmailAsUsername) {
                        responseObject["email"] = userUpdate.data.email;
                    }
                    else {
                        responseObject["username"] = userUpdate.data.username;
                    }

                    return yield response.success(responseObject);

                } else {
                    // Failed to Update Last Login Date When Logging In
                    return yield response.invalidPost(login_pre, [errors.LOGIN_FAILURE("failed to update login_on")]);
                }
            } else {
                // Password incorrect (only return generic login failure error for security purposes)
                return yield response.invalidPost(login_pre, [errors.LOGIN_FAILURE("password incorrect")]);
            }

        } else {
            // Request was not valid
            return yield response.invalidPost(login_pre, login_test.errors);
        }
    } catch (e) {
        return yield response.catchErrors(e, login_pre);
    }
},
// -----------------------------------------------------------------------------
// END USER SPECIFIC LOGIC
// -----------------------------------------------------------------------------
        post: function * (next) {
            try {
                // TODO: Be sure this is being requested by authenticated user w/proper privileges

                var object_pre = yield parse(this);
                var object_test = validate.schema(schema, object_pre);
                if (object_test.valid) {

// -----------------------------------------------------------------------------
// START USER SPECIFIC LOGIC
// -----------------------------------------------------------------------------
// Check if username / email already in use
var takenErrors = [];
var isTaken = false;
var checkUsername = yield db.user_username_taken(object_test.data.username, label, alias);

if (checkUsername.success) {
    if (checkUsername.taken) {
        isTaken = true;
        takenErrors.push(errors.USERNAME_TAKEN("username"));
    }
} else {
    return yield response.invalidPost(object_pre, checkUsername.errors);
}
var checkEmail = yield db.user_email_taken(object_test.data.email, label, alias);
if (checkEmail.success) {
    if (checkEmail.taken) {
        isTaken = true;
        takenErrors.push(errors.EMAIL_TAKEN("email"));
    }
} else {
    return yield response.invalidPost(object_pre, checkEmail.errors);
}

if (isTaken) {
    return yield response.invalidPost(object_pre, takenErrors);
}

// Generate salt/hash using bcrypt
var salt = yield bcrypt.genSalt(10);
var hash = yield bcrypt.hash(object_test.data.password, salt);

// Delete password key/value from post object, replace w/hash
var pw = object_test.data.password;
delete object_test.data.password;
object_test.data.hash = hash;
// -----------------------------------------------------------------------------
// END USER SPECIFIC LOGIC
// -----------------------------------------------------------------------------

                    // Add automatic date fields
                    var now = new Date();
                    object_test.data.created_on = now;
                    object_test.data.updated_on = now;

// -----------------------------------------------------------------------------
// START USER SPECIFIC LOGIC
// -----------------------------------------------------------------------------
object_test.data.login_on = "";
// -----------------------------------------------------------------------------
// END USER SPECIFIC LOGIC
// -----------------------------------------------------------------------------

                    // Request DB Create Node and Respond Accordingly
                    var create = yield db.user_create(object_test.data, label, alias, schema);

                    if (create.success) {
                        return yield response.success(create.data);
                    } else {
                        return yield response.invalidPost(object_pre, create.errors);
                    }
                } else {
                    // Request was not valid,
                    return yield response.invalidPost(object_pre, object_test.errors);
                }
            } catch (e) {
                return yield response.catchErrors(e, object_pre);
            }
        },
        get: function * (next) {
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

// -----------------------------------------------------------------------------
// START USER SPECIFIC LOGIC
// -----------------------------------------------------------------------------
// Try to identify existing user
var user_test = yield validate.userID(this.params.id, schema, label, alias, schema, db);
if (user_test.valid) {
    return yield response.success(user_test.data);
} else {
    return yield response.invalid(user_test.errors);
}
// -----------------------------------------------------------------------------
// END USER SPECIFIC LOGIC
// -----------------------------------------------------------------------------

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
                var object_pre = yield parse(this);



                // No parameter provided in URL
                if ((this.params.id == undefined && this.params.id == null) && _.isEmpty(this.query)) {
                    // Perhaps request is for a batch update
                    // batch_test = validate.schemaForBatchUpdate(schema, object_pre);
                    // if (batch_test.valid) {
                    //     // Loop through validated data and perform updates
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

// -----------------------------------------------------------------------------
// START USER SPECIFIC LOGIC
// -----------------------------------------------------------------------------
// Try to identify existing user
var user_test = yield validate.userID(this.params.id, schema, label, alias, schema, db);
if (user_test.valid) {
    existingObject = user_test.data
} else {
    return yield response.invalidPost(object_pre, user_test.errors);
}
// -----------------------------------------------------------------------------
// END USER SPECIFIC LOGIC
// -----------------------------------------------------------------------------

                    // If we got this far, we must have found a match.
                    // Now validate what we're trying to update
                    object_test = validate.schemaForUpdate(schema, object_pre);
                    if (object_test.valid) {

// -----------------------------------------------------------------------------
// START USER SPECIFIC LOGIC
// -----------------------------------------------------------------------------
// Is the user trying to change their password?
if (object_test.data.password) {
    // Generate new salt/hash using bcrypt
    var salt = yield bcrypt.genSalt(10);
    var hash = yield bcrypt.hash(object_test.data.password, salt);
    // Delete password key/value from update object, replace w/hash
    var pw = object_test.data.password;
    delete object_test.data.password;
    object_test.data.hash = hash;
}
// -----------------------------------------------------------------------------
// END USER SPECIFIC LOGIC
// -----------------------------------------------------------------------------

                        // Add automatic date fields
                        var now = new Date();
                        object_test.data.updated_on = now;
                        // Request DB update
                        var objectUpdate = yield db.user_update(existingObject.id, object_test.data, label, alias, schema);
                        if (objectUpdate.success) {
                            return yield response.success(objectUpdate.data);
                        } else {
                            return yield response.invalidPost(object_pre, objectUpdate.errors);
                        }
                    } else {
                        return yield response.invalidPost(object_pre, object_test.errors);
                    }
                }
            } catch (e) {
                return yield response.catchErrors(e, object_pre);
            }
        },
        del: function * (next) {
            // console.log("object.del");
            try {
                // TODO: Be sure this is being requested by authenticated user w/proper privileges

                // Request payload
                var object_pre = yield parse(this);
                
                // No parameter provided in URL
                if ((this.params.id == undefined && this.params.id == null) && _.isEmpty(this.query)) {
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

// -----------------------------------------------------------------------------
// START USER SPECIFIC LOGIC
// -----------------------------------------------------------------------------
// Try to identify existing user
var user_test = yield validate.userID(this.params.id, schema, label, alias, schema, db);
if (user_test.valid) {
    existingObject = user_test.data
} else {
    return yield response.invalidPost(object_pre, user_test.errors);
}
// -----------------------------------------------------------------------------
// END USER SPECIFIC LOGIC
// -----------------------------------------------------------------------------

                    // If we got this far, we must have found a match to delete.
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
    }
    return restUser;
};