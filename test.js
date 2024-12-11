import { AudioContext } from 'node-web-audio-api';
import Replicate from 'replicate';
const replicate = new Replicate({
  auth: 'xxx',
});

class BackgroundMusicPlayer {
  _context = new AudioContext();
  _trackNumber = 0;
  _currentGainNode;
  _currentSource;

  async playLoadingSound(prompt) {
    console.log('Start generating loading sound...');

    await this.play(
      `${prompt}, loading sound, single note, soothing, declick, no reverb`,
      1,
    );
  }

  async play(prompt, duration = 16) {
    this._trackNumber++;
    console.log(`Start generating music (track ${this._trackNumber})...`);

    const newGainNode = this._context.createGain();
    newGainNode.connect(this._context.destination);
    console.log('Created and connected gain node');

    const input = {
      prompt: `Generate ambient background music without percussion in 120bpm that can be played on repeat (in a loop) for the following scene: "${prompt}"`,
      // prompt: `ambient background music, no percussion, 120bpm, can be played on repeat, description: "${prompt}"`,
      model_version: 'stereo-melody-large',
      output_format: 'mp3',
      normalization_strategy: 'rms',
      duration,
    };

    console.log('Running audio generation model...');
    const promise = new Promise(async (resolve, reject) => {
      let hasResolved = false;

      const output = await replicate.run(
        'meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb',
        { input },
        async (prediction) => {
          console.log('Generating music...', prediction);
          if (hasResolved) return;

          const audioStreamUrl = prediction.urls.stream;

          // stream audio buffer from url and play it (without browser)
          const audioStream = await fetch(audioStreamUrl);
          const audioBuffer = await audioStream.arrayBuffer();
          const audioData = new Uint8Array(audioBuffer);
          try {
            const audioBufferData = await this._context.decodeAudioData(
              audioData.buffer,
            );
            resolve(audioBufferData);
            hasResolved = true;
          } catch (error) {
            reject(error);
          }
        },
      );
    });
    const audioBuffer = await promise;
    console.log('Generated audio');

    if (true) {
      console.log('Press enter to play next song...');
      await new Promise((resolve) =>
        process.stdin.once('data', () => resolve()),
      );
      console.log('Playing next song...');
    }

    if (!this._currentGainNode) {
      // this._currentSource = await this._playLoopingStreamWithCrossfade(output, newGainNode);
      this._currentSource = await this._playLoopingStreamWithCrossfade2(
        audioBuffer,
        newGainNode,
      );
    } else {
      this._currentSource = await this._crossfadeToNewStream2(
        audioBuffer,
        newGainNode,
        16,
      );
    }

    this._currentGainNode = newGainNode;

    console.log(`Currently playing (track ${this._trackNumber}): ${prompt}`);
  }

  async _playLoopingStreamWithCrossfade2(audioBuffer, gainNode) {
    console.log('Start reading audio buffer...');
    // const reader = stream.getReader();
    // const chunks = [];

    // // Read the stream
    // while (true) {
    //     const { done, value } = await reader.read();
    //     if (done) break;
    //     chunks.push(value);
    // }

    // // chunks.push(...chunks); // Loop the audio
    // // chunks.push(...chunks); // Loop the audio
    // // chunks.push(...chunks); // Loop the audio

    // // Concatenate all chunks into a single Uint8Array
    // const audioData = new Uint8Array(chunks.reduce((acc, chunk) => acc.concat(Array.from(chunk)), []));
    // const audioBuffer = await this._context.decodeAudioData(audioData.buffer);

    console.log('Playing audio buffer...');

    // Create a buffer source and set it to loop
    const source = this._context.createBufferSource();
    source.buffer = audioBuffer;
    source.loop = true;
    source.loopStart = 0.1;
    source.loopEnd = 15.9;
    source.connect(gainNode);
    source.start();

    console.log('Audio playing');

    return source;
  }

  async _crossfadeToNewStream2(audioBuffer, newGainNode, crossfadeTime) {
    console.log('Crossfading currently playing audio to new audio...');

    const newSource = await this._playLoopingStreamWithCrossfade2(
      audioBuffer,
      newGainNode,
    );
    console.log('New audio available. Start crossfading...');

    // Crossfade from old source to new source
    const currentTime = this._context.currentTime;
    this._currentGainNode.gain.setValueAtTime(1, currentTime);
    this._currentGainNode.gain.linearRampToValueAtTime(
      0,
      currentTime + crossfadeTime,
    );

    newGainNode.gain.setValueAtTime(0, currentTime);
    newGainNode.gain.linearRampToValueAtTime(1, currentTime + crossfadeTime);

    // Stop the old source after the crossfade
    this._currentSource.stop(currentTime + crossfadeTime);

    console.log('Crossfading done. Stopping old audio');

    return newSource;
  }

  async _playLoopingStreamWithCrossfade(stream, gainNode) {
    console.log('Start reading audio buffer...');
    const reader = stream.getReader();
    const chunks = [];

    // Read the stream
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    // chunks.push(...chunks); // Loop the audio
    // chunks.push(...chunks); // Loop the audio
    // chunks.push(...chunks); // Loop the audio

    // Concatenate all chunks into a single Uint8Array
    const audioData = new Uint8Array(
      chunks.reduce((acc, chunk) => acc.concat(Array.from(chunk)), []),
    );
    const audioBuffer = await this._context.decodeAudioData(audioData.buffer);

    console.log('Playing audio buffer...');

    // Create a buffer source and set it to loop
    const source = this._context.createBufferSource();
    source.buffer = audioBuffer;
    source.loop = true;
    source.loopStart = 0.1;
    source.loopEnd = 15.9;
    source.connect(gainNode);
    // source.start();

    console.log('Audio playing');

    return source;
  }

  async _crossfadeToNewStream(newStream, newGainNode, crossfadeTime) {
    console.log('Crossfading currently playing audio to new audio...');

    const newSource = await this._playLoopingStreamWithCrossfade(
      newStream,
      newGainNode,
    );
    console.log('New audio available. Start crossfading...');

    // Crossfade from old source to new source
    const currentTime = this._context.currentTime;
    this._currentGainNode.gain.setValueAtTime(1, currentTime);
    this._currentGainNode.gain.linearRampToValueAtTime(
      0,
      currentTime + crossfadeTime,
    );

    newGainNode.gain.setValueAtTime(0, currentTime);
    newGainNode.gain.linearRampToValueAtTime(1, currentTime + crossfadeTime);

    // Stop the old source after the crossfade
    this._currentSource.stop(currentTime + crossfadeTime);

    console.log('Crossfading done. Stopping old audio');

    return newSource;
  }
}

async function playLoopingStreamWithCrossfade(stream, context, gainNode) {
  const reader = stream.getReader();
  const chunks = [];

  // Read the stream
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  chunks.push(...chunks); // Loop the audio
  chunks.push(...chunks); // Loop the audio
  chunks.push(...chunks); // Loop the audio

  // Concatenate all chunks into a single Uint8Array
  const audioData = new Uint8Array(
    chunks.reduce((acc, chunk) => acc.concat(Array.from(chunk)), []),
  );
  const audioBuffer = await context.decodeAudioData(audioData.buffer);

  // Create a buffer source and set it to loop
  const source = context.createBufferSource();
  source.buffer = audioBuffer;
  source.loop = true;
  source.connect(gainNode);
  source.start();

  return source;
}

async function crossfadeToNewStream(
  oldSource,
  newStream,
  context,
  oldGainNode,
  newGainNode,
  crossfadeTime,
) {
  console.log('switch');

  const newSource = await playLoopingStreamWithCrossfade(
    newStream,
    context,
    newGainNode,
    crossfadeTime,
  );

  // Crossfade from old source to new source
  const currentTime = context.currentTime;
  oldGainNode.gain.setValueAtTime(1, currentTime);
  oldGainNode.gain.linearRampToValueAtTime(0, currentTime + crossfadeTime);

  newGainNode.gain.setValueAtTime(0, currentTime);
  newGainNode.gain.linearRampToValueAtTime(1, currentTime + crossfadeTime);

  // Stop the old source after the crossfade
  oldSource.stop(currentTime + crossfadeTime);

  return newSource;
}

async function generateAndPlayMusic() {
  const context = new AudioContext();

  const currentGainNode = context.createGain();
  currentGainNode.connect(context.destination);

  const input = {
    prompt: 'ambient background music, no percussion, 120bpm, looping',
    model_version: 'stereo-large',
    output_format: 'mp3',
    normalization_strategy: 'peak',
    duration: 16,
  };

  const output = await replicate.run(
    'meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb',
    { input },
  );

  console.log(output);

  // Play the initial loop
  let currentSource = await playLoopingStreamWithCrossfade(
    output,
    context,
    currentGainNode,
  );

  // Simulate a button click after some time to crossfade to a new loop
  setTimeout(async () => {
    console.log('lets go, change to new music');

    const newOutput = await replicate.run(
      'meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb',
      { input },
    );
    const newGainNode = context.createGain();
    newGainNode.connect(context.destination);

    currentSource = await crossfadeToNewStream(
      currentSource,
      newOutput,
      context,
      currentGainNode,
      newGainNode,
      16,
    );
  }, 1000); // Change to a new loop after 10 seconds
}

// generateAndPlayMusic().catch(console.error);

const player = new BackgroundMusicPlayer();
// player.playLoadingSound('happy cozy village, welcoming');
// await player.play('happy cozy village, welcoming');
// await player.play('adventure in the forest, mysterious');
// await player.play('scary haunted house, spooky');
// await player.play('final boss fight, epic');
// await player.play('happy cozy village, relieving');

// player.playLoadingSound('Mood: Calm, ordinary Setting: A quaint town, local library Cultural Context: Modern, small-town life Character Theme: Clara’s routine and contentment with her simple life Narrative Arc: Introduction of Clara and her everyday world');
await player.play(`
    Mood: Calm, ordinary
    Setting: A quaint town, local library
    Cultural Context: Modern, small-town life
    Character Theme: Clara's routine and contentment with her simple life
    Narrative Arc: Introduction of Clara and her everyday world`);
await player.play(`
    Mood: Curious, slightly uneasy
    Setting: An unfamiliar alley at dusk
    Cultural Context: Small-town atmosphere, typical evening
    Character Theme: Clara's curiosity and willingness to explore new paths
    Narrative Arc: Disruption of the routine, hint of something unusual`);
await player.play(`
    Mood: Mysterious, eerie
    Setting: Foggy, distorted alley
    Cultural Context: Transitioning into a liminal space
    Character Theme: Clara's determination despite growing uncertainty 
    Narrative Arc: Building tension, Clara's isolation increases`);
await player.play(`
    Mood: Intrigued, mystical
    Setting: Inside "Ethereal Curiosities" shop
    Cultural Context: Magical, timeless
    Character Theme: Clara's encounter with the unknown
    Narrative Arc: Introduction of the magical element and the mysterious shopkeeper`);
await player.play(`
    Mood: Surreal, calm
    Setting: Inside the shop
    Cultural Context: Liminal space, between worlds
    Character Theme: Clara's acceptance of the magical reality
    Narrative Arc: Deepening of the mystery, key to the journey given`);
await player.play(`
    Mood: Anxious, hopeful
    Setting: Foggy alley
    Cultural Context: Liminal, shifting
    Character Theme: Clara's persistence and hope 
    Narrative Arc: Journey towards finding the way back, encounter with the ancient door`);
await player.play(`
    Mood: Enlightened, relieved
    Setting: Transition from the alley to Clara's apartment
    Cultural Context: Return to the familiar world
    Character Theme: Clara's awakening to new possibilities
    Narrative Arc: Resolution of the immediate journey, lingering sense of mystery`);
await player.play(`
    Mood: Reflective, curious
    Setting: Clara's normal life
    Cultural Context: Everyday life with a touch of the fantastical
    Character Theme: Clara's awareness of the magical
    Narrative Arc: Conclusion, hint at future adventures`);
