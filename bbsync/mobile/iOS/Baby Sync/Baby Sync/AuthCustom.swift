//
//  AuthCustom.swift
//  SignInBase
//
//  Created by Elliott Richerson on 10/25/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import Alamofire
import UIKit

// MARK: - AuthCustom
class AuthCustom: NSObject, AuthAppMethod, AuthMethod, BabySyncLoginDelegate {
    
    // Singleton
    static let sharedInstance = AuthCustom()
    private override init() {}
    
    // Auth method classes invokes AuthDelegate methods to align SDK differences
    var delegate: AuthDelegate?
    
    // MARK: - AuthAppMethod Protocol
    func configure(application: UIApplication, didFinishLaunchingWithOptions launchOptions: [NSObject : AnyObject]?) -> Bool {
        return true
    }
    
    func openURL(application: UIApplication, openURL url: NSURL, sourceApplication: String?, annotation: AnyObject) -> Bool {
        return true
    }
    
    // MARK: - AuthMethod Protocol
    func isLoggedIn() -> Bool {
        return false
    }
    
    func login(email: String?, password: String?) {
        if let e = email, p = password {
            BabySync.service.delegateLogin = Auth.sharedInstance.custom // necessary to switch for each auth method!
            BabySync.service.login(.Custom, email: e, password: p, accessToken: nil)
        }
        else {
            if let domain = AuthConstant.Error.Domain {
                let error: NSError = NSError(domain: domain, code: AuthConstant.Error.CodeClientBadEmailOrPassword , userInfo: nil)
                self.delegate?.loginError(.Custom, error: error)
            }
        }
    }
    
    func logout() {
        // TODO: implement custom logout
        
        self.delegate?.didLogout(.Custom)
    }
    
    // MARK: - BabySyncLoginDelegate
    func didLogin(method: AuthMethodType, jwt: String, email: String, accessToken: String) {
        let authUser = AuthUser(service: .Custom, userId: "", accessToken: accessToken, name: "Some Person", email: email, pic: AuthConstant.Default.ProfilePic, jwt: jwt)
        self.delegate?.loginSuccess(.Custom, user: authUser)
    }
    
    func didEncounterLogin(errors: [Error]) {
        // TODO: Do we need to take into account errors past one if they exist?
        if(errors.count > 0) {
            let e: NSError? = BabySync.nsErrorFrom(errors[0])
            self.delegate?.loginError(.Custom, error: e)
        }
    }
}