var exec = require ( 'cordova/exec' );

var CordovaVideoteca = {
    url_videoteca : "{URL_VIDEOTECA}",

    /**
     * Possui os seguintes dados do APP:
     * - appName
     * - appPackageName
     * - appVersionNumber
     * - platformUUID
     * - platformVersion
     * - platformName
     * - platformModel
     * - platformManufacturer
     * - platformIsVirtual
     */
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
     * Interrompe o vídeo e destroy o player e recria novamente o player
     */
    reloadPlayer : function () {
    },

    /**
     * Interrompe o vídeo e destroy o player
     */
    stopVideo : function () {
    },

    hasStarted : false,
    init       : function ( url_videoteca ) {
        if ( CordovaVideoteca.hasStarted ) {
            return;
        }

        CordovaVideoteca.url_videoteca = url_videoteca;

        if ( CordovaVideoteca.url_videoteca.indexOf ( "https" ) === -1 ) {
            alert ( "Parece que não configurou o Plugin cordova-plugin-videoteca!\nVerifique ou Entre em contato com suporte!" );
            return;
        }

        exec ( CordovaVideoteca.init_load, CordovaVideoteca.init_load, 'Videoteca', 'appdata', [] );

        CordovaVideoteca.hasStarted = true;
    },

    init_load : function ( appdata ) {
        appdata = appdata || {
            appName          : '',
            platformVersion  : '',
            appPackageName   : '',
            appVersionNumber : '',
        };

        CordovaVideoteca._appdata = appdata;

        window.requestFileSystem ( window.PERSISTENT, 2 * 1024 * 1024, function ( fs ) {
            var localJsVideoteca  = fs.root.nativeURL + "/videoapp.js";
            var remoteJsVideoteca = CordovaVideoteca.url_videoteca + "vendor-js/player-v3/player-app-android.js?v=" + Math.random ();
            if ( cordova.platformId == "ios" ) {
                if ( parseInt ( appdata.platformVersion ) < 10 ) {
                    remoteJsVideoteca = CordovaVideoteca.url_videoteca + "vendor-js/player-v3/player-app-ios-olders.js?v=" + Math.random ();
                } else {
                    remoteJsVideoteca = CordovaVideoteca.url_videoteca + "vendor-js/player-v3/player-app-ios.js?v=" + Math.random ();
                }
            }
            CordovaVideoteca.downloadAndAdd ( localJsVideoteca, remoteJsVideoteca );

            var localCssVideoteca  = fs.root.nativeURL + "/vfplayer3.css";
            var remoteCssVideoteca = CordovaVideoteca.url_videoteca + "vendor-js/player-v3/vfplayer3.css?v=" + Math.random ();

            CordovaVideoteca.downloadAndAdd ( localCssVideoteca, remoteCssVideoteca );
        } );
    },

    /**
     * @param localFile
     * @param remoteFile
     */
    downloadAndAdd : function ( localFile, remoteFile ) {
        CordovaVideoteca.download (
            encodeURI ( remoteFile ),
            localFile,
            function ( entry ) {
                CordovaVideoteca.addFilePlayer ( localFile );
            },
            function ( error ) {
                CordovaVideoteca.addFilePlayer ( localFile );
            },
            false
        );
    },


    /**
     * Alterado do FileTransfer.download para este
     *   porque o outro apaga o arquivo antes de baixar o arquivo
     *   o que faz com que sem conexão com internet não houvesse
     *   offline para assistir.
     *
     * @param source
     * @param target
     * @param successCallback
     * @param errorCallback
     */
    download : function ( source, target, successCallback, errorCallback ) {
        var that      = this;
        var transfers = {};
        var xhr       = transfers[ this._id ] = new XMLHttpRequest ();
        var fail = errorCallback && function ( code, status, response ) {
            if ( transfers[ that._id ] ) {
                delete transfers[ that._id ];
            }
            if ( response instanceof Blob ) {
                var reader = new FileReader ();
                reader.readAsText ( response );
                reader.onloadend = function ( e ) {
                    var error = {
                        code     : code,
                        source   : source,
                        target   : target,
                        status   : status,
                        response : e.target.result
                    };
                    errorCallback ( error );
                };
            } else {
                var error = {
                    code     : code,
                    source   : source,
                    target   : target,
                    status   : status,
                    response : response
                };
                errorCallback ( error );
            }
        };

        xhr.onload = function ( e ) {

            var fileNotFound  = function () {
                fail ( "FILE_NOT_FOUND_ERR" );
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
                    dir.getFile ( getFileName ( target ), { create : true },
                        function writeFile ( entry ) {
                            entry.createWriter ( function ( fileWriter ) {
                                fileWriter.onwriteend = function ( evt ) {
                                    if ( !evt.target.error ) {
                                        entry.filesystemName = entry.filesystem.name;
                                        delete transfers[ that._id ];
                                        if ( successCallback ) {
                                            successCallback ( entry );
                                        }
                                    } else {
                                        fail ( "FILE_NOT_FOUND_ERR" );
                                    }
                                };
                                fileWriter.onerror    = function () {
                                    fail ( "FILE_NOT_FOUND_ERR" );
                                };
                                fileWriter.write ( req.response );
                            }, fileNotFound );
                        }, fileNotFound );
                }, fileNotFound );
            } else if ( req.status === 404 ) {
                fail ( "INVALID_URL_ERR", req.status, req.response );
            } else {
                fail ( "CONNECTION_ERR", req.status, req.response );
            }
        };

        xhr.onprogress = function ( e ) {
            if ( that.onprogress ) {
                that.onprogress ( e );
            }
        };

        xhr.onerror = function () {
            fail ( "CONNECTION_ERR", this.status, this.response );
        };

        xhr.onabort = function () {
            fail ( "ABORT_ERR", this.status, this.response );
        };

        xhr.open ( "GET", source, true );
        xhr.responseType = "blob";

        xhr.send ();
    },

    /**
     * @param fileURL
     */
    addFilePlayer : function ( fileURL ) {

        if ( fileURL.indexOf ( ".css" ) > 1 ) {
            if ( typeof Ionic === "object" && typeof Ionic.WebView === "object" ) {
                resolveLocalFileSystemURL ( fileURL, function ( entry ) {
                    var url   = window.Ionic.WebView.convertFileSrc ( entry.nativeURL );
                    var link  = document.createElement ( 'link' );
                    link.rel  = "stylesheet";
                    link.id   = "VfPlayer3_css";
                    link.href = url;
                    document.head.appendChild ( link );
                }, function ( error ) {
                    console.log ( error );
                } );
            } else {
                var link  = document.createElement ( 'link' );
                link.rel  = "stylesheet";
                link.id   = "VfPlayer3_css";
                link.href = fileURL;
                document.head.appendChild ( link );
            }
        } else {
            if ( typeof Ionic === "object" && typeof Ionic.WebView === "object" ) {
                resolveLocalFileSystemURL ( fileURL, function ( entry ) {
                    var url        = window.Ionic.WebView.convertFileSrc ( entry.nativeURL );
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
        }
    },

    _loadError : function () {
        CordovaVideoteca.hasStarted = false;
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
