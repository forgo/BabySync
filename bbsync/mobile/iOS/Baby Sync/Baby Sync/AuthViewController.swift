//
//  AuthViewController.swift
//  Baby Sync
//
//  Created by Elliott Richerson on 10/27/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import UIKit

class AuthViewController: UIViewController, AuthUIDelegate, UITextFieldDelegate, UIPopoverPresentationControllerDelegate, AuthErrorViewDelegate {

    var isFirstLoginAppearance: Bool = true
    var currentTextFieldOffset: CGFloat = 0.0
    
    @IBOutlet weak var labelLogo: UILabel!
    
    @IBOutlet weak var buttonLoginGoogle: UIButton!
    @IBOutlet weak var buttonLoginFacebook: UIButton!
    
    @IBOutlet weak var textFieldEmail: UITextField!
    @IBOutlet weak var textFieldPassword: UITextField!
    @IBOutlet weak var buttonLoginCustom: UIButton!
    
    @IBOutlet weak var constraintLoginBottomSpace: NSLayoutConstraint!
    
    deinit {
        NotificationCenter.default.removeObserver(self)
    }
    
    override func viewWillLayoutSubviews() {
        // Re-adjusts views when keyboard is out so that text views still visible
        self.view.layoutIfNeeded()
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // For view did load, let's reset the first login apperance
        // Typically, this should only happen once (default init value = true)
        self.isFirstLoginAppearance = true
        
        // Setup Auth Helper
        Auth.sharedInstance.authUIDelegate = self
        Auth.sharedInstance.loginViewController = self
        
        // Listen for keyboard notifications
        NotificationCenter.default.addObserver(self, selector: #selector(AuthViewController.keyboardWillChangeFrameNotification(_:)), name: NSNotification.Name.UIKeyboardWillChangeFrame, object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(AuthViewController.keyboardWillHideNotification(_:)), name: NSNotification.Name.UIKeyboardWillHide, object: nil)
        
        // Hide Interface Until We Know Logged In
        self.view.isHidden = true
        
        // Login Text Field Configuration
        self.textFieldEmail.delegate = self
        self.textFieldPassword.delegate = self
    }
    
    override func viewDidAppear(_ animated: Bool) {
        // Skip Login If Already Logged In
        // and this is our first login screen appearance.
        // This avoids auto-navigation after things like error
        // popover dismissal which recalls viewDidAppear here
        if(Auth.sharedInstance.isLoggedIn() && self.isFirstLoginAppearance) {
            self.performSegue(withIdentifier: "SegueLoginToHome", sender: self)
        }
        else {
            self.view.isHidden = false
        }
        
        // We appeared once, so we can't be first again!
        if(self.isFirstLoginAppearance) {
            self.isFirstLoginAppearance = false
        }
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    override var preferredStatusBarStyle : UIStatusBarStyle {
        return UIStatusBarStyle.lightContent
    }

    // MARK: Validations
    func emailFieldValid() -> String? {
        if let email = self.textFieldEmail.text {
            if (email.isValidEmail()) {
                return email
            }
        }
        return nil
    }
    
    func passwordFieldValid() -> String? {
        if let password = self.textFieldPassword.text {
            if (password.isValidPassword()) {
                return password
            }
        }
        return nil
    }
    
    func animateInvalid(_ textField: UITextField) {
        UIView.animate(withDuration: 0.4, delay: 0.0, options: UIViewAnimationOptions.curveEaseIn, animations: { () -> Void in
            textField.layer.backgroundColor = UIColor.red.cgColor
            }) { (finished) -> Void in
                UIView.animate(withDuration: 0.4, delay: 0.0, options: .curveEaseOut, animations: { () -> Void in
                    textField.layer.backgroundColor = UIColor.clear.cgColor
                    }, completion: nil)
        }
    }

    
    // MARK: User Actions
    
    @IBAction func pressedLoginButton(_ sender: UIButton) {
        if(sender == self.buttonLoginGoogle) {
            if(Auth.sharedInstance.google.isLoggedIn()) {
                print("Pressed Google login button, but Google already logged in.")
                self.performSegue(withIdentifier: "SegueLoginToHome", sender: self)
            }
            else {
                Auth.sharedInstance.login(.Google)
            }
        }
        else if(sender == self.buttonLoginFacebook) {
            if(Auth.sharedInstance.facebook.isLoggedIn()) {
                print("Pressed Facebook login button but Facebook already logged in.")
                self.performSegue(withIdentifier: "SegueLoginToHome", sender: self)
            }
            else {
                Auth.sharedInstance.login(.Facebook)
            }
            
        }
        else if(sender == self.buttonLoginCustom) {
            
            // Auto login when returning from password field and basic criteria met.
            guard let emailValid = self.emailFieldValid() else {
                self.animateInvalid(self.textFieldEmail)
                return
            }
            
            guard let passwordValid = self.passwordFieldValid() else {
                self.animateInvalid(self.textFieldPassword)
                return
            }
            
            if(Auth.sharedInstance.custom.isLoggedIn()) {
                print("Pressed Custom login button but already logged in.")
                self.performSegue(withIdentifier: "SegueLoginToHome", sender: self)
            }
            else {
                Auth.sharedInstance.login(.Custom, email: emailValid, password: passwordValid)
            }
        }
    }
    
    // MARK: - Navigation
    
    // Segues
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        if (segue.identifier == "SegueLoginToHome") {
//            let homeVC: HomeViewController = segue.destinationViewController as! HomeViewController
            //homeVC.isTest = self.switchBypass.on
        }
        else if (segue.identifier == "SegueErrorPopover") {
            let errorPopupVC: AuthErrorViewController = segue.destination as! AuthErrorViewController
            
            // Set the error received in popover
            if let error: NSError = sender as? NSError {
                if let message: String = error.userInfo["message"] as? String {
                    errorPopupVC.message = message
                }
                else {
                    errorPopupVC.message = "Something's not right..."
                }
            }
            else {
                errorPopupVC.message = "Unknown cause."
            }
            
            errorPopupVC.popoverPresentationController!.delegate = self
            errorPopupVC.delegate = self
            errorPopupVC.parentVC = self

        }
    }
    
    @IBAction func prepareForUnwindToLogin(_ segue: UIStoryboardSegue) {
        // Clear user data and log off if unwinded here
        Auth.sharedInstance.logout()
//        self.hideActivity(true)
        if (segue.identifier == "UnwindSegueHomeToLogin") {
            
        }
    }
    
    // MARK: - UIPopoverPresentationControllerDelegate
    func adaptivePresentationStyle(for controller: UIPresentationController) -> UIModalPresentationStyle {
        // This allows the popover to not take over the whole screen
        return UIModalPresentationStyle.none
    }
    
    // MARK: - ErrorViewDelegate
    func didDismiss() {
        print("didDismiss")
    }
    
    // MARK: - AuthUIDelegate
    
    func authUILoginDidSucceed() {
        self.performSegue(withIdentifier: "SegueLoginToHome", sender: self)
    }
    
    func authUILoginDidCancel() {
        print("Login was cancelled")
    }
    
    func authUILoginDidError(_ error: NSError?) {
        print("Login was unsuccessful")
        self.performSegue(withIdentifier: "SegueErrorPopover", sender: error)
    }
    
    // MARK: Touch Interactions
    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        self.view.endEditing(true)
        super.touchesBegan(touches, with: event)
    }
    
    // MARK: - UITextFieldDelegate
    func textFieldShouldBeginEditing(_ textField: UITextField) -> Bool {
        print("shoudlbeginediting")
        let originInSuperView: CGPoint = self.view.convert(CGPoint.zero, from: textField)
        self.currentTextFieldOffset = self.view.frame.height - originInSuperView.y - textField.frame.size.height - 4
        return true
    }
    
    func textFieldShouldReturn(_ textField: UITextField) -> Bool {
        self.view.endEditing(true)
        if(textField == self.textFieldPassword) {
            self.pressedLoginButton(self.buttonLoginCustom)
        }

        return false;
    }
    
    // MARK: - Notification Observers
    func animateKeyboardWithKeyboardNotification(_ notification: Notification, isHiding: Bool) {
        if let userInfo = (notification as NSNotification).userInfo {
            let endFrame = (userInfo[UIKeyboardFrameEndUserInfoKey] as? NSValue)?.cgRectValue
            let duration:TimeInterval = (userInfo[UIKeyboardAnimationDurationUserInfoKey] as? NSNumber)?.doubleValue ?? 0
            let animationCurveRawNSN = userInfo[UIKeyboardAnimationCurveUserInfoKey] as? NSNumber
            let animationCurveRaw = animationCurveRawNSN?.uintValue ?? UIViewAnimationOptions().rawValue
            let animationCurve:UIViewAnimationOptions = UIViewAnimationOptions(rawValue: animationCurveRaw)
            
            
            if(isHiding) {
                // Return Bottom Constraint to Original Value
                self.view.frame = CGRect(x: 0.0, y: 0.0, width: self.view.frame.width, height: self.view.frame.height)
            }
            else {
                // Bottom Constraint Adjusted to Account for Keyboard
                let keyboardHeightOffset = endFrame?.size.height ?? 0.0
                let animationDistance = keyboardHeightOffset - self.currentTextFieldOffset
                self.view.frame = CGRect(x: 0.0, y: -animationDistance, width: self.view.frame.width, height: self.view.frame.height)
            }
            
            UIView.animate(withDuration: duration,
                delay: TimeInterval(0),
                options: animationCurve,
                animations: { self.view.layoutIfNeeded() },
                completion: nil)
        }
    }
    
    func keyboardWillChangeFrameNotification(_ notification: Notification) {
        self.animateKeyboardWithKeyboardNotification(notification, isHiding: false)
    }
    
    func keyboardWillHideNotification(_ notification: Notification) {
        self.animateKeyboardWithKeyboardNotification(notification, isHiding: true)
    }
}
