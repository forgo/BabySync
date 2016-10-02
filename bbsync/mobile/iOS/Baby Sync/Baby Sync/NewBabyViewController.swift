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
        self.imageBaby.image = info[UIImagePickerControllerOriginalImage] as? UIImage
        
    }
    
    // Select a pre-existing icon
    @IBAction func selectIcon(_ sender: UIButton) {
        self.performSegue(withIdentifier: "SegueNewBabyToSelectIcon", sender: self)
    }
    
    // Segues
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        if (segue.identifier == "SegueNewBabyToSelectIcon") {
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
        if (segue.identifier == "UnwindSegueSelectIconToNewBaby") {
            // Any preparation for unwinding from select icon
            // new image is actually set in "prepareForSegue" of select icon VC
        }
    }

    
}
