//
//  ElapsedTimeFormatter.swift
//  Baby Sync
//
//  Created by Elliott Richerson on 9/30/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import UIKit

class ElapsedTimeFormatter : NSDateComponentsFormatter {
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
    }
    override init() {
        super.init()
        self.zeroFormattingBehavior = NSDateComponentsFormatterZeroFormattingBehavior.Pad
        self.allowedUnits = [.Day, .Hour, .Minute, .Second]
    }
    func attributedString(sinceDate: NSDate) -> NSMutableAttributedString {
        let elapsedSeconds: NSTimeInterval = NSDate().timeIntervalSinceDate(sinceDate)
        let elapsedFormatted: String = ElapsedTimeFormatter.sharedInstance.stringFromTimeInterval(elapsedSeconds)!
        let elapsedAttributed: NSMutableAttributedString = NSMutableAttributedString(string: elapsedFormatted)
        // Kern the string (squish the letters closer together)
        elapsedAttributed.addAttribute(NSKernAttributeName, value: CGFloat(-5.0), range: NSRange(location: 0, length: elapsedFormatted.characters.count))
        return elapsedAttributed
    }
    static let sharedInstance = ElapsedTimeFormatter()
}