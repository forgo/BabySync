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
    @IBInspectable var okColor: UIColor = UIColor.blackColor()
    @IBInspectable var warnColor: UIColor = UIColor.yellowColor()
    @IBInspectable var criticalColor: UIColor = UIColor.redColor()
    
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
    }
    
    override init(frame: CGRect) {
        super.init(frame: frame)
    }
    
    func gradientFrom(percentWarn: Double, percentCritical: Double) {
//        let gradient: CAGradientLayer = CAGradientLayer()
//        
//        let gradientThickness: CGFloat = 10.0
//        let gradientCircumference: CGFloat = CGFloat(M_PI) * self.bounds.width
//        
//        gradient.bounds = CGRectMake(0, 0, gradientCircumference, gradientThickness)
//        gradient.position = self.center
//        gradient.colors = [self.okColor.CGColor, self.warnColor.CGColor, self.criticalColor.CGColor]
//        let warnLocation: NSNumber = NSNumber(double: self.warnElapsed / self.criticalElapsed)
//        gradient.locations = [0.0, warnLocation, 1.0]
//        gradient.startPoint = CGPointMake(0.0, 0.5)
//        gradient.endPoint = CGPointMake(0.5, 0.5)
        
        let gradient: AngleGradientLayer = AngleGradientLayer()
        gradient.bounds = self.bounds
        gradient.position = self.center
        gradient.colors = [self.criticalColor.CGColor, self.warnColor.CGColor, self.okColor.CGColor]
        let warnLocation: NSNumber = NSNumber(double: self.warnElapsed / self.criticalElapsed)
        gradient.locations = [0.0, warnLocation, 1.0]

        gradient.cornerRadius = self.bounds.width / 2.0
        gradient.transform = CATransform3DRotate(gradient.transform, CGFloat(-M_PI_2), 0.0, 0.0, 1.0)
        
        
        layer.addSublayer(gradient)
    }

    func addOval(lineWidth: CGFloat, path: CGPathRef, strokeStart: CGFloat, strokeEnd: CGFloat, strokeColor: UIColor, fillColor: UIColor, shadowRadius: CGFloat, shadowOpacity: Float, shadowOffsset: CGSize) {
        
        let arc = CAShapeLayer()
        arc.lineWidth = lineWidth
        arc.path = path
        arc.strokeStart = strokeStart
        arc.strokeEnd = strokeEnd
        arc.strokeColor = strokeColor.CGColor
        arc.fillColor = fillColor.CGColor
        arc.shadowColor = UIColor.blackColor().CGColor
        arc.shadowRadius = shadowRadius
        arc.shadowOpacity = shadowOpacity
        arc.shadowOffset = shadowOffsset
        layer.addSublayer(arc)
    }
    
    func addBackgroundCircle() {
        

        
        
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
        layer.addSublayer(gradient)

        
        
        let radius = (self.frame.width - self.borderThickness)/2.0
        
        let bgCircle = CAShapeLayer()
        bgCircle.lineWidth = self.borderThickness
        bgCircle.path = UIBezierPath(arcCenter: self.center, radius: radius, startAngle: 0.0, endAngle: CGFloat(M_PI * 2.0), clockwise: true).CGPath
        bgCircle.strokeStart = 0.0
        bgCircle.strokeEnd = 1.0
        bgCircle.strokeColor = self.borderColor.CGColor
        bgCircle.fillColor = UIColor.clearColor().CGColor
        bgCircle.shadowColor = UIColor.darkGrayColor().CGColor
        bgCircle.shadowRadius = 3.0
        bgCircle.shadowOpacity = 0.5
        bgCircle.shadowOffset = CGSizeMake(2, 2)
        bgCircle.backgroundColor = UIColor.clearColor().CGColor
        gradient.addSublayer(bgCircle)
        
    }
    
    func addCirle(arcRadius: CGFloat, capRadius: CGFloat, color: UIColor, fillColor: UIColor) {
        let X = CGRectGetMidX(self.bounds)
        let Y = CGRectGetMidY(self.bounds)
        
        // Bottom Oval
        let pathBottom = UIBezierPath(ovalInRect: CGRectMake((X - (arcRadius/2)), (Y - (arcRadius/2)), arcRadius, arcRadius)).CGPath
        self.addOval(20.0, path: pathBottom, strokeStart: 0, strokeEnd: 0.5, strokeColor: color, fillColor: fillColor, shadowRadius: 0, shadowOpacity: 0, shadowOffsset: CGSizeZero)
        
        // Middle Cap
        let pathMiddle = UIBezierPath(ovalInRect: CGRectMake((X - (capRadius/2)) - (arcRadius/2), (Y - (capRadius/2)), capRadius, capRadius)).CGPath
        self.addOval(0.0, path: pathMiddle, strokeStart: 0, strokeEnd: 1.0, strokeColor: color, fillColor: color, shadowRadius: 5.0, shadowOpacity: 0.5, shadowOffsset: CGSizeZero)
        
        // Top Oval
        let pathTop = UIBezierPath(ovalInRect: CGRectMake((X - (arcRadius/2)), (Y - (arcRadius/2)), arcRadius, arcRadius)).CGPath
        self.addOval(20.0, path: pathTop, strokeStart: 0.5, strokeEnd: 1.0, strokeColor: color, fillColor: fillColor, shadowRadius: 0, shadowOpacity: 0, shadowOffsset: CGSizeZero)
        
    }
    
    override func drawRect(rect: CGRect) {

        let percentWarning: Double = self.actualElapsed / self.warnElapsed
        let percentCritical: Double = self.actualElapsed / self.criticalElapsed
        
        var shouldWarn: Bool = false
        var shouldAlarm: Bool = false
        
        if(percentWarning >= 1) {
            shouldWarn = true
        }
        
        if(percentCritical >= 1) {
            shouldAlarm = true
        }
        
//        self.gradientFrom(percentWarning, percentCritical: percentCritical)
//        self.clipsToBounds = true

        self.addBackgroundCircle()
//        self.clipsToBounds = true

        

//        self.addCirle(self.frame.width / 2.0, capRadius: 0.0, color: UIColor.greenColor(), fillColor: self.bgColor)
//        self.addCirle(80, capRadius: 20, color: self.warnColor, fillColor: UIColor.clearColor())
//        self.addCirle(150, capRadius: 20, color: self.criticalColor, fillColor: UIColor.clearColor())
    }
    


}