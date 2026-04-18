class CircularQueue
{
    constructor(capacity)
    {
        this.buffer = new Array(capacity);
        this.capacity = capacity;

        this.head = 0;
        this.tail = -1;
        this.count = 0;
    }

    enqueue(value)
    {
        this.buffer[this.tail] = value;
        this.tail = (this.tail + 1) % this.capacity;

        if (this.count === this.capacity)
        {
            this.head = (this.head + 1) % this.capacity;
        }
        else
        {
            this.count++;
        }
    }

    getLast()
    {
        return this.buffer[this.tail - 1];
    }

    toArray()
    {
        const result = [];

        for (let i = 0; i < this.count; i++)
        {
            const index = (this.head + i) % this.capacity;
            result.push(this.buffer[index]);
        }

        return result;
    }
}

class TelemetryChart
{
    constructor(selector, stateManager)
    {
        this.element = document.querySelector(selector);
        this.stateManager = stateManager;

        if (!this.element)
        {
            console.error(`TelemetryChart: Element ${selector} not found`);
            return;
        }

        this.stateManager.subscribe(this.handleStateChange.bind(this));
        this.lineWidth = 2; this.queueCapacity = 128;

        this.canvas = document.getElementById(selector.slice(1));
        this.ctx = this.canvas.getContext('2d');

        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        this.steering = new CircularQueue(this.queueCapacity);
        this.throttle = new CircularQueue(this.queueCapacity);
        this.brake = new CircularQueue(this.queueCapacity);
    }

    handleStateChange(key, value)
    {
        let driver = this.StandingsGetFocus(value);

        if (driver == null)
        {
            return;
        }

        this.steering.enqueue((driver.telemetry.steering + 1) * 0.5);
        this.throttle.enqueue(driver.telemetry.throttle);
        this.brake.enqueue(driver.telemetry.brake);
    }

    StandingsGetFocus(standings)
    {
        for (const vehicle of standings)
        {
            if (vehicle.focus)
            {
                return vehicle;
            }
        }

        return null;
    }

    drawSteering(x, y, radius, value)
    {
        value = value * 2 - 1;

        // outer circle
        this.ctx.beginPath();
        this.ctx.strokeStyle = "#888";
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.stroke();

        // center point
        const angle = value * Math.PI * 1.5;  // limit to ±90°

        const indicatorX = x + Math.sin(angle) * radius * 0.8;
        const indicatorY = y - Math.cos(angle) * radius * 0.8;

        // indicator dot
        this.ctx.beginPath();
        this.ctx.fillStyle = "cyan";
        this.ctx.arc(indicatorX, indicatorY, 5, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawBar(x, y, w, h, value, color)
    {
        // background
        this.ctx.fillStyle = "#222";
        this.ctx.fillRect(x, y, w, h);

        // filled part (bottom → up)
        const filledHeight = h * value;

        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y + (h - filledHeight), w, filledHeight);

        // border
        this.ctx.strokeStyle = "#555";
        this.ctx.strokeRect(x, y, w, h);
    }

    drawLine(data, key, color, width, height)
    {
        const stepX = width / (this.queueCapacity - 1);

        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = this.lineWidth;

        data.forEach((value, i) =>
        {
            let y = height - (value * height);
            const x = i * stepX;

            if (y < this.lineWidth)
            {
                y = this.lineWidth;
            }

            if (y > height - this.lineWidth)
            {
                y = height - this.lineWidth;
            }

            if (i === 0)
            {
                this.ctx.moveTo(x, y);
            }
            else
            {
                this.ctx.lineTo(x, y);
            }
        });

        this.ctx.stroke();
    }

    update()
    {
        const cssHeight = getComputedStyle(document.documentElement).getPropertyValue('--telemetry-input-chart-height');
        const cssWidth = getComputedStyle(document.documentElement).getPropertyValue('--telemetry-input-chart-width');

        this.canvas.height = parseInt(cssHeight);
        this.canvas.width = parseInt(cssWidth);

        let { width, height } = this.canvas;
        this.ctx.clearRect(0, 0, width, height);

        {
            let y = height * 0.5 - this.lineWidth;
            let x = width - y;
            let r = y;

            this.drawSteering(x, y, r, this.steering.getLast());
            width -= (height + this.lineWidth);
        }

        {
            const barWidth = height * 0.1;

            this.drawBar(width - barWidth, 0, barWidth, height, this.brake.getLast(), "red");
            this.drawBar(width - barWidth * 2 - barWidth * 0.5, 0, barWidth, height, this.throttle.getLast(), "green");

            width -= barWidth * 4;
        }

        {
            this.drawLine(this.throttle.toArray(), 'throttle', 'green', width, height);
            this.drawLine(this.steering.toArray(), 'steering', 'gray', width, height);
            this.drawLine(this.brake.toArray(), 'brake', 'red', width, height);
        }
    }
}
