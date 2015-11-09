//
//  ErrorViewController.swift
//  Baby Sync
//
//  Created by Elliott Richerson on 11/9/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import UIKit

protocol ErrorViewDelegate {
    func didDismiss()
}

class ErrorViewController: UIViewController {
    
    var delegate: ErrorViewDelegate?
    
    @IBOutlet weak var labelTitle: UILabel!
    @IBOutlet weak var labelMessage: UILabel!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
//        self.preferredContentSize = CGSizeMake(200, 200)
        
        self.popoverPresentationController?.permittedArrowDirections = UIPopoverArrowDirection.Up
        
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
}