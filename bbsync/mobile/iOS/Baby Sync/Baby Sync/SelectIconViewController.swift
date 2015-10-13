//
//  SelectIconViewController.swift
//  Baby Sync
//
//  Created by Elliott Richerson on 10/4/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import UIKit

class SelectIconViewController: UIViewController, UICollectionViewDataSource, UICollectionViewDelegate {
    
    var iconAssets: [String] = ["Air Balloon","Angel","Apple","Baby Monitor","Ball","Balloon","Bathtub","Bear","Bee","Bib","Bird","Boat","Bottle","Boy","Butterfly","Button","Cake","Candy","Car","Castle","Cat","Cherries","Chick","Clown","Cow","Crab","Cutlery","Diaper Pin","Diaper","Dice","Dog","Doll","Doughnut","Duck","Elephant","Feet","Fish","Flower","Food","Frog","Gift Tie","Gift","Gingerbread Man","Giraffe","Girl","Guitar","Heart","Helicopter","Hippo","Horse","Ice Cream","Jellyfish","Kite","Ladybug","Lion","Lollipop","Magic Hat","Monkey","Mouse","Notebook","Nursing","Owl Sleeping","Owl","Pacifier","Pail and Shovel","Paint Kit","Panda","Penguin","Pig","Plane","Pram","Pumping","Rabbit","Rattle","Reindeer","Rocket","Rocking Horse","Saturn","Seahorse","Sheep","Shoes","Sleep","Sleeping Baby","Sleepsuit","Slice of Cake","Smiling Boy","Smiling Girl","Snail","Socks","Star","Strawberry","Submarine","Tooth","Tower Toy","Train","Walruses","Watering Can","Whale","Whipping-top","Winter Cap"]
    
    var selectedIconAsset: String?
    
    @IBOutlet weak var collectionIcons: UICollectionView!
    

    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    // UICollectionViewDataSource
    func collectionView(collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        if (collectionView == self.collectionIcons) {
            return self.iconAssets.count
        }
        else {
            return 0
        }
    }
    
    func collectionView(collectionView: UICollectionView, cellForItemAtIndexPath indexPath: NSIndexPath) -> UICollectionViewCell {
        
        if(collectionView == self.collectionIcons) {
            let cell: IconCollectionViewCell = collectionView.dequeueReusableCellWithReuseIdentifier("IconCell", forIndexPath: indexPath) as! IconCollectionViewCell

            cell.asset = self.iconAssets[indexPath.row]
            cell.imageIcon.layer.masksToBounds = true
            cell.imageIcon.image = UIImage(named: self.iconAssets[indexPath.row])
            
            if(cell.selected) {
                cell.backgroundColor = UIColor.orangeColor()
            }
            
            return cell
        }
        else {
            return UICollectionViewCell();
        }
        
        
    }
    
    func numberOfSectionsInCollectionView(collectionView: UICollectionView) -> Int {
        if (collectionView == self.collectionIcons) {
            return 1
        }
        else {
            return 0
        }
    }
    
    // UICollectionViewDelegate
//    func collectionView(collectionView: UICollectionView, didSelectItemAtIndexPath indexPath: NSIndexPath) {
//        if (collectionView == self.collectionIcons) {
//            let cell: IconCollectionViewCell = collectionView.cellForItemAtIndexPath(indexPath) as! IconCollectionViewCell
//            self.performSegueWithIdentifier("UnwindSegueSelectIcon", sender: cell)
//        }
//    }
    
    // Segues
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        if (segue.identifier == "UnwindSegueSelectIconToBaby") {
            let babyVC: BabyViewController = segue.destinationViewController as! BabyViewController
            let selectedCell: IconCollectionViewCell = sender as! IconCollectionViewCell
            babyVC.imageView.image = selectedCell.imageIcon.image
        }
    }

}
