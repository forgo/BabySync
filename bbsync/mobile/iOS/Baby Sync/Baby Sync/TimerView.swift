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
    
    @IBInspectable var actualElapsed: Double = 15.0
    @IBInspectable var warnElapsed: Double = 45.0
    @IBInspectable var criticalElapsed: Double = 60.0
    
    @IBInspectable var bgColor: UIColor = UIColor.whiteColor()
    @IBInspectable var borderColor: UIColor = UIColor.blackColor()
    @IBInspectable var borderThickness: CGFloat = 5.0
    @IBInspectable var fillColor: UIColor = UIColor.purpleColor()
    @IBInspectable var okColor: UIColor = UIColor.blackColor()
    @IBInspectable var warnColor: UIColor = UIColor.yellowColor()
    @IBInspectable var criticalColor: UIColor = UIColor.redColor()
    
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
        let radius = (self.frame.width - self.borderThickness)/2.0
        let overlay = CAShapeLayer()
        overlay.bounds = gradientLayer.bounds
        overlay.position = gradientLayer.position
        overlay.lineWidth = self.borderThickness
        overlay.path = UIBezierPath(arcCenter: self.center, radius: radius, startAngle: 0.0, endAngle: CGFloat(M_PI * 2.0), clockwise: true).CGPath
        overlay.strokeStart = 0.0
        overlay.strokeEnd = 1.0
        overlay.strokeColor = self.borderColor.CGColor
        overlay.fillColor = self.fillColor.CGColor
        overlay.opacity = 1.0
        overlay.backgroundColor = UIColor.blackColor().CGColor
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
        let nSlices: UInt = 60
        
        let arcAngle: Double = tau / Double(nSlices)
        var startAngle: Double = arcAngle
        var endAngle: Double = tau
        if(percentElapsed < 1.0) {
            endAngle = percentElapsed * tau
        }
        
        assert((nSlices > 1) && (nSlices % 2 == 0), "nSlices for TimerView should be a positive even number")
        
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
        let center = CGPointMake(overlay.frame.width/2.0, overlay.frame.height/2.0)
        let radius: CGFloat =  self.frame.width/2.0 - self.borderThickness/2.0
        
        let path: UIBezierPath = UIBezierPath(roundedRect: overlay.bounds, cornerRadius: 0)
        let maskPath: UIBezierPath = self.maskPath(0.25, center: center, radius: radius)
        
        path.usesEvenOddFillRule = true

        path.appendPath(maskPath)
        
        
        
        let mask: CAShapeLayer = CAShapeLayer()
        mask.path = path.CGPath
//        mask.frame = overlay.bounds
//        mask.path = maskPath.CGPath
        mask.fillRule = kCAFillRuleEvenOdd
        mask.fillColor = UIColor.blackColor().CGColor
        mask.opacity = 1.0
        
//        overlay.addSublayer(mask)

        overlay.mask = mask
        
        //



//        [path appendPath:circlePath];
//        [path setUsesEvenOddFillRule:YES];
//        
//        CAShapeLayer *fillLayer = [CAShapeLayer layer];
//        fillLayer.path = path.CGPath;
//        fillLayer.fillRule = kCAFillRuleEvenOdd;
//        fillLayer.fillColor = [UIColor grayColor].CGColor;
//        fillLayer.opacity = 0.5;
//        [view.layer addSublayer:fillLayer];
        
        
    }
    
    override func drawRect(rect: CGRect) {
        let gradientLayer = self.drawGradient()
        let overlay = self.drawMeterOverlay(gradientLayer)
        self.drawMeterMask(overlay)
    }
    


}