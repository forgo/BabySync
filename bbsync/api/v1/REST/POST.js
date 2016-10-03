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

module.exports = function POST(type, label, alias, schema, utility) {

    var parse = require('co-body');
    var _ = require('lodash');
    var bcrypt = require('co-bcrypt');

    var errors = utility.errors;
    var validate = utility.validate;
    var response = utility.response;
    var db = utility.db;

    var post = function * (next) {
       try {
            // TODO: Be sure this is being requested by authenticated user w/proper privileges
            var object_pre = yield parse(this);
            console.log("object_pre:", object_pre);
            var object_test = validate.schema(schema, object_pre);
            console.log("object_test:", object_test);
            if (object_test.valid) {

                // BEGIN: User-Specific Logic
                if(type.user) {
                    // Check if username / email already in use
                    var takenErrors = [];
                    var isTaken = false;

                    // if username is not provided in user creation, don't bother
                    if(!_.isEmpty(object_test.data.username)) {
                        var checkUsername = yield db.user_username_taken(object_test.data.username, label, alias);
                        if (checkUsername.success) {
                            if (checkUsername.taken) {
                                isTaken = true;
                                takenErrors.push(errors.USERNAME_TAKEN("username"));
                            }
                        } else {
                            return yield response.invalidPost(object_pre, checkUsername.errors);
                        }
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

                    // Creating new user so login_on is empty
                    object_test.data.login_on = "";
                }
                // END: User-Specific Logic

                // Add automatic date fields
                var now = new Date();
                object_test.data.created_on = now;
                object_test.data.updated_on = now;

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
    }

    return post;
};