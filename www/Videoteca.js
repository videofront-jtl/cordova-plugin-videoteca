"use strict";

var exec = require ( 'cordova/exec' );

var CordovaVideoteca = {
    url_videoteca : "{URL_VIDEOTECA}",

    _appdata         : {},
    _vfplayer        : null,
    _playerElement   : null,
    _backbuttonEvent : null,

    incrementVideoPlayer_setInterval : null,

    offlineStatus   : function () {
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

    playVideo : function ( identifier, aluno_id, options ) {

        options                 = options || {};
        options.autoplay        = options.autoplay || true;
        options.aluno           = options.aluno || {};
        options.successCallback = options.successCallback || null;
        options.errorCallback   = options.errorCallback || null;
        options.seekTo          = options.seekTo || 0;

        CordovaVideoteca.stopVideo ();

        var player = vfplayer ( null, {
            identifier : identifier,
            aluno      : options.aluno,
            aluno_id   : aluno_id
        } );

        if ( cordova.platformId == "android" ) {

            options.aluno.dash = true;
            player.loadSource2 ( function ( video, subtitle, seekTo ) {

                var parameters = {
                    user_agent  : "Mozilla/5.0 (Linux; Android " + CordovaVideoteca._appdata.platformVersion + "; AppleWebKit/537.36 (KHTML, like Gecko) " + CordovaVideoteca._appdata.appName + "/" + CordovaVideoteca._appdata.appVersionNumber + " Mobile Safari",
                    url         : video,
                    subtitleUrl : subtitle
                };

                var isReady = false;
                exec (
                    function ( message ) {
                        console.log ( message );

                        /**
                         * { playback_state: "STATE_IDLE",      event_type: "state_changed_event" }
                         * { playback_state: "STATE_READY",     event_type: "state_changed_event" }
                         * { playback_state: "STATE_BUFFERING", event_type: "state_changed_event" }
                         * { playback_state: "STATE_ENDED",     event_type: "state_changed_event" }
                         * {                                    event_type: "start_event" }
                         * {                                    event_type: "loading_event", loading: "true" }
                         * {                                    event_type: "stop_event" }
                         */
                        if ( message.event_type == "state_changed_event" ) {
                            if ( message.playback_state == "STATE_ENDED" ) {
                                CordovaVideoteca.stopVideo ();
                            } else if ( message.playback_state == "STATE_READY" ) {
                                if ( options.seekTo && !isReady ) {
                                    exec ( null, null, "Videoteca", "seekTo", [ options.seekTo ] );
                                    isReady = true
                                } else if ( seekTo && !isReady ) {
                                    exec ( null, null, "Videoteca", "seekTo", [ seekTo ] );
                                    isReady = true
                                }
                            }
                        }

                        if ( message.event_keycode == "KEYCODE_BACK" && message.event_action == "ACTION_DOWN" ) {
                            CordovaVideoteca.stopVideo ();
                        }

                        if ( options.successCallback ) {
                            options.successCallback ( message );
                        }
                    },
                    function ( error ) {
                        console.log ( error );
                        /**
                         * { error_message: null, error_type: "source", event_type: "player_error_event" }
                         */

                        if ( error.event_type == "player_error_event" ) {
                            if ( error.error_type == "source" ) {
                                navigator.notification.alert ( "Erro ao carregar o vídeo.\n\nTente novamente e se o problema persistir, entre em contato com nosso suporte.", null, "Erro..." );
                                CordovaVideoteca.stopVideo ();
                            }
                        } else if ( options.errorCallback ) {
                            options.errorCallback ( "Erro interno do Player!" );
                        }
                    }, "Videoteca", "playVideo", [ parameters ] );
            }, options.errorCallback );
        } else if ( cordova.platformId == "ios" ) {
            options.orientation = options.orientation || "landscape";

            var isReady = false;
            player.loadSource2 ( function ( video, subtitle, seekTo ) {
                exec ( options.successCallback, options.errorCallback, "Videoteca", "playVideo", [ video, options ] );

                if ( options.successCallback ) {
                    options.successCallback ();
                }

                if ( options.seekTo && !isReady ) {
                    exec ( null, null, "Videoteca", "seekTo", [ options.seekTo ] );
                    isReady = true
                } else if ( seekTo && !isReady ) {
                    exec ( null, null, "Videoteca", "seekTo", [ seekTo ] );
                    isReady = true
                }

            }, options.errorCallback );

        } else {
            alert ( "Não há suporte para " + cordova.platformId );
            return;
        }

        clearInterval ( CordovaVideoteca.incrementVideoPlayer_setInterval );
        CordovaVideoteca.incrementVideoPlayer_setInterval = setInterval ( function () {
            if ( player == null )
                return;
            CordovaVideoteca.getState ( function ( playerData ) {

                console.log ( playerData );

                var duration    = playerData.duration;
                var currentTime = playerData.position;

                window.dispatchEvent ( new CustomEvent ( 'videoteca-ontimeupdate', {
                    'detail' : {
                        identifier  : identifier,
                        aluno_id    : aluno_id,
                        currentTime : currentTime,
                        duration    : duration,
                        percentage  : (100 / duration) * currentTime
                    }
                } ) );

            }, function ( error ) {
                console.log ( error );
            } )
        }, 250 );
    },

    stopVideo : function () {
        exec ( null, null, "Videoteca", "stopVideo" );

        clearInterval ( CordovaVideoteca.incrementVideoPlayer_setInterval );
    },

    getState : function ( successCallback, errorCallback ) {
        exec ( successCallback, errorCallback, 'Videoteca', 'getState', [] );
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
        appdata               = appdata || {};
        appdata.appName       = appdata.appName || '';
        appdata.packageName   = appdata.packageName || '';
        appdata.versionNumber = appdata.versionNumber || '';

        CordovaVideoteca._appdata = appdata;

        console.log ( CordovaVideoteca._appdata );

        var last =
                "platformId=" + cordova.platformId + "&" +
                "appName=" + CordovaVideoteca._appdata.appName + "&" +
                "appPackageName=" + CordovaVideoteca._appdata.appPackageName + "&" +
                "appVersionNumber=" + CordovaVideoteca._appdata.appVersionNumber + "&" +
                "platformUUID=" + CordovaVideoteca._appdata.platformUUID + "&" +
                "platformVersion=" + CordovaVideoteca._appdata.platformVersion + "&" +
                "platformName=" + CordovaVideoteca._appdata.platformName + "&" +
                "platformModel=" + CordovaVideoteca._appdata.platformModel + "&" +
                "platformManufacturer=" + CordovaVideoteca._appdata.platformManufacturer + "&" +
                "platformIsVirtual=" + CordovaVideoteca._appdata.platformIsVirtual;

        var videotecaJs  = CordovaVideoteca.url_videoteca + "api/Videos/videoapp.js?" + last;
        var videotecaCss = CordovaVideoteca.url_videoteca + "api/Videos/videoapp.css?" + last;

        var fileURL1 = "cdvfile://localhost/persistent/videoapp.js";
        CordovaVideoteca._download (
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

        var fileURL2 = "cdvfile://localhost/persistent/videoapp.css";
        CordovaVideoteca._download (
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
            var link   = document.createElement ( 'link' );
            link.async = 1;
            link.rel   = "stylesheet";
            link.href  = fileURL;
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

    _download : function ( source, target, successCallback, errorCallback ) {

        var xhr  = new XMLHttpRequest ();
        var fail = errorCallback && function ( code, status, response ) {
            if ( response instanceof Blob ) {
                var reader = new FileReader ();
                reader.readAsText ( response );
                reader.onloadend = function ( e ) {
                    var error = new FileTransferError ( code, source, target, status, e.target.result );
                    errorCallback ( error );
                };
            } else {
                var error = new FileTransferError ( code, source, target, status, response );
                errorCallback ( error );
            }
        };

        xhr.onload  = function ( e ) {

            var fileNotFound  = function () {
                console.log ( "A2" );
                fail ( 1 );
            };
            var getParentPath = function ( filePath ) {
                var pos = filePath.lastIndexOf ( '/' );
                return filePath.substring ( 0, pos + 1 );
            };
            var getFileName   = function ( filePath ) {
                var pos = filePath.lastIndexOf ( '/' );
                return filePath.substring ( pos + 1 );
            };

            var req = e.target;
            // req.status === 0 is special case for local files with file:// URI scheme
            if ( (req.status === 200 || req.status === 0) && req.response ) {
                window.resolveLocalFileSystemURL ( getParentPath ( target ), function ( dir ) {
                    dir.getFile ( getFileName ( target ), { create : true, exclusive : false }, function ( entry ) {
                        entry.createWriter ( function ( fileWriter ) {
                            fileWriter.onwriteend = function ( evt ) {
                                if ( !evt.target.error ) {
                                    entry.filesystemName = entry.filesystem.name;
                                    if ( successCallback ) {
                                        successCallback ( entry );
                                    }
                                } else {
                                    console.log ( "A3" );
                                    fail ( 1 );
                                }
                            };
                            fileWriter.onerror    = function () {
                                console.log ( "A1" );
                                fail ( 1 );
                            };
                            fileWriter.write ( req.response );
                        }, fileNotFound );
                    }, fileNotFound );
                }, fileNotFound );
            } else if ( req.status === 404 ) {
                console.log ( "A4" );
                fail ( 2, req.status, req.response );
            } else {
                console.log ( "A5" );
                fail ( 3, req.status, req.response );
            }
        };
        xhr.onerror = function () {
            fail ( 3, this.status, this.response );
        };
        xhr.onabort = function () {
            fail ( 4, this.status, this.response );
        };
        xhr.open ( "GET", source, true );
        xhr.responseType = "blob";
        xhr.send ();
    }
};

module.exports = CordovaVideoteca;

CordovaVideoteca.init ();
