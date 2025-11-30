## Grading System

This script converts an audio file into text using OpenAI Whisper, then analyzes the spoken response using GPT to give feedback on English fluency, pronunciation, and grammar.

## Features:

Converts any audio input to 16kHz mono WAV using FFmpeg

Sends the audio to OpenAI Whisper for transcription

Sends that transcription to GPT for:

Fluency score (1–5)

Pronunciation score (1–5)

Grammar score (1–5)

Short feedback

Automatically deletes temporary audio files

## Requirements
Node.js

Install from: https://nodejs.org

FFmpeg

Required for audio conversion.
Check if it's installed:

ffmpeg -version


If not installed:

Windows: https://www.gyan.dev/ffmpeg/builds/

macOS: brew install ffmpeg

Linux: sudo apt install ffmpeg

Install dependencies

Run this in your project folder:

npm install node-fetch form-data openai

Set your OpenAI API key

Open transcribe.js and replace:

const OPENAI_API_KEY = "sk-proj--";

with your real key.

## How to Use

Call the function like this in another .js file:

```

import { transcribeAudio } from "./transcribe.js";

async function run() {
  const result = await transcribeAudio("./audioInput.mp3");
  console.log("Transcription:", result.transcription);
  console.log("Feedback:\n", result.feedback);
}

run();
```


The script will automatically:

Convert the file into a .wav

Send it to Whisper

Save a .txt with the transcription

Send that text to GPT-5

Return:
