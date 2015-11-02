//
//  TimerCollectionViewCell.swift
//  Baby Sync
//
//  Created by Elliott Richerson on 9/29/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import UIKit

class TimerCollectionViewCell: UICollectionViewCell {

    @IBOutlet weak var viewTimer: TimerView!
    @IBOutlet weak var labelElapsedTimer: UILabel!
    @IBOutlet weak var labelActivityTimer: UILabel!
    
    private var ticker: NSTimer = NSTimer()
    private var tic: Bool = true
    
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        self.ticker = NSTimer.scheduledTimerWithTimeInterval(1.0, target: self, selector: "tick", userInfo: nil, repeats: true)
    }
    
    func tick() {
        
        self.updateElapsedTime()
        
        print(self.tic ? "\(self.labelActivityTimer.text): tic" : "\(self.labelActivityTimer.text): toc")
        self.tic = !self.tic
    }
    
    func updateElapsedTime() {
        
    }
    
}
