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

var adminData = {};
adminData.auth = {};
adminData.post = {};
adminData.get = {};
adminData.put = {};
adminData.del = {};

adminData.auth.baseline = [];
adminData.auth.baseline[0] = {
    admin: {
        username: "test_auth_good_admin1",
        password: "test_auth_good_admin_password1",
        firstname: "TestAuth",
        lastname: "GoodAdmin1",
        email: "test_auth_good_admin1@gmail.com",
        birthday: "1969-12-31T06:00:00.000Z",
        phone: "5558675309"
    }
};

adminData.auth.tests = [];
adminData.auth.tests[0] = {
    should: "authenticate with existing username/password",
    endpoint: "/api/v1/auth/admin",
    credentials: {
        username: "test_auth_good_admin1",
        password: "test_auth_good_admin_password1"
    },
    expect: 200,
    errors: undefined
};

adminData.auth.tests[1] = {
    should: "authenticate with existing email/password",
    endpoint: "/api/v1/auth/admin",
    credentials: {
        username: "test_auth_good_admin1@gmail.com",
        password: "test_auth_good_admin_password1"
    },
    expect: 200,
    errors: undefined
};

adminData.auth.tests[2] = {
    should: "fail authentication with non-existent username/password",
    endpoint: "/api/v1/auth/admin",
    credentials: {
        username: "test_auth_bad_admin1",
        password: "test_auth_bad_admin_password1"
    },
    expect: 200,
    errors: [errors.LOGIN_FAILURE()]
};

adminData.auth.tests[3] = {
    should: "fail authentication with non-existent email/password",
    endpoint: "/api/v1/auth/admin",
    credentials: {
        username: "test_auth_bad_admin1@gmail.com",
        password: "test_auth_bad_admin_password1"
    },
    expect: 200,
    errors: [errors.LOGIN_FAILURE()]
};

adminData.auth.tests[4] = {
    should: "fail authentication with existing username and incorrect password",
    endpoint: "/api/v1/auth/admin",
    credentials: {
        username: "test_auth_good_admin1",
        password: "test_auth_bad_admin_password1"
    },
    expect: 200,
    errors: [errors.LOGIN_FAILURE()]
};

adminData.auth.tests[5] = {
    should: "fail authentication with existing email and incorrect password",
    endpoint: "/api/v1/auth/admin",
    credentials: {
        username: "test_auth_good_admin1@gmail.com",
        password: "test_auth_bad_admin_password1"
    },
    expect: 200,
    errors: [errors.LOGIN_FAILURE()]
};

adminData.auth.tests[6] = {
    should: "fail authentication with invalid username and password",
    endpoint: "/api/v1/auth/admin",
    credentials: {
        username: "$&#^@&",
        password: "_"
    },
    expect: 200,
    errors: [errors.ATTRIBUTE_INVALID()]
}

adminData.post.baseline = [];
adminData.post.baseline[0] = {
    admin: {
        username: "test_post_existing_admin1",
        password: "test_post_existing_admin_password1",
        firstname: "TestPost",
        lastname: "ExistingAdmin1",
        email: "test_post_existing_admin1@gmail.com",
        birthday: "1969-12-31T06:00:00.000Z",
        phone: "5558675309"
    }
};

adminData.post.tests = [];

adminData.post.tests[0] = {
    should: "fail without valid authorization header",
    endpoint: "/api/v1/admin",
    payload: {
        username: "test_post_new_admin1",
        password: "test_post_new_admin_password1",
        firstname: "TestPost",
        lastname: "NewAdmin1",
        email: "test_post_new_admin1@gmail.com",
        birthday: "1969-12-31T06:00:00.000Z",
        phone: "5558675309"
    },
    expect: 401,
    errors: [errors.UNAUTHORIZED()]
};

adminData.post.tests[1] = {
    should: "create valid and unique admin object with valid authorization header",
    endpoint: "/api/v1/admin",
    credentials: {
        username: "test_post_existing_admin1",
        password: "test_post_existing_admin_password1"
    },
    payload: {
        username: "test_post_new_admin1",
        password: "test_post_new_admin_password1",
        firstname: "TestPost",
        lastname: "NewAdmin1",
        email: "test_post_new_admin1@gmail.com",
        birthday: "1969-12-31T06:00:00.000Z",
        phone: "5558675309"
    },
    expect: 200,
    errors: undefined
};
adminData.post.tests[2] = {
    should: "fail to create valid but non-unique admin object with valid authorization header",
    endpoint: "/api/v1/admin",
    credentials: {
        username: "test_post_existing_admin1",
        password: "test_post_existing_admin_password1"
    },
    payload: {
        username: "test_post_existing_admin1",
        password: "test_post_existing_admin_password1",
        firstname: "TestPost",
        lastname: "ExistingAdmin1",
        email: "test_post_existing_admin1@gmail.com",
        birthday: "1969-12-31T06:00:00.000Z",
        phone: "5558675309"
    },
    expect: 200,
    errors: [errors.USERNAME_TAKEN(), errors.EMAIL_TAKEN()]
};
adminData.post.tests[3] = {
    should: "fail to create invalid admin object with valid authorization header",
    endpoint: "/api/v1/admin",
    credentials: {
        username: "test_post_existing_admin1",
        password: "test_post_existing_admin_password1"
    },
    payload: {
        username: "^*&@#@(",
        password: ")))",
        firstname: "<<<<",
        lastname: ">>",
        email: "notanemail",
        birthday: "7&",
        phone: "...",
        fake: "this is not a valid field",
    },
    expect: 200,
    errors: [errors.ATTRIBUTE_INVALID()]
};

adminData.get.baseline = [];
adminData.get.baseline[0] = {
    admin: {
        username: "test_get_admin1",
        password: "test_get_admin_password1",
        firstname: "TestGet",
        lastname: "Admin1",
        email: "test_get_admin1@gmail.com",
        birthday: "1969-12-31T06:00:00.000Z",
        phone: "5558675309"
    }
};
adminData.get.baseline[1] = {
    admin: {
        username: "test_get_admin2",
        password: "test_get_admin_password2",
        firstname: "TestGet",
        lastname: "Admin2",
        email: "test_get_admin2@gmail.com",
        birthday: "1969-12-31T06:00:00.000Z",
        phone: "5558675309"
    }
};
adminData.get.baseline[2] = {
    admin: {
        username: "test_get_admin3",
        password: "test_get_admin_password3",
        firstname: "TestGet",
        lastname: "Admin3",
        email: "test_get_admin3@gmail.com",
        birthday: "1969-12-31T06:00:00.000Z",
        phone: "5558675309"
    }
};

adminData.get.tests = [];
adminData.get.tests[0] = {
    should: "fail without valid authorization header",
    endpoint: "/api/v1/admin",
    credentials: undefined,
    expect: 401,
    errors: [errors.UNAUTHORIZED()]
};
adminData.get.tests[1] = {
    should: "return admin list with valid authorization header",
    endpoint: "/api/v1/admin",
    credentials: {
        username: "test_get_admin1",
        password: "test_get_admin_password1"
    },
    expect: 200,
    errors: undefined
};
adminData.get.tests[2] = {
    should: "return admin identified by username with valid authorization header",
    endpoint: "/api/v1/admin/test_get_admin1",
    credentials: {
        username: "test_get_admin1",
        password: "test_get_admin_password1"
    },
    expect: 200,
    errors: undefined
};
adminData.get.tests[3] = {
    should: "return admin identified by email with valid authorization header",
    endpoint: "/api/v1/admin/test_get_admin1@gmail.com",
    credentials: {
        username: "test_get_admin1",
        password: "test_get_admin_password1"
    },
    expect: 200,
    errors: undefined
};
adminData.get.tests[4] = {
    should: "return admin identified by id with valid authorization header",
    endpoint: "/api/v1/admin/:id",
    credentials: {
        username: "test_get_admin1",
        password: "test_get_admin_password1"
    },
    expect: 200,
    errors: undefined
};
adminData.get.tests[5] = {
    should: "fail to return admin identified improperly with valid authorization header",
    endpoint: "/api/v1/admin/?x42z",
    credentials: {
        username: "test_get_admin1",
        password: "test_get_admin_password1"
    },
    expect: 200,
    errors: [errors.UNIDENTIFIABLE()]
};

adminData.put.baseline = [];
adminData.put.baseline[0] = {
    admin: {
        username: "test_put_admin1",
        password: "test_put_admin_password1",
        firstname: "TestPut",
        lastname: "Admin1",
        email: "test_put_admin1@gmail.com",
        birthday: "1969-12-31T06:00:00.000Z",
        phone: "5558675309"
    }
};
adminData.put.tests = [];
adminData.put.tests[0] = {
    should: "fail without valid authorization header",
    endpoint: "/api/v1/admin/test_put_admin1",
    credentials: undefined,
    payload: {
        firstname: "TestPutNewNameNotLoggedIn"
    },
    expect: 401,
    errors: [errors.UNAUTHORIZED()]
};
adminData.put.tests[1] = {
    should: "update allowable admin properties using username with valid authorization header",
    endpoint: "/api/v1/admin/test_put_admin1",
    credentials: {
        username: "test_put_admin1",
        password: "test_put_admin_password1"
    },
    payload: {
        firstname: "TestPutUsingUsername",
        lastname: "Admin1Forever1"
    },
    expect: 200,
    errors: undefined
};
adminData.put.tests[2] = {
    should: "update allowable admin properties using email with valid authorization header",
    endpoint: "/api/v1/admin/test_put_admin1@gmail.com",
    credentials: {
        username: "test_put_admin1",
        password: "test_put_admin_password1"
    },
    payload: {
        firstname: "TestPutUsingEmail",
        lastname: "Admin1Forever2"
    },
    expect: 200,
    errors: undefined
};
adminData.put.tests[3] = {
    should: "update allowable admin properties using id with valid authorization header",
    endpoint: "/api/v1/admin/:id",
    credentials: {
        username: "test_put_admin1",
        password: "test_put_admin_password1"
    },
    payload: {
        firstname: "TestPutUsingID",
        lastname: "Admin1Forever3"
    },
    expect: 200,
    errors: undefined
};
adminData.put.tests[4] = {
    should: "fail to update allowable admin properties if identified improperly with valid authorization header",
    endpoint: "/api/v1/admin/?x42z",
    credentials: {
        username: "test_put_admin1",
        password: "test_put_admin_password1"
    },
    payload: {
        firstname: "TestPutUsingBadID",
        lastname: "Admin1Forever4"
    },
    expect: 200,
    errors: [errors.UNIDENTIFIABLE()]
};
adminData.put.tests[5] = {
    should: "fail to update fields with invalid values",
    endpoint: "/api/v1/admin/test_put_admin1",
    credentials: {
        username: "test_put_admin1",
        password: "test_put_admin_password1"
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

adminData.del.baseline = [];
adminData.del.baseline[0] = {
    admin: {
        username: "test_del_admin1",
        password: "test_del_admin_password1",
        firstname: "TestDel",
        lastname: "Admin1",
        email: "test_del_admin1@gmail.com",
        birthday: "1969-12-31T06:00:00.000Z",
        phone: "5558675309"
    }
};
adminData.del.tests = [];
adminData.del.tests[0] = {
    should: "fail without valid authorization header",
    endpoint: "/api/v1/admin/test_del_admin1",
    credentials: undefined,
    expect: 401,
    errors: [errors.UNAUTHORIZED()]
};
adminData.del.tests[1] = {
    should: "fail when identified improperly with valid authorization header",
    endpoint: "/api/v1/admin/$43",
    credentials: {
        username: "test_del_admin1",
        password: "test_del_admin_password1"
    },
    expect: 200,
    errors: [errors.UNIDENTIFIABLE()]
};
adminData.del.tests[2] = {
    should: "delete admin identified by username with valid authorization header",
    endpoint: "/api/v1/admin/test_del_admin1",
    credentials: {
        username: "test_del_admin1",
        password: "test_del_admin_password1"
    },
    expect: 200,
    errors: undefined
};

module.exports = adminData;