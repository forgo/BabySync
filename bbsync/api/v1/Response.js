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

module.exports = function Response(errors) {
    var response = {
        json_response: function(data, errorsArray) {
            var obj = {};
            if (data) {
                obj.data = data;
            }
            if (errorsArray) {
                obj.errors = errorsArray;
            }
            return JSON.stringify(obj, null, 4);
        },
        object_response: function(data, errorsArray) {
            var obj = {};
            if (data) {
                obj.data = data;
            }
            if (errorsArray) {
                obj.errors = errorsArray;
            }
            return obj;
        },
        success: function(data) {
            return function * (next) {
                var json = response.json_response(data, null);
                this.type = "application/json";
                this.body = json;
            };
        },
        invalid: function(errors) {
            return function * (next) {
                var json = response.json_response(null, errors);
                this.type = "application/json";
                this.body = json;
            };
        },
        invalidPost: function(pre, errors) {
            return function * (next) {
                var json = response.json_response(pre, errors);
                this.type = "application/json";
                this.body = json;
            };
        },
        unauthorized: function * (next) {
            var json = response.json_response(null, [errors.UNAUTHORIZED()]);
            this.type = "application/json";
            this.status = 401;
            this.body = json;
        },
        unprivileged: function * (next) {
            var json = response.json_response(null, [errors.UNPRIVILEGED()]);
            this.type = "application/json";
            this.status = 401;
            this.body = json;
        },
        custom401: function * (next) {
            try {
                yield next;
            } catch (err) {
                if (401 == err.status) {
                    yield response.unauthorized;
                } else {
                    throw err;
                }
            }
        },
        catchErrors: function(err, pre, context) {
            return function * (next) {
                var errs = [errors.UNKNOWN_ERROR(context)];
                if (!err.success && err.errors) {
                    errs = err.errors;
                }
                return yield response.invalidPost(pre, errs);
            };
        }
    };
    return response;
};