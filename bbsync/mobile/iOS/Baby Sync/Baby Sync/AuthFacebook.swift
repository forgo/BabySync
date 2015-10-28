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

// MARK: - AuthFacebook
class AuthFacebook: NSObject, AuthAppMethod, AuthMethod {
    
    // Singleton
    static let sharedInstance = AuthFacebook()
    private override init() {
        self.loginManager.loginBehavior = .Native
    }
    
    // Auth method classes invokes AuthDelegate methods to align SDK differences
    var delegate: AuthDelegate?
    
    private let loginManager: FBSDKLoginManager = FBSDKLoginManager()
    
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
    
    func login() {
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
            let userId: String = result.valueForKey("id") as! String
            let accessToken: String = FBSDKAccessToken.currentAccessToken().tokenString
            let name: String = result.valueForKey("name") as! String
            let email: String = result.valueForKey("email") as! String
            
            // TODO: Profile pic retrieval is synchronous, do we care for login?
            let picURLString = result.valueForKeyPath("picture.data.url") as! String
            let picURL: NSURL = NSURL(string: picURLString)!
            let picData: NSData = NSData(contentsOfURL: picURL)!
            let pic: UIImage = UIImage(data: picData)!
            
            let authUser = AuthUser(service: .Facebook, userId: userId, accessToken: accessToken, name: name, email: email, pic: pic)
            self.delegate?.loginSuccess(.Facebook, user: authUser)
        }
    }
    
}