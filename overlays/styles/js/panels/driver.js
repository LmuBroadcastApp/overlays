class DriverPanel
{
    constructor(id)
    {
        this.element_id = id;
    }

    update(vehicle, isRace)
    {
        $(this.element_id + " .driver-panel-name").text(vehicle.driver);
        $(this.element_id + " .driver-panel-team").text(vehicle.vehicle_name);

        $(this.element_id + " .driver-panel-last-lap").text(LaptimeToString(vehicle.last_lap));
        $(this.element_id + " .driver-panel-best-lap").text(LaptimeToString(vehicle.best_lap));

        $(this.element_id + " .driver-vehicle-class").text(vehicle.vehicle_class);
        $(this.element_id + " .driver-vehicle-numer").text("#" + vehicle.vehicle_number);
        $(this.element_id + " .driver-vehicle-position").text("P" + (isRace ? vehicle.race_position : vehicle.qualy_position));

        $(this.element_id + " .driver-vehicle-numer").css("background-color", ColorFromVehicleClass(vehicle.vehicle_class));
    }
}

var driver_panel = new DriverPanel("#driver-panel");
