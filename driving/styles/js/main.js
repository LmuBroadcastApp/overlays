const callBacks =
{
    onPitStopEstimation: (data) =>
    {
        stateManager.setState('onPitStopEstimation', data);
    },

    onStandingsUpdate: (data) =>
    {
        stateManager.setState('standings', data);
    },
};

// Create websocket instance
const webSocketWrapper = new WebSocketWrapper(`ws://${window.location.hostname}:6433`);
webSocketWrapper.SetCallback(callBacks);

// Register panels
panelRegistry.register('PitStopEstimation', PitStopEstimation, '#telemetry-pit-stop-estimation');
panelRegistry.register('TelemetryChart', TelemetryChart, '#telemetry-input-chart');

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
});

window.addEventListener('load', () =>
{
    animationId = requestAnimationFrame(fnc_main_loop);
    panelRegistry.createAll(stateManager);
    webSocketWrapper.Connect();
});
