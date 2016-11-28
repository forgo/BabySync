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

module.exports = function Geocache(validate) {
    return {
        type: "default",
        label: "Geocache",
        alias: "g",
        attributes: [
            {
                name: "title",
                type: "String",
                required: true,
                test: validate.regex(/(^[a-zA-Z][a-zA-Z0-9 ,.!@#$%^&*()\-+]{2,128}$)/)
            },
            {
                name: "message",
                type: "String",
                required: true,
                test: validate.regex(/(^[a-zA-Z][a-zA-Z0-9 ,.!@#$%^&*()\-+]{2,256}$)/)
            },
            {
                name: "lat",
                type: "Double",
                required: true,
                test: validate.latitude()
            },
            {
                name: "lng",
                type: "Double",
                required: true,
                test: validate.longitude()
            },
            {
                name: "currency",
                type: "String",
                required: true,
                test: validate.regex(/^(FLAP|DOGE|BITCOIN)$/)
            },
            {
                name: "amount",
                type: "Double",
                required: true,
                test: validate.doubleRange({min: 0.05,max: 5000})
            },
            {
                name: "is_physical",
                type: "Boolean",
                required: true,
                test: validate.bool()
            },
            {
                name: "delay",
                type: "Double",
                required: true,
                // Hours Between 1-360, excluding 0, padded 0s OK
                test: validate.regex(/^0*(?:[1-9][0-9]?|360)$/)
            }
        ]
    }
};