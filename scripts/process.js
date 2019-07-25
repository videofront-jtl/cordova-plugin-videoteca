#!/usr/bin/env node
'use strict';

var fs = require ( 'fs' );

var argv = process.argv.join ( " " );

var res = /URL_VIDEOTECA.*?(http.*?) /.exec ( argv );

if ( res && res[ 1 ] ) {

    var URL_VIDEOTECA = res[ 1 ];
    proccessReplace ( URL_VIDEOTECA );

} else {
    var config = fs.readFileSync ( "config.xml" ).toString ();

    var URL_VIDEOTECA = getValue ( config, "URL_VIDEOTECA" );
    if ( URL_VIDEOTECA ) {
        proccessReplace ( URL_VIDEOTECA );
    } else {
        console.log ( "\n\n" );

        console.log ( "    Para instalação é necessário o parâmetro URL_VIDEOTECA" );
        console.log ( "    Execute:" );
        console.log ( "        cordova plugin add https://github.com/videofront/cordova-plugin-videoteca --variable URL_VIDEOTECA=\"https://SUAVIDEOTECA.videofront.com.br/\"" );

        console.log ( "\n\n" );
        Premisse.reject ( "Erro" );
    }
}

function proccessReplace ( URL_VIDEOTECA ) {
    if ( directoryExists ( "platforms/ios" ) ) {
        replaceUrl ( "platforms/ios/platform_www/plugins/cordova-plugin-videoteca/www/Videoteca.js",
            URL_VIDEOTECA );
        replaceUrl ( "platforms/ios/www/plugins/cordova-plugin-videoteca/www/Videoteca.js",
            URL_VIDEOTECA );
    } else if ( directoryExists ( "platforms/android" ) ) {
        // Cordova Android 7
        if ( directoryExists ( "platforms/android/app/src/main/assets/www/plugins/cordova-plugin-videoteca/www" ) ) {
            replaceUrl ( "platforms/android/app/src/main/assets/www/plugins/cordova-plugin-videoteca/www/Videoteca.js",
                URL_VIDEOTECA );
            replaceUrl ( "platforms/android/app/src/main/assets/www/plugins/cordova-plugin-videoteca/www/Videoteca.js",
                URL_VIDEOTECA );
        } else {
            replaceUrl ( "platforms/android/platform_www/plugins/cordova-plugin-videoteca/www/Videoteca.js",
                URL_VIDEOTECA );
            replaceUrl ( "platforms/android/assets/www/plugins/cordova-plugin-videoteca/www/Videoteca.js",
                URL_VIDEOTECA );
        }
    } else if ( directoryExists ( "platforms/browser" ) ) {
        replaceUrl ( "platforms/browser/www/plugins/cordova-plugin-videoteca/www/Videoteca.js",
            URL_VIDEOTECA );
    }
}

function getValue ( config, name ) {
    var value = config.match ( new RegExp ( name + '.*?value="(.*?)"', "i" ) );
    if ( value && value[ 1 ] ) {
        return value[ 1 ]
    } else {
        return null
    }
}

function replaceUrl ( file, newValue ) {
    var strings = fs.readFileSync ( file ).toString ();
    strings     = strings.replace ( "{URL_VIDEOTECA}", newValue );
    fs.writeFileSync ( file, strings );
}

function fileExists ( path ) {
    try {
        return fs.statSync ( path ).isFile ();
    }
    catch ( e ) {
        return false;
    }
}

function directoryExists ( path ) {
    try {
        return fs.statSync ( path ).isDirectory ();
    }
    catch ( e ) {
        return false;
    }
}

