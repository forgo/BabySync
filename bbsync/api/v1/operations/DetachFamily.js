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

module.exports = function DetachFamily(utility, parent) {

    // Database Extensions for Complex App Queries
    var dbBabySync = require('../DatabaseBabySync.js')(db);

    var parse = require('co-body');
    var _ = require('lodash');

    var errors = utility.errors;
    var validate = utility.validate;
    var response = utility.response;
    var db = utility.db;
    
    var detachFamily = function * (next) {
    	try {
    	    // TODO: Be sure this is being requested by authenticated user w/proper privileges
            var payload = yield parse(this);
            var parent_test = validate.schemaForAttributes(parent.model.schema, ["email"], payload);
            if (parent_test.valid) {
            	// Request DB Family Join
            	var detach = yield dbBabySync.family_detach(parent_test.data.email);
                if (detach.success) {
                    return yield response.success(detach.data);
                } else {
                    return yield response.invalidPayload(payload, detach.errors);
                }
            }
            else {
            	// Request was not valid,
                return yield response.invalidPayload(payload, parent_test.errors);
            }
        } catch (e) {
            return yield response.catchErrors(e, payload);
        }
    }
    return detachFamily;
};