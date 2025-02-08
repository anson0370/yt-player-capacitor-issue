//
//  MyViewController.swift
//  PodwiseAI
//
//  Created by 陈云飞 on 2024/7/24.
//

import UIKit
import Capacitor
import AVFAudio

class MyViewController: CAPBridgeViewController {
  override open func capacitorDidLoad() {
  }
  
  override func webViewConfiguration(for instanceConfiguration: InstanceConfiguration) -> WKWebViewConfiguration {
    let config = super.webViewConfiguration(for: instanceConfiguration)
    config.allowsInlineMediaPlayback = true
    config.mediaTypesRequiringUserActionForPlayback = []
    return config
  }
  
  override func viewDidLoad() {
    super.viewDidLoad()

    // Do any additional setup after loading the view.
    webView?.allowsBackForwardNavigationGestures = true
    
    do {
      let audioSession = AVAudioSession.sharedInstance()
      try audioSession.setCategory(.playback, mode: .moviePlayback) // 设置 mode 更精确
      try audioSession.setActive(true) // 显式激活
      print("AudioSession category set successfully")
    } catch let error as NSError {
      print("Error setting audio session category: \(error.localizedDescription)")
    }
  }
}
