//
//  Timer.swift
//  Baby Sync
//
//  Created by Elliott Richerson on 9/29/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import Foundation

struct Timer {
    var id: Int = 0
    var activityID: Int = 0
    var resetDate: Date = Date()
    var enabled: Bool = true
    var push: Bool = false
    var createdOn: Date = Date()
    var updatedOn: Date = Date()
    
    init() {
        self.id = 0
        self.activityID = 0
        self.resetDate = Date()
        self.enabled = true
        self.push = false
        self.createdOn = Date()
        self.updatedOn = Date()
    }
    
    init(timer: JSON) {
        self.id = timer["id"].intValue
        self.activityID = timer["activityID"].intValue
        self.resetDate = ISO8601DateFormatter.sharedInstance.date(from: timer["resetDate"].stringValue)!
        self.enabled = timer["enabled"].boolValue
        self.push = timer["push"].boolValue
        self.createdOn = ISO8601DateFormatter.sharedInstance.date(from: timer["created_on"].stringValue)!
        self.updatedOn = ISO8601DateFormatter.sharedInstance.date(from: timer["updated_on"].stringValue)!
    }
    
    init(timer: Timer) {
        self.id = timer.id
        self.activityID = timer.activityID
        self.resetDate = timer.resetDate
        self.enabled = timer.enabled
        self.push = timer.push
        self.createdOn = timer.createdOn
        self.updatedOn = timer.updatedOn
    }
}

