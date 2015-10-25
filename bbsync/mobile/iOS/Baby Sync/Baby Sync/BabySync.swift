//
//  BabySync.swift
//  Baby Sync
//
//  Created by Elliott Richerson on 10/13/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import Alamofire
import SwiftyJSON
import Foundation

// MARK: - BabySyncError Struct
struct BabySyncErrors {
    struct Client {
        static let Parse = Error(code: 9999, message: "Client failed to parse response data.")
        static let ParseFamily = Error(code: 9998, message: "Client received unexpected Family data.")
        static let ParseParent = Error(code: 9997, message: "Client received unexpected Parent data.")
        static let ParseParents = Error(code: 9996, message: "Client received unexpected [Parent] data.")
        static let ParseActivities = Error(code: 9995, message: "Client received unexpected [Activity] data.")
        static let ParseBabies = Error(code: 9994, message: "Client received unexpected [Baby] data.")
    }
}

// MARK: - BabySyncDelegate Protocol
protocol BabySyncDelegate {
    func didFind(parent: Parent)
    func didLogin(parent: Parent);
    func didCreate(family: Family)
    func didJoin(family: Family)
    func didMerge(family: Family)
    func didRetrieve(family: Family)
    func didEncounter(error: Error)
}

// MARK: - BabySync Service
class BabySync {
    
    var delegate: BabySyncDelegate?
    
    // Conditionally set host in DEBUG mode
    #if DEBUG
        let baseURL: String = "http://localhost:8111/api/v1/"
    #else
        let baseURL: String = "http://beyondaphelion/babysync/api/v1/"
    #endif
    
    // MARK: - Synced data arrays!
    var family: Family = Family()
    var parents: [Parent] = []
    var activities: [Activity] = []
    var babies: [Baby] = []
    
    // MARK: - Conveneience Methods
    private func clearData() {
        self.family = Family()
        self.parents.removeAll()
        self.activities.removeAll()
        self.babies.removeAll()
    }
    
    // MARK: - Parsing and error handling
    
    // Convert Error object to JSON dictionary
    private func jsonError(error: Error) -> JSON {
        return JSON(["code":error.code, "message": error.message])
    }
    
    // Convert errors from JSON response to array of Error objects
    private func errors(jsonErrors: JSON) -> [Error] {
        var errors: [Error] = []
        for jsonError in jsonErrors.arrayValue {
            errors.append(Error(code: jsonError["code"].intValue, message: jsonError["message"].stringValue))
        }
        return errors
    }
    
    private func parseFamily(jsonData: JSON) -> Bool {
        guard let family: Family = Family(family: jsonData["family"]) else {
            self.handle([BabySyncErrors.Client.ParseFamily])
            return false;
        }
        guard let parents: [Parent] = self.parentsFrom(jsonData) else {
            self.handle([BabySyncErrors.Client.ParseParents])
            return false;
        }
        guard let activities: [Activity] = self.activitiesFrom(jsonData) else {
            self.handle([BabySyncErrors.Client.ParseActivities])
            return false
        }
        guard let babies: [Baby] = self.babiesFrom(jsonData) else {
            self.handle([BabySyncErrors.Client.ParseBabies])
            return false
        }
        
        // Passed all checks, reset data and delegate the good news!
        self.clearData()
        self.family = family
        self.parents = parents
        self.activities = activities
        self.babies = babies
        
        return true;
    }
    
    // Parse the high level response from the HTTP request
    private func parse(response: Response<AnyObject, NSError>) -> (JSON, JSON) {
        var jsonData: JSON = nil
        var jsonErrors: JSON = nil
        if let res = response.result.value {
            let json: JSON = JSON(res)
            jsonData = json["data"]
            jsonErrors = json["errors"]
        }
        else {
            jsonErrors = JSON([self.jsonError(BabySyncErrors.Client.Parse)])
        }
        return (jsonData, jsonErrors)
    }
    
    // For every error encountered, delegate out to whom it may concern
    private func handle(errors: [Error]) {
        for error in errors {
            self.delegate?.didEncounter(error)
        }
    }
    
    // MARK: - Primary Service Operations
    func findParent(parentEmail: String) {
        let endpointFindParent = "parent/" + parentEmail
        Alamofire.request(.GET, baseURL+endpointFindParent).responseJSON { response in
            let (jsonData, jsonErrors) = self.parse(response)
            if (jsonErrors != nil) {
                self.handle(self.errors(jsonErrors))
                return
            }
            else {
                guard let parent: Parent = Parent(parent: jsonData) else {
                    self.handle([BabySyncErrors.Client.ParseParent])
                    return
                }
                self.delegate?.didFind(parent)
            }
        }
    }
    
    func loginParent(parentEmail: String, loginType: UserLoginType) {
        let endpointLoginParent = "parent/auth"
        let loginTypeString: String = loginType.rawValue
        var token: String = ""
        switch loginType {
        case .Facebook:
            token = UserData.sharedInstance.facebookToken
        case .Google:
            token = UserData.sharedInstance.googleToken
        case .BabySync:
            token = ""
        }
        Alamofire.request(.POST, baseURL+endpointLoginParent, parameters: ["username":parentEmail,"password":"","loginType":loginTypeString,"token":token]).responseJSON { response in
            let (jsonData, jsonErrors) = self.parse(response)
            if (jsonErrors != nil) {
                self.handle(self.errors(jsonErrors))
                return
            }
            if (self.parseFamily(jsonData)) {
                self.delegate?.didCreate(self.family)
            }
        }
    }
    
    func createFamily(parentEmail: String) {
        let endpointCreateFamily = "parent/"
        Alamofire.request(.POST, baseURL+endpointCreateFamily, parameters: ["email":parentEmail]).responseJSON { response in
            let (jsonData, jsonErrors) = self.parse(response)
            if (jsonErrors != nil) {
                self.handle(self.errors(jsonErrors))
                return
            }
            if (self.parseFamily(jsonData)) {
                self.delegate?.didCreate(self.family)
            }
        }
    }
    
    func joinFamily(familyID: Int, parentEmail: String) {
        let endpointJoinFamily = "parent/join/" + String(familyID)
        Alamofire.request(.PUT, baseURL+endpointJoinFamily, parameters: ["email":parentEmail]).responseJSON { response in
            let (jsonData, jsonErrors) = self.parse(response)
            if (jsonErrors != nil) {
                self.handle(self.errors(jsonErrors))
                return
            }
            if (self.parseFamily(jsonData)) {
                self.delegate?.didJoin(self.family)
            }
        }
    }
    
    func mergeFamily(familyID: Int, parentEmail: String) {
        let endpointMergeFamily = "parent/merge/" + String(familyID)
        Alamofire.request(.PUT, baseURL+endpointMergeFamily, parameters: ["email":parentEmail]).responseJSON { response in
            let (jsonData, jsonErrors) = self.parse(response)
            if (jsonErrors != nil) {
                self.handle(self.errors(jsonErrors))
                return
            }
            if (self.parseFamily(jsonData)) {
                self.delegate?.didMerge(self.family);
            }
        }
    }
    
    func detachFamily(familyID: Int, parentEmail: String) {
        let endpointDetachFamily = "parent/detach"
        Alamofire.request(.PUT, baseURL+endpointDetachFamily, parameters: ["email":parentEmail]).responseJSON { response in
            let (jsonData, jsonErrors) = self.parse(response)
            if (jsonErrors != nil) {
                self.handle(self.errors(jsonErrors))
                return
            }
            if (self.parseFamily(jsonData)) {
                self.delegate?.didCreate(self.family)
            }
        }
    }
    
    // MARK: - Populate and sort data arrays
    private func parentsFrom(jsonData: JSON) -> [Parent] {
        var parents: [Parent] = []
        for jsonParent in jsonData["parents"].arrayValue {
            parents.append(Parent(parent: jsonParent))
        }
        parents.sortInPlace {
            return $0.id < $1.id
        }
        return parents
    }
    
    private func activitiesFrom(jsonData: JSON) -> [Activity] {
        var activities: [Activity] = []
        for jsonActivity in jsonData["activities"].arrayValue {
            activities.append(Activity(activity: jsonActivity))
        }
        activities.sortInPlace {
            return $0.id < $1.id
        }
        return activities
    }
    
    private func babiesFrom(jsonData: JSON) -> [Baby] {
        var babies: [Baby] = []
        for jsonBaby in jsonData["babies"].arrayValue {
            babies.append(Baby(baby: jsonBaby))
        }
        babies.sortInPlace {
            return $0.id < $1.id
        }
        return babies
    }
    
    static let service = BabySync()
}