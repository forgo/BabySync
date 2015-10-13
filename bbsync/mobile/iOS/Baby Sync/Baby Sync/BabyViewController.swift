//
//  BabyViewController.swift
//  Baby Sync
//
//  Created by Elliott Richerson on 10/4/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import UIKit
import CoreData

enum BabyState {
    case Creating
    case Viewing
    case Editing
}

class BabyViewController: UIViewController, UINavigationControllerDelegate, UIImagePickerControllerDelegate {
    
    let moContext = (UIApplication.sharedApplication().delegate as! AppDelegate).managedObjectContext
    
    var imagePicker: UIImagePickerController = UIImagePickerController()
    
    var alert: UIAlertController = UIAlertController()
    var alertAction: UIAlertAction = UIAlertAction()
    
    @IBOutlet weak var labelTitle: UILabel!
    @IBOutlet weak var viewEditImage: UIView!
    @IBOutlet weak var imageView: UIImageView!
    @IBOutlet weak var textFieldName: UITextField!
    @IBOutlet weak var buttonBack: UIButton!
    @IBOutlet weak var buttonAction: UIButton!
    
    var babyState: BabyState = .Viewing
    var family: Family = Family()
    var baby: Baby = Baby()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        self.toggleToState(self.babyState)

        // Do any additional setup after loading the view.
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    func imageForBaby(baby: Baby) -> UIImage {
        if (baby.id > 0) {
            // Retrieve saved baby image from Core Data based on id
            return UIImage()
        }
        else {
            return UIImage(named: "Boy")!
        }
    }
    
    func toggleToState(state: BabyState) {
        self.babyState = state
        switch (self.babyState) {
            case .Creating:
                self.labelTitle.text = "New Baby"
                self.viewEditImage.hidden = false
                self.imageView.image = self.imageForBaby(self.baby)
                self.textFieldName.text = ""
                self.textFieldName.hidden = false
                self.buttonAction.setTitle("Create", forState: .Normal)
                break
            case .Viewing:
                self.labelTitle.text = self.baby.name
                self.viewEditImage.hidden = true
                self.imageView.image = self.imageForBaby(self.baby)
                self.textFieldName.text = ""
                self.textFieldName.hidden = true
                self.buttonAction.setTitle("Edit", forState: .Normal)
                break
            case .Editing:
                self.labelTitle.text = "Edit \(self.baby.name)"
                self.viewEditImage.hidden = false
                self.imageView.image = self.imageForBaby(self.baby)
                self.textFieldName.hidden = false
                self.buttonAction.setTitle("Save", forState: .Normal)
                break
        }
    }
    
    func saveBabyData() {
        // Get entity description
        let babyDescription = NSEntityDescription.entityForName("BabyModel", inManagedObjectContext: moContext)!
        let babyModel: BabyModel = BabyModel(entity: babyDescription, insertIntoManagedObjectContext: moContext)
        babyModel.id = self.baby.id
        babyModel.image = UIImagePNGRepresentation(self.imageView.image!)
        
    }
    
    // Take Action Based on State of View Controller
    @IBAction func takeAction(sender: UIButton) {
        switch (self.babyState) {
            case .Creating:
                // TODO server logic to POST baby and return success or failure
                
                
                
                self.saveBabyData()
                self.toggleToState(.Viewing)
                break
            case .Viewing:
                self.toggleToState(.Editing)
                break
            case .Editing:
                // TODO server logic to UPDATE edited baby and return succes or failure
                self.toggleToState(.Viewing)
                break
        }
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
        self.imageView.image = info[UIImagePickerControllerOriginalImage] as? UIImage
        
    }
    
    // Select a pre-existing icon
    @IBAction func selectIcon(sender: UIButton) {
        self.performSegueWithIdentifier("SegueBabyToSelectIcon", sender: self)
    }
    
    // Segues
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        if (segue.identifier == "SegueBabyToSelectIcon") {
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
        if (segue.identifier == "UnwindSegueSelectIconToBaby") {
            // Any preparation for unwinding from select icon
            // new image is actually set in "prepareForSegue" of select icon VC
        }
    }
    



}
