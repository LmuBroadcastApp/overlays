class Standings
{
    constructor(url)
    {
        this.url = url;
        this.standings = [];

        this.fetch = new NetworkRequest(this.url, 'json', this.fetchStandings.bind(this));
        this.fetch.Get();

        setInterval(() => { this.fetch.Get() }, 64);
    }

    fetchStandings(standings)
    {
        this.standings = standings;
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

        return null;
    }

    get()
    {
        return this.standings;
    }
}

var game_standings = new Standings("http://localhost:6432/standings/get");
