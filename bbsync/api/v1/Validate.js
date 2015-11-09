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

module.exports = function Validate(errors) {

    var _ = require('lodash');
    var moment = require('moment');

    var validate = {
        isEmpty: function(data) {
            if (typeof(data) == "number" || typeof(data) == "boolean") {
                return false;
            }
            if (typeof(data) == "undefined" || data == null) {
                return true;
            }
            if (typeof(data.length) != 'undefined') {
                return data.length === 0;
            }
            var count = 0;
            for (var i in data) {
                if (data.hasOwnProperty(i)) {
                    count++;
                }
            }
            return count === 0;
        },
        schema: function(sch, pre) {
            var valid = true;
            var errorArray = [];

            // Provided Schema Should Never Be Empty
            if (validate.isEmpty(sch)) {
                valid = false;
                errorArray.push(errors.SCHEMA_UNDEFINED());
            }

            // Error early for undefined/empty schema
            if(!valid) {
                return {
                    valid: valid,
                    errors: errorArray
                };
            }

            // Fields Provided
            var fields = Object.keys(pre);

            // Ensure Fields Provided are Unique
            var repeatedFields = _.uniq(_.filter(fields, function(x,i,fields) {
                return _.contains(fields,x,i+1);
            }));

            for (var repeatedField in repeatedFields) {
                valid = false;
                errorArray.push(errors.ATTRIBUTE_NOT_UNIQUE(repeatedField));
            }

            var uniqueFields = _.uniq(fields);

            // Required or not, if a field provided is not in the schema, error
            // This also does a sanity check on your schema for multiple definitions
            for (var i = 0; i < uniqueFields.length; i++) {
                var schemesForField = sch.filter(function(s) {
                    return s.attribute == uniqueFields[i];
                });
                // Should never pass data that doesn't exist in schema
                // Generic updates use validate.schemaForUpddate to properly modify schema
                if(schemesForField.length == 0) {
                    valid = false;
                    errorArray.push(errors.ATTRIBUTE_UNEXPECTED(uniqueFields[i]));
                }
                // Should never find multiple schemes with the same attribute
                if(schemesForField.length > 1) {
                    valid = false;
                    errorArray.push(errors.ATTRIBUTE_TEST_AMBIGUOUS(uniqueFields[i]));                    
                }
            }

            // Error early for field repeats, bad schema, or extraneous schemes
            if (!valid) {
                return {
                    valid: valid,
                    errors: errorArray
                };
            }

            // For each scheme defined in schema
            for (var i = 0; i < sch.length; i++) {
                var scheme = sch[i];
                var fieldAttribute = scheme.attribute;

                var isFieldMissing = false;
                var isFieldEmpty = false;
                var fieldValue = null;

                // Is this scheme attribute missing or empty in provided data?
                isFieldMissing = !(fields.indexOf(fieldAttribute) in fields);
                if (!isFieldMissing) {
                    fieldValue = pre[fieldAttribute].trim();
                    isFieldEmpty = validate.isEmpty(fieldValue);
                }

                // The scheme attribute is missing or empty
                if (isFieldMissing || isFieldEmpty) {

                    // Required fields missing results in a validation error
                    if (scheme.required) {
                        valid = false;
                        errorArray.push(errors.ATTRIBUTE_REQUIRED(fieldAttribute));
                    }
                    // Otherwise this field can be ignored as empty
                    else {
                        pre[fieldAttribute] = "";
                    }
                    // Continue to the next scheme check without collecting futher errors
                    continue;
                }
                // The field is present and not empty, perform validation test
                else {
                    if (typeof(scheme.test) == "function" && scheme.test.length == 2) {
                        var test = scheme.test(fieldAttribute, fieldValue ? fieldValue : "");
                        if (test.valid) {
                            pre[fieldAttribute] = test.data;
                        } else {
                            valid = false;
                            errorArray = errorArray.concat(test.errors);
                        }
                    }
                    // Scheme attributes must have an associated 'test' validation function.
                    // which takes the attribute name and attribute value as parameters.
                    else {
                        valid = false;
                        errorArray.push(errors.ATTRIBUTE_TEST_REQUIRED(fieldAttribute));
                    }
                }
            } // end for

            if (valid) {
                return {
                    valid: valid,
                    data: pre
                };
            } else {
                return {
                    valid: valid,
                    errors: errorArray
                };
            }
        },
        schemaForAttributes: function(sch, atts, pre) {
            // Provided Schema Should Never Be Empty
            if (validate.isEmpty(sch)) {
                return {
                    valid: false,
                    errors: [errors.SCHEMA_UNDEFINED()]
                };
            }
            // Attributes should always be an array of strings
            if (!_.isArray(atts)) {
                return {
                    valid: false,
                    errors: [errors.SCHEMA_ATTRIBUTE_FILTER_INVALID()]
                };
            }
            else {
                _.each(atts, function(att) {
                    if(!_.isString(att)) {
                        return {
                            valid: false,
                            errors: [errors.SCHEMA_ATTRIBUTE_FILTER_INVALID()]
                        };
                    }
                });
            }
            // Ensure Fields Provided are Unique
            var repeatedAttributes = _.uniq(_.filter(atts, function(x,i,atts) {
                return _.contains(atts,x,i+1);
            }));
            if (repeatedAttributes.length != 0) {
                return {
                    valid: false,
                    errors: [errors.SCHEMA_ATTRIBUTE_FILTER_INVALID()]
                };
            }
            // Attribute filter must contain attributes in schema
            for (var i = 0; i < atts.length; i++) {
                var schemesForAttribute = sch.filter(function(s) {
                    return s.attribute == atts[i];
                });
                if(schemesForAttribute.length == 0) {
                    return {
                        valid: false,
                        errors: [errors.SCHEMA_ATTRIBUTE_FILTER_INVALID()]
                    };
                }
            }
            var modifiedSchema = _.filter(sch, function(s) {
                // if s.attribute is a field in pre
                var f = _.findIndex(atts, function(attribute) {
                    return attribute == s.attribute;
                });
                return f != -1;
            });
            return validate.schema(modifiedSchema, pre);
        },
        schemaForUpdate: function(sch, pre) {
            // Provided Schema Should Never Be Empty
            if (validate.isEmpty(sch)) {
                return {
                    valid: false,
                    errors: [errors.SCHEMA_UNDEFINED()]
                };
            }
            // Make sure we are providing something to update at all
            if ("false" in pre) {
                return {
                    valid: false,
                    errors: [errors.UPDATE_EMPTY()]
                };
            }
            // Modified schema returns common fields with update fields.
            // Calling validate.schema checks for empty schemas as well as
            // extraneous fields in pre that aren't in sch. This means updates
            // only pass when the fields provided are a subset or the same set 
            // as the attributes in sch
            var updateSchema = _.filter(sch, function(s) {
                // if s.attribute is a field in pre
                var f = _.findIndex(_.keys(pre), function(field) {
                    return field == s.attribute;
                });
                return f != -1;
            });
            if (validate.isEmpty(updateSchema)) {
                return {
                    valid: false,
                    errors: [errors.UPDATE_MISMATCH()]
                };
            }
            return validate.schema(updateSchema, pre);
        },
        attribute: function(sch, pre, att) {
            // Extract Scheme from Schema Which Defines Attribute
            var attributeSchemes = sch.filter(function(s) {
                return s.attribute == att;
            });
            var attributeScheme = attributeSchemes[0];
            if (typeof(attributeScheme.test) == "function" && attributeScheme.test.length == 2) {
                return attributeScheme.test(att, pre ? pre : "");
            }
            return {
                valid: false,
                errors: [errors.ATTRIBUTE_TEST_REQUIRED(att)]
            };
        },
        id: function(pre) {
            if (Number.isInteger(Number(pre)) && (pre !== null) && (pre !== undefined)) {
                return {
                    valid: true,
                    data: pre
                };
            }
            return {
                valid: false,
                errors: [errors.ATTRIBUTE_INVALID("id")]
            };
        },
        getQueryVariable: function(queryStr, queryVar) {
            var queryVars = queryStr.split('&');
            for (var i = 0; i < queryVars.length; i++) {
                var pair = queryVars[i].split('=');
                if (decodeURIComponent(pair[0]) == queryVar) {
                    return decodeURIComponent(pair[1]);
                }
            }
            return null;
        },
        facebookResponseBody: function(body) {
            var response = {}
            console.log("facebookResponseBody = ", body);
            if(body.error || !body.name || !body.id) {
                response.valid = false;
            }
            else {
                response.valid = true;
            }
            return response;
        },
        googleResponseBody: function(body) {
            var response = {}
            console.log("googleResponseBody = ", body);
            if(body.error || !body.name || !body.id) {
                
            }

            response.valid = true;
            return response;
        },
        ////////////////////////////////////////////////////////////////////////
        login: function(sch, pre, req) {
            return function * (next) {

                var response = {};

                // Valid Login Method Definitions
                var authMethods = [{
                    type: "Custom",
                    validTokenURL: null,
                    validateResponse: null
                }, {
                    type: "Facebook",
                    validTokenURL: "https://graph.facebook.com/me?access_token={accessToken}",
                    validateResponse: validate.facebookResponseBody
                }, {
                    type: "Google",
                    validTokenURL: "https://www.googleapis.com/oauth2/v1/tokeninfo?access_token={accessToken}",
                    validateResponse: validate.googleResponseBody
                }];

                // Extract/delete authMethod and token key/value from login object
                var authMethod = "Custom";
                if(pre.authMethod) {
                    var authMethodMatches = authMethods.filter(function(method) {
                        return method.type == pre.authMethod;
                    });
                    if (authMethodMatches.length == 1) {


                        // email/username and password  unexpected with
                        // accessToken for oAuth provider and vice-versa
                        if((pre.email || pre.username || pre.password) && pre.accessToken) {
                            response.valid = false;
                            response.errors = [errors.LOGIN_FAILURE("expected credentials or accessToken, not both")];
                            return response;
                        }

                        authMethod = pre.authMethod;
                        delete pre.authMethod;
                        var method = authMethodMatches[0];

                        // No token was provided and auth method needs it
                        if(!pre.accessToken && method.validTokenURL != null) {
                            response.valid = false;
                            response.errors = [errors.LOGIN_TOKEN_EXPECTED(authMethod)];
                            return response;
                        }
                        // Token provided and we have an auth service to check against
                        else if(pre.accessToken && method.validTokenURL != null) {

                            var tokenURL = method.validTokenURL.replace(/\{accessToken\}/, pre.accessToken);
                            var options = { url: tokenURL };
                            var tokenCheckResponse = yield req(options);

                            var tokenCheckBody = JSON.parse(tokenCheckResponse.body);
                            var token_test = method.validateResponse(tokenCheckBody);
                            console.log("TOKEN TEST = ", token_test);
                            if(!token_test.valid) {
                                response.valid = false;
                                response.errors = [errors.LOGIN_TOKEN_INVALID(authMethod)];
                                return response;
                            }
                            else {
                                console.log("TOKEN TEST WAS VALID, data = ");
                                console.log(token_test.data);
                                // Effectively need to ADD the username here that comes 
                                // back from oAuth validated token into our pre data
                                // since 
                            }
                        }
                        else if(pre.accessToken && method.validTokenURL == null) {
                            response.valid = false;
                            response.errors = [errors.LOGIN_TOKEN_UNVERIFIABLE(authMethod)];
                        }
                    }
                    else {
                        response.valid = false;
                        response.errors = [errors.LOGIN_TYPE_INVALID(pre.authMethod)];
                        return response;
                    }
                }
                else {
                    response.valid = false;
                    response.errors = [errors.LOGIN_TYPE_UNSPECIFIED()];
                    return response;
                }

                // Remove Non-Schema Validatable Items Already Processed
                if(pre.authMethod) {
                    delete pre.authMethod;
                }

                if(pre.accessToken) {
                    delete pre.accessToken;
                }

                //////
                var isEmailAsUsername = true;
                if(pre.email && pre.username) {
                    response.valid = false;
                    response.errors = [errors.LOGIN_FAILURE("expected email or username, not both")];
                    return response;
                }

                if(!pre.email && !pre.username) {
                    response.valid = false;
                    response.errors = [errors.LOGIN_FAILURE("expected email or username")];
                    return response;
                }

                if(pre.username) {
                    isEmailAsUsername = false
                }
                /////

                // We only care about email/username and password for login schema
                var modifiedSchema = sch.filter(function(s) {
                    return (s.attribute == (isEmailAsUsername ? "email" : "username")) || (s.attribute == "password");
                });

                var login_schema_test = validate.schema(modifiedSchema, pre);

                if (login_schema_test.valid) {
                    response.valid = true;
                    response.data = login_schema_test.data;
                    response.isEmailAsUsername = isEmailAsUsername;
                } 
                else {
                    response.valid = false;
                    response.errors = errors.login_schema_test.errors;
                }
                return response;
            }
        },
        ////////////////////////////////////////////////////////////////////////
        userID: function(userID, userSchema, label, alias, returnSchema, db) {
            return function * (next) {
                var response = {};
                var id_test = validate.id(userID);
                var username_test = validate.attribute(userSchema, userID, "username");
                var email_test = validate.attribute(userSchema, userID, "email");

                if (id_test.valid) {
                    var userByID = yield db.user_by_id(id_test.data.toString(), label, alias, returnSchema);
                    if (userByID.success) {
                        response.valid = true;
                        response.data = userByID.data;
                    } else {
                        response.valid = false;
                        response.errors = userByID.errors;
                    }
                } else if (username_test.valid) {
                    var userByUsername = yield db.user_by_filter({username:username_test.data}, label, alias, returnSchema);
                    if (userByUsername.success) {
                        response.valid = true;
                        response.data = userByUsername.data;
                    } else {
                        response.valid = false;
                        response.errors = userByUsername.errors;
                    }
                } else if (email_test.valid) {
                    var userByEmail = yield db.user_by_filter({email:email_test.data}, label, alias, returnSchema);
                    if (userByEmail.success) {
                        response.valid = true;
                        response.data = userByEmail.data;
                    } else {
                        response.valid = false;
                        response.errors = userByEmail.errors;
                    }
                } else {
                    response.valid = false;
                    response.errors = [errors.UNIDENTIFIABLE(userID)];
                }
                // Need to be sure this gives back a User and not empty array!
                // Somehow we detected a valid id/username/email but still wasn't in DB
                if (response.valid == true && response.data.length == 0) {
                    response.valid = false;
                    response.errors = [errors.UNIDENTIFIABLE(userID)];
                }
                return response;
            };
        },
        geocacheID: function(geocacheID, geocacheSchema, db) {
            return function * (next) {
                var response = {};
                var id_test = validate.id(geocacheID);

                if (id_test.valid) {
                    var geocacheByID = yield db.geocache_by_id(id_test.data.toString());
                    if (userByID.success) {
                        response.valid = true;
                        response.data = userByID.data;
                    } else {
                        response.valid = false;
                        response.errors = userByID.errors;
                    }
                } else {
                    response.valid = false;
                    response.errors = [errors.UNIDENTIFIABLE(geocacheID)];
                }
                // Need to be sure this gives back a User and not empty array!
                // Somehow we detected a valid id but still wasn't in DB
                if (response.valid == true && response.data.length == 0) {
                    response.valid = false;
                    response.errors = [errors.UNIDENTIFIABLE(geocacheID)];
                }
                return response;
            };
        },
        ////////////////////////////////////////////////////////////////////////
        regex: function(regex) {
            return function(attribute, value) {
                var valid = regex.test(value);
                if (!valid) {
                    return {
                        valid: false,
                        errors: [errors.ATTRIBUTE_INVALID(attribute)]
                    };
                } else {
                    return {
                        valid: true,
                        data: value
                    };
                }
            };
        },
        bool: function() {
            return function(attribute, value) {
                if (_.isBoolean(value) || value == "true" || value == "false") {
                    var boolLiteral = undefined;
                    if (value == "true") {
                        boolLiteral = true;
                    } else if (value == "false") {
                        boolLiteral = false;
                    } else {
                        boolLiteral = value;
                    }
                    return {
                        valid: true,
                        data: boolLiteral
                    }
                } else {
                    return {
                        valid: false,
                        errors: [errors.ATTRIBUTE_INVALID(attribute)]
                    };
                }
            };
        },
        latitude: function() {
            return function(attribute, value) {
                if (value) {
                    var lat = Number(value);
                    if (lat >= -90 && lat <= 90) {
                        return {
                            valid: true,
                            data: lat
                        };
                    }
                }
                return {
                    valid: false,
                    errors: [errors.ATTRIBUTE_INVALID(attribute)]
                };
            };
        },
        longitude: function() {
            return function(attribute, value) {
                if (value) {
                    var lng = Number(value);
                    if (lng >= -180 && lng <= 180) {
                        return {
                            valid: true,
                            data: lng
                        };
                    }
                }
                return {
                    valid: false,
                    errors: [errors.ATTRIBUTE_INVALID(attribute)]
                };
            };
        },
        coordinate: function() {
            return function(attribute, value) {
                if (value) {
                    var coords = value.split(',');
                    if (coords.length == 2) {
                        var lat = coords[0];
                        var lng = coords[1];
                        var test_lat = validate.latitude()("lat", lat);
                        var test_lng = validate.longitude()("lng", lng);
                        if (test_lat.valid && test_lng.valid) {
                            return {
                                valid: true,
                                data: {
                                    lat: test_lat.data,
                                    lng: test_lng.data
                                }
                            };
                        }
                    }
                }
                return {
                    valid: false,
                    errors: [errors.ATTRIBUTE_INVALID(attribute)]
                };
            };
        },
        doubleRange: function(range) {
            return function(attribute, value) {
                if (value) {
                    var dbl = Number(value);
                    if (_.isFinite(dbl) && ((dbl >= range.min) || (dbl <= range.max))) {
                        return {
                            valid: true,
                            data: dbl
                        }
                    }
                }
                return {
                    valid: false,
                    errors: [errors.ATTRIBUTE_INVALID(attribute)]
                }
            };
        },
        minuteWindow: function(range) {
            var minMoment = moment().subtract(range.past, 'minutes');
            var maxMoment = moment().add(range.future, 'minutes');
            return validate.dateInRange({
                min: minMoment,
                max: maxMoment
            });
        },
        ageInRange: function(range) {
            var minMoment = moment().subtract(range.max, 'years');
            var maxMoment = moment().subtract(range.min, 'years');
            return validate.dateInRange({
                min: minMoment,
                max: maxMoment
            });
        },
        dateInRange: function(range) {
            return function(attribute, value) {
                var date = moment(value, "YYYY-MM-DDTHH:mm:ss.SSSZ", true);
                var valid = date.isValid();
                if (valid && !(date.isBefore(range.min) || date.isAfter(range.max))) {
                    return {
                        valid: true,
                        data: date.toISOString()
                    };

                } else {
                    return {
                        valid: false,
                        errors: [errors.ATTRIBUTE_INVALID(attribute)]
                    };
                }
            }
        },
        dateRange: function() {
            return function(attribute, value) {
                if (!value) {
                    return {
                        valid: false,
                        errors: [errors.ATTRIBUTE_INVALID(attribute)]
                    };
                }
                var range = value.split(',');
                if (range.length == 2) {
                    var start = range[0];
                    var stop = range[1];
                    var startMoment = moment(start, "YYYY-MM-DDTHH:mm:ss.SSSZ", true);
                    var stopMoment = moment(stop, "YYYY-MM-DDTHH:mm:ss.SSSZ", true);
                    var validStart = startMoment.isValid();
                    var validStop = stopMoment.isValid();

                    if (validStart && validStop && (validStart < validStop)) {
                        return {
                            valid: true,
                            data: {
                                start: startMoment.toISOString(),
                                stop: stopMoment.toISOString()
                            }
                        };
                    }
                }
                return {
                    valid: false,
                    errors: [errors.ATTRIBUTE_INVALID(attribute)]
                };
            }
        },
        category: function() {
            return validate.regex(/^(RACE|CHARITY|RANDOM|ALL)$/i);
        },
        range: function() {
            // range = distance filter critical points
            return validate.doubleRange({
                min: 1.0,
                max: 20000.0
            });
        },
        visits: function() {
            return function(attribute, value) {

            };
        }
    };
    return validate;
};