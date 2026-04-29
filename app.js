// ============================================================
// APP: list, ticker, detail panel, interactions
// ============================================================
(function(){
  let selectedImo = VESSELS[0].imo;
  let filter = "ALL";

  // ---- Ticker ----
  function buildTicker(){
    const items = [];
    PORTS.filter(p=>p.type==="export" && p.mtpa>=8).forEach(p=>{
      const chg = (Math.random()*4-2).toFixed(2);
      const cls = chg>=0 ? "up" : "down";
      const sign = chg>=0 ? "▲" : "▼";
      items.push(`<span class="tick"><b>${p.id}</b>${p.mtpa.toFixed(1)}MT <span class="${cls}">${sign}${Math.abs(chg)}%</span></span>`);
    });
    VESSELS.slice(0,20).forEach(v=>{
      const chg = (Math.random()*2-1).toFixed(2);
      const cls = v.status==="DISCHARGE"?"down":v.status==="LOADING"?"up":(chg>=0?"up":"down");
      const sign = chg>=0?"▲":"▼";
      items.push(`<span class="tick"><b>${v.name}</b>${v.speed.toFixed(1)}KN <span class="${cls}">${sign}${Math.abs(chg)}%</span></span>`);
    });
    // stitch twice for continuous scroll
    const html = items.join('<span class="sep">|</span>') + '<span class="sep">|</span>' + items.join('<span class="sep">|</span>');
    document.getElementById("ticker-track").innerHTML = html;
  }

  // ---- Cargo list ----
  function buildList(){
    const list = document.getElementById("cargo-list");
    let filtered = VESSELS;
    if (filter !== "ALL") filtered = VESSELS.filter(v=>v.status===filter);
    document.getElementById("count-total").textContent = filtered.length.toString().padStart(2,"0");
    document.getElementById("hud-tracked").textContent = VESSELS.length + " UNITS";
    let html = "";
    filtered.forEach(v => {
      const r = ROUTES[v.route];
      const from = PORT_BY_ID[r.from], to = PORT_BY_ID[r.to];
      const cls = v.status==="DISCHARGE" ? "discharge" : v.status==="LOADING" ? "port" : "";
      const active = v.imo===selectedImo ? "active" : "";
      html += `<div class="row ${cls} ${active}" data-imo="${v.imo}">
        <div class="stat-dot"></div>
        <div>
          <div class="name">${v.name}</div>
          <div class="sub">${from.id} <span class="arrow">→</span> ${to.id} · ${Math.round(v.progress*100)}%</div>
        </div>
        <div class="cap">${typeof v.cap==='number' && v.cap<100 ? v.cap+'K' : v.cap+'K'}<small>${v.status}</small></div>
      </div>`;
    });
    list.innerHTML = html;
    list.querySelectorAll(".row").forEach(row=>{
      row.addEventListener("click", ()=>{
        selectedImo = row.dataset.imo;
        // rotate globe to vessel
        const v = VESSELS.find(x=>x.imo===selectedImo);
        const pos = GLOBE.vesselPosition(v);
        if (pos){ smoothRotate(pos.lon, pos.lat); }
        buildList();
        buildDetail();
      });
    });
  }

  function smoothRotate(toLon, toLat){
    GLOBE.setSpin(false);
    document.getElementById("btn-spin").classList.remove("on");
    const start = performance.now();
    const dur = 700;
    const s = GLOBE.getRot();
    // shortest-path wrap
    let dLon = toLon - s.lon;
    while (dLon > 180) dLon -= 360;
    while (dLon < -180) dLon += 360;
    const dLat = toLat - s.lat;
    function step(t){
      const k = Math.min(1,(t-start)/dur);
      const e = k<.5 ? 2*k*k : -1+(4-2*k)*k;
      GLOBE.setRot(s.lon + dLon*e, s.lat + dLat*e);
      if (k<1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ---- Detail panel ----
  function sparkline(series, color){
    const w=290, h=60, pad=4;
    const min=Math.min(...series), max=Math.max(...series);
    const sx = i => pad + i*(w-pad*2)/(series.length-1);
    const sy = v => h-pad - ((v-min)/(max-min||1))*(h-pad*2);
    const d = series.map((v,i)=> (i===0?"M":"L")+sx(i).toFixed(1)+","+sy(v).toFixed(1)).join("");
    const last = series[series.length-1];
    return `<svg class="mini-chart" viewBox="0 0 ${w} ${h}" width="100%" preserveAspectRatio="none">
      <path d="${d} L${w-pad},${h-pad} L${pad},${h-pad} Z" fill="${color}" opacity=".12"/>
      <path d="${d}" stroke="${color}" stroke-width="1.2" fill="none"/>
      <circle cx="${sx(series.length-1)}" cy="${sy(last)}" r="2.5" fill="${color}"/>
    </svg>`;
  }

  function buildDetail(){
    const v = VESSELS.find(x=>x.imo===selectedImo);
    const r = ROUTES[v.route];
    const from = PORT_BY_ID[r.from], to = PORT_BY_ID[r.to];
    const statusCls = v.status==="DISCHARGE" ? "discharge" : v.status==="LOADING" ? "port" : "";
    const color = v.status==="DISCHARGE" ? "#ff2e2e" : v.status==="LOADING" ? "#ffb800" : "#00ff6a";
    const pct = Math.round(v.progress*100);
    const distTotal = Math.round(4200 + Math.random()*2200);
    const distDone  = Math.round(distTotal * v.progress);
    const fuel = Math.round(92 - v.progress*35);
    document.getElementById("detail-imo").innerHTML = `IMO <b>${v.imo}</b>`;

    document.getElementById("detail").innerHTML = `
      <div class="d-hero">
        <div class="d-name">${v.name}</div>
        <div class="d-imo">IMO ${v.imo} · ${v.flag} · BUILT ${v.built}</div>
        <div class="d-status ${statusCls}"><span class="dt"></span>${v.status}</div>
      </div>

      <div class="d-section">
        <h4>Vessel</h4>
        <dl class="kv">
          <dt>OPERATOR</dt><dd>${v.op}</dd>
          <dt>CAPACITY</dt><dd class="g">${v.cap}K m³</dd>
          <dt>SPEED</dt><dd>${v.speed.toFixed(1)} kn</dd>
          <dt>HEADING</dt><dd>${Math.round(Math.random()*360).toString().padStart(3,'0')}°</dd>
          <dt>DRAFT</dt><dd>11.4 m</dd>
        </dl>
      </div>

      <div class="d-section">
        <h4>Voyage</h4>
        <div class="route-block">
          <div class="route-row load">
            <div class="bullet"></div>
            <div class="lbl">${from.name.toUpperCase()}<small>${from.ctry} · LOADING PORT</small></div>
            <div class="t">${from.lat.toFixed(2)}°, ${from.lon.toFixed(2)}°</div>
          </div>
          <div class="route-line"></div>
          <div class="route-row now">
            <div class="bullet"></div>
            <div class="lbl" style="color:${color}">IN TRANSIT · ${pct}%<small>${distDone.toLocaleString()} / ${distTotal.toLocaleString()} nm</small></div>
            <div class="t">ETA<br/>${v.eta}</div>
          </div>
          <div class="route-line"></div>
          <div class="route-row disc">
            <div class="bullet"></div>
            <div class="lbl">${to.name.toUpperCase()}<small>${to.ctry} · DISCHARGE PORT</small></div>
            <div class="t">${to.lat.toFixed(2)}°, ${to.lon.toFixed(2)}°</div>
          </div>
        </div>
      </div>

      <div class="d-section">
        <h4>Cargo</h4>
        <div class="bars">
          <div class="bar"><span class="l">VOLUME</span><div class="b"><span style="width:${98}%"></span></div><span class="v">${v.cap}K m³</span></div>
          <div class="bar"><span class="l">LNG</span><div class="b"><span style="width:96%"></span></div><span class="v">${Math.round(v.cap*0.42)}KT</span></div>
          <div class="bar"><span class="l">BOIL-OFF</span><div class="b"><span style="width:${12+Math.round(v.progress*8)}%;background:#ffb800"></span></div><span class="v" style="color:#ffb800">${(0.08+v.progress*0.03).toFixed(2)}%</span></div>
          <div class="bar r"><span class="l">FUEL</span><div class="b"><span style="width:${fuel}%"></span></div><span class="v">${fuel}%</span></div>
        </div>
      </div>

      <div class="d-section">
        <h4>MKT Spread — JKM / TTF</h4>
        <dl class="kv">
          <dt>CARGO VAL</dt><dd class="g">$${(v.cap*0.85).toFixed(1)}M</dd>
          <dt>NETBACK</dt><dd class="${Math.random()>0.4?'g':'r'}">${(Math.random()*4-1).toFixed(2)} $/MMBtu</dd>
          <dt>DAY RATE</dt><dd>$${(60+Math.random()*45).toFixed(0)}K</dd>
        </dl>
        ${sparkline(SERIES.JKM, color)}
      </div>

      <div class="d-section">
        <h4>Events</h4>
        <div class="route-block">
          <div class="route-row"><div class="bullet" style="background:#3b4a3a"></div><div class="lbl" style="color:var(--dim)">AIS PING<small>${Math.floor(Math.random()*60)}s ago · nominal</small></div><div class="t"></div></div>
          <div class="route-row"><div class="bullet" style="background:#3b4a3a"></div><div class="lbl" style="color:var(--dim)">COURSE CHANGE<small>+2.4° ${Math.floor(1+Math.random()*6)}h ago</small></div><div class="t"></div></div>
          <div class="route-row"><div class="bullet" style="background:#3b4a3a"></div><div class="lbl" style="color:var(--dim)">WEATHER<small>Swell 2.1m · wind 14kn</small></div><div class="t"></div></div>
        </div>
      </div>
    `;
  }

  // ---- Clock ----
  function updateClock(){
    const d = new Date();
    const fmt = n => n.toString().padStart(2,"0");
    const mon = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"][d.getUTCMonth()];
    document.getElementById("clock").textContent = `${fmt(d.getUTCDate())} ${mon} ${d.getUTCFullYear()%100} · ${fmt(d.getUTCHours())}:${fmt(d.getUTCMinutes())}:${fmt(d.getUTCSeconds())} UTC`;
  }

  // ---- Controls ----
  function wireControls(){
    document.querySelectorAll(".fbtn").forEach(b=>{
      b.addEventListener("click", ()=>{
        document.querySelectorAll(".fbtn").forEach(x=>x.classList.remove("active"));
        b.classList.add("active");
        filter = b.dataset.filter;
        buildList();
      });
    });
    document.getElementById("btn-spin").addEventListener("click", e=>{
      const on = !e.currentTarget.classList.contains("on");
      e.currentTarget.classList.toggle("on", on);
      GLOBE.setSpin(on);
    });
    document.getElementById("btn-zoom-in").addEventListener("click", ()=> GLOBE.setZoom(GLOBE.getZoom()*1.2));
    document.getElementById("btn-zoom-out").addEventListener("click", ()=> GLOBE.setZoom(GLOBE.getZoom()/1.2));
    document.getElementById("btn-reset").addEventListener("click", ()=>{ GLOBE.reset(); });

    // clicking a vessel dot on the globe
    document.getElementById("globe").addEventListener("click", e=>{
      const g = e.target.closest(".ves-dot");
      if(!g) return;
      selectedImo = g.dataset.imo;
      buildList(); buildDetail();
    });
  }

  // ---- Main loop ----
  let lastFrame = performance.now(), fpsAcc = 0, fpsN = 0;
  function loop(now){
    const dt = now - lastFrame; lastFrame = now;
    fpsAcc += dt; fpsN++;
    if (fpsN >= 30){
      document.getElementById("st-fps").textContent = Math.round(1000/(fpsAcc/fpsN));
      fpsAcc=0; fpsN=0;
    }
    GLOBE.tick();
    GLOBE.redraw(selectedImo);
    requestAnimationFrame(loop);
  }

  // ---- Boot ----
  (async function(){
    buildTicker();
    buildList();
    buildDetail();
    wireControls();
    setInterval(updateClock, 1000); updateClock();
    const svg = document.getElementById("globe");
    GLOBE.attachDrag(svg);

    // Try to load world coastlines. Fall back gracefully.
    await GLOBE.loadLand();

    requestAnimationFrame(loop);
  })();
})();
