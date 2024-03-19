import speech_recognition as sr
from gtts import gTTS
import tempfile
from playsound import playsound
import os


"""
This function will be running in the background waiting for users to use their microphone 
if they was to give a verbal input. The input will then be proccessed into the message log
"""
def speech_to_text():
    while(1):
        # Initialize recognizer
        r = sr.Recognizer()
        # Use the default microphone as the audio source
        with sr.Microphone() as source:
            # Listen for the first phrase and extract the audio data
            audio = r.listen(source)
        try:
            # Use Google Web Speech API to transcribe the audio
            return r.recognize_google(audio)
        except sr.UnknownValueError:
            print("Google Web Speech API could not understand audio")
        except sr.RequestError as e:
            print("Could not request results from Google Web Speech API; {0}".format(e))


"""
This function will recieve turn a text into audio form and play it
    text: the text that is wanted in audio form
"""
def text_to_speech(text):
    # calls google text to speech to generate the audio based on the text
    audio = gTTS(text=text, lang='en', slow=False)
    # creates a temporary file so that the audio file is only temporaraly stored instead of 
    # generateing a bunch of mp3 files on users computers
    temp_file = tempfile.NamedTemporaryFile(suffix=".mp3", delete=False)
    audio.save(temp_file.name)
    temp_file.close()
    # plays the audio file that was made with gTTS
    playsound(temp_file.name)
    # removes the mp3 file from the filesystem
    os.remove(temp_file.name)
