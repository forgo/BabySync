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
        static let Parse = ErrorAPI(code: 9999, message: "Client failed to parse response data.")
        static let ParseUnknown = ErrorAPI(code: 9998, message: "Critical unknown.")
        static let ParseGeneric = ErrorAPI(code: 9997, message: "Generic unknown.")
        static let ParseServiceUnavailable = ErrorAPI(code: 9998, message: "Service is unavailable.")
        static let ParseLoginToken = ErrorAPI(code: 9998, message: "Client failed to parse BabySync login token.")
        static let ParseLoginEmail = ErrorAPI(code: 9997, message: "Client failed to parse BabySync login email.")
        static let ParseFamily = ErrorAPI(code: 9998, message: "Client received unexpected Family data.")
        static let ParseParent = ErrorAPI(code: 9997, message: "Client received unexpected Parent data.")
        static let ParseParents = ErrorAPI(code: 9996, message: "Client received unexpected [Parent] data.")
        static let ParseActivities = ErrorAPI(code: 9995, message: "Client received unexpected [Activity] data.")
        static let ParseBabies = ErrorAPI(code: 9994, message: "Client received unexpected [Baby] data.")
    }
}

// MARK: - BabySyncDelegate Protocol
protocol BabySyncDelegate {
    func didFind(_ family: Family)
    func didCreate(_ family: Family)
    func didJoin(_ family: Family)
    func didMerge(_ family: Family)
    func didRetrieve(_ family: Family)
    func didEncounter(_ errorsAPI: [ErrorAPI])
}

// MARK: - BabySync Service
class BabySync {
    
    var delegateLoginCustom: AuthCustomDelegate?
    var delegateLoginGoogle: AuthGoogleDelegate?
    var delegateLoginFacebook: AuthFacebookDelegate?
    var delegate: BabySyncDelegate?
    
    // MARK: - JWT to use for authenticated requests
    // TODO: store the encrypted or some other way?
    fileprivate var jwt: String?
    fileprivate var email: String?
    
    // MARK: - Synced data arrays!
    var family: Family = Family()!
    var parents: [Parent] = []
    var activities: [Activity] = []
    var babies: [Baby] = []
    
    // MARK: - Conveneience Methods
    fileprivate func clearData() {
        self.family = Family()!
        self.parents.removeAll()
        self.activities.removeAll()
        self.babies.removeAll()
    }
    
    // MARK: - Parsing and error handling
    
    // Convert Error object to JSON dictionary
    fileprivate func jsonError(_ errorAPI: ErrorAPI) -> JSON {
        return JSON(["code":errorAPI.code, "message": errorAPI.message])
    }
    
    // Convert errors from JSON response to array of Error objects
    fileprivate func errors(_ jsonErrors: JSON) -> [ErrorAPI] {
        var errorsAPI: [ErrorAPI] = []
        for jsonError in jsonErrors.arrayValue {
            errorsAPI.append(ErrorAPI(code: jsonError["code"].intValue, message: jsonError["message"].stringValue))
        }
        return errorsAPI
    }
    
    fileprivate func parseLogin(_ method: AuthMethodType, jsonData: JSON) -> Bool {
        guard let token: String = jsonData["token"].string else {
            self.handleLogin(method, errorsAPI: [BabySyncErrors.Client.ParseLoginToken])
            return false
        }
        guard let email: String = jsonData["email"].string else {
            self.handleLogin(method, errorsAPI: [BabySyncErrors.Client.ParseLoginEmail])
            return false
        }
        self.jwt = token
        self.email = email
        return true
    }
    
    fileprivate func parseFamily(_ jsonData: JSON) -> Bool {
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
    //DataResponse<Any>
    fileprivate func parse(response: DataResponse<Any>) -> (JSON, JSON) {
        
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
                let errorCode = (error as NSError).code
                if(errorCode == NSURLErrorCannotConnectToHost) {
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
    fileprivate func parseTest(_ jsonTest: JSON) -> (JSON, JSON) {
        var jsonTestData: JSON = nil
        var jsonTestErrors: JSON = nil
        jsonTestData = jsonTest["data"]
        jsonTestErrors = jsonTest["errors"]
        return (jsonTestData, jsonTestErrors)
    }
    
    // For errors encountered, delegate out to whom it may concern
    fileprivate func handle(_ errorsAPI: [ErrorAPI]) {
        self.delegate?.didEncounter(errorsAPI)
    }
    
    // For errors encountered during login, delegate out to appropriate auth method
    fileprivate func handleLogin(_ method: AuthMethodType, errorsAPI: [ErrorAPI]) {
        switch method {
        case .Google:
            self.delegateLoginGoogle?.didEncounterLogin(errorsAPI)
        case .Facebook:
            self.delegateLoginFacebook?.didEncounterLogin(errorsAPI)
        case .Custom:
            self.delegateLoginCustom?.didEncounterLogin(errorsAPI)
        }
    }
    
    // MARK: - Primary Service Operations
    func login(_ method: AuthMethodType, email: String? = nil, password: String? = nil, accessToken: String? = nil) {
        
        var loginParams: [String : AnyObject]?
        
        switch method {
        case .Google:
            print("About to login to BabySync using Google token...")
            guard let token = accessToken, let e = email else {
                print("Aborting Google oAuth due to lack of accessToken or email")
                return
            }
            loginParams = ["authMethod":AuthMethodType.Google.rawValue as AnyObject,"accessToken":token as AnyObject,"email":e as AnyObject]
        case .Facebook:
            print("About to login to BabySync using Facebook token...")
            guard let token = accessToken, let e = email else {
                print("Aborting Facebook oAuth due to lack of accessToken or email")
                return
            }
            loginParams = ["authMethod":AuthMethodType.Facebook.rawValue as AnyObject,"accessToken":token as AnyObject,"email":e as AnyObject]
        case .Custom:
            print("About to login to BabySync using Custom credentials...")
            guard let e = email, let p = password else {
                print("Aborting Custom login due to lack of credentials")
                return
            }
            loginParams = ["authMethod":AuthMethodType.Custom.rawValue as AnyObject,"email":e as AnyObject,"password":p as AnyObject]
        }
        
        let endpointLogin = "user/auth"
        Alamofire.request(BabySyncConstant.baseURL+endpointLogin, method: .post, parameters: loginParams).responseJSON { response in
//        Alamofire.request(.POST, BabySyncConstant.baseURL+endpointLogin, parameters: loginParams).responseJSON { response in
            
            let (jsonData, jsonErrors) = self.parse(response: response)
            if (jsonErrors != nil) {
                self.handleLogin(method, errorsAPI: self.errors(jsonErrors))
                return
            }
            
            if (self.parseLogin(method, jsonData: jsonData)) {
                
                if let j = self.jwt, let e = self.email {
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
                    let errorAPI: ErrorAPI = ErrorAPI(code: errorRef.code, message: errorRef.message)
                    switch method {
                    case .Google:
                        self.delegateLoginGoogle?.didEncounterLogin([errorAPI])
                    case .Facebook:
                        self.delegateLoginFacebook?.didEncounterLogin([errorAPI])
                    case .Custom:
                        self.delegateLoginCustom?.didEncounterLogin([errorAPI])
                    }
                }
            }
        }
    }
    
    func findFamily(_ parentEmail: String) {
        let endpointFindFamily = "family/find/" + parentEmail
        Alamofire.request(BabySyncConstant.baseURL+endpointFindFamily).responseJSON { response in
//        Alamofire.request(.GET, BabySyncConstant.baseURL+endpointFindFamily).responseJSON { response in
            let (jsonData, jsonErrors) = self.parse(response: response)
            if (jsonErrors != nil) {
                self.handle(self.errors(jsonErrors))
                return
            }
            else {
                // If the data came back empty, then we don't have a family yet, handle appropriately
                if(jsonData.isEmpty) {
                    // TODO: prompt user create new family or request to join existing?
                }
                else {
                    if (self.parseFamily(jsonData)) {
                        self.delegate?.didFind(self.family)
                    }
                }
            }
        }
    }
    
    func createFamily(_ parentEmail: String) {
        
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
        
        Alamofire.request(BabySyncConstant.baseURL+endpointCreateFamily, method: .post, parameters: ["email": parentEmail]).responseJSON { response in
//        Alamofire.request(.POST, BabySyncConstant.baseURL+endpointCreateFamily, parameters: ["email":parentEmail]).responseJSON { response in
            let (jsonData, jsonErrors) = self.parse(response: response)
            if (jsonErrors != nil) {
                self.handle(self.errors(jsonErrors))
                return
            }
            if (self.parseFamily(jsonData)) {
                self.delegate?.didCreate(self.family)
            }
        }
    }
    
    func joinFamily(_ familyID: Int, parentEmail: String) {
        let endpointJoinFamily = "family/join/" + String(familyID)
        Alamofire.request(BabySyncConstant.baseURL+endpointJoinFamily, method: .put, parameters: ["email": parentEmail]).responseJSON { reponse in
//        Alamofire.request(.PUT, BabySyncConstant.baseURL+endpointJoinFamily, parameters: ["email":parentEmail]).responseJSON { response in
            let (jsonData, jsonErrors) = self.parse(response: reponse)
            if (jsonErrors != nil) {
                self.handle(self.errors(jsonErrors))
                return
            }
            if (self.parseFamily(jsonData)) {
                self.delegate?.didJoin(self.family)
            }
        }
    }
    
    func mergeFamily(_ familyID: Int, parentEmail: String) {
        let endpointMergeFamily = "family/merge/" + String(familyID)
        Alamofire.request(BabySyncConstant.baseURL+endpointMergeFamily, method: .put, parameters: ["email": parentEmail]).responseJSON { response in
//        Alamofire.request(.PUT, BabySyncConstant.baseURL+endpointMergeFamily, parameters: ["email":parentEmail]).responseJSON { response in
            let (jsonData, jsonErrors) = self.parse(response: response)
            if (jsonErrors != nil) {
                self.handle(self.errors(jsonErrors))
                return
            }
            if (self.parseFamily(jsonData)) {
                self.delegate?.didMerge(self.family);
            }
        }
    }
    
    func detachFamily(_ familyID: Int, parentEmail: String) {
        let endpointDetachFamily = "family/detach"
        Alamofire.request(BabySyncConstant.baseURL+endpointDetachFamily, method: .put, parameters: ["email": parentEmail]).responseJSON { response in
//        Alamofire.request(.PUT, BabySyncConstant.baseURL+endpointDetachFamily, parameters: ["email":parentEmail]).responseJSON { response in
            let (jsonData, jsonErrors) = self.parse(response: response)
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
    fileprivate func parentsFrom(_ jsonData: JSON) -> [Parent]? {
        var parents: [Parent] = []
        for jsonParent in jsonData["parents"].arrayValue {
            parents.append(Parent(parent: jsonParent))
        }
        parents.sort {
            return $0.id < $1.id
        }
        return parents
    }
    
    fileprivate func activitiesFrom(_ jsonData: JSON) -> [Activity]? {
        var activities: [Activity] = []
        for jsonActivity in jsonData["activities"].arrayValue {
            activities.append(Activity(activity: jsonActivity))
        }
        activities.sort {
            return $0.id < $1.id
        }
        return activities
    }
    
    fileprivate func babiesFrom(_ jsonData: JSON) -> [Baby]? {
        var babies: [Baby] = []
        for jsonBaby in jsonData["babies"].arrayValue {
            babies.append(Baby(baby: jsonBaby))
        }
        babies.sort {
            return $0.id < $1.id
        }
        return babies
    }
    
    static let service = BabySync()
    
    // MARK: - Helper Methods
    static func errorFrom(_ errorAPI: ErrorAPI) -> Error? {
        var error: Error?
        if let domain = AuthConstant.Error.Domain {
            let errorInfo: [AnyHashable: Any]? = ["message": errorAPI.message]
            error = NSError(domain: domain, code: errorAPI.code, userInfo: errorInfo)
        }
        return error
    }
    
    static func babyByID(_ babyID: Int) -> Baby? {
        let babies: [Baby] = BabySync.service.babies.filter {$0.id == babyID}
        if (babies.count == 1) {
            return babies[0]
        }
        return nil
    }
    
    static func timersForBabyID(_ babyID: Int) -> [Timer] {
        if let baby = BabySync.babyByID(babyID) {
            var timers: [Timer] = baby.timers
            // always get timers in id sorted order
            timers.sort { return $0.id < $1.id }
            return timers
        }
        return []
    }
    
    static func activityForTimer(_ timer: Timer) -> Activity? {
        let activities: [Activity] = BabySync.service.activities.filter {$0.id == timer.activityID}
        if (activities.count == 1) {
            return activities[0]
        }
        return nil
    }
}
