"""
Developed by: Leonardo Gonzalez Luzon
"""


import os
from datetime import datetime
import pytz
from collections import namedtuple
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request


"""
Used to create and authenticate a servicee for a Google API using OAuth 2.0 from the Google Cloud Consol
    client_secret_file: the path to the client_secret json file from the Google Cloud Consol
    api_name: the name of the google api in use
    api_version: the version of the Google API
    *scopes: defines the permistions the application is requesting
    prefix: an optional prefix that can be added to the token name
"""
def create_service(client_secret_file, api_name, api_version, *scopes, prefix=''):
    CLIENT_SECRET_FILE = client_secret_file
    API_SERVICE_NAME = api_name
    API_VERSION = api_version
    SCOPES = [scope for scope in scopes[0]]
    
    creds = None
    working_dir = os.getcwd()
    token_dir = 'token files'
    token_file = f'token_{API_SERVICE_NAME}_{API_VERSION}{prefix}.json'

    # Check if token dir exists first, if not, create the folder
    if not os.path.exists(os.path.join(working_dir, token_dir)):
        os.mkdir(os.path.join(working_dir, token_dir))

    if os.path.exists(os.path.join(working_dir, token_dir, token_file)):
        creds = Credentials.from_authorized_user_file(os.path.join(working_dir, token_dir, token_file), SCOPES)
    
    # checks if the credentials do not exist or are not valid and attempts to refresh them
    # if there are no credentials or refresh tokens then it initiates the OAuth flow for authorization and updates token file
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRET_FILE, SCOPES)
            creds = flow.run_local_server(port=0)
        with open(os.path.join(working_dir, token_dir, token_file), 'w') as token:
            token.write(creds.to_json())
    # Attempts to run a service instance using the build function from the Google API and returns that instance if creation was successful
    try:
        service = build(API_SERVICE_NAME, API_VERSION, credentials=creds, static_discovery=False)
        return service
    except Exception as e:
        print(e)
        print(f'Failed to create service instance for {API_SERVICE_NAME}')
        os.remove(os.path.join(working_dir, token_dir, token_file))
        return None
"""
converts into a datetime format that can be used for creating events
    string: a string of the with date and time in a format like this "2/25/2024 7:00am" or "11/25/2024 11:00pm"
"""
def convert_to_datetime(string):
    date_str, time_str = string.split()
    datetime_str = f"{date_str} {time_str}"
    datetime_object = datetime.strptime(datetime_str, "%m/%d/%Y %I:%M%p")
    datetime_formatted = datetime_object.strftime("%Y-%m-%dT%H:%M:%S%z")
    return datetime_formatted

