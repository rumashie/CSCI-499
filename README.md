# CSCI-499

## To run Program:
This application consists of a React frontend and two backend servers - one implemented in Node.js and the other in Flask (Python).

Navigate to the directory containing the application.
To start the Node.js backend server:
node server.js

To start the Flask backend server:
python app.py

To start the React frontend app:
npm start App.js

## API keys
### OpenAPI
- Get an API key at https://platform.openai.com/api-keys
- Go to constants.py and change the variable APIKEY with the secret key given on the website
- If this doesn't work then contact one of us

### GoogleAPI
- Client_secret.json is provided with the necessary key
- When the program is first run you will have to go through authentication proccess that will start with a window opening in your browser
- If you receive a prompt that says "Google hasn’t verified this app", click continue to give 
- If you receive a prompt that says "Access blocked: CSCI499 App has not completed the Google verification process", send one of us a message with the email that you are using for this authentication so we can added you as one of the test users on the Google console
- If you recieve an error about the token try to delete the token files folder and restart the app

### Spotify API
- Get the Client_ID and Client_Secret at https://developer.spotify.com/dashboard
- Go to constants.py and change the corrisponding variables with your own and also get your Spotify username
and paste it into the associated variable(you can find your username by going to Edit profile on your account page)
- when create your first playlist the app will redirect you to a page where you have to allow access to
create a playlist on you spotify account, in the terminal it will ask you to input the url, just copy and
paste the url of the page you were redirected too and paste it in the terminal

## Running the code
- make a virtual environment(venv) and activate it
- set up a react app (instructions below) and replace the public and src files with the ones you pulled from github
- install the python packages(use "pip install -r requirements.txt" without quotes)
- then run app.py 
- in another terminal cd into your react app and run it.
- you will then be sent to the login screen where you can login or create an account to gain access to the dashboard with all of its functionality

## Bugs/Issues
- If the chatbot is asked a question about your google calendar it can give incorrect information as it will try to give filler text instead of looking at your calendar.
- May be connection/auth issue when sending an email chatGPT email inbox.
- Button settings has no use at the moment everything is done via backend code setting up API/connection

### Contributions
## Leonardo Gonzalez Luzon
- Chatbot.py
- Google.py
- GoogleCalendar.py
- Spotify.py
- app.py
- speech_to_text.py
- test_app.py
- test_chatbot.py
- test_google_calendar.py
- test_spotify.py
- CalendarView.js/css
- WidgetSection.js/css (this is basically the frontend for the chatbot)

## Massiel Sanchez
- server.js (Backend)
- Login Component of React App
- Sign up Component of React App
- AWS Database: Database Schema, Database Routing
- Integration of Login + Signup Components with larger React App, Had to reorganize App.js

## Bergen Bartolomeo

## Tests 
- Unit test functions for app.py Chatbot.py GoogleCalendar.py and Spotify.py are in the appropriate test file. These tests can run by using python -m unittest test_spotify.py substituting the name with whatever file you want to test
- test_app.py
- test_chatbot.py
- test_google_calendar.py
- test_spotify.py

- Frontend responsive and reactive on major desktop / mobile display sizes correctly. Tested with multiple user agents such firefox, chrome, and safari.
- Tested react components and they all render.
- Tested DB with large amount of user logins.

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

Screenshots: 

<img width="1314" alt="Screen Shot 2024-05-13 at 9 50 15 AM" src="https://github.com/rumashie/CSCI-499/assets/36686123/7f2f7f49-e23b-4000-84e3-adcb2e66f29a">

<img width="1314" alt="Screen Shot 2024-05-13 at 9 51 59 AM" src="https://github.com/rumashie/CSCI-499/assets/36686123/722f9101-d625-482d-8830-49dab7f55edd">


