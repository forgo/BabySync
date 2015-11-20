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
        static let ParseUnknown = Error(code: 9998, message: "Critical unknown.")
        static let ParseGeneric = Error(code: 9997, message: "Generic unknown.")
        static let ParseServiceUnavailable = Error(code: 9998, message: "Service is unavailable.")
        static let ParseLoginToken = Error(code: 9998, message: "Client failed to parse BabySync login token.")
        static let ParseLoginEmail = Error(code: 9997, message: "Client failed to parse BabySync login email.")
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
    func didCreate(family: Family)
    func didJoin(family: Family)
    func didMerge(family: Family)
    func didRetrieve(family: Family)
    func didEncounter(errors: [Error])
}

// MARK: - BabySync Service
class BabySync {
    
    var delegateLoginCustom: AuthCustomDelegate?
    var delegateLoginGoogle: AuthGoogleDelegate?
    var delegateLoginFacebook: AuthFacebookDelegate?
    var delegate: BabySyncDelegate?
    
    // MARK: - JWT to use for authenticated requests
    // TODO: store the encrypted or some other way?
    private var jwt: String?
    private var email: String?
    
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
    
    private func parseLogin(method: AuthMethodType, jsonData: JSON) -> Bool {
        guard let token: String = jsonData["token"].stringValue else {
            self.handleLogin(method, errors: [BabySyncErrors.Client.ParseLoginToken])
            return false
        }
        guard let email: String = jsonData["email"].stringValue else {
            self.handleLogin(method, errors: [BabySyncErrors.Client.ParseLoginEmail])
            return false
        }
        self.jwt = token
        self.email = email
        return true
    }
    
    private func parseFamily(jsonData: JSON) -> Bool {
        guard let family: Family = Family(family: jsonData["family"]) else {
            self.handle([BabySyncErrors.Client.ParseFamily])
            return false
        }
        guard let parents: [Parent] = self.parentsFrom(jsonData) else {
            self.handle([BabySyncErrors.Client.ParseParents])
            return false
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
        
        if(response.result.isSuccess) {

            if let res = response.result.value {
                let json: JSON = JSON(res)
                jsonData = json["data"]
                jsonErrors = json["errors"]
            }
            else {
                jsonErrors = JSON([self.jsonError(BabySyncErrors.Client.Parse)])
            }
        }
        else {
            if let error = response.result.error {
                if(error.code == NSURLErrorCannotConnectToHost) {
                    jsonErrors = JSON([self.jsonError(BabySyncErrors.Client.ParseServiceUnavailable)])
                }
                else {
                    jsonErrors = JSON([self.jsonError(BabySyncErrors.Client.ParseGeneric)])
                }
            }
            else {
                jsonErrors = JSON([self.jsonError(BabySyncErrors.Client.ParseUnknown)])
            }
        }
        return (jsonData, jsonErrors)
    }
    
    // Parse the high level response from static test JSON file
    private func parseTest(jsonTest: JSON) -> (JSON, JSON) {
        var jsonTestData: JSON = nil
        var jsonTestErrors: JSON = nil
        jsonTestData = jsonTest["data"]
        jsonTestErrors = jsonTest["errors"]
        return (jsonTestData, jsonTestErrors)
    }
    
    // For errors encountered, delegate out to whom it may concern
    private func handle(errors: [Error]) {
        self.delegate?.didEncounter(errors)
    }
    
    // For errors encountered during login, delegate out to appropriate auth method
    private func handleLogin(method: AuthMethodType, errors: [Error]) {
        switch method {
        case .Google:
            self.delegateLoginGoogle?.didEncounterLogin(errors)
        case .Facebook:
            self.delegateLoginFacebook?.didEncounterLogin(errors)
        case .Custom:
            self.delegateLoginCustom?.didEncounterLogin(errors)
        }
    }
    
    // MARK: - Primary Service Operations
    func login(method: AuthMethodType, email: String? = nil, password: String? = nil, accessToken: String? = nil) {
        
        var loginParams: [String : AnyObject]?
        
        switch method {
        case .Google:
            print("About to login to BabySync using Google token...")
            guard let token = accessToken, e = email else {
                print("Aborting Google oAuth due to lack of accessToken or email")
                return
            }
            loginParams = ["authMethod":AuthMethodType.Google.rawValue,"accessToken":token,"email":e]
        case .Facebook:
            print("About to login to BabySync using Facebook token...")
            guard let token = accessToken, e = email else {
                print("Aborting Facebook oAuth due to lack of accessToken or email")
                return
            }
            loginParams = ["authMethod":AuthMethodType.Facebook.rawValue,"accessToken":token,"email":e]
        case .Custom:
            print("About to login to BabySync using Custom credentials...")
            guard let e = email, p = password else {
                print("Aborting Custom login due to lack of credentials")
                return
            }
            loginParams = ["authMethod":AuthMethodType.Custom.rawValue,"email":e,"password":p]
        }
        
        let endpointLogin = "user/auth"
        
        Alamofire.request(.POST, BabySyncConstant.baseURL+endpointLogin, parameters: loginParams).responseJSON { response in
            
            let (jsonData, jsonErrors) = self.parse(response)
            if (jsonErrors != nil) {
                self.handleLogin(method, errors: self.errors(jsonErrors))
                return
            }
            
            if (self.parseLogin(method, jsonData: jsonData)) {
                
                if let j = self.jwt, e = self.email {
                    switch method {
                    case .Google:
                        self.delegateLoginGoogle?.didLogin(j, email: e)
                    case .Facebook:
                        self.delegateLoginFacebook?.didLogin(j, email: e)
                    case .Custom:
                        self.delegateLoginCustom?.didLogin(j, email: e)
                    }
                }
                else {
                    let errorRef = AuthConstant.Error.Client.BadEmailOrPassword.self
                    let error: Error = Error(code: errorRef.code, message: errorRef.message)
                    switch method {
                    case .Google:
                        self.delegateLoginGoogle?.didEncounterLogin([error])
                    case .Facebook:
                        self.delegateLoginFacebook?.didEncounterLogin([error])
                    case .Custom:
                        self.delegateLoginCustom?.didEncounterLogin([error])
                    }
                }
            }
        }
    }
    
    
    func findFamily(parentEmail: String) {
        let endpointFindFamily = "family/find/" + parentEmail
        Alamofire.request(.GET, BabySyncConstant.baseURL+endpointFindFamily).responseJSON { response in
            let (jsonData, jsonErrors) = self.parse(response)
            if (jsonErrors != nil) {
                self.handle(self.errors(jsonErrors))
                return
            }
            else {
                // If the data came back empty, then we don't have a family yet, handle appropriately
                if(jsonData.isEmpty) {
                    
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
    }
    
    func createFamily(parentEmail: String) {
        
        let dummy: Bool = true
        if (dummy) {
            let jsonTest = JSON.fromFile("GETFamily_New")
            let (jsonTestData, jsonTestErrors) = self.parseTest(jsonTest)
            if (jsonTestErrors != nil) {
                self.handle(self.errors(jsonTestErrors))
                return
            }
            if (self.parseFamily(jsonTestData)) {
                self.delegate?.didCreate(self.family)
                return
            }
        }
        
        
        
        let endpointCreateFamily = "family/"
        Alamofire.request(.POST, BabySyncConstant.baseURL+endpointCreateFamily, parameters: ["email":parentEmail]).responseJSON { response in
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
        let endpointJoinFamily = "family/join/" + String(familyID)
        Alamofire.request(.PUT, BabySyncConstant.baseURL+endpointJoinFamily, parameters: ["email":parentEmail]).responseJSON { response in
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
        let endpointMergeFamily = "family/merge/" + String(familyID)
        Alamofire.request(.PUT, BabySyncConstant.baseURL+endpointMergeFamily, parameters: ["email":parentEmail]).responseJSON { response in
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
        let endpointDetachFamily = "family/detach"
        Alamofire.request(.PUT, BabySyncConstant.baseURL+endpointDetachFamily, parameters: ["email":parentEmail]).responseJSON { response in
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
    
    // MARK: - Helper Methods
    static func nsErrorFrom(error: Error) -> NSError? {
        var nsError: NSError?
        if let domain = AuthConstant.Error.Domain {
            let errorInfo: [NSObject : AnyObject]? = ["message": error.message]
            nsError = NSError(domain: domain, code: error.code, userInfo: errorInfo)
        }
        return nsError
    }
    
    static func babyByID(babyID: Int) -> Baby? {
        let babies: [Baby] = BabySync.service.babies.filter {$0.id == babyID}
        if (babies.count == 1) {
            return babies[0]
        }
        return nil
    }
    
    static func timersForBabyID(babyID: Int) -> [Timer] {
        if let baby = BabySync.babyByID(babyID) {
            var timers: [Timer] = baby.timers
            // always get timers in id sorted order
            timers.sortInPlace { return $0.id < $1.id }
            return timers
        }
        return []
    }
    
    static func activityForTimer(timer: Timer) -> Activity? {
        let activities: [Activity] = BabySync.service.activities.filter {$0.id == timer.activityID}
        if (activities.count == 1) {
            return activities[0]
        }
        return nil
    }
}