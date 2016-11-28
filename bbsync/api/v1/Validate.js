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
        schema: function(sch, payload) {
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
            var fields = Object.keys(payload);

            // Ensure Fields Provided are Unique
            var repeatedFields = _.uniqBy(_.filter(fields, function(x,i,fields) {
                return _.includes(fields,x,i+1);
            }));

            for (var repeatedField in repeatedFields) {
                valid = false;
                errorArray.push(errors.ATTRIBUTE_NOT_UNIQUE(repeatedField));
            }

            var uniqueFields = _.uniqBy(fields);

            // Required or not, if a field provided is not in the schema, error
            // This also does a sanity check on your schema for multiple definitions
            for (var i = 0; i < uniqueFields.length; i++) {
                var schemesForField = sch.filter(function(attribute) {
                    return attribute.name == uniqueFields[i];
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
                var attribute = sch[i];
                var fieldAttribute = attribute.name;

                var isFieldMissing = false;
                var isFieldEmpty = false;
                var fieldValue = null;

                // Is this scheme attribute missing or empty in provided data?
                isFieldMissing = !(fields.indexOf(fieldAttribute) in fields);
                if (!isFieldMissing) {
                    fieldValue = payload[fieldAttribute].trim();
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
                        payload[fieldAttribute] = "";
                    }
                    // Continue to the next scheme check without collecting futher errors
                    continue;
                }
                // The field is present and not empty, perform validation test
                else {
                    if (typeof(scheme.test) == "function" && scheme.test.length == 2) {
                        var test = scheme.test(fieldAttribute, fieldValue ? fieldValue : "");
                        if (test.valid) {
                            payload[fieldAttribute] = test.data;
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
                    data: payload
                };
            } else {
                return {
                    valid: valid,
                    errors: errorArray
                };
            }
        },
        schemaForAttributes: function(sch, atts, payload) {
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
            var repeatedAttributes = _.uniqBy(_.filter(atts, function(x,i,atts) {
                return _.includes(atts,x,i+1);
            }));
            if (repeatedAttributes.length != 0) {
                return {
                    valid: false,
                    errors: [errors.SCHEMA_ATTRIBUTE_FILTER_INVALID()]
                };
            }
            // Attribute filter must contain attributes in schema
            for (var i = 0; i < atts.length; i++) {
                var schemesForAttribute = sch.filter(function(attribute) {
                    return attribute.name == atts[i];
                });
                if(schemesForAttribute.length == 0) {
                    return {
                        valid: false,
                        errors: [errors.SCHEMA_ATTRIBUTE_FILTER_INVALID()]
                    };
                }
            }
            var modifiedSchema = _.filter(sch, function(attribute) {
                // if attribute.name is a field in payload
                var f = _.findIndex(atts, function(attribute) {
                    return attribute == attribute.name;
                });
                return f != -1;
            });
            return validate.schema(modifiedSchema, payload);
        },
        schemaForUpdate: function(sch, payload) {
            // Provided Schema Should Never Be Empty
            if (validate.isEmpty(sch)) {
                return {
                    valid: false,
                    errors: [errors.SCHEMA_UNDEFINED()]
                };
            }
            // Make sure we are providing something to update at all
            if ("false" in payload) {
                return {
                    valid: false,
                    errors: [errors.UPDATE_EMPTY()]
                };
            }
            // Modified schema returns common fields with update fields.
            // Calling validate.schema checks for empty schemas as well as
            // extraneous fields in payload that aren't in sch. This means updates
            // only pass when the fields provided are a subset or the same set 
            // as the attributes in sch
            var updateSchema = _.filter(sch, function(attribute) {
                // if attribute.name is a field in payload
                var f = _.findIndex(_.keys(payload), function(field) {
                    return field == attribute.name;
                });
                return f != -1;
            });
            if (validate.isEmpty(updateSchema)) {
                return {
                    valid: false,
                    errors: [errors.UPDATE_MISMATCH()]
                };
            }
            return validate.schema(updateSchema, payload);
        },
        attribute: function(sch, payload, att) {
            // Extract Scheme from Schema Which Defines Attribute
            var attributeSchemes = sch.filter(function(attribute) {
                return attribute.name == att;
            });
            var attributeScheme = attributeSchemes[0];

            console.log("ATTRIBUTE SCHEME = ", attributeScheme);

            if (typeof(attributeScheme.test) == "function" && attributeScheme.test.length == 2) {
                console.log("att = ", att);
                console.log("payload = ", payload);
                return attributeScheme.test(att, payload ? payload : "");
            }
            return {
                valid: false,
                errors: [errors.ATTRIBUTE_TEST_REQUIRED(att)]
            };
        },
        id: function(payload) {
            if (Number.isInteger(Number(payload)) && (payload !== null) && (payload !== undefined)) {
                return {
                    valid: true,
                    data: payload
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
        // OAuth Validation Helpers
        googleID: function() {
            return validate.regex(/^([\d]{1,20})$/);
        },
        facebookID: function() {
            return validate.regex(/^([\d]{1,20})$/);
        },
        googleResponseBody: function(body) {
            var response = {}
            console.log("googleResponseBody = ", body);
            if(body.error || !body.name || !body.id) {
                
            }

            response.valid = true;
            return response;
        },
        facebookResponseBody: function(body) {
            var response = {}
            console.log("facebookResponseBody = ", body);
            if(body.error || !body.name || !body.id) {
                response.valid = false;
            }
            else {
                response.valid = true;
                response.data = body
            }
            return response;
        },
        ////////////////////////////////////////////////////////////////////////
        login: function(sch, payload, req) {
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
                if(payload.authMethod) {
                    var authMethodMatches = authMethods.filter(function(method) {
                        return method.type == payload.authMethod;
                    });
                    if (authMethodMatches.length == 1) {

                        // password unexpected with
                        // accessToken for oAuth provider and vice-versa
                        if(payload.password && payload.accessToken) {
                            response.valid = false;
                            response.errors = [errors.LOGIN_FAILURE("expected password or accessToken, not both")];
                            return response;
                        }

                        // email must accompany accessToken in case we need to create a new user
                        if(payload.accessToken && !payload.email) {
                            response.valid = false;
                            response.errors = [errors.LOGIN_FAILURE("email must accompany accessToken")];
                            return response;
                        }

                        // ensure email is clean before moving on
                        // (a valid oAuth token will try to create a user with this email 
                        //  if they don't already exist)
                        console.log("THE PAYLOAD = ", payload);
                        var oauth_email_test = validate.attribute(sch, payload.email, "email");
                        console.log("oauth_email_test = ", oauth_email_test);
                        if(oauth_email_test.valid) {

                            authMethod = payload.authMethod;
                            delete payload.authMethod;
                            var method = authMethodMatches[0];

                            // No token was provided and auth method needs it
                            if(!payload.accessToken && method.validTokenURL != null) {
                                response.valid = false;
                                response.errors = [errors.LOGIN_TOKEN_EXPECTED(authMethod)];
                                return response;
                            }
                            // Token provided and we have an auth service to check against
                            else if(payload.accessToken && method.validTokenURL != null) {

                                var tokenURL = method.validTokenURL.replace(/\{accessToken\}/, payload.accessToken);
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
                                    // Return IMMEDIATELY if valid oauth token found
                                    // let endpoint handle user get/post 
                                    // depending on pre-existing user oauth data
                                    response.valid = true
                                    response.isValidOAuth = true
                                    response.data = { authMethod: authMethod, email: oauth_email_test.data, oAuth: token_test.data }
                                    return response
                                }
                            }
                            else if(payload.accessToken && method.validTokenURL == null) {
                                response.valid = false;
                                response.errors = [errors.LOGIN_TOKEN_UNVERIFIABLE(authMethod)];
                            }

                        }
                        else {
                            response.valid = false;
                            response.errors = [errors.LOGIN_FAILURE("oauth email incompatible")];
                            return response;
                        }
                    }
                    else {
                        response.valid = false;
                        response.errors = [errors.LOGIN_TYPE_INVALID(payload.authMethod)];
                        return response;
                    }
                }
                else {
                    response.valid = false;
                    response.errors = [errors.LOGIN_TYPE_UNSPECIFIED()];
                    return response;
                }

                // Remove Non-Schema Validatable Items Already Processed
                if(payload.authMethod) {
                    delete payload.authMethod;
                }

                if(payload.accessToken) {
                    delete payload.accessToken;
                }

                //////
                var isEmailAsUsername = true;
                if(payload.email && payload.username) {
                    response.valid = false;
                    response.errors = [errors.LOGIN_FAILURE("expected email or username, not both")];
                    return response;
                }

                if(!payload.email && !payload.username) {
                    response.valid = false;
                    response.errors = [errors.LOGIN_FAILURE("expected email or username")];
                    return response;
                }

                if(payload.username) {
                    isEmailAsUsername = false
                }
                /////

                // We only care about email/username and password for login schema
                var modifiedSchema = sch.filter(function(attribute) {
                    return (attribute.name == (isEmailAsUsername ? "email" : "username")) || (attribute.name == "password");
                });

                var login_schema_test = validate.schema(modifiedSchema, payload);

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