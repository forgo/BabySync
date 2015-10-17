//
//  LoginViewController.swift
//  Baby Sync
//
//  Created by Elliott Richerson on 9/29/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import FBSDKLoginKit
import UIKit

class LoginViewController: UIViewController {

    var userData: UserData = UserData()
    
    let loginManager: FBSDKLoginManager = FBSDKLoginManager()
    
    @IBOutlet weak var switchBypass: UISwitch!
    
    @IBOutlet weak var labelLogin: UILabel!
    @IBOutlet weak var buttonLogin: UIButton!
    @IBOutlet weak var activityLogin: UIActivityIndicatorView!
    
    func disableSwitchBypass(shouldDisable: Bool) {
        self.switchBypass.on = !shouldDisable
        self.switchBypass.hidden = shouldDisable
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
        self.hideActivity(true)
        
        // Conditionally show bypass switch in DEBUG mode
        #if DEBUG
            disableSwitchBypass(false)
        #else
            disableSwitchBypass(true)
        #endif
        
    }
    
    override func viewDidAppear(animated: Bool) {
        
        if(self.isLoggedIn() && !userData.isEmpty()) {
            self.performSegueWithIdentifier("SegueLoginToHome", sender: self)
        }
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    // Display Logic
    func hideActivity(shouldHide: Bool) {
        self.labelLogin.hidden = !shouldHide
        self.buttonLogin.enabled = shouldHide
        self.activityLogin.hidden = shouldHide
        shouldHide ? self.activityLogin.stopAnimating() : self.activityLogin.startAnimating()
    }
    
    // Request User Data
    func requestUserDataHandler(connection: FBSDKGraphRequestConnection!, result: AnyObject!, error: NSError!) {
        if (error != nil) {
            // Process error
            self.hideActivity(true)
        } else {
            userData.facebookID = result.valueForKey("id") as! String
            userData.name = result.valueForKey("name") as! String
            userData.email = result.valueForKey("email") as! String
            
            // TODO: This is synchronous, do we care for login?
            let picURLString = result.valueForKeyPath("picture.data.url") as! String
            let picURL: NSURL = NSURL(string: picURLString)!
            let picData: NSData = NSData(contentsOfURL: picURL)!
            let pic: UIImage = UIImage(data: picData)!
            userData.pic = pic
        }
    }
    
    func requestUserData() {
        let graphRequest : FBSDKGraphRequest = FBSDKGraphRequest(graphPath: "me", parameters: ["fields": "name, email, picture"])
        graphRequest.startWithCompletionHandler(self.requestUserDataHandler)
    }
    
    // Login Action
    func loginHandler(result: FBSDKLoginManagerLoginResult!, error: NSError!) {
        if (error != nil) {
            // Process error
            self.hideActivity(true)
        } else if (result.isCancelled) {
            // Log in cancelled
            self.hideActivity(true)
        } else {
            // Logged in
            self.requestUserData()
        }
    }
    
    @IBAction func login() {
        
        if(self.switchBypass.on) {
            self.performSegueWithIdentifier("SegueLoginToHome", sender: self)
            return
        }
        
        self.hideActivity(false)
        self.loginManager.logInWithReadPermissions(["public_profile", "email"], fromViewController: self, handler: self.loginHandler)
    }
    
    func isLoggedIn() -> Bool {
        if(FBSDKAccessToken.currentAccessToken() != nil) {
            return true     // Already logged in
        } else {
            return false    // Need to log in
        }
    }
    
    // Segues
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        if (segue.identifier == "SegueLoginToHome") {
            let homeVC: HomeViewController = segue.destinationViewController as! HomeViewController
            homeVC.userData = self.userData
            homeVC.isTest = self.switchBypass.on
        }
    }
    
    @IBAction func prepareForUnwindLogin(segue: UIStoryboardSegue) {
        // Clear user data and log off if unwinded here
        self.userData.clear()
        self.loginManager.logOut()
        self.hideActivity(true)
        if (segue.identifier == "UnwindSegueHomeToLogin") {

        }
    }
    
}
