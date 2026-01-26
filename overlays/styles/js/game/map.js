class TrackMap
{
    constructor(url)
    {
        this.url = url;
        this.points = null;

        this.fetch = new NetworkRequest(this.url, 'json', this.fetchTrackMap.bind(this));
    }

    fetchTrackMap(points)
    {
        this.points = points;
    }

    clear()
    {
        this.points = null;
    }

    get()
    {
        if (this.points == null)
        {
            this.fetch.Get();
        }
        return this.points;
    }
}
var map_controls = new TrackMap("http://localhost:6432/trackmap/get");
