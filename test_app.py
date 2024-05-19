# test_app.py
import unittest
from unittest.mock import patch, Mock
from app import app

class TestApp(unittest.TestCase):
    # set up a Flask test client to test its functionality
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    #tests the route that creates calendars through the frontend
    @patch('app.create_service')
    @patch('app.list_calendars')
    def test_get_calendars(self, mock_list_calendars, mock_create_service):
        mock_create_service.return_value = Mock()
        mock_list_calendars.return_value = [{'id': '1', 'summary': 'Calendar 1'}]
        response = self.app.get('/calendars')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json, [{'id': '1', 'summary': 'Calendar 1'}])

    # tests the events route to see if events are correctly fetched from the users google calendar
    @patch('app.create_service')
    @patch('app.fetch_events')
    def test_get_events(self, mock_fetch_events, mock_create_service):
        mock_create_service.return_value = Mock()
        mock_fetch_events.return_value = [{'id': '1', 'title': 'Event 1'}]
        response = self.app.post('/events', json={'calendarId': '1'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json, [{'id': '1', 'title': 'Event 1'}])

    # test the chat route to see if messages are correctly passed through to the chatbot from the front end
    @patch('app.handle_message')
    @patch('app.init_messages')
    def test_chat(self, mock_init_messages, mock_handle_message):
        mock_init_messages.return_value = []
        mock_handle_message.return_value = {'response': 'Hello, world!'}
        response = self.app.post('/chat', json={'message': 'Hi', 'conversation': []})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json, {'response': 'Hello, world!'})

    # tests the delete event route to see if events can be successfully deleted in from the frontend
    @patch('app.create_service')
    @patch('app.delete_event')
    def test_delete_event_route(self, mock_delete_event, mock_create_service):
        mock_create_service.return_value = Mock()
        mock_delete_event.return_value = 'Event deleted successfully'
        response = self.app.delete('/delete-event/Calendar%201/Event%201')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json, {'message': 'Event deleted successfully'})

    # checks to see if events can be successfully created from the frontend
    @patch('app.create_service')
    @patch('app.edit_event_front')
    def test_edit_event_route(self, mock_edit_event_front, mock_create_service):
        mock_create_service.return_value = Mock()
        mock_edit_event_front.return_value = True
        response = self.app.post('/edit-event/1/1', json={'newTitle': 'New Title', 'newStart': '2023-01-01T00:00:00', 'newEnd': '2023-01-01T01:00:00'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json, {'message': 'Event updated successfully'})

    # tests to see if events can be created successfully from the frontend
    @patch('app.create_service')
    @patch('app.create_event_front')
    def test_create_event_route(self, mock_create_event_front, mock_create_service):
        mock_create_service.return_value = Mock()
        mock_create_event_front.return_value = 'Event created successfully'
        response = self.app.post('/create-event/1', json={'title': 'New Event', 'start': '2023-01-01T00:00:00', 'end': '2023-01-01T01:00:00'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json, {'message': 'Event created successfully'})

    # checks to see if email summaries are corrrectly retreived from the users gmail
    @patch('app.get_email_summaries')
    def test_get_email_summaries_route(self, mock_get_email_summaries):
        mock_get_email_summaries.return_value = [{'id': '1', 'subject': 'Email 1'}]
        response = self.app.get('/email-summaries')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json, [{'id': '1', 'subject': 'Email 1'}])

    # test to see if emails can be successfully sent from the email summarizer
    @patch('app.send_email_response')
    def test_respond_to_email(self, mock_send_email_response):
        response = self.app.post('/collab', json={'emailId': '1', 'response': 'This is a response'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json, {'message': 'Email sent successfully'})

    # tests to see if emails can successfully found through the search
    @patch('app.get_email_summaries')
    def test_get_email_summaries_search_route(self, mock_get_email_summaries):
        mock_get_email_summaries.return_value = [{'id': '1', 'subject': 'Email 1'}]
        response = self.app.get('/email-summaries-search?search=test')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json, [{'id': '1', 'subject': 'Email 1'}])

if __name__ == '__main__':
    unittest.main()
