//
//  AuthLoginWithButton.swift
//  Baby Sync
//
//  Created by Elliott Richerson on 10/29/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import UIKit

@IBDesignable
class AuthLoginWithButton: UIButton {

    @IBInspectable var emblem: UIImage = UIImage()
    @IBInspectable var emblemMargin: CGFloat = 0.0
    @IBInspectable var emblemWidth: CGFloat = 56
    @IBInspectable var emblemHeight: CGFloat = 56
    @IBInspectable var emblemFrame: CGRect = CGRectMake(0, 0, 56, 56)
    
    override func drawRect(rect: CGRect) {
        // Drawing code
        
        self.emblemFrame = CGRectMake(self.emblemMargin, self.emblemMargin, self.emblemWidth, self.emblemHeight)
        self.titleEdgeInsets = UIEdgeInsetsMake(self.emblemMargin, self.emblemWidth+self.emblemMargin, self.emblemMargin, self.emblemMargin)

        self.layer.cornerRadius = 16.0
        self.layer.masksToBounds = true
        
        self.emblem.drawInRect(self.emblemFrame)
        
    }


}
