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

module.exports = function Timer(REST, utility) {

    // ---------------------------------------------------------------------
    // Timer Validations
    // ---------------------------------------------------------------------
    var timerValidate = {
        resetDate: function() {
            // Reset date should be the moment it is reset
            // so this is a sanity check to see that the date occured
            // in a two minute window around 'now'
            return utility.validate.minuteWindow({
                past: 1,
                future: 1
            });
        },
        enabled: function() {
            return utility.validate.bool();
        },
        push: function() {
            return utility.validate.bool();
        }
    };
    
    // ---------------------------------------------------------------------
    // Timer Schema
    // ---------------------------------------------------------------------
    var timerSchema = [{
        attribute: "resetDate",
        type: "Date",
        required: true,
        test: timerValidate.resetDate()
    }, {
        attribute: "enabled",
        type: "Boolean",
        required: true,
        test: timerValidate.enabled()
    }, {
        attribute: "push",
        type: "Boolean",
        required: true,
        test: timerValidate.push()
    }];

    var timer = new REST("Timer", "t", timerSchema, utility);
    timer["schema"] = timerSchema;
    timer["validate"] = timerValidate;
    return timer;
};