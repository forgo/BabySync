//
//  ISO8601DateFormatter.swift
//  Baby Sync
//
//  Created by Elliott Richerson on 9/29/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import Foundation

class ISO8601DateFormatter : NSDateFormatter {
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
    }
    override init() {
        super.init()
        self.locale = NSLocale(localeIdentifier: "en_US_POSIX")
        self.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSZZZZZ"
    }
    static let sharedInstance = ISO8601DateFormatter()
}