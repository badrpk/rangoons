import React, { useRef, useEffect } from "react";
import { View, Button } from "react-native";
import { MediaStream, RTCView, mediaDevices } from "react-native-webrtc";

const LiveStream = () => {
  const streamRef = useRef(null);

  useEffect(() => {
    const startStream = async () => {
      const devices = await mediaDevices.enumerateDevices();
      const videoSourceId = devices.find(device => device.kind === 'videoinput')?.deviceId;

      const stream = await mediaDevices.getUserMedia({
        video: { facingMode: "user", deviceId: videoSourceId },
        audio: true,
      });

      streamRef.current = stream;
    };

    startStream();
  }, []);

  const startBroadcast = () => {
    fetch("https://your-backend-api/start-live", {
      method: "POST",
      body: JSON.stringify({ platform: "YouTube", streamUrl: "rtmp://a.rtmp.youtube.com/live2/YOUR-STREAM-KEY" }),
      headers: { "Content-Type": "application/json" },
    }).then(response => console.log("Streaming Started"));
  };

  return (
    <View>
      <RTCView streamURL={streamRef.current?.toURL()} style={{ width: "100%", height: 300 }} />
      <Button title="Start Live Streaming" onPress={startBroadcast} />
    </View>
  );
};

export default LiveStream;
