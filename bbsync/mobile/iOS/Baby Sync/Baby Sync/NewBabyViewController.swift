//
//  NewBabyViewController.swift
//  Baby Sync
//
//  Created by Elliott Richerson on 9/30/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import UIKit

class NewBabyViewController: UIViewController, UINavigationControllerDelegate, UIImagePickerControllerDelegate {

    var imagePicker: UIImagePickerController = UIImagePickerController()
    
    var alert: UIAlertController = UIAlertController()
    var alertAction: UIAlertAction = UIAlertAction()
    
    @IBOutlet weak var imageBaby: UIImageView!
    @IBOutlet weak var buttonCustomPic: UIButton!
    @IBOutlet weak var buttonChooseIcon: UIButton!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
        
        // TODO: If we can find stored UIImage associated with home-selected baby ID, use it
        // otherwise set default image
        self.imageBaby.image = UIImage(named: "Boy")
    }
    
    // Make a Custom Photo
    @IBAction func takePhoto(sender: UIButton) {
        if (UIImagePickerController.isSourceTypeAvailable(.Camera)) {
            self.imagePicker.delegate = self
            self.imagePicker.sourceType = .Camera
            self.presentViewController(imagePicker, animated: true, completion: { () -> Void in
                //
            })
        }
        else {
            self.alert = UIAlertController(title: "Simulator", message: "Camera not available.", preferredStyle: UIAlertControllerStyle.Alert)
            self.alertAction = UIAlertAction(title: "Ok", style: UIAlertActionStyle.Default, handler: { (action) -> Void in
            })
            self.alert.addAction(self.alertAction)
            self.presentViewController(self.alert, animated: true, completion: nil)
        }
    }
    
    func imagePickerController(picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [String : AnyObject]) {
        self.imagePicker.dismissViewControllerAnimated(true) { () -> Void in
            //
        }
        self.imageBaby.image = info[UIImagePickerControllerOriginalImage] as? UIImage
        
    }
    
    // Select a pre-existing icon
    @IBAction func selectIcon(sender: UIButton) {
        self.performSegueWithIdentifier("SegueNewBabyToSelectIcon", sender: self)
    }
    
    // Segues
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        if (segue.identifier == "SegueNewBabyToSelectIcon") {
            // Any preparation for segue to icon selection
        }
        else if (segue.identifier == "UnwindSegueNewBabyToHome") {
            // Any preparation for unwinding to home
            let homeVC: HomeViewController = segue.destinationViewController as! HomeViewController
            // Add babies
            // Add timers
            // Reload collections
            homeVC.reloadCollections()
        }
    }
    
    @IBAction func prepareForUnwindSelectIcon(segue: UIStoryboardSegue) {
        if (segue.identifier == "UnwindSegueSelectIconToNewBaby") {
            // Any preparation for unwinding from select icon
            // new image is actually set in "prepareForSegue" of select icon VC
        }
    }

    
}
