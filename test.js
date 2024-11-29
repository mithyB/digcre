import Replicate from "replicate";
import {AudioContext} from 'node-web-audio-api';
const replicate = new Replicate({
    auth: 'r8_IoB3iwr2hRPHYJzsaGxb6aaG5PhSbo32fmavo',
});

class BackgroundMusicPlayer {
    _context = new AudioContext();
    _trackNumber = 0;
    _currentGainNode;
    _currentSource;

    async playLoadingSound(prompt) {
        console.log('Start generating loading sound...');

        await this.play(`${prompt}, loading sound, single note, soothing, declick, no reverb`, 1);
    }

    async play(prompt, duration = 16) {
        this._trackNumber++;
        console.log(`Start generating music (track ${this._trackNumber})...`);

        const newGainNode = this._context.createGain();
        newGainNode.connect(this._context.destination);
        console.log('Created and connected gain node');


        const input = {
            prompt: `ambient background music, no percussion, 120bpm, can be played on repeat, description: "${prompt}"`,
            model_version: "stereo-melody-large",
            output_format: "mp3",
            normalization_strategy: "rms",
            duration
        };
    
        console.log('Running audio generation model...');
        const promise = new Promise(async (resolve, reject) => {
            let hasResolved = false;

            const output = await replicate.run("meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb", { input }, async (prediction) => {
                console.log('Generating music...', prediction);
                if (hasResolved) return;

                const audioStreamUrl = prediction.urls.stream;

                // stream audio buffer from url and play it (without browser)
                const audioStream = await fetch(audioStreamUrl);
                const audioBuffer = await audioStream.arrayBuffer();
                const audioData = new Uint8Array(audioBuffer);
                try {
                    const audioBufferData = await this._context.decodeAudioData(audioData.buffer);
                    resolve(audioBufferData);
                    hasResolved = true;
                } catch (error) {
                    reject(error);
                }
            });
        });
        const audioBuffer = await promise;
        console.log('Generated audio');

        if (!this._currentGainNode) {
            // this._currentSource = await this._playLoopingStreamWithCrossfade(output, newGainNode);
            this._currentSource = await this._playLoopingStreamWithCrossfade2(audioBuffer, newGainNode);
        } else {
            this._currentSource = await this._crossfadeToNewStream2(audioBuffer, newGainNode, 16);
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
    
        const newSource = await this._playLoopingStreamWithCrossfade2(audioBuffer, newGainNode);
        console.log('New audio available. Start crossfading...');

        // Crossfade from old source to new source
        const currentTime = this._context.currentTime;
        this._currentGainNode.gain.setValueAtTime(1, currentTime);
        this._currentGainNode.gain.linearRampToValueAtTime(0, currentTime + crossfadeTime);
    
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
        const audioData = new Uint8Array(chunks.reduce((acc, chunk) => acc.concat(Array.from(chunk)), []));
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
    
        const newSource = await this._playLoopingStreamWithCrossfade(newStream, newGainNode);
        console.log('New audio available. Start crossfading...');

        // Crossfade from old source to new source
        const currentTime = this._context.currentTime;
        this._currentGainNode.gain.setValueAtTime(1, currentTime);
        this._currentGainNode.gain.linearRampToValueAtTime(0, currentTime + crossfadeTime);
    
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
    const audioData = new Uint8Array(chunks.reduce((acc, chunk) => acc.concat(Array.from(chunk)), []));
    const audioBuffer = await context.decodeAudioData(audioData.buffer);

    // Create a buffer source and set it to loop
    const source = context.createBufferSource();
    source.buffer = audioBuffer;
    source.loop = true;
    source.connect(gainNode);
    source.start();

    return source;
}

async function crossfadeToNewStream(oldSource, newStream, context, oldGainNode, newGainNode, crossfadeTime) {
    console.log('switch');

    const newSource = await playLoopingStreamWithCrossfade(newStream, context, newGainNode, crossfadeTime);

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
        model_version: "stereo-large",
        output_format: "mp3",
        normalization_strategy: "peak",
        duration: 16
    };

    const output = await replicate.run("meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb", { input });

    console.log(output);

    // Play the initial loop
    let currentSource = await playLoopingStreamWithCrossfade(output, context, currentGainNode);

    // Simulate a button click after some time to crossfade to a new loop
    setTimeout(async () => {
        console.log('lets go, change to new music');

        const newOutput = await replicate.run("meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb", { input });
        const newGainNode = context.createGain();
        newGainNode.connect(context.destination);

        currentSource = await crossfadeToNewStream(currentSource, newOutput, context, currentGainNode, newGainNode, 16);
    }, 1000); // Change to a new loop after 10 seconds
}

// generateAndPlayMusic().catch(console.error);

const player = new BackgroundMusicPlayer();
player.playLoadingSound('happy cozy village, welcoming');
await player.play('happy cozy village, welcoming');
await player.play('adventure in the forest, mysterious');
await player.play('scary haunted house, spooky');
await player.play('final boss fight, epic');
await player.play('happy cozy village, relieving');





