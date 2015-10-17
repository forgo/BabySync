//
//  JSONExtension.swift
//  Baby Sync
//
//  Created by Elliott Richerson on 10/13/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import Foundation
import SwiftyJSON

extension JSON {
    static func fromFile(name:String) -> JSON {
        var json: JSON = nil
        let path: NSString = NSBundle.mainBundle().pathForResource(name, ofType: "json")!
        let url: NSURL = NSURL(fileURLWithPath: path as String)
        do {
            let dataRaw: NSData = try NSData(contentsOfURL: url, options: NSDataReadingOptions.DataReadingMappedIfSafe)
            let dataSerialized: AnyObject = try NSJSONSerialization.JSONObjectWithData(dataRaw, options: NSJSONReadingOptions.MutableContainers)
            json = JSON(dataSerialized)
        }
        catch {
            print("Problems reading JSON file: "+(name as String))
        }
        return json
    }
}