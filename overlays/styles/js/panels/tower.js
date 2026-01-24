class TowerPanel
{
    constructor(id)
    {
        this.element_id = id;
        this.vehicle_control = new Map();
        this.controls = { dynamic_entries: 5, static_entries: 5, update_rate: 5 };
    }

    clear()
    {
        $(this.element_id).empty();
    }

    setControls(controls)
    {
        this.controls = controls;
    }

    hasPenalty(vehicle)
    {
        let dt = vehicle.penalties.drive_through;
        let tp = vehicle.penalties.time_penalty;
        let sg = vehicle.penalties.stop_and_go;
        return dt > 0 || sg > 0 || tp > 0;
    }

    getPositionEndOf(element)
    {
        // Relative to document
        var topOffset = $(element).offset().top;
        var height = $(element).height();
        var bottomEdgeDocument = topOffset/* + height*/;

        // Relative to document (offset)
        var leftOffset = $(element).offset().left;  // Distance from document
        var width = $(element).width();
        var rightEdgeDocument = leftOffset + width;

        return { bottom: bottomEdgeDocument, right: rightEdgeDocument, height: height, width: width };
    }

    getBestLapTime(standings)
    {
        let bestLap =
        {
            lap: null,
            id : null
        };

        for (const vehicle of standings)
        {
            if (vehicle.best_lap > 0)
            {
                if (bestLap.lap === null || vehicle.best_lap < bestLap.lap)
                {
                    bestLap.lap = vehicle.best_lap;
                    bestLap.id = vehicle.slot_id;
                }
            }
        }

        return bestLap;
    }

    addRaceFlags(vehicle)
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

    addPenalty(vehicle)
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
        let gap = VehicleGetGap(vehicle, this.controls);
        let fuel_ve = GetVehicleFuelVe(vehicle);

        let selected_color = "";
        let penalty_txt = ""; let has_penalty = "";
        let row_color = tableRow % 2 === 0 ? "colored-row-2" : "colored-row-1";

        if (vehicle.slot_id === bestLap.id)
        {
            selected_color = "color-best-lap";
        }
        else if (vehicle.focus)
        {
            selected_color = "color-selected";
        }

        let right_column_content = "";
        let tr = `<tr>
                    <td class="vehicle-position ${selected_color}">${position}</td>
                    <td class="vehicle-driver ${row_color}"><span class="vehicle-driver-truncate-text">${name}</span></td>
                    <td class="vehicle-logo ${row_color}"><img height="23px" alt="" src="styles/img/brandlogo/${vehicle.manufacturer}.png" /></td>
                    <td class="vehicle-number ${row_color}">#${vehicle.vehicle_number}</td>
                    <td class="vehicle-gap ${row_color}">${gap}</td>
                    <!-- {RIGHT_COLUMNS} -->
                    <!-- {RACE_FLAGS} -->
                    <!-- {ADD_PENALTIES} -->
                </tr>`;

        if (rightColumn == "energy")
        {
            right_column_content = `<td class="vehicle-right-column ${row_color}" ${fuel_ve.style}>${fuel_ve.text}</td>`;
        }
        else if (rightColumn == "time")
        {
            right_column_content = `<td class="vehicle-right-column ${row_color}">${LaptimeToString(vehicle.best_lap)}</td>`;
        }
        else if (rightColumn == "tyres")
        {
            right_column_content = `<td class="vehicle-right-column ${row_color}">N/A</td>`;
        }

        tr = tr.replace("<!-- {RIGHT_COLUMNS} -->", right_column_content);
        tr = tr.replace("<!-- {RACE_FLAGS} -->", this.addRaceFlags(vehicle));
        tr = tr.replace("<!-- {ADD_PENALTIES} -->", this.addPenalty(vehicle));
        return tr;
    }

    update(standings, isRace)
    {
        this.clear();
        let content = "";
        let bestLap = this.getBestLapTime(v);
        let rightColumn = this.controls.rightColumn.toLowerCase();

        for (const vehicle of standings)
        {
            let row = this.createRow(vehicle, vehicle.race_position, isRace, table_row++, bestLap, rightColumn);
            content = content.concat(row);
        }

        content = "<table><tbody>" + content + "</tbody></table>";
        $(this.element_id).append(content);
    }

    updateByClass(standings, session)
    {
        this.clear(); let table = "";
        let table_row = 1;

        let tag = "N/A";
        let isRace = session.name.toLowerCase().includes("race");
        let rightColumn = this.controls.rightColumn.toLowerCase();

        let static_entries = this.controls.static_entries;
        let update_rate = this.controls.update_rate * 1000;
        let dynamic_entries = this.controls.dynamic_entries;

        for (const [c, v] of standings)
        {
            let bestLap = this.getBestLapTime(v);

            switch (rightColumn)
            {
                case "energy":
                {
                    tag = c === "GT3" || c === "Hyper" ? "NRG" : "FUEL";
                } break

                case "tyres":
                {
                    tag = "TYRE";
                } break

                case "time":
                {
                    tag = "B.TIME";
                } break;
            }

            let content = `<thead>
                <tr>
                    <th class="${CSSClassFromVehicleClass(c)}" colspan="2">
                        ${c}
                    </th>
                    <th class="${CSSClassFromVehicleClass(c)}" colspan="3">
                        <div style="display: flex; align-items: center; float: right; margin-right: 5px;">
                            <img alt="fast-lap" height="24px" style="margin-right: 2px;" src="styles/img/others/quick.png" />
                            <span>${LaptimeToString(bestLap.lap)}</span>
                        </div>
                     </th>
                    <th class='generic_class vehicle-right-column'>${tag}</th>
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

                table = table.concat("<table>" + content + "</tbody></table>");
                continue;
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

            table = table.concat("<table>" + content + "</tbody></table>");
        }

        $(this.element_id).append(table);
    }
}

var tower_panel = new TowerPanel("#tower-panel");
