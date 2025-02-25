package com.castapp

import android.os.Bundle
import android.view.KeyEvent
import androidx.activity.ComponentActivity
import android.widget.Toast
import com.pedro.rtplibrary.rtmp.RtmpCamera1
import com.pedro.rtplibrary.base.Camera1Base
import android.view.SurfaceView

class MainActivity : ComponentActivity() {
    private lateinit var rtmpCamera: RtmpCamera1
    private val streamURL = "rtmp://live.tiktok.com/user"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val surfaceView = findViewById<SurfaceView>(R.id.surfaceView)
        rtmpCamera = RtmpCamera1(surfaceView, this)

        Toast.makeText(this, "Press Volume Down to Start Streaming", Toast.LENGTH_LONG).show()
    }

    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        if (keyCode == KeyEvent.KEYCODE_VOLUME_DOWN) {
            if (!rtmpCamera.isStreaming) {
                rtmpCamera.startStream(streamURL)
                Toast.makeText(this, "Live Streaming Started", Toast.LENGTH_SHORT).show()
            } else {
                rtmpCamera.stopStream()
                Toast.makeText(this, "Streaming Stopped", Toast.LENGTH_SHORT).show()
            }
        }
        return super.onKeyDown(keyCode, event)
    }
}
