package com.eduardokraus.videoteca.exoplayer;

import android.app.Activity;
import android.util.Log;
import android.view.View;
import android.widget.AdapterView;


public class SpeedActivity extends Activity implements AdapterView.OnItemSelectedListener {

    private Player _player;

    public SpeedActivity(Player player) {
        _player = player;
    }

    public void onItemSelected(AdapterView<?> parent, View v, int position, long id) {

        Log.d("KRAUS SpeedActivity", "position: " + position);
        Log.d("KRAUS SpeedActivity", "id: " + id);

        // "0.5x", "0.75x", "1x", "1.25x", "1.5x", "2x"
        switch (position) {
            case 0:
                _player.setSpeed(0.5f);
                break;
            case 1:
                _player.setSpeed(0.75f);
                break;
            case 2:
                _player.setSpeed(1f);
                break;
            case 3:
                _player.setSpeed(1.25f);
                break;
            case 4:
                _player.setSpeed(1.5f);
                break;
            case 5:
                _player.setSpeed(2f);
                break;
        }
    }

    @Override
    public void onNothingSelected(AdapterView<?> parent) {

    }
}
