//
//  AuthLoginButton.swift
//  Baby Sync
//
//  Created by Elliott Richerson on 10/30/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import UIKit

@IBDesignable
class AuthLoginButton: UIButton {

    override func drawRect(rect: CGRect) {
        // Drawing code
        self.layer.cornerRadius = 16.0
        self.layer.masksToBounds = true
    }
    
}
