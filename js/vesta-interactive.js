/* ==================================================================
   VESTA PROJECT PAGE — interactive widgets
   Powers: #orbital-mechanics canvas, #site-selection MCDA sliders +
   site map canvas, #cost-analysis donut chart.
   No external chart library required — pure Canvas 2D + CSS.
   ================================================================== */
document.addEventListener("DOMContentLoaded", function () {

  /* ---------------------------------------------------------
     1) ORBITAL MECHANICS — simple heliocentric transfer sketch
     Earth's orbit, Vesta's orbit, and a spacecraft dot travelling
     along a Hohmann-like arc between them. Illustrative, not a
     precise ephemeris propagator.
     --------------------------------------------------------- */
  const orbitCanvas = document.getElementById("orbit-canvas");
  if (orbitCanvas) {
    const ctx = orbitCanvas.getContext("2d");
    const W = orbitCanvas.width, H = orbitCanvas.height;
    const cx = W / 2, cy = H / 2;
    const rEarth = 90, rVesta = 190;
    let t = 0;

    function drawOrbit(r, color) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    function drawBody(x, y, radius, color, glow) {
      if (glow) {
        const g = ctx.createRadialGradient(x, y, 0, x, y, radius * 4);
        g.addColorStop(0, color + "55");
        g.addColorStop(1, color + "00");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, radius * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }

    function frame() {
      ctx.clearRect(0, 0, W, H);

      // sun
      drawBody(cx, cy, 9, "#F5C16C", true);

      // orbit rings
      drawOrbit(rEarth, "rgba(85,221,255,.35)");
      drawOrbit(rVesta, "rgba(255,255,255,.18)");

      // Earth position (faster angular speed)
      const earthAngle = t * 1.4;
      const ex = cx + rEarth * Math.cos(earthAngle);
      const ey = cy + rEarth * Math.sin(earthAngle);
      drawBody(ex, ey, 5, "#55ddff", false);

      // Vesta position (slower)
      const vestaAngle = t * 0.55 + 2.1;
      const vx = cx + rVesta * Math.cos(vestaAngle);
      const vy = cy + rVesta * Math.sin(vestaAngle);
      drawBody(vx, vy, 4, "#e8e8e8", false);

      // transfer arc + spacecraft dot, looping 0..1
      const travel = (t * 0.12) % 1.6;
      const progress = Math.min(travel, 1);
      // control point for a simple outward bezier arc between current Earth and Vesta radii
      const startAngle = earthAngle;
      const endAngle = vestaAngle;
      const midR = (rEarth + rVesta) / 2 + 20;
      const midAngle = startAngle + (endAngle - startAngle) * 0.5;
      const p0 = { x: cx + rEarth * Math.cos(startAngle), y: cy + rEarth * Math.sin(startAngle) };
      const p2 = { x: cx + rVesta * Math.cos(endAngle), y: cy + rVesta * Math.sin(endAngle) };
      const p1 = { x: cx + midR * Math.cos(midAngle), y: cy + midR * Math.sin(midAngle) };

      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.quadraticCurveTo(p1.x, p1.y, p2.x, p2.y);
      ctx.strokeStyle = "rgba(245,193,108,.55)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (travel <= 1) {
        const u = 1 - progress;
        const sx = u * u * p0.x + 2 * u * progress * p1.x + progress * progress * p2.x;
        const sy = u * u * p0.y + 2 * u * progress * p1.y + progress * progress * p2.y;
        drawBody(sx, sy, 3.5, "#F5C16C", true);
      }

      t += 0.006;
      requestAnimationFrame(frame);
    }
    frame();
  }

  /* ---------------------------------------------------------
     2) MCDA SITE-SELECTION TOOL — live score from sliders
     Site Score = 0.4*(PBD + Olivine - Weathering)
                + 0.2*(1 - slope/30)
                + 0.3*(1 - ((I-I0)/I0)^2)
                + 0.1*(1 - dv/dvMax)
     --------------------------------------------------------- */
  const pbdEl = document.getElementById("mcda-pbd");
  const slopeEl = document.getElementById("mcda-slope");
  const thermalEl = document.getElementById("mcda-thermal");
  const dvEl = document.getElementById("mcda-dv");
  const scoreOut = document.getElementById("mcda-score");

  function updateScore() {
    if (!pbdEl) return;
    const OLIVINE = 0.6, WEATHERING = 0.2, I0 = 250, DV_MAX = 500;

    const pbd = parseFloat(pbdEl.value);
    const slope = parseFloat(slopeEl.value);
    const I = parseFloat(thermalEl.value);
    const dv = parseFloat(dvEl.value);

    document.getElementById("mcda-pbd-out").textContent = pbd.toFixed(2);
    document.getElementById("mcda-slope-out").textContent = slope + "\u00B0";
    document.getElementById("mcda-thermal-out").textContent = I + " J\u00B7m\u207B\u00B2\u00B7K\u207B\u00B9\u00B7s\u207B\u00B9\u141F\u00B2";
    document.getElementById("mcda-dv-out").textContent = dv + " m/s";

    const spectral = pbd + OLIVINE - WEATHERING;
    const terrain = 1 - slope / 30;
    const thermal = 1 - Math.pow((I - I0) / I0, 2);
    const eng = 1 - dv / DV_MAX;

    const score = 0.4 * spectral + 0.2 * terrain + 0.3 * thermal + 0.1 * eng;
    scoreOut.textContent = score.toFixed(3);
  }
  [pbdEl, slopeEl, thermalEl, dvEl].forEach((el) => {
    if (el) el.addEventListener("input", updateScore);
  });
  updateScore();

  /* ---------------------------------------------------------
     Site selection map — procedural Vesta disc with 3 markers
     --------------------------------------------------------- */
  const mapCanvas = document.getElementById("site-map-canvas");
  if (mapCanvas) {
    const ctx = mapCanvas.getContext("2d");
    const W = mapCanvas.width, H = mapCanvas.height;
    const cx = W / 2, cy = H / 2, R = Math.min(W, H) / 2 - 10;

    // base sphere shading
    const g = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.35, R * 0.1, cx, cy, R);
    g.addColorStop(0, "#8a8f9a");
    g.addColorStop(1, "#2c303a");
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();

    // faint crater-ish texture
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.clip();
    for (let i = 0; i < 40; i++) {
      const rx = cx + (Math.random() - 0.5) * R * 1.8;
      const ry = cy + (Math.random() - 0.5) * R * 1.8;
      const rr = Math.random() * 8 + 2;
      ctx.beginPath();
      ctx.arc(rx, ry, rr, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      ctx.fill();
    }
    // latitude lines
    ctx.strokeStyle = "rgba(255,255,255,.12)";
    for (let lat = -60; lat <= 60; lat += 30) {
      const ry = R * Math.sin((lat * Math.PI) / 180);
      const rx = R * Math.cos((lat * Math.PI) / 180);
      ctx.beginPath();
      ctx.ellipse(cx, cy + ry, rx, rx * 0.28, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    function marker(xFrac, yFrac, label, color) {
      const x = cx + xFrac * R;
      const y = cy + yFrac * R;
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.font = "bold 12px Inter, sans-serif";
      ctx.fillStyle = "#fff";
      ctx.fillText(label, x + 10, y + 4);
    }
    marker(-0.05, -0.62, "NP-03", "#55ddff");
    marker(0.5, 0.02, "EQ-02", "#F5C16C");
    marker(-0.25, 0.6, "SP-01", "#8affc1");
  }

  /* ---------------------------------------------------------
     3) COST DONUT — conic-gradient built from breakdown %
     --------------------------------------------------------- */
  const donut = document.getElementById("cost-donut");
  if (donut) {
    const segments = [
      { pct: 28, color: "#55ddff" },
      { pct: 24, color: "#72ddff" },
      { pct: 18, color: "#F5C16C" },
      { pct: 15, color: "#8affc1" },
      { pct: 15, color: "#c9a0ff" },
    ];
    let acc = 0;
    const stops = segments.map((s) => {
      const start = acc;
      acc += s.pct;
      return `${s.color} ${start}% ${acc}%`;
    });
    donut.style.background = `conic-gradient(${stops.join(",")})`;
  }
});
