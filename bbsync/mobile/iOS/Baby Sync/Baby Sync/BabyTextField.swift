//
//  BabyTextField.swift
//  Baby Sync
//
//  Created by Elliott Richerson on 11/8/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import UIKit

@IBDesignable
class BabyTextField: UITextField {
    
    var isInterfaceBuilder: Bool = false
    
    @IBInspectable var insetTop: CGFloat = 0
    @IBInspectable var insetLeft: CGFloat = 0
    @IBInspectable var insetBottom: CGFloat = 0
    @IBInspectable var insetRight: CGFloat = 0
    @IBInspectable var underlineThickness: CGFloat = 1.0
    @IBInspectable var underlineColor: UIColor = UIColor.whiteColor()
    
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
    }
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        // Initialization code
        self.setup()
    }
    
    func setup() {
        self.contentVerticalAlignment = .Bottom
        
        self.attributedText = self.formatString(self.text, withColor: UIColor.whiteColor())
        
        let placeholderColor: UIColor = UIColor(red:0.75, green:0.86, blue:0.91, alpha:1.0)
        self.attributedPlaceholder = self.formatString(self.placeholder, withColor: placeholderColor)
    }
    
    func formatString(plainString: String?, withColor: UIColor) -> NSAttributedString {
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
    
    override func textRectForBounds(bounds: CGRect) -> CGRect {
        let deltaX: CGFloat = self.insetLeft + self.insetRight
        let deltaY: CGFloat = self.insetTop + self.insetBottom
        let textRect: CGRect = CGRectMake(bounds.origin.x + self.insetLeft, bounds.origin.y + self.insetTop, bounds.size.width - deltaX, bounds.size.height - deltaY)
        return textRect
    }
    
    override func editingRectForBounds(bounds: CGRect) -> CGRect {
        return textRectForBounds(bounds)
    }
    
    override func drawRect(rect: CGRect) {
        // Underline to indicate text field
        let context = UIGraphicsGetCurrentContext()
        let underlineBounds: CGRect = CGRectMake(0, self.frame.height - self.underlineThickness, self.frame.width, self.underlineThickness)
        CGContextSaveGState(context)
        CGContextSetFillColorWithColor(context, self.underlineColor.CGColor)
        CGContextFillRect(context, underlineBounds)
        CGContextRestoreGState(context)
        
        if (!self.isInterfaceBuilder) {
            // Code for runtime
            self.setup()
        }
    }
}
