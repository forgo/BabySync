//
//  TimerTableViewCell.swift
//  Baby Sync
//
//  Created by Elliott Richerson on 11/6/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import UIKit

class TimerTableViewCell: UITableViewCell {
    
    @IBOutlet weak var viewBackground: UIView!
    @IBOutlet weak var viewTimer: TimerView!
    @IBOutlet weak var labelElapsedTimer: UILabel!
    @IBOutlet weak var labelActivityTimer: UILabel!
    
    fileprivate func setup() {

    }
    
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        self.setup()
    }
    
    override init(style: UITableViewCellStyle, reuseIdentifier: String?) {
        super.init(style: style, reuseIdentifier: reuseIdentifier)
        self.setup()
    }
    
    func layoutForEdit(_ on: Bool) {
        if(on) {
            self.labelElapsedTimer.isHidden = true
            self.labelActivityTimer.textAlignment = NSTextAlignment.right
        }
        else {
            self.labelElapsedTimer.isHidden = false
            self.labelActivityTimer.textAlignment = NSTextAlignment.left
        }
    }
    
    func blur(_ on: Bool) {
        if(on) {
            // Blur On Animation
            UIView.animate(withDuration: 0.4, animations: { () -> Void in
                self.contentView.alpha = 0.5
                }, completion: { (finished) -> Void in
                    // Finished
            })
        }
        else {
            // Blur Off Animation
            UIView.animate(withDuration: 0.4, animations: { () -> Void in
                self.contentView.alpha = 1.0
                }, completion: { (finished) -> Void in
                    // Finished
            })
        }
    }
    
    var timer: Timer? {
        didSet {
            if let t = self.timer {
                if let activity = BabySync.activityForTimer(t) {
                    // cell.imageTimer.layer.masksToBounds = true
                    // cell.imageTimer.image = UIImage(named: acts[0].icon)
                    
                    self.viewTimer.actualElapsed = abs(t.resetDate.timeIntervalSinceNow)
                    self.viewTimer.warnElapsed = activity.warn
                    self.viewTimer.criticalElapsed = activity.critical
                    
                    self.labelActivityTimer.text = activity.name
                    self.viewTimer.setNeedsDisplay()
                }
                self.labelElapsedTimer.font = UIFont(name: "SourceCodePro-Regular", size: 26)
                self.labelElapsedTimer.attributedText = ElapsedTimeFormatter.sharedInstance.attributedString(t.resetDate)
                
                self.setNeedsDisplay()
            }
        }
    }
}
