//
//  AuthCustom.swift
//  SignInBase
//
//  Created by Elliott Richerson on 10/25/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

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
    
    func login() {
        // TODO: implement custom login
//        if let loginVC = Auth.sharedInstance.loginViewController {
//            let email = loginVC.textFieldEmail.text!
//            let password = loginVC.textFieldPassword.text!
            
//            
//            
//                let endpointLoginParent = "parent/auth"
//                let accessToken: String = Auth.sharedInstance.securedUser.accessToken
//                var loginParams = ["email":email,"authMethod":AuthMethodType.Custom.rawValue]
//                switch authMethod {
//                case .Google, .Facebook:
//                    loginParams["token"] = accessToken
//                case .Custom:
//                    loginParams["password"] = parentPassword
//                }
//                
//                Alamofire.request(.POST, baseURL+endpointLoginParent, parameters: loginParams).responseJSON { response in
//                    let (jsonData, jsonErrors) = self.parse(response)
//                    if (jsonErrors != nil) {
//                        self.handle(self.errors(jsonErrors))
//                        return
//                    }
//                    if (self.parseFamily(jsonData)) {
//                        self.delegate?.didCreate(self.family)
//                    }
//                }
            
            
            
            
//        }
//        else {
//            print("Login view controller not yet set as Auth login view controller.")
//        }
    }
    
    func logout() {
        // TODO: implement custom logout
    }
}