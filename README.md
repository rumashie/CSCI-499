# CSCI-499

## API keys
### OpenAPI
- Get an API key at https://platform.openai.com/api-keys
- Go to constants.py and change the variable APIKEY with the secret key given on the website

### GoogleAPI
- Client_secret.json is provided with the necessary key
- When the program is first run you will have to go through authentication in order for the 
google api to access your google calendar
- If you receive a prompt that says "Google hasn’t verified this app", click continue to give 
access to your google calendar
- If you receive a prompt that says "Access blocked: CSCI499 App has not completed the Google 
verification process", send one of us a message with the email that you are using for this application
so we can added you as one of the test users on the Google console

### Spotify API
- Get the Client_ID and Client_Secret at https://developer.spotify.com/dashboard
- Go to constants.py and change the corrisponding variables with your own and also get your Spotify username
and paste it into the associated variable(you can find your username by going to Edit profile on your account page)
- when create your first playlist the app will redirect you to a page where you have to allow access to
create a playlist on you spotify account, in the terminal it will ask you to input the url, just copy and
paste the url of the page you were redirected too and paste it in the terminal

### Weather API
- Make sure to have your API key https://openweathermap.org/api. You can use ours for the time being listed in constants.py.
- Make sure you are running Chatbot then you can ask anything related to the weather. In order to get the weather you must prompt full city in order for it to work.
- For instance "What is the weather in New York" it will return 3 hour forecast for the next 5 days. NY is not a valid for API, and it will be prompted full city name New York, Paris, etc.

## Running the code
### Chatbot
- first install all of the requried librarys that are on requirements.txt (pip install -r requirements.txt)
- In order to use the chatbot just run the Chatbot.py file
- It will first prompt you to give access to your google calendar to complete authentication
- After authentication you can type in the terminal your message and the chatbot will respond to 
the best of its ability

## Contributions
### Leonardo Gonzalez Luzon
- Chatbot.py
- GoogleCalendar.py
- Google.py
- Spotify.py
- speech_to_text.py

### Massiel
- Database Model
- Create Database Tables
- Registration page linked with Database (User information is stored in Database)
- Linked login.html and signup.html
- Added Error Handling to user login and signup

### Bergen

- weather.py Added weather function to Chatbot.py. Must enter city name in order to get data. 
- login.css Login Page Needs to be hooked up to DB (DB is on Massiel local, needs to be hosted online as I don't have access to it nor code base) Will be updated shortly.
- login.html
- signup.html Sign Up Page Needs to be hooked up to DB (DB is on Massiel local, needs to be hosted online)
- signup.css
- task.html Task Manager to add via UI, (flask will be used tied with Leo's/ my code to make it more efficent from frontend)
- task.css
- task.js - (Remind every hour, to take a break react.js more features will be addes shortly this week)

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
