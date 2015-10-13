function check_privileges(privileges) {
    return function * (next) {


        // var claims = this.state.jwtdata;
        // console.log("claims = ", claims);

        // for (var i = 0; i < claims.pri.length; i++) {
        //     for (var j = 0; j < privileges.length; j++) {
        //         console.log("i = ", i);
        //         console.log("j = ", j);
        //         if (privileges[j] === claims.pri[i]) return next();
        //     }
        // }


        return utility.middleware.unprivileged;
    }
}

function getQueryVariable(queryStr, queryVar) {
    var queryVars = queryStr.split('&');
    for (var i = 0; i < queryVars.length; i++) {
        var pair = queryVars[i].split('=');
        if (decodeURIComponent(pair[0]) == queryVar) {
            return decodeURIComponent(pair[1]);
        }
    }
    return null;
}

// // Check URL querystring for username or email filter
// var queryUsername = getQueryVariable(this.request.querystring, "username");
// var queryEmail = getQueryVariable(this.request.querystring, "email");

// if (queryUsername && queryEmail) {
//     this.req.errors = [errors.UNKNOWN_ERROR("username and email must be queried independently")];
//     return yield admin.invalidGet;
// } else if (queryUsername) {
//     var testUsername = validate.attribute(admin.schema, queryUsername, "username");
//     if (testUsername.valid) {
//         var usernameResults = yield db.util.admin_by_username(testUsername.data);
//         if (!usernameResults || usernameResults.length == 0) {
//             this.req.errors = [errors.DB_ERROR("failed to get admin by username")];
//             return yield admin.invalidGet;
//         } else {
//             this.req.data = usernameResults;
//             return yield admin.successGet;
//         }
//     } else {
//         this.req.errors = testUsername.errors;
//         return yield admin.invalidGet;
//     }
// } else if (queryEmail) {
//     var testEmail = validate.attribute(admin.schema, queryEmail, "email");
//     if (testEmail.valid) {
//         var emailResults = yield db.util.admin_by_email(testEmail.data);
//         if (!emailResults || emailResults.length == 0) {
//             this.req.errors = [errors.DB_ERROR("failed to get admin by email")];
//             return yield admin.invalidGet;
//         } else {
//             this.req.data = emailResults;
//             return yield admin.successGet;
//         }
//     } else {
//         this.req.errors = testEmail.errors;
//         return yield admin.invalidGet;
//     }
// }