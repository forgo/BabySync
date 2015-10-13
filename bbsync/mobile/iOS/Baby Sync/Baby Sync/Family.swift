//
//  Family.swift
//  Baby Sync
//
//  Created by Elliott Richerson on 9/29/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import Foundation

struct Family {
    var id: Int = 0
    var name: String = ""
    var createdOn: NSDate = NSDate()
    var updatedOn: NSDate = NSDate()
    
    init() {
        self.id = 0
        self.name = ""
        self.createdOn = NSDate()
        self.updatedOn = NSDate()
    }
    
    init(family: JSON) {
        self.id = family["id"].intValue
        self.name = family["name"].stringValue
        self.createdOn = ISO8601DateFormatter.sharedInstance.dateFromString(family["created_on"].stringValue)!
        self.updatedOn = ISO8601DateFormatter.sharedInstance.dateFromString(family["updated_on"].stringValue)!
    }
    
    init(family: Family) {
        self.id = family.id
        self.name = family.name
        self.createdOn = family.createdOn
        self.updatedOn = family.updatedOn
    }
    
}