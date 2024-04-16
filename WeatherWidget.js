import React, { useState, useEffect } from 'react';
import './WeatherWidget.css';

const WeatherWidget = () => {
  const [weatherData, setWeatherData] = useState(null);

  useEffect(() => {
   
    const fetchWeatherData = async () => {
      try {
        const response = await fetch(
          'https://api.openweathermap.org/data/2.5/weather?q=New York&appid=9b0b89e0ab1726fdc6a4186660bad45b'
        );
        const data = await response.json();
        setWeatherData(data);
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    };

    fetchWeatherData();
  }, []);

  if (!weatherData) {
    return <div>Loading...</div>;
  }

  const { name, weather, main } = weatherData;
  const { description, icon } = weather[0];
  const { temp, humidity } = main;

  const temperatureFahrenheit = Math.round((temp - 273.15) * 9/5 + 32);

  return (
    <div className="weather-widget">
      <div className="weather-icon">
        <img
          src={`http://openweathermap.org/img/wn/${icon}.png`}
          alt={description}
        />
      </div>
      <div className="weather-info">
        <h2>{name}</h2>
        <p className="temperature">{temperatureFahrenheit}°F</p>
        <p className="description">{description}</p>
        <p className="humidity">Humidity: {humidity}%</p>
      </div>
    </div>
  );
};

export default WeatherWidget;
