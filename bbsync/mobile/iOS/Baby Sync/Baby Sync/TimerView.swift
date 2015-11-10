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

    private static let TAU: Double = 2.0 * M_PI
    private static let MIN_TICKS: UInt = 1
    private static let MAX_TICKS: UInt = 144
    
    private var firstDraw: Bool = true
    
    private var layerGradient: AngleGradientLayer?
    private var layerGradientOverlay: CAShapeLayer?
    private var layerMeterMaskActive: CAShapeLayer?
    private var layerMeterMaskInactive: CAShapeLayer?
    private var layerMeterCenter: CAShapeLayer?
    
    @IBInspectable var actualElapsed: Double = 52.0
    @IBInspectable var warnElapsed: Double = 45.0
    @IBInspectable var criticalElapsed: Double = 60.0
    
    @IBInspectable var color: UIColor = UIColor.blackColor()
    @IBInspectable var innerMargin: CGFloat = 0.3
    @IBInspectable var outerMargin: CGFloat = 0.1
    @IBInspectable var offColor: UIColor = UIColor.darkGrayColor()
    @IBInspectable var okColor: UIColor = UIColor.greenColor()
    @IBInspectable var warnColor: UIColor = UIColor.yellowColor()
    @IBInspectable var criticalColor: UIColor = UIColor.redColor()
    @IBInspectable var nTicks: UInt = 36
    private var nTicksActive: UInt?
    
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        self.setupBaseLayers()
    }
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        self.setupBaseLayers()
    }
    
    func setupBaseLayers() {
        self.setupGradient()
        self.setupOverlay()
        self.setupCenter()
    }
    
    func setupGradient() {
        self.layerGradient = self.createLayerGradient()
        if let gradient = self.layerGradient {
//            print("setting up gradient layer")
            gradient.removeFromSuperlayer()
            self.layer.addSublayer(gradient)
        }
    }
    
    func setupOverlay() {
        self.layerGradientOverlay = self.createLayerGradientOverlay()
        if let overlay = self.layerGradientOverlay {
//            print("setting up overlay layer")
            overlay.removeFromSuperlayer()
            self.layer.addSublayer(overlay)
        }
    }

    func setupMasks() {
        
        (self.layerMeterMaskActive, self.layerMeterMaskInactive) = self.createLayerMeterMasks()
        
        if let maskActive = self.layerMeterMaskActive,
           let maskInactive = self.layerMeterMaskInactive {
            
//            print("setting up active/inactive mask layer")
            maskActive.removeFromSuperlayer()
            maskInactive.removeFromSuperlayer()
            
            if let overlay = self.layerGradientOverlay {
                overlay.mask = maskActive
                self.layer.insertSublayer(maskInactive, above: overlay)

            }
            else {
//                print("no gradient overlay layer to mask")
            }
            
        }
    }
    
    func setupCenter() {
        self.layerMeterCenter = self.createLayerMeterCenter()
        if let center = self.layerMeterCenter {
//            print("setting up center layer")
            center.removeFromSuperlayer()
            self.layer.addSublayer(center)
        }
    }
    
    func createLayerGradient() -> AngleGradientLayer {
        let gradient: AngleGradientLayer = AngleGradientLayer()

        gradient.colors = [self.criticalColor.CGColor, self.criticalColor.CGColor, self.warnColor.CGColor, self.warnColor.CGColor, self.okColor.CGColor]
        
        gradient.frame = self.bounds

        let criticalLocation: Double = 0.0
        let warnLocation: Double = 0.75 // 1.0 - (self.warnElapsed / self.criticalElapsed)
        let okLocation: Double = 1.0
        
        let criticalThreshold: Double = criticalLocation + (warnLocation - criticalLocation) * 0.1
        let warnThreshold: Double = warnLocation + (okLocation - warnLocation) * 0.1
        
        gradient.locations = [criticalLocation, criticalThreshold, warnLocation, warnThreshold, okLocation]
        
        gradient.cornerRadius = self.bounds.width / 2.0
        gradient.transform = CATransform3DRotate(gradient.transform, CGFloat(-M_PI_2), 0.0, 0.0, 1.0)
        
        gradient.masksToBounds = true
        gradient.backgroundColor = UIColor.clearColor().CGColor
        return gradient
    }

    func createLayerGradientOverlay() -> CAShapeLayer {
        let origin: CGPoint = CGPointMake(self.frame.width/2.0, self.frame.height/2.0)
        let radius = self.frame.width/2.0
        let overlay = CAShapeLayer()
        overlay.lineWidth = 0.0
        overlay.path = UIBezierPath(arcCenter: origin, radius: radius, startAngle: 0.0, endAngle: CGFloat(M_PI * 2.0), clockwise: true).CGPath
        overlay.fillColor = self.color.CGColor
        overlay.opacity = 1.0
        overlay.backgroundColor = UIColor.clearColor().CGColor
        return overlay
    }
    
    func createLayerMeterCenter() -> CAShapeLayer {
        let origin: CGPoint = CGPointMake(self.frame.width/2.0, self.frame.height/2.0)
        let radius: CGFloat =  (self.frame.width/2.0) * self.innerMargin
        let center = CAShapeLayer()
        center.lineWidth = 0.0
        let circlePath: UIBezierPath = UIBezierPath(arcCenter: origin, radius: radius, startAngle: 0.0, endAngle: CGFloat(M_PI * 2.0), clockwise: true)
        center.path = circlePath.CGPath
        center.fillColor = self.color.CGColor
        center.opacity = 1.0
        center.backgroundColor = UIColor.clearColor().CGColor
        return center
    }
    
    func pointOnCircleWith(origin: CGPoint, radius: CGFloat, angle: Double) -> CGPoint {
        let x: CGFloat = origin.x + radius * CGFloat(cos(angle))
        let y: CGFloat = origin.y + radius * CGFloat(sin(angle))
        return CGPointMake(x, y)
    }
    
    func createMaskPaths() -> (UIBezierPath, UIBezierPath) {
        let arcAngle: Double = TimerView.TAU / Double(2 * self.nTicks)
        var startAngle: Double = arcAngle - M_PI_2
        
        let origin: CGPoint = CGPointMake(self.frame.width/2.0, self.frame.height/2.0)
        let radius: CGFloat =  (self.frame.width/2.0) * (1.0 - self.outerMargin)
        
        let activePath: UIBezierPath = UIBezierPath()
        let inactivePath: UIBezierPath = UIBezierPath()
        
        activePath.moveToPoint(origin)
        inactivePath.moveToPoint(origin)
        
        for var tick: UInt = 1; tick <= self.nTicks; ++tick {
            
            let startArcPoint: CGPoint = self.pointOnCircleWith(origin, radius: radius, angle: startAngle)

            if(tick <= self.nTicksActive) {
                activePath.addLineToPoint(startArcPoint)
                activePath.addArcWithCenter(origin, radius: radius, startAngle: CGFloat(startAngle), endAngle: CGFloat(startAngle+arcAngle), clockwise: true)
                activePath.addLineToPoint(origin)
            }
            else {
                inactivePath.addLineToPoint(startArcPoint)
                inactivePath.addArcWithCenter(origin, radius: radius, startAngle: CGFloat(startAngle), endAngle: CGFloat(startAngle+arcAngle), clockwise: true)
                inactivePath.addLineToPoint(origin)
            }

            startAngle += arcAngle * 2.0
        }
        activePath.closePath()
        inactivePath.closePath()
        
        return (activePath, inactivePath)
    }
    
    func createLayerMeterMasks() -> (CAShapeLayer?, CAShapeLayer?) {
        let activePath: UIBezierPath = UIBezierPath(roundedRect: self.bounds, cornerRadius: 0)
        
        let (activeMaskPath, inactiveMaskPath) = self.createMaskPaths()
        
        activePath.usesEvenOddFillRule = true
        activePath.appendPath(activeMaskPath)
    
        let activeMask: CAShapeLayer = CAShapeLayer()
        activeMask.path = activePath.CGPath
        activeMask.fillRule = kCAFillRuleEvenOdd
        activeMask.fillColor = UIColor.blackColor().CGColor
        activeMask.opacity = 1.0
        
        let inactiveMask: CAShapeLayer = CAShapeLayer()
        inactiveMask.path = inactiveMaskPath.CGPath
        inactiveMask.fillColor = self.offColor.CGColor
        inactiveMask.opacity = 0.9
        
        return (activeMask, inactiveMask)
    }
    

    func nTicksActiveChanged() -> Bool {
        var percentDone: Double = self.actualElapsed / self.criticalElapsed
        if(percentDone < 0.0) {
            percentDone = 0.0
        }
        else if(percentDone > 1.0) {
            percentDone = 1.0
        }
        
        // Constrain to positive, non-zero ticks in timer
        if(self.nTicks < TimerView.MIN_TICKS) {
            self.nTicks = TimerView.MIN_TICKS
        }
        // Constrain ticks to reasonable upper limit for drawing performance
        else if(self.nTicks > TimerView.MAX_TICKS) {
            self.nTicks = TimerView.MAX_TICKS
        }
        
        let nTicksActiveNew = UInt(floor(Double(self.nTicks) * percentDone))
        if let nTicksActive = self.nTicksActive {
            if(nTicksActive != nTicksActiveNew) {
                self.nTicksActive = nTicksActiveNew
                return true
            }
            else {
                return false
            }
        }
        else {
            self.nTicksActive = nTicksActiveNew
            return true
        }
    }
    
    override func drawRect(rect: CGRect) {
//        let startTime: CFAbsoluteTime = CFAbsoluteTimeGetCurrent()
        
        let nTicksActiveChanged: Bool = self.nTicksActiveChanged()
        
        if(self.firstDraw) {
            self.firstDraw = false
            self.setupBaseLayers()
            self.setupMasks()
        }
        else if(nTicksActiveChanged) {
            self.setupBaseLayers()
            self.setupMasks()
        }
        
//        let ms = 1000.0 * (CFAbsoluteTimeGetCurrent() - startTime)
//        print("drawRect takes: \(ms)ms")
    }
    


}