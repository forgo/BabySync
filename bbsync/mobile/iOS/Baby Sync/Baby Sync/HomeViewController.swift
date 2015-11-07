//
//  HomeViewController.swift
//  Baby Sync
//
//  Created by Elliott Richerson on 9/29/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import Alamofire
import UIKit

class HomeViewController: UIViewController, UICollectionViewDataSource, UICollectionViewDelegate, UICollectionViewDelegateFlowLayout, UITableViewDataSource, UITableViewDelegate, UIPopoverPresentationControllerDelegate, MenuViewDelegate, BabySyncDelegate {
    
    // FOR LATER REFERENCE
    //collectionView.reloadItemsAtIndexPaths([NSIndexPath(forItem: 14, inSection: 0)])
    
    var isTest: Bool = false
    var isEditingTimer: Bool = false
    
    private var ticker: NSTimer = NSTimer()
    private var refreshTimer: NSTimer = NSTimer()
    
    private var tic: Bool = true
    @IBOutlet weak var labelRefreshCountdown: UILabel!
    
    @IBOutlet weak var imageUser: UIImageView!
    @IBOutlet weak var labelName: UILabel!
    @IBOutlet weak var labelEmail: UILabel!
    
    @IBOutlet weak var collectionBabies: UICollectionView!
    @IBOutlet weak var tableTimers: UITableView!
    
    var selectedBabyIndexPath: NSIndexPath = NSIndexPath(forItem: 0, inSection: 0)
    var selectedBabyID: Int?
    var selectedTimerID: Int?
    
//    var alert: UIAlertController = UIAlertController()
//    var alertAction: UIAlertAction = UIAlertAction()
    
    func tick() {
        self.tableTimers.reloadData()
        print(self.tic ? "tic" : "toc")
        self.tic = !self.tic
        let secondsUntilRefresh: UInt = UInt(abs(round(self.refreshTimer.fireDate.timeIntervalSinceNow)))
        self.labelRefreshCountdown.text = "\(secondsUntilRefresh) sec"
    }
    
    func refresh() {
        print("Performing \(self.refreshTimer.timeInterval) sec periodic refresh.")
        // TODO: Call web service to sync every minute or on TBD interval
        self.reloadCollections()
    }
    
    func startTimers() {
        self.ticker = NSTimer.scheduledTimerWithTimeInterval(1.0, target: self, selector: "tick", userInfo: nil, repeats: true)
        self.refreshTimer = NSTimer.scheduledTimerWithTimeInterval(60.0, target: self, selector: "refresh", userInfo: nil, repeats: true)
    }
    
    func stopTimers() {
        self.ticker.invalidate()
        self.refreshTimer.invalidate()
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
        
        BabySync.service.delegate = self;
        
        // let's get dummy data for now
        BabySync.service.createFamily(Auth.sharedInstance.securedUser.email)
        
        self.startTimers()
        
        self.imageUser.layer.masksToBounds = true
        self.imageUser.image = Auth.sharedInstance.securedUser.pic
        self.labelName.text = Auth.sharedInstance.securedUser.name
        self.labelEmail.text = Auth.sharedInstance.securedUser.email
        
    }
    
    override func viewDidAppear(animated: Bool) {
        // do something to get data
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    override func preferredStatusBarStyle() -> UIStatusBarStyle {
        return UIStatusBarStyle.LightContent
    }
    
    // Convenience
    @IBAction func reloadCollections() {
        self.collectionBabies.reloadData()
        self.tableTimers.reloadData()
    }
    
    // Segues
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        if (segue.identifier == "SegueMenuPopover") {
            let menuPopupVC: MenuViewController = segue.destinationViewController as! MenuViewController            
            menuPopupVC.popoverPresentationController!.delegate = self
            menuPopupVC.delegate = self
        }
        else if (segue.identifier == "SegueHomeToBaby") {
            let babyVC: BabyViewController = segue.destinationViewController as! BabyViewController
            babyVC.babyState = .Viewing
            let babySelectedIndexPaths: [NSIndexPath] = self.collectionBabies.indexPathsForSelectedItems()!
            let babySelectedIndexPath: NSIndexPath = babySelectedIndexPaths.first!
            babyVC.baby = Baby(baby: BabySync.service.babies[babySelectedIndexPath.row])
        }
        else if (segue.identifier == "SegueHomeToNewBaby") {
            let babyVC: BabyViewController = segue.destinationViewController as! BabyViewController
            babyVC.babyState = .Creating
            babyVC.baby = Baby()
        }
    }
    
    @IBAction func prepareForUnwindToHome(segue: UIStoryboardSegue) {
        // Clear user data and log off if unwinded here
        if (segue.identifier == "UnwindSegueBabyToHome") {
            
        }
        else if (segue.identifier == "UnwindSegueActivityToHome") {
            
        }
        else if (segue.identifier == "UnwindSegueTimerToHome") {
            
        }
    }
    
    // UIPopoverPresentationControllerDelegate
    func adaptivePresentationStyleForPresentationController(controller: UIPresentationController) -> UIModalPresentationStyle {
        return UIModalPresentationStyle.None
    }
    
    func popoverPresentationControllerShouldDismissPopover(popoverPresentationController: UIPopoverPresentationController) -> Bool {
        // Handle this ourselves to turn off automatic animation when clicking outside of popover
        // and to have a handle for other potential actions
        self.dismissViewControllerAnimated(false) { () -> Void in
            //
        }
        return false
    }
    
    // UICollectionViewDataSource
    func collectionView(collectionView: UICollectionView, cellForItemAtIndexPath indexPath: NSIndexPath) -> UICollectionViewCell {
        
        if(collectionView == self.collectionBabies) {
            let cell: BabyCollectionViewCell = collectionView.dequeueReusableCellWithReuseIdentifier("BabyCell", forIndexPath: indexPath) as! BabyCollectionViewCell
            let baby: Baby = BabySync.service.babies[indexPath.row]
            cell.baby = baby
            return cell
        }
        else {
            return UICollectionViewCell()
        }
    }
    
    func numberOfSectionsInCollectionView(collectionView: UICollectionView) -> Int {
        if (collectionView == self.collectionBabies) {
            return 1
        }
        return 0
    }
    
    func collectionView(collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        if (collectionView == self.collectionBabies) {
            return BabySync.service.babies.count
        }
        return 0
    }
    
    // UICollectionViewDelegate
    func collectionView(collectionView: UICollectionView, didSelectItemAtIndexPath indexPath: NSIndexPath) {
        if (collectionView == self.collectionBabies) {
            
            let baby: Baby = BabySync.service.babies[indexPath.row]
            self.selectedBabyID = baby.id
            
            self.collectionBabies.cellForItemAtIndexPath(indexPath)?.selected = true
            self.collectionBabies.reloadItemsAtIndexPaths([indexPath])
        }
    }
    
    func collectionView(collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, insetForSectionAtIndex section: Int) -> UIEdgeInsets {
        // Center the babies in their horizontal collection view
        if (collectionView == self.collectionBabies) {
            let edgeInsets = (collectionView.frame.size.width - (CGFloat(BabySync.service.babies.count) * 50) - (CGFloat(BabySync.service.babies.count) * 10)) / 2
            return UIEdgeInsetsMake(0, edgeInsets, 0, 0)
        }
        else {
            return UIEdgeInsetsZero
        }
    }
    
    func collectionView(collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAtIndexPath indexPath: NSIndexPath) -> CGSize {
        if (collectionView == self.collectionBabies) {
            return CGSizeMake(60, 80)
        }
        else {
            return CGSizeMake(0,0)
        }
    }
    
    // MARK: - UITableViewDataSource
    func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
        if (tableView == self.tableTimers) {
            let cell: TimerTableViewCell = tableView.dequeueReusableCellWithIdentifier("TimerCell", forIndexPath: indexPath) as! TimerTableViewCell
                        
            // TimerTableViewCell will handle updates on didSet of timer property
            if let selectedBabyID = self.selectedBabyID {
                var timers: [Timer] = BabySync.timersForBabyID(selectedBabyID)
                cell.timer = timers[indexPath.row]
            }
            
            // Bug in storyboard, have to programatically set cell background to clear
            // otherwise it shows up white
            cell.backgroundColor = UIColor.clearColor()
            
            return cell
        }
        else {
            return UITableViewCell()
        }
    }
    
    func numberOfSectionsInTableView(tableView: UITableView) -> Int {
        if(tableView == self.tableTimers) {
            return 1
        }
        return 0
    }
    
    func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        if (tableView == self.tableTimers && BabySync.service.babies.count > 0) {
            // Find the number of timers associated with this baby
            if let selectedBabyID = self.selectedBabyID {
                if let baby = BabySync.babyByID(selectedBabyID) {
                    return baby.timers.count
                }
            }
        }
        return 0
    }
    
    func tableView(tableView: UITableView, editActionsForRowAtIndexPath indexPath: NSIndexPath) -> [UITableViewRowAction]? {
        if (tableView == self.tableTimers) {
            let editAction = UITableViewRowAction(style: .Normal, title: "EDIT") { (action, indexPath) -> Void in
                // TODO: Edit timer handler
            }
            editAction.backgroundColor = UIColor.blueColor()
            
            let deleteAction = UITableViewRowAction(style: .Normal, title: "DEL") { (action, indexPath) -> Void in
                // TODO: Delete timer handler
            }
            deleteAction.backgroundColor = UIColor.redColor()
            
            return [deleteAction, editAction]
        }
        return []
    }
    
    func visibleTimerCellsExcept(indexPath: NSIndexPath, action: (TimerTableViewCell)->()) {
        let timerException: TimerTableViewCell = self.tableTimers.cellForRowAtIndexPath(indexPath) as! TimerTableViewCell
        for visibleCell in self.tableTimers.visibleCells {
            let timerCell: TimerTableViewCell = visibleCell as! TimerTableViewCell
            if (timerCell != timerException) {
                action(timerCell)
            }
        }
    }
    
    func tableView(tableView: UITableView, willBeginEditingRowAtIndexPath indexPath: NSIndexPath) {
        if(tableView == self.tableTimers) {
            self.isEditingTimer = true
            self.stopTimers()
            
            self.visibleTimerCellsExcept(indexPath, action: { (cell) -> () in
                cell.contentView.alpha = 0.5
            })
        }
    }
    
    func tableView(tableView: UITableView, didEndEditingRowAtIndexPath indexPath: NSIndexPath) {
        if(tableView == self.tableTimers) {
            // Apple bug calls this method twice, so this avoid that
            if (self.isEditingTimer) {
                self.isEditingTimer = false
                self.startTimers()
                
                self.visibleTimerCellsExcept(indexPath, action: { (cell) -> () in
                    cell.contentView.alpha = 1.0
                })
            }
        }
    }
    

    // MARK: - UITableViewDelegate
    func tableView(tableView: UITableView, didSelectRowAtIndexPath indexPath: NSIndexPath) {
        if (tableView == self.tableTimers) {
            print("selected timer at index \(indexPath.row)")
            let cell: TimerTableViewCell = tableView.cellForRowAtIndexPath(indexPath) as! TimerTableViewCell
            if let timer = cell.timer {
                self.selectedTimerID = timer.id
            }
            else {
                self.selectedTimerID = nil
            }
        }
    }
    
    // MARK: - MenuViewDelegate
    func menu(menuController: MenuViewController, didSelectItemWithSegueIdentifier segueID: String) {
        menuController.dismissViewControllerAnimated(false) { () -> Void in
            self.performSegueWithIdentifier(segueID, sender: self)
        }
    }
    
    // MARK: - BabySyncDelegate
    func didFind(parent: Parent) {
        
    }
    
    func didLogin(parent: Parent) {
        
    }

    func didCreate(family: Family) {
        print("didCreate family: ", family)
        
        // Default to selecting the first baby (if existing) on new family creation
        if(BabySync.service.babies.count > 0) {
            self.selectedBabyID = BabySync.service.babies[0].id
        }
        self.reloadCollections()
    }
    
    func didJoin(family: Family) {
        
    }
    
    func didMerge(family: Family){
        
    }
    
    func didRetrieve(family: Family) {
        
    }
    
    func didEncounter(error: Error) {
//        print("DID ENCOUNTER")
//        let alertController: UIAlertController = UIAlertController(title: "Error code: "+String(error.code), message: error.message, preferredStyle: .Alert);
//        
//        let cancelAction: UIAlertAction = UIAlertAction(title: "Cancel", style: .Cancel) { (action: UIAlertAction!) -> Void in
//            print("Cancel action")
//        }
//        
//        let okAction: UIAlertAction = UIAlertAction(title: "OK", style: .Default) { (action: UIAlertAction!) -> Void in
//            print("OK action")
//        }
//        alertController.addAction(cancelAction);
//        alertController.addAction(okAction);
    }
    
}
