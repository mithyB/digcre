// import Replicate from "replicate";
// const replicate = new Replicate({
//     auth: 'r8_IoB3iwr2hRPHYJzsaGxb6aaG5PhSbo32fmavo',
// });

const textContainer = document.getElementById('text-container');
let page = 0;

textContainer.innerText = getText(page);
setPageNavigationVisibility(page);

// generateBackgroundMusic('rock song').then((response) => {
//     const audio = document.createElement('audio');
//     audio.src = URL.createObjectURL(response.output);
//     audio.play();
// });

function getText(index) {
    return getInputText().split('\n')[index];
}

function goToPreviousPage() {
    if (page > 0) {
        page--;
        textContainer.innerText = getText(page);
        setPageNavigationVisibility(page);
    }
}

function goToNextPage() {
    if (page < getInputText().split('\n').length - 1) {
        page++;
        textContainer.innerText = getText(page);
        setPageNavigationVisibility(page);
    }
}

function isPreviousPageButtonVisible(page) {
    return page > 0;
}

function isNextPageButtonVisible(page) {
    return page < getInputText().split('\n').length - 1;
}

function setPageNavigationVisibility(page) {
    const previousPageButton = document.getElementById('previous-page-button');
    const nextPageButton = document.getElementById('next-page-button');

    if (isPreviousPageButtonVisible(page)) {
        previousPageButton.style.display = 'flex';
    } else {
        previousPageButton.style.display = 'none';
    }

    if (isNextPageButtonVisible(page)) {
        nextPageButton.style.display = 'flex';
    } else {
        nextPageButton.style.display = 'none';
    }
}

function generateBackgroundMusic(prompt) {
    const input = {
        prompt,
        model_version: "stereo-large",
        output_format: "mp3",
        normalization_strategy: "peak"
    };
    
    return replicate.run("meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb", { input });
}

function getInputText() {
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
  