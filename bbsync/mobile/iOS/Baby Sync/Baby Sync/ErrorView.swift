//
//  ErrorView.swift
//  Baby Sync
//
//  Created by Elliott Richerson on 11/8/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import UIKit

@IBDesignable
class ErrorView: UIView {
    
    @IBInspectable var cRadius: CGFloat = 12.0
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        self.setup()
    }
    
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        self.setup()
    }
    
    override func drawRect(rect: CGRect) {
        updateLayerProperties()
    }
    
    func setup() {
        
    }
    
    func updateLayerProperties() {
        self.layer.masksToBounds = true
        self.layer.cornerRadius = self.cRadius
    }
    
}
