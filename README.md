# EventPlanner
## Udacity Senior Web Developer Project 1

Author: Adam Beagle

### Overview

EventPlanner is an AngularJS application that allows users to create and view events (e.g. meetups, parties). The project was created for Udacity's Senior Web Developer nanodegree. Its emphasis is on responsive design and form usability/validation -- the backend is mocked.

### Requirements

1. NPM (nodeJS)
2. Bower

All other requirements (Angular, Gulp, etc.) are fetched by the preceding two services.

### Installation/Build

To build and run the application:

1. Clone this repository (`git clone https://github.com/adambeagle/udacitysd1_eventplanner`)
2. Navigate to the root directory of the repository and run `npm install`, then `bower install`
3. From here there are two options:
  * To run in **production mode** (minified js/css, etc.), build with `gulp dist`, then start the server with `npm start`. 
  * To run in **dev mode**, run `gulp`, which should automatically open a browser (via browser-sync), or at minimum will output an HTTP address at which to find the application. Running in dev mode will continue to watch application files for changes until gulp is stopped (with e.g. CTRL-C).

### Structure

The application structure generally follows Google's ["Angular Best Practice for App Structure"](https://docs.google.com/document/d/1XXMvReO8-Awi1EZXAXS4PzDzdNvV6pGcuaF4Q9821Es/pub) guide. 

