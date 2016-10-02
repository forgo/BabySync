//
//  AuthLoginTextField.swift
//  Baby Sync
//
//  Created by Elliott Richerson on 10/30/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import UIKit

@IBDesignable
class AuthLoginTextField: UITextField {
    
    var isInterfaceBuilder: Bool = false
    
    @IBInspectable var insetTop: CGFloat = 0
    @IBInspectable var insetLeft: CGFloat = 0
    @IBInspectable var insetBottom: CGFloat = 0
    @IBInspectable var insetRight: CGFloat = 0
    @IBInspectable var underlineThickness: CGFloat = 1.0
    @IBInspectable var underlineColor: UIColor = UIColor.white
    
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
    }
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        // Initialization code
        self.setup()
    }
    
    func setup() {
        self.contentVerticalAlignment = .bottom
        
        self.attributedText = self.formatString(self.text, withColor: UIColor.white)
        
        let placeholderColor: UIColor = UIColor(red:0.75, green:0.86, blue:0.91, alpha:1.0)
        self.attributedPlaceholder = self.formatString(self.placeholder, withColor: placeholderColor)
    }
    
    func formatString(_ plainString: String?, withColor: UIColor) -> NSAttributedString {
        var plainText = ""
        if let fieldText = plainString {
            plainText = fieldText
        }
        let fullRange: NSRange = NSMakeRange(0, plainText.characters.count)
        let font: UIFont = UIFont(name: "ADAM.CGPRO", size: 16)!
        let attString = NSMutableAttributedString(string: plainText)
        attString.addAttribute(NSFontAttributeName, value: font, range: fullRange)
        attString.addAttribute(NSForegroundColorAttributeName, value: withColor, range: fullRange)
        return attString
    }
    
    override func prepareForInterfaceBuilder() {
        self.isInterfaceBuilder = true
    }
    
    override func textRect(forBounds bounds: CGRect) -> CGRect {
        let deltaX: CGFloat = self.insetLeft + self.insetRight
        let deltaY: CGFloat = self.insetTop + self.insetBottom
        let textRect: CGRect = CGRect(x: bounds.origin.x + self.insetLeft, y: bounds.origin.y + self.insetTop, width: bounds.size.width - deltaX, height: bounds.size.height - deltaY)
        return textRect
    }
    
    override func editingRect(forBounds bounds: CGRect) -> CGRect {
        return textRect(forBounds: bounds)
    }
    
    override func draw(_ rect: CGRect) {
        // Underline to indicate text field
        let context = UIGraphicsGetCurrentContext()
        let underlineBounds: CGRect = CGRect(x: 0, y: self.frame.height - self.underlineThickness, width: self.frame.width, height: self.underlineThickness)
        context?.saveGState()
        context?.setFillColor(self.underlineColor.cgColor)
        context?.fill(underlineBounds)
        context?.restoreGState()
        
        if (!self.isInterfaceBuilder) {
            // Code for runtime
            self.setup()
        }
    }
}
