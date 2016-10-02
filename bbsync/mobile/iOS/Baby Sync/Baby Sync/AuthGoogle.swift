//
//  AuthGoogle.swift
//  SignInBase
//
//  Created by Elliott Richerson on 10/24/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import UIKit
import Google
import GoogleSignIn

// MARK: - AuthGoogle Delegate Protocol
protocol AuthGoogleDelegate {
    func didLogin(_ jwt: String, email: String)
    func didEncounterLogin(_ errorsAPI: [ErrorAPI])
}

// MARK: - Google Info Struct
struct AuthGoogleInfo {
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

// MARK: - AuthGoogle
class AuthGoogle: NSObject, AuthAppMethod, AuthMethod, GIDSignInDelegate, GIDSignInUIDelegate, AuthGoogleDelegate {
    
    // Singleton
    static let sharedInstance = AuthGoogle()
    fileprivate override init() {
        self.signIn = GIDSignIn.sharedInstance()
        self.signIn.shouldFetchBasicProfile = true
        self.info = AuthGoogleInfo()
    }
    
    // Auth method classes invokes AuthDelegate methods to align SDK differences
    var delegate: AuthDelegate?
    
    // Google provided managers
    var signIn: GIDSignIn
    fileprivate var signInButton: GIDSignInButton!
    
    // To keep track of internally until login process resolves
    fileprivate var info: AuthGoogleInfo
    
    // MARK: - AuthAppMethod Protocol
    func configure(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [AnyHashable: Any]?) -> Bool {
        var configureError: Error?
        GGLContext.sharedInstance().configureWithError(&configureError)
        assert(configureError == nil, "Error configuring Google services: \(configureError)")
        self.signIn.delegate = self
        self.delegate = Auth.sharedInstance
        return true
    }
    
    func openURL(_ application: UIApplication, openURL url: URL, sourceApplication: String?, annotation: AnyObject) -> Bool {
        return self.signIn.handle(url, sourceApplication: sourceApplication, annotation: annotation)
    }
    
    // MARK: - AuthMethod Protocol
    func isLoggedIn() -> Bool {
        if(self.signIn.currentUser != nil) {
            return true
        }
        else {
            return false
        }
    }
    
    func login(_ email: String? = nil, password: String? = nil) {
        self.signIn.signIn();
    }

    func logout() {
        // Revokes authentication, token removed from keychain        
        self.signIn.signOut()
        self.signIn.disconnect()
    }
    
    // MARK: - GIDSignInDelegate
    /* -------------------------------------------------------------------------
    Note: The Sign-In SDK automatically acquires access tokens, but the
    access tokens will be refreshed only when you call signIn or
    signInSilently. To explicitly refresh the access token, call the
    refreshAccessTokenWithHandler: method. If you need the access token and
    want the SDK to automatically handle refreshing it, you can use the
    getAccessTokenWithHandler: method.
    
    Important: If you need to pass the currently signed-in user to a backend
    server, send the user's ID token to your backend server and validate the
    token on the server.
    */
    
    func sign(_ signIn: GIDSignIn!, didSignInFor user: GIDGoogleUser!, withError error: Error!) {
        if (error == nil) {
            // TODO: Can we leverage user.serverAuthCode for token validation?
            self.info.userId = user.userID                        // For client-side use only!
            self.info.accessToken = user.authentication.idToken   // Safe to sendn to the server
            self.info.name = user.profile.name
            self.info.email = user.profile.email
            
            if(user.profile.hasImage) {
                // TODO: Profile pic retrieval is synchronous, do we care for login?
                let picURL: URL = user.profile.imageURL(withDimension: 256)
                let picData: Data = try! Data(contentsOf: picURL)
                self.info.pic = UIImage(data: picData)!
            }
            else {
                self.info.pic = AuthConstant.Default.ProfilePic
            }
            
            // We got some Google data, now let's validate on our own server!
            BabySync.service.login(.Google, email: self.info.email, password: nil, accessToken: self.info.accessToken)

        } else {
            self.delegate?.loginError(.Google, error: error)
        }
    }
    
    func sign(_ signIn: GIDSignIn!, didDisconnectWith user: GIDGoogleUser!, withError error: Error!) {
        // Perform any operations when the user disconnects from app here.
        if (error == nil) {
            self.delegate?.didLogout(.Google)
        }
        else {
            self.delegate?.didFailToLogout(.Google, error: error)
        }
        
    }
    
    // MARK: - GIDSignInUIDelegate
    
    // The sign-in flow has finished selecting how to proceed, and the UI should no longer display
    // a spinner or other "please wait" element.
    func sign(inWillDispatch signIn: GIDSignIn!, error: Error!) {
        print("signInWillDispatch (Google)")
        // stop animating spinner
    }
    
    // If implemented, this method will be invoked when sign in needs to display a view controller.
    // The view controller should be displayed modally (via UIViewController's |presentViewController|
    // method, and not pushed unto a navigation controller's stack.
    func sign(_ signIn: GIDSignIn!, present viewController: UIViewController!) {
        print("signIn presentViewController (Google)")
        Auth.sharedInstance.loginViewController?.present(viewController, animated: true, completion: nil)
    }
    
    // If implemented, this method will be invoked when sign in needs to dismiss a view controller.
    // Typically, this should be implemented by calling |dismissViewController| on the passed
    // view controller.
    func sign(_ signIn: GIDSignIn!, dismiss viewController: UIViewController!) {
        print("signIn dismissViewController (Google)")
        Auth.sharedInstance.loginViewController?.dismiss(animated: true, completion: nil)
    }
    
    // MARK: - AuthGoogleDelegate
    func didLogin(_ jwt: String, email: String) {
        let authUser = AuthUser(service: .Google, userId: self.info.userId, accessToken: self.info.accessToken, name: self.info.name, email: self.info.email, pic: self.info.pic, jwt: jwt)
        self.delegate?.loginSuccess(.Google, user: authUser, wasAlreadyLoggedIn: false)
    }
    
    func didEncounterLogin(_ errorsAPI: [ErrorAPI]) {
        // TODO: Do we need to take into account errors past one if they exist?
        if(errorsAPI.count > 0) {
            let e: Error? = BabySync.errorFrom(errorsAPI[0])
            self.delegate?.loginError(.Google, error: e)
        }
    }
    
}
