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

var userData = {};
userData.auth = {};
userData.post = {};
userData.get = {};
userData.put = {};
userData.del = {};

userData.auth.baseline = [];
userData.auth.baseline[0] = {
    user: {
        username: "test_auth_good_user1",
        password: "test_auth_good_user_password1",
        firstname: "TestAuth",
        lastname: "GoodUser1",
        email: "test_auth_good_user1@gmail.com",
        birthday: "1969-12-31T06:00:00.000Z",
        phone: "5558675309"
    }
};

userData.auth.tests = [];
userData.auth.tests[0] = {
    should: "authenticate with existing username/password",
    endpoint: "/api/v1/auth/user",
    credentials: {
        username: "test_auth_good_user1",
        password: "test_auth_good_user_password1"
    },
    expect: 200,
    errors: undefined
};

userData.auth.tests[1] = {
    should: "authenticate with existing email/password",
    endpoint: "/api/v1/auth/user",
    credentials: {
        username: "test_auth_good_user1@gmail.com",
        password: "test_auth_good_user_password1"
    },
    expect: 200,
    errors: undefined
};

userData.auth.tests[2] = {
    should: "fail authentication with non-existent username/password",
    endpoint: "/api/v1/auth/user",
    credentials: {
        username: "test_auth_bad_user1",
        password: "test_auth_bad_user_password1"
    },
    expect: 200,
    errors: [errors.LOGIN_FAILURE()]
};

userData.auth.tests[3] = {
    should: "fail authentication with non-existent email/password",
    endpoint: "/api/v1/auth/user",
    credentials: {
        username: "test_auth_bad_user1@gmail.com",
        password: "test_auth_bad_user_password1"
    },
    expect: 200,
    errors: [errors.LOGIN_FAILURE()]
};

userData.auth.tests[4] = {
    should: "fail authentication with existing username and incorrect password",
    endpoint: "/api/v1/auth/user",
    credentials: {
        username: "test_auth_good_user1",
        password: "test_auth_bad_user_password1"
    },
    expect: 200,
    errors: [errors.LOGIN_FAILURE()]
};

userData.auth.tests[5] = {
    should: "fail authentication with existing email and incorrect password",
    endpoint: "/api/v1/auth/user",
    credentials: {
        username: "test_auth_good_user1@gmail.com",
        password: "test_auth_bad_user_password1"
    },
    expect: 200,
    errors: [errors.LOGIN_FAILURE()]
};

userData.auth.tests[6] = {
    should: "fail authentication with invalid username and password",
    endpoint: "/api/v1/auth/user",
    credentials: {
        username: "$&#^@&",
        password: "_"
    },
    expect: 200,
    errors: [errors.ATTRIBUTE_INVALID()]
}

userData.post.baseline = [];
userData.post.baseline[0] = {
    user: {
        username: "test_post_existing_user1",
        password: "test_post_existing_user_password1",
        firstname: "TestPost",
        lastname: "ExistingUser1",
        email: "test_post_existing_user1@gmail.com",
        birthday: "1969-12-31T06:00:00.000Z",
        phone: "5558675309"
    }
};

userData.post.tests = [];
userData.post.tests[0] = {
    should: "create valid and unique user object",
    endpoint: "/api/v1/user",
    payload: {
        username: "test_post_new_user1",
        password: "test_post_new_user_password1",
        firstname: "TestPost",
        lastname: "NewUser1",
        email: "test_post_new_user1@gmail.com",
        birthday: "1969-12-31T06:00:00.000Z",
        phone: "5558675309"
    },
    expect: 200,
    errors: undefined
};
userData.post.tests[1] = {
    should: "fail to create valid but non-unique user object",
    endpoint: "/api/v1/user",
    payload: {
        username: "test_post_existing_user1",
        password: "test_post_existing_user_password1",
        firstname: "TestPost",
        lastname: "ExistingUser1",
        email: "test_post_existing_user1@gmail.com",
        birthday: "1969-12-31T06:00:00.000Z",
        phone: "5558675309"
    },
    expect: 200,
    errors: [errors.USERNAME_TAKEN(), errors.EMAIL_TAKEN()]
};
userData.post.tests[2] = {
    should: "fail to create invalid user object",
    endpoint: "/api/v1/user",
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

userData.get.baseline = [];
userData.get.baseline[0] = {
    user: {
        username: "test_get_user1",
        password: "test_get_user_password1",
        firstname: "TestGet",
        lastname: "User1",
        email: "test_get_user1@gmail.com",
        birthday: "1969-12-31T06:00:00.000Z",
        phone: "5558675309"
    }
};
userData.get.baseline[1] = {
    user: {
        username: "test_get_user2",
        password: "test_get_user_password2",
        firstname: "TestGet",
        lastname: "User2",
        email: "test_get_user2@gmail.com",
        birthday: "1969-12-31T06:00:00.000Z",
        phone: "5558675309"
    }
};
userData.get.baseline[2] = {
    user: {
        username: "test_get_user3",
        password: "test_get_user_password3",
        firstname: "TestGet",
        lastname: "User3",
        email: "test_get_user3@gmail.com",
        birthday: "1969-12-31T06:00:00.000Z",
        phone: "5558675309"
    }
};

userData.get.tests = [];
userData.get.tests[0] = {
    should: "fail without valid authorization header",
    endpoint: "/api/v1/user",
    credentials: undefined,
    expect: 401,
    errors: [errors.UNAUTHORIZED()]
};
userData.get.tests[1] = {
    should: "return user list with valid authorization header",
    endpoint: "/api/v1/user",
    credentials: {
        username: "test_get_user1",
        password: "test_get_user_password1"
    },
    expect: 200,
    errors: undefined
};
userData.get.tests[2] = {
    should: "return user identified by username with valid authorization header",
    endpoint: "/api/v1/user/test_get_user1",
    credentials: {
        username: "test_get_user1",
        password: "test_get_user_password1"
    },
    expect: 200,
    errors: undefined
};
userData.get.tests[3] = {
    should: "return user identified by email with valid authorization header",
    endpoint: "/api/v1/user/test_get_user1@gmail.com",
    credentials: {
        username: "test_get_user1",
        password: "test_get_user_password1"
    },
    expect: 200,
    errors: undefined
};
userData.get.tests[4] = {
    should: "return user identified by id with valid authorization header",
    endpoint: "/api/v1/user/:id",
    credentials: {
        username: "test_get_user1",
        password: "test_get_user_password1"
    },
    expect: 200,
    errors: undefined
};
userData.get.tests[5] = {
    should: "fail to return user identified improperly with valid authorization header",
    endpoint: "/api/v1/user/?x42z",
    credentials: {
        username: "test_get_user1",
        password: "test_get_user_password1"
    },
    expect: 200,
    errors: [errors.UNIDENTIFIABLE()]
};

userData.put.baseline = [];
userData.put.baseline[0] = {
    user: {
        username: "test_put_user1",
        password: "test_put_user_password1",
        firstname: "TestPut",
        lastname: "User1",
        email: "test_put_user1@gmail.com",
        birthday: "1969-12-31T06:00:00.000Z",
        phone: "5558675309"
    }
};
userData.put.tests = [];
userData.put.tests[0] = {
    should: "fail without valid authorization header",
    endpoint: "/api/v1/user/test_put_user1",
    credentials: undefined,
    payload: {
        firstname: "TestPutNewNameNotLoggedIn"
    },
    expect: 401,
    errors: [errors.UNAUTHORIZED()]
};
userData.put.tests[1] = {
    should: "update allowable user properties using username with valid authorization header",
    endpoint: "/api/v1/user/test_put_user1",
    credentials: {
        username: "test_put_user1",
        password: "test_put_user_password1"
    },
    payload: {
        firstname: "TestPutUsingUsername",
        lastname: "User1Forever1"
    },
    expect: 200,
    errors: undefined
};
userData.put.tests[2] = {
    should: "update allowable user properties using email with valid authorization header",
    endpoint: "/api/v1/user/test_put_user1@gmail.com",
    credentials: {
        username: "test_put_user1",
        password: "test_put_user_password1"
    },
    payload: {
        firstname: "TestPutUsingEmail",
        lastname: "User1Forever2"
    },
    expect: 200,
    errors: undefined
};
userData.put.tests[3] = {
    should: "update allowable user properties using id with valid authorization header",
    endpoint: "/api/v1/user/:id",
    credentials: {
        username: "test_put_user1",
        password: "test_put_user_password1"
    },
    payload: {
        firstname: "TestPutUsingID",
        lastname: "User1Forever3"
    },
    expect: 200,
    errors: undefined
};
userData.put.tests[4] = {
    should: "fail to update allowable user properties if identified improperly with valid authorization header",
    endpoint: "/api/v1/user/?x42z",
    credentials: {
        username: "test_put_user1",
        password: "test_put_user_password1"
    },
    payload: {
        firstname: "TestPutUsingBadID",
        lastname: "User1Forever4"
    },
    expect: 200,
    errors: [errors.UNIDENTIFIABLE()]
};
userData.put.tests[5] = {
    should: "fail to update fields with invalid values",
    endpoint: "/api/v1/user/test_put_user1",
    credentials: {
        username: "test_put_user1",
        password: "test_put_user_password1"
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

userData.del.baseline = [];
userData.del.baseline[0] = {
    user: {
        username: "test_del_user1",
        password: "test_del_user_password1",
        firstname: "TestDel",
        lastname: "User1",
        email: "test_del_user1@gmail.com",
        birthday: "1969-12-31T06:00:00.000Z",
        phone: "5558675309"
    }
};
userData.del.tests = [];
userData.del.tests[0] = {
    should: "fail without valid authorization header",
    endpoint: "/api/v1/user/test_del_user1",
    credentials: undefined,
    expect: 401,
    errors: [errors.UNAUTHORIZED()]
};
userData.del.tests[1] = {
    should: "fail when identified improperly with valid authorization header",
    endpoint: "/api/v1/user/$43",
    credentials: {
        username: "test_del_user1",
        password: "test_del_user_password1"
    },
    expect: 200,
    errors: [errors.UNIDENTIFIABLE()]
};
userData.del.tests[2] = {
    should: "delete user identified by username with valid authorization header",
    endpoint: "/api/v1/user/test_del_user1",
    credentials: {
        username: "test_del_user1",
        password: "test_del_user_password1"
    },
    expect: 200,
    errors: undefined
};

module.exports = userData;