/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => {
  // webpackBootstrap
  /******/ var __webpack_modules__ = {
    /***/ './scripts/app.js':
      /*!************************!*\
  !*** ./scripts/app.js ***!
  \************************/
      /***/ () => {
        eval(
          "// import Replicate from \"replicate\";\r\n// const replicate = new Replicate({\r\n//     auth: 'xxx',\r\n// });\r\n\r\nconst textContainer = document.getElementById('text-container');\r\nlet page = 0;\r\n\r\ntextContainer.innerText = getText(page);\r\nsetPageNavigationVisibility(page);\r\n\r\n// generateBackgroundMusic('rock song').then((response) => {\r\n//     const audio = document.createElement('audio');\r\n//     audio.src = URL.createObjectURL(response.output);\r\n//     audio.play();\r\n// });\r\n\r\nfunction getText(index) {\r\n    return getInputText().split('\\n')[index];\r\n}\r\n\r\nfunction goToPreviousPage() {\r\n    if (page > 0) {\r\n        page--;\r\n        textContainer.innerText = getText(page);\r\n        setPageNavigationVisibility(page);\r\n    }\r\n}\r\n\r\nfunction goToNextPage() {\r\n    if (page < getInputText().split('\\n').length - 1) {\r\n        page++;\r\n        textContainer.innerText = getText(page);\r\n        setPageNavigationVisibility(page);\r\n    }\r\n}\r\n\r\nfunction isPreviousPageButtonVisible(page) {\r\n    return page > 0;\r\n}\r\n\r\nfunction isNextPageButtonVisible(page) {\r\n    return page < getInputText().split('\\n').length - 1;\r\n}\r\n\r\nfunction setPageNavigationVisibility(page) {\r\n    const previousPageButton = document.getElementById('previous-page-button');\r\n    const nextPageButton = document.getElementById('next-page-button');\r\n\r\n    if (isPreviousPageButtonVisible(page)) {\r\n        previousPageButton.style.display = 'flex';\r\n    } else {\r\n        previousPageButton.style.display = 'none';\r\n    }\r\n\r\n    if (isNextPageButtonVisible(page)) {\r\n        nextPageButton.style.display = 'flex';\r\n    } else {\r\n        nextPageButton.style.display = 'none';\r\n    }\r\n}\r\n\r\nfunction generateBackgroundMusic(prompt) {\r\n    const input = {\r\n        prompt,\r\n        model_version: \"stereo-large\",\r\n        output_format: \"mp3\",\r\n        normalization_strategy: \"peak\"\r\n    };\r\n    \r\n    return replicate.run(\"meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb\", { input });\r\n}\r\n\r\nfunction getInputText() {\r\n    return `Once, in a quaint town with cobblestone streets and friendly neighbors, there lived a young woman named Clara. She worked at the local library, a charming building that smelled of old books and fresh coffee. Clara enjoyed the quiet rhythm of her days, helping visitors find the perfect book and sharing stories with children during reading hour.\r\n        One chilly autumn evening, Clara decided to take a different route home. Her usual path was blocked by construction, so she turned down an unfamiliar alley. At first, it seemed like any other alley—narrow and dimly lit. But as she walked, the world began to shift. The buildings seemed taller, their windows dark and empty. The air grew cooler, and a strange fog rolled in.\r\n        Clara's footsteps echoed on the cobblestones, which now looked uneven and old. She glanced back, hoping to see the familiar sights of her town, but the alley had vanished into the fog. With no choice but to continue, she pressed on, heart pounding in her chest.\r\n        Ahead, she spotted a small shop with a flickering sign: \"Ethereal Curiosities.\" Intrigued, Clara pushed open the creaky door and stepped inside. The shop was filled with odd trinkets and artifacts, each one more peculiar than the last. An elderly man with a kind, weathered face greeted her from behind the counter.\r\n        \"Welcome, Clara,\" he said, his voice soft and soothing. She was taken aback—how did he know her name? But before she could ask, he continued, \"You've entered a place between worlds. Here, time and reality are fluid.\"\r\n        Clara felt a strange calm wash over her. The shop felt safe, despite its oddities. The man handed her a small, ornate key. \"This will help you find your way back,\" he said. \"But remember, some doors are meant to be opened.\"\r\n        Clara thanked him and left the shop, clutching the key tightly. Outside, the fog had thickened, and the alley seemed even more distorted. She wandered for what felt like hours, finally coming across an ancient door hidden in the shadows. She inserted the key and turned it, hearing a satisfying click.\r\n        The door creaked open, revealing a blinding light. Clara stepped through, and the world around her transformed. She found herself back in her cozy apartment, as if nothing had happened. The key was gone, but the memory of the shop lingered.\r\n        Weeks passed, and Clara resumed her normal life. But every so often, she'd catch a glimpse of something out of the corner of her eye—a flicker of the impossible, a doorway to another realm. She knew that, one day, she might just turn the right corner again and find herself back in the liminal space, ready to explore the mysteries that lay beyond.`;\r\n}\r\n  \n\n//# sourceURL=webpack://ambiread/./scripts/app.js?",
        );

        /***/
      },

    /******/
  };
  /************************************************************************/
  /******/
  /******/ // startup
  /******/ // Load entry module and return exports
  /******/ // This entry module can't be inlined because the eval devtool is used.
  /******/ var __webpack_exports__ = {};
  /******/ __webpack_modules__['./scripts/app.js']();
  /******/
  /******/
})();
