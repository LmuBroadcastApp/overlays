class NotificationSystem
{
    constructor(containerId)
    {
        this.container = document.getElementById(containerId);
        this.active = {};
        this.queue = {};
    }

    show({ type = undefined, subtype = undefined, message = undefined, duration = 3000 })
    {
        if (type == undefined)
        {
            console.log('Notification type is required');
            return
        }

        if (message == undefined)
        {
            console.log('Message is required');
            return;
        }

        let id = type;
        if (subtype != undefined) id = type + "|" + subtype;

        if (!this.queue[id] || type == 'fast-lap')
        {
            this.queue[id] = [];
        }

        this.queue[id].push
        (
            { message, duration }
        );

        if (!this.active[id])
        {
            this._showNext(id);
        }
    }

    _fastLap(message)
    {
        let VEHICLE_NUMBER = message.vehicle_number;
        let TIME = LaptimeToString(message.best_lap);
        let CLASS = message.vehicle_class;
        let NAME = message.driver;

        return `<div class='fast-lap'>
            <div class='header'>Fastes lap</div>
            <div class='driver-info'>
                <div class='${CLASS} class-type padding'>
                    ${CLASS}
                </div>
                <div class='vehicle-number'>
                    #${VEHICLE_NUMBER}
                </div>
                <div class='lap-info'>
                    <span>${NAME}</span>
                    <span>${TIME}</span>
                </div>
            </div>
        </div>`;
    }

    _penalty(message)
    {
        let VEHICLE_NUMBER = message.vehicle_number;
        let CLASS = message.vehicle_class;
        let PENALTY = message.penalty;
        let NAME = message.driver;

        return `<div class='penalty'>
            <div class='header'>Penaty</div>
            <div class='penalty-info'>
                <div class='${CLASS} class-type padding'>
                    ${CLASS}
                </div>
                <div class='vehicle-number'>
                    #${VEHICLE_NUMBER}
                </div>
                <div class='penalty-data'>
                    <span>${NAME}</span>
                    <span>${PENALTY}</span>
                </div>
            </div>
        </div>`;
    }

    _message(message)
    {
        return `<div class='message'>${message}</div>`;
    }

    _showNext(id)
    {
        const splits = id.split("|");
        let subtype = splits[1];
        let type = splits[0];

        const next = this.queue[id]?.shift();
        if (!next)
        {
            this.active[id] = null;
            return;
        }

        const notification = document.createElement('div');
        notification.className = `notification`;

        if (type == 'fast-lap')
        {
            notification.innerHTML = this._fastLap(next.message);
        }
        else if (type == 'penalty')
        {
            notification.innerHTML = this._penalty(next.message);
        }
        else
        {
            notification.innerHTML = this._message(next.message);
        }

        this.container.appendChild(notification);
        this.active[id] = notification;

        requestAnimationFrame(() =>
        {
            notification.classList.add('show');
        });

        notification.timeout = setTimeout(() =>
        {
            this._remove(id);
        }, next.duration);
    }

    _remove(id)
    {
        const notification = this.active[id];
        if (!notification) return;

        clearTimeout(notification.timeout);
        notification.classList.remove('show');

        setTimeout(() =>
        {
            notification.remove();
            this.active[id] = null;
            this._showNext(id);
        }, 300);
    }
}
