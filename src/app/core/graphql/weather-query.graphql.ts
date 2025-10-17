export const WEATHER_QUERY = `
    query {
      weatherData {
        actual {
          stationmeasurements {
            stationid
            stationname
            regio
            timestamp
            weatherdescription
            fullIconUrl
            lat
            lon
            windspeed
            temperature
            feeltemperature
            humidity
            airpressure
            rainFallLast24Hour
            rainFallLastHour
          }
        }
        forecast {
          fivedayforecast {
            day
            maxtemperatureMax
            mintemperatureMin
            rainChance
            windDirection
            wind
            fullIconUrl
          }
        }
      }
    }
  `;
