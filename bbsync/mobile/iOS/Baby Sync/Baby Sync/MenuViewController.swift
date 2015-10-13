//
//  MenuViewController.swift
//  Baby Sync
//
//  Created by Elliott Richerson on 9/30/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import UIKit

protocol MenuViewDelegate {
    func menu(menuController: MenuViewController, didSelectItemWithSegueIdentifier segueID: String)
}

class MenuViewController: UIViewController, UITableViewDataSource, UITableViewDelegate {
    
    var delegate: MenuViewDelegate?
    
//    let menuItems: [String] = ["+ Baby", "+ Activity", "+ Timer", "Log Out"]
    let menuItems: [Dictionary<String, String>] = [
        ["label": "+ Baby", "segueID": "SegueHomeToNewBaby"],
        ["label": "+ Timer", "segueID": "SegueHomeToNewTimer"],
        ["label": "Log Out", "segueID": "UnwindSegueHomeToLogin"]
    ]
    
    @IBOutlet weak var tableMenu: UITableView!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
        self.preferredContentSize = CGSizeMake(130, 132)
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    // UITableViewDataSource
    
    func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return self.menuItems.count
    }
    
    func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
        let cell: MenuTableViewCell = tableView.dequeueReusableCellWithIdentifier("MenuCell", forIndexPath: indexPath) as! MenuTableViewCell
        cell.labelMenuItem.text = self.menuItems[indexPath.row]["label"]
        return cell
    }
    
    // UITablViewDelegate
    func tableView(tableView: UITableView, didSelectRowAtIndexPath indexPath: NSIndexPath) {
        print("Selected cell \(indexPath.row)")
        if let delegate = self.delegate {
            delegate.menu(self, didSelectItemWithSegueIdentifier: self.menuItems[indexPath.row]["segueID"]!)
        }
    }
    
}
