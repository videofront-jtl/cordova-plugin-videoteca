/*
  Copyright 2013-2017 appPlant GmbH

  Licensed to the Apache Software Foundation (ASF) under one
  or more contributor license agreements.  See the NOTICE file
  distributed with this work for additional information
  regarding copyright ownership.  The ASF licenses this file
  to you under the Apache License, Version 2.0 (the
  "License"); you may not use this file except in compliance
  with the License.  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing,
  software distributed under the License is distributed on an
  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, either express or implied.  See the License for the
  specific language governing permissions and limitations
  under the License.
*/

#import "APPMethodMagic.h"
#import "APPBackgroundMode.h"
#import <Cordova/CDVAvailability.h>

@implementation APPBackgroundMode

#pragma mark -
#pragma mark Constants

NSString* const kAPPBackgroundJsNamespace = @"cordova.plugins.backgroundMode";
NSString* const kAPPBackgroundEventActivate = @"activate";
NSString* const kAPPBackgroundEventDeactivate = @"deactivate";

#pragma mark -
#pragma mark Life Cycle

/**
 * Called by runtime once the Class has been loaded.
 * Exchange method implementations to hook into their execution.
 */
+ (void) load
{
    [self swizzleWKWebViewEngine];
}

/**
 * Initialize the plugin.
 */
- (void) pluginInitialize
{
    enabled = NO;
    [self observeLifeCycle];
}

/**
 * Register the listener for pause and resume events.
 */
- (void) observeLifeCycle
{
    NSNotificationCenter* listener = [NSNotificationCenter
                                      defaultCenter];

        [listener addObserver:self
                     selector:@selector(keepAwake)
                         name:UIApplicationDidEnterBackgroundNotification
                       object:nil];

        [listener addObserver:self
                     selector:@selector(stopKeepingAwake)
                         name:UIApplicationWillEnterForegroundNotification
                       object:nil];

        [listener addObserver:self
                     selector:@selector(handleAudioSessionInterruption:)
                         name:AVAudioSessionInterruptionNotification
                       object:nil];
}

#pragma mark -
#pragma mark Interface

/**
 * Enable the mode to stay awake
 * when switching to background for the next time.
 */
- (void) enable:(CDVInvokedUrlCommand*)command
{
    if (enabled)
        return;

    enabled = YES;
    [self execCallback:command];
}

/**
 * Disable the background mode
 * and stop being active in background.
 */
- (void) disable:(CDVInvokedUrlCommand*)command
{
    if (!enabled)
        return;

    enabled = NO;
    [self stopKeepingAwake];
    [self execCallback:command];
}

#pragma mark -
#pragma mark Core

/**
 * Keep the app awake.
 */
- (void) keepAwake
{
    if (!enabled)
        return;
}

/**
 * Let the app going to sleep.
 */
- (void) stopKeepingAwake
{
    if (TARGET_IPHONE_SIMULATOR) {
        NSLog(@"BackgroundMode: On simulator apps never pause in background!");
    }
}

#pragma mark -
#pragma mark Helper

/**
 * Simply invokes the callback without any parameter.
 */
- (void) execCallback:(CDVInvokedUrlCommand*)command
{
    CDVPluginResult *result = [CDVPluginResult
                               resultWithStatus:CDVCommandStatus_OK];

    [self.commandDelegate sendPluginResult:result
                                callbackId:command.callbackId];
}

/**
 * Restart playing sound when interrupted by phone calls.
 */
- (void) handleAudioSessionInterruption:(NSNotification*)notification
{
    [self keepAwake];
}

/**
 * Find out if the app runs inside the webkit powered webview.
 */
+ (BOOL) isRunningWebKit
{
    return IsAtLeastiOSVersion(@"8.0") && NSClassFromString(@"CDVWKWebViewEngine");
}

#pragma mark -
#pragma mark Swizzling

/**
 * Method to swizzle.
 */
+ (NSString*) wkProperty
{
    NSString* str = @"X2Fsd2F5c1J1bnNBdEZvcmVncm91bmRQcmlvcml0eQ==";
    NSData* data  = [[NSData alloc] initWithBase64EncodedString:str options:0];

    return [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
}

/**
 * Swizzle some implementations of CDVWKWebViewEngine.
 */
+ (void) swizzleWKWebViewEngine
{
    if (![self isRunningWebKit])
        return;

    Class wkWebViewEngineCls = NSClassFromString(@"CDVWKWebViewEngine");
    SEL selector = NSSelectorFromString(@"createConfigurationFromSettings:");

    SwizzleSelectorWithBlock_Begin(wkWebViewEngineCls, selector)
    ^(CDVPlugin *self, NSDictionary *settings) {
        id obj = ((id (*)(id, SEL, NSDictionary*))_imp)(self, _cmd, settings);

        [obj setValue:[NSNumber numberWithBool:YES]
               forKey:[APPBackgroundMode wkProperty]];

        [obj setValue:[NSNumber numberWithBool:NO]
               forKey:@"requiresUserActionForMediaPlayback"];

        return obj;
    }
    SwizzleSelectorWithBlock_End;
}

@end
