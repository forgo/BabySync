//
//  BabyModel+CoreDataProperties.swift
//  Baby Sync
//
//  Created by Elliott Richerson on 10/5/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//
//  Choose "Create NSManagedObject Subclass…" from the Core Data editor menu
//  to delete and recreate this implementation file for your updated model.
//

import Foundation
import CoreData

extension BabyModel {

    @NSManaged var id: NSNumber?
    @NSManaged var image: Data?

}
