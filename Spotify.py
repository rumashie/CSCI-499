"""
Developed by: Leonardo Gonzalez Luzon
"""

import spotipy
from spotipy.oauth2 import SpotifyOAuth
import spotipy.util as util
import requests
import constants
import webbrowser
import pprint

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
    print("\n",f"{song_name}", "has been opened on your browser","\n")

"""
Takes a artist name and requests their artist_id
    artist_name: name of the artist
"""
def get_artist_id(artist_name):
    headers = {'Authorization': 'Bearer {token}'.format(token=get_token())}
    # requests the information of the artist
    search_response = requests.get('https://api.spotify.com/v1/' + 'search',
                                   headers=headers,
                                   params={'q': artist_name,
                                           'type': 'artist',
                                           'limit': 1})
    # if request is successful then it will return the artist id
    if search_response.status_code == 200:
        artists = search_response.json()['artists']['items']
        if artists:
            return artists[0]['id']
        else:
            print(f"No artist found with the name: {artist_name}")
            new_name = input("Please input an Artist name: ")
            return get_artist_id(new_name)
    else:
        print("Error occurred while searching for the artist.")
    return None

"""
gets the top tracks from a artist then returns a list of the top 10 songs
    artist: the name of the artist
"""
def top_songs_call(artist):
    artist_id = get_artist_id(artist)
    country_code = 'US'
    headers = {'Authorization': 'Bearer {token}'.format(token=get_token())}
    # requests the top tracks of the specified artist
    r = requests.get('https://api.spotify.com/v1/' + 'artists/' + artist_id + '/top-tracks',
                     headers=headers, params={'market': country_code})
    data = r.json()
    top_songs = data['tracks'][:10]
    result = []
    # parses through and adds the relevent information from each track to a list called result
    for song in top_songs:
        artist_name = song['artists'][0]['name']
        song_name = song['name']
        uri = song['uri']
        track_id = uri.split(':')[-1]
        result.append({
            'artist': artist_name,
            'song': song_name,
            'uri': uri,
            'track_id': track_id
    })
    return result

"""
creates a playlist with the top tracks from the given artist
    artist: the name of the artist
    playlist_name: an optional paramater that allows users to name their playlist
"""
def create_playlist(artist, playlist_name="Playlist"):
    songs = top_songs_call(artist)
    # special token using the spotipy library to allow the code to make a playlist on the users account
    token = util.prompt_for_user_token(username=constants.SPOTIFY_USERNAME, 
                                       scope="playlist-modify-public playlist-modify-private", 
                                       client_id=constants.SPOTIFY_CLIENT_ID,
                                       client_secret=constants.SPOTIFY_CLIENT_SECRET, 
                                       redirect_uri='https://example.com')
    # if the token is properly created then the authentication flow begins
    if token:
        sp = spotipy.Spotify(auth=token)
    else:
        print('cannot acces token')
    # after authenticating the playlist is created using the spotipy library
    playlist = sp.user_playlist_create(constants.SPOTIFY_USERNAME, playlist_name, public=True, collaborative=False, description='recs')
    playlist_id = playlist['id']
    playlist_url = playlist['external_urls']['spotify']
    track_uris = []
    # gets the list of songs to be added to the newly created playlist
    for i in range(len(songs)):
        track_uris.append(songs[i]['uri'])
    sp.playlist_add_items(playlist_id, track_uris)
    print('\n', f"Playlist '{playlist_name}' created successfully with {len(songs)} songs.", '\n')
    webbrowser.open(playlist_url)
