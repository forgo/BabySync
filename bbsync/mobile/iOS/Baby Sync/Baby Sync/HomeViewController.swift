//
//  HomeViewController.swift
//  Baby Sync
//
//  Created by Elliott Richerson on 9/29/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import Alamofire
import UIKit

class HomeViewController: UIViewController, UICollectionViewDataSource, UICollectionViewDelegate, UICollectionViewDelegateFlowLayout, UIPopoverPresentationControllerDelegate, MenuViewDelegate, BabySyncDelegate {
    
    // FOR LATER REFERENCE
    //collectionView.reloadItemsAtIndexPaths([NSIndexPath(forItem: 14, inSection: 0)])
    
    var isTest: Bool = false
    
    var ticker: NSTimer = NSTimer()
    
    @IBOutlet weak var imageUser: UIImageView!
    @IBOutlet weak var labelName: UILabel!
    @IBOutlet weak var labelEmail: UILabel!
    
    @IBOutlet weak var collectionBabies: UICollectionView!
    @IBOutlet weak var collectionTimers: UICollectionView!
    
    var selectedBabyIndexPath: NSIndexPath = NSIndexPath(forItem: 0, inSection: 0)
    
    var alert: UIAlertController = UIAlertController()
    var alertAction: UIAlertAction = UIAlertAction()
    
    func tick() {
        self.reloadCollections()
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
        
//        self.ticker = NSTimer.scheduledTimerWithTimeInterval(1.0, target: self, selector: "tick", userInfo: nil, repeats: true)
        
        self.imageUser.layer.masksToBounds = true
        self.imageUser.image = UserData.sharedInstance.pic
        self.labelName.text = UserData.sharedInstance.name
        self.labelEmail.text = UserData.sharedInstance.email
        
        
        BabySync.service.loginParent(UserData.sharedInstance.email, loginType: UserData.sharedInstance.loginType);
        
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
        print("Reloading collections...")
        self.collectionBabies.reloadData()
        self.collectionTimers.reloadData()
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
    func collectionView(collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        if (collectionView == self.collectionBabies) {
            return BabySync.service.babies.count
        }
        else if (collectionView == self.collectionTimers && BabySync.service.babies.count > 0) {
            // Find the number of timers associated with this baby
            let selectedBaby: Baby = BabySync.service.babies[self.selectedBabyIndexPath.row]
            return selectedBaby.timers.count
        }
        else {
            return 0
        }
    }
    
    func collectionView(collectionView: UICollectionView, cellForItemAtIndexPath indexPath: NSIndexPath) -> UICollectionViewCell {
        
        if(collectionView == self.collectionBabies) {
            let cell: BabyCollectionViewCell = collectionView.dequeueReusableCellWithReuseIdentifier("BabyCell", forIndexPath: indexPath) as! BabyCollectionViewCell
            let baby: Baby = BabySync.service.babies[indexPath.row]
            cell.imageBaby.layer.masksToBounds = true
            cell.imageBaby.image = UIImage(named: "Boy")
            cell.labelBaby.text = baby.name
            
            if(cell.selected) {
                cell.labelBaby.backgroundColor = UIColor.orangeColor()
            }
            
            return cell
        }
        else if (collectionView == self.collectionTimers) {
            let cell: TimerCollectionViewCell = collectionView.dequeueReusableCellWithReuseIdentifier("TimerCell", forIndexPath: indexPath) as! TimerCollectionViewCell
            
            // Get activity associated with this timer
            let selectedBaby: Baby = BabySync.service.babies[self.selectedBabyIndexPath.row]
            
            // Always get timers in the id sorted order
            var timers: [Timer] = selectedBaby.timers
            timers.sortInPlace {
                return $0.id < $1.id
            }
            
            let timer: Timer = timers[indexPath.row]
            let acts: [Activity] = BabySync.service.activities.filter{$0.id == timer.activityID}
            
            if (acts.count > 0) {
                cell.imageTimer.layer.masksToBounds = true
                cell.imageTimer.image = UIImage(named: acts[0].icon)
                cell.labelActivityTimer.text = acts[0].name
            }
            
            cell.labelElapsedTimer.font = UIFont(name: "SourceCodePro-Regular", size: 40)
            cell.labelElapsedTimer.attributedText = ElapsedTimeFormatter.sharedInstance.attributedString(timer.resetDate)
            
            if(cell.selected) {
                cell.backgroundColor = UIColor.purpleColor()
            }

            return cell
        }
        else {
            return UICollectionViewCell();
        }
        

    }
    
    func numberOfSectionsInCollectionView(collectionView: UICollectionView) -> Int {
        if (collectionView == self.collectionBabies) {
            return 1
        }
        else if (collectionView == self.collectionTimers) {
            return 1
        }
        else {
            return 0
        }
    }
        
    // UICollectionViewDelegate
    func collectionView(collectionView: UICollectionView, didSelectItemAtIndexPath indexPath: NSIndexPath) {
        if (collectionView == self.collectionBabies) {
            self.collectionBabies.cellForItemAtIndexPath(indexPath)?.selected = true
            self.collectionBabies.reloadItemsAtIndexPaths([indexPath])
        }
        else if (collectionView == self.collectionTimers) {
            self.collectionTimers.cellForItemAtIndexPath(indexPath)?.selected = true
            self.collectionTimers.reloadItemsAtIndexPaths([indexPath])
        }
    }
    
    func collectionView(collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, insetForSectionAtIndex section: Int) -> UIEdgeInsets {
        // Center the babies in their horizontal collection view
        if (collectionView == self.collectionBabies) {
            let edgeInsets = (collectionView.frame.size.width - (CGFloat(BabySync.service.babies.count) * 50) - (CGFloat(BabySync.service.babies.count) * 10)) / 2
            return UIEdgeInsetsMake(0, edgeInsets, 0, 0)
        }
        else if (collectionView == self.collectionTimers) {
            return UIEdgeInsetsMake(8, 0, 0, 0)
        }
        else {
            return UIEdgeInsetsZero
        }
    }
    
    func collectionView(collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAtIndexPath indexPath: NSIndexPath) -> CGSize {
        if (collectionView == self.collectionBabies) {
            return CGSizeMake(60, 80)
        }
        else if (collectionView == self.collectionTimers) {
            return CGSizeMake(collectionView.bounds.size.width, 80)
        }
        else {
            return CGSizeMake(0,0)
        }
    }
    
    override func viewWillLayoutSubviews() {
        self.collectionTimers.collectionViewLayout.invalidateLayout()
    }
    
    // MenuViewDelegate
    func menu(menuController: MenuViewController, didSelectItemWithSegueIdentifier segueID: String) {
        menuController.dismissViewControllerAnimated(false) { () -> Void in
            self.performSegueWithIdentifier(segueID, sender: self)
        }
    }
    
    // BabySyncDelegate
    func didFind(parent: Parent) {
        
    }
    
    func didLogin(parent: Parent) {
        
    }

    func didCreate(family: Family) {
        
    }
    
    func didJoin(family: Family) {
        
    }
    
    func didMerge(family: Family){
        
    }
    
    func didRetrieve(family: Family) {
        
    }
    
    func didEncounter(error: Error) {
        self.alert = UIAlertController(title: "Error code: "+String(error.code), message: error.message, preferredStyle: .Alert);
        self.alertAction = UIAlertAction(title: "Cancel", style: .Default, handler: { (action: UIAlertAction!) -> Void in
            //
        })
        self.alert.addAction(self.alertAction);
    }
    
}
