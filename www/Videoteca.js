"use strict";

var exec = require ( 'cordova/exec' );

var CordovaVideoteca = {
    url_videoteca : "{URL_VIDEOTECA}",

    _appdata : {},

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
     * @returns {*}
     */
    offlineThumb : function ( identifier ) {
        if ( "object" == typeof VfPlayerOffline ) {
            return VfPlayerOffline.offlineThumb ( identifier );
        }
        return "";
    },

    /**
     * @param identifier
     * @param aluno_id
     * @param options
     */
    playVideo : function ( identifier, aluno_id, options ) {
    },

    /**
     */
    stopVideo : function () {
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

        var localVideoteca  = "cdvfile://localhost/persistent/videoapp.js";
        var remoteVideoteca = CordovaVideoteca.url_videoteca + "vendor-js/player-v3/player-app-android.js?v=" + Math.random ();
        if ( cordova.platformId == "ios" ) {
            if ( parseInt ( appdata.platformVersion ) < 10 ) {
                remoteVideoteca = CordovaVideoteca.url_videoteca + "vendor-js/player-v3/player-app-ios-olders.js?v=" + Math.random ();
            } else {
                remoteVideoteca = CordovaVideoteca.url_videoteca + "vendor-js/player-v3/player-app-ios.js?v=" + Math.random ();
            }
        }
        CordovaVideoteca.downloadAndAdd ( localVideoteca, remoteVideoteca );
    },

    /**
     * @param localFile
     * @param remoteFile
     * @param returnFunction
     */
    downloadAndAdd : function ( localFile, remoteFile, returnFunction ) {

        var cacheTransfer = new FileTransfer ();
        cacheTransfer.download (
            encodeURI ( remoteFile ),
            localFile,
            function ( entry ) {
                CordovaVideoteca.addFilePlayer ( localFile );
                if ( returnFunction ) {
                    returnFunction ();
                }
            },
            function ( error ) {
                CordovaVideoteca.addFilePlayer ( remoteFile );
                if ( returnFunction ) {
                    returnFunction ();
                }
            },
            false
        );
    },

    /**
     * @param fileURL
     */
    addFilePlayer : function ( fileURL ) {

        if ( location.href.indexOf ( 'http' ) === 0 ) {
            resolveLocalFileSystemURL ( fileURL, function ( entry ) {
                var url = "http://" + location.host + entry.toURL ().replace ( "file://", "" );

                var script     = document.createElement ( 'script' );
                script.src     = url;
                script.onerror = CordovaVideoteca._loadError;
                document.head.appendChild ( script );
            }, function ( error ) {
                console.log ( error );
            } );
        } else {
            var script     = document.createElement ( 'script' );
            script.src     = fileURL;
            script.onerror = CordovaVideoteca._loadError;
            document.head.appendChild ( script );
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
        if ( idName ) {
            tag.id = idName;
        }

        element.appendChild ( tag );

        return tag;
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
