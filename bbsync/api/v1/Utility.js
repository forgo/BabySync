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

module.exports = function Utility(errors) {

    var utility = {
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
            if (errors) {
                obj.errors = errorsArray;
            }
            return obj;
        },
        middleware: {
            custom401: function * (next) {
                try {
                    yield next;
                } catch (err) {
                    if (401 == err.status) {
                        yield utility.middleware.unauthorized;
                    } else {
                        throw err;
                    }
                }
            },
            unauthorized: function * (next) {
                var json = utility.json_response(null, [errors.UNAUTHORIZED()]);
                this.type = "application/json";
                this.status = 401;
                this.body = json;
            },
            unprivileged: function * (next) {
            	console.log("GOT HEREEEEEEEE");
                var json = utility.json_response(null, [errors.UNPRIVILEGED()]);
                this.type = "application/json";
                this.status = 401;
                this.body = json;
            }
        }
    };
    return utility;
};