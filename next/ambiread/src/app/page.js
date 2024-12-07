'use client';

// import Image from "next/image";
import styles from "./page.module.css";

class BackgroundMusicPlayer {
  _context = new (window.AudioContext || window.webkitAudioContext)();
  _trackNumber = 0;
  _currentGainNode;
  _currentSource;

  async playLoadingSound(prompt) {
      console.log('Start generating loading sound...');

      await this.generateAndPlay(`${prompt}, loading sound, single note, soothing, declick, no reverb`, 1);
  }

  // async generate(prompt, duration = 16) {
  //     const input = {
  //         prompt: `Generate ambient background music without percussion in 120bpm that can be played on repeat (in a loop) for the following scene: "${prompt}"`,
  //         // prompt: `ambient background music, no percussion, 120bpm, can be played on repeat, description: "${prompt}"`,
  //         model_version: "stereo-melody-large",
  //         output_format: "mp3",
  //         normalization_strategy: "rms",
  //         duration
  //     };

  //     console.log('Running audio generation model...');
  //     const promise = new Promise(async (resolve, reject) => {

  //         const output = await replicate.run("meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb", { input }, async (prediction) => {
  //             console.log('Generating music...', prediction);
  //             if (prediction.output) {
  //                 console.log('Generated audio');
  //                 resolve(prediction.output);
  //             }
  //         });
  //     });

  //     return await promise;
  // }
  
  async play(url, newGainNode) {
      console.log('Start playing audio...', url);

      if (!newGainNode) {
        newGainNode = this._context.createGain();
        newGainNode.connect(this._context.destination);
      }

      // stream audio buffer from url and play it (without browser)
      const audioStream = await fetch(url);
      const arrayBuffer = await audioStream.arrayBuffer();

      const audioData = new Uint8Array(arrayBuffer);
      const audioBuffer = await this._context.decodeAudioData(audioData.buffer);

      if (!this._currentGainNode) {
          this._currentSource = await this._playLoopingStreamWithCrossfade2(audioBuffer, newGainNode);
      } else {
          this._currentSource = await this._crossfadeToNewStream2(audioBuffer, newGainNode, 16);
      }

      this._currentGainNode = newGainNode;

      console.log(`Currently playing (track ${this._trackNumber}): ${url}`);
  }

  // async generateAndPlay(prompt, duration = 16) {
  //     this._trackNumber++;
  //     console.log(`Start generating music (track ${this._trackNumber})...`);

  //     const newGainNode = this._context.createGain();
  //     newGainNode.connect(this._context.destination);
  //     console.log('Created and connected gain node');
  
  //     const url = await this.generate(prompt, duration);

  //     if (true) {
  //         console.log('Press enter to play next song...');
  //         await new Promise((resolve) => process.stdin.once('data', () => resolve()));
  //         console.log('Playing next song...');
  //     }

  //     await this.play(url, newGainNode);
  // }

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

export default function Home() {
  const player = new BackgroundMusicPlayer();
  let page = 0;
  
  const generateAndPlay = async () => {
    const response = await fetch("/backend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: 'e.target.prompt.value',
      }),
    });
    let url = await response.json();
    console.log(url);
    await player.play(url);
  }

  const goToPreviousPage = async (e) => {
    e.preventDefault();
    console.log('Previous page');
    generateAndPlay();
  }

  const goToNextPage = async (e) => {
    e.preventDefault();
    console.log('Next page');
  }

  const text = "This is a test text";

  return (
    // <div className={styles.page}>
    //   <main className={styles.main}>
    //     <Image
    //       className={styles.logo}
    //       src="/next.svg"
    //       alt="Next.js logo"
    //       width={180}
    //       height={38}
    //       priority
    //     />
    //     <button onClick={generateAndPlay}>Click</button>
    //     <ol>
    //       <li>
    //         Get started by editing <code>src/app/page.js</code>.
    //       </li>
    //       <li>Save and see your changes instantly.</li>
    //     </ol>

    //     <div className={styles.ctas}>
    //       <a
    //         className={styles.primary}
    //         href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
    //         target="_blank"
    //         rel="noopener noreferrer"
    //       >
    //         <Image
    //           className={styles.logo}
    //           src="/vercel.svg"
    //           alt="Vercel logomark"
    //           width={20}
    //           height={20}
    //         />
    //         Deploy now
    //       </a>
    //       <a
    //         href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
    //         target="_blank"
    //         rel="noopener noreferrer"
    //         className={styles.secondary}
    //       >
    //         Read our docs
    //       </a>
    //     </div>
    //   </main>
    //   <footer className={styles.footer}>
    //     <a
    //       href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
    //       target="_blank"
    //       rel="noopener noreferrer"
    //     >
    //       <Image
    //         aria-hidden
    //         src="/file.svg"
    //         alt="File icon"
    //         width={16}
    //         height={16}
    //       />
    //       Learn
    //     </a>
    //     <a
    //       href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
    //       target="_blank"
    //       rel="noopener noreferrer"
    //     >
    //       <Image
    //         aria-hidden
    //         src="/window.svg"
    //         alt="Window icon"
    //         width={16}
    //         height={16}
    //       />
    //       Examples
    //     </a>
    //     <a
    //       href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
    //       target="_blank"
    //       rel="noopener noreferrer"
    //     >
    //       <Image
    //         aria-hidden
    //         src="/globe.svg"
    //         alt="Globe icon"
    //         width={16}
    //         height={16}
    //       />
    //       Go to nextjs.org →
    //     </a>
    //   </footer>
    // </div>

    <div>
      <header className={styles.header}>
        <h1>AmbiRead</h1>
      </header>
      <section className={styles.section}>
        <button className={styles.previousPage} onClick={goToPreviousPage}>&lt;</button>
        <button className={styles.nextPage} onClick={goToNextPage}>&gt;</button>
        <div className={styles.textContainer}>
          <p>{text}</p>
        </div>
      </section>
    </div>
  );
}
