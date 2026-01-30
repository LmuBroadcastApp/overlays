class TrackMapPanel
{
    constructor(id)
    {
        this.element_id = id;
    }

    clear()
    {
        let canvas = document.getElementById(this.element_id);
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
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

    drawTriangle(ctx, cx, cy, sideLength, color, boderSize = 0.5, rotationDeg = 180,)
    {
        ctx.strokeStyle = "black";
        ctx.fillStyle = color;
        ctx.lineWidth = 0.5;

        const h = (Math.sqrt(3) / 2) * sideLength;
        const rot = (rotationDeg * Math.PI) / 180;

        const verts = [
            { x:               0, y: -2 * h / 3 }, // top vertex
            { x: -sideLength / 2, y:      h / 3 }, // bottom‑left
            { x:  sideLength / 2, y:      h / 3 }, // bottom‑right
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

    drawStartLine(ctx, map)
    {
        const A = map.points[  0];
        const B = map.points[100];

        const dx = B.x - A.x;
        const dy = B.y - A.y;

        const len = Math.hypot(dx, dy);

        const ux = dx / len;
        const uy = dy / len;

        const px =  uy;   // swap and change sign
        const py = -ux;

        const perpLength = 15;          // adjust as you like
        const half = perpLength / 2;    // we will go ±half from the midpoint

        const mx = map.points[0].x;
        const my = map.points[0].y;

        const P1 = { x: mx + px * half, y: my + py * half };
        const P2 = { x: mx - px * half, y: my - py * half };

        ctx.strokeStyle = 'rgb(250, 150, 150)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(P1.x, P1.y);
        ctx.lineTo(P2.x, P2.y);
        ctx.stroke();
    }

    drawVehicles(ctx, vehicles)
    {
        vehicles.sort((a, b) => (b.in_pits - a.in_pits));

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
                c = "rgb(240, 240, 240)";
                point_size += 3;
            }

            if (v.in_pits)
            {
                point_size *= 0.6;
                let rgb = c.replace(/[^\d,]/g, "").split(",");
                c = `rgb(${rgb[0] - 50}, ${rgb[1] - 50}, ${rgb[2] - 50}, 0.8)`;
            }

            ctx.beginPath();

            if (idx < vehicles.length - 1)
            {
                this.drawCircle(ctx, v.world_pos.x, v.world_pos.y, point_size, c);
            }
            else
            {
                this.drawTriangle(ctx, v.world_pos.x, v.world_pos.y, point_size * 2, c,);
            }

            if (!v.in_pits)
            {
                ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
                ctx.fillRect(rect_start_x, rect_start_y, textWidth, textHeight);

                ctx.font = "bold";
                ctx.fillStyle = "rgb(255, 255, 255)";
                ctx.fillText(v.vehicle_number, text_start_x, text_start_y);
            }
        }
    }

    update(standings, map)
    {
        let canvas = document.getElementById(this.element_id);
        let ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const dpr = window.devicePixelRatio || 1;

        if (map == null)
        {
            return;
        }

        if (canvas.width !== map.size.width * dpr || canvas.height !== map.size.height * dpr)
        {
            canvas.height = map.size.height * dpr;
            canvas.width = map.size.width * dpr;
        }

      this.drawTrackMap(ctx, map);
      //this.drawStartLine(ctx, map);

        for (const [key, value] of GetByClasses(Array.from(standings).reverse()))
        {
            this.drawVehicles(ctx, value);
        }
    }
}

var map_panel = new TrackMapPanel("track-map-panel");
