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

module.exports = function ModelSchemaAttribute(attribute) {

    // ModelSchemaAttribute input should be an object and non-null
    if(attribute == null || typeof attribute !== "object") {
        throw new Error(a + " is an invalid input to create a ModelSchemaAttribute");
    }

    // ModelSchemaAttribute input should not be empty
    if(Object.keys(attribute).length === 0) {
        throw new Error("Input to create a ModelSchemaAttribute should not be empty");
    }

    // List of valid values for an ModelSchemaAttribute's "type" property
    // TODO: Not really used currently
    // TODO: These may play a bigger role in database adapters later
    var validTypes = ["String","Date","Double","Integer","Boolean"];

    var conforms = {
        name: function(value) {
            if(typeof value === "string" || value instanceof String) {
                return true;
            } else {
                return false;
            }
        },
        type: function(value) {
            // TODO: proper conditional based on existence in validTypes array
            if(true) {
                return true;
            } else {
                return false;
            }
        },
        required: function(value) {
            if(typeof value === "boolean") {
                return true;
            } else {
                return false;
            }
        },
        test: function(value) {
            if(typeof value === "function" || value instanceof Function) {
                return true;
            } else {
                return false;
            }
        }
    };

    // Keep track of expected conforming properties not encountered
    var missingProperties = Object.keys(conforms);

    // Loop through attribute object to check validity/existence of conforming properties
    for(var key in attribute) {
        var value = attribute[key];
        // Check that key is expected in ModelSchemaAttribute
        if(conforms.hasOwnProperty(key)) {
            // Check the validity of the ModelSchemaAttribute property value
            if(conforms[key](value)) {
                // Conforming property found, remove it from missing properties
                missingProperties = missingProperties.filter(e => e !== key)
                continue;
            } else {
                // Ran into non-conforming attribute property value
                throw new Error(value + " is an invalid " + key + " for a ModelSchemaAttribute");
            }
        } else {
            // Ran into an unexpected attribute property
            throw new Error(key + " is an unexpected property in a ModelSchemaAttribute." + 
                "\nConforming properties: " + Object.keys(conforms));
        }
    }

    // This array should be empty if the input to ModelSchemaAttribute contains what it needs
    if(missingProperties.length > 0) {
        throw new Error("Properties missing from ModelSchemaAttribute: " + missingProperties);
    }

    // Attribute should conform at this point, so let's freeze/return it.
    Object.freeze(attribute);
    return attribute;
};