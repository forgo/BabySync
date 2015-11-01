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

module.exports = function User(RESTUser, db, validate, errors, response) {
    
    // ---------------------------------------------------------------------
    // User Validations
    // ---------------------------------------------------------------------
    var userValidate = {
        email: function() {
            return validate.regex(/[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum)\b/);
        },
        username: function() {
            return validate.regex(/^[a-zA-Z][a-zA-Z0-9_]{2,29}$/);
        },
        password: function() {
            return validate.regex(/^(?=[^\d_].*?\d)\w(\w|[!@#$%]){7,20}/);
        },
        firstname: function() {
            return validate.regex(/^[a-zA-Z0-9]+$/);
        },
        lastname: function() {
            return validate.regex(/^[a-zA-Z0-9]+$/);
        },
        birthday: function() {
            return validate.ageInRange({
                min: 18,
                max: 120
            });
        },
        phone: function() {
            return validate.regex(/^[a-zA-Z0-9]+$/);
        }
    };

    // ---------------------------------------------------------------------
    // User Schema
    // ---------------------------------------------------------------------
    var userSchema = [{
        attribute: "email",
        type: "text",
        required: true,
        test: userValidate.email()
    }, {
        attribute: "username",
        type: "text",
        required: true,
        test: userValidate.username()
    }, {
        attribute: "password",
        type: "password",
        required: true,
        test: userValidate.password()
    }, {
        attribute: "firstname",
        type: "text",
        required: false,
        test: userValidate.firstname()
    }, {
        attribute: "lastname",
        type: "text",
        required: false,
        test: userValidate.lastname()
    }, {
        attribute: "birthday",
        type: "date",
        required: false,
        test: userValidate.birthday()
    }, {
        attribute: "phone",
        type: "text",
        required: false,
        test: userValidate.phone()
    }];

    var user = new RESTUser("User", "u", userSchema, db, validate, errors, response);
    user["schema"] = userSchema;
    user["validate"] = userValidate;
    return user;
};