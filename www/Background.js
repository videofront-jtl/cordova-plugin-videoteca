"use strict";

var exec = require ( 'cordova/exec' );

var CordovaBackground = {

    _isEnabled : false,

    enable : function () {
        if ( this._isEnabled )
            return;

        this._isEnabled = true;

        exec ( CordovaBackground._status, CordovaBackground._status, 'BackgroundMode', 'enable', [] );
    },

    disable : function () {
        if ( !this._isEnabled )
            return;

        this._isEnabled = false;

        exec ( CordovaBackground._status, CordovaBackground._status, 'BackgroundMode', 'disable', [] );
    },

    _status : function ( status ) {
        console.log ( status );
    }
};

module.exports = CordovaBackground;
