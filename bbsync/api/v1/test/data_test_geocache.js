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

var Errors = require('../Errors.js');
var errors = new Errors();

var geocacheData = {};
geocacheData.post = {};
geocacheData.get = {};
geocacheData.put = {};
geocacheData.del = {};

geocacheData.post.baseline = [];
geocacheData.post.baseline[0] = {
    admin: {
        username: "test_auth_geocache_admin1",
        password: "test_auth_geocache_admin_password1",
        firstname: "TestAuthGeocache",
        lastname: "ExistingAdmin1",
        email: "test_auth_geocache_admin1@gmail.com",
        birthday: "1969-12-31T06:00:00.000Z",
        phone: "5558675309"
    },
    user: {
        username: "test_auth_geocache_user1",
        password: "test_auth_geocache_user_password1",
        firstname: "TestAuthGeocache",
        lastname: "ExistingUser1",
        email: "test_auth_geocache_user1@gmail.com",
        birthday: "1969-12-31T06:00:00.000Z",
        phone: "5558675309"
    }
};

geocacheData.post.tests = [];
geocacheData.post.tests[0] = {
    should: "create valid geocache for authenticated admin",
    endpoint: "/api/v1/geocache/",
    credentials: {
        username: "test_auth_geocache_admin1",
        password: "test_auth_geocache_admin_password1"
    },
    payload: {
        title: "Test San Antonio Geocache Drop Valid",
        message: "This geocache should follow the rules!",
        lat: 29.4167,
        lng: 98.5000,
        currency: "FLAP",
        amount: 20.4,
        is_physical: true,
        delay: 0
    }
    expect: 200,
    errors: undefined
};
geocacheData.post.tests[1] = {
    should: "fail to create valid geocache for unauthenticated admin",
    endpoint: "/api/v1/geocache/",
    payload: {
        title: "Test San Antonio Geocache Drop Valid",
        message: "This geocache should follow the rules!",
        lat: 29.4167,
        lng: 98.5000,
        currency: "FLAP",
        amount: 20.4,
        is_physical: true,
        delay: 0
    }
    expect: 200,
    errors: undefined
};
geocacheData.post.tests[2] = {
    should: "create valid geocache for authenticated user",
    endpoint: "/api/v1/geocache/",
    credentials: {
        username: "test_auth_geocache_user1",
        password: "test_auth_geocache_user_password1"
    },
    payload: {
        title: "Test San Antonio Geocache Drop Valid",
        message: "This geocache should follow the rules!",
        lat: 29.4167,
        lng: 98.5000,
        currency: "FLAP",
        amount: 20.4,
        is_physical: true,
        delay: 0
    }
    expect: 200,
    errors: undefined
};
geocacheData.post.tests[3] = {
    should: "fail to create valid geocache for unauthenticated user",
    endpoint: "/api/v1/geocache/",
    payload: {
        title: "Test San Antonio Geocache Drop Valid",
        message: "This geocache should follow the rules!",
        lat: 29.4167,
        lng: 98.5000,
        currency: "FLAP",
        amount: 20.4,
        is_physical: true,
        delay: 0
    }
    expect: 200,
    errors: undefined
};
geocacheData.post.tests[4] = {
    should: "fail to create invalid geocache object",
    endpoint: "/api/v1/geocache/",
    payload: {
        title: "@#(@",
        message: 23.0,
        lat: "x",
        lng: -1098.5000,
        currency: "NOTACRYPTOCURRENCY",
        amount: 45000.32,
        is_physical: "shouldbebool",
        delay: 70000000
    }
    expect: 200,
    errors: [errors.ATTRIBUTE_INVALID()]
};

///////


geocacheData.get.baseline = [];
geocacheData.get.baseline[0] = {
    geocachename: "test_get_geocache1",
    password: "test_get_geocache_password1",
    firstname: "TestGet",
    lastname: "Geocache1",
    email: "test_get_geocache1@gmail.com",
    birthday: "1969-12-31T06:00:00.000Z",
    phone: "5558675309"
};
geocacheData.get.baseline[1] = {
    geocachename: "test_get_geocache2",
    password: "test_get_geocache_password2",
    firstname: "TestGet",
    lastname: "Geocache2",
    email: "test_get_geocache2@gmail.com",
    birthday: "1969-12-31T06:00:00.000Z",
    phone: "5558675309"
};
geocacheData.get.baseline[2] = {
    geocachename: "test_get_geocache3",
    password: "test_get_geocache_password3",
    firstname: "TestGet",
    lastname: "Geocache3",
    email: "test_get_geocache3@gmail.com",
    birthday: "1969-12-31T06:00:00.000Z",
    phone: "5558675309"
};

geocacheData.get.tests = [];
geocacheData.get.tests[0] = {
    should: "fail without valid authorization header",
    endpoint: "/api/v1/geocache",
    credentials: undefined,
    expect: 401,
    errors: [errors.UNAUTHORIZED()]
};
geocacheData.get.tests[1] = {
    should: "return geocache list with valid authorization header",
    endpoint: "/api/v1/geocache",
    credentials: {
        geocachename: "test_get_geocache1",
        password: "test_get_geocache_password1"
    },
    expect: 200,
    errors: undefined
};
geocacheData.get.tests[2] = {
    should: "return geocache identified by geocachename with valid authorization header",
    endpoint: "/api/v1/geocache/test_get_geocache1",
    credentials: {
        geocachename: "test_get_geocache1",
        password: "test_get_geocache_password1"
    },
    expect: 200,
    errors: undefined
};
geocacheData.get.tests[3] = {
    should: "return geocache identified by email with valid authorization header",
    endpoint: "/api/v1/geocache/test_get_geocache1@gmail.com",
    credentials: {
        geocachename: "test_get_geocache1",
        password: "test_get_geocache_password1"
    },
    expect: 200,
    errors: undefined
};
geocacheData.get.tests[4] = {
    should: "return geocache identified by id with valid authorization header",
    endpoint: "/api/v1/geocache/:id",
    credentials: {
        geocachename: "test_get_geocache1",
        password: "test_get_geocache_password1"
    },
    expect: 200,
    errors: undefined
};
geocacheData.get.tests[5] = {
    should: "fail to return geocache identified improperly with valid authorization header",
    endpoint: "/api/v1/geocache/?x42z",
    credentials: {
        geocachename: "test_get_geocache1",
        password: "test_get_geocache_password1"
    },
    expect: 200,
    errors: [errors.UNIDENTIFIABLE()]
};

geocacheData.put.baseline = [];
geocacheData.put.baseline[0] = {
    geocachename: "test_put_geocache1",
    password: "test_put_geocache_password1",
    firstname: "TestPut",
    lastname: "Geocache1",
    email: "test_put_geocache1@gmail.com",
    birthday: "1969-12-31T06:00:00.000Z",
    phone: "5558675309"
};
geocacheData.put.tests = [];
geocacheData.put.tests[0] = {
    should: "fail without valid authorization header",
    endpoint: "/api/v1/geocache/test_put_geocache1",
    credentials: undefined,
    payload: {
        firstname: "TestPutNewNameNotLoggedIn"
    },
    expect: 401,
    errors: [errors.UNAUTHORIZED()]
};
geocacheData.put.tests[1] = {
    should: "update allowable geocache properties using geocachename with valid authorization header",
    endpoint: "/api/v1/geocache/test_put_geocache1",
    credentials: {
        geocachename: "test_put_geocache1",
        password: "test_put_geocache_password1"
    },
    payload: {
        firstname: "TestPutUsingGeocachename",
        lastname: "Geocache1Forever1"
    },
    expect: 200,
    errors: undefined
};
geocacheData.put.tests[2] = {
    should: "update allowable geocache properties using email with valid authorization header",
    endpoint: "/api/v1/geocache/test_put_geocache1@gmail.com",
    credentials: {
        geocachename: "test_put_geocache1",
        password: "test_put_geocache_password1"
    },
    payload: {
        firstname: "TestPutUsingEmail",
        lastname: "Geocache1Forever2"
    },
    expect: 200,
    errors: undefined
};
geocacheData.put.tests[3] = {
    should: "update allowable geocache properties using id with valid authorization header",
    endpoint: "/api/v1/geocache/:id",
    credentials: {
        geocachename: "test_put_geocache1",
        password: "test_put_geocache_password1"
    },
    payload: {
        firstname: "TestPutUsingID",
        lastname: "Geocache1Forever3"
    },
    expect: 200,
    errors: undefined
};
geocacheData.put.tests[4] = {
    should: "fail to update allowable geocache properties if identified improperly with valid authorization header",
    endpoint: "/api/v1/geocache/?x42z",
    credentials: {
        geocachename: "test_put_geocache1",
        password: "test_put_geocache_password1"
    },
    payload: {
        firstname: "TestPutUsingBadID",
        lastname: "Geocache1Forever4"
    },
    expect: 200,
    errors: [errors.UNIDENTIFIABLE()]
};
geocacheData.put.tests[5] = {
    should: "fail to update fields with invalid values",
    endpoint: "/api/v1/geocache/test_put_geocache1",
    credentials: {
        geocachename: "test_put_geocache1",
        password: "test_put_geocache_password1"
    },
    payload: {
        firstname: ".",
        lastname: "!",
        email: "totally",
        birthday: "1869-12-31T06:00:00.000Z",
        phone: "00<<"
    },
    expect: 200,
    errors: [errors.ATTRIBUTE_INVALID()]
};

geocacheData.del.baseline = [];
geocacheData.del.baseline[0] = {
    geocachename: "test_del_geocache1",
    password: "test_del_geocache_password1",
    firstname: "TestDel",
    lastname: "Geocache1",
    email: "test_del_geocache1@gmail.com",
    birthday: "1969-12-31T06:00:00.000Z",
    phone: "5558675309"
};
geocacheData.del.tests = [];
geocacheData.del.tests[0] = {
    should: "fail without valid authorization header",
    endpoint: "/api/v1/geocache/test_del_geocache1",
    credentials: undefined,
    expect: 401,
    errors: [errors.UNAUTHORIZED()]
};
geocacheData.del.tests[1] = {
    should: "fail when identified improperly with valid authorization header",
    endpoint: "/api/v1/geocache/$43",
    credentials: {
        geocachename: "test_del_geocache1",
        password: "test_del_geocache_password1"
    },
    expect: 200,
    errors: [errors.UNIDENTIFIABLE()]
};
geocacheData.del.tests[2] = {
    should: "delete geocache identified by geocachename with valid authorization header",
    endpoint: "/api/v1/geocache/test_del_geocache1",
    credentials: {
        geocachename: "test_del_geocache1",
        password: "test_del_geocache_password1"
    },
    expect: 200,
    errors: undefined
};

module.exports = geocacheData;