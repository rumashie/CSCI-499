import unittest
from unittest.mock import patch, Mock
from Chatbot import handle_message, init_messages, process_response

class TestChatbot(unittest.TestCase):
    # sets up the OpenAI api service using Mock to set up google connections 
    @patch('Chatbot.OpenAI')
    @patch('Chatbot.create_service')
    def setUp(self, mock_create_service, mock_OpenAI):
        self.mock_openai_client = Mock()
        mock_OpenAI.return_value = self.mock_openai_client
        self.mock_service = Mock()
        mock_create_service.return_value = self.mock_service
        self.message_log = init_messages([])

    # tests to see if messages are properly handled when the user enters an input
    @patch('Chatbot.process_response')
    def test_handle_message_create_event(self, mock_process_response):
        user_input = "Create an event called meeting at March 20 2024 at 10am for 2 hours on my work calendar"
        expected_reply = "Create event, work, meeting, 3/20/2024 10:00am, 3/20/2024 12:00pm"
        expected_response = "Create event, work, meeting, 3/20/2024 10:00am, 3/20/2024 12:00pm"
        self.mock_openai_client.chat.completions.create.return_value = Mock(choices=[Mock(message=Mock(content=expected_reply))])
        mock_process_response.return_value = expected_response
        result = handle_message(user_input, self.message_log)
        self.assertEqual(result['response'], expected_response)

    # tests to see if a event is properly created with the correct reply text
    @patch('Chatbot.create_event')
    def test_process_response_create_event(self, mock_create_event):
        reply = "Create event, work, meeting, 3/20/2024 10:00am, 3/20/2024 12:00pm"
        user_input = "Create an event called meeting at March 20 2024 at 10am for 2 hours on my work calendar"
        mock_create_event.return_value = "Event created successfully"
        result = process_response(reply, self.message_log, user_input)
        self.assertEqual(result, "Event created successfully")

    # checks to see if an event is properly deleted with the correct reply text
    @patch('Chatbot.delete_event')
    def test_process_response_delete_event(self, mock_delete_event):
        reply = "Delete event, work, meeting"
        user_input = "Delete the meeting event on my work calendar"
        mock_delete_event.return_value = "Event deleted successfully"
        result = process_response(reply, self.message_log, user_input)
        self.assertEqual(result, "Event deleted successfully")

    # checks to see if a song will be properly played with the correct reply text
    @patch('Chatbot.play_song')
    @patch('Chatbot.get_token')
    def test_process_response_play_song(self, mock_get_token, mock_play_song):
        reply = "Play song, Fast Car"
        user_input = "Can you play Fast Car"
        mock_get_token.return_value = "mock_token"
        mock_play_song.return_value = "Playing Fast Car"
        result = process_response(reply, self.message_log, user_input)
        self.assertEqual(result, "Playing Fast Car")

    # tests if a calendar is correctly created with the correct reply text
    @patch('Chatbot.create_calendar')
    def test_process_response_create_calendar(self, mock_create_calendar):
        reply = "Create calendar, my_calendar"
        user_input = "Create a calendar called my_calendar"
        mock_create_calendar.return_value = "Calendar created successfully"
        result = process_response(reply, self.message_log, user_input)
        self.assertEqual(result, "Calendar created successfully")

if __name__ == '__main__':
    unittest.main()
