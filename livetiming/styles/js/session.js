function SessionTimeString(session)
{
    let remaining = Math.floor(session.endEventTime - session.currentEventTime);
    remaining = Math.max(0, remaining);

    let hours = Math.floor(remaining / 3600);
    remaining %= 3600;

    let minutes = Math.floor(remaining / 60);
    let seconds = remaining % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function SessionTrackStatusString(session)
{
    let resul = "Yellow: ";
    let hasYellow = false;

    if (session.sectorFlags[0])
    {
        hasYellow = true;
        resul += "S1 ";
    }

    if (session.sectorFlags[1])
    {
        hasYellow = true;
        resul += "S2 ";
    }

    if (session.sectorFlags[2])
    {
        hasYellow = true;
        resul += "S3 ";
    }

    if (!hasYellow)
    {
        resul += "None";
    }

    return resul.trim();
}

function SessionTemperatureString(session)
{
    return `Track: ${session.trackTemp.toFixed(1)}°C / Air: ${session.ambientTemp.toFixed(1)}°C / Rain: ${session.raining.toFixed(1)}% / Wet: ${session.averagePathWetness.toFixed(1)}%`;
}
