class NotificationManager
{
    constructor(selector, stateManager, notifier)
    {
        this.notifier = notifier;
        this.stateManager = stateManager;

        this.fast_lap = new Map();
        this.stateManager.subscribe(this.handleStateChange.bind(this));

        this.standings_old = null;
        this.standings = null;
    }

    handleStateChange(key, value)
    {
        if (key === 'standings')
        {
            if (this.standings)
            {
                this.standings_old = Array.from(this.standings);
            }
            this.standings = value;
        }
    }

    update()
    {
        if (this.standings)
        {
            let list = this.standings.filter((vehicle) => vehicle.best_lap > 0);
            const compareBestLaps = (a, b) => a.best_lap - b.best_lap;

            list.sort(compareBestLaps);
            list.forEach((vehicle) => (this._recordLap(vehicle)));
        }

        if (this.standings && this.standings_old)
        {
            let sz = Math.min(this.standings.length, this.standings_old.length);
            for (let i = 0; i < sz; i++)
            {
                let old_vehicle = this.standings_old[i];
                let new_vehicle = this.standings[i];

                if (old_vehicle.slot_id !== new_vehicle.slot_id)
                {
                    break
                }

                if (new_vehicle.penalties.drive_through > old_vehicle.penalties.drive_through)
                {
                    let msg =
                    {
                        vehicle_number: new_vehicle.vehicle_number,
                        vehicle_class: new_vehicle.vehicle_class,
                        driver: new_vehicle.driver,
                        penalty: 'Drive through'
                    };
                    this.notifier.show({ type: 'penalty', message: msg, duration: 5000 });
                }

                if (new_vehicle.penalties.stop_and_go > old_vehicle.penalties.stop_and_go)
                {
                    let msg =
                    {
                        vehicle_number: new_vehicle.vehicle_number,
                        vehicle_class: new_vehicle.vehicle_class,
                        driver: new_vehicle.driver,
                        penalty: 'Stop & Go '
                    };
                    this.notifier.show({ type: 'penalty', message: msg, duration: 5000 });
                }

                if (new_vehicle.penalties.time_penalty > old_vehicle.penalties.time_penalty)
                {
                    let msg =
                    {
                        vehicle_number: new_vehicle.vehicle_number,
                        vehicle_class: new_vehicle.vehicle_class,
                        driver: new_vehicle.driver,
                        penalty: 'Time penalty ' + new_vehicle.penalties.time_penalty + 's'
                    };
                    this.notifier.show({ type: 'penalty', message: msg, duration: 5000 });
                }
            }
        }
    }

    _recordLap(vehicle)
    {
        let exists = this.fast_lap.has(vehicle.vehicle_class);
        let show_notification = false;

        if (!exists)
        {
            this.fast_lap.set(vehicle.vehicle_class, vehicle);
            show_notification = true;
        }

        if (vehicle.best_lap <= 0) return;
        let currentFastest = this.fast_lap.get(vehicle.vehicle_class);

        if (vehicle.best_lap < currentFastest.best_lap)
        {
            this.fast_lap.set(vehicle.vehicle_class, vehicle)
            show_notification = true;
        }

        if (show_notification)
        {
            this.notifier.show({ type: 'fast-lap', subtype: vehicle.vehicle_class, message: vehicle, duration: 5000 });
        }
    }
}
