//
//  ErrorAPI.swift
//  Baby Sync
//
//  Created by Elliott Richerson on 10/13/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import Foundation

struct ErrorAPI {
    var code: Int = 0
    var message: String = ""
    
    init() {
        self.code = 0
        self.message = ""
    }
    
    init(code: Int, message: String) {
        self.code = code
        self.message = message
    }
    
    init(error: JSON) {
        self.code = error["code"].intValue
        self.message = error["message"].stringValue
    }
    
    init(error: ErrorAPI) {
        self.code = error.code
        self.message = error.message
    }
}
