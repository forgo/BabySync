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
    static func fromFile(_ name:String) -> JSON {
        var json: JSON = nil
        let path: NSString = Bundle.main.path(forResource: name, ofType: "json")! as NSString
        let url: Foundation.URL = Foundation.URL(fileURLWithPath: path as String)
        do {
            let dataRaw: Data = try Data(contentsOf: url, options: NSData.ReadingOptions.mappedIfSafe)
            let dataSerialized: AnyObject = try JSONSerialization.jsonObject(with: dataRaw, options: JSONSerialization.ReadingOptions.mutableContainers) as AnyObject
            json = JSON(dataSerialized)
        }
        catch {
            print("Problems reading JSON file: "+(name as String))
        }
        return json
    }
}
