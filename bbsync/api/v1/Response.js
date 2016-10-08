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
        // Package data and errors in JSON format
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
        // Package data and errors as Javascript object
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
        // Successful response:
        // - yield data as JSON
        success: function(data) {
            return function * (next) {
                var json = response.json_response(data, null);
                this.type = "application/json";
                this.body = json;
            };
        },
        // Invalid response
        // - yield errors as JSON
        invalid: function(errors) {
            return function * (next) {
                var json = response.json_response(null, errors);
                this.type = "application/json";
                this.body = json;
            };
        },
        // Invalid responses due to request payload
        // - yield failed payload as data
        // - yield errors describing why the input failed
        invalidPayload: function(payload, errors) {
            return function * (next) {
                var json = response.json_response(payload, errors);
                this.type = "application/json";
                this.body = json;
            };
        },
        // Catch unanticipated errors:
        // - yield failed input (payload), if it exists, as data
        // - yield generic error unless the catch found more useful errors
        catchErrors: function(err, payload, context) {
            return function * (next) {
                var errs = [errors.UNKNOWN_ERROR(context)];
                if (!err.success && err.errors) {
                    errs = err.errors;
                }
                return yield response.invalidPayload(payload, errs);
            };
        },
        // Convenience security response for users who are not logged in
        // and are trying to access a private resource.
        unauthorized: function * (next) {
            var json = response.json_response(null, [errors.UNAUTHORIZED()]);
            this.type = "application/json";
            this.status = 401;
            this.body = json;
        },
        // Convenience security response for users who are logged in
        // but do not have privileges to access a particular private resource.
        unprivileged: function * (next) {
            var json = response.json_response(null, [errors.UNPRIVILEGED()]);
            this.type = "application/json";
            this.status = 401;
            this.body = json;
        },
        // Convenience security 401 handler to avoid early exposure to koa-jwt
        // and other errors.
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
        }
    };
    return response;
};