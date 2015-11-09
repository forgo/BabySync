//
//  AuthConstant.swift
//  SignInBase
//
//  Created by Elliott Richerson on 10/25/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import UIKit

struct AuthConstant {
    struct Default {
        static let AuthMethod = AuthMethodType.Custom
        static let KeyEmail = "kUserDefaultsEmailKey"
        static let KeyAuthMethod = "kUserDefaultsAuthMethodKey"
        static let NeverLoggedInEmail = "UserDefaultsNeverLoggedInEmail"
        static let NeverLoggedInAuthMethod = "UserDefaultsNeverLoggedInAuthMethod"
        static let ProfilePic = UIImage(named: "defaultProfilePic")!
    }
    struct Error {
        static let Domain = NSBundle.mainBundle().bundleIdentifier
        struct Client {
            struct BadEmailOrPassword {
                static let code = 701
                static let message = "Bad email or password."
            }
        }
    }
}