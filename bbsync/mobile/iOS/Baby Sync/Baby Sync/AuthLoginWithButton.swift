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
    
    override func draw(_ rect: CGRect) {
        // Drawing code
        print("drawRect called")
        let emblemDrawHeight = self.frame.size.height - self.emblemMargin * 2.0
        let emblemDrawWidth = emblemDrawHeight * ( self.emblem.size.width / self.emblem.size.height )
        let emblemDrawFrame = CGRect(x: self.emblemMargin, y: self.emblemMargin, width: emblemDrawWidth, height: emblemDrawHeight)
        self.titleEdgeInsets = UIEdgeInsetsMake(self.emblemMargin, emblemDrawWidth+self.emblemMargin, self.emblemMargin, self.emblemMargin)

        self.layer.cornerRadius = 16.0
        self.layer.masksToBounds = true
        
        self.emblem.draw(in: emblemDrawFrame)
        
    }


}
