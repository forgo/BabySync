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

module.exports = function LOGIN(type, label, alias, schema, utility) {

    var parse = require('co-body');
    var _ = require('lodash');
    var bcrypt = require('co-bcrypt');
    var fs = require('fs');
    var jwt = require('koa-jwt');
    var req = require('koa-request');

    var errors = utility.errors;
    var validate = utility.validate;
    var response = utility.response;
    var db = utility.db;

    var login = function * (next) {
        try {
            var login_pre = yield parse(this);
            var login_test = yield validate.login(schema, login_pre, req);
            if (login_test.valid) {

                var userToCompare = null;

                if (login_test.isValidOAuth) {
                    // * MUST RETURN FROM THIS CONDITION, BEFORE PASSWORD COMPARISON
                    // * OAuth doesn't require the password explicitly
                    var method = login_test.data.authMethod
                    var oAuthEmail = login_test.data.email
                    var oAuth = login_test.data.oAuth

                    // Regardless of login method, is email being used?
                    var emailExists

                    if(method == "Google") {
                        // Customized schema for Google login
                        var googleReturnSchema = schema.slice(0);
                        googleReturnSchema.push(
                            {
                                attribute: "googleID",
                                type: "text",
                                required: true,
                                test: validate.googleID()
                            }
                        );
                        // Password not needed to pass Google OAuth
                        googleReturnSchema = googleReturnSchema.filter(function(s) {
                            return (s.attribute != "password");
                        });

                        // Check for existence of User with this valid Google ID
                        // TODO: is Google's success response property "id"?
                        var userByGoogleID = yield db.user_by_google_id(oAuth.id, label, alias, googleReturnSchema);
                        console.log("userByGoogleID = ", userByGoogleID);
                        if (userByGoogleID.success) {
                            if(userByGoogleID.data.length == 0) {
                                // No User has that Google ID
                                var newGoogleUser = { email: oAuthEmail, googleID: oAuth.id };
                                // Validate our create data with customized schema
                                var new_google_user_test = validate.schema(googleReturnSchema, newGoogleUser);
                                if (new_google_user_test.valid) {
                                    // Attempt to create new User in DB
                                    var newGoogleUserCreate = yield db.user_create(newGoogleUser, label, alias, googleReturnSchema);
                                    if (newGoogleUserCreate.success) {
                                        // Successfully created new User with Google ID
                                        // Sign a token and generate response
                                        var token = utility.security.signJWT("Google", newGoogleUserCreate.data.email, false);
                                        return yield response.success({ token: token, email: newGoogleUserCreate.data.email });
                                    } else {
                                        // Failed to create new user with Google ID
                                        return yield response.invalidPost(login_pre, [errors.LOGIN_FAILURE("failed to create new user via Google")]);
                                    }
                                } else {
                                    return yield response.invalidPost(login_pre, [errors.LOGIN_FAILURE("failed to validate new user via Google")]);
                                }    
                            } else {
                                // User found with this valid Google ID
                                // Sign a token and generate response
                                var token = utility.security.signJWT("Google", userByGoogleID.data.email, false);
                                return yield response.success({ token: token, email: userByGoogleID.data.email });
                            }
                        } else {
                            return yield response.invalidPost(login_pre, [errors.LOGIN_FAILURE("failed to login via Google")]);
                        }
                    }
                    else if(method == "Facebook") {
                        // Customized schema for Facebook login
                        var facebookReturnSchema = schema.slice(0);
                        facebookReturnSchema.push(
                            {
                                attribute: "facebookID",
                                type: "text",
                                required: true,
                                test: validate.facebookID()
                            }
                        );
                        // Password not needed to pass Facebook OAuth
                        facebookReturnSchema = facebookReturnSchema.filter(function(s) {
                            return (s.attribute != "password");
                        });

                        // Check for existence of User with this valid Facebook ID
                        var userByFacebookID = yield db.user_by_facebook_id(oAuth.id, label, alias, facebookReturnSchema);
                        console.log("userByFacebookID = ", userByFacebookID);
                        if (userByFacebookID.success) {
                            if(userByFacebookID.data.length == 0) {
                                // No User has that Facebook ID
                                var newFacebookUser = { email: oAuthEmail, facebookID: oAuth.id };
                                // Validate our create data with customized schema
                                var new_facebook_user_test = validate.schema(facebookReturnSchema, newFacebookUser);
                                console.log("new_facebook_user_test = ", new_facebook_user_test);
                                if (new_facebook_user_test.valid) {
                                    // Attempt to create new User in DB
                                    var newFacebookUserCreate = yield db.user_create(newFacebookUser, label, alias, facebookReturnSchema);
                                    if (newFacebookUserCreate.success) {
                                        // Successfully created new User with Facebook ID
                                        // Sign a token and generate response
                                        var token = utility.security.signJWT("Facebook", newFacebookUserCreate.data.email, false);
                                        return yield response.success({ token: token, email: newFacebookUserCreate.data.email });
                                    } else {
                                        // Failed to create new user with Facebook ID
                                        return yield response.invalidPost(login_pre, [errors.LOGIN_FAILURE("failed to create new user via Facebook")]);
                                    }
                                } else {
                                    return yield response.invalidPost(login_pre, [errors.LOGIN_FAILURE("failed to validate new user via Facebook")]);
                                }    
                            } else {
                                // User found with this valid Facebook ID
                                // Sign a token and generate response
                                var token = utility.security.signJWT("Facebook", userByFacebookID.data.email, false);
                                return yield response.success({ token: token, email: userByFacebookID.data.email });
                            }
                        } else {
                            return yield response.invalidPost(login_pre, [errors.LOGIN_FAILURE("failed to login via Facebook")]);
                        }
                    }
                }
                else if (login_test.isEmailAsUsername) {
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
                        // Sign the token and generate response
                        var token = utility.security.signJWT("BabySync", userUpdate.data.email, false);
                        return yield response.success({ token: token, email: userUpdate.data.email });
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
    }

    return login;
};