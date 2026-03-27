class DriverPanel
{
    constructor(id)
    {
        this.element_id = id;
        this.vehicle = null;
    }

    setVehicle(vehicle)
    {
        this.vehicle = vehicle;
    }

    update()
    {
        if (this.vehicle == null)
        {
            return;
        }

        let diff_pos = this.vehicle.race_position_class - this.vehicle.qualy_position_class;
        let diff_pos_txt = "-";

        if (this.vehicle.qualy_position_class > 0 && diff_pos != 0)
        {
            diff_pos_txt = diff_pos > 0 ? "⮟ " + Math.abs(diff_pos) : "⮝ " + Math.abs(diff_pos);
            diff_pos_txt += "&nbsp;&nbsp;&nbsp;Q" + this.vehicle.qualy_position_class;
        }

        $(this.element_id + " .driver-panel-name").text(this.vehicle.driver);
        $(this.element_id + " .driver-panel-team").text(this.vehicle.vehicle_name);
        $(this.element_id + " .driver-panel-pos-diff").html(diff_pos_txt);

        $(this.element_id + " .driver-panel-last-lap").text(LaptimeToString(this.vehicle.last_lap));
        $(this.element_id + " .driver-panel-best-lap").text(LaptimeToString(this.vehicle.best_lap));

        $(this.element_id + " .driver-vehicle-class").text(this.vehicle.vehicle_class);
        $(this.element_id + " .driver-vehicle-numer").text("#" + this.vehicle.vehicle_number);
        $(this.element_id + " .driver-vehicle-position").text("P" + this.vehicle.race_position_class);

        $(this.element_id + " .driver-vehicle-numer").css("background-color", ColorFromVehicleClass(this.vehicle.vehicle_class));
    }
}

var driver_panel = new DriverPanel("#driver-panel");
