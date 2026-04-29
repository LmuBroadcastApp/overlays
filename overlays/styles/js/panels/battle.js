class BattlePanel
{
    constructor(selector, stateManager)
    {
        this.element = document.querySelector(selector);
        this.stateManager = stateManager;

        if (!this.element)
        {
            console.error(`BattlePanel: Element ${selector} not found`);
            return;
        }

        this.standings = null;
        this.session = null;

        this.stateManager.subscribe(this.handleStateChange.bind(this));
    }

    handleStateChange(key, value)
    {
        if (key === 'session')
        {
            this.session = value.trackName !== "" ? value : null;
        }
        else if (key === 'standings')
        {
            this.standings = value;
        }
    }

    update()
    {
        if (this.standings == null || this.session == null)
        {
            this.element.style.display = "none";
            return;
        }

        let battles = this.findBattles(this.standings);

        if (battles.length === 0)
        {
            this.element.style.display = "none";
            return;
        }

        this.element.style.display = "block";
        this.renderBattles(battles);
    }

    findBattles(standings)
    {
        let sorted = [...standings].sort((a, b) => b.spline - a.spline);
        let idx = StandingsGetFocusIdx(sorted);
        let battles = [];

        if (Math.abs(sorted[idx].relative_delta_to_next) < 2)
        {
            if (idx > 0)
            {
                battles.push(sorted[idx - 1]);
                battles.push(sorted[idx - 0]);
            }
        }

        if (Math.abs(sorted[idx].relative_delta_to_prev) < 2)
        {
            if (idx < (sorted.length - 1))
            {
                if (battles.length == 0)
                {
                    battles.push(sorted[idx + 0]);
                }
                battles.push(sorted[idx + 1]);
            }
        }

        return battles;
    }

    renderBattles(battles)
    {
        let html = ''; let idx = -1;
        const len = battles.length;

        battles.forEach((vehicle, index) =>
        {
            if (vehicle == undefined)
            {
                return;
            }

            if (vehicle.focus)
            {
                idx = index;
            }
        });

        html += '<div class="battle-header">BATTLE</div>';
        html += '<table class="battle-table">';
        html += '<tbody>';

        battles.forEach((vehicle, index) =>
        {
            let name = vehicle.driver;
            let manufacturer = vehicle.manufacturer.trim().length === 0 ? 'Default' : vehicle.manufacturer;

            let gapClass = '';
            let gapText = '-';

            if (index > 0)
            {
                let gap = Math.abs(vehicle.delta_to_next);
                if (gap < 0.5) gapClass = 'very-close';
                else if (gap < 2.0) gapClass = 'close';
            }

            if (len == 3)
            {
                if (index == 0)
                {
                    gapText = battles[idx].relative_delta_to_next.toFixed(3);
                }
                else if (index == 2)
                {
                    gapText = '+' + battles[idx].relative_delta_to_prev.toFixed(3);
                }
            }
            else
            {
                if (idx == 0 && index != idx)
                {
                    gapText = '+' + battles[idx].relative_delta_to_prev.toFixed(3);
                }
                else if (idx == 1 && index != idx)
                {
                    gapText = battles[idx].relative_delta_to_next.toFixed(3);
                }
            }

            html += `<tr>
                <td class="battle-position standings-primary-color">${vehicle.race_position}</td>
                <td class="battle-driver standings-primary-color"><span class="battle-driver-text">${name}</span></td>
                <td class="battle-logo standings-primary-color"><img height="20px" alt="" src="styles/img/brandlogo/${manufacturer}.png" /></td>
                <td class="battle-number standings-primary-color">#${vehicle.vehicle_number}</td>
                <td class="battle-gap standings-secondary-color ${gapClass}">${gapText}</td>
                <td class="battle-class ${CSSClassFromVehicleClass(vehicle.vehicle_class)}">${vehicle.vehicle_class}</td>
            </tr>`;
        });

        html += '</tbody></table>';
        this.element.innerHTML = html;
    }
}

function CSSClassFromVehicleClass(className)
{
    return className.replace(/[^a-zA-Z0-9]/g, '_');
}
