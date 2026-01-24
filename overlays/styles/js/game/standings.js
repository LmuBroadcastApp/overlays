class Standings
{
    constructor(url)
    {
        this.url = url;
        this.standings = [];

        this.fetch = new NetworkRequest(this.url, 'json', this.fetchStandings.bind(this));
        this.fetch.Get();

        setInterval(() => { this.fetch.Get() }, 250);
    }

    fetchStandings(standings)
    {
        this.standings = standings;
    }

    getByClasses()
    {
        const perCategory = new Map();

        for (const vehicle of this.standings)
        {
            if (!perCategory.has(vehicle.vehicle_class))
            {
                perCategory.set(vehicle.vehicle_class, []);
            }
            perCategory.get(vehicle.vehicle_class).push(vehicle);
        }

        return perCategory;
    }

    getFocus()
    {
        for (const vehicle of this.standings)
        {
            if (vehicle.focus)
            {
                return vehicle;
            }
        }

        return {};
    }

    get()
    {
        return this.standings;
    }
}

var game_standings = new Standings("http://localhost:6432/standings/get");
