class Controls
{
    constructor(url)
    {
        this.url = url;
        this.controls = { dynamic_entries: 5, static_entries: 5, update_rate: 5 };

        this.fetch = new NetworkRequest(this.url, 'json', this.fetchSession.bind(this));
        this.fetch.Get();

        setInterval(() => { this.fetch.Get() }, 1000);
    }

    fetchSession(controls)
    {
        this.controls = controls;
    }

    get()
    {
        return this.controls;
    }
}

var overlays_controls = new Controls("http://localhost:6432/controls/get");
