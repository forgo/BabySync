//
//  AuthDefaults.swift
//  SignInBase
//
//  Created by Elliott Richerson on 10/25/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import Foundation

class AuthDefaults {
    
    // Singleton
    static let sharedInstance = AuthDefaults()
    fileprivate init() {}
    
    fileprivate var defaults: UserDefaults = UserDefaults.standard
    
    var email: String {
        get {
            if let email = self.defaults.string(forKey: AuthConstant.Default.KeyEmail) {
                return email
            }
            else {
                return AuthConstant.Default.NeverLoggedInEmail
            }
        }
        set {
            self.defaults.setValue(newValue, forKey: AuthConstant.Default.KeyEmail)
        }
    }
    
    var authMethod: String {
        get {
            if let authMethod = self.defaults.string(forKey: AuthConstant.Default.KeyAuthMethod) {
                return authMethod
            }
            else {
                return AuthConstant.Default.NeverLoggedInAuthMethod
            }
        }
        set {
            self.defaults.setValue(newValue, forKey: AuthConstant.Default.KeyAuthMethod)
        }
    }
    

}
