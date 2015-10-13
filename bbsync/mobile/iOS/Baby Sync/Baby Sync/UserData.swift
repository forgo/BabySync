//
//  UserData.swift
//  Baby Sync
//
//  Created by Elliott Richerson on 9/29/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import UIKit

struct UserData : CustomStringConvertible {
    var facebookID, name, email: String
    var pic: UIImage
    init() {
        self.facebookID = ""
        self.name = ""
        self.email = ""
        self.pic = UIImage()
    }
    mutating func clear() {
        self.facebookID = ""
        self.name = ""
        self.email = ""
        self.pic = UIImage()
    }
    func isEmpty() -> Bool {
        return (self.facebookID == "" && self.name == "" && self.email == "")
    }
    var description: String {
        return "UserData(\n\tfacebookID: \(self.facebookID)\n\tname: \(self.name)\n\temail: \(self.email)\n\tpic: \(self.pic)\n)"
    }
}

