//
//  UIApplicationExtensions.swift
//  Baby Sync
//
//  Created by Elliott Richerson on 9/30/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import UIKit

extension UIApplication {
    public static func inSimulator() -> Bool {
        return TARGET_IPHONE_SIMULATOR == 1
    }
}