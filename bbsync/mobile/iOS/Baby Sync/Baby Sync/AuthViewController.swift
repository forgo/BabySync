//
//  AuthViewController.swift
//  Baby Sync
//
//  Created by Elliott Richerson on 10/27/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import UIKit

class AuthViewController: UIViewController, AuthUIDelegate, UITextFieldDelegate {

    var currentTextFieldOffset: CGFloat = 0.0
    
    @IBOutlet weak var labelLogo: UILabel!
    
    @IBOutlet weak var buttonLoginGoogle: UIButton!
    @IBOutlet weak var buttonLoginFacebook: UIButton!
    
    @IBOutlet weak var textFieldEmail: UITextField!
    @IBOutlet weak var textFieldPassword: UITextField!
    @IBOutlet weak var buttonLoginCustom: UIButton!
    
    @IBOutlet weak var constraintLoginBottomSpace: NSLayoutConstraint!
    
    deinit {
        NSNotificationCenter.defaultCenter().removeObserver(self)
    }
    
    override func viewWillLayoutSubviews() {
        // Re-adjusts views when keyboard is out so that text views still visible
        self.view.layoutIfNeeded()
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Setup Auth Helper
        Auth.sharedInstance.authUIDelegate = self
        Auth.sharedInstance.loginViewController = self
        
        // Listen for keyboard notifications
        NSNotificationCenter.defaultCenter().addObserver(self, selector: "keyboardWillChangeFrameNotification:", name: UIKeyboardWillChangeFrameNotification, object: nil)
        NSNotificationCenter.defaultCenter().addObserver(self, selector: "keyboardWillHideNotification:", name: UIKeyboardWillHideNotification, object: nil)
        
        // Hide Interface Until We Know Logged In
        self.view.hidden = true
        
        // Login Text Field Configuration
        self.textFieldEmail.delegate = self
        self.textFieldPassword.delegate = self
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

    // MARK: Validations
    func emailFieldValid() -> Bool {
        if let email = self.textFieldEmail.text {
            if (email.isValidEmail()) {
                return true
            }
        }
        return false
    }
    
    func passwordFieldValid() -> Bool {
        if let password = self.textFieldPassword.text {
            if (password.isValidPassword()) {
                return true
            }
        }
        return false
    }
    
    func animateInvalid(textField: UITextField) {
        UIView.animateWithDuration(0.4, delay: 0.0, options: UIViewAnimationOptions.CurveEaseIn, animations: { () -> Void in
            textField.layer.backgroundColor = UIColor.redColor().CGColor
            }) { (finished) -> Void in
                UIView.animateWithDuration(0.4, delay: 0.0, options: .CurveEaseOut, animations: { () -> Void in
                    textField.layer.backgroundColor = UIColor.clearColor().CGColor
                    }, completion: nil)
        }
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
            
            // Auto login when returning from password field and basic criteria met.
            let emailValid = self.emailFieldValid()
            let passwordValid = self.passwordFieldValid()
            
            if (!emailValid) {
                self.animateInvalid(self.textFieldEmail)
            }
            
            if(!passwordValid) {
                self.animateInvalid(self.textFieldPassword)
            }
            
            if(emailValid && passwordValid) {
                if(Auth.sharedInstance.custom.isLoggedIn()) {
                    print("Pressed Custom login button but already logged in.")
                    self.performSegueWithIdentifier("SegueLoginToHome", sender: self)
                }
                else {
                    Auth.sharedInstance.login(.Custom)
                }
            }
        }
    }
    
    // MARK: - Navigation
    
    // Segues
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        if (segue.identifier == "SegueLoginToHome") {
//            let homeVC: HomeViewController = segue.destinationViewController as! HomeViewController
            //homeVC.isTest = self.switchBypass.on
        }
    }
    
    @IBAction func prepareForUnwindToLogin(segue: UIStoryboardSegue) {
        // Clear user data and log off if unwinded here
        Auth.sharedInstance.logout()
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
    func textFieldShouldBeginEditing(textField: UITextField) -> Bool {
        print("shoudlbeginediting")
        let originInSuperView: CGPoint = self.view.convertPoint(CGPointZero, fromView: textField)
        self.currentTextFieldOffset = self.view.frame.height - originInSuperView.y - textField.frame.size.height - 4
        return true
    }
    
    func textFieldShouldReturn(textField: UITextField) -> Bool {
        self.view.endEditing(true)
        if(textField == self.textFieldPassword) {
            self.pressedLoginButton(self.buttonLoginCustom)
        }

        return false;
    }
    
    // MARK: - Notification Observers
    func animateKeyboardWithKeyboardNotification(notification: NSNotification, isHiding: Bool) {
        if let userInfo = notification.userInfo {
            let endFrame = (userInfo[UIKeyboardFrameEndUserInfoKey] as? NSValue)?.CGRectValue()
            let duration:NSTimeInterval = (userInfo[UIKeyboardAnimationDurationUserInfoKey] as? NSNumber)?.doubleValue ?? 0
            let animationCurveRawNSN = userInfo[UIKeyboardAnimationCurveUserInfoKey] as? NSNumber
            let animationCurveRaw = animationCurveRawNSN?.unsignedLongValue ?? UIViewAnimationOptions.CurveEaseInOut.rawValue
            let animationCurve:UIViewAnimationOptions = UIViewAnimationOptions(rawValue: animationCurveRaw)
            
            
            if(isHiding) {
                // Return Bottom Constraint to Original Value
                self.view.frame = CGRectMake(0.0, 0.0, self.view.frame.width, self.view.frame.height)
            }
            else {
                // Bottom Constraint Adjusted to Account for Keyboard
                let keyboardHeightOffset = endFrame?.size.height ?? 0.0
                let animationDistance = keyboardHeightOffset - self.currentTextFieldOffset
                self.view.frame = CGRectMake(0.0, -animationDistance, self.view.frame.width, self.view.frame.height)
            }
            
            UIView.animateWithDuration(duration,
                delay: NSTimeInterval(0),
                options: animationCurve,
                animations: { self.view.layoutIfNeeded() },
                completion: nil)
        }
    }
    
    func keyboardWillChangeFrameNotification(notification: NSNotification) {
        self.animateKeyboardWithKeyboardNotification(notification, isHiding: false)
    }
    
    func keyboardWillHideNotification(notification: NSNotification) {
        self.animateKeyboardWithKeyboardNotification(notification, isHiding: true)
    }
}
