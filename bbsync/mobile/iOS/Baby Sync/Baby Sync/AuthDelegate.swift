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
    func loginSuccess(method: AuthMethodType, user: AuthUser)
    func loginCancel(method: AuthMethodType)
    func loginError(method: AuthMethodType, error: NSError?)
    
    func didLogout(method: AuthMethodType)
    func didFailToLogout(method: AuthMethodType, error: NSError?)
}