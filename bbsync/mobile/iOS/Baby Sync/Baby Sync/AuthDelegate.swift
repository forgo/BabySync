//
//  AuthDelegate.swift
//  SignInBase
//
//  Created by Elliott Richerson on 10/25/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import Foundation

// MARK: - AuthDelegate
protocol AuthDelegate {
    func loginSuccess(_ method: AuthMethodType, user: AuthUser, wasAlreadyLoggedIn: Bool)
    func loginCancel(_ method: AuthMethodType)
    func loginError(_ method: AuthMethodType, error: NSError?)
    
    func didLogout(_ method: AuthMethodType)
    func didFailToLogout(_ method: AuthMethodType, error: NSError?)
}
