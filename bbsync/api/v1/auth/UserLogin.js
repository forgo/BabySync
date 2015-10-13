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

module.exports = function UserLogin(db, bcrypt, fs, jwt, parse, errors, validate, utility) {
    var userLogin = {
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
        }],
        success: function(data) {
            return function * (next) {
                var json = utility.json_response(data, null);
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
            try {
                var isEmailAsUsername = false;
                var login_pre = yield parse(this);

                // If the username field appears to contain an email address (has an @ symbol)
                // then create a modified schema object with proper email regex test
                var modifiedSchema = userLogin.schema;
                var schemaIndexUsername = modifiedSchema.map(function(s) {
                    return s.attribute;
                }).indexOf('username');
                if (login_pre.username.indexOf('@') !== -1) {
                    isEmailAsUsername = true;
                    modifiedSchema[schemaIndexUsername].test = validate.user_email();
                } else {
                    modifiedSchema[schemaIndexUsername].test = validate.user_username();
                }

                var login_test = validate.schema(modifiedSchema, login_pre);
                if (login_test.valid) {
                    // See if this username or email exists in the user database
                    var userToCompare = null;
                    if (isEmailAsUsername) {
                        var userByEmail = yield db.user_by_email_for_login(login_test.data.username);
                        if (userByEmail.success) {
                            if (userByEmail.data.length == 0) {
                                // Email not found (only return generic login failure error for security purposes)
                                return yield userLogin.invalidPost(login_pre, [errors.LOGIN_FAILURE()]);
                            } else {
                                userToCompare = userByEmail.data;
                            }
                        } else {
                            return yield userLogin.invalidPost(login_pre, [errors.LOGIN_FAILURE()]);
                        }
                    } else {
                        var userByUsername = yield db.user_by_username_for_login(login_test.data.username);
                        if (userByUsername.success) {
                            if (userByUsername.data.length == 0) {
                                // Username not found (only return generic login failure error for security purposes)
                                return yield userLogin.invalidPost(login_pre, [errors.LOGIN_FAILURE("username not found")]);
                            } else {
                                userToCompare = userByUsername.data;
                            }
                        } else {
                            return yield userLogin.invalidPost(login_pre, [errors.LOGIN_FAILURE("invalid field values")]);
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

                        var userUpdate = yield db.user_update(userLoginTimeUpdate, userToCompare.id);

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
                            return yield userLogin.success({
                                token: token
                            });
                        } else {
                            // Failed to Update Last Login Date When Logging In
                            return yield userLogin.invalidPost(login_pre, [errors.LOGIN_FAILURE("failed to update login_on")]);
                        }
                    } else {
                        // Password incorrect (only return generic login failure error for security purposes)
                        return yield userLogin.invalidPost(login_pre, [errors.LOGIN_FAILURE("password incorrect")]);
                    }

                } else {
                    // Request was not valid
                    return yield userLogin.invalidPost(login_pre, login_test.errors);
                }
            } catch (e) {
                return yield userLogin.catchErrors(e, login_pre);
            }
        },
        catchErrors: function(err, pre) {
            return function * (next) {
                // Database Connectivity Issue
                if (err.code == "ECONNREFUSED") {
                    return yield userLogin.invalidPost(pre, [errors.NEO4J_CONNECTION_ISSUE()]);
                }
                // Malformed Cypher Query
                else if (err.neo4j) {
                    if (err.neo4j.code && err.neo4j.code == "Neo.ClientError.Statement.InvalidSyntax") {
                        return yield userLogin.invalidPost(pre, [errors.NEO4J_MALFORMED_QUERY()]);
                    } else if (err.neo4j.code && err.neo4j.code == "Neo.ClientError.Schema.ConstraintViolation") {
                        return yield userLogin.invalidPost(pre, [errors.NEO4J_CONSTRAINT_VIOLATION()]);
                    } else {
                        return yield userLogin.invalidPost(pre, [errors.NEO4J_ERROR()]);
                    }
                } else {
                    // Unknown Error
                    if (err.success !== undefined) {
                        return yield userLogin.invalidPost(pre, err.errors);
                    } else {
                        return yield userLogin.invalidPost(pre, [errors.UNKNOWN_ERROR("userLogin --- " + err)]);
                    }
                }
            };
        }
    };
    return userLogin;
};