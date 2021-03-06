//
//  Auth.swift
//  SignInBase
//
//  Created by Elliott Richerson on 10/24/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import Locksmith
import UIKit

// MARK: - AuthUIDelegate
protocol AuthUIDelegate {
    func authUILoginDidSucceed()
    func authUILoginDidCancel()
    func authUILoginDidError(_ error: Error?)
}

class Auth: NSObject, AuthDelegate {
    
    // Singleton
    static let sharedInstance = Auth()
    fileprivate override init() {
        
        // Default Value for current auth method (until we know better)
        self.currentAuthMethod = .Custom
        self.securedUser = Auth.getSecuredUser()
        
        // Last secured user created in the secure store determines current auth method
        self.currentAuthMethod = AuthMethodType(rawValue: self.securedUser.service)!
    }
    
    fileprivate static func getSecuredUser() -> AuthUser {
        
        var securedUser: AuthUser = AuthUser()
        
        // Attempt to load last email and login service used from NSUserDefaults
        let defaultEmail: String = AuthDefaults.sharedInstance.email
        let defaultAuthMethod: String = AuthDefaults.sharedInstance.authMethod
        
        // User default values indicate the user has never logged in
        if(defaultEmail == AuthConstant.Default.NeverLoggedInEmail ||
            defaultAuthMethod == AuthConstant.Default.NeverLoggedInAuthMethod) {
                
                // TODO: Do something different on first login...
        }
        else {
            // Try to load secure data for default auth data
            let secureData = Locksmith.loadDataForUserAccount(userAccount: defaultEmail, inService: defaultAuthMethod)
            let authMethod: AuthMethodType = AuthMethodType(rawValue: defaultAuthMethod)!
            let userId: String = secureData?["userId"] as! String
            let accessToken: String = secureData?["accessToken"] as! String
            let name: String = secureData?["name"] as! String
            let email: String = secureData?["email"] as! String
            let pic: UIImage = secureData?["pic"] as! UIImage
            let jwt: String = secureData?["jwt"] as! String
            
            securedUser = AuthUser(service: authMethod, userId: userId, accessToken: accessToken, name: name, email: email, pic: pic, jwt: jwt)
        }
        
        return securedUser
    }
    
    // Auth method classes invokes AuthDelegate methods to align SDK differences
    var authUIDelegate: AuthUIDelegate?
    
    // Login View Controller from which authentication controllers are presented
    var loginViewController: AuthViewController?
    
    // Locksmith Secure Storable
    var securedUser: AuthUser
    
    // Keep Track of Current Login Method
    var currentAuthMethod: AuthMethodType
    
    // Auth Method Helpers
    var google: AuthGoogle = AuthGoogle.sharedInstance
    var facebook: AuthFacebook = AuthFacebook.sharedInstance
    var custom: AuthCustom = AuthCustom.sharedInstance
    
    // MARK: - AuthDelegate
    func loginSuccess(_ method: AuthMethodType, user: AuthUser, wasAlreadyLoggedIn: Bool = false) {
        
        if(wasAlreadyLoggedIn) {
            self.authUIDelegate?.authUILoginDidSucceed()
        }
        else {
            switch method {
            case .Google:
                print("Google login success.")
                self.currentAuthMethod = .Google
            case .Facebook:
                print("Facebook login success.")
                self.currentAuthMethod = .Facebook
            case .Custom:
                print("Custom login success.")
                self.currentAuthMethod = .Custom
            }
            
            self.securedUser = user;
            print(self.securedUser.description)
            
            do {
                try self.securedUser.deleteFromSecureStore()
            } catch {
                print("Something went wrong trying to delete existing secure store user. Perhaps this is your first login, and there's nothing to delete.")
            }
            
            do {
                try self.securedUser.createInSecureStore()
            } catch {
                print("Something went wrong trying to create secure store user")
            }
            
            // TODO: something
            
            self.authUIDelegate?.authUILoginDidSucceed()
        }
    }
    
    func loginCancel(_ method: AuthMethodType) {
        switch method {
        case .Google:
            print("Google login cancelled.")
        case .Facebook:
            print("Facebook login cancelled.")
        case .Custom:
            print("Custom login cancelled.")
        }
        
        self.authUIDelegate?.authUILoginDidCancel()
    }

    func loginError(_ method: AuthMethodType, error: Error?) {
        switch method {
        case .Google:
            print("Google login error.")
        case .Facebook:
            print("Facebook login error.")
        case .Custom:
            print("Custom login error.")
        }
        
        // To prevent bypass of login screen after error
        self.logout()
        do {
            try self.securedUser.deleteFromSecureStore()
        } catch {
            print("Something went wrong trying to delete existing secure store user. Perhaps this is your first login, and there's nothing to delete.")
        }
        
        
        self.authUIDelegate?.authUILoginDidError(error)
    }
    
    func didLogout(_ method: AuthMethodType) {
        switch method {
        case .Google:
            print("Google logout.")
        case .Facebook:
            print("Facebook logout.")
        case .Custom:
            print("Custom logout.")
        }
    }
    
    func didFailToLogout(_ method: AuthMethodType, error: Error?) {
        switch method {
        case .Google:
            print("Google logout failure.")
        case .Facebook:
            print("Google logout failure.")
        case .Custom:
            print("Google logout failure.")
        }
        print("\(error?.localizedDescription)")
    }

    // MARK: - Auth Helpers
    
    func isLoggedIn() -> Bool {
        return self.google.isLoggedIn() || self.facebook.isLoggedIn() || self.custom.isLoggedIn()
    }
    
    func login(_ method: AuthMethodType, email: String? = nil, password: String? = nil) {
        switch method {
        case .Google:
            print("Attempting Google login.")
            if(self.google.isLoggedIn()) {
                print("Already logged in to Google.")
                self.loginSuccess(method, user: self.securedUser, wasAlreadyLoggedIn: true)
            }
            else {
                self.google.login()
            }
        case .Facebook:
            print("Attempting Facebook login.")
            if(self.facebook.isLoggedIn()) {
                print("Already logged in to Facebook.")
                self.loginSuccess(method, user: self.securedUser, wasAlreadyLoggedIn: true)
            }
            else {
                self.facebook.login()
            }
        case .Custom:
            print("Attempting Custom login.")
            if(self.custom.isLoggedIn()) {
                print("Already logged in to Custom.")
                self.loginSuccess(method, user: self.securedUser, wasAlreadyLoggedIn: true)
            }
            else {
                if let e = email, let p = password {
                    self.custom.login(e, password: p)
                }
                else {
                    let errorRef = AuthConstant.Error.Client.BadEmailOrPassword.self
                    let errorAPI: ErrorAPI = ErrorAPI(code: errorRef.code, message: errorRef.message)
                    let error: Error? = BabySync.errorFrom(errorAPI)
                    self.authUIDelegate?.authUILoginDidError(error)
                }
            }
        }
    }
    
    func logout() {

        // Logout of anything that thinks we're logged in
        if(self.google.isLoggedIn()) {
            print("Attempting Google logout.")
            self.google.logout()
        }
        else {
            print("Already logged out of Google.")
        }
        
        if(self.facebook.isLoggedIn()) {
            print("Attempting Facebook logout.")
            self.facebook.logout()
        }
        else {
            print("Already logged out of Facebook.")
        }
        
        if(self.custom.isLoggedIn()) {
            print("Attempting Custom logout.")
            self.custom.logout()
        }
        else {
            print("Already logged out of Custom.")
        }
        
    }

}
