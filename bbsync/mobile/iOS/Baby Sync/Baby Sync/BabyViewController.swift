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
    case creating
    case viewing
    case editing
}

class BabyViewController: UIViewController, UINavigationControllerDelegate, UIImagePickerControllerDelegate {
    
    let moContext = (UIApplication.shared.delegate as! AppDelegate).managedObjectContext
    
    var imagePicker: UIImagePickerController = UIImagePickerController()
    
    var alert: UIAlertController = UIAlertController()
    var alertAction: UIAlertAction = UIAlertAction()
    
    @IBOutlet weak var labelTitle: UILabel!
    @IBOutlet weak var viewEditImage: UIView!
    @IBOutlet weak var imageView: UIImageView!
    @IBOutlet weak var textFieldName: UITextField!
    @IBOutlet weak var buttonBack: UIButton!
    @IBOutlet weak var buttonAction: UIButton!
    
    var babyState: BabyState = .viewing
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
    
    func imageForBaby(_ baby: Baby) -> UIImage {
        if (baby.id > 0) {
            // Retrieve saved baby image from Core Data based on id
            return UIImage()
        }
        else {
            return UIImage(named: "Boy")!
        }
    }
    
    func toggleToState(_ state: BabyState) {
        self.babyState = state
        switch (self.babyState) {
            case .creating:
                self.labelTitle.text = "New Baby"
                self.viewEditImage.isHidden = false
                self.imageView.image = self.imageForBaby(self.baby)
                self.textFieldName.text = ""
                self.textFieldName.isHidden = false
                self.buttonAction.setTitle("Create", for: UIControlState())
                break
            case .viewing:
                self.labelTitle.text = self.baby.name
                self.viewEditImage.isHidden = true
                self.imageView.image = self.imageForBaby(self.baby)
                self.textFieldName.text = ""
                self.textFieldName.isHidden = true
                self.buttonAction.setTitle("Edit", for: UIControlState())
                break
            case .editing:
                self.labelTitle.text = "Edit \(self.baby.name)"
                self.viewEditImage.isHidden = false
                self.imageView.image = self.imageForBaby(self.baby)
                self.textFieldName.isHidden = false
                self.buttonAction.setTitle("Save", for: UIControlState())
                break
        }
    }
    
    func saveBabyData() {
        // Get entity description
        let babyDescription = NSEntityDescription.entity(forEntityName: "BabyModel", in: moContext)!
        let babyModel: BabyModel = BabyModel(entity: babyDescription, insertInto: moContext)
        babyModel.id = self.baby.id as NSNumber?
        babyModel.image = UIImagePNGRepresentation(self.imageView.image!)
        
    }
    
    // Take Action Based on State of View Controller
    @IBAction func takeAction(_ sender: UIButton) {
        switch (self.babyState) {
            case .creating:
                // TODO server logic to POST baby and return success or failure
                
                
                
                self.saveBabyData()
                self.toggleToState(.viewing)
                break
            case .viewing:
                self.toggleToState(.editing)
                break
            case .editing:
                // TODO server logic to UPDATE edited baby and return succes or failure
                self.toggleToState(.viewing)
                break
        }
    }
    
    // Make a Custom Photo
    @IBAction func takePhoto(_ sender: UIButton) {
        if (UIImagePickerController.isSourceTypeAvailable(.camera)) {
            self.imagePicker.delegate = self
            self.imagePicker.sourceType = .camera
            self.present(imagePicker, animated: true, completion: { () -> Void in
                //
            })
        }
        else {
            self.alert = UIAlertController(title: "Simulator", message: "Camera not available.", preferredStyle: UIAlertControllerStyle.alert)
            self.alertAction = UIAlertAction(title: "Ok", style: UIAlertActionStyle.default, handler: { (action) -> Void in
            })
            self.alert.addAction(self.alertAction)
            self.present(self.alert, animated: true, completion: nil)
        }
    }
    
    func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [String : Any]) {
        self.imagePicker.dismiss(animated: true) { () -> Void in
            //
        }
        self.imageView.image = info[UIImagePickerControllerOriginalImage] as? UIImage
        
    }
    
    // Select a pre-existing icon
    @IBAction func selectIcon(_ sender: UIButton) {
        self.performSegue(withIdentifier: "SegueBabyToSelectIcon", sender: self)
    }
    
    // Segues
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        if (segue.identifier == "SegueBabyToSelectIcon") {
            // Any preparation for segue to icon selection
        }
        else if (segue.identifier == "UnwindSegueNewBabyToHome") {
            // Any preparation for unwinding to home
            let homeVC: HomeViewController = segue.destination as! HomeViewController
            // Add babies
            // Add timers
            // Reload collections
            homeVC.reloadCollections()
        }
    }
    
    @IBAction func prepareForUnwindSelectIcon(_ segue: UIStoryboardSegue) {
        if (segue.identifier == "UnwindSegueSelectIconToBaby") {
            // Any preparation for unwinding from select icon
            // new image is actually set in "prepareForSegue" of select icon VC
        }
    }
    



}
