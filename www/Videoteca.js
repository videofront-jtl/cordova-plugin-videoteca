"use strict";

var exec = require ( 'cordova/exec' );

var CordovaVideoteca = {
    url_videoteca : "{URL_VIDEOTECA}",

    _vfplayer        : null,
    _playerElement   : null,
    _backbuttonEvent : null,

    offlineStatus     : function () {
        if ( "object" == typeof VfPlayerOffline ) {
            return true;
        } else {
            return false;
        }
    },

    offlineList     : function () {
        if ( "object" == typeof VfPlayerOffline ) {
            return VfPlayerOffline.offlineList ();
        } else {
            return {};
        }
    },
    offlineCount    : function () {
        if ( "object" == typeof VfPlayerOffline ) {
            return VfPlayerOffline.offlineCount ();
        } else {
            return -1;
        }
    },
    offlineDownload : function ( identifier, aluno, extra ) {
        if ( "object" == typeof VfPlayerOffline ) {
            return VfPlayerOffline.offlineDownload ( identifier, aluno, extra );
        } else {
            return false;
        }
    },
    offlineDelete   : function ( identifier ) {
        if ( "object" == typeof VfPlayerOffline ) {
            return VfPlayerOffline.offlineDelete ( identifier );
        } else {
            return false;
        }
    },
    offlineExist    : function ( identifier ) {
        if ( "object" == typeof VfPlayerOffline ) {
            return VfPlayerOffline.offlineExist ( identifier );
        } else {
            return false;
        }
    },

    playVideo : function ( identifier, options ) {

        options          = options || {};
        options.autoplay = options.autoplay || true;
        options.aluno    = options.aluno || {};

        if ( cordova.platformId == "android" || cordova.platformId == "browser" ) {

            CordovaVideoteca._playerElement = CordovaVideoteca._createElement ( 'div', document.body, 'vf-player-cordova' );
            CordovaVideoteca._playerElement.classList.add ( "videofront-fullscreen" );
            CordovaVideoteca._playerElement.classList.add ( "videofront-nofullscreen-button" );

            CordovaVideoteca._vfplayer = vfplayer ( 'vf-player-cordova', {
                identifier : identifier,
                autoplay   : options.autoplay,
                aluno      : options.aluno
            } );

            document.addEventListener ( "backbutton", CordovaVideoteca.stopVideo, true );

            CordovaVideoteca.fullscreenOn ();

        } else if ( cordova.platformId == "ios" ) {
            options.orientation     = options.orientation || "landscape";
            options.successCallback = options.successCallback || null;
            options.errorCallback   = options.errorCallback || null;

            var player = vfplayer ( null, {
                identifier : identifier,
                aluno      : options.aluno
            } );
            player.loadSource ( function ( url ) {
                exec ( options.successCallback, options.errorCallback, "Videoteca", "playVideo", [ url, options ] );
            }, options.errorCallback )
        } else {
            alert ( "Não há suporte para " + cordova.platformId );
        }
    },

    stopVideo : function ( event ) {
        if ( cordova.platformId == "android" || cordova.platformId == "browser" ) {

            if ( event ) {
                event.stopImmediatePropagation ();
            }

            document.removeEventListener ( "backbutton", CordovaVideoteca.stopVideo );
            CordovaVideoteca.fullscreenOff ();

            document.body.removeChild ( CordovaVideoteca._playerElement );

            CordovaVideoteca._vfplayer.pause ();
            CordovaVideoteca._vfplayer = false;

            CordovaVideoteca.fullscreenOff ();
        }
    },

    fullscreenOn  : function ( successCallback, errorCallback ) {
        if ( cordova.platformId == "android" ) {
            exec ( successCallback, errorCallback, 'Videoteca', 'fullscreenOn', [] );
        }
    },
    fullscreenOff : function ( successCallback, errorCallback ) {
        if ( cordova.platformId == "android" ) {
            exec ( successCallback, errorCallback, 'Videoteca', 'fullscreenOff', [] );
        }
    },

    hasStarted : false,
    init       : function () {
        if ( CordovaVideoteca.hasStarted )
            return;

        if ( CordovaVideoteca.url_videoteca.indexOf ( "https" ) === -1 ) {
            alert ( "Parece que não configurou o Plugin cordova-plugin-videoteca!\nVerifique ou Entre em contato com suporte!" );
            return;
        }

        exec ( CordovaVideoteca.init_load, CordovaVideoteca.init_load, 'Videoteca', 'appdata', [] );

        CordovaVideoteca.hasStarted = true;
    },

    init_load : function ( appdata ) {
        console.log ( appdata );

        appdata               = appdata || {};
        appdata.appName       = appdata.appName || '';
        appdata.packageName   = appdata.packageName || '';
        appdata.versionNumber = appdata.versionNumber || '';

        console.log ( appdata );

        var last =
                "platformId=" + cordova.platformId + "&" +

                "appName=" + appdata.appName + "&" +
                "appPackageName=" + appdata.appPackageName + "&" +
                "appVersionNumber=" + appdata.appVersionNumber + "&" +

                "platformUUID=" + appdata.platformUUID + "&" +
                "platformVersion=" + appdata.platformVersion + "&" +
                "platformName=" + appdata.platformName + "&" +
                "platformModel=" + appdata.platformModel + "&" +
                "platformManufacturer=" + appdata.platformManufacturer + "&" +
                "platformIsVirtual=" + appdata.platformIsVirtual;

        var videotecaJs  = CordovaVideoteca.url_videoteca + "api/Videos/videoapp.js?" + last;
        var videotecaCss = CordovaVideoteca.url_videoteca + "api/Videos/videoapp.css?" + last;


        var fileTransfer1 = new FileTransfer ();
        var fileURL1      = "cdvfile://localhost/persistent/videoapp.js";
        fileTransfer1.download (
            encodeURI ( videotecaJs ),
            fileURL1,
            function ( entry ) {
                console.log ( "download complete: " + entry.toURL () );

                CordovaVideoteca.addFilePlayer ( fileURL1 );
            },
            function ( error ) {
                console.log ( error );

                CordovaVideoteca.addFilePlayer ( fileURL1 );
            }
        );

        var fileTransfer2 = new FileTransfer ();
        var fileURL2      = "cdvfile://localhost/persistent/videoapp.css";
        fileTransfer2.download (
            encodeURI ( videotecaCss ),
            fileURL2,
            function ( entry ) {
                console.log ( "download complete: " + entry.toURL () );

                CordovaVideoteca.addFilePlayer ( fileURL2 );
            },
            function ( error ) {
                console.log ( error );

                CordovaVideoteca.addFilePlayer ( fileURL2 );
            }
        );
    },

    addFilePlayer : function ( fileURL ) {
        if ( fileURL.indexOf ( '.css' ) > 1 ) {
            var link     = document.createElement ( 'link' );
            link.async   = 1;
            link.rel     = "stylesheet";
            link.href    = fileURL;
            link.onerror = CordovaVideoteca._loadError;
            document.head.appendChild ( link );
        } else {
            var script     = document.createElement ( 'script' );
            script.async   = 1;
            script.src     = fileURL;
            script.onerror = CordovaVideoteca._loadError;
            document.head.appendChild ( script );
        }

        console.log ( fileURL );
    },

    _loadError : function () {
        CordovaVideoteca.hasStarted = false;
    },

    _createElement : function ( tagName, element, idName ) {
        var tag = document.createElement ( tagName );
        if ( idName )
            tag.id = idName;

        element.appendChild ( tag );

        return tag;
    },
};

module.exports = CordovaVideoteca;

CordovaVideoteca.init ();

// cordova plugin rm cordova-plugin-videoteca --nosave && cordova plugin add ~/Git/cordova-plugin-videoteca/ --nosave


