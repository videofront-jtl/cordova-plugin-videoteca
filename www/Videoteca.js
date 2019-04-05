"use strict";

var exec = require ( 'cordova/exec' );

var CordovaVideoteca = {
    url_videoteca : "{URL_VIDEOTECA}",

    _appdata : {},
    _errors  : [
        "",
        "Carregamento de vídeo abortado",
        "Erro de rede",
        "Vídeo não codificado corretamente",
        "Arquivo de vídeo não encontrado",
        "Vídeo não suportado",
        "Skin não encontrado",
        "Arquivo SWF não encontrado",
        "Subtítulo não encontrado",
        "URL RTMP inválido",
        "Formato de vídeo não suportado. Tente instalar o Adobe Flash."
    ],

    _vfplayer           : null,
    _vfplayer2_api      : null,
    _vfplayer2_element  : null,
    _vfplayer2_interval : null,

    /**
     * @returns {boolean}
     */
    offlineEnable      : function () {
        if ( "object" == typeof VfPlayerOffline ) {
            return true;
        } else {
            return false;
        }
    },
    /**
     * @returns {*}
     */
    offlineList        : function () {
        if ( "object" == typeof VfPlayerOffline ) {
            return VfPlayerOffline.offlineList ();
        } else {
            return {};
        }
    },
    /**
     * @param identifier
     * @returns no|erro|ok|baixando|aguardando
     */
    offlineVideoStatus : function ( identifier ) {
        if ( "object" == typeof VfPlayerOffline ) {
            return VfPlayerOffline.offlineVideoStatus ( identifier );
        } else {
            return 'no';
        }
    },
    /**
     * @returns {*}
     */
    offlineCount       : function () {
        if ( "object" == typeof VfPlayerOffline ) {
            return VfPlayerOffline.offlineCount ();
        } else {
            return -1;
        }
    },
    /**
     * @param identifier
     * @param aluno
     * @param extra
     * @returns {*}
     */
    offlineDownload    : function ( identifier, aluno, extra ) {
        if ( "object" == typeof VfPlayerOffline ) {
            return VfPlayerOffline.offlineDownload ( identifier, aluno, extra );
        } else {
            return false;
        }
    },
    /**
     * @param identifier
     * @returns {*}
     */
    offlineDelete      : function ( identifier ) {
        if ( "object" == typeof VfPlayerOffline ) {
            return VfPlayerOffline.offlineDelete ( identifier );
        } else {
            return false;
        }
    },
    /**
     * @param identifier
     * @returns {*}
     */
    offlineExist       : function ( identifier ) {
        if ( "object" == typeof VfPlayerOffline ) {
            return VfPlayerOffline.offlineExist ( identifier );
        } else {
            return false;
        }
    },

    /**
     * @param identifier
     * @param aluno_id
     * @param options
     */
    playVideo : function ( identifier, aluno_id, options ) {

        options                 = options || {};
        options.autoplay        = options.autoplay || true;
        options.aluno           = options.aluno || {};
        options.successCallback = options.successCallback || null;
        options.errorCallback   = options.errorCallback || null;
        options.seekTo          = options.seekTo || 0;

        options.identifier = identifier;
        options.aluno_id   = aluno_id;

        if ( CordovaVideoteca._vfplayer2_api != null ) {
            CordovaVideoteca._vfplayer2_api.stop ()
        }

        //
        var player = vfplayer ( null, {
            identifier : identifier,
            aluno      : options.aluno,
            aluno_id   : aluno_id
        } );

        player.loadSource2 ( function ( videoUrl, subtitle, seekTo, _video ) {

            if ( cordova.platformId == "android" ) {
                CordovaVideoteca.playVideo_android ( options, videoUrl, subtitle, seekTo, _video );
            } else if ( cordova.platformId == "ios" ) {
                CordovaVideoteca.playVideo_ios ( options, videoUrl, subtitle, seekTo, _video );
            } else {
                navigator.notification.alert ( "Não há suporte para " + cordova.platformId );
            }

            if ( 'object' == typeof PlayerAnalytics ) {
                PlayerAnalytics.start ( identifier, aluno_id );
            }

        }, function () {
            if ( options.errorCallback ) {
                options.errorCallback ();
            }
            CordovaVideoteca.stopVideo ();
        } );
    },

    /**
     *
     * @param options
     * @param videoUrl
     * @param subtitle
     * @param seekTo
     * @param _video
     */
    playVideo_android : function ( options, videoUrl, subtitle, seekTo, _video ) {

        // options.aluno.dash = true;

        var parameters = {
            user_agent  : "Mozilla/5.0 (Linux; Android " + CordovaVideoteca._appdata.platformVersion + "; AppleWebKit/537.36 (KHTML, like Gecko) " + CordovaVideoteca._appdata.appName + "/" + CordovaVideoteca._appdata.appVersionNumber + " Mobile Safari",
            url         : videoUrl,
            subtitleUrl : subtitle
        };

        var isReady = false;
        exec ( function ( message ) {
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
            }, function ( error ) {
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
            }, "Videoteca", "playVideo", [ parameters ]
        );

        clearInterval ( CordovaVideoteca._vfplayer2_interval );
        CordovaVideoteca._vfplayer2_interval = setInterval ( function () {
            if ( !isReady ) {
                return;
            }

            exec ( function ( playerData ) {

                    console.log ( playerData );

                    var duration    = playerData.duration;
                    var currentTime = playerData.position;

                    window.dispatchEvent ( new CustomEvent ( 'videoteca-ontimeupdate', {
                        'detail' : {
                            identifier  : options.identifier,
                            aluno_id    : options.aluno_id,
                            currentTime : currentTime,
                            duration    : duration,
                            percentage  : (100 / duration) * currentTime
                        }
                    } ) );

                }, function ( error ) {
                    console.log ( error );
                }, 'Videoteca', 'getState', []
            );
        }, 250 );
    },

    /**
     *
     * @param options
     * @param videoUrl
     * @param subtitle
     * @param seekTo
     * @param _video
     */
    playVideo_ios : function ( options, videoUrl, subtitle, seekTo, _video ) {
        if ( !CordovaVideoteca._vfplayer2_element ) {
            CordovaVideoteca._vfplayer2_element           = document.createElement ( 'div' );
            CordovaVideoteca._vfplayer2_element.id        = "videofront_videoplayer";
            CordovaVideoteca._vfplayer2_element.className = "flowplayer is-closeable";
            document.body.appendChild ( CordovaVideoteca._vfplayer2_element );

            CordovaVideoteca._vfplayer2_element.style.position        = "fixed";
            CordovaVideoteca._vfplayer2_element.style.top             = 0;
            CordovaVideoteca._vfplayer2_element.style.left            = 0;
            CordovaVideoteca._vfplayer2_element.style.right           = 0;
            CordovaVideoteca._vfplayer2_element.style.bottom          = 0;
            CordovaVideoteca._vfplayer2_element.style.zIndex          = 999999;
            CordovaVideoteca._vfplayer2_element.style.backgroundColor = "#000000";
        }

        CordovaBackground.enable ();
        CordovaVideoteca.fullscreenOn ();

        if ( options.successCallback ) {
            options.successCallback ();
        }

        CordovaVideoteca._vfplayer2_api = vfplayer2 ( "#videofront_videoplayer", {
            chromecast        : true,
            autoplay          : false,
            share             : false,
            width             : "100%",
            height            : "100%",
            poster            : _video.poster,
            speeds            : _video.speed.split ( "," ),
            safety            : "",
            fullscreen        : false,
            native_fullscreen : false,
            errors            : CordovaVideoteca._errors,
            clip              : {
                sources : [ {
                    type : "application/x-mpegurl",
                    src  : videoUrl
                } ]
            }
        } );

        CordovaVideoteca._vfplayer2_api.on ( 'ready', function ( e, api ) {
            if ( CordovaVideoteca._vfplayer2_api ) {
                api.play ();

                if ( seekTo ) {
                    api.seekTo ( seekTo );
                }

                document.getElementsByClassName ( "fp-unload" )[ 0 ].onclick = function () {
                    CordovaVideoteca.stopVideo ();
                }
            }
        } );

        document.getElementsByClassName ( "fp-unload" )[ 0 ].onclick = function () {
            CordovaVideoteca.stopVideo ();
        };

        CordovaVideoteca._vfplayer2_api.on ( 'finish shutdown unload', function ( e, api ) {
            CordovaVideoteca.stopVideo ();
        } );
        CordovaVideoteca._vfplayer2_api.on ( 'error', function ( e, api, error ) {
            navigator.notification.alert ( CordovaVideoteca._errors[ error.code ], null, "ERRO" );
            CordovaVideoteca.stopVideo ();
        } );
        CordovaVideoteca._vfplayer2_api.on ( 'progress', function ( e, api ) {
            window.dispatchEvent ( new CustomEvent ( 'videoteca-ontimeupdate', {
                'detail' : {
                    identifier  : options.identifier,
                    aluno_id    : options.aluno_id,
                    currentTime : api.video.time,
                    duration    : api.video.duration,
                    percentage  : (100 / api.video.duration) * api.video.time
                }
            } ) );
        } );

        // tracker
        var loader                = new XMLHttpRequest ();
        loader.onreadystatechange = function () {
            if ( this.readyState == 4 && this.status == 200 ) {
                CordovaVideoteca._vfplayer2_api.video.subtitles = [ {
                    "default" : true,
                    kind      : "subtitles",
                    srclang   : "pt-BR",
                    label     : "Legenda pt-BR",
                    src       : subtitle
                } ];
                if ( CordovaVideoteca._vfplayer2_api ) {
                    CordovaVideoteca._vfplayer2_api.loadSubtitles ( 0 );
                }
            }
            else if ( this.readyState == 4 && this.status != 200 ) {
                var x = document.getElementsByClassName ( "fp-cc" );
                if ( x[ 0 ] ) {
                    x[ 0 ].style.display = 'none';
                }
            }
        };
        loader.open ( 'HEAD', subtitle, true );
        loader.send ();
    },

    /**
     */
    stopVideo : function () {
        if ( cordova.platformId == "android" ) {
            exec ( null, null, "Videoteca", "stopVideo" );
            clearInterval ( CordovaVideoteca._vfplayer2_interval );
        } else {
            if ( CordovaVideoteca._vfplayer2_api == null ) {
                return;
            } else {
                CordovaVideoteca._vfplayer2_api.stop ();

                document.body.removeChild ( CordovaVideoteca._vfplayer2_element );

                CordovaVideoteca._vfplayer2_api     = null;
                CordovaVideoteca._vfplayer2_element = null;
            }
        }

        if ( 'object' == typeof PlayerAnalytics ) {
            PlayerAnalytics.stop ();
        }

        CordovaBackground.disable ();
        CordovaVideoteca.fullscreenOff ();
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


        var localVideoteca1   = "cdvfile://localhost/persistent/videoapp.js";
        var remoteVideotecaJs = CordovaVideoteca.url_videoteca + "api/Videos/videoapp.js?" + last;
        CordovaVideoteca.downloadAndAdd ( localVideoteca1, remoteVideotecaJs );

        var localVideoteca2    = "cdvfile://localhost/persistent/videoapp.css";
        var remoteVideotecaCss = CordovaVideoteca.url_videoteca + "api/Videos/videoapp.css?" + last;
        CordovaVideoteca.downloadAndAdd ( localVideoteca2, remoteVideotecaCss );

        // Arquivos VideofrontPlayer
        var localPlayer1  = "cdvfile://localhost/persistent/player.css";
        var remotePlayer1 = CordovaVideoteca.url_videoteca + "vendor-js/player/player.css";
        CordovaVideoteca.downloadAndAdd ( localPlayer1, remotePlayer1 );

        var localPlayer2  = "cdvfile://localhost/persistent/player-mobile.js";
        var remotePlayer2 = CordovaVideoteca.url_videoteca + "vendor-js/player/player-mobile.js";
        CordovaVideoteca.downloadAndAdd ( localPlayer2, remotePlayer2 );

        var localPlayer3  = "cdvfile://localhost/persistent/player-analytics.js";
        var remotePlayer3 = CordovaVideoteca.url_videoteca + "api/Videos/analytics.js";
        CordovaVideoteca.downloadAndAdd ( localPlayer3, remotePlayer3 );

        CordovaVideoteca.createNewPath ( "cdvfile://localhost/persistent/", "icons", function () {
            var localPlayer4  = "cdvfile://localhost/persistent/icons/player.woff2";
            var remotePlayer4 = CordovaVideoteca.url_videoteca + "vendor-js/player/icons/player.woff2";
            CordovaVideoteca.downloadAndAdd ( localPlayer4, remotePlayer4 );

            var localPlayer5  = "cdvfile://localhost/persistent/icons/player.woff";
            var remotePlayer5 = CordovaVideoteca.url_videoteca + "vendor-js/player/icons/player.woff";
            CordovaVideoteca.downloadAndAdd ( localPlayer5, remotePlayer5 );
        } );
    },

    /**
     * @param localFile
     * @param remoteFile
     * @param returnFunction
     */
    downloadAndAdd : function ( localFile, remoteFile, returnFunction ) {
        CordovaVideoteca._download (
            encodeURI ( remoteFile ),
            localFile,
            function ( entry ) {
                CordovaVideoteca.addFilePlayer ( localFile );

                if ( returnFunction ) {
                    returnFunction ();
                }
            },
            function ( error ) {
                console.log ( error );
                CordovaVideoteca.addFilePlayer ( localFile );

                if ( returnFunction ) {
                    returnFunction ();
                }
            }
        );
    },

    /**
     * @param fileURL
     */
    addFilePlayer : function ( fileURL ) {

        if ( location.href.indexOf ( 'http' ) === 0 ) {
            resolveLocalFileSystemURL ( fileURL, function ( entry ) {
                var url = "http://" + location.host + entry.toURL ().replace ( "file://", "" );

                if ( fileURL.indexOf ( '.css' ) > 1 ) {
                    var link  = document.createElement ( 'link' );
                    link.rel  = "stylesheet";
                    link.href = url;
                    document.head.appendChild ( link );
                } else if ( fileURL.indexOf ( '.js' ) > 1 ) {
                    var script     = document.createElement ( 'script' );
                    script.src     = url;
                    script.onerror = CordovaVideoteca._loadError;
                    document.head.appendChild ( script );
                }
            }, function ( error ) {
                console.log ( error );
            } )
        } else {
            if ( fileURL.indexOf ( '.css' ) > 1 ) {
                var link  = document.createElement ( 'link' );
                link.rel  = "stylesheet";
                link.href = fileURL;
                document.head.appendChild ( link );
            } else if ( fileURL.indexOf ( '.js' ) > 1 ) {
                var script     = document.createElement ( 'script' );
                script.src     = fileURL;
                script.onerror = CordovaVideoteca._loadError;
                document.head.appendChild ( script );
            }
        }
    },

    _loadError : function () {
        CordovaVideoteca.hasStarted = false;
    },

    /**
     * @param tagName
     * @param element
     * @param idName
     * @returns {HTMLElement}
     * @private
     */
    _createElement : function ( tagName, element, idName ) {
        var tag = document.createElement ( tagName );
        if ( idName )
            tag.id = idName;

        element.appendChild ( tag );

        return tag;
    },

    /**
     * @param source
     * @param target
     * @param successCallback
     * @param errorCallback
     * @private
     */
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
                                    fail ( 1 );
                                }
                            };
                            fileWriter.onerror    = function () {
                                fail ( 1 );
                            };
                            fileWriter.write ( req.response );
                        }, fileNotFound );
                    }, fileNotFound );
                }, fileNotFound );
            } else if ( req.status === 404 ) {
                fail ( 2, req.status, req.response );
            } else {
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
    },

    /**
     * @param fileRoot
     * @param newPath
     * @param returnFunction
     */
    createNewPath : function ( fileRoot, newPath, returnFunction ) {
        console.log ( [ fileRoot, newPath ] );
        window.resolveLocalFileSystemURL ( fileRoot, function ( rootDirEntry ) {
            rootDirEntry.getDirectory ( newPath, { create : true }, function ( subDirEntry ) {
                if ( returnFunction ) {
                    returnFunction ();
                }
            }, function ( e ) {
                console.error ( e );
                if ( returnFunction ) {
                    returnFunction ();
                }
            } );
        }, function ( e ) {
            console.error ( e );
            if ( returnFunction ) {
                returnFunction ();
            }
        } );
    },

    /**
     * @param successCallback
     * @param errorCallback
     */
    fullscreenOn : function ( successCallback, errorCallback ) {
        if ( cordova.platformId == "android" ) {
            exec ( successCallback, errorCallback, 'Videoteca', 'fullscreenOn', [] );
        }

        StatusBar.hide ();
    },

    /**
     * @param successCallback
     * @param errorCallback
     */
    fullscreenOff : function ( successCallback, errorCallback ) {
        if ( cordova.platformId == "android" ) {
            exec ( successCallback, errorCallback, 'Videoteca', 'fullscreenOff', [] );
        }

        StatusBar.show ();
    }
};

module.exports = CordovaVideoteca;

CordovaVideoteca.init ();
