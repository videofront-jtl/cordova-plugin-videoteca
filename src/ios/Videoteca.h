#import <Foundation/Foundation.h>
#import <MediaPlayer/MediaPlayer.h>
#import <Cordova/CDVPlugin.h>
#import <AVFoundation/AVFoundation.h>

@interface Videoteca : CDVPlugin
@property (nonatomic, strong) AVAudioSession* avSession;

- (void)fullscreenOn:(CDVInvokedUrlCommand*)command;
- (void)fullscreenOff:(CDVInvokedUrlCommand*)command;
- (void)appdata:(CDVInvokedUrlCommand*)command;

@end
