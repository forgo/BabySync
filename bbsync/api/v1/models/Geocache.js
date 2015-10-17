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

module.exports = function Geocache(REST, db, validate, errors, response) {

    // ---------------------------------------------------------------------
    // Geocache Validations
    // ---------------------------------------------------------------------
    var geocacheValidate = {
        title: function() {
            return validate.regex(/(^[a-zA-Z][a-zA-Z0-9 ,.!@#$%^&*()\-+]{2,128}$)/);
        },
        message: function() {
            return validate.regex(/(^[a-zA-Z][a-zA-Z0-9 ,.!@#$%^&*()\-+]{2,256}$)/);
        },
        lat: function() {
            return validate.latitude();
        },
        lng: function() {
            return validate.longitude();
        },
        currency: function() {
            return validate.regex(/^(FLAP|DOGE|BITCOIN)$/);
        },
        amount: function() {
            return validate.doubleRange({
                min: 0.05,
                max: 5000
            });
        },
        is_physical: function() {
            return validate.bool();
        },
        delay: function() {
            // Hours Between 1-360, excluding 0, padded 0s OK
            return validate.regex(/^0*(?:[1-9][0-9]?|360)$/);
        }
    };
    
    // ---------------------------------------------------------------------
    // Geocache Schema
    // ---------------------------------------------------------------------
    var geocacheSchema = [{
        attribute: "title",
        type: String,
        required: true,
        auto: false,
        test: geocacheValidate.title()
    }, {
        attribute: "message",
        type: String,
        required: true,
        auto: false,
        test: geocacheValidate.message()
    }, {
        attribute: "lat",
        type: Number,
        required: true,
        auto: false,
        test: geocacheValidate.lat()
    }, {
        attribute: "lng",
        type: Number,
        auto: false,
        required: true,
        auto: false,
        test: geocacheValidate.lng()
    }, {
        attribute: "currency",
        type: String,
        required: true,
        auto: false,
        test: geocacheValidate.currency()
    }, {
        attribute: "amount",
        type: Number,
        required: true,
        auto: false,
        test: geocacheValidate.amount()
    }, {
        attribute: "is_physical",
        type: Boolean,
        required: true,
        auto: false,
        test: geocacheValidate.is_physical()
    }, {
        attribute: "delay",
        type: Number,
        required: true,
        auto: false,
        test: geocacheValidate.delay()
    }];

    var geocache = new REST("Geocache", "g", geocacheSchema, db, validate, errors, response);
    geocache["schema"] = geocacheSchema;
    geocache["validate"] = geocacheValidate;
    return geocache;
};