//
//  AuthCustom.swift
//  SignInBase
//
//  Created by Elliott Richerson on 10/25/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import Alamofire
import UIKit

// MARK: - AuthCustomDelegate Protocol
protocol AuthCustomDelegate {
    func didLogin(jwt: String, email: String)
    func didEncounterLogin(errors: [Error])
}

// MARK: - Custom Info Struct
struct AuthCustomInfo {
    var userId: String = ""
    var accessToken: String = ""
    var name: String = ""
    var email: String = ""
    var pic: UIImage = AuthConstant.Default.ProfilePic
    
    init() {
        self.userId = ""
        self.accessToken = ""
        self.name = ""
        self.email = ""
        self.pic = AuthConstant.Default.ProfilePic
    }
}

// MARK: - AuthCustom
class AuthCustom: NSObject, AuthAppMethod, AuthMethod, AuthCustomDelegate {
    
    // Singleton
    static let sharedInstance = AuthCustom()
    private override init() {
        self.info = AuthCustomInfo()
    }
    
    // Auth method classes invokes AuthDelegate methods to align SDK differences
    var delegate: AuthDelegate?
    
    // To keep track of internally until login process resolves
    var info: AuthCustomInfo
    
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
            BabySync.service.login(.Custom, email: e, password: p, accessToken: nil)
        }
        else {
            let errorRef = AuthConstant.Error.Client.BadEmailOrPassword.self
            let error: Error = Error(code: errorRef.code, message: errorRef.message)
            let nsError: NSError? = BabySync.nsErrorFrom(error)
            self.delegate?.loginError(.Custom, error: nsError)
        }
    }
    
    func logout() {
        // TODO: implement custom logout
        
        self.delegate?.didLogout(.Custom)
    }
    
    // MARK: - AuthCustomDelegate
    func didLogin(jwt: String, email: String) {
        let authUser = AuthUser(service: .Custom, userId: "", accessToken: "", name: "Some Person", email: email, pic: AuthConstant.Default.ProfilePic, jwt: jwt)
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