package com.eduardokraus.videoteca.exoplayer;

import android.net.*;
import org.apache.cordova.*;
import org.json.*;

public class Plugin extends CordovaPlugin {
    public static Player player;

    @Override
    public boolean execute(String action, JSONArray data, final CallbackContext callbackContext) throws JSONException {
        try {
            if (action.equals("show")) {
                if (player != null) {
                    player.close();
                }
                player = new Player(new Configuration(data.getJSONObject(0)), cordova.getActivity(), callbackContext);
                cordova.getActivity().runOnUiThread(new Runnable() {
                    public void run() {
                        player.createDialog();
                    }
                });

                new CallbackResponse(callbackContext).send(PluginResult.Status.NO_RESULT, true);
                return true;
            } else if (action.equals("setText")) {
                if (player == null) {
                    return false;
                }
                final String message = data.optString(0, "");
                cordova.getActivity().runOnUiThread(new Runnable() {
                    public void run() {
                        player.setText(message);
                    }
                });

                new CallbackResponse(callbackContext).send(PluginResult.Status.NO_RESULT, true);
                return true;
            } else if (action.equals("setStream")) {
                if (player == null) {
                    return false;
                }
                final String url = data.optString(0, "");
                cordova.getActivity().runOnUiThread(new Runnable() {
                    public void run() {
                        player.setStream(Uri.parse(url));
                    }
                });

                new CallbackResponse(callbackContext).send(PluginResult.Status.NO_RESULT, true);
                return true;
            } else if (action.equals("play")) {
                if (player == null) {
                    return false;
                }
                cordova.getActivity().runOnUiThread(new Runnable() {
                    public void run() {
                        player.play();
                    }
                });

                new CallbackResponse(callbackContext).send(PluginResult.Status.NO_RESULT, true);
                return true;
            } else if (action.equals("pause")) {
                if (player == null) {
                    return false;
                }
                cordova.getActivity().runOnUiThread(new Runnable() {
                    public void run() {
                        player.pause();
                    }
                });

                new CallbackResponse(callbackContext).send(PluginResult.Status.NO_RESULT, true);
                return true;
            } else if (action.equals("seekTo")) {
                if (player == null) {
                    return false;
                }
                final int seekTime = data.optInt(0, 0);
                cordova.getActivity().runOnUiThread(new Runnable() {
                    public void run() {
                        player.seekTo(seekTime);
                    }
                });

                new CallbackResponse(callbackContext).send(PluginResult.Status.NO_RESULT, true);
                return true;
            } else if (action.equals("getState")) {
                if (player == null) {
                    return false;
                }
                cordova.getActivity().runOnUiThread(new Runnable() {
                    public void run() {
                        JSONObject response = player.getPlayerState();
                        new CallbackResponse(callbackContext).send(PluginResult.Status.OK, response, false);
                    }
                });

                new CallbackResponse(callbackContext).send(PluginResult.Status.NO_RESULT, true);
                return true;
            } else if (action.equals("close")) {
                if (player != null) {
                    player.close();
                    new CallbackResponse(callbackContext).send(PluginResult.Status.OK, false);
                }
                player = null;
                return true;
            } else {
                new CallbackResponse(callbackContext).send(PluginResult.Status.INVALID_ACTION, false);
                return false;
            }
        } catch (Exception e) {
            new CallbackResponse(callbackContext).send(PluginResult.Status.JSON_EXCEPTION, false);
            return false;
        }
    }
}
