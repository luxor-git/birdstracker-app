

<a href="https://anitracking.com"><img src="https://anitracking.com/wp-content/uploads/2018/05/Anitrabiglogo-8-323x180.png" title="Anitra logo" alt="Anitra logo"></a>
# Anitra companion app

 [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://GitHub.com/Naereen/StrapDown.js/graphs/commit-activity)  [![made-with-latex](https://img.shields.io/badge/Made%20with-LaTeX-1f425f.svg)](https://www.latex-project.org/) [![made-with-react](https://img.shields.io/badge/Made%20with-React-blue)](https://www.latex-project.org/)



Anitra Wildlife Tracking app is a companion app to the Anitra web application and device ecosystem. Anitra serves as a central repository for data from various GPS-GSM loggers from thousands of tracked animals. Anitra also provides strong project management tools, such as a complex data sharing system, custom map objects, annotations, graphs, export and import tools. Anitra is developed as a proprietary application by Anitra system s.r.o. and can be accessed at https://anitracking.com/.

## Installation

Instalation for development purposes is described below. Pre-requisites are an installation of NPM and Node.js and either MS Windows or MacOS. For Android development, an installation of Android studio is necessary (for VM management and Android SDKs). For iOS development, xcode must be installed.

1. Clone this repo using git clone `git clone https://github.com/luxor-git/birdstracker-app`
2. Navigate to directory `./anitra-app/`
3. Run `npm install`
4. Run `expo run android` or `expo run ios`
5. Application should now be running in development mode, live-reloading when necessary

## Installation of the companion app

Companion app is not currently distributed yet, but it is likely it will be on the Android store no later than 20 June 2020. For further details follow the Anitra website or social media.

## Deployment

Application is built using `turtle-cli` and distributed using private keys to the App Store or Play Store. Distribution is described in the thesis PDF, but is generally discouraged.

## Contributing

This project is open-source, but given its specific nature it is unlikely any pull requests will be submitted. If you have a pull request to submit, make sure the application is in a working state by manually testing it using the test scenario described in the thesis. 

