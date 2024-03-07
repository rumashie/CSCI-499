import requests
import constants

def kelvin_to_fahrenheit(kelvin): 
    return (kelvin - 273.15) * 9/5 + 32

def get_forecast(city_name):
    api_key = constants.WEATHER_APIKEY
    url = f"http://api.openweathermap.org/data/2.5/weather?q={city_name}&appid={api_key}"
    response = requests.get(url)
    data = response.json()
    
    if response.status_code == 200:
        if 'coord' not in data:
            print(f"Failed to retrieve city data for {city_name}.")
            return
        forecast_url = f"http://api.openweathermap.org/data/2.5/forecast?q={city_name}&appid={api_key}"
        forecast_response = requests.get(forecast_url)
        forecast_data = forecast_response.json()
        
        if forecast_response.status_code == 200:
            print(f"3 Hour, Weekly Forecast for {city_name}")
            print("------------------------------------------------------------")
            for forecast in forecast_data['list']:
                forecast_time = forecast['dt_txt']
                temperature_kelvin = forecast['main']['temp']
                temperature_fahrenheit = kelvin_to_fahrenheit(temperature_kelvin)
                weather_description = forecast['weather'][0]['description']
                print(f"Time: {forecast_time}, Temperature: {temperature_fahrenheit:.2f}°F, Description: {weather_description}")
        else:
            print("Failed to get data.")
    else:
        print(f"Failed to get city data for {city_name}.")
