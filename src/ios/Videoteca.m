#include <sys/types.h>
#include <sys/sysctl.h>
#include "TargetConditionals.h"
#import "Videoteca.h"
#import <Cordova/CDV.h>

@interface Videoteca()
- (void)parseOptions:(NSDictionary *) options type:(NSString *) type;
@end

@implementation Videoteca {
    NSString* callbackId;
}

-(void)parseOptions:(NSDictionary *)options type:(NSString *) type {

}

- (void)fullscreenOn:(CDVInvokedUrlCommand*)command{

}
- (void)fullscreenOff:(CDVInvokedUrlCommand*)command{

}


-(void)appdata:(CDVInvokedUrlCommand *) command {
    NSDictionary* deviceProperties = [self deviceProperties];
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:deviceProperties];

    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (NSDictionary*)deviceProperties {
    UIDevice* device = [UIDevice currentDevice];

    return @{
             @"appName"              : [self getAppName ],
             @"appPackageName"       : [self getPackageName ],
             @"appVersionNumber"     : [self getVersionNumber ],

             @"platformUUID"         : [self uniqueAppInstanceIdentifier:device],
             @"platformVersion"      : [device systemVersion],
             @"platformName"         : @"iOS",
             @"platformModel"        : [self modelVersion],
             @"platformManufacturer" : @"Apple",
             @"platformIsVirtual"    : @([self isVirtual])
             };
}

- (NSString*)getAppName {
    return [[[NSBundle mainBundle]infoDictionary]objectForKey :@"CFBundleDisplayName"];
}
- (NSString*)getPackageName {
    return [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleIdentifier"];
}
- (NSString*)getVersionNumber {
    return [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleShortVersionString"];
}

- (NSString*)modelVersion {
    size_t size;

    sysctlbyname("hw.machine", NULL, &size, NULL, 0);
    char* machine = malloc(size);
    sysctlbyname("hw.machine", machine, &size, NULL, 0);
    NSString* platform = [NSString stringWithUTF8String:machine];
    free(machine);

    return platform;
}
- (NSString*)uniqueAppInstanceIdentifier:(UIDevice*)device {
    NSUserDefaults* userDefaults = [NSUserDefaults standardUserDefaults];
    static NSString* UUID_KEY = @"CDVUUID";

    // Check user defaults first to maintain backwards compaitibility with previous versions
    // which didn't user identifierForVendor
    NSString* app_uuid = [userDefaults stringForKey:UUID_KEY];
    if (app_uuid == nil) {
        if ([device respondsToSelector:@selector(identifierForVendor)]) {
            app_uuid = [[device identifierForVendor] UUIDString];
        } else {
            CFUUIDRef uuid = CFUUIDCreate(NULL);
            app_uuid = (__bridge_transfer NSString *)CFUUIDCreateString(NULL, uuid);
            CFRelease(uuid);
        }

        [userDefaults setObject:app_uuid forKey:UUID_KEY];
        [userDefaults synchronize];
    }

    return app_uuid;
}
- (BOOL)isVirtual {
#if TARGET_OS_SIMULATOR
    return true;
#elif TARGET_IPHONE_SIMULATOR
    return true;
#else
    return false;
#endif
}

@end
