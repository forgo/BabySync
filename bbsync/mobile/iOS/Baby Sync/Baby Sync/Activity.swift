//
//  Activity.swift
//  Baby Sync
//
//  Created by Elliott Richerson on 9/29/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import Foundation

struct Activity {
    var id: Int = 0
    var name: String = ""
    var icon: String = ""
    var warn: TimeInterval = TimeInterval()
    var critical: TimeInterval = TimeInterval()
    var createdOn: Date = Date()
    var updatedOn: Date = Date()
    
    init() {
        self.id = 0
        self.name = ""
        self.icon = ""
        self.warn = 0.0
        self.critical = 0.0
        self.createdOn = Date()
        self.updatedOn = Date()
    }
    
    init(activity: JSON) {
        self.id = activity["id"].intValue
        self.name = activity["name"].stringValue
        self.icon = activity["icon"].stringValue
        self.warn = activity["warn"].doubleValue
        self.critical = activity["critical"].doubleValue
        self.createdOn = ISO8601DateFormatter.sharedInstance.date(from: activity["created_on"].stringValue)!
        self.updatedOn = ISO8601DateFormatter.sharedInstance.date(from: activity["updated_on"].stringValue)!
    }
    
    init(activity: Activity) {
        self.id = activity.id
        self.name = activity.name
        self.icon = activity.icon
        self.warn = activity.warn
        self.critical = activity.critical
        self.createdOn = activity.createdOn
        self.updatedOn = activity.updatedOn
    }
}
