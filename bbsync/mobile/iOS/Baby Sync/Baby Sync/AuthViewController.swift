//
//  AuthViewController.swift
//  Baby Sync
//
//  Created by Elliott Richerson on 10/27/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import UIKit

class AuthViewController: UIViewController, AuthUIDelegate, UITextFieldDelegate {

    @IBOutlet weak var buttonLoginFacebook: UIButton!
    @IBOutlet weak var buttonLoginGoogle: UIButton!
    
    @IBOutlet weak var textFieldEmail: UITextField!
    @IBOutlet weak var textFieldPassword: UITextField!
    @IBOutlet weak var buttonLoginCustom: UIButton!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Setup Auth Helper
        Auth.sharedInstance.authUIDelegate = self
        Auth.sharedInstance.loginViewController = self
        
        // Hide Interface Until We Know Logged In
        self.view.hidden = true
        
        // Login Text Field Configuration
        self.textFieldEmail.delegate = self
        self.textFieldPassword.delegate = self
        self.resetPlaceholder(self.textFieldEmail, placeholder: "email")
        self.resetPlaceholder(self.textFieldPassword, placeholder: "password")
    }
    
    func resetPlaceholder(textField: UITextField, placeholder: String) {
        let placeholderTextColor: UIColor = UIColor.whiteColor()
        textField.attributedPlaceholder = NSAttributedString(string: placeholder, attributes: [NSForegroundColorAttributeName:placeholderTextColor])
    }
    
    override func viewDidAppear(animated: Bool) {
        // Skip Login If Already Logged In
        if(Auth.sharedInstance.isLoggedIn()) {
            self.performSegueWithIdentifier("SegueLoginToHome", sender: self)
        }
        else {
            self.view.hidden = false
        }
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    override func preferredStatusBarStyle() -> UIStatusBarStyle {
        return UIStatusBarStyle.LightContent
    }

    
    // MARK: User Actions
    
    @IBAction func pressedLoginButton(sender: UIButton) {
        if(sender == self.buttonLoginGoogle) {
            if(Auth.sharedInstance.google.isLoggedIn()) {
                print("Pressed Google login button, but Google already logged in.")
                self.performSegueWithIdentifier("SegueLoginToHome", sender: self)
            }
            else {
                Auth.sharedInstance.login(.Google)
            }
        }
        else if(sender == self.buttonLoginFacebook) {
            if(Auth.sharedInstance.facebook.isLoggedIn()) {
                print("Pressed Facebook login button but Facebook already logged in.")
                self.performSegueWithIdentifier("SegueLoginToHome", sender: self)
            }
            else {
                Auth.sharedInstance.login(.Facebook)
            }
            
        }
        else if(sender == self.buttonLoginCustom) {
            if(Auth.sharedInstance.custom.isLoggedIn()) {
                print("Pressed Custom login button but already logged in.")
                self.performSegueWithIdentifier("SegueLoginToHome", sender: self)
            }
            else {
                Auth.sharedInstance.login(.Custom)
            }
        }
    }
    
    // MARK: - Navigation
    
    // Segues
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        if (segue.identifier == "SegueLoginToHome") {
            let homeVC: HomeViewController = segue.destinationViewController as! HomeViewController
            //homeVC.isTest = self.switchBypass.on
        }
    }
    
    @IBAction func prepareForUnwindLogin(segue: UIStoryboardSegue) {
        // Clear user data and log off if unwinded here
//        UserData.sharedInstance.clear()
//        self.loginManager.logOut()
//        self.hideActivity(true)
        if (segue.identifier == "UnwindSegueHomeToLogin") {
            
        }
    }
    
    // MARK: - AuthUIDelegate
    
    func authUILoginDidSucceed() {
        self.performSegueWithIdentifier("SegueLoginToHome", sender: self)
    }
    
    func authUILoginDidCancel() {
        print("Login was cancelled")
    }
    
    func authUILoginDidError() {
        print("Login was unsuccessful")
    }
    
    // MARK: Touch Interactions
    override func touchesBegan(touches: Set<UITouch>, withEvent event: UIEvent?) {
        self.view.endEditing(true)
        super.touchesBegan(touches, withEvent: event)
    }
    
    // MARK: - UITextFieldDelegate
    func textFieldDidBeginEditing(textField: UITextField) {
        if(textField.text?.characters.count == 0) {
            textField.placeholder = nil
        }
    }
//    func textFieldShouldReturn(textField: UITextField) -> Bool {
//        self.view.endEditing(true)
//        return false
//    }
    func textFieldDidEndEditing(textField: UITextField) {
        if(textField == self.textFieldEmail) {
            if(textField.text?.characters.count == 0) {
                self.resetPlaceholder(textField, placeholder: "email")
            }
        }
        else if(textField == self.textFieldPassword) {
            if(textField.text?.characters.count == 0) {
                self.resetPlaceholder(textField, placeholder: "password")
            }
        }
    }

}
