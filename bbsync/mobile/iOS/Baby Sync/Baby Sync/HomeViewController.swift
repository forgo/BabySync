//
//  HomeViewController.swift
//  Baby Sync
//
//  Created by Elliott Richerson on 9/29/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import Alamofire
import UIKit

class HomeViewController: UIViewController, UICollectionViewDataSource, UICollectionViewDelegate, UICollectionViewDelegateFlowLayout, UITableViewDataSource, UITableViewDelegate, UIScrollViewDelegate,  UIPopoverPresentationControllerDelegate, MenuViewDelegate, BabySyncDelegate {
    
    // FOR LATER REFERENCE
    //collectionView.reloadItemsAtIndexPaths([NSIndexPath(forItem: 14, inSection: 0)])
    
    var isTest: Bool = false
    var isEditingTimer: Bool = false
    
    fileprivate var ticker: Foundation.Timer = Foundation.Timer()
    fileprivate var refreshTimer: Foundation.Timer = Foundation.Timer()
    
    fileprivate var tic: Bool = true
    @IBOutlet weak var labelRefreshCountdown: UILabel!
    
    @IBOutlet weak var imageUser: UIImageView!
    @IBOutlet weak var labelName: UILabel!
    @IBOutlet weak var labelEmail: UILabel!
    
    var viewBabies: UIView!
    fileprivate var viewBabiesHeight: CGFloat = 0
    @IBOutlet weak var collectionBabies: UICollectionView!
    @IBOutlet weak var tableTimers: UITableView!

    var selectedBabyIndexPath: IndexPath = IndexPath(item: 0, section: 0)
    var selectedBabyID: Int?
    var selectedTimerID: Int?
    
//    var alert: UIAlertController = UIAlertController()
//    var alertAction: UIAlertAction = UIAlertAction()
    
    func tick() {
        self.tableTimers.reloadData()
//        print(self.tic ? "tic" : "toc")
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
        self.ticker = Foundation.Timer.scheduledTimer(timeInterval: 1.0, target: self, selector: #selector(HomeViewController.tick), userInfo: nil, repeats: true)
        self.refreshTimer = Foundation.Timer.scheduledTimer(timeInterval: 60.0, target: self, selector: #selector(HomeViewController.refresh), userInfo: nil, repeats: true)
    }
    
    func stopTimers() {
        self.ticker.invalidate()
        self.refreshTimer.invalidate()
    }
    
    func updateBabiesView() {
        var babiesViewRect: CGRect = CGRect(x: 0, y: -self.viewBabiesHeight, width: self.tableTimers.bounds.width, height: self.viewBabiesHeight)
        if(self.tableTimers.contentOffset.y < -self.viewBabiesHeight) {
            babiesViewRect.origin.y = self.tableTimers.contentOffset.y
            babiesViewRect.size.height = -self.tableTimers.contentOffset.y
        }
        self.viewBabies.frame = babiesViewRect
        
        // The underlying babies collection view needs to relayout so insets match
        // after a rotation, for example (updateBabiesView fxn called on willRotate...)
        self.collectionBabies.collectionViewLayout.invalidateLayout()
    }
    
    func scrollViewDidScroll(_ scrollView: UIScrollView) {
        if(scrollView == self.tableTimers) {
            updateBabiesView()
        }
    }
    
    override func viewWillLayoutSubviews() {
        updateBabiesView()
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
        
        BabySync.service.delegate = self;
        
        self.viewBabies = self.tableTimers.tableHeaderView
        self.tableTimers.tableHeaderView = nil
        self.tableTimers.addSubview(self.viewBabies)
        self.viewBabiesHeight = self.viewBabies.frame.height
        self.tableTimers.contentInset = UIEdgeInsets(top: viewBabiesHeight, left: 0, bottom: 0, right: 0)
        self.tableTimers.contentOffset = CGPoint(x: 0, y: -viewBabiesHeight)
        self.updateBabiesView()
        
        // let's get dummy data for now
//        BabySync.service.createFamily(Auth.sharedInstance.securedUser.email)
        // let's try to get the real stuff
        // 1) See if Family/Parent exists for the logged in user's email
        // Show activity indicator
        BabySync.service.findFamily(Auth.sharedInstance.securedUser.email)
        
        // 1a) if exists, return Family
        // 1b) if doesn't exist, provide some options for 1st login
        //   - create new (boilerplate family) / join new (just create :RESPONSIBLE_FOR w/out boilerplate family)
        
        // TODO place this after findParent returns.
        self.startTimers()
        
        self.imageUser.layer.masksToBounds = true
        self.imageUser.image = Auth.sharedInstance.securedUser.pic
        self.labelName.text = Auth.sharedInstance.securedUser.name
        self.labelEmail.text = Auth.sharedInstance.securedUser.email
        
    }
    
    override func viewDidAppear(_ animated: Bool) {
        // do something to get data
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    override var preferredStatusBarStyle : UIStatusBarStyle {
        return UIStatusBarStyle.lightContent
    }
    
    // Convenience
    @IBAction func reloadCollections() {
        self.collectionBabies.reloadData()
        self.tableTimers.reloadData()
    }
    
    // Segues
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        if (segue.identifier == "SegueMenuPopover") {
            let menuPopupVC: MenuViewController = segue.destination as! MenuViewController            
            menuPopupVC.popoverPresentationController!.delegate = self
            menuPopupVC.delegate = self
        }
        else if (segue.identifier == "SegueHomeToBaby") {
            let babyVC: BabyViewController = segue.destination as! BabyViewController
            babyVC.babyState = .viewing
            let babySelectedIndexPaths: [IndexPath] = self.collectionBabies.indexPathsForSelectedItems!
            let babySelectedIndexPath: IndexPath = babySelectedIndexPaths.first!
            babyVC.baby = Baby(baby: BabySync.service.babies[(babySelectedIndexPath as NSIndexPath).row])
        }
        else if (segue.identifier == "SegueHomeToNewBaby") {
            let babyVC: BabyViewController = segue.destination as! BabyViewController
            babyVC.babyState = .creating
            babyVC.baby = Baby()
        }
    }
    
    @IBAction func prepareForUnwindToHome(_ segue: UIStoryboardSegue) {
        // Clear user data and log off if unwinded here
        if (segue.identifier == "UnwindSegueBabyToHome") {
            
        }
        else if (segue.identifier == "UnwindSegueActivityToHome") {
            
        }
        else if (segue.identifier == "UnwindSegueTimerToHome") {
            
        }
    }
    
    // MARK: - UIPopoverPresentationControllerDelegate
    func adaptivePresentationStyle(for controller: UIPresentationController) -> UIModalPresentationStyle {
        // This allows the popover to not take over the whole screen
        return UIModalPresentationStyle.none
    }
    
    func popoverPresentationControllerShouldDismissPopover(_ popoverPresentationController: UIPopoverPresentationController) -> Bool {
        // Handle this ourselves to turn off automatic animation when clicking outside of popover
        // and to have a handle for other potential actions
        self.dismiss(animated: false) { () -> Void in
            //
        }
        return false
    }
    
    // MARK: - UICollectionViewDataSource
    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        
        if(collectionView == self.collectionBabies) {
            let cell: BabyCollectionViewCell = collectionView.dequeueReusableCell(withReuseIdentifier: "BabyCell", for: indexPath) as! BabyCollectionViewCell
            let baby: Baby = BabySync.service.babies[(indexPath as NSIndexPath).row]
            cell.baby = baby
            return cell
        }
        else {
            return UICollectionViewCell()
        }
    }
    
    func numberOfSections(in collectionView: UICollectionView) -> Int {
        if (collectionView == self.collectionBabies) {
            return 1
        }
        return 0
    }
    
    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        if (collectionView == self.collectionBabies) {
            return BabySync.service.babies.count
        }
        return 0
    }
    
    // MARK: - UICollectionViewDelegate
    func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
        if (collectionView == self.collectionBabies) {
            
            let baby: Baby = BabySync.service.babies[(indexPath as NSIndexPath).row]
            self.selectedBabyID = baby.id
            
            self.collectionBabies.cellForItem(at: indexPath)?.isSelected = true
            self.collectionBabies.reloadItems(at: [indexPath])
        }
    }
    
    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, insetForSectionAt section: Int) -> UIEdgeInsets {
        // Center the babies in their horizontal collection view
        if (collectionView == self.collectionBabies) {
            let edgeInsets = (collectionView.frame.size.width - (CGFloat(BabySync.service.babies.count) * 50) - (CGFloat(BabySync.service.babies.count) * 10)) / 2
            return UIEdgeInsetsMake(0, edgeInsets, 0, 0)
        }
        else {
            return UIEdgeInsets.zero
        }
    }
    
    
    override func willRotate(to toInterfaceOrientation: UIInterfaceOrientation, duration: TimeInterval) {
        self.updateBabiesView()
    }

    
    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAt indexPath: IndexPath) -> CGSize {
        if (collectionView == self.collectionBabies) {
            return CGSize(width: 60, height: 80)
        }
        else {
            return CGSize(width: 0,height: 0)
        }
    }
    
    // MARK: - UITableViewDataSource
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        if (tableView == self.tableTimers) {
            let cell: TimerTableViewCell = tableView.dequeueReusableCell(withIdentifier: "TimerCell", for: indexPath) as! TimerTableViewCell
                        
            // TimerTableViewCell will handle updates on didSet of timer property
            if let selectedBabyID = self.selectedBabyID {
                var timers: [Timer] = BabySync.timersForBabyID(selectedBabyID)
                cell.timer = timers[(indexPath as NSIndexPath).row]
            }
            
            // Bug in storyboard, have to programatically set cell background to clear
            // otherwise it shows up white
            cell.backgroundColor = UIColor.clear
            
            return cell
        }
        else {
            return UITableViewCell()
        }
    }
    
    func numberOfSections(in tableView: UITableView) -> Int {
        if(tableView == self.tableTimers) {
            return 1
        }
        return 0
    }
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
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
    
    func visibleTimerCellsExcept(_ indexPath: IndexPath, action: (TimerTableViewCell)->(), exceptAction: (TimerTableViewCell)->()) {
        let timerException: TimerTableViewCell = self.tableTimers.cellForRow(at: indexPath) as! TimerTableViewCell
        for visibleCell in self.tableTimers.visibleCells {
            let timerCell: TimerTableViewCell = visibleCell as! TimerTableViewCell
            if (timerCell != timerException) {
                action(timerCell)
            }
            else {
                exceptAction(timerCell)
            }
        }
    }
    
    func tableView(_ tableView: UITableView, editActionsForRowAt indexPath: IndexPath) -> [UITableViewRowAction]? {
        if (tableView == self.tableTimers) {
            let editAction = UITableViewRowAction(style: .default, title: "EDIT") { (action, indexPath) -> Void in
                // TODO: Edit timer handler
            }
            editAction.backgroundColor = BabySyncConstant.Color.Secondary
            let deleteAction = UITableViewRowAction(style: .normal, title: "DELETE") { (action, indexPath) -> Void in
                // TODO: Delete timer handler
            }
            deleteAction.backgroundColor = BabySyncConstant.Color.Dark
            
            return [deleteAction, editAction]
        }
        return []
    }
    
    func tableView(_ tableView: UITableView, willBeginEditingRowAt indexPath: IndexPath) {
        
        if(tableView == self.tableTimers) {            
            self.isEditingTimer = true
            self.stopTimers()
            self.visibleTimerCellsExcept(indexPath, action: { (nonEditCell) -> () in
                nonEditCell.blur(true)
                }, exceptAction: { (editCell) -> () in
                    editCell.layoutForEdit(true)
            })
        }
    }
    
    func tableView(_ tableView: UITableView, didEndEditingRowAt indexPath: IndexPath?) {
        if(tableView == self.tableTimers) {
            // Apple bug calls this method twice, so this avoid that
            if (self.isEditingTimer) {
                self.isEditingTimer = false
                self.startTimers()
                
                self.visibleTimerCellsExcept(indexPath!, action: { (nonEditCell) -> () in
                    nonEditCell.blur(false)
                    }, exceptAction: { (editCell) -> () in
                        editCell.layoutForEdit(false)
                })
            }
        }
    }

    // MARK: - UITableViewDelegate
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        if (tableView == self.tableTimers) {
            print("selected timer at index \((indexPath as NSIndexPath).row)")
            let cell: TimerTableViewCell = tableView.cellForRow(at: indexPath) as! TimerTableViewCell
            if let timer = cell.timer {
                self.selectedTimerID = timer.id
            }
            else {
                self.selectedTimerID = nil
            }
        }
    }
    
    // MARK: - MenuViewDelegate
    func menu(_ menuController: MenuViewController, didSelectItemWithSegueIdentifier segueID: String) {
        menuController.dismiss(animated: false) { () -> Void in
            self.performSegue(withIdentifier: segueID, sender: self)
        }
    }
    
    // MARK: - BabySyncDelegate
    func didFind(_ family: Family) {
        
    }
    
    func didLogin(_ parent: Parent) {
        
    }

    func didCreate(_ family: Family) {
        print("didCreate family: ", family)
        
        // Default to selecting the first baby (if existing) on new family creation
        if(BabySync.service.babies.count > 0) {
            self.selectedBabyID = BabySync.service.babies[0].id
        }
        self.reloadCollections()
    }
    
    func didJoin(_ family: Family) {
        
    }
    
    func didMerge(_ family: Family){
        
    }
    
    func didRetrieve(_ family: Family) {
        
    }
    
    func didEncounter(_ errorsAPI: [ErrorAPI]) {
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
