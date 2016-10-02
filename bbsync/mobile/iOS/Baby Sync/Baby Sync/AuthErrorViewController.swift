//
//  AuthErrorViewController.swift
//  Baby Sync
//
//  Created by Elliott Richerson on 11/9/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import UIKit

protocol AuthErrorViewDelegate {
    func didDismiss()
}

class AuthErrorViewController: UIViewController {
    
    var delegate: AuthErrorViewDelegate?
    var parentVC: UIViewController?
    
    var message: String?
    
    @IBOutlet weak var labelTitle: UILabel!
    @IBOutlet weak var labelMessage: UILabel!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Size popover according to whom we are displaying
        if let parent = self.parentVC {
            
            parent.view.constraints
            let popoverWidth: CGFloat = parent.view.frame.width - 40
            let popoverHeight: CGFloat = 100
            self.preferredContentSize = CGSize(width: popoverWidth, height: popoverHeight)
        }
        else {
            // Best guesstimate?
            self.preferredContentSize = CGSize(width: 200, height: 200)
        }

        // Force popover array to point up
        self.popoverPresentationController?.permittedArrowDirections = UIPopoverArrowDirection.up
        
        // If a message was provided, show it
        if let msg = self.message {
            self.labelMessage.text = msg
        }
        else {
            self.labelMessage.text = "It's not my fault!"
        }
        
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
}
