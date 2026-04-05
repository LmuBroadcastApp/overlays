function ToggleOverlayByReplay(stateManager)
{
    let active = stateManager.getState("session")?.replayActive;
    active = active === undefined ? false : active;

    let speed = stateManager.getState("controls")?.overlay_animation_speed;
    speed = isNaN(speed) ? 0 : speed * 1000;

    if (active)
    {
        $("#tower-panel").hide(speed);
        $("#session-panel").hide(speed);
        $("#weather-panel").hide(speed);
        $("#track-map-panel").hide(speed);

        $("#replay-banner").show(speed);
    }
    else
    {
        $("#tower-panel").show(speed);
        $("#session-panel").show(speed);
        $("#weather-panel").show(speed);
        $("#track-map-panel").show(speed);

        $("#replay-banner").hide(speed);
    }
}

const callBacks =
{
    onStandingsUpdate: (data) =>
    {
        stateManager.setState('standings', data);
    },
    onSessionUpdate: (data) =>
    {
        const session = data.trackName !== "" ? data : null;
        stateManager.setState('session', session);
        ToggleOverlayByReplay(stateManager);
    },
    onTrackMapUpdate: (data) =>
    {
        stateManager.setState('map', data);
    },
    onOverlayUpdate: (data) =>
    {
        stateManager.setState('controls', data);
    }
};

// Create websocket instance
const webSocketWrapper = new WebSocketWrapper(`ws://${window.location.hostname}:6433`);
webSocketWrapper.SetCallback(callBacks);

// Register panels
panelRegistry.register('driver', DriverPanel, '#driver-panel');
panelRegistry.register('map', TrackMapPanel, '#track-map-panel');
panelRegistry.register('session', SessionPanel, '#session-panel');
panelRegistry.register('tower', TowerPanel, '#tower-panel');
panelRegistry.register('weather', WeatherPanel, '#weather-panel');

setInterval(() =>
{
    panelRegistry.updateAll();
}, 1000 / 30); // 30 FPS


window.addEventListener('beforeunload', () =>
{
});

window.addEventListener('load', () =>
{
    panelRegistry.createAll(stateManager);
    webSocketWrapper.Connect();
});
