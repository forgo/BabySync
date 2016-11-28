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

module.exports = function REST(Templates, utility) {

    function duplicates(array) {
        var unique = array.map(function(e) {
            return {count:1, value:e};
        }).reduce(function(a, b) {
            a[b.value] = (a[b.value] || 0) + b.count;
            return a;
        }, {});
        return Object.keys(unique).filter(function(a) {
            return unique[a] > 1;
        });
    }

    // Converts Template into RESTful middleware
    var RESTObject = require('./RESTObject.js');

    // Collect RESTful data and middleware for all Templates
    var restObjects = Templates.map(function(T) {
        return new RESTObject(T, utility);
    });

    // Ensure Uniqueness of REST labels and aliases
    var labels = restObjects.map(function(e) {
        return e.model.label;
    });
    var duplicateLabels = duplicates(labels);
    if(duplicateLabels.length > 0) {
        throw new Error("Template label(s) cannot be reused: " + duplicateLabels);
    }
    var aliases = restObjects.map(function(e) {
        return e.model.alias;
    });
    var duplicateAliases = duplicates(aliases);
    if(duplicateAliases.length > 0) {
        throw new Error("Template alias(es) cannot be reused: " + duplicateAliases);
    }
    var userObjects = restObjects.filter(function(e) {
        return e.model.type.user
    });
    if(userObjects.length > 1) {
        throw new Error("Cannot have multiple user REST objects");
    }

    // Return middleware services hashed by label
    var restMiddleware = restObjects.reduce(function(map, rest) {
        map[rest.model.label] = rest;
        return map;
    }, {});
    return restMiddleware;
};