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

module.exports = function Activity(REST, db, validate, errors, response) {

    // ---------------------------------------------------------------------
    // Activity Validations
    // ---------------------------------------------------------------------
    var activityValidate = {
        name: function() {
            return validate.regex(/^[a-zA-Z][a-zA-Z0-9_]{2,29}$/);
        },
        icon: function() {
            return validate.regex(/^[a-zA-Z][a-zA-Z0-9_]{2,29}$/);
        },
        warn: function() {
            return validate.doubleRange({
                min: 600.0,
                max: 604800.0
            });
        },
        critical: function() {
            return validate.doubleRange({
                min: 600.0,
                max: 604800.0
            });
        }
    };
    
    // ---------------------------------------------------------------------
    // Activity Schema
    // ---------------------------------------------------------------------
    var activitySchema = [{
        attribute: "name",
        type: "String",
        required: true,
        auto: false,
        test: activityValidate.name()
    }, {
        attribute: "icon",
        type: "String",
        required: true,
        auto: false,
        test: activityValidate.icon()
    }, {
        attribute: "warn",
        type: "Double",
        required: true,
        auto: false,
        test: activityValidate.warn()
    }, {
        attribute: "critical",
        type: "Double",
        required: true,
        auto: false,
        test: activityValidate.critical()
    }];

    var activity = new REST("Activity", "a", activitySchema, db, validate, errors, response);
    activity["schema"] = activitySchema;
    activity["validate"] = activityValidate;
    return activity;
};