class NotificationController
{
    constructor(selector, stateManager, notifier)
    {
        this.notifier = notifier;
        this.stateManager = stateManager;

        this.fast_lap = new Map();
        this.stateManager.subscribe(this.handleStateChange.bind(this));

        this.notifications = null;
        this.session = null;

        this.standings_prev = null;
        this.standings_curr = null;
    }

    handleStateChange(key, value)
    {
        if (key === 'standings')
        {
            if (this.standings_curr)
            {
                this.standings_prev = Array.from(this.standings_curr);
            }
            this.standings_curr = value;
        }

        if (key === 'session')
        {
            if (this.session == null)
            {
                this.session = value;
                return;
            }

            if (value.name != this.session.name)
            {
                this.session = value;
                this.fast_lap.clear();
            }
        }

        if (key === 'overlay')
        {
            this.notifications = value.notifications;
        }

        this._update();
    }

    update()
    {

    }

    _update()
    {
        let fast_lap = this.notifications?.fast_lap ?? true;
        let penalties = this.notifications?.penalties ?? true;
        let incidents = this.notifications?.incidents ?? false;
        let track_limits = this.notifications?.track_limits ?? false;

        let impact_threshold = this.notifications?.impact_threshold ?? 500;
        let duration = this.notifications?.duration_sec * 1000 ?? 5000;

        if (fast_lap && this.standings_curr)
        {
            let list = this.standings_curr.filter((vehicle) => vehicle.best_lap > 0);
            const compareBestLaps = (a, b) => a.best_lap - b.best_lap;

            list.sort(compareBestLaps);
            list.forEach((vehicle) => (this._recordLap(vehicle)));
        }

        if (this.standings_curr && this.standings_prev)
        {
            let sz = Math.min(this.standings_curr.length, this.standings_prev.length);
            for (let i = 0; i < sz; i++)
            {
                let old_vehicle = this.standings_prev[i];
                let new_vehicle = this.standings_curr[i];

                if (old_vehicle.slot_id !== new_vehicle.slot_id)
                {
                    break
                }

                if (penalties && new_vehicle.penalties.drive_through > old_vehicle.penalties.drive_through)
                {
                    let msg =
                    {
                        vehicle_number: new_vehicle.vehicle_number,
                        vehicle_class: new_vehicle.vehicle_class,
                        driver: new_vehicle.driver,
                        penalty: 'Drive through'
                    };
                    this.notifier.show({ type: 'penalty', message: msg, duration: duration });
                }

                if (penalties && new_vehicle.penalties.stop_and_go > old_vehicle.penalties.stop_and_go)
                {
                    let msg =
                    {
                        vehicle_number: new_vehicle.vehicle_number,
                        vehicle_class: new_vehicle.vehicle_class,
                        driver: new_vehicle.driver,
                        type: 'Stop & Go',
                        penalty: ''
                    };
                    this.notifier.show({ type: 'penalty', message: msg, duration: duration });
                }

                if (penalties && new_vehicle.penalties.time_penalty > old_vehicle.penalties.time_penalty)
                {
                    let msg =
                    {
                        vehicle_number: new_vehicle.vehicle_number,
                        vehicle_class: new_vehicle.vehicle_class,
                        driver: new_vehicle.driver,
                        type: 'Time',
                        penalty: new_vehicle.penalties.time_penalty + 's'
                    };
                    this.notifier.show({ type: 'penalty', message: msg, duration: duration });
                }

                if (incidents && new_vehicle.impact.et > old_vehicle.impact.et && new_vehicle.impact.points > impact_threshold)
                {
                    let msg =
                    {
                        vehicle_number: new_vehicle.vehicle_number,
                        vehicle_class: new_vehicle.vehicle_class,
                        driver: new_vehicle.driver,
                        type: 'Impact',
                        impact: new_vehicle.impact.points.toFixed(0) + ' points'
                    };
                    this.notifier.show({ type: 'impact', message: msg, duration: duration });
                }

                if (track_limits && new_vehicle.cut_points > old_vehicle.cut_points)
                {
                    let p = new_vehicle.cut_points - old_vehicle.cut_points;
                    p = p.toFixed(2)

                    let msg =
                    {
                        vehicle_number: new_vehicle.vehicle_number,
                        vehicle_class: new_vehicle.vehicle_class,
                        driver: new_vehicle.driver,
                        type: 'Track limits',
                        penalty: new_vehicle.cut_points + "/" + this.session.max_cut_points
                    };
                    this.notifier.show({ type: 'track-limits', message: msg, duration: duration });
                }
            }
        }
    }

    _recordLap(vehicle)
    {
        if (vehicle.best_lap <= 0) return;
        let show_notification = false;

        if (!this.fast_lap.has(vehicle.vehicle_class))
        {
            this.fast_lap.set(vehicle.vehicle_class, vehicle);
            show_notification = true;
        }

        if (vehicle.best_lap < this.fast_lap.get(vehicle.vehicle_class).best_lap)
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
