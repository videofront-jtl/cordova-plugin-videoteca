"use strict";

var exec = require ( 'cordova/exec' );

var CordovaBackground = {

    _isEnabled : false,

    enable : function () {
        if ( this._isEnabled )
            return;

        this._isEnabled = true;

        exec ( null, null, 'BackgroundMode', 'enable', [] );
    },

    disable : function () {
        if ( !this._isEnabled )
            return;

        this._isEnabled = false;

        exec ( null, null, 'BackgroundMode', 'disable', [] );
    }
};

module.exports = CordovaBackground;
