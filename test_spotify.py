import unittest
from unittest.mock import patch, Mock
import constants
from Spotify import get_token, play_song, get_artist_id, top_songs_call, create_playlist

class TestSpotify(unittest.TestCase):
    # tests the to see if the get token function is working
    @patch('Spotify.requests.post')
    def test_get_token(self, mock_post):
        mock_response = Mock()
        mock_response.json.return_value = {'access_token': 'mock_token'}
        mock_post.return_value = mock_response
        token = get_token()
        self.assertEqual(token, 'mock_token')

    # tests the play song function to see if a song is played
    @patch('Spotify.webbrowser.open')
    @patch('Spotify.requests.get')
    def test_play_song(self, mock_get, mock_open):
        mock_response = Mock()
        mock_response.json.return_value = {
            'tracks': {
                'items': [{
                    'external_urls': {'spotify': 'https://open.spotify.com/track/mock_track'}
                }]
            }
        }
        mock_get.return_value = mock_response
        result = play_song('mock_token', 'mock_song')
        mock_open.assert_called_once_with('https://open.spotify.com/track/mock_track')
        self.assertIn('mock_song has been opened on your browser', result)

    # tests the get_artist_id function to see if the id is corectly returned
    @patch('Spotify.requests.get')
    def test_get_artist_id(self, mock_get):
        mock_response = Mock()
        mock_response.json.return_value = {
            'artists': {
                'items': [{'id': 'mock_artist_id'}]
            }
        }
        mock_get.return_value = mock_response
        mock_get.return_value.status_code = 200
        artist_id = get_artist_id('mock_artist')
        self.assertEqual(artist_id, 'mock_artist_id')

    # tests top_song_call function to see if the top songs of an artist is returned
    @patch('Spotify.requests.get')
    @patch('Spotify.get_artist_id')
    def test_top_songs_call(self, mock_get_artist_id, mock_get):
        mock_get_artist_id.return_value = 'mock_artist_id'
        mock_response = Mock()
        mock_response.json.return_value = {
            'tracks': [{
                'artists': [{'name': 'mock_artist'}],
                'name': 'mock_song',
                'uri': 'spotify:track:mock_track_id'
            }]
        }
        mock_get.return_value = mock_response
        songs = top_songs_call('mock_artist')
        self.assertEqual(len(songs), 1)
        self.assertEqual(songs[0]['artist'], 'mock_artist')
        self.assertEqual(songs[0]['song'], 'mock_song')
        self.assertEqual(songs[0]['uri'], 'spotify:track:mock_track_id')

    # tests the create playlist function to see if a playlist is correctly made
    @patch('Spotify.spotipy.Spotify')
    @patch('Spotify.util.prompt_for_user_token')
    @patch('Spotify.top_songs_call')
    @patch('Spotify.webbrowser.open')
    def test_create_playlist(self, mock_open, mock_top_songs_call, mock_prompt_for_user_token, mock_spotify):
        mock_prompt_for_user_token.return_value = 'mock_token'
        mock_top_songs_call.return_value = [{'uri': 'spotify:track:mock_track_id'}]
        mock_spotify_instance = mock_spotify.return_value
        mock_spotify_instance.user_playlist_create.return_value = {
            'id': 'mock_playlist_id',
            'external_urls': {'spotify': 'https://open.spotify.com/playlist/mock_playlist_id'}
        }
        result = create_playlist('mock_artist', 'mock_playlist')
        mock_spotify_instance.user_playlist_create.assert_called_once_with(constants.SPOTIFY_USERNAME, 'mock_playlist', public=True, collaborative=False, description='recs')
        mock_spotify_instance.playlist_add_items.assert_called_once_with('mock_playlist_id', ['spotify:track:mock_track_id'])
        mock_open.assert_called_once_with('https://open.spotify.com/playlist/mock_playlist_id')
        self.assertIn("Playlist 'mock_playlist' created successfully with 1 songs.", result)

if __name__ == '__main__':
    unittest.main()
