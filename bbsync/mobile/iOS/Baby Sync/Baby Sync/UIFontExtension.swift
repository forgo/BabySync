//
//  UIFontExtension.swift
//  Baby Sync
//
//  Created by Elliott Richerson on 10/30/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import UIKit

extension UIFont {
    public static func printInstalledFonts() {
        for fontFamily in UIFont.familyNames {
            let familyName = fontFamily as String
            print("Font Family: \(familyName)");
            for fontName in UIFont.fontNames(forFamilyName: familyName) {
                print("\t- \(fontName)");
            }
            print("\n");
        }
    }
}

