# How to run on your machine

First you need to have Node.js and NPM installed on your computer.

Then follow these steps:

1. Clone this repository
2. navigate to the `next/ambiread` folder (e.g. running `cd next/ambiread`)
3. run `npm install`
4. create a file `.env.local` in the `next/ambiread` folder containing this line:

   ```
   REPLICATE_API_TOKEN=<add token here>
   ```

5. run `npm run dev`
   Now you should be able to access the page on http://localhost:3000
