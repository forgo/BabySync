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

module.exports = function Parent(REST, db, validate, errors, response) {

    // ---------------------------------------------------------------------
    // Parent Validations
    // ---------------------------------------------------------------------
    var parentValidate = {
        name: function() {
            return validate.regex(/^([a-zA-Z]{2,29})([\s]{1})([a-zA-Z]{2,29})$/);
        },
        email: function() {
            return validate.regex(/[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum)\b/);
        },
        facebookID: function() {
            return validate.regex(/^([\d]{1,20})$/);
        },
        googleID: function() {
            return validate.regex(/^([\d]{1,20})$/);
        }
    };
    
    // ---------------------------------------------------------------------
    // Parent Schema
    // ---------------------------------------------------------------------
    var parentSchema = [{
        attribute: "name",
        type: "String",
        required: true,
        auto: false,
        test: parentValidate.name()
    }, {
        attribute: "email",
        type: "String",
        required: true,
        auto: false,
        test: parentValidate.email()
    }, {
        attribute: "facebookID",
        type: "String",
        required: false,
        auto: false,
        test: parentValidate.facebookID()
    }, {
        attribute: "googleID",
        type: "String",
        required: false,
        auto: false,
        test: parentValidate.googleID()
    }];

    var parent = new REST("Parent", "p", parentSchema, db, validate, errors, response);
    parent["schema"] = parentSchema;
    parent["validate"] = parentValidate;
    return parent;
};