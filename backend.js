
import fs from "fs";
import fetch from "node-fetch";
import FormData from "form-data";
import { exec } from "child_process";
import OpenAI from "openai";

const OPENAI_API_KEY = "REPLACE WITH YOUR OPEN AI API KEY";
const client = new OpenAI({ apiKey: OPENAI_API_KEY });

export async function transcribeAudio(inputPath) {
  const outputPath = inputPath + ".wav";
  const transcriptionPath = inputPath + ".txt"; //  where we save the text

  return new Promise((resolve, reject) => {
    exec(
      `ffmpeg -y -i ${inputPath} -ar 16000 -ac 1 -filter:a "volume=5dB" ${outputPath}`,
      async (err) => {
        if (err) {
          console.error("ffmpeg error:", err);
          fs.unlinkSync(inputPath);
          return reject("Audio conversion failed");
        }

        try {
          // ---- WHISPER TRANSCRIPTION ----
          const audioFile = fs.createReadStream(outputPath);
          const form = new FormData();
          form.append("file", audioFile);
          form.append("model", "whisper-1");

          const whisperRes = await fetch(
            "https://api.openai.com/v1/audio/transcriptions",
            {
              method: "POST",
              headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
              body: form,
            }
          );

          const whisperData = await whisperRes.json();
          const transcription = whisperData.text || "No transcription received";

          // ✅ Save transcription to .txt file
          fs.writeFileSync(transcriptionPath, transcription, "utf8");

          // ---- GPT FEEDBACK ----
          // Read the transcription text from file
          const transcriptionText = fs.readFileSync(transcriptionPath, "utf8");

          const gptRes = await client.chat.completions.create({
            model: "gpt-5",
            messages: [
              {
                role: "system",
                content:
                  "You are an English teacher. Read the following transcription file content and grade the student's spoken response on Fluency, Pronunciation, and Grammar (1–5) with 1 being the lowest and 5 being the highest. Provide concise feedback.",
              },
              {
                role: "user",
                content: `Here is the student's transcribed answer:\n\n${transcriptionText}`,
              },
            ],
          });

          const feedback = gptRes.choices[0].message.content;

          // Clean up audio files
          fs.unlinkSync(inputPath);
          fs.unlinkSync(outputPath);

          // (Optional) keep .txt file for records — or uncomment to delete
          // fs.unlinkSync(transcriptionPath);

          resolve({ transcription, feedback, transcriptionFile: transcriptionPath });
        } catch (error) {
          console.error("Processing failed:", error);
          fs.unlinkSync(inputPath);
          fs.unlinkSync(outputPath);
          reject("Processing failed");
        }
      }
    );
  });
}
