//
//  TimerView.swift
//  Baby Sync
//
//  Created by Elliott Richerson on 10/31/15.
//  Copyright © 2015 Elliott Richerson. All rights reserved.
//

import AngleGradientLayer
import UIKit

@IBDesignable
class TimerView: UIView {
    
    @IBInspectable var actualElapsed: Double = 52.0
    @IBInspectable var warnElapsed: Double = 45.0
    @IBInspectable var criticalElapsed: Double = 60.0
    
    @IBInspectable var color: UIColor = UIColor.blackColor()
    @IBInspectable var innerMargin: CGFloat = 0.3
    @IBInspectable var outerMargin: CGFloat = 0.1
    @IBInspectable var okColor: UIColor = UIColor.greenColor()
    @IBInspectable var warnColor: UIColor = UIColor.yellowColor()
    @IBInspectable var criticalColor: UIColor = UIColor.redColor()
    @IBInspectable var nTicks: Int = 36
    
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
    }
    
    override init(frame: CGRect) {
        super.init(frame: frame)
    }
    
    func drawGradient() -> AngleGradientLayer {
        let gradient: AngleGradientLayer = AngleGradientLayer()
        gradient.bounds = self.bounds
        gradient.position = self.center
        
        gradient.colors = [self.criticalColor.CGColor, self.criticalColor.CGColor, self.warnColor.CGColor, self.warnColor.CGColor, self.okColor.CGColor]

        let criticalLocation: Double = 0.0
        let warnLocation: Double = 1.0 - (self.warnElapsed / self.criticalElapsed)
        let okLocation: Double = 1.0
        
        let criticalThreshold: Double = criticalLocation + (warnLocation - criticalLocation) * 0.1
        let warnThreshold: Double = warnLocation + (okLocation - warnLocation) * 0.1
        
        gradient.locations = [criticalLocation, criticalThreshold, warnLocation, warnThreshold, okLocation]
        
        gradient.cornerRadius = self.bounds.width / 2.0
        gradient.transform = CATransform3DRotate(gradient.transform, CGFloat(-M_PI_2), 0.0, 0.0, 1.0)
        
        gradient.masksToBounds = true
        gradient.backgroundColor = UIColor.clearColor().CGColor
        layer.addSublayer(gradient)
        return gradient
    }

    func drawMeterOverlay(gradientLayer: AngleGradientLayer) -> CAShapeLayer {
        let radius = self.frame.width/2.0
        let overlay = CAShapeLayer()
        overlay.bounds = gradientLayer.bounds
        overlay.position = gradientLayer.position
        overlay.lineWidth = 0.0
        overlay.path = UIBezierPath(arcCenter: self.center, radius: radius, startAngle: 0.0, endAngle: CGFloat(M_PI * 2.0), clockwise: true).CGPath
        overlay.fillColor = self.color.CGColor
        overlay.opacity = 1.0
        overlay.backgroundColor = UIColor.clearColor().CGColor
        gradientLayer.addSublayer(overlay)
        return overlay
    }
    
    func pointOnCircleWith(center: CGPoint, radius: CGFloat, angle: Double) -> CGPoint {
        let x: CGFloat = center.x + radius * CGFloat(cos(angle))
        let y: CGFloat = center.y + radius * CGFloat(sin(angle))
        return CGPointMake(x, y)
    }
    
    func maskPath(percentElapsed: Double, center: CGPoint, radius: CGFloat) -> UIBezierPath {
        let tau: Double = 2.0 * M_PI
        
        var nSlices: UInt = UInt(self.nTicks * 2)
        
        if(nSlices < 2) {
            nSlices = 2
        }
        else if(nSlices > 288) {
            nSlices = 288
        }
        
        let arcAngle: Double = tau / Double(nSlices)
        var startAngle: Double = arcAngle
        var endAngle: Double = tau
        if(percentElapsed < 1.0) {
            endAngle = percentElapsed * tau
        }
        
        
        let piePath: UIBezierPath = UIBezierPath()

        while startAngle < endAngle {
            piePath.moveToPoint(center)
            let startArcPoint: CGPoint = self.pointOnCircleWith(center, radius: radius, angle: startAngle)
            piePath.addLineToPoint(center)
            piePath.addLineToPoint(startArcPoint)
            piePath.addArcWithCenter(center, radius: radius, startAngle: CGFloat(startAngle), endAngle: CGFloat(startAngle+arcAngle), clockwise: true)
            piePath.addLineToPoint(center)
            startAngle += arcAngle * 2.0
        }
        piePath.closePath()
        return piePath
    }
    
    func drawMeterMask(overlay: CAShapeLayer) {
    
        let percentDone: Double = self.actualElapsed / self.criticalElapsed
        
        let center = CGPointMake(overlay.frame.width/2.0, overlay.frame.height/2.0)
        let radius: CGFloat =  (self.frame.width/2.0) * (1.0 - self.outerMargin)
        
        let path: UIBezierPath = UIBezierPath(roundedRect: overlay.bounds, cornerRadius: 0)
        let maskPath: UIBezierPath = self.maskPath(percentDone, center: center, radius: radius)
        
        path.usesEvenOddFillRule = true
        path.appendPath(maskPath)
    
        let mask: CAShapeLayer = CAShapeLayer()
        mask.path = path.CGPath
        mask.fillRule = kCAFillRuleEvenOdd
        mask.fillColor = UIColor.blackColor().CGColor
        mask.opacity = 1.0
        overlay.mask = mask
    }
    
    func drawMeterCenter(overlay: CAShapeLayer) -> CAShapeLayer {
        let radius: CGFloat =  (self.frame.width/2.0) * self.innerMargin
        let hole = CAShapeLayer()
        hole.bounds = overlay.bounds
        hole.position = overlay.position
        hole.lineWidth = 0.0
        let circlePath: UIBezierPath = UIBezierPath(arcCenter: self.center, radius: radius, startAngle: 0.0, endAngle: CGFloat(M_PI * 2.0), clockwise: true)
        hole.path = circlePath.CGPath
        hole.fillColor = self.color.CGColor
        hole.opacity = 1.0
        hole.backgroundColor = UIColor.clearColor().CGColor
        self.layer.addSublayer(hole)
        return hole
    }
    
    override func drawRect(rect: CGRect) {
        let gradientLayer = self.drawGradient()
        let overlay = self.drawMeterOverlay(gradientLayer)
        self.drawMeterMask(overlay)
        _ = self.drawMeterCenter(overlay)

        
        
    }
    


}