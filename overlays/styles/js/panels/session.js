class SessionPanel
{
    constructor(id)
    {
        this.element_id = id;
        this.session = null;
    }

    setSession(session)
    {
        this.session = session;
    }

    update()
    {
        if (this.session === null) return;
        let sector = "";

        $(this.element_id + " .session-time").text(this.getSessionTimeString(this.session));
        $(this.element_id + " .session-track").text(this.session.trackName);
        $(this.element_id + " .session-name").text(this.session.name);

        for (var i = 0; i < this.session.sectorFlags.length; i++)
        {
            if (this.session.sectorFlags[i])
            {
                sector += `<div class="sector-flag" ">S${i + 1}</div>`;
            }
        }

        if (sector !== "")
        {
            $(this.element_id + " .session-flag").html(sector);
        }
        else
        {
            $(this.element_id + " .session-flag").html("");
        }
    }

    getSessionTimeString(session)
    {
        let remaining = Math.floor(session.endEventTime - session.currentEventTime);
        remaining = Math.max(0, remaining);

        let hours = Math.floor(remaining / 3600);
        remaining %= 3600;

        let minutes = Math.floor(remaining / 60);
        let seconds = remaining % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

var session_panel = new SessionPanel("#session-panel");
