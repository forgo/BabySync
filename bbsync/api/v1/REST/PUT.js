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

module.exports = function PUT(type, label, alias, schema, utility) {

    var parse = require('co-body');
    var _ = require('lodash');
    var bcrypt = require('co-bcrypt');

    var errors = utility.errors;
    var validate = utility.validate;
    var response = utility.response;
    var db = utility.db;

    var put = function * (next) {
        // console.log("object.put");
        try {
            // TODO: Be sure this is being requested by authenticated user w/proper privileges

            // Request payload
            var object_pre = yield parse(this);



            // No parameter provided in URL
            if ((this.params.id == undefined && this.params.id == null) && _.isEmpty(this.query)) {
                // Perhaps request is for a batch update
                // batch_test = validate.schemaForBatchUpdate(schema, object_pre);
                // if (batch_test.valid) {
                //     // Loop through validated data and perform updates
                // }
                // else {
                //     return yield response.invalidPost(object_pre, batch_test.errors);
                // }
                return yield response.invalidPost(object_pre, [errors.UNSUPPORTED()]);
            }
            // Parameter exists in URL
            else {
                // Try to identify existing object
                var existingObject = undefined;

// -----------------------------------------------------------------------------
// START USER SPECIFIC LOGIC
// -----------------------------------------------------------------------------
// Try to identify existing user
var user_test = yield validate.userID(this.params.id, schema, label, alias, schema, db);
if (user_test.valid) {
existingObject = user_test.data
} else {
return yield response.invalidPost(object_pre, user_test.errors);
}
// -----------------------------------------------------------------------------
// END USER SPECIFIC LOGIC
// -----------------------------------------------------------------------------

                // If we got this far, we must have found a match.
                // Now validate what we're trying to update
                object_test = validate.schemaForUpdate(schema, object_pre);
                if (object_test.valid) {

// -----------------------------------------------------------------------------
// START USER SPECIFIC LOGIC
// -----------------------------------------------------------------------------
// Is the user trying to change their password?
if (object_test.data.password) {
// Generate new salt/hash using bcrypt
var salt = yield bcrypt.genSalt(10);
var hash = yield bcrypt.hash(object_test.data.password, salt);
// Delete password key/value from update object, replace w/hash
var pw = object_test.data.password;
delete object_test.data.password;
object_test.data.hash = hash;
}
// -----------------------------------------------------------------------------
// END USER SPECIFIC LOGIC
// -----------------------------------------------------------------------------

                    // Add automatic date fields
                    var now = new Date();
                    object_test.data.updated_on = now;
                    // Request DB update
                    var objectUpdate = yield db.user_update(existingObject.id, object_test.data, label, alias, schema);
                    if (objectUpdate.success) {
                        return yield response.success(objectUpdate.data);
                    } else {
                        return yield response.invalidPost(object_pre, objectUpdate.errors);
                    }
                } else {
                    return yield response.invalidPost(object_pre, object_test.errors);
                }
            }
        } catch (e) {
            return yield response.catchErrors(e, object_pre);
        }
    }

    return put;
};