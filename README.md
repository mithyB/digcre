# AmbiRead

AmbiRead is a web application that generates ambient background music for different scenes in a book. It uses the Replicate API to generate music and outlines for the scenes based on the provided prompts.

This project was created for the DIGCRE course at HSLU.

## Overview

The application consists of the following main components:

1. **Frontend**: The user interface where users can select a book, navigate through its pages, and listen to the generated ambient music.
2. **Backend**: Handles the API requests to generate music and outlines using the Replicate API.

### Pipeline

1. **Book Selection**: Users select a book from the available options.
2. **Scene Description Generation**: For each page of the book, a scene description is generated.
3. **Music Generation**: The scene description is sent to the backend, which uses the Replicate API to generate ambient music.
4. **Music Playback**: The generated music is played in the background as the user reads the book.

## How to Run on Your Machine

First, you need to have Node.js and NPM installed on your computer. You can download them from [here](https://nodejs.org/en/download).

Then follow these steps:

1. Clone this repository:

   ```sh
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install the dependencies:

   ```sh
   npm install
   ```

3. Create a file `.env.local` containing this line:

   ```sh
   REPLICATE_API_TOKEN=<add token here>
   ```

4. Run the development server:

   ```sh
   npm run dev
   ```

   Now you should be able to access the page on [http://localhost:3000](http://localhost:3000).

### Key Files and Directories

- **app/generate-music/route.js**: Handles the music generation requests.
- **app/generate-outline/route.js**: Handles the outline generation requests.
- **app/page.js**: The main page component where users can interact with the application.
- **app/layout.js**: The root layout component.
- **app/globals.css**: Global CSS styles.
- **app/page.module.css**: CSS module for styling the main page.
- **package.json**: Contains the project dependencies and scripts.
- **README.md**: Project documentation.

## Environment Variables

- `REPLICATE_API_TOKEN`: The API token for accessing the Replicate API.

## Dependencies

- **next**: The Next.js framework.
- **react**: The React library.
- **react-dom**: The React DOM library.
- **replicate**: The Replicate API client.

## Scripts

- `npm run dev`: Runs the development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs the linter.
