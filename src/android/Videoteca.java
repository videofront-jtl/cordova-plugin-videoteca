package com.eduardokraus.videoteca;

import android.view.View;
import android.view.WindowManager;
import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONException;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;

public class Videoteca extends CordovaPlugin {
    private CallbackContext callbackContext;

    private static final String TAG = "VideotecaPlugin: ";

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        this.callbackContext = callbackContext;
        JSONObject options = null;

        try {
            options = args.getJSONObject(1);
        } catch (JSONException e) {
            callbackContext.error(TAG + e.getMessage());
        }

        if (action.equals("playVideo")) {
            return playVideo(args.getString(0), options);
        } else if (action.equals("fullscreenOn")) {
            return fullscreenOn();
        } else if (action.equals("fullscreenOff")) {
            return fullscreenOff();
        } else {
            callbackContext.error(TAG + action + " is not a supported method.");
            return false;
        }
    }

    private boolean playVideo(String url, JSONObject options) {
        return true;
    }

    private boolean fullscreenOn() {
        cordova.getActivity().runOnUiThread(new Runnable() {
            @Override
            public void run() {
                cordova.getActivity().getWindow().clearFlags(WindowManager.LayoutParams.FLAG_FORCE_NOT_FULLSCREEN);
                cordova.getActivity().getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
            }
        });

        callbackContext.success();
        return true;
    }

    private boolean fullscreenOff() {
        cordova.getActivity().runOnUiThread(new Runnable() {
            @Override
            public void run() {
                cordova.getActivity().getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_VISIBLE);
            }
        });

        callbackContext.success();
        return true;
    }
}