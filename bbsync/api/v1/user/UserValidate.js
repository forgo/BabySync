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

module.exports = function UserValidate(errors) {

    var moment = require('moment');

    var userValidate = {
        user_username: function() {
            return this.regex(/^[a-zA-Z][a-zA-Z0-9_]{2,29}$/);
        },
        user_password: function() {
            return this.regex(/^(?=[^\d_].*?\d)\w(\w|[!@#$%]){7,20}/);
        },
        user_email: function() {
            return this.regex(/[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum)\b/);
        },
        user_birthday: function() {
            var minAge = 18;
            var maxAge = 120;
            var minMoment = moment().subtract(maxAge, 'years');
            var maxMoment = moment().subtract(minAge, 'years');
            return this.dateInRange({
                min: minMoment,
                max: maxMoment
            });
        },
        user_phone: function() {
            return this.regex(/^[a-zA-Z0-9]+$/);
        },
        user_firstname: function() {
            return this.regex(/^[a-zA-Z0-9]+$/);
        },
        user_lastname: function() {
            return this.regex(/^[a-zA-Z0-9]+$/);
        }
    };
    return userValidate;
}