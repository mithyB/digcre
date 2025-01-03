import { NextResponse } from 'next/server';
import Replicate from 'replicate';
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

async function generate(prompt) {
  const input = {
    prompt,
    max_new_tokens: 2048,
    system_prompt: `You are a music composer and give an outline for each paragraph of the given story that contains the following information: Mood, setting, cultural context, character theme, narrative arc. Please also consider previous paragraphs when defining more later ones.  Output as JSON string array.`,
  };

  const output = await replicate.run('meta/meta-llama-3-8b-instruct', {
    input,
  });
  const joinedOutput = output.join('').toLowerCase();

  console.log('Output:', joinedOutput);

  const arrayFinderRegex =
    /[.\w\W\d\D\s\S]*(\[[.\w\W\d\D\s\S]*\])[.\w\W\d\D\s\S]*/gm;
  const array = arrayFinderRegex.exec(joinedOutput);
  const json = JSON.parse(array[1]);

  console.log('Generated outline:', json);

  return json;
}

// In production and preview deployments (on Vercel), the VERCEL_URL environment variable is set.
// In development (on your local machine), the NGROK_HOST environment variable is set.
const WEBHOOK_HOST = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.NGROK_HOST;

export async function POST(request) {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error(
      'The REPLICATE_API_TOKEN environment variable is not set. See README.md for instructions on how to set it.',
    );
  }

  const { prompt } = await request.json();

  const options = {
    version: '8beff3369e81422112d93b89ca01426147de542cd4684c244b673b105188fe5f',
    input: { prompt },
  };

  if (WEBHOOK_HOST) {
    options.webhook = `${WEBHOOK_HOST}/api/webhooks`;
    options.webhook_events_filter = ['start', 'completed'];
  }

  // A prediction is the result you get when you run a model, including the input, output, and other details
  const outline = await generate(prompt);

  //   if (prediction?.error) {
  //     return NextResponse.json({ detail: prediction.error }, { status: 500 });
  //   }

  return NextResponse.json(outline, { status: 201 });
}
