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

module.exports = function ModelSchema(attributes) {

	var ModelSchemaAttribute = require('./ModelSchemaAttribute.js');

	// Each attribute pushed onto schema must conform to a precise format
	// the Attribute constructor will throw an error if non-conformant
	var schema = [];
	var formalAttribute = null;
	attributes.forEach(function(a) {
		try {
			formalAttribute = new ModelSchemaAttribute(a);
			schema.push(formalAttribute);
		} catch(e) {
			// ERROR: HOW TO HANDLE?
			throw new Error("Invalid attribute:\n" + JSON.stringify(a, null, 4) + "\nReason:\n" + e);
		}
	});
    
	// E
    Object.freeze(schema);
    return schema;
};