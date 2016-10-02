//
//  MenuViewController.swift
//  Baby Sync
//
//  Created by Elliott Richerson on 9/30/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import UIKit

protocol MenuViewDelegate {
    func menu(_ menuController: MenuViewController, didSelectItemWithSegueIdentifier segueID: String)
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
        self.preferredContentSize = CGSize(width: 130, height: 132)
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    // UITableViewDataSource
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return self.menuItems.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell: MenuTableViewCell = tableView.dequeueReusableCell(withIdentifier: "MenuCell", for: indexPath) as! MenuTableViewCell
        cell.labelMenuItem.text = self.menuItems[(indexPath as NSIndexPath).row]["label"]
        return cell
    }
    
    // UITablViewDelegate
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        print("Selected cell \((indexPath as NSIndexPath).row)")
        if let delegate = self.delegate {
            delegate.menu(self, didSelectItemWithSegueIdentifier: self.menuItems[(indexPath as NSIndexPath).row]["segueID"]!)
        }
    }
    
}
