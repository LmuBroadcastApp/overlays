class TrackMapPanel
{
    constructor(id)
    {
        this.element_id = id;
    }

    clear()
    {
        let canvas = document.getElementById(this.element_id);
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    }

    drawCircle(ctx, x, y, radius, color)
    {
        ctx.strokeStyle = "black";
        ctx.fillStyle = color;
        ctx.lineWidth = 0.5;

        ctx.arc(x, y, radius, 0, 2 * Math.PI, false);

        ctx.stroke();
        ctx.fill();
    }

    drawTriangle(ctx, cx, cy, sideLength, color, boderSize = 0.5, rotationDeg = 180)
    {
        ctx.strokeStyle = "black";
        ctx.fillStyle = color;
        ctx.lineWidth = 0.5;

        const h = (Math.sqrt(3) / 2) * sideLength;
        const rot = rotationDeg * Math.PI / 180;

        const verts = [
            { x: 0,               y: -2 * h / 3 }, // top vertex
            { x: -sideLength / 2, y:      h / 3 }, // bottom‑left
            { x:  sideLength / 2, y:      h / 3 }  // bottom‑right
        ];

        verts.forEach((v, i) =>
        {
            const xr = v.x * Math.cos(rot) - v.y * Math.sin(rot);
            const yr = v.x * Math.sin(rot) + v.y * Math.cos(rot);
            const px = cx + xr;
            const py = cy + yr;
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        });

        ctx.fill();
        ctx.stroke();
    }

    drawTrackMap(ctx, map)
    {
        ctx.beginPath();
        ctx.moveTo(map.points[0].x, map.points[0].y);

        for (let i = 1; i < map.points.length; ++i)
        {
            ctx.lineTo(map.points[i].x, map.points[i].y);
        }
        ctx.closePath();

        ctx.strokeStyle = "rgba(240, 240, 240, 1)";
        ctx.lineWidth = 3;
        ctx.stroke();

        //ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        //ctx.fill();
    }

    drawVehicles(ctx, vehicles)
    {
        for (let idx in vehicles)
        {
            let v = vehicles[idx];

            let x = v.world_pos.x;
            let y = v.world_pos.y;

            let metrics = ctx.measureText(v.vehicle_number);
            let c = ColorFromVehicleClass(v.vehicle_class);

            let rect_extra = 5;
            let point_size = 7;

            let textWidth = metrics.width + rect_extra;
            let textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent + rect_extra;

            let rect_start_x = x - textWidth / 2 - rect_extra * 0.5;
            let rect_start_y = y - textHeight * 2 + rect_extra * 0.5;

            let text_start_x = x - textWidth / 2;
            let text_start_y = y - textHeight;

            if (v.focus)
            {
                c = "rgba(100, 100, 100, 1.0)";
                point_size += 3;
            }

            ctx.beginPath();

            {
                if(idx < vehicles.length - 1)
                    this.drawCircle(ctx, v.world_pos.x, v.world_pos.y, point_size, c);
                else
                    this.drawTriangle(ctx, v.world_pos.x, v.world_pos.y, point_size * 2, c);
            }
            {
                ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
                ctx.fillRect(rect_start_x, rect_start_y, textWidth, textHeight);
            }
            {
                ctx.font = "bold";
                ctx.fillStyle = "rgba(255, 255, 255, 1.0)";
                ctx.fillText(v.vehicle_number, text_start_x, text_start_y);
            }
        }
    }

    update(standings, map)
    {
        if (map == null)
        {
            return
        }

        let canvas = document.getElementById(this.element_id);
        let ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const dpr = window.devicePixelRatio || 1;

        if (canvas.width !== map.size.width * dpr || canvas.height !== map.size.height * dpr)
        {
            canvas.height = map.size.height * dpr;
            canvas.width = map.size.width * dpr;
        }

        this.drawTrackMap(ctx, map);

        for (const [key, value] of GetByClasses(Array.from(standings).reverse()))
        {
            this.drawVehicles(ctx, value);
        }

    }
}

var map_panel = new TrackMapPanel("track-map-panel");
