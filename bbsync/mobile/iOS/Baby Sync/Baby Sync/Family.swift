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
    var createdOn: Date = Date()
    var updatedOn: Date = Date()
    
    init?() {
        self.id = 0
        self.name = ""
        self.createdOn = Date()
        self.updatedOn = Date()
    }
    
    init?(family: JSON) {
        self.id = family["id"].intValue
        self.name = family["name"].stringValue
        self.createdOn = ISO8601DateFormatter.sharedInstance.date(from: family["created_on"].stringValue)!
        self.updatedOn = ISO8601DateFormatter.sharedInstance.date(from: family["updated_on"].stringValue)!
    }
    
    init?(family: Family) {
        self.id = family.id
        self.name = family.name
        self.createdOn = family.createdOn
        self.updatedOn = family.updatedOn
    }
    
}
