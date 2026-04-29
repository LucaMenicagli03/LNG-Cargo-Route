// ====== LNG DATA ======
// Major LNG ports (lon, lat) — real-world coordinates
const PORTS = [
  // Exporters (green)
  { id:"RASLAF",  name:"Ras Laffan",   ctry:"QAT", type:"export", lon:51.59, lat:25.90, mtpa:77.0 },
  { id:"SABINE",  name:"Sabine Pass",  ctry:"USA", type:"export", lon:-93.87, lat:29.73, mtpa:30.0 },
  { id:"CORPUS",  name:"Corpus Christi",ctry:"USA",type:"export",lon:-97.40, lat:27.80, mtpa:19.5 },
  { id:"FREEPT",  name:"Freeport",     ctry:"USA", type:"export", lon:-95.35, lat:28.95, mtpa:15.0 },
  { id:"PLAQ",    name:"Plaquemines",  ctry:"USA", type:"export", lon:-89.95, lat:29.50, mtpa:10.0 },
  { id:"CALC",    name:"Calcasieu",    ctry:"USA", type:"export", lon:-93.36, lat:29.77, mtpa:11.0 },
  { id:"GORGON",  name:"Gorgon",       ctry:"AUS", type:"export", lon:115.00, lat:-20.60, mtpa:15.0 },
  { id:"WHEAT",   name:"Wheatstone",   ctry:"AUS", type:"export", lon:115.35, lat:-21.57, mtpa:8.9 },
  { id:"ICHTHY",  name:"Ichthys",      ctry:"AUS", type:"export", lon:130.80, lat:-12.45, mtpa:8.4 },
  { id:"GLNG",    name:"Gladstone",    ctry:"AUS", type:"export", lon:151.25, lat:-23.85, mtpa:7.8 },
  { id:"BONTANG", name:"Bontang",      ctry:"IDN", type:"export", lon:117.48, lat:0.12, mtpa:16.9 },
  { id:"TANGG",   name:"Tangguh",      ctry:"IDN", type:"export", lon:133.20, lat:-2.40, mtpa:7.6 },
  { id:"BINTULU", name:"Bintulu",      ctry:"MYS", type:"export", lon:113.04, lat:3.17, mtpa:32.0 },
  { id:"YAMAL",   name:"Yamal LNG",    ctry:"RUS", type:"export", lon:71.50, lat:71.25, mtpa:17.5 },
  { id:"ARCTIC",  name:"Arctic LNG 2", ctry:"RUS", type:"export", lon:73.10, lat:70.60, mtpa:6.6 },
  { id:"SAKH",    name:"Sakhalin-2",   ctry:"RUS", type:"export", lon:142.70, lat:46.60, mtpa:9.6 },
  { id:"SKIKDA",  name:"Arzew/Skikda", ctry:"DZA", type:"export", lon:-0.30, lat:35.78, mtpa:25.3 },
  { id:"IDKU",    name:"Idku",         ctry:"EGY", type:"export", lon:30.30, lat:31.45, mtpa:7.2 },
  { id:"DAMIET",  name:"Damietta",     ctry:"EGY", type:"export", lon:31.82, lat:31.47, mtpa:5.0 },
  { id:"BONNY",   name:"Bonny Island", ctry:"NGA", type:"export", lon:7.02, lat:4.45, mtpa:22.2 },
  { id:"SORN",    name:"Dongki-Senoro",ctry:"IDN", type:"export", lon:122.55, lat:-1.10, mtpa:2.0 },

  // Importers (red)
  { id:"FUTTSU",  name:"Futtsu",       ctry:"JPN", type:"import", lon:139.82, lat:35.30 },
  { id:"NEGISH",  name:"Negishi",      ctry:"JPN", type:"import", lon:139.65, lat:35.42 },
  { id:"SENBOK",  name:"Senboku",      ctry:"JPN", type:"import", lon:135.42, lat:34.51 },
  { id:"INCHEON", name:"Incheon",      ctry:"KOR", type:"import", lon:126.60, lat:37.45 },
  { id:"TANGSH",  name:"Tangshan",     ctry:"CHN", type:"import", lon:118.95, lat:39.15 },
  { id:"YANT",    name:"Yantian",      ctry:"CHN", type:"import", lon:114.27, lat:22.57 },
  { id:"ZEEB",    name:"Zeebrugge",    ctry:"BEL", type:"import", lon:3.20, lat:51.35 },
  { id:"SINES",   name:"Sines",        ctry:"PRT", type:"import", lon:-8.82, lat:37.93 },
  { id:"MILFD",   name:"Milford Haven",ctry:"GBR", type:"import", lon:-5.05, lat:51.70 },
  { id:"GATE",    name:"Gate Rotterdam",ctry:"NLD",type:"import", lon:4.05, lat:51.96 },
  { id:"BARC",    name:"Barcelona",    ctry:"ESP", type:"import", lon:2.18, lat:41.35 },
  { id:"MONT",    name:"Montoir",      ctry:"FRA", type:"import", lon:-2.15, lat:47.31 },
  { id:"PIOM",    name:"Piombino FSRU",ctry:"ITA", type:"import", lon:10.50, lat:42.93 },
  { id:"REVTHS",  name:"Revythoussa",  ctry:"GRC", type:"import", lon:23.48, lat:37.95 },
  { id:"DHAM",    name:"Dahej",        ctry:"IND", type:"import", lon:72.55, lat:21.70 },
  { id:"KOCHI",   name:"Kochi",        ctry:"IND", type:"import", lon:76.25, lat:9.98 },
  { id:"MAP",     name:"Map Ta Phut",  ctry:"THA", type:"import", lon:101.15, lat:12.68 },
  { id:"COVE",    name:"Cove Point",   ctry:"USA", type:"import", lon:-76.40, lat:38.40 },
  { id:"ALT",     name:"Altamira",     ctry:"MEX", type:"import", lon:-97.85, lat:22.48 },
  { id:"ESC",     name:"Escobar",      ctry:"ARG", type:"import", lon:-58.80, lat:-34.15 },
  { id:"PEC",     name:"Pecém",        ctry:"BRA", type:"import", lon:-38.80, lat:-3.55 },
  { id:"MINA",    name:"Mina Al-Ahmadi",ctry:"KWT",type:"import", lon:48.15, lat:29.07 },
  { id:"JEBEL",   name:"Jebel Ali",    ctry:"ARE", type:"import", lon:55.03, lat:25.00 }
];

const PORT_BY_ID = Object.fromEntries(PORTS.map(p=>[p.id,p]));

// Major routes (origin port → destination port)
const ROUTES = [
  // Qatar → Asia & Europe
  {from:"RASLAF", to:"FUTTSU", flow:"major"},
  {from:"RASLAF", to:"INCHEON", flow:"major"},
  {from:"RASLAF", to:"DHAM", flow:"major"},
  {from:"RASLAF", to:"MILFD", flow:"major"},
  {from:"RASLAF", to:"ZEEB", flow:"major"},
  {from:"RASLAF", to:"YANT", flow:"med"},
  // US Gulf → Europe
  {from:"SABINE", to:"GATE", flow:"major"},
  {from:"SABINE", to:"MONT", flow:"med"},
  {from:"CORPUS", to:"MILFD", flow:"major"},
  {from:"CORPUS", to:"BARC", flow:"med"},
  {from:"FREEPT", to:"ZEEB", flow:"med"},
  {from:"PLAQ",   to:"GATE", flow:"med"},
  // US Gulf → Asia (Panama)
  {from:"SABINE", to:"INCHEON", flow:"med"},
  {from:"CORPUS", to:"FUTTSU", flow:"med"},
  {from:"CALC",   to:"TANGSH", flow:"med"},
  // US Gulf → LatAm
  {from:"SABINE", to:"ESC", flow:"low"},
  {from:"PLAQ",   to:"PEC", flow:"low"},
  // Australia → Asia
  {from:"GORGON", to:"FUTTSU", flow:"major"},
  {from:"WHEAT",  to:"INCHEON", flow:"med"},
  {from:"ICHTHY", to:"SENBOK", flow:"major"},
  {from:"GLNG",   to:"TANGSH", flow:"med"},
  {from:"GORGON", to:"YANT", flow:"med"},
  // Malaysia/Indonesia → Asia
  {from:"BINTULU",to:"NEGISH", flow:"major"},
  {from:"BONTANG",to:"INCHEON", flow:"med"},
  {from:"TANGG",  to:"SENBOK", flow:"med"},
  // Russia
  {from:"YAMAL",  to:"ZEEB", flow:"med"},
  {from:"YAMAL",  to:"TANGSH", flow:"low"},
  {from:"SAKH",   to:"FUTTSU", flow:"major"},
  // Algeria / Egypt / Nigeria
  {from:"SKIKDA", to:"BARC", flow:"med"},
  {from:"SKIKDA", to:"PIOM", flow:"med"},
  {from:"IDKU",   to:"REVTHS", flow:"low"},
  {from:"BONNY",  to:"SINES", flow:"med"},
  {from:"BONNY",  to:"MONT", flow:"low"},
  {from:"BONNY",  to:"DHAM", flow:"med"}
];

// 30 vessels in transit / at port. Each sits on one of the above routes.
const VESSELS = [
  {imo:"9765432", name:"AL KHATTIYA",    op:"Nakilat",    cap:266, flag:"QAT", built:2009, route:0, progress:0.62, speed:17.8, status:"TRANSIT", eta:"APR 26, 08:14Z"},
  {imo:"9412881", name:"ARCTIC AURORA",  op:"Dynagas",    cap:155, flag:"LBR", built:2013, route:25, progress:0.34, speed:14.2, status:"TRANSIT", eta:"APR 29, 22:10Z"},
  {imo:"9734511", name:"MARIA ENERGY",   op:"Maran Gas",  cap:174, flag:"GRC", built:2017, route:7,  progress:0.78, speed:18.1, status:"TRANSIT", eta:"APR 24, 11:40Z"},
  {imo:"9847201", name:"FLEX CONSTELLATION",op:"Flex LNG",cap:174, flag:"BMU", built:2019, route:18, progress:0.44, speed:16.9, status:"TRANSIT", eta:"APR 28, 03:22Z"},
  {imo:"9645718", name:"GASELYS",        op:"NYK",        cap:154, flag:"FRA", built:2007, route:30, progress:0.88, speed:15.3, status:"DISCHARGE", eta:"APR 22, 02:00Z"},
  {imo:"9512330", name:"VELIKIY NOVGOROD",op:"Sovcomflot",cap:170, flag:"CYP", built:2014, route:26, progress:0.12, speed:13.6, status:"LOADING", eta:"MAY 04, 18:00Z"},
  {imo:"9868012", name:"PRISM DIVERSITY",op:"Eneos",      cap:174, flag:"JPN", built:2021, route:2,  progress:0.55, speed:17.2, status:"TRANSIT", eta:"APR 27, 10:15Z"},
  {imo:"9734598", name:"BW LESMES",      op:"BW LNG",     cap:174, flag:"SGP", built:2019, route:12, progress:0.71, speed:18.4, status:"TRANSIT", eta:"APR 25, 06:42Z"},
  {imo:"9645720", name:"WOODSIDE ROGERS",op:"Woodside",   cap:159, flag:"AUS", built:2013, route:20, progress:0.39, speed:15.8, status:"TRANSIT", eta:"APR 28, 14:08Z"},
  {imo:"9421904", name:"AL GHARRAFA",    op:"Nakilat",    cap:216, flag:"MHL", built:2008, route:3,  progress:0.24, speed:14.9, status:"TRANSIT", eta:"APR 30, 19:55Z"},
  {imo:"9823501", name:"CORAL SHALINI",  op:"Anthony Veder",cap:6.5,flag:"NLD", built:2022, route:28, progress:0.91, speed:12.7, status:"DISCHARGE", eta:"APR 21, 23:10Z"},
  {imo:"9788231", name:"YAKOV GAKKEL",   op:"Sovcomflot", cap:172, flag:"RUS", built:2020, route:27, progress:0.18, speed:11.0, status:"TRANSIT", eta:"MAY 06, 12:00Z"},
  {imo:"9899000", name:"MERIDIAN SPIRIT",op:"Teekay",     cap:165, flag:"BHS", built:2010, route:5,  progress:0.67, speed:17.6, status:"TRANSIT", eta:"APR 26, 15:30Z"},
  {imo:"9732119", name:"PACIFIC BREEZE", op:"MOL",        cap:155, flag:"PAN", built:2016, route:19, progress:0.82, speed:18.9, status:"TRANSIT", eta:"APR 23, 08:12Z"},
  {imo:"9512101", name:"SEVILLA KNUTSEN",op:"Knutsen",    cap:173, flag:"ESP", built:2010, route:9,  progress:0.48, speed:16.1, status:"TRANSIT", eta:"APR 27, 21:40Z"},
  {imo:"9650187", name:"AL SAFLIYA",     op:"Nakilat",    cap:210, flag:"MHL", built:2007, route:4,  progress:0.05, speed:10.2, status:"LOADING", eta:"MAY 08, 04:00Z"},
  {imo:"9812340", name:"GASLOG WINDSOR", op:"GasLog",     cap:180, flag:"MLT", built:2020, route:8,  progress:0.73, speed:17.4, status:"TRANSIT", eta:"APR 25, 11:20Z"},
  {imo:"9455121", name:"METHANE SPIRIT", op:"Teekay",     cap:165, flag:"BHS", built:2008, route:1,  progress:0.29, speed:15.5, status:"TRANSIT", eta:"APR 29, 17:55Z"},
  {imo:"9920111", name:"LNG MERAK",      op:"MOL",        cap:174, flag:"SGP", built:2023, route:22, progress:0.58, speed:17.0, status:"TRANSIT", eta:"APR 26, 22:45Z"},
  {imo:"9734522", name:"CASTILLO DE CALDELAS",op:"Elcano",cap:173, flag:"ESP", built:2018, route:28, progress:0.36, speed:15.7, status:"TRANSIT", eta:"APR 29, 05:25Z"},
  {imo:"9845712", name:"BW MAGNA",       op:"BW LNG",     cap:174, flag:"SGP", built:2021, route:13, progress:0.61, speed:17.8, status:"TRANSIT", eta:"APR 26, 02:00Z"},
  {imo:"9767823", name:"RUDOLF SAMOYLOVICH",op:"Sovcomflot",cap:172,flag:"RUS", built:2018, route:27, progress:0.97, speed:8.5, status:"DISCHARGE", eta:"APR 21, 19:20Z"},
  {imo:"9511234", name:"NIKOLAY ZUBOV",  op:"Sovcomflot", cap:170, flag:"CYP", built:2015, route:25, progress:0.08, speed:9.8, status:"LOADING", eta:"MAY 05, 15:00Z"},
  {imo:"9888321", name:"DIAMOND GAS SAKURA",op:"MOL",     cap:165, flag:"BHS", built:2019, route:20, progress:0.75, speed:18.2, status:"TRANSIT", eta:"APR 24, 20:05Z"},
  {imo:"9645123", name:"AL SADD",        op:"Nakilat",    cap:216, flag:"MHL", built:2008, route:6,  progress:0.51, speed:16.4, status:"TRANSIT", eta:"APR 27, 14:30Z"},
  {imo:"9723004", name:"CLEAN HORIZON",  op:"Flex LNG",   cap:174, flag:"BMU", built:2019, route:16, progress:0.15, speed:12.8, status:"LOADING", eta:"MAY 03, 09:10Z"},
  {imo:"9911220", name:"ENERGY GLORY",   op:"Maran Gas",  cap:174, flag:"GRC", built:2022, route:11, progress:0.42, speed:16.7, status:"TRANSIT", eta:"APR 28, 12:00Z"},
  {imo:"9767812", name:"PRISM COURAGE",  op:"Eneos",      cap:174, flag:"JPN", built:2017, route:17, progress:0.68, speed:17.1, status:"TRANSIT", eta:"APR 25, 23:50Z"},
  {imo:"9823450", name:"LNG ROSENROT",   op:"Awilco",     cap:174, flag:"MLT", built:2020, route:10, progress:0.88, speed:15.0, status:"DISCHARGE", eta:"APR 22, 06:30Z"},
  {imo:"9645888", name:"AL MAYEDA",      op:"Nakilat",    cap:266, flag:"QAT", built:2009, route:23, progress:0.33, speed:16.0, status:"TRANSIT", eta:"APR 29, 08:40Z"}
];

// small synthetic price history for sparkline
function genSeries(n, start, vol){
  const out=[start];
  for(let i=1;i<n;i++) out.push(Math.max(0.1, out[i-1]+(Math.random()-0.5)*vol));
  return out;
}
const SERIES = {
  TTF: genSeries(40, 38.5, 0.6),
  JKM: genSeries(40, 13.8, 0.35),
  HH:  genSeries(40, 2.15, 0.06)
};
