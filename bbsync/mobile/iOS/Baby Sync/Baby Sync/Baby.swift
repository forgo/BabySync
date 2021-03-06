//
//  Baby.swift
//  Baby Sync
//
//  Created by Elliott Richerson on 9/29/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import Foundation

struct Baby {
    var id: Int = 0
    var name: String = ""
    var createdOn: Date = Date()
    var updatedOn: Date = Date()
    var timers: Array<Timer> = Array()
    
    init() {
        self.id = 0
        self.name = ""
        self.createdOn = Date()
        self.updatedOn = Date()
        self.timers = Array()
    }
    
    init(baby: JSON) {
        self.id = baby["id"].intValue
        self.name = baby["name"].stringValue
        self.createdOn = ISO8601DateFormatter.sharedInstance.date(from: baby["created_on"].stringValue)!
        self.updatedOn = ISO8601DateFormatter.sharedInstance.date(from: baby["updated_on"].stringValue)!
        var timers: Array<Timer> = Array()
        for timer in baby["timers"].arrayValue {
            timers.append(Timer(timer: timer))
        }
        self.timers = timers
    }
    
    init(baby: Baby) {
        self.id = baby.id
        self.name = baby.name
        self.createdOn = baby.createdOn
        self.updatedOn = baby.updatedOn
        self.timers = []
        for timer in baby.timers {
            self.timers.append(timer)
        }
    }
}
