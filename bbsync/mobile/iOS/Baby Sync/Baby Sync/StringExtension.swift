//
//  StringExtension.swift
//  Baby Sync
//
//  Created by Elliott Richerson on 10/30/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import Foundation

extension String {
    func isValidEmail() -> Bool {
        do {
            let emailPattern = "^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?.)+(?:[A-Z]{2}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum)*$"
            let regex = try NSRegularExpression(pattern: emailPattern, options: NSRegularExpression.Options.caseInsensitive)
            return regex.firstMatch(in: self, options: .reportCompletion, range: NSMakeRange(0, self.characters.count)) != nil
        }
        catch {
            return false
        }
    }
    
    func isValidPassword() -> Bool {
        do {
            let passwordPattern = "^(?=[^\\d_].*?\\d)\\w(\\w|[!@#$%]){7,20}$"
            let regex = try NSRegularExpression(pattern: passwordPattern, options: NSRegularExpression.Options.caseInsensitive)
            return regex.firstMatch(in: self, options: .reportCompletion, range: NSMakeRange(0, self.characters.count)) != nil
        }
        catch {
            return false
        }
    }
    
}
