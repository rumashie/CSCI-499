"""
Developed by: Leonardo Gonzalez Luzon
"""

import requests
import constants
import webbrowser

"""
Gets an access token that will be used to access the functions of the Spotify API
"""
def get_token():
    AUTH_URL = "https://accounts.spotify.com/api/token"
    auth_response = requests.post(AUTH_URL, {
        'grant_type': 'client_credentials',
        'client_id': constants.SPOTIFY_CLIENT_ID,
        'client_secret': constants.SPOTIFY_CLIENT_SECRET,
    })
    # recieves a authentication response that contains the access token
    auth_response_data = auth_response.json()
    access_token = auth_response_data['access_token']
    return access_token

"""
Gets the url of a given song and plays it on the users browser
    token: the access token that will be used to access the functions of the Spotify API
    song_name: the name of the song the user wants to play
"""
def play_song(token, song_name):
    URL = "https://api.spotify.com/v1/search"
    headers = {"Authorization": "Bearer " + token}
    params = {'q': song_name, 'type': 'track', 'limit': 1}
    # recieves a response containing all of the relevent information of the song
    search_response = requests.get(URL, headers=headers, params=params)
    artist = search_response.json()
    # parses the reponse information in order to obtain the external_url of the song
    spotify_url = artist['tracks']['items'][0]['external_urls']['spotify']
    # opens the song on the users browser
    webbrowser.open(spotify_url)
    print("\n","song_name", "has been opened on your browser","\n")


