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

module.exports = function Timer(REST, db, validate, errors) {

    var schema = [{
        attribute: "resetDate",
        type: "Date",
        required: true,
        auto: false,
        test: validate.timer_reset_date()
    }, {
        attribute: "enabled",
        type: "Boolean",
        required: true,
        auto: false,
        test: validate.timer_enabled()
    }, {
        attribute: "push",
        type: "Boolean",
        required: true,
        auto: false,
        test: validate.timer_push()
    }, {
        attribute: "created_on",
        type: "Date",
        required: false,
        auto: true
    }, {
        attribute: "updated_on",
        type: "Date",
        required: false,
        auto: true
    }];

    var fxns = {
        post: db.timer_create.bind(db),
        getOne: db.timer_by_id.bind(db),
        getAll: db.timers_all.bind(db),
        put: db.timer_update.bind(db),
        del: db.timer_delete_by_id.bind(db)
    };
    var timerREST = new REST(fxns, schema, validate, errors, "Timer");

    var timer = {
        schema: schema,
        post: timerREST.post,
        get: timerREST.get,
        put: timerREST.put,
        del: timerREST.del
    }
    return timer;
};