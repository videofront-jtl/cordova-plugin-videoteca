package com.eduardokraus.videoteca.exoplayer;

import android.app.*;
import android.content.*;
import android.media.PlaybackParams;
import android.net.*;
import android.os.*;
import android.view.*;
import android.widget.*;
import com.google.android.exoplayer2.*;
import com.google.android.exoplayer2.extractor.*;
import com.google.android.exoplayer2.source.*;
import com.google.android.exoplayer2.source.dash.*;
import com.google.android.exoplayer2.source.hls.*;
import com.google.android.exoplayer2.trackselection.*;
import com.google.android.exoplayer2.ui.*;
import com.google.android.exoplayer2.upstream.*;
import com.google.android.exoplayer2.util.*;
import com.squareup.picasso.*;
import org.apache.cordova.*;
import org.json.*;

public class Player {
    private final Activity activity;
    private final CallbackContext callbackContext;
    private final Configuration config;
    private Dialog dialog;
    private SimpleExoPlayer exoPlayer;
    private ImageView imageView;
    private TextView textView;
    private TextView textView2;
    private SimpleExoPlayerView exoView;
    private LinearLayout header;
    private int showTimeoutMs = 5000;

    public Player(Configuration config, Activity activity, CallbackContext callbackContext) {
        this.config = config;
        this.activity = activity;
        this.callbackContext = callbackContext;

    }

    private ExoPlayer.EventListener playerEventListener = new ExoPlayer.EventListener() {
        @Override
        public void onPlayerError(ExoPlaybackException error) {
            JSONObject payload = Payload.playerErrorEvent(Player.this.exoPlayer, error);
            new CallbackResponse(Player.this.callbackContext).send(PluginResult.Status.ERROR, payload, true);
        }

        @Override
        public void onLoadingChanged(boolean isLoading) {
            JSONObject payload = Payload.loadingEvent(Player.this.exoPlayer, isLoading);
            new CallbackResponse(Player.this.callbackContext).send(PluginResult.Status.OK, payload, true);
        }

        @Override
        public void onPlayerStateChanged(boolean playWhenReady, int playbackState) {
            JSONObject payload = Payload.stateChangedEvent(Player.this.exoPlayer, playbackState);
            new CallbackResponse(Player.this.callbackContext).send(PluginResult.Status.OK, payload, true);
        }

        @Override
        public void onPositionDiscontinuity() {
            JSONObject payload = Payload.positionDiscontinuityEvent(Player.this.exoPlayer);
            new CallbackResponse(Player.this.callbackContext).send(PluginResult.Status.OK, payload, true);
        }

        @Override
        public void onTimelineChanged(Timeline timeline, Object manifest) {}

        @Override
        public void onTracksChanged(TrackGroupArray trackGroups, TrackSelectionArray trackSelections) {}
    };

    private DialogInterface.OnDismissListener dismissListener = new DialogInterface.OnDismissListener() {
        @Override
        public void onDismiss(DialogInterface dialog) {
            if (exoPlayer != null) {
                exoPlayer.release();
            }
            exoPlayer = null;
            JSONObject payload = Payload.stopEvent(exoPlayer);
            new CallbackResponse(Player.this.callbackContext).send(PluginResult.Status.OK, payload, true);
        }
    };

    private DialogInterface.OnKeyListener onKeyListener = new DialogInterface.OnKeyListener() {
        @Override
        public boolean onKey(DialogInterface dialog, int keyCode, KeyEvent event) {
            JSONObject payload = Payload.keyEvent(event);
            new CallbackResponse(Player.this.callbackContext).send(PluginResult.Status.OK, payload, true);
            return false;
        }
    };

    private View.OnTouchListener onTouchListener = new View.OnTouchListener() {
        int previousAction = -1;

        @Override
        public boolean onTouch(View v, MotionEvent event) {
            if (Player.this.config.publishRawTouchEvents()) {
                int eventAction = event.getAction();
                if (previousAction != eventAction) {
                    previousAction = eventAction;
                    JSONObject payload = Payload.touchEvent(event);
                    new CallbackResponse(Player.this.callbackContext).send(PluginResult.Status.OK, payload, true);
                }
            }

            if (!config.isVisibleControls() && event.getActionMasked() == MotionEvent.ACTION_DOWN) {
                if (null != header && header.getVisibility() == View.VISIBLE) {
                    hide();
                } else {
                    maybeShowController(true);
                }
            }
            return !config.isVisibleControls();
        }
    };

    private final Runnable hideAction = new Runnable() {
        @Override
        public void run() {
            hide();
        }
    };

    private void maybeShowController(boolean isForced) {
        if (!config.hasHeader() || header == null || exoPlayer == null) {
            return;
        }
        int playbackState = exoPlayer.getPlaybackState();
        boolean showIndefinitely = (playbackState == com.google.android.exoplayer2.ExoPlayer.STATE_IDLE)
                || (playbackState == com.google.android.exoplayer2.ExoPlayer.STATE_ENDED)
                || !exoPlayer.getPlayWhenReady();
        boolean wasShowingIndefinitely = header.getVisibility() == View.VISIBLE && showTimeoutMs <= 0;
        int controllerShowTimeoutMs = 5000;
        showTimeoutMs = showIndefinitely ? 0 : controllerShowTimeoutMs;
        if (isForced || showIndefinitely || wasShowingIndefinitely) {
            show();
        }
    }

    public void show() {
        if (!(header.getVisibility() == View.VISIBLE)) {
            header.setVisibility(View.VISIBLE);
        }
        hideAfterTimeout();
    }

    private void hideAfterTimeout() {
        header.removeCallbacks(hideAction);
        if (showTimeoutMs > 0) {
            header.postDelayed(hideAction, showTimeoutMs);
        }
    }

    public void hide() {
        if (header.getVisibility() == View.VISIBLE) {
            header.setVisibility(View.GONE);
            header.removeCallbacks(hideAction);
        }
    }

    public void createDialog() {
        dialog = new Dialog(this.activity, config.getTheme());
        dialog.setOnKeyListener(onKeyListener);
        dialog.getWindow().getAttributes().windowAnimations = android.R.style.Animation_Toast;
        dialog.requestWindowFeature(Window.FEATURE_NO_TITLE);
        dialog.setCancelable(true);
        dialog.setOnDismissListener(dismissListener);

        FrameLayout mainLayout = LayoutProvider.getMainLayout(this.activity);
        exoView = LayoutProvider.getExoPlayer(this.activity, config, this);
        mainLayout.addView(exoView);
        if (config.hasHeader()) {
            header = LayoutProvider.getLinearLayout(this.activity, config, LinearLayout.HORIZONTAL, config.getHeaderHeight(), config.getHeaderColor(), false);
            header.addView(imageView = LayoutProvider.getImageView(this.activity, config));
            LinearLayout textHolder = LayoutProvider.getLinearLayout(this.activity, config, LinearLayout.VERTICAL, WindowManager.LayoutParams.MATCH_PARENT, "#00FFFFFF", true);
            textHolder.addView(textView = LayoutProvider.getTextView(this.activity, config));
            textHolder.addView(textView2 = LayoutProvider.getTextView(this.activity, config));

            header.addView(textHolder);
            mainLayout.addView(header);
        }
        dialog.setContentView(mainLayout);
        dialog.show();

        afterDialogIsShown();
    }

    private void afterDialogIsShown() {
        dialog.getWindow().setAttributes(LayoutProvider.getLayoutParams(dialog));
        exoView.requestFocus();
        exoView.setOnTouchListener(onTouchListener);
        if (config.hasHeader()) {
            Picasso.with(imageView.getContext())
                    .load(config.getHeaderImage())
                    .into(imageView);
            setTexView(config.getHeaderText());

            if (config.isVisibleControls()) {
                exoView.setControllerVisibilityListener(new PlaybackControlView.VisibilityListener() {
                    @Override
                    public void onVisibilityChange(int visibility) {
                        header.setVisibility(visibility);
                    }
                });
            } else {
                show();
            }
        }
        preparePlayer(config.getUri());
    }

    private void preparePlayer(Uri uri) {
        DefaultBandwidthMeter bandwidthMeter = new DefaultBandwidthMeter();
        TrackSelection.Factory videoTrackSelectionFactory = new AdaptiveVideoTrackSelection.Factory(bandwidthMeter);
        TrackSelector trackSelector = new DefaultTrackSelector(videoTrackSelectionFactory);
        LoadControl loadControl = new DefaultLoadControl();

        exoPlayer = ExoPlayerFactory.newSimpleInstance(this.activity, trackSelector, loadControl);
        exoPlayer.addListener(playerEventListener);

        setSpeed(1f);

        exoView.setPlayer(exoPlayer);

        MediaSource mediaSource = getMediaSource(uri, bandwidthMeter);
        if (mediaSource != null) {
            exoPlayer.prepare(mediaSource);
            exoPlayer.setPlayWhenReady(true);
            JSONObject payload = Payload.startEvent(exoPlayer);
            new CallbackResponse(Player.this.callbackContext).send(PluginResult.Status.OK, payload, true);
        }
    }

    public void setSpeed(float speed) {
        if (exoPlayer == null)
            return;

        if (Build.VERSION.SDK_INT >= 23) {
            PlaybackParams playbackParams = new PlaybackParams();
            playbackParams.setSpeed(speed);
            exoPlayer.setPlaybackParams(playbackParams);
        }
    }

    private MediaSource getMediaSource(Uri uri, DefaultBandwidthMeter bandwidthMeter) {
        String userAgent = Util.getUserAgent(this.activity, config.getUserAgent());
        Handler mainHandler = new Handler();
        HttpDataSource.Factory httpDataSourceFactory = new DefaultHttpDataSourceFactory(userAgent, bandwidthMeter);
        DataSource.Factory dataSourceFactory = new DefaultDataSourceFactory(this.activity, bandwidthMeter, httpDataSourceFactory);

        int type = config.getType();
        if (type == -1)
            type = Util.inferContentType(uri.toString());
        switch (type) {
            case C.TYPE_DASH:
                DefaultDashChunkSource.Factory dashChunkSourceFactory = new DefaultDashChunkSource.Factory(dataSourceFactory);
                return new DashMediaSource(uri, new DefaultDataSourceFactory(this.activity, null, new DefaultHttpDataSourceFactory(userAgent, null)),
                        dashChunkSourceFactory, mainHandler, null);
            case C.TYPE_HLS:
                return new HlsMediaSource(uri, dataSourceFactory, mainHandler, null);
            default:
                ExtractorsFactory extractorsFactory = new DefaultExtractorsFactory();
                return new ExtractorMediaSource(uri, dataSourceFactory, extractorsFactory, mainHandler, null);
        }
    }

    public void close() {
        if (exoPlayer != null) {
            exoPlayer.release();
        }
        exoPlayer = null;
        if (this.dialog != null) {
            dialog.dismiss();
        }
    }

    public void setText(String text) {
        if (textView != null && textView2 != null) {
            setTexView(text);
            if (config.isVisibleControls()) {
                exoView.showController();
            } else {
                show();
            }
        }
    }

    private void setTexView(String text) {
        String[] split = text.split("\n");
        if (split.length > 0) {
            textView.setText(split[0]);
        }
        if (split.length > 1) {
            textView2.setText(split[1]);
        }
    }

    public void setStream(Uri url) {
        if (exoPlayer == null)
            return;

        exoPlayer.release();
        exoPlayer = null;
        preparePlayer(url);
    }

    public void play() {
        if (exoPlayer == null)
            return;

        exoPlayer.setPlayWhenReady(true);
    }

    public void pause() {
        if (exoPlayer == null)
            return;

        exoPlayer.setPlayWhenReady(false);
    }

    public void seekTo(int timeMillis) {
        if (exoPlayer == null)
            return;

        long seekPosition = exoPlayer.getDuration() == 0 ? 0 : Math.min(Math.max(0, timeMillis), exoPlayer.getDuration());
        exoPlayer.seekTo(seekPosition);
    }

    public JSONObject getPlayerState() {
        return Payload.stateEvent(exoPlayer);
    }

    public long getCurrentPosition() {
        if (exoPlayer == null)
            return -1;
        return exoPlayer.getCurrentPosition();
    }

    public long getDuration() {
        if (exoPlayer == null)
            return -1;
        return exoPlayer.getDuration();
    }
}
