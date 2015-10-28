//
//  AuthMethod.swift
//  SignInBase
//
//  Created by Elliott Richerson on 10/25/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import UIKit

// MARK: - AuthAMethod
protocol AuthMethod {
    
    // Each auth method should be able to determine their logged-in state
    func isLoggedIn() -> Bool
    
    // Each auth method should have a way to initiate login
    func login()
    
    // Each auth method should have a way to logout
    func logout()
    
}
