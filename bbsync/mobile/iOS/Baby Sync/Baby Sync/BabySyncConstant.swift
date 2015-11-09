//
//  BabySyncConstant.swift
//  Baby Sync
//
//  Created by Elliott Richerson on 11/7/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import UIKit

struct BabySyncConstant {

    // Conditionally set host in DEBUG mode
    #if DEBUG
    static let baseURL: String = "http://localhost:8111/api/v1/"
    #else
    static let baseURL: String = "http://beyondaphelion/babysync/api/v1/"
    #endif
    
    struct Color {
        static let Dark = UIColor(red:0.38, green:0.31, blue:0.33, alpha:1.0)
        static let Mid = UIColor(red:0.78, green:0.77, blue:0.75, alpha:1.0)
        static let Light = UIColor.whiteColor()
        static let Primary = UIColor(red:0.64, green:0.74, blue:0.81, alpha:1.0)
        static let Secondary = UIColor(red:0.75, green:0.86, blue:0.91, alpha:1.0)
    }
}