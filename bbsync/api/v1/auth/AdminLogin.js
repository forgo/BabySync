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

module.exports = function AdminLogin(db, bcrypt, fs, jwt, parse, errors, validate, utility) {
    var adminLogin = {
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
                var modifiedSchema = adminLogin.schema;
                var schemaIndexUsername = modifiedSchema.map(function(s) {
                    return s.attribute;
                }).indexOf('username');
                if (login_pre.username.indexOf('@') !== -1) {
                    isEmailAsUsername = true;
                    modifiedSchema[schemaIndexUsername].test = validate.admin_email();
                } else {
                    modifiedSchema[schemaIndexUsername].test = validate.admin_username();
                }

                var login_test = validate.schema(modifiedSchema, login_pre);
                if (login_test.valid) {
                    // See if this username or email exists in the admin database
                    var adminToCompare = null;
                    if (isEmailAsUsername) {
                        var adminByEmail = yield db.admin_by_email_for_login(login_test.data.username);
                        if (adminByEmail.success) {
                            if (adminByEmail.data.length == 0) {
                                // Email not found (only return generic login failure error for security purposes)
                                return yield adminLogin.invalidPost(login_pre, [errors.LOGIN_FAILURE()]);
                            } else {
                                adminToCompare = adminByEmail.data;
                            }
                        } else {
                            return yield adminLogin.invalidPost(login_pre, [errors.LOGIN_FAILURE()]);
                        }
                    } else {
                        var adminByUsername = yield db.admin_by_username_for_login(login_test.data.username);
                        if (adminByUsername.success) {
                            if (adminByUsername.data.length == 0) {
                                // Username not found (only return generic login failure error for security purposes)
                                return yield adminLogin.invalidPost(login_pre, [errors.LOGIN_FAILURE("username not found")]);
                            } else {
                                adminToCompare = adminByUsername.data;
                            }
                        } else {
                            return yield adminLogin.invalidPost(login_pre, [errors.LOGIN_FAILURE("invalid field values")]);
                        }
                    }

                    // Admin Exists Once In DB, Compare Passwords
                    if (yield bcrypt.compare(login_test.data.password, adminToCompare.hash)) {
                        // Password Correct!
                        // Udpate "login_on" Date for Admin
                        var now = new Date();
                        var adminLoginTimeUpdate = {
                            login_on: now
                        };

                        var adminUpdate = yield db.admin_update(adminLoginTimeUpdate, adminToCompare.id);

                        if (adminUpdate.success) {
                            // You've logged in successfuly
                            // Set and return JWT
                            var privateKey = fs.readFileSync('v1/auth/ssl/demo.rsa');
                            var claims = {
                                iss: "digeocache",
                                username: adminToCompare.username,
                                admin: true
                            };
                            var token = jwt.sign(claims, privateKey, {
                                algorithm: 'RS256',
                                expiresInMinutes: 120
                            });
                            return yield adminLogin.success({
                                token: token
                            });
                        } else {
                            // Failed to Update Last Login Date When Logging In
                            return yield adminLogin.invalidPost(login_pre, [errors.LOGIN_FAILURE("failed to update login_on")]);
                        }
                    } else {
                        // Password incorrect (only return generic login failure error for security purposes)
                        return yield adminLogin.invalidPost(login_pre, [errors.LOGIN_FAILURE("password incorrect")]);
                    }

                } else {
                    // Request was not valid
                    return yield adminLogin.invalidPost(login_pre, login_test.errors);
                }
            } catch (e) {
                return yield adminLogin.catchErrors(e, login_pre);
            }
        },
        catchErrors: function(err, pre) {
            return function * (next) {
                // Database Connectivity Issue
                if (err.code == "ECONNREFUSED") {
                    return yield adminLogin.invalidPost(pre, [errors.NEO4J_CONNECTION_ISSUE()]);
                }
                // Malformed Cypher Query
                else if (err.neo4j) {
                    if (err.neo4j.code && err.neo4j.code == "Neo.ClientError.Statement.InvalidSyntax") {
                        return yield adminLogin.invalidPost(pre, [errors.NEO4J_MALFORMED_QUERY()]);
                    } else if (err.neo4j.code && err.neo4j.code == "Neo.ClientError.Schema.ConstraintViolation") {
                        return yield adminLogin.invalidPost(pre, [errors.NEO4J_CONSTRAINT_VIOLATION()]);
                    } else {
                        return yield adminLogin.invalidPost(pre, [errors.NEO4J_ERROR()]);
                    }
                } else {
                    // Unknown Error
                    if (err.success !== undefined) {
                        return yield adminLogin.invalidPost(pre, err.errors);
                    } else {
                        return yield adminLogin.invalidPost(pre, [errors.UNKNOWN_ERROR("adminLogin --- " + err)]);
                    }
                }
            };
        }
    };
    return adminLogin;
};