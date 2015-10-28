//
//  AuthUser.swift
//  SignInBase
//
//  Created by Elliott Richerson on 10/25/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import Locksmith
import UIKit

struct AuthUser: CreateableSecureStorable,
                 ReadableSecureStorable,
                 DeleteableSecureStorable,
                 GenericPasswordSecureStorable,
                 CustomStringConvertible {

    var userId: String
    var accessToken: String
    var name: String
    var email: String
    var pic: UIImage
    
    // Required by GenericPasswordSecureStorable
    var service: String
    var account: String { return email }
    
    // Required by CreateableSecureStorable
    var data: [String: AnyObject] {
        return [
            "userId": userId,
            "accessToken": accessToken,
            "name": name,
            "email": email,
            "pic": pic
        ]
    }
    
    init() {
        self.service = AuthConstant.Default.AuthMethod.rawValue
        self.userId = ""
        self.accessToken = ""
        self.name = ""
        self.email = ""
        self.pic = AuthConstant.Default.ProfilePic
    }
    
    init(service: AuthMethodType, userId: String, accessToken: String, name: String, email: String, pic: UIImage) {
        self.service = service.rawValue
        self.userId = userId
        self.accessToken = accessToken
        self.name = name
        self.email = email
        self.pic = pic
    }
    
    var description: String {
        let tokenAbbreviation: String = self.accessToken.substringWithRange(Range<String.Index>(start: self.accessToken.startIndex, end: self.accessToken.startIndex.advancedBy(10))) + "..."
        return "AuthUser(\n\tservice: \(self.service)\n\tuserId: \(self.userId)\n\taccessToken: \(tokenAbbreviation)\n\tname: \(self.name)\n\temail: \(self.email)\n\tpic: \(self.pic)\n)"
    }
}