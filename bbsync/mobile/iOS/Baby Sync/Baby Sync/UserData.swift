//
//  UserData.swift
//  Baby Sync
//
//  Created by Elliott Richerson on 9/29/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import UIKit

enum UserLoginType: String {
    case Facebook = "facebook"
    case Google = "google"
    case BabySync = "babysync"
}

struct UserData : CustomStringConvertible {
    var facebookID, facebookToken, googleID, googleToken, name, email: String
    var pic: UIImage
    var loginType: UserLoginType
    init() {
        self.facebookID = ""
        self.facebookToken = ""
        self.googleID = ""
        self.googleToken = ""
        self.name = ""
        self.email = ""
        self.pic = UIImage()
        self.loginType = .BabySync
    }
    mutating func clear() {
        self.facebookID = ""
        self.facebookToken = ""
        self.googleID = ""
        self.googleToken = ""
        self.name = ""
        self.email = ""
        self.pic = UIImage()
        self.loginType = .BabySync
    }
    func isEmpty() -> Bool {
        return (self.facebookID == "" && self.facebookToken == "" && self.googleID == "" && self.googleToken == "" && self.name == "" && self.email == "" && self.loginType == .BabySync)
    }
    var description: String {
        return "UserData(\n\tfacebookID: \(self.facebookID)\n\tfacebookToken: \(self.facebookToken)\n\tgoogleID: \(self.googleID)\n\tgoogleToken: \(self.googleToken)\n\tname: \(self.name)\n\temail: \(self.email)\n\tpic: \(self.pic)\n\tloginType: \(self.loginType)\n)"
    }
    
    static var sharedInstance = UserData()
}

