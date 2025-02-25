const express = require("express");
const { spawn } = require("child_process");

const app = express();
app.use(express.json());

app.post("/start-live", (req, res) => {
  const { platform, streamUrl } = req.body;

  const ffmpeg = spawn("ffmpeg", [
    "-f", "avfoundation",
    "-video_size", "1280x720",
    "-framerate", "30",
    "-i", "0",
    "-c:v", "libx264",
    "-preset", "ultrafast",
    "-b:v", "2500k",
    "-maxrate", "2500k",
    "-bufsize", "5000k",
    "-c:a", "aac",
    "-b:a", "128k",
    "-f", "flv",
    streamUrl
  ]);

  ffmpeg.stderr.on("data", (data) => console.log(data.toString()));
  ffmpeg.on("close", (code) => console.log(`FFmpeg process exited with code ${code}`));

  res.json({ message: `Streaming started on ${platform}` });
});

app.listen(5001, () => console.log("Live Streaming API Running on Port 5001"));
