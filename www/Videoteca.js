"use strict";

var exec = require ( 'cordova/exec' );

var CordovaVideoteca = {
    url_videoteca : "{URL_VIDEOTECA}",

    _vfplayer        : null,
    _playerElement   : null,
    _backbuttonEvent : null,

    offlineList     : function () {
        return vfplayer.offlineList ();
    },
    offlineCount    : function () {
        return vfplayer.offlineCount ();
    },
    offlineDownload : function ( identifier, aluno ) {
        return vfplayer.offlineDownload ( identifier, aluno );
    },
    offlineDelete   : function ( identifier ) {
        return vfplayer.offlineDelete ( identifier );
    },
    offlineExist    : function ( identifier, returnFunction ) {
        return vfplayer.offlineExist ( identifier, returnFunction );
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

            exec ( options.successCallback, options.errorCallback, "Videoteca", "playVideo", [ url, options ] );
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
            alert ( "Parece que não configurou direito! \nEntre em contato com suporte!" );
        }

        var videotecaJs = CordovaVideoteca.url_videoteca + "api/Videos/videoapp.js";

        var script     = document.createElement ( 'script' );
        script.async   = 1;
        script.src     = videotecaJs;
        script.onerror = CordovaVideoteca._loadError;
        document.head.appendChild ( script );


        var videotecaCss = CordovaVideoteca.url_videoteca + "api/Videos/videoapp.css";

        var link     = document.createElement ( 'link' );
        link.async   = 1;
        link.rel     = "stylesheet";
        link.href    = videotecaCss;
        link.onerror = CordovaVideoteca._loadError;
        document.head.appendChild ( link );

        CordovaVideoteca.hasStarted = true;
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


