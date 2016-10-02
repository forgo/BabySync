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

module.exports = function BabySync(development) {

    // Errors/Validation/Response/Database
    var Utility     = require('./Utility.js');
    var utility = new Utility();

    // Public/Private Routers
    var Router = require('koa-router');
    var public = new Router();
    var private = new Router();

    // RESTful User Operations
    var RESTUser = require('./RESTUser.js');
    var User = require('./models/User.js');
    var user = new User(RESTUser, utility);

    // RESTful Model Operations
    var REST = require('./REST.js');
    var Family = require('./models/Family.js');
    var Parent = require('./models/Parent.js');
    var Activity = require('./models/Activity.js');
    var Baby = require('./models/Baby.js');
    var Timer = require('./models/Timer.js');
    var Geocache = require('./models/Geocache.js');
    var family = new Family(REST, utility);
    var parent = new Parent(REST, utility);
    var activity = new Activity(REST, utility);
    var baby = new Baby(REST, utility);
    var timer = new Timer(REST, utility);
    var geocache = new Geocache(REST, utility);

    // Complex/Derived Operations
    var CreateFamily = require('./operations/CreateFamily.js');
    var FindFamily = require('./operations/FindFamily.js');
    var JoinFamily = require('./operations/JoinFamily.js');
    var MergeFamily = require('./operations/MergeFamily.js');
    var DetachFamily = require('./operations/DetachFamily.js');
    var CreateActivity = require('./operations/CreateActivity.js');
    var DeleteActivity = require('./operations/DeleteActivity.js');
    var CreateBaby = require('./operations/CreateBaby.js');
    var DeleteBaby = require('./operations/DeleteBaby.js');
    var CreateTimer = require('./operations/CreateTimer.js');
    var DeleteTimer = require('./operations/DeleteTimer.js');
    var createFamily = new CreateFamily(utility, parent.schema);
    var findFamily = new FindFamily(utility, user.schema);
    var joinFamily = new JoinFamily(utility, parent.schema, family.schema);
    var mergeFamily = new MergeFamily(utility, parent.schema, family.schema);
    var detachFamily = new DetachFamily(utility, parent.schema, family.schema);
    var createActivity = new CreateActivity(utility);
    var deleteActivity = new DeleteActivity(utility);
    var createBaby = new CreateBaby(utility);
    var deleteBaby = new DeleteBaby(utility);
    var createTimer = new CreateTimer(utility);
    var deleteTimer = new DeleteTimer(utility);

    // DEVELOPMENT
    if(development) {
        public.get('resetDatabase');
    }

    // PUBLIC
    public.post('/user', user.post);
    public.get('/user', user.get);
    public.get('/user/:id', user.get);
    public.put('/user', user.put);
    public.put('/user/:id', user.put);
    public.del('/user', user.del);
    public.del('/user/:id', user.del);

    // ---------------------------
    // BabySync Service Operations
    // ---------------------------
    public.post('/user/auth', user.login);
    public.post('/family', createFamily);

    // After this point should expect token
    // TODO: move these operations to the private section
    public.get('/family/find/:email', findFamily);

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