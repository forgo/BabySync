//
//  AuthAppMethod.swift
//  SignInBase
//
//  Created by Elliott Richerson on 10/25/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import UIKit

// MARK: - AuthAppMethod
protocol AuthAppMethod {
    
    // Configuration to be called in app's didFinishLaunchingWithOptions
    func configure(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [AnyHashable: Any]?) -> Bool
    
    // Each auth app method should validate URLs sent to the app
    // true if valid URL for implementing auth method,
    // false if invalid URL
    func openURL(_ application: UIApplication, openURL url: URL, sourceApplication: String?, annotation: AnyObject) -> Bool
    
}
