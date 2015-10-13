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

module.exports = function GeocacheValidate(errors) {

    var moment = require('moment');

    var geocacheValidate = {
        geocache_title: function() {
            return this.regex(/(^[a-zA-Z][a-zA-Z0-9 ,.!@#$%^&*()\-+]{2,128}$)/);
        },
        geocache_message: function() {
            return this.regex(/(^[a-zA-Z][a-zA-Z0-9 ,.!@#$%^&*()\-+]{2,256}$)/);
        },
        geocache_lat: function() {
            return this.latitude();
        },
        geocache_lng: function() {
            return this.longitude();
        },
        geocache_currency: function() {
            return this.regex(/^(FLAP|DOGE|BITCOIN)$/);
        },
        geocache_amount: function() {
            return this.doubleRange({
                min: 0.05,
                max: 5000
            });
        },
        geocache_is_physical: function() {
            return this.bool();
        },
        geocache_delay: function() {
            // Hours Between 1-360, excluding 0, padded 0s OK
            return this.regex(/^0*(?:[1-9][0-9]?|360)$/);
        },
        // * Filter Validations * //
        geocache_query_filter: function(query) {
            var response = {};
            var filter = {}
            var errorArray = [];
            // Must provide location to filter by range
            if (query.range && !query.location) {
                errorArray.push(errors.LOCATION_REQUIRED());
            } else if (query.location && !query.range) {
                errorArray.push(errors.RANGE_REQUIRED());
            } else if (query.location && query.range) {
                var rangeTest = this.range()("?range=", query.range);
                if (rangeTest.valid) {
                    filter.distance = rangeTest.data;
                } else {
                    errorArray.push(errors.QUERY_PARAM_INVALID("?range="));
                    errorArray.append(rangeTest.errors);
                }
                var locationTest = this.coordinate()("?location=", query.location);
                if (locationTest.valid) {
                    filter.location = locationTest.data;
                } else {
                    errorArray.push(errors.QUERY_PARAM_INVALID("?location="));
                    errorArray.append(locationTest.errors);
                }
            }

            if (query.location) {
                // A distance range must be specified if a coordinate is specified
                if (query.range) {

                } else {
                    errorArray.push(errors.QUERY_PARAM_INVALID("?location="));
                    errorArray.push(errors.RANGE_REQUIRED());
                }
            }

            if (query.category) {
                var categoryTest = this.category()("?category=", query.category);
                if (categoryTest.valid) {
                    filter.category = categoryTest.data;
                } else {
                    errorArray.push(errors.QUERY_PARAM_INVALID("?category="));
                    errorArray.append(categoryTest.errors);
                }
            }

            if (query.period) {
                var periodTest = this.dateRange()("?period=", query.period);
                if (periodTest.valid) {
                    filter.period = periodTest.data;
                } else {
                    errorArray.push(errors.QUERY_PARAM_INVALID("?period="));
                    errorArray.append(periodTest.errors);
                }
            }

            if (query.currency) {
                var currencyTest = this.geocache_currency()("?currency=", query.currency);
                if (currencyTest.valid) {
                    filter.currency = currencyTest.data;
                } else {
                    errorArray.push(errors.QUERY_PARAM_INVALID("?currency="));
                    errorArray.append(currencyTest.errors);
                }
            }

            if (query.amount) {
                var amountTest = this.geocache_amount()("?amount=", query.amount);
                if (amountTest.valid) {
                    filter.amount = amountTest.data;
                } else {
                    errorArray.push(errors.QUERY_PARAM_INVALID("?amount="));
                    errorArray.append(amountTest.errors);
                }
            }

            if (query.visits) {
                var visitsTest = this.visits()("?visits=", query.visits);
                if (visitsTest.valid) {
                    filter.visits = visitsTest.data;
                } else {
                    errorArray.push(errors.QUERY_PARAM_INVALID("?visits="));
                    errorArray.append(visitsTest.errors);
                }
            }

            if (errorArray.length > 0) {
                response.valid = false;
                response.errors = errorArray;
            } else {
                response.valid = true;
                response.data = filter;
            }

            return response;

        }
    };
    return geocacheValidate;
}