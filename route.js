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

    await this.generateAndPlay(
      `${prompt}, loading sound, single note, soothing, declick, no reverb`,
      1,
    );
  }

  async generate(prompt, duration = 16) {
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
      const output = await replicate.run(
        'meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb',
        { input },
        async (prediction) => {
          console.log('Generating music...', prediction);
          if (prediction.output) {
            console.log('Generated audio');
            resolve(prediction.output);
          }
        },
      );
    });

    return await promise;
  }

  async play(url, newGainNode) {
    console.log('Start playing audio...', url);

    // stream audio buffer from url and play it (without browser)
    const audioStream = await fetch(url);
    const arrayBuffer = await audioStream.arrayBuffer();

    const audioData = new Uint8Array(arrayBuffer);
    const audioBuffer = await this._context.decodeAudioData(audioData.buffer);

    if (!this._currentGainNode) {
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

    console.log(`Currently playing (track ${this._trackNumber}): ${url}`);
  }

  async generateAndPlay(prompt, duration = 16) {
    this._trackNumber++;
    console.log(`Start generating music (track ${this._trackNumber})...`);

    const newGainNode = this._context.createGain();
    newGainNode.connect(this._context.destination);
    console.log('Created and connected gain node');

    const url = await this.generate(prompt, duration);

    if (true) {
      console.log('Press enter to play next song...');
      await new Promise((resolve) =>
        process.stdin.once('data', () => resolve()),
      );
      console.log('Playing next song...');
    }

    await this.play(url, newGainNode);
  }

  async _playLoopingStreamWithCrossfade2(audioBuffer, gainNode) {
    console.log('Start reading audio buffer...');
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

// generateAndPlayMusic().catch(console.error);

const player = new BackgroundMusicPlayer();
// player.playLoadingSound('happy cozy village, welcoming');
// await player.play('happy cozy village, welcoming');
// await player.play('adventure in the forest, mysterious');
// await player.play('scary haunted house, spooky');
// await player.play('final boss fight, epic');
// await player.play('happy cozy village, relieving');

// player.playLoadingSound('Mood: Calm, ordinary Setting: A quaint town, local library Cultural Context: Modern, small-town life Character Theme: Clara’s routine and contentment with her simple life Narrative Arc: Introduction of Clara and her everyday world');
await player.generateAndPlay(`
    Mood: Calm, ordinary
    Setting: A quaint town, local library
    Cultural Context: Modern, small-town life
    Character Theme: Clara's routine and contentment with her simple life
    Narrative Arc: Introduction of Clara and her everyday world`);
await player.generateAndPlay(`
    Mood: Curious, slightly uneasy
    Setting: An unfamiliar alley at dusk
    Cultural Context: Small-town atmosphere, typical evening
    Character Theme: Clara's curiosity and willingness to explore new paths
    Narrative Arc: Disruption of the routine, hint of something unusual`);
await player.generateAndPlay(`
    Mood: Mysterious, eerie
    Setting: Foggy, distorted alley
    Cultural Context: Transitioning into a liminal space
    Character Theme: Clara's determination despite growing uncertainty 
    Narrative Arc: Building tension, Clara's isolation increases`);
await player.generateAndPlay(`
    Mood: Intrigued, mystical
    Setting: Inside "Ethereal Curiosities" shop
    Cultural Context: Magical, timeless
    Character Theme: Clara's encounter with the unknown
    Narrative Arc: Introduction of the magical element and the mysterious shopkeeper`);
await player.generateAndPlay(`
    Mood: Surreal, calm
    Setting: Inside the shop
    Cultural Context: Liminal space, between worlds
    Character Theme: Clara's acceptance of the magical reality
    Narrative Arc: Deepening of the mystery, key to the journey given`);
await player.generateAndPlay(`
    Mood: Anxious, hopeful
    Setting: Foggy alley
    Cultural Context: Liminal, shifting
    Character Theme: Clara's persistence and hope 
    Narrative Arc: Journey towards finding the way back, encounter with the ancient door`);
await player.generateAndPlay(`
    Mood: Enlightened, relieved
    Setting: Transition from the alley to Clara's apartment
    Cultural Context: Return to the familiar world
    Character Theme: Clara's awakening to new possibilities
    Narrative Arc: Resolution of the immediate journey, lingering sense of mystery`);
await player.generateAndPlay(`
    Mood: Reflective, curious
    Setting: Clara's normal life
    Cultural Context: Everyday life with a touch of the fantastical
    Character Theme: Clara's awareness of the magical
    Narrative Arc: Conclusion, hint at future adventures`);
