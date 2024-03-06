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
- Go to constants.py and change the corrisponding variables with your own

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

### Massiel
- Database Model
- Create Database Tables
- Registration page linked with Database (User information is stored in Database)

### Bergen
- login.css Login Page Needs to be hooked up to DB (DB is on Massiel local, needs to be hosted online as I don't have access to it nor code base)
- login.html
- signup.html Sign Up Page Needs to be hooked up to DB (DB is on Massiel local, needs to be hosted online)
- signup.css
- task.html Task Manager to add via UI, (flask will be used tied with Leo's code to make it more efficent from frontend)
- task.css
- task.js - (Remind every hour, to take a break react.js more features will be addes shortly this week)

