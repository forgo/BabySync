//
//  BabyCollectionViewCell.swift
//  Baby Sync
//
//  Created by Elliott Richerson on 9/29/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import UIKit

class BabyCollectionViewCell: UICollectionViewCell {
    @IBOutlet weak var imageBaby: UIImageView!
    @IBOutlet weak var labelBaby: UILabel!
    
    var baby: Baby? {
        didSet {
            if let b = self.baby {
                self.imageBaby.layer.masksToBounds = true
                self.imageBaby.image = UIImage(named: "Boy")
                self.labelBaby.text = b.name
                if(self.isSelected) {
                    self.labelBaby.backgroundColor = UIColor.orange
                }
            }
        }
    }
    
}
