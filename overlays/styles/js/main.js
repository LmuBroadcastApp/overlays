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
        $("#telemetry-panel").hide(speed);

        $("#replay-banner").show(speed);
    }
    else
    {
        $("#tower-panel").show(speed);
        $("#session-panel").show(speed);
        $("#weather-panel").show(speed);
        $("#track-map-panel").show(speed);
        $("#telemetry-panel").show(speed);

        $("#replay-banner").hide(speed);
    }
}

function UpdateOverlaySettings(settings)
{
    const root = document.documentElement;
    console.log(settings);

    // standings panel
    root.style.setProperty('--standings-panel-position-left', settings.standings.position_left);
    root.style.setProperty('--standings-panel-position-top', settings.standings.position_top);

    // session panel
    root.style.setProperty('--session-panel-position-top', settings.session.position_top);

    // driver panel
    root.style.setProperty('--driver-panel-position-bottom', settings.driver.position_bottom);
    root.style.setProperty('--driver-panel-position-right', settings.driver.position_right);

    // weather panel
    root.style.setProperty('--weather-panel-position-right', settings.weather.position_right);
    root.style.setProperty('--weather-panel-position-top', settings.weather.position_top);

    // map panel
    root.style.setProperty('--map-panel-position-right', settings.map.position_right);
    root.style.setProperty('--map-panel-position-top', settings.map.position_top);
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
    },
    onOverlaySettingsUpdate: (data) =>
    {
        UpdateOverlaySettings(data);
    }
};

// Create websocket instance
const webSocketWrapper = new WebSocketWrapper(`ws://${window.location.hostname}:6433`);
webSocketWrapper.setCallback(callBacks);

// Register panels
panelRegistry.register('tower', TowerPanel, '#tower-panel');
panelRegistry.register('driver', DriverPanel, '#driver-panel');
panelRegistry.register('map', TrackMapPanel, '#track-map-panel');
panelRegistry.register('session', SessionPanel, '#session-panel');
panelRegistry.register('weather', WeatherPanel, '#weather-panel');
panelRegistry.register('telemetry', TelemetryPanel, '#telemetry-panel');

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const fps = 60;
const frameDuration = 1000 / fps;

let lastTime = 0;
let animationId = null;

function fnc_main_loop(timestamp)
{
    const deltaTime = timestamp - lastTime;

    if (deltaTime >= frameDuration)
    {
        panelRegistry.updateAll();
        lastTime = timestamp;
    }

    animationId = requestAnimationFrame(fnc_main_loop);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

window.addEventListener('beforeunload', () =>
{
    cancelAnimationFrame(animationId);
    webSocketWrapper.disconnect();
});

window.addEventListener('beforeunload', () =>
{
    panelRegistry.destroyAll();
});

window.addEventListener('load', () =>
{
    panelRegistry.createAll(stateManager);
    webSocketWrapper.connect();
    animationId = requestAnimationFrame(fnc_main_loop);
});
