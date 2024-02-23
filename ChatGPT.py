from openai import OpenAI
import constants
from GoogleCalendar import create_calendar, delete_calendar, add_event, delete_event


# copy your openai secret key to api_key
client = OpenAI(api_key = constants.APIKEY)

# api will recieve these messages to make a response
message_log = []
message = ""
# will allow users to keep asking multiple messages
while message != "exit":
    # take an input so the user can ask a question
    message = input()
    # create calendar <calendar name>
    if "create calendar" in message:
        info = message.split()
        start = info.index("calendar") + 1
        info = info[start:]
        calendar_name = ' '.join(info)
        create_calendar(calendar_name)
        print(calendar_name, "has been created.")
    # delete calendar <calendar name>
    elif "delete calendar" in message:
        info = message.split()
        start = info.index("calendar") + 1
        info = info[start:]
        calendar_name = ' '.join(info)
        if delete_calendar(calendar_name):
            print(calendar_name, "has been deleted.")
    # add event <event name> in <calendar name> from <start date> at <start time> to <end date> at <end time> (with the description <description>) this part is optional
    # start and end date should be in this format 2/25/2024 or 11/5/2025
    # start and end times should be in this format 7:00am or 11:40pm
    elif "add event" in message:
        info = message.split(" in ")
        event_name = info[0].replace("add event ", "")
        calendar_name = info[1].split(" from ")[0]
        time_part = info[1].split(" from ")[1]
        time_parts = time_part.split(" to ")
        start_time = time_parts[0]
        start_time = start_time.replace(" at ", " ")
        if "with the description" in time_parts[1]:
            info = time_parts[1].split(" with the description ")
            end_time = info[0].replace(" at ", " ")
            description = info[1]
            if add_event(calendar_name, event_name, start_time,  end_time, description):
                print(event_name, "has been added to", calendar_name + ".")
        else:
            info = info[1].split(" to ")
            end_time = info[1]
            end_time = end_time.replace(" at ", " ")
            if add_event(calendar_name, event_name, start_time,  end_time):
                print(event_name, "has been added to", calendar_name + ".")
    # remove event <event name> from <calendar name>
    elif "remove event" in message:
        info = message.split()
        start = info.index("event") + 1
        end = info.index("from")
        event_name = info[start:end]
        event_name = " ".join(event_name)
        calendar_name = info[end+1:]
        calendar_name = " ".join(calendar_name)
        if delete_event(calendar_name, event_name):
            print(event_name, "has been removed from", calendar_name + ".")

    # if not making changes to calendar then the chatbot will respond
    else:
        # append the message to the list
        message_log.append({"role": "user", "content": message})
        # connect to the api in order for the api to bring back a response
        chat_completion = client.chat.completions.create(
            messages=message_log,
            model="gpt-3.5-turbo"
        )
        # the answer to the prompted question
        reply = chat_completion.choices[0].message.content
        # appends the message to the list so that the chatbot remembers the chat history
        message_log.append({"role": "assistant", "content": reply})
        # prints the response
        print("\n" + reply + "\n")