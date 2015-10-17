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

module.exports = function BabySync(db, validate, errors, response) {

    var parse = require('co-body');
    var _ = require('lodash');

    var RESTUser = require('./RESTUser.js');
    var User = require('./models/User.js');
    var user = new User(RESTUser, db, validate, errors, response);

    var REST = require('./REST.js');
    var Family = require('./models/Family.js');
    var Parent = require('./models/Parent.js');
    var Activity = require('./models/Activity.js');
    var Baby = require('./models/Baby.js');
    var Timer = require('./models/Timer.js');
    var Geocache = require('./models/Geocache.js');

    var family = new Family(REST, db, validate, errors, response);
    var parent = new Parent(REST, db, validate, errors, response);
    var activity = new Activity(REST, db, validate, errors, response);
    var baby = new Baby(REST, db, validate, errors, response);
    var timer = new Timer(REST, db, validate, errors, response);
    var geocache = new Geocache(REST, db, validate, errors, response);

    var CreateFamily = require('./operations/CreateFamily.js');
    var FindParent = require('./operations/FindParent.js');
    var JoinFamily = require('./operations/JoinFamily.js');
    var MergeFamily = require('./operations/MergeFamily.js');
    var DetachFamily = require('./operations/DetachFamily.js');
    var CreateActivity = require('./operations/CreateActivity.js');
    var DeleteActivity = require('./operations/DeleteActivity.js');
    var CreateBaby = require('./operations/CreateBaby.js');
    var DeleteBaby = require('./operations/DeleteBaby.js');
    var CreateTimer = require('./operations/CreateTimer.js');
    var DeleteTimer = require('./operations/DeleteTimer.js');

    var createFamily = new CreateFamily(db, validate, errors, response, parent.schema);
    var findParent = new FindParent(db, validate, errors, response, parent.schema);
    var joinFamily = new JoinFamily(db, validate, errors, response, parent.schema);
    var mergeFamily = new MergeFamily(db, validate, errors, response, parent.schema);
    var detachFamily = new DetachFamily(db, validate, errors, response, parent.schema);
    var createActivity = new CreateActivity(db, validate, errors, response);
    var deleteActivity = new DeleteActivity(db, validate, errors, response);
    var createBaby = new CreateBaby(db, validate, errors, response);
    var deleteBaby = new DeleteBaby(db, validate, errors, response);
    var createTimer = new CreateTimer(db, validate, errors, response);
    var deleteTimer = new DeleteTimer(db, validate, errors, response);

    var babySync = {
        // RESTFUL Operations
        user: user,
        family: family,
        parent: parent,
        activity: activity,
        baby: baby,
        timer: timer,
        // Derived Operations
        createFamily: createFamily,
        findParent: findParent,
        joinFamily: joinFamily,
        mergeFamily: mergeFamily,
        detachFamily: detachFamily,
        createActivity: createActivity,
        deleteActivity: deleteActivity,
        createBaby: createBaby,
        deleteBaby: deleteBaby,
        createTimer: createTimer,
        deleteTimer: deleteTimer
    }
    return babySync;
};