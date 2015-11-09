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
class AuthCustom: NSObject, AuthAppMethod, AuthMethod {
    
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
            BabySync.service.login(e, password: p)
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
    }
}