class TowerPanel
{
    constructor(id)
    {
        this.element_id = id;
        this.vehicle_control = new Map();

        this.session = {};
        this.standings = [];

        this.controls =
        {
            update_rate: 3,
            static_entries: 5,
            dynamic_entries: 5,
        };
    }

    clear()
    {
        $(this.element_id).empty();
    }

    setSession(session)
    {
        this.session = session;
    }

    setControls(controls)
    {
        if (controls.vehicleClass != this.controls.vehicleClass)
        {
            this.vehicle_control.clear();
        }
        this.controls = controls;
    }

    setStandings(standings)
    {
        this.standings = standings;
    }

    hasPenalty(vehicle)
    {
        let dt = vehicle.penalties.drive_through;
        let tp = vehicle.penalties.time_penalty;
        let sg = vehicle.penalties.stop_and_go;
        return dt > 0 || sg > 0 || tp > 0;
    }

    getRaceFlags(vehicle)
    {
        let flag_txt = "";

        if (vehicle.in_pits && vehicle.status != "Finished" && vehicle.status != "DNF" && vehicle.status != "DQ")
        {
            flag_txt += "<span class='vehicle-in-pits'>PIT</span>";
        }

        if (vehicle.status == "Finished")
        {
            flag_txt = "<span><img alt='finish-flag' height='23' src='styles/img/others/flag_finish.jpg'/></span>";
        }

        return flag_txt == "" ? "" : `<td>${flag_txt}</td>`;
    }

    getPenalty(vehicle)
    {
        let penalty_txt = "";

        if (vehicle.status == "DNF" || vehicle.status == "DQ")
        {
            return "";
        }

        if (vehicle.penalties.drive_through > 0)
        {
            penalty_txt += "<span class='penalty-style'>DT</span>";
        }

        if (vehicle.penalties.stop_and_go > 0)
        {
            penalty_txt += "<span class='penalty-style'>SG</span>";
        }

        if (vehicle.penalties.time_penalty > 0)
        {
            penalty_txt += "<span class='penalty-style'>+" + vehicle.penalties.time_penalty + "</span>";
        }

        return penalty_txt == "" ? "" : `<td>${penalty_txt}</td>`;
    }

    createRow(vehicle, position, isRace, tableRow, bestLap, rightColumn)
    {
        let name = VehicleGetName(vehicle, this.controls, isRace);
        let gap = VehicleGetGap(vehicle, this.controls, isRace);
        let fuel_ve = GetVehicleFuelVe(vehicle);

        let selected_color = "";
        let penalty_txt = ""; let has_penalty = "";

        if (vehicle.focus)
        {
            selected_color = "color-selected";
        }

        let bestLapImg = "";

        if (!vehicle.in_pits && vehicle.telemetry.speed < 50)
        {
            bestLapImg = "";
        }
        else if (vehicle.slot_id == bestLap.id)
        {
            bestLapImg = "󰔛";
        }

        let right_column_content = "";
        let tr = `<tr class="${selected_color}">
                    <td style="width: 16px;">${bestLapImg}</td>
                    <td class="vehicle-position colored-row-primary">${position}</td>
                    <td class="vehicle-driver colored-row-primary"><span class="vehicle-driver-truncate-text">${name}</span></td>
                    <td class="vehicle-logo colored-row-primary"><img height="23px" alt="" src="styles/img/brandlogo/${vehicle.manufacturer}.png" /></td>
                    <td class="vehicle-number colored-row-primary">#${vehicle.vehicle_number}</td>
                    <td class="vehicle-gap colored-row-secondary">${gap}</td>
                    <!-- {RIGHT_COLUMNS} -->
                    <!-- {RACE_FLAGS} -->
                    <!-- {ADD_PENALTIES} -->
                </tr>`;

        if (rightColumn == "energy")
        {
            right_column_content = `<td class="vehicle-right-column colored-row-secondary" ${fuel_ve.style}>${fuel_ve.text}</td>`;
        }
        else if (rightColumn == "best")
        {
            right_column_content = `<td class="vehicle-right-column colored-row-secondary">${LaptimeToString(vehicle.best_lap)}</td>`;
        }
        else if (rightColumn == "last")
        {
            right_column_content = `<td class="vehicle-right-column colored-row-secondary">${LaptimeToString(vehicle.last_lap)}</td>`;
        }
        else if (rightColumn == "pitstops")
        {
            right_column_content = `<td class="vehicle-right-column colored-row-secondary">${vehicle.pit_stops}</td>`;
        }

        tr = tr.replace("<!-- {RIGHT_COLUMNS} -->", right_column_content);
        tr = tr.replace("<!-- {RACE_FLAGS} -->", this.getRaceFlags(vehicle));
        tr = tr.replace("<!-- {ADD_PENALTIES} -->", this.getPenalty(vehicle));
        return tr;
    }

    update()
    {
        this.clear();

        if (this.controls.vehicle_class.toLowerCase() == "multiclass")
        {
            this.showMultiClass();
        }
        else
        {
            this.showOneClass();
        }
    }

    renderOneStandingsClass(renderInfo)
    {
        let table = "";
        let table_row = 1;
        let gap_txt = "GAP";

        let isRace = renderInfo.isRace;
        let rightColumn = renderInfo.rightColumn;

        let static_entries = renderInfo.static_entries;
        let update_rate = renderInfo.update_rate * 1000;
        let dynamic_entries = renderInfo.dynamic_entries;

        let v = renderInfo.standings;
        let c = renderInfo.vehicle_class;

        let tag = GetRightColumnName(rightColumn, c);
        let bestLap = GetBestLapTime(v);

        if (this.controls.gap_mode.toLowerCase() == "ahead")
        {
            gap_txt = "INT";
        }

        let content = `<thead>
                <tr>
                    <th>
                    </th>
                    <th class="${CSSClassFromVehicleClass(c)}" colspan="4">
                        ${c}
                    </th>
                     <th class="colored-row-secondary">
                        ${gap_txt}
                     </th>
                    <th class="colored-row-secondary">${tag}</th>
                </tr>
            </thead><tbody>`;

        if(v.length < static_entries)
        {
            for (let i = 0; i < v.length; i++)
            {
                let row = this.createRow(v[i], i + 1, isRace, table_row++, bestLap, rightColumn);
                content = content.concat(row);
            }

            if (this.vehicle_control.has(c))
            {
                this.vehicle_control.delete(c)
            }

            return table.concat("<table>" + content + "</tbody></table>");
        }

        if (!this.vehicle_control.has(c))
        {
            let opt = { start: static_entries, end: Math.min(v.length, static_entries + dynamic_entries), timestamp: new Date().getTime() };
            this.vehicle_control.set(c, opt);
        }
        let opt = this.vehicle_control.get(c);

        for (let i = 0; i < static_entries; i++)
        {
            let row = this.createRow(v[i], i + 1, isRace, table_row++, bestLap, rightColumn);
            content = content.concat(row);
        }

        content = content.concat("<tr><td></td><td colspan='6' style='background-color: rgba(224, 224, 224, 0.3s); height: 1px;'></td></tr>");

        for (let i = opt.start; i < Math.min(v.length, opt.end); i++)
        {
            let row = this.createRow(v[i], i + 1, isRace, table_row++, bestLap, rightColumn);
            content = content.concat(row);
        }

        if (new Date().getTime() - opt.timestamp > update_rate)
        {
            let new_opt = { start: opt.start + 1, end: opt.end + 1, timestamp: new Date().getTime() };
            if (new_opt.end > v.length)
            {
                new_opt.end = Math.min(v.length, static_entries + dynamic_entries);
                new_opt.start = static_entries;
            }
            this.vehicle_control.set(c, new_opt);
        }

        return table.concat("<table>" + content + "</tbody></table>");
    }

    showOneClass()
    {
        let renderInfo =
        {
            rightColumn: this.controls.right_column.toLowerCase(),
            isRace: this.session.name.toLowerCase().includes("race"),

            update_rate: this.controls.update_rate,
            static_entries: this.controls.static_entries,
            dynamic_entries: this.controls.dynamic_entries,

            vehicle_class: this.controls.vehicle_class,
            standings: GetVehicleOfClass(this.standings, this.controls.vehicle_class)
        }

        let table = this.renderOneStandingsClass(renderInfo);
        $(this.element_id).append(table);
    }

    showMultiClass()
    {
        for (const [c, s] of GetByClasses(this.standings))
        {
            let renderInfo =
            {
                rightColumn: this.controls.right_column.toLowerCase(),
                isRace: this.session.name.toLowerCase().includes("race"),

                update_rate: this.controls.update_rate,
                static_entries: this.controls.static_entries,
                dynamic_entries: this.controls.dynamic_entries,

                vehicle_class: c,
                standings: s
            }

            let table = this.renderOneStandingsClass(renderInfo);
            $(this.element_id).append(table);
        }

    }
}

var tower_panel = new TowerPanel("#tower-panel");
