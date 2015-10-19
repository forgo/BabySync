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

module.exports = function FindParent(db, validate, errors, response, parentSchema) {
    var findParent = function * (next) {
	    try {
            // TODO: Be sure this is being requested by authenticated user w/proper privileges

            // No parameter provided in URL
            if ((this.params.id == undefined || this.params.id == null) && _.isEmpty(this.query)) {
                return yield response.invalid([errors.PARENT_EMAIL_REQUIRED()]);
            }
            // Parameter exists in URL
            else {
                // Validate the email provided
                var email_test = validate.attribute(parentSchema, this.params.id, "email");
				if (email_test.valid) {
                    var parentByEmail = yield db.object_by_filter({email:email_test.data}, "Parent", "p", parentSchema);
                    if (parentByEmail.success) {
                    	if (parentByEmail.data.length == 1) {
                    		return yield response.success(parentByEmail.data[0]);
                    	}
                    	else {
                    		return yield response.invalid([errors.PARENT_NOT_FOUND(email_test.data)]);
                    	}
                    } else {
                    	return yield response.invalid([errors.PARENT_NOT_FOUND(email_test.data)]);
                    }
                } else {
                	return yield response.invalid([errors.PARENT_EMAIL_INVALID()]);
                }
            }
        } catch (e) {
            // Unknown Error
            return yield response.catchErrors(e, null);
        }
    }
    return findParent;
};