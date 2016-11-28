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

module.exports = function BabySync(app, utility) {

    // API Templates
    var User            = require('./templates/User.js');
    var Family          = require('./templates/Family.js');
    var Parent          = require('./templates/Parent.js');
    var Activity        = require('./templates/Activity.js');
    var Baby            = require('./templates/Baby.js');
    var Timer           = require('./templates/Timer.js');
    var Geocache        = require('./templates/Geocache.js');

    var Templates = [User, Family, Parent, Activity, Baby, Timer, Geocache];

    // Convert Templates into Middleware
    var REST            = require('./REST/REST.js');
    var rest            = new REST(Templates, utility);

    // API Operations
    var CreateFamily    = require('./operations/CreateFamily.js');
    var FindFamily      = require('./operations/FindFamily.js');
    var JoinFamily      = require('./operations/JoinFamily.js');
    var MergeFamily     = require('./operations/MergeFamily.js');
    var DetachFamily    = require('./operations/DetachFamily.js');
    var CreateActivity  = require('./operations/CreateActivity.js');
    var DeleteActivity  = require('./operations/DeleteActivity.js');
    var CreateBaby      = require('./operations/CreateBaby.js');
    var DeleteBaby      = require('./operations/DeleteBaby.js');
    var CreateTimer     = require('./operations/CreateTimer.js');
    var DeleteTimer     = require('./operations/DeleteTimer.js');

    // Database Extensions for Complex App Queries
    var dbBabySync = require('./DatabaseBabySync.js')(utility.db);

    // Convert Operations Into Middleware
    var createFamily    = new CreateFamily(utility, rest.Parent);
    var findFamily      = new FindFamily(utility, rest.User);
    var joinFamily      = new JoinFamily(utility, rest.Parent, rest.Family);
    var mergeFamily     = new MergeFamily(utility, rest.Parent, rest.Family);
    var detachFamily    = new DetachFamily(utility, rest.Parent);
    var createActivity  = new CreateActivity(utility);
    var deleteActivity  = new DeleteActivity(utility);
    var createBaby      = new CreateBaby(utility);
    var deleteBaby      = new DeleteBaby(utility);
    var createTimer     = new CreateTimer(utility);
    var deleteTimer     = new DeleteTimer(utility);

    // Public/Private Routers
    var Router          = require('koa-router');
    var public          = new Router();
    var private         = new Router();

    // DEVELOPMENT ENDPOINTS
    if(app.env === 'development') {
        public.get('resetDatabase');
    }

    // PUBLIC ENDPOINTS
    public.post('/user', rest.User.post);
    public.get('/user', rest.User.get);
    public.get('/user/:id', rest.User.get);
    public.put('/user', rest.User.put);
    public.put('/user/:id', rest.User.put);
    public.del('/user', rest.User.del);
    public.del('/user/:id', rest.User.del);

    // ---------------------------
    // BabySync Service Operations
    // ---------------------------
    public.post('/user/auth', rest.User.login);
    public.post('/family', createFamily);

    // After this point should expect token
    // TODO: move these operations to the private section
    public.get('/family/find/:email',findFamily);

    public.put('/family/join/:id', joinFamily);
    public.put('/family/merge/:id', mergeFamily);
    public.put('/family/detach', detachFamily);

    public.post('/activity', createActivity);
    public.del('/activity/:id', deleteActivity);

    public.post('/baby', createBaby);
    public.del('/baby/:id', deleteBaby);

    public.post('/timer/:id', createTimer);
    public.del('/timer/:id', deleteTimer);

    // PRIVATE
    // Logout Route
    private.get('/auth/logout', function * (next) {
        this.body = "authController.logout";
    });
    // User routes
    // Private.get('/user', babySync.user.get);
    // Private.get('/user/:id', babySync.user.get);
    // Private.put('/user', babySync.user.put);
    // Private.put('/user/:id', babySync.user.put);
    // Private.del('/user', babySync.user.del);
    // Private.del('/user/:id', babySync.user.del);

    var babySync = {
        public: public.middleware(),
        private: private.middleware(),
        utility: utility
    }
    return babySync;
};