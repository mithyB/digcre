import Replicate from "replicate";
import { NextResponse } from "next/server";
const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

async function generate(prompt, duration = 16) {
    const input = {
        prompt: `Generate ambient background music without percussion in 120bpm that can be played on repeat (in a loop) for the following scene: "${prompt}"`,
        // prompt: `ambient background music, no percussion, 120bpm, can be played on repeat, description: "${prompt}"`,
        model_version: "stereo-melody-large",
        output_format: "mp3",
        normalization_strategy: "rms",
        duration
    };

    console.log('Running audio generation model...');
    const promise = new Promise(async (resolve, reject) => {

        const output = await replicate.run("meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb", { input }, async (prediction) => {
            console.log('Generating music...', prediction);
            if (prediction.output) {
                console.log('Generated audio');
                resolve(prediction.output);
            }
        });
    });

    return await promise;
}

// In production and preview deployments (on Vercel), the VERCEL_URL environment variable is set.
// In development (on your local machine), the NGROK_HOST environment variable is set.
const WEBHOOK_HOST = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.NGROK_HOST;
 
export async function POST(request) {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error(
      'The REPLICATE_API_TOKEN environment variable is not set. See README.md for instructions on how to set it.'
    );
  }
 
  const { prompt } = await request.json();
 
  const options = {
    version: '8beff3369e81422112d93b89ca01426147de542cd4684c244b673b105188fe5f',
    input: { prompt }
  }
 
  if (WEBHOOK_HOST) {
    options.webhook = `${WEBHOOK_HOST}/api/webhooks`
    options.webhook_events_filter = ["start", "completed"]
  }
 
  // A prediction is the result you get when you run a model, including the input, output, and other details
  const url = await generate(prompt);
 
//   if (prediction?.error) {
//     return NextResponse.json({ detail: prediction.error }, { status: 500 });
//   }
 
  return NextResponse.json(url, { status: 201 });
}





