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

module.exports = function MergeFamily(utility, parentSchema, familySchema) {

    // Database Extensions for Complex App Queries
    var dbBabySync = require('../DatabaseBabySync.js')(db);

    var parse = require('co-body');
    var _ = require('lodash');

    var errors = utility.errors;
    var validate = utility.validate;
    var response = utility.response;
    var db = utility.db;
    
    var mergeFamily = function * (next) {
        try {
            // TODO: Be sure this is being requested by authenticated user w/proper privileges
            
            var parent_pre = yield parse(this);

            // No parameter provided in URL
            if ((this.params.id == undefined && this.params.id == null) && _.isEmpty(this.query)) {
                return yield response.invalidPost(parent_pre, [errors.FAMILY_ID_REQUIRED()]);
            }
            // Parameter exists in URL
            else {
                // Try to identify existing family to merge
                var existingFamily = undefined;

                // Validate the ID provided
                var id_test = validate.id(this.params.id);

                if (id_test.valid) {
                    existingFamily = yield db.object_by_id(id_test.data.toString(), "Family", "f", familySchema);
                    if (!existingFamily.success) {
                        return yield response.invalidPost(parent_pre, existingFamily.errors);
                    }
                } else {
                    return yield response.invalidPost(parent_pre, [errors.UNIDENTIFIABLE(this.params.id)]);
                }

                // Need to be sure this gives back an object and not empty array!
                if (existingFamily.data.length == 0) {
                    return yield response.invalidPost(parent_pre, [errors.UNIDENTIFIABLE(this.params.id)]);
                }

                // If we got this far, we must have found a match.
                // Now validate email of parent who wants to merge the new family
				var parent_test = validate.schemaForAttributes(parentSchema, ["email"], parent_pre);
	            if (parent_test.valid) {
	            	// Request DB Family Join
	            	var merge = yield dbBabySync.family_merge(existingFamily.data.id, parent_test.data.email);
	                if (merge.success) {
	                    return yield response.success(merge.data);
	                } else {
	                    return yield response.invalidPost(parent_pre, merge.errors);
	                }
	            }
	            else {
	            	// Request was not valid,
	                return yield response.invalidPost(parent_pre, parent_test.errors);
	            }
	        }

        } catch (e) {
            return yield response.catchErrors(e, parent_pre);
        }
    }
    return mergeFamily;
};