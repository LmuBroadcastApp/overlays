class TelemetryChart
{
    constructor(selector, stateManager)
    {
        this.element = document.querySelector(selector);
        this.stateManager = stateManager;

        if (!this.element)
        {
            console.error(`TelemetryChart: Element ${selector} not found`);
            return;
        }

        this.stateManager.subscribe(this.handleStateChange.bind(this));

        const data =
        {
            labels: [], // time axis
            datasets:
            [
                {
                    label: 'Brake',
                    data: [],
                    borderColor: 'red',
                    tension: 0.3,
                    pointRadius: 0
                },
                {
                    label: 'Throttle',
                    data: [],
                    borderColor: 'green',
                    tension: 0.3,
                    pointRadius: 0
                },
                {
                    label: 'Steering',
                    data: [],
                    borderColor: 'blue',
                    tension: 0.3,
                    pointRadius: 0
                }
            ]
        };

        const config =
        {
            type: 'line',
            data: data,
            options:
            {
                responsive: false,
                animation: false,
                plugins:
                {
                    legend:
                    {
                        display: false
                    }
                },
                scales:
                {
                    x:
                    {
                        display: false
                    },
                    y:
                    {
                        display: false,
                        min: 0,
                        max: 1
                    }
                }
            }
        };

        let ctx = document.getElementById(selector.slice(1)).getContext('2d');
        this.chart = new Chart(ctx, config);
    }

    handleStateChange(key, value)
    {
        let driver = this.StandingsGetFocus(value);
        if (driver == null) return;

        const now = Date.now();
        const MAX_POINTS = 64;

        this.chart.data.labels.push(now);
        this.chart.data.datasets[0].data.push(driver.telemetry.brake);
        this.chart.data.datasets[1].data.push(driver.telemetry.throttle);
        this.chart.data.datasets[2].data.push((driver.telemetry.steering + 1) * 0.5);

        if (this.chart.data.labels.length > MAX_POINTS)
        {
            this.chart.data.labels.shift();
            this.chart.data.datasets.forEach(ds => ds.data.shift());
        }
    }

    StandingsGetFocus(standings)
    {
        for (const vehicle of standings)
        {
            if (vehicle.focus)
            {
                return vehicle;
            }
        }

        return null;
    }

    update()
    {
        this.chart.update();
    }
}
