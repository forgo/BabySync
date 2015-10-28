//
//  AuthState.swift
//  SignInBase
//
//  Created by Elliott Richerson on 10/25/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import Foundation

enum AuthState : String {
    case SignedOut = "SignedOut"
    case SignedInFacebook = "SignedInFacebook"
    case SignedInGoogle = "SignedInGoogle"
    case SignedInCustom = "SignedInCustom"
    
    func token() -> String? {
        switch self {
        case .SignedInFacebook:
            // Use Facebook SDK to return access token if exists
            //Auth.sharedInstance.facebook.accessToken
            print("TODO: facebook token")
        case .SignedInGoogle:
            // Use Google SDK to return access token if exists
            //Auth.sharedInstance.google.accessToken
            print("TODO: google token")
        default:
            return nil
        }
        return nil
    }
}