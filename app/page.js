'use client';

import { use, useEffect, useState } from "react";
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
  const [player, setPlayer] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [page, setPage] = useState(0);
  const [text, setText] = useState(getText(0));
  const [isPreviousPageButtonVisible, setIsPreviousPageButtonVisible] = useState(false);
  const [isNextPageButtonVisible, setIsNextPageButtonVisible] = useState(false);
  const [isBookLoaded, setIsBookLoaded] = useState(false);
  let sceneDescription = [];

  function getInputText() {
    return `The moon hung low, casting eerie shadows over the desolate cityscape. Sophie moved cautiously, her breath shallow and controlled. The once bustling streets were now silent, except for the occasional growl of the undead. The city had been overrun for months, and every step felt like a gamble with death.
She crouched behind an overturned car, peering through the shattered window. A group of zombies shuffled aimlessly ahead, their decayed forms barely illuminated by the pale moonlight. Sophie gripped her makeshift weapon—a rusted metal pipe—tightly, her knuckles turning white. She had to make it to the old pharmacy on 3rd Street. Rumor had it that there were still supplies left, untouched by looters and the undead.
Moving slowly, Sophie avoided debris and broken glass, her ears straining for any sound that might signal danger. She slipped through an alleyway, the narrow passageway amplifying the tension. Every creak, every distant moan made her heart race.
As she reached the end of the alley, she saw it—the pharmacy, its neon sign flickering faintly. Relief washed over her, but she knew the danger was far from over. She needed to be quick. The door to the pharmacy was ajar, its hinges rusted and groaning as she pushed it open just enough to slip inside.
The interior was dark and musty, the air thick with the scent of decay. Shelves were toppled over, and broken glass littered the floor. Sophie moved silently, her eyes adjusting to the dim light. She quickly scanned the shelves, grabbing anything that looked useful—bandages, antibiotics, and painkillers.
Just as she was about to leave, a loud crash echoed through the store. Sophie froze, her heart pounding in her ears. She turned slowly, her eyes widening in horror. A group of zombies had followed her inside, drawn by the noise. She backed away, clutching her pipe, ready to fight for her life.
But then, something strange happened. The zombies stopped, their eyes glazing over as if they were suddenly uninterested. Sophie watched in disbelief as they turned and shuffled away, leaving her unharmed. Confused but grateful, she made her way back to the alley, supplies in hand.
As she emerged from the pharmacy, Sophie saw something glinting on the ground. She picked it up—a small, round device, emitting a low-frequency hum. It was a signal jammer, designed to interfere with the zombies' senses. She looked around and saw a figure in the shadows, watching her. Before she could react, the figure disappeared into the night.
Sophie realized she wasn’t alone in the fight for survival. Someone out there was helping, silently guiding her through the apocalypse. The city was still dangerous, but hope flickered in the darkness. With newfound determination, she set off into the night, ready to face whatever came next.`;

    return `Once, in a quaint town with cobblestone streets and friendly neighbors, there lived a young woman named Clara. She worked at the local library, a charming building that smelled of old books and fresh coffee. Clara enjoyed the quiet rhythm of her days, helping visitors find the perfect book and sharing stories with children during reading hour.
        One chilly autumn evening, Clara decided to take a different route home. Her usual path was blocked by construction, so she turned down an unfamiliar alley. At first, it seemed like any other alley—narrow and dimly lit. But as she walked, the world began to shift. The buildings seemed taller, their windows dark and empty. The air grew cooler, and a strange fog rolled in.
        Clara's footsteps echoed on the cobblestones, which now looked uneven and old. She glanced back, hoping to see the familiar sights of her town, but the alley had vanished into the fog. With no choice but to continue, she pressed on, heart pounding in her chest.
        Ahead, she spotted a small shop with a flickering sign: "Ethereal Curiosities." Intrigued, Clara pushed open the creaky door and stepped inside. The shop was filled with odd trinkets and artifacts, each one more peculiar than the last. An elderly man with a kind, weathered face greeted her from behind the counter.
        "Welcome, Clara," he said, his voice soft and soothing. She was taken aback—how did he know her name? But before she could ask, he continued, "You've entered a place between worlds. Here, time and reality are fluid."
        Clara felt a strange calm wash over her. The shop felt safe, despite its oddities. The man handed her a small, ornate key. "This will help you find your way back," he said. "But remember, some doors are meant to be opened."
        Clara thanked him and left the shop, clutching the key tightly. Outside, the fog had thickened, and the alley seemed even more distorted. She wandered for what felt like hours, finally coming across an ancient door hidden in the shadows. She inserted the key and turned it, hearing a satisfying click.
        The door creaked open, revealing a blinding light. Clara stepped through, and the world around her transformed. She found herself back in her cozy apartment, as if nothing had happened. The key was gone, but the memory of the shop lingered.
        Weeks passed, and Clara resumed her normal life. But every so often, she'd catch a glimpse of something out of the corner of her eye—a flicker of the impossible, a doorway to another realm. She knew that, one day, she might just turn the right corner again and find herself back in the liminal space, ready to explore the mysteries that lay beyond.`;
  }

  function getSceneDescription(index) {
    return sceneDescription[index];

    return [`
      Mood: Calm, ordinary
      Setting: A quaint town, local library
      Cultural Context: Modern, small-town life
      Character Theme: Clara's routine and contentment with her simple life
      Narrative Arc: Introduction of Clara and her everyday world`,
      `
      Mood: Curious, slightly uneasy
      Setting: An unfamiliar alley at dusk
      Cultural Context: Small-town atmosphere, typical evening
      Character Theme: Clara's curiosity and willingness to explore new paths
      Narrative Arc: Disruption of the routine, hint of something unusual`,
      `
      Mood: Mysterious, eerie
      Setting: Foggy, distorted alley
      Cultural Context: Transitioning into a liminal space
      Character Theme: Clara's determination despite growing uncertainty 
      Narrative Arc: Building tension, Clara's isolation increases`,
      `
      Mood: Intrigued, mystical
      Setting: Inside "Ethereal Curiosities" shop
      Cultural Context: Magical, timeless
      Character Theme: Clara's encounter with the unknown
      Narrative Arc: Introduction of the magical element and the mysterious shopkeeper`,
      `
      Mood: Surreal, calm
      Setting: Inside the shop
      Cultural Context: Liminal space, between worlds
      Character Theme: Clara's acceptance of the magical reality
      Narrative Arc: Deepening of the mystery, key to the journey given`,
      `
      Mood: Surreal, calm
      Setting: Inside the shop
      Cultural Context: Liminal space, between worlds
      Character Theme: Clara's acceptance of the magical reality
      Narrative Arc: Deepening of the mystery, key to the journey given`,
      `
      Mood: Anxious, hopeful
      Setting: Foggy alley
      Cultural Context: Liminal, shifting
      Character Theme: Clara's persistence and hope 
      Narrative Arc: Journey towards finding the way back, encounter with the ancient door`,
      `
      Mood: Enlightened, relieved
      Setting: Transition from the alley to Clara's apartment
      Cultural Context: Return to the familiar world
      Character Theme: Clara's awakening to new possibilities
      Narrative Arc: Resolution of the immediate journey, lingering sense of mystery`,
      `
      Mood: Reflective, curious
      Setting: Clara's normal life
      Cultural Context: Everyday life with a touch of the fantastical
      Character Theme: Clara's awareness of the magical
      Narrative Arc: Conclusion, hint at future adventures`
    ][index];
  }

  // function isPreviousPageButtonVisible() {
  //   return page > 0
  //     && !!playlist[page - 1];
  // }

  // function isNextPageButtonVisible() {
  //     return page < getInputText().split('\n').length - 1
  //       && !!playlist[page + 1];
  // }

  function getText(index) {
    return getInputText().split('\n')[index];
  }

  const generateMusicForAllPages = async () => {
    (async () => {
      for (let i = 1; i < getInputText().split('\n').length; i++) {
        // wait 1 second before generating the next music
        await new Promise(resolve => setTimeout(resolve, 1000));

        generateMusic(i).then(({index, url}) => setPlaylist(() => {
          const copy = [...playlist];
          playlist[index] = copy[index] = url; 
          return copy;
        }));
      }
    })();

    return await generateMusic(0).then(({index, url}) => setPlaylist(() => { 
      const copy = [...playlist];
      playlist[index] = copy[index] = url; 
      return copy;
    }));
  }
  
  const generateMusic = async (index) => {
    return fetch("/generate-music", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: getSceneDescription(index),
      }),
    })
    .then(response => response.json())
    .then(url => ({ index, url }));
  }

  const generateOutline = async () => {
    return fetch("/generate-outline", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: getInputText(),
      }),
    })
    .then(response => response.json())
    .then(outline => outline.map(paragraph => `
      Mood: ${paragraph.mood}
      Setting: ${paragraph.setting}
      Cultural Context: ${paragraph['cultural context']}
      Character Theme: ${paragraph['character theme']}
      Narrative Arc: ${paragraph['narrative arc']}`));
  }
  
  // const generateAndPlay = async () => {
  //   const response = await fetch("/backend", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       prompt: getSceneDescription(page),
  //     }),
  //   });
  //   let url = await response.json();
  //   console.log(url);
  //   await player.play(url);
  // }

  const goToPreviousPage = async (e) => {
    e.preventDefault();
    if (isPreviousPageButtonVisible) {
      console.log('playlist', playlist);  

      setPage(page - 1);
      setText(getText(page - 1));
      player.play(playlist[page - 1]);
    }
  }

  const goToNextPage = async (e) => {
    e.preventDefault();
    if (isNextPageButtonVisible) {
      console.log('playlist', playlist);  

      setPage(page + 1);
      setText(getText(page + 1));
      // await generateAndPlay();
      player.play(playlist[page + 1]);
    }
  }

  const onLoad = async () => {
    console.log('onLoad');
    const player = new BackgroundMusicPlayer();
    setPlayer(player);
    sceneDescription = await generateOutline();
    await generateMusicForAllPages();

    console.log('playlist', playlist);

    player.play(playlist[0]);

    setIsBookLoaded(true);
  }

  const log = async () => {
    console.log('playlist', playlist);
  }

  // useEffect(() => {
  //   if(!player) {
  //     onLoad();
  //   }
  // });

  useEffect(() => {
    const value = page > 0
              && !!playlist[page - 1];

    console.log('setIsPreviousPageButtonVisible', value);

    setIsPreviousPageButtonVisible(value);
  }, [page, playlist]);

  useEffect(() => {
    const value = page < getInputText().split('\n').length - 1
              && !!playlist[page + 1];

    console.log('setIsNextPageButtonVisible', value);

    setIsNextPageButtonVisible(value);
  }, [page, playlist]);

  return (
    <div>
      <header className={styles.header}>
        <h1>AmbiRead</h1>
      </header>
      <button onClick={onLoad}>Open Book</button>
      <section hidden={!isBookLoaded} className={styles.section}>
        <button 
          hidden={!isPreviousPageButtonVisible} 
          className={styles.previousPage} 
          onClick={goToPreviousPage}>&lt;</button>
        <button 
          hidden={!isNextPageButtonVisible} 
          className={styles.nextPage} 
          onClick={goToNextPage}>&gt;</button>
        <div className={styles.textContainer}>
          <p>{text}</p>
        </div>
      </section>
    </div>
  );
}