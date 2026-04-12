

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
