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

module.exports = function Model(template) {

	var model = {};

    var ModelType = require('./ModelType.js');
    var type = new ModelType(template.type);
    model["type"] = type;

    var ModelLabel = require('./ModelLabel.js');
    var label = ModelLabel(template.label);
    model["label"] = label;

    var ModelAlias = require('./ModelAlias.js');
    var alias = ModelAlias(template.alias);
    model["alias"] = alias;

    var Schema = require('./ModelSchema.js');
    try {
        var schema = new Schema(template.attributes);
        model["schema"] = schema;
    } catch(e) {
        throw new Error("Invalid schema for template:\n" + JSON.stringify(template, null, 4) + "\nReason:\n" + e);
    }
    console.log("MODEL::: ", model);
    return model;
};