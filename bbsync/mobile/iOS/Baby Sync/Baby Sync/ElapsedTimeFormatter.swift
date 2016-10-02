//
//  ElapsedTimeFormatter.swift
//  Baby Sync
//
//  Created by Elliott Richerson on 9/30/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import UIKit

class ElapsedTimeFormatter : DateComponentsFormatter {
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
    }
    override init() {
        super.init()
        self.zeroFormattingBehavior = DateComponentsFormatter.ZeroFormattingBehavior.pad
        self.allowedUnits = [.day, .hour, .minute, .second]
    }
    func attributedString(_ sinceDate: Date) -> NSMutableAttributedString {
        let elapsedSeconds: TimeInterval = Date().timeIntervalSince(sinceDate)
        let elapsedFormatted: String = ElapsedTimeFormatter.sharedInstance.string(from: elapsedSeconds)!
        let elapsedAttributed: NSMutableAttributedString = NSMutableAttributedString(string: elapsedFormatted)
        // Kern the string (squish the letters closer together)
        elapsedAttributed.addAttribute(NSKernAttributeName, value: CGFloat(-3.0), range: NSRange(location: 0, length: elapsedFormatted.characters.count))
        return elapsedAttributed
    }
    static let sharedInstance = ElapsedTimeFormatter()
}
