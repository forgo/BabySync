//
//  AuthFacebook.swift
//  SignInBase
//
//  Created by Elliott Richerson on 10/24/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import FBSDKCoreKit
import FBSDKLoginKit
import UIKit

// MARK: - AuthFacebook Delegate Protocol
protocol AuthFacebookDelegate {
    func didLogin(_ jwt: String, email: String)
    func didEncounterLogin(_ errorsAPI: [ErrorAPI])
}

// MARK: - Facebook Info Struct
struct AuthFacebookInfo {
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

// MARK: - AuthFacebook
class AuthFacebook: NSObject, AuthAppMethod, AuthMethod, AuthFacebookDelegate {
    
    // Singleton
    static let sharedInstance = AuthFacebook()
    fileprivate override init() {
        self.loginManager.loginBehavior = .native
        self.info = AuthFacebookInfo()
    }
    
    // Auth method classes invokes AuthDelegate methods to align SDK differences
    var delegate: AuthDelegate?
    
    // Facebook provided managers
    fileprivate let loginManager: FBSDKLoginManager = FBSDKLoginManager()
    
    // To keep track of internally until login process resolves
    fileprivate var info: AuthFacebookInfo
    
    // MARK: - AuthAppMethod Protocol
    func configure(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [AnyHashable: Any]?) -> Bool {
        self.delegate = Auth.sharedInstance
        return FBSDKApplicationDelegate.sharedInstance().application(application, didFinishLaunchingWithOptions: launchOptions)
    }

    func openURL(_ application: UIApplication, openURL url: URL, sourceApplication: String?, annotation: AnyObject) -> Bool {
        return FBSDKApplicationDelegate.sharedInstance().application(application, open: url, sourceApplication: sourceApplication, annotation: annotation)
    }
    
    // MARK: - AuthMethod Protocol
    func isLoggedIn() -> Bool {
        if(FBSDKAccessToken.current() != nil) {
            return true
        }
        else {
            return false
        }
    }
    
    func login(_ email: String? = nil, password: String? = nil) {
        self.loginManager.logIn(withReadPermissions: ["public_profile", "email"], from: Auth.sharedInstance.loginViewController, handler: self.loginHandler)
    }
    
    func logout() {
        self.loginManager.logOut()
        self.delegate?.didLogout(.Facebook)
    }
    
    // MARK: - Login Handler
    func loginHandler(result: FBSDKLoginManagerLoginResult?, error: Error?) {
        if (error != nil) {
            self.delegate?.loginError(.Facebook, error: error)
        } else if (result!.isCancelled) {
            self.delegate?.loginCancel(.Facebook)
        } else {
            self.requestUserData()
        }
    }
    
    func requestUserData() {
        let graphRequest: FBSDKGraphRequest = FBSDKGraphRequest(graphPath: "me", parameters: ["fields": "name, email, picture"])
        graphRequest.start(completionHandler: self.requestUserDataHandler)
    }
    
    func requestUserDataHandler(connection: FBSDKGraphRequestConnection?, result: Any?, error: Error?) {
        if (error != nil) {
            // Logout and delegate error if we can't get user data
            // because Auth login helper expects user data on success
            self.loginManager.logOut()
            self.delegate?.loginError(.Facebook, error: error)
        } else {
            
            let data:[String:Any] = result as! [String:Any]
            
            self.info.userId = (data["id"]! as? String)!
            self.info.accessToken = FBSDKAccessToken.current().tokenString
            self.info.name = (data["name"]! as? String)!
            self.info.email = (data["email"]! as? String)!
            
            // TODO: Profile pic retrieval is synchronous, do we care for login?
            let picture:[String:Any] = (data["picture"]! as? [String:Any])!
            let pictureData:[String:Any] = (picture["data"]! as? [String:Any])!
            let picURLString = (pictureData["url"]! as? String)!
            let picURL: URL = URL(string: picURLString)!
            let picData: Data = try! Data(contentsOf: picURL)
            self.info.pic = UIImage(data: picData)!
            
            // We got some Facebook data, now let's validate on our own server!
            BabySync.service.login(.Facebook, email: self.info.email, password: nil, accessToken: self.info.accessToken)
        }
    }
    
    // MARK: - AuthFacebookDelegate
    func didLogin(_ jwt: String, email: String) {
        let authUser = AuthUser(service: .Facebook, userId: self.info.userId, accessToken: self.info.accessToken, name: self.info.name, email: email, pic: self.info.pic, jwt: jwt)
        self.delegate?.loginSuccess(.Facebook, user: authUser, wasAlreadyLoggedIn: false)
    }
    
    func didEncounterLogin(_ errorsAPI: [ErrorAPI]) {
        // TODO: Do we need to take into account errors past one if they exist?
        if(errorsAPI.count > 0) {
            let e: Error? = BabySync.errorFrom(errorsAPI[0])
            self.delegate?.loginError(.Facebook, error: e)
        }
    }
}
