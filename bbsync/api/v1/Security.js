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

module.exports = function Security() {

    var fs = require('fs');
    var jwt = require('koa-jwt');

    // Public/Private key used for JWT verification
    var publicKey = fs.readFileSync('v1/auth/ssl/demo.rsa.pub');
    var privateKey = fs.readFileSync('v1/auth/ssl/demo.rsa');

    // Private routes equire valid JWT
    var checkJWT = jwt({
        secret: publicKey,
        algorithm: 'RS256',
        key: 'jwtdata'
    });

    // Set JWT for successful logins
    var signJWT = function(issuerClaim, emailClaim, isAdminClaim) {
        var claims = {
            iss: issuerClaim,
            email: emailClaim,
            admin: isAdminClaim
        };
        var token = jwt.sign(claims, privateKey, {
            algorithm: 'RS256',
            expiresIn: 2*60*60 // 2 hours
        });
        return token;
    } 

    var security = {
        checkJWT: checkJWT,
        signJWT: signJWT
    };
    return security;
};