package com.eduardokraus.videoteca.exoplayer;

import com.google.android.exoplayer2.*;
import android.net.*;
import android.view.*;
import org.json.*;

public class Configuration {

    public static final String DASH = "dash";

    private final JSONObject config;
    private final JSONObject header;

    public Configuration(JSONObject config) {
        this.config = config;
        this.header = config.optJSONObject("header");
    }

    public final Uri getUri() {
        return Uri.parse(config.optString("url", ""));
    }

    public int getType() {
        String type = config.optString("type", "videoteca");

        if (type.equals("dash"))
            return C.TYPE_DASH;
        else if (type.equals("hls"))
            return C.TYPE_HLS;
        else if (type.equals("videoteca")) {
            String url = config.optString("url", "");
            if (url.indexOf("data.drm") > 0)
                return C.SELECTION_REASON_TRICK_PLAY;
            return C.TYPE_HLS;
        } else if (type.equals("mp4"))
            return C.TYPE_OTHER;

        return -1;
    }

    public String getUserAgent() {
        return this.config.optString("user_agent", "PluginExoPlayer");
    }

    public boolean isVisibleControls() {
        return config.optBoolean("plugin_controls_visible", true);
    }

    public boolean hasHeader() {
        return this.header != null;
    }

    public int getHeaderHeight() {
        return header.optInt("height", 150);
    }

    public int getPadding() {
        return header.optInt("padding", 20);
    }

    public int getTextSize() {
        return header.optInt("text_size", 16);
    }

    public String getHeaderColor() {
        return header.optString("background_color", "#33F0F8FF");
    }

    public String getHeaderImage() {
        return header.optString("image_url", "");
    }

    public String getHeaderTextColor() {
        return header.optString("text_color", "#BBFAA8EF");
    }

    public int getHeaderTextGravity() {
        String align = header.optString("text_align", "left");
        if (align.equalsIgnoreCase("center")) {
            return Gravity.CENTER;
        } else if (align.equalsIgnoreCase("right")) {
            return Gravity.RIGHT;
        } else {
            return Gravity.LEFT;
        }
    }

    public int getConnectTimeout() {
        return config.optInt("connectTimeout", 10000); // Default 10 sec.
    }

    public int getReadTimeout() {
        return config.optInt("readTimeout", 10000); // Default 10 sec.
    }

    public int getRetryCount() {
        return config.optInt("retryCount", 10);
    }

    public String getHeaderText() {
        return header.optString("text", "");
    }

    public boolean isAspectRatioFillScreen() {
        return config.optString("aspect_ratio", "fit_screen").equalsIgnoreCase("fill_screen");
    }

    public boolean isFullscreen() {
        return config.optBoolean("full_screen", true);
    }

    public boolean publishRawTouchEvents() {
        return config.optBoolean("raw_touch_events", false);
    }

    public int getTheme() {
        int themeFullscreen = android.R.style.Theme_Black_NoTitleBar_Fullscreen;
        int themeNoTitleBar = android.R.style.Theme_NoTitleBar;
        return isFullscreen() ? themeFullscreen : themeNoTitleBar;
    }


    public final JSONObject getDimensions() {
        return config.optJSONObject("dimensions");
    }

    public final JSONObject getController() {
        return config.optJSONObject("controller");
    }

    public int getHideTimeout() {
        return config.optInt("hideTimeout", 5000); // Default 5 sec.
    }

    public int getForwardTimeMs() {
        return config.optInt("forwardTime", 60000); // Default 1 min.
    }

    public int getRewindTimeMs() {
        return config.optInt("rewindTime", 60000); // Default 1 min.
    }

    public String getSubtitleUrl() {
        return config.optString("subtitleUrl", null);
    }
}