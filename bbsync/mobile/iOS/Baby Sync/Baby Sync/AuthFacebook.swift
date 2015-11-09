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
    func didLogin(jwt: String, email: String)
    func didEncounterLogin(errors: [Error])
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
    private override init() {
        self.loginManager.loginBehavior = .Native
        self.info = AuthFacebookInfo()
    }
    
    // Auth method classes invokes AuthDelegate methods to align SDK differences
    var delegate: AuthDelegate?
    
    // Facebook provided managers
    private let loginManager: FBSDKLoginManager = FBSDKLoginManager()
    
    // To keep track of internally until login process resolves
    private var info: AuthFacebookInfo
    
    // MARK: - AuthAppMethod Protocol
    func configure(application: UIApplication, didFinishLaunchingWithOptions launchOptions: [NSObject : AnyObject]?) -> Bool {
        self.delegate = Auth.sharedInstance
        return FBSDKApplicationDelegate.sharedInstance().application(application, didFinishLaunchingWithOptions: launchOptions)
    }

    func openURL(application: UIApplication, openURL url: NSURL, sourceApplication: String?, annotation: AnyObject) -> Bool {
        return FBSDKApplicationDelegate.sharedInstance().application(application, openURL: url, sourceApplication: sourceApplication, annotation: annotation)
    }
    
    // MARK: - AuthMethod Protocol
    func isLoggedIn() -> Bool {
        if(FBSDKAccessToken.currentAccessToken() != nil) {
            return true
        }
        else {
            return false
        }
    }
    
    func login(email: String? = nil, password: String? = nil) {
        self.loginManager.logInWithReadPermissions(["public_profile", "email"], fromViewController: Auth.sharedInstance.loginViewController, handler: self.loginHandler)
    }
    
    func logout() {
        self.loginManager.logOut()
        self.delegate?.didLogout(.Facebook)
    }
    
    // MARK: - Login Handler
    func loginHandler(result: FBSDKLoginManagerLoginResult!, error: NSError!) {
        if (error != nil) {
            self.delegate?.loginError(.Facebook, error: error)
        } else if (result.isCancelled) {
            self.delegate?.loginCancel(.Facebook)
        } else {
            self.requestUserData()
        }
    }
    
    func requestUserData() {
        let graphRequest: FBSDKGraphRequest = FBSDKGraphRequest(graphPath: "me", parameters: ["fields": "name, email, picture"])
        graphRequest.startWithCompletionHandler(self.requestUserDataHandler)
    }
    
    func requestUserDataHandler(connection: FBSDKGraphRequestConnection!, result: AnyObject!, error: NSError!) {
        if (error != nil) {
            // Logout and delegate error if we can't get user data
            // because Auth login helper expects user data on success
            self.loginManager.logOut()
            self.delegate?.loginError(.Facebook, error: error)
        } else {
            self.info.userId = result.valueForKey("id") as! String
            self.info.accessToken = FBSDKAccessToken.currentAccessToken().tokenString
            self.info.name = result.valueForKey("name") as! String
            self.info.email = result.valueForKey("email") as! String
            
            // TODO: Profile pic retrieval is synchronous, do we care for login?
            let picURLString = result.valueForKeyPath("picture.data.url") as! String
            let picURL: NSURL = NSURL(string: picURLString)!
            let picData: NSData = NSData(contentsOfURL: picURL)!
            self.info.pic = UIImage(data: picData)!
            
            // We got some Facebook data, now let's validate on our own server!
            BabySync.service.login(.Facebook, email: self.info.email, password: nil, accessToken: self.info.accessToken)
        }
    }
    
    // MARK: - AuthFacebookDelegate
    func didLogin(jwt: String, email: String) {
        let authUser = AuthUser(service: .Facebook, userId: self.info.userId, accessToken: self.info.accessToken, name: self.info.name, email: email, pic: self.info.pic, jwt: jwt)
        self.delegate?.loginSuccess(.Facebook, user: authUser)
    }
    
    func didEncounterLogin(errors: [Error]) {
        // TODO: Do we need to take into account errors past one if they exist?
        if(errors.count > 0) {
            let e: NSError? = BabySync.nsErrorFrom(errors[0])
            self.delegate?.loginError(.Facebook, error: e)
        }
    }
}