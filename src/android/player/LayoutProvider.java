package com.eduardokraus.videoteca.exoplayer;

import android.app.*;
import android.graphics.*;
import android.os.Build;
import android.view.*;
import android.widget.*;
import com.google.android.exoplayer2.ui.*;

public class LayoutProvider {

    public static FrameLayout getMainLayout(Activity activity) {
        FrameLayout view = new FrameLayout(activity);
        view.setLayoutParams(new LinearLayout.LayoutParams(WindowManager.LayoutParams.MATCH_PARENT, WindowManager.LayoutParams.MATCH_PARENT));
        view.setKeepScreenOn(true);

        return view;
    }

    public static LinearLayout getLinearLayout(Activity activity, Configuration config, int orientation, int height, String headerColor, boolean hasPadding) {
        LinearLayout view = new LinearLayout(activity);
        LinearLayout.LayoutParams layoutParams = new LinearLayout.LayoutParams(WindowManager.LayoutParams.MATCH_PARENT, height);
        view.setLayoutParams(layoutParams);
        view.setBackgroundColor(Color.parseColor(headerColor));
        view.setOrientation(orientation);

        if (hasPadding) {
            int padding = config.getPadding();
            view.setPadding(padding, padding, padding, padding);
        }

        return view;
    }

    public static ImageView getImageView(Activity activity, Configuration config) {
        ImageView view = new ImageView(activity);
        LinearLayout.LayoutParams layoutParams = new LinearLayout.LayoutParams(config.getHeaderHeight() / 9 * 16, config.getHeaderHeight());
        view.setLayoutParams(layoutParams);
        int padding = config.getPadding();
        view.setPadding(padding, padding, 0, padding);

        return view;
    }

    public static TextView getTextView(Activity activity, Configuration config) {
        TextView view = new TextView(activity);
        LinearLayout.LayoutParams layoutParams = new LinearLayout.LayoutParams(WindowManager.LayoutParams.MATCH_PARENT, WindowManager.LayoutParams.MATCH_PARENT);
        layoutParams.gravity = Gravity.CENTER;
        layoutParams.weight = 1;
        view.setLayoutParams(layoutParams);
        view.setTextColor(Color.parseColor(config.getHeaderTextColor()));
        view.setGravity(config.getHeaderTextGravity() | Gravity.CENTER_VERTICAL);
        //view.setEllipsize(TextUtils.TruncateAt.END );
        //view.setSingleLine();
        view.setTextSize(config.getTextSize());

        return view;
    }

    public static SimpleExoPlayerView getExoPlayer(Activity activity, Configuration config, Player player) {
        SimpleExoPlayerView view = new SimpleExoPlayerView(activity);
        view.setUseController(config.isVisibleControls());
        view.setLayoutParams(new LinearLayout.LayoutParams(WindowManager.LayoutParams.MATCH_PARENT, WindowManager.LayoutParams.MATCH_PARENT));
        if (config.isAspectRatioFillScreen()) {
            view.setResizeMode(AspectRatioFrameLayout.RESIZE_MODE_FILL);
        }

        //if (null != config.getController()) {
        //view.setUseController(true);

        if (Build.VERSION.SDK_INT >= 23) {
            Spinner dropdown = (Spinner) findView(view, activity, "exo_speed");
            String[] items = new String[]{"0.5x", "0.75x", "1x", "1.25x", "1.5x", "2x"};
            ArrayAdapter<String> adapter = new ArrayAdapter<String>(activity, android.R.layout.simple_spinner_dropdown_item, items);

            dropdown.setAdapter(adapter);
            dropdown.setVisibility(View.VISIBLE);
            dropdown.setSelection(2);

            dropdown.setOnItemSelectedListener(new SpeedActivity(player));
        }
        //}

        return view;
    }

    public static WindowManager.LayoutParams getLayoutParams(Dialog dialog) {
        WindowManager.LayoutParams lp = new WindowManager.LayoutParams();
        lp.copyFrom(dialog.getWindow().getAttributes());
        lp.width = WindowManager.LayoutParams.MATCH_PARENT;
        lp.height = WindowManager.LayoutParams.MATCH_PARENT;

        return lp;
    }

    private static View findView(View view, Activity activity, String name) {
        int viewId = activity.getResources().getIdentifier(name, "id", activity.getPackageName());
        return view.findViewById(viewId);
    }
}
