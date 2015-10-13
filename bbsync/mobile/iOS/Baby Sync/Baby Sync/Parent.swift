//
//  Parent.swift
//  Baby Sync
//
//  Created by Elliott Richerson on 9/29/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import Foundation

struct Parent {
    var id: Int = 0
    var facebookID: Int = 0
    var name: String = ""
    var email: String = ""
    var createdOn: NSDate = NSDate()
    var updatedOn: NSDate = NSDate()
    
    init() {
        self.id = 0
        self.facebookID = 0
        self.name = ""
        self.email = ""
        self.createdOn = NSDate()
        self.updatedOn = NSDate()
    }
    
    init(parent: JSON) {
        self.id = parent["id"].intValue
        self.facebookID = parent["facebookID"].intValue
        self.name = parent["name"].stringValue
        self.email = parent["email"].stringValue
        self.createdOn = ISO8601DateFormatter.sharedInstance.dateFromString(parent["created_on"].stringValue)!
        self.updatedOn = ISO8601DateFormatter.sharedInstance.dateFromString(parent["updated_on"].stringValue)!
    }
    
    init(parent: Parent) {
        self.id = parent.id
        self.facebookID = parent.facebookID
        self.name = parent.name
        self.email = parent.email
        self.createdOn = parent.createdOn
        self.updatedOn = parent.updatedOn
    }
}