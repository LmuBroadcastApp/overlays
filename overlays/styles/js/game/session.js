class Session
{
    constructor(url)
    {
        this.url = url;
        this.session = {};

        this.fetch = new NetworkRequest(this.url, 'json', this.fetchSession.bind(this));
        this.fetch.Get();

        setInterval(() => { this.fetch.Get() }, 1000);
    }

    fetchSession(session)
    {
        this.session = session;
    }

    get()
    {
        return this.session;
    }
}

var game_session = new Session("http://localhost:6432/session/get");
