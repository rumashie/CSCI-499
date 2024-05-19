# test_google_calendar.py
import unittest
from unittest.mock import patch, Mock
from datetime import datetime, timezone, timedelta
from GoogleCalendar import delete_calendar, create_event, get_event_ID, delete_event, convert_to_datetime


class TestGoogleCalendar(unittest.TestCase):
    # sets up the google instance that will be used to connect to the api using Mock
    def setUp(self):
        self.mock_service = Mock()

    # tests the create_event function to see if the correct output is generated
    @patch('GoogleCalendar.convert_to_datetime')
    @patch('GoogleCalendar.get_calendarID')
    def test_create_event(self, mock_get_calendarID, mock_convert_to_datetime):
        mock_get_calendarID.return_value = 'mock_calendar_id'
        mock_convert_to_datetime.side_effect = lambda x: x
        result = create_event('work', 'meeting', '3/20/2024 10:00am', '3/20/2024 12:00pm', self.mock_service)
        self.mock_service.events().insert.assert_called_once()
        self.assertIn('Created Event meeting on work from 3/20/2024 10:00am to 3/20/2024 12:00pm', result)

    #test the delete_calendar function to see if calendars are correctly deleted
    @patch('GoogleCalendar.get_calendarID')
    def test_delete_calendar(self, mock_get_calendarID):
        mock_get_calendarID.return_value = 'mock_calendar_id'
        result = delete_calendar('work', self.mock_service)
        self.mock_service.calendars().delete.assert_called_once_with(calendarId='mock_calendar_id')
        self.assertIn('Calendar called work was deleted.', result)

    # tests the delete_calendar function to see if a calednar is not found the function handles the problem correctly
    @patch('GoogleCalendar.get_calendarID')
    def test_delete_calendar_not_found(self, mock_get_calendarID):
        mock_get_calendarID.return_value = None
        result = delete_calendar('nonexistent_calendar', self.mock_service)
        self.assertIn("Calendar doesn't exist", result)

    # tests the get_event_ID fucntion to see if an event id is correctly returned
    @patch('GoogleCalendar.get_calendarID')
    def test_get_event_ID(self, mock_get_calendarID):
        mock_get_calendarID.return_value = 'mock_calendar_id'
        self.mock_service.events().list.return_value.execute.return_value = {
            'items': [{'summary': 'meeting', 'id': 'event_id_1'}, {'summary': 'lunch', 'id': 'event_id_2'}]
        }
        event_id = get_event_ID('work', 'meeting', self.mock_service)
        self.assertEqual(event_id, 'event_id_1')

    # test to see if the get_event_ID function correctly handles not finding an event
    @patch('GoogleCalendar.get_calendarID')
    def test_get_event_ID_not_found(self, mock_get_calendarID):
        mock_get_calendarID.return_value = 'mock_calendar_id'
        self.mock_service.events().list.return_value.execute.return_value = {'items': []}
        event_id = get_event_ID('work', 'nonexistent_event', self.mock_service)
        self.assertIsNone(event_id)
    # test the convert_to_datetime funtion
    def test_convert_to_datetime(self):
        input_time = "2/25/2024 7:00am"
        expected_output = "2024-02-25T07:00:00"
        self.assertEqual(convert_to_datetime(input_time), expected_output)

    # tests the delete event function to see if it correctly deletes a event
    @patch('GoogleCalendar.get_calendarID')
    @patch('GoogleCalendar.get_event_ID')
    def test_delete_event(self, mock_get_event_ID, mock_get_calendarID):
        mock_get_calendarID.return_value = 'mock_calendar_id'
        mock_get_event_ID.return_value = 'mock_event_id'
        result = delete_event('work', 'meeting', self.mock_service)
        self.mock_service.events().delete.assert_called_once_with(calendarId='mock_calendar_id', eventId='mock_event_id')
        self.assertIn('The event called meeting was deleted', result)

if __name__ == '__main__':
    unittest.main()
