class WeatherPanel
{
    constructor(selector, stateManager)
    {
        this.element = document.querySelector(selector);
        this.stateManager = stateManager;

        if (!this.element)
        {
            console.error(`TowerPanel: Element ${selector} not found`);
            return;
        }

        this.stateManager.subscribe(this.handleStateChange.bind(this));
        this.session = null;
    }

    handleStateChange(key, value)
    {
        if (key === 'session')
        {
            this.session = value;
        }
    }

    update()
    {
        if (this.session === null)
        {
            return;
        }

        let skyName = "Unknown";
        let when = "Now";

        let ambientTemp = 0;
        let skyType = 0;

        let idx = this.session.weatherForecast.length; let content = "";
        let perc = this.session.currentEventTime / this.session.endEventTime;

        for (let i = 0; i < this.session.weatherForecast.length - 1; ++i)
        {
            let p0 = this.session.weatherForecast[i + 0].idx;
            let p1 = this.session.weatherForecast[i + 1].idx;

            if (p0 < perc && perc < p1)
            {
                idx = i;break;
            }
        }

        for (let i = idx; i < this.session.weatherForecast.length - 1; i++)
        {
            if (i > idx)
            {
                let timeSlot = this.session.weatherForecast[i].idx * this.session.endEventTime;
                let remainingTime = timeSlot - this.session.currentEventTime;

                let div = 1.0 / 60.0;
                let result = Math.floor(remainingTime * div);
                //when = result >= 60 ? `${(result * div).toFixed(1)}h` : `${result}m`;

                if (result >= 60)
                {
                    let hours = Math.floor(result * div);
                    let minutes = Math.floor(result - (hours * 60));
                    when = `${hours}h.${minutes}m`;
                }
                else
                {
                    when = `${result}m`;
                }

                skyType = this.session.weatherForecast[i].sky;
                skyName = this.session.weatherForecast[i].sky_name;
                ambientTemp = this.session.weatherForecast[i].temperature;
            }
            else
            {
                skyType = this.ForecastSkyType(this.session.weatherForecast[i].sky, this.session.raining);
                skyName = this.ForcastSkyTypeToString(skyType);
                ambientTemp = this.session.ambientTemp.toFixed(0);
                when = "Now";
            }

            let icon = `<div class="weather-icon"><img src="styles/img/weather/${skyType}.png" alt="${skyName}"/></div>`;
            let temp = `<div class="weather-temp">${ambientTemp} ºC</div>`;
            let time = `<div class="weather-time">${when}</div>`;

            content = content + `<div class="weather-item">${time}${icon}${temp}</div>`;
        }

        this.element.innerHTML = content;
    }

    ForecastSkyType(sky, raininess)
    {
        if (raininess <= 0)
        {
            return (sky > 4) ? 4 : 0;
        }
        if (0 < raininess && raininess <= 10)
        {
            return 5;
        }
        if (10 < raininess && raininess <= 15)
        {
            return 6;
        }
        if (15 < raininess && raininess <= 20)
        {
            return 7;
        }
        if (20 < raininess && raininess <= 40)
        {
            return 8;
        }
        if (40 < raininess && raininess <= 60)
        {
            return 9;
        }
        if (60 < raininess)
        {
            return 10;
        }

        return sky;
    }

    ForcastSkyTypeToString(sky)
    {
        switch (sky)
        {
            case 0: return "Clear";
            case 1: return "Light Clouds";
            case 2: return "Partially Cloudy";
            case 3: return "Mostly Cloudy";
            case 4: return "Overcast";
            case 5: return "Cloudy & Drizzle";
            case 6: return "Cloudy & Light Rain";
            case 7: return "Overcast & Light Rain";
            case 8: return "Overcast & Rain";
            case 9: return "Overcast & Heavy Rain";
            case 10: return "Overcast & Storm";
            default: return "Unknown";
        }
    }
}
