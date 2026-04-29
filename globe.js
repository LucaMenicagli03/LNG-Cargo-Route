// ============================================================
// GLOBE: orthographic projection, rotating 3D-looking map
// ============================================================
// Uses a compact world topology (countries-110m) loaded from unpkg.
// Falls back to a schematic continents path if offline.

const GLOBE = (() => {
  const CX = 500, CY = 300, R = 255;
  let lon0 = -40, lat0 = 18; // rotation
  let land = null;           // array of polygon rings [[lon,lat],...]
  let spinning = true;
  let spinSpeed = 0.12;      // deg per frame
  let zoom = 1;

  // --- simple sphere projection (orthographic) ---
  function proj(lon, lat){
    const λ = (lon - lon0) * Math.PI/180;
    const φ = lat * Math.PI/180;
    const φ0 = lat0 * Math.PI/180;
    const cosC = Math.sin(φ0)*Math.sin(φ) + Math.cos(φ0)*Math.cos(φ)*Math.cos(λ);
    const x = Math.cos(φ)*Math.sin(λ);
    const y = Math.cos(φ0)*Math.sin(φ) - Math.sin(φ0)*Math.cos(φ)*Math.cos(λ);
    return { x: CX + R*zoom*x, y: CY - R*zoom*y, visible: cosC >= -0.02, cosC };
  }

  // great-circle interpolation between two lon/lat
  function greatCircle(a, b, n=64){
    const φ1=a[1]*Math.PI/180, λ1=a[0]*Math.PI/180;
    const φ2=b[1]*Math.PI/180, λ2=b[0]*Math.PI/180;
    const d = 2*Math.asin(Math.sqrt(Math.sin((φ2-φ1)/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin((λ2-λ1)/2)**2));
    const pts = [];
    if (d === 0){ return [a, b]; }
    for(let i=0;i<=n;i++){
      const f = i/n;
      const A = Math.sin((1-f)*d)/Math.sin(d);
      const B = Math.sin(f*d)/Math.sin(d);
      const x = A*Math.cos(φ1)*Math.cos(λ1) + B*Math.cos(φ2)*Math.cos(λ2);
      const y = A*Math.cos(φ1)*Math.sin(λ1) + B*Math.cos(φ2)*Math.sin(λ2);
      const z = A*Math.sin(φ1) + B*Math.sin(φ2);
      const lat = Math.atan2(z, Math.sqrt(x*x+y*y))*180/Math.PI;
      const lon = Math.atan2(y,x)*180/Math.PI;
      pts.push([lon,lat]);
    }
    return pts;
  }

  // interpolate point along great circle at fraction f (0..1)
  function greatCirclePoint(a, b, f){
    const φ1=a[1]*Math.PI/180, λ1=a[0]*Math.PI/180;
    const φ2=b[1]*Math.PI/180, λ2=b[0]*Math.PI/180;
    const d = 2*Math.asin(Math.sqrt(Math.sin((φ2-φ1)/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin((λ2-λ1)/2)**2));
    if (d === 0) return a;
    const A = Math.sin((1-f)*d)/Math.sin(d);
    const B = Math.sin(f*d)/Math.sin(d);
    const x = A*Math.cos(φ1)*Math.cos(λ1) + B*Math.cos(φ2)*Math.cos(λ2);
    const y = A*Math.cos(φ1)*Math.sin(λ1) + B*Math.cos(φ2)*Math.sin(λ2);
    const z = A*Math.sin(φ1) + B*Math.sin(φ2);
    return [ Math.atan2(y,x)*180/Math.PI, Math.atan2(z, Math.sqrt(x*x+y*y))*180/Math.PI ];
  }

  // draw a path from lon/lat ring, splitting across horizon
  function ringToSegments(ring, isFront){
    const segs = [];
    let cur = [];
    for (let i=0;i<ring.length;i++){
      const p = proj(ring[i][0], ring[i][1]);
      const keep = isFront ? p.cosC >= -0.005 : p.cosC <  0.005;
      if (keep){
        cur.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
      } else if (cur.length){
        segs.push(cur); cur=[];
      }
    }
    if (cur.length) segs.push(cur);
    return segs.filter(s=>s.length>1).map(s=>"M"+s.join("L"));
  }

  // graticule
  function buildGraticule(){
    const g = document.getElementById("graticule");
    let d = "";
    for (let lon=-180; lon<=180; lon+=20){
      const ring=[]; for (let lat=-80; lat<=80; lat+=2) ring.push([lon,lat]);
      d += ringToSegments(ring, true).join(" ") + " ";
    }
    for (let lat=-80; lat<=80; lat+=20){
      const ring=[]; for (let lon=-180; lon<=180; lon+=2) ring.push([lon,lat]);
      d += ringToSegments(ring, true).join(" ") + " ";
    }
    g.innerHTML = `<path class="graticule" d="${d}"/>`;
    // equator
    const eq=[]; for (let lon=-180; lon<=180; lon+=2) eq.push([lon,0]);
    const eqD = ringToSegments(eq, true).join(" ");
    g.innerHTML += `<path class="equator" d="${eqD}"/>`;
  }

  function buildLand(){
    if (!land) return;
    const front = document.getElementById("land-front");
    const back  = document.getElementById("land-back");
    let df="", db="";
    for (const ring of land){
      df += ringToSegments(ring, true).join(" ") + " ";
      db += ringToSegments(ring, false).join(" ") + " ";
    }
    front.innerHTML = `<path class="land" d="${df}"/>`;
    back.innerHTML  = `<path class="land-back" d="${db}"/>`;
  }

  function buildPorts(){
    const g = document.getElementById("ports");
    let html = "";
    PORTS.forEach(p => {
      const pr = proj(p.lon, p.lat);
      if (!pr.visible) return;
      const cls = p.type === "export" ? "" : "imp";
      const r = p.mtpa ? Math.min(3.6, 1.6 + Math.sqrt(p.mtpa)/3) : 1.6;
      html += `<g transform="translate(${pr.x.toFixed(1)},${pr.y.toFixed(1)})">
        <circle class="port-dot ${cls}" r="${r.toFixed(1)}"/>
        ${p.mtpa && p.mtpa>=15 ? `<circle r="${(r+3).toFixed(1)}" fill="none" stroke="${p.type==='export'?'#00ff6a':'#ff2e2e'}" stroke-width=".5" opacity=".4"/>` : ''}
        <text class="port-label" x="${(r+3).toFixed(1)}" y="2">${p.name.toUpperCase()}</text>
      </g>`;
    });
    g.innerHTML = html;
  }

  function buildRoutes(){
    const g = document.getElementById("routes");
    let html = "";
    ROUTES.forEach((r,i) => {
      const a = PORT_BY_ID[r.from], b = PORT_BY_ID[r.to];
      if(!a||!b) return;
      const pts = greatCircle([a.lon,a.lat],[b.lon,b.lat], 72);
      const segs = ringToSegments(pts, true);
      const w = r.flow==="major" ? 1.4 : r.flow==="med" ? 1.0 : 0.6;
      const color = a.type==="export" ? "#00ff6a" : "#ff2e2e";
      const opacity = r.flow==="major" ? .55 : r.flow==="med" ? .38 : .25;
      segs.forEach(d => {
        html += `<path class="route-path" d="${d}" stroke="${color}" stroke-width="${w}" opacity="${opacity}"/>`;
      });
      // destination arrow color coded red (import)
      const segsRed = segs.slice(-1);
      segsRed.forEach(d => {
        html += `<path class="route-path" d="${d}" stroke="#ff2e2e" stroke-width="${w}" opacity="0"/>`;
      });
    });
    g.innerHTML = html;
  }

  function vesselPosition(v){
    const r = ROUTES[v.route];
    if (!r) return null;
    const a = PORT_BY_ID[r.from], b = PORT_BY_ID[r.to];
    if (!a || !b) return null;
    const [lon,lat] = greatCirclePoint([a.lon,a.lat],[b.lon,b.lat], v.progress);
    return {lon,lat,from:a,to:b};
  }

  function buildVessels(selectedImo){
    const g = document.getElementById("vessels");
    const labels = document.getElementById("vlabels");
    let svg = "";
    let html = "";
    const wrap = document.getElementById("globe-wrap");
    const vb = document.getElementById("globe");
    const rect = vb.getBoundingClientRect();
    const scaleX = rect.width / 1000, scaleY = rect.height / 600;

    VESSELS.forEach(v => {
      const pos = vesselPosition(v);
      if (!pos) return;
      const pr = proj(pos.lon, pos.lat);
      if (!pr.visible) return;
      const color = v.status==="DISCHARGE" ? "#ff2e2e"
                  : v.status==="LOADING"   ? "#ffb800"
                  : "#00ff6a";
      const active = v.imo === selectedImo;
      svg += `<g class="ves-dot ${active?'active':''}" data-imo="${v.imo}" transform="translate(${pr.x.toFixed(1)},${pr.y.toFixed(1)})">
        <circle class="ves-ring" r="5" stroke="${color}"/>
        <rect class="ves-core" x="-2.2" y="-2.2" width="4.4" height="4.4" fill="${color}" stroke="#000" stroke-width=".5" transform="rotate(45)"/>
      </g>`;

      if (active){
        const cls = v.status==="DISCHARGE"?"red":v.status==="LOADING"?"amber":"";
        const lx = pr.x * scaleX;
        const ly = pr.y * scaleY;
        html += `<div class="vlabel ${cls}" style="left:${lx}px;top:${ly}px">
          ${v.name}
          <div class="tick">${v.imo} · ${v.speed.toFixed(1)}KN · ${Math.round(v.progress*100)}%</div>
        </div>`;
      }
    });
    g.innerHTML = svg;
    labels.innerHTML = html;
  }

  function redraw(selectedImo){
    buildGraticule();
    buildLand();
    buildRoutes();
    buildPorts();
    buildVessels(selectedImo);
    const latEl=document.getElementById("hud-lat"), lonEl=document.getElementById("hud-lon");
    if(latEl) latEl.textContent = lat0.toFixed(1)+"°";
    if(lonEl) lonEl.textContent = lon0.toFixed(1)+"°";
    const stLat=document.getElementById("st-lat"), stLon=document.getElementById("st-lon");
    if(stLat) stLat.textContent = (lat0>=0?"+":"")+lat0.toFixed(2)+"°";
    if(stLon) stLon.textContent = (lon0>=0?"+":"")+lon0.toFixed(2)+"°";
    const c=document.getElementById("hud-count"); if(c) c.textContent = VESSELS.length;
    const rr=document.getElementById("hud-routes"); if(rr) rr.textContent = ROUTES.length;
  }

  // ---- land data: compact inline continents (GeoJSON-ish rings) ----
  // Very low-poly schematic so no external fetch is required.
  async function loadLand(){
    // try real topojson first
    try{
      const res = await fetch("https://unpkg.com/world-atlas@2.0.2/countries-110m.json", {cache:"force-cache"});
      if (res.ok){
        const topo = await res.json();
        const obj = topo.objects.countries;
        const arcs = topo.arcs;
        const tf = topo.transform;
        const decode = arc => {
          let x=0,y=0; const out=[];
          for (const d of arc){
            x += d[0]; y += d[1];
            out.push([ x*tf.scale[0]+tf.translate[0], y*tf.scale[1]+tf.translate[1] ]);
          }
          return out;
        };
        const decodedArcs = arcs.map(decode);
        const rings = [];
        for (const geom of obj.geometries){
          const feat = geom.arcs;
          if (geom.type === "Polygon"){
            for (const r of feat){
              rings.push(buildRing(r, decodedArcs));
            }
          } else if (geom.type === "MultiPolygon"){
            for (const poly of feat){
              for (const r of poly){
                rings.push(buildRing(r, decodedArcs));
              }
            }
          }
        }
        land = rings;
        return;
      }
    } catch(e){ /* fallback below */ }
    // fallback schematic continents (very rough)
    land = FALLBACK_LAND;
  }

  function buildRing(ringArcs, decodedArcs){
    const pts = [];
    for (const a of ringArcs){
      const idx = a<0 ? ~a : a;
      let arc = decodedArcs[idx];
      if (a<0) arc = arc.slice().reverse();
      for (const pt of arc){
        if (pts.length===0 || pts[pts.length-1][0]!==pt[0] || pts[pts.length-1][1]!==pt[1])
          pts.push(pt);
      }
    }
    return pts;
  }

  // Interaction: drag to rotate
  let dragging=false, sx=0, sy=0, slon=0, slat=0;
  function attachDrag(svg){
    svg.addEventListener("mousedown", e=>{
      dragging=true; sx=e.clientX; sy=e.clientY; slon=lon0; slat=lat0;
      spinning=false;
      document.getElementById("btn-spin").classList.remove("on");
    });
    window.addEventListener("mousemove", e=>{
      if(!dragging) return;
      const rect = svg.getBoundingClientRect();
      const dx = (e.clientX - sx) * (360/rect.width);
      const dy = (e.clientY - sy) * (180/rect.height);
      lon0 = slon + dx;
      lat0 = Math.max(-85, Math.min(85, slat - dy));
    });
    window.addEventListener("mouseup", ()=>{ dragging=false; });
    svg.addEventListener("wheel", e=>{
      e.preventDefault();
      zoom = Math.max(0.7, Math.min(2.6, zoom * (e.deltaY<0?1.08:0.92)));
    },{passive:false});
  }

  function setSpin(on){ spinning = on; }
  function setZoom(z){ zoom = Math.max(0.7, Math.min(2.6, z)); }
  function getZoom(){ return zoom; }
  function reset(){ lon0=-40; lat0=18; zoom=1; }
  function tick(){ if (spinning){ lon0 = (lon0 + spinSpeed) % 360; if (lon0>180) lon0-=360; } }

  function getRot(){ return {lon:lon0, lat:lat0}; }
  function setRot(lon, lat){ lon0 = lon; lat0 = Math.max(-85, Math.min(85, lat)); }

  return { loadLand, redraw, attachDrag, setSpin, setZoom, getZoom, reset, tick,
           getRot, setRot,
           vesselPosition, proj, greatCircle };
})();

// Very schematic fallback continents (only used if topojson fetch fails)
const FALLBACK_LAND = [
  // N America
  [[-168,65],[-140,70],[-100,70],[-80,60],[-60,48],[-70,40],[-80,25],[-95,18],[-115,32],[-125,40],[-135,58],[-150,60],[-168,65]],
  // S America
  [[-78,12],[-60,5],[-50,0],[-40,-10],[-38,-25],[-55,-35],[-70,-55],[-75,-45],[-80,-20],[-80,-5],[-78,12]],
  // Europe
  [[-10,36],[0,45],[15,45],[30,45],[40,55],[30,60],[10,60],[-5,55],[-10,50],[-10,36]],
  // Africa
  [[-17,14],[10,35],[30,30],[45,15],[40,0],[40,-15],[30,-30],[18,-35],[10,-10],[-10,5],[-17,14]],
  // Asia
  [[35,45],[60,60],[90,70],[140,70],[160,60],[140,45],[120,25],[100,10],[80,10],[60,25],[50,30],[35,45]],
  // Australia
  [[115,-12],[135,-12],[150,-18],[150,-35],[130,-35],[115,-35],[115,-22],[115,-12]],
  // Antarctica rim
  [[-180,-75],[-90,-80],[0,-78],[90,-80],[180,-75]]
];
