let punches = []; // {pin, dt, dateKey}
let pinMap = {};  // pin -> {name, guard, workGroup: 'guard'|'general'|'unclassified'}
let byPinDate = {}; // pin -> dateKey -> [Date,...]  (built once from all punches)
let importedNames = {}; // canonical PIN -> name, read from optional user.dat

const STORAGE_KEY = 'toptech_pin_map_v1';

document.getElementById('appVersion').textContent = window.APP_VERSION || 'development';
document.getElementById('fileInput').addEventListener('change', handleFile);
document.getElementById('userFileInput').addEventListener('change', handleUserFile);
document.getElementById('analyzeBtn').addEventListener('click', runAnalysis);

function loadStoredMap(){
  try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }catch(e){ return {}; }
}
function saveStoredMap(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pinMap));
}

function handleFile(e){
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = function(ev){
    parseLog(ev.target.result);
  };
  reader.readAsText(file, 'ISO-8859-1');
}

function canonicalPin(pin){
  const value = String(pin || '').trim();
  return /^\d+$/.test(value) ? String(Number(value)) : value;
}

function isDefaultName(pin, name){
  const value = String(name || '').trim();
  return !value || value === `PIN ${pin}` || value === `PIN #${pin}`;
}

function handleUserFile(e){
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = function(ev){
    try{
      const parsed = parseUserDat(ev.target.result);
      importedNames = parsed.names;
      document.getElementById('userFileStatus').textContent =
        `Imported ${parsed.count} staff name${parsed.count === 1 ? '' : 's'} from ${file.name}.`;
      mergeImportedNames();
    }catch(error){
      importedNames = {};
      document.getElementById('userFileStatus').textContent = `Could not import ${file.name}: ${error.message} You can still name staff manually.`;
    }
  };
  reader.readAsArrayBuffer(file);
}

function parseUserDat(buffer){
  const RECORD_SIZE = 72;
  if(!(buffer instanceof ArrayBuffer) || buffer.byteLength === 0 || buffer.byteLength % RECORD_SIZE !== 0){
    throw new Error('This does not look like a ZKTeco user.dat file with 72-byte records.');
  }

  const view = new DataView(buffer);
  const decoder = new TextDecoder('windows-1252');
  const names = {};
  let count = 0;

  for(let offset = 0; offset < view.byteLength; offset += RECORD_SIZE){
    // Read uid with DataView to validate the fixed record layout; it is not used for matching.
    view.getUint16(offset, true);
    const nameBytes = new Uint8Array(buffer, offset + 11, 24);
    const pinBytes = new Uint8Array(buffer, offset + 35, 37);
    const name = decoder.decode(nameBytes).split('\0')[0].trim();
    const pinMatches = decoder.decode(pinBytes).match(/\d+/g);
    if(!pinMatches) continue;
    // Some device exports contain a one-digit marker before the actual PIN.
    // The final numeric sequence is the badge/PIN used by attlog.dat.
    const pin = canonicalPin(pinMatches[pinMatches.length - 1]);
    if(!pin || !name || names[pin]) continue;
    names[pin] = name;
    count++;
  }
  if(!count) throw new Error('No PIN-to-name records were found in this file.');
  return {names, count};
}

function importedNameFor(pin){
  return importedNames[canonicalPin(pin)] || '';
}

function mergeImportedNames(){
  let changed = false;
  Object.keys(pinMap).forEach(pin=>{
    const importedName = importedNameFor(pin);
    if(importedName && isDefaultName(pin, pinMap[pin].name)){
      pinMap[pin].name = importedName;
      changed = true;
    }
  });
  if(changed) saveStoredMap();
  if(Object.keys(pinMap).length) renderPinList();
}

function parseTimestamp(s){
  const parts = s.trim().split(/\s+/);
  if(parts.length < 2) return null;
  const [y,m,d] = parts[0].split('-').map(Number);
  const [hh,mm,ss] = parts[1].split(':').map(Number);
  if(!y || !m || !d) return null;
  return new Date(y, m-1, d, hh||0, mm||0, ss||0);
}

function parseLog(text){
  punches = [];
  const lines = text.split(/\r?\n/);
  const seenPins = new Set();
  for(const line of lines){
    if(!line.trim()) continue;
    const parts = line.split(/\t+/);
    if(parts.length < 2) continue;
    const pin = parts[0].trim();
    const dt = parseTimestamp(parts[1]);
    if(!dt) continue;
    const dateKey = dt.getFullYear()+'-'+String(dt.getMonth()+1).padStart(2,'0')+'-'+String(dt.getDate()).padStart(2,'0');
    punches.push({pin, dt, dateKey});
    seenPins.add(pin);
  }
  punches.sort((a,b)=>a.dt-b.dt);

  const stored = loadStoredMap();
  pinMap = {};
  [...seenPins].sort((a,b)=>Number(a)-Number(b)).forEach(pin=>{
    const saved = stored[pin] || {name:'PIN '+pin, guard:false, workGroup:'unclassified'};
    const importedName = importedNameFor(pin);
    // Preserve workGroup classification, falling back to deriving from guard flag if needed
    const workGroup = saved.workGroup || (saved.guard ? 'guard' : 'unclassified');
    pinMap[pin] = {
      name: importedName && isDefaultName(pin, saved.name) ? importedName : saved.name,
      guard: !!saved.guard,
      workGroup: workGroup
    };
  });
  saveStoredMap();

  document.getElementById('fileStatus').textContent =
    `Loaded ${punches.length} punch records for ${seenPins.size} PINs.`;

  byPinDate = {};
  punches.forEach(p=>{
    byPinDate[p.pin] = byPinDate[p.pin] || {};
    byPinDate[p.pin][p.dateKey] = byPinDate[p.pin][p.dateKey] || [];
    byPinDate[p.pin][p.dateKey].push(p.dt);
  });

  renderPinList();
  document.getElementById('pinSection').style.display = 'block';
  document.getElementById('settingsSection').style.display = 'block';
}

function renderPinList(){
  const container = document.getElementById('pinList');
  container.innerHTML = '';
  Object.keys(pinMap).sort((a,b)=>Number(a)-Number(b)).forEach(pin=>{
    const row = document.createElement('div');
    row.className = 'pin-row';
    const workGroup = pinMap[pin].workGroup;
    row.innerHTML = `
      <span class="pin">#${pin}</span>
      <input type="text" data-pin="${pin}" class="nameInput" value="${pinMap[pin].name}">
      <div class="work-group-selector">
        <label class="work-group"><input type="radio" data-pin="${pin}" name="group_${pin}" value="guard" class="groupRadio" ${workGroup==='guard'?'checked':''}> Security Guard</label>
        <label class="work-group"><input type="radio" data-pin="${pin}" name="group_${pin}" value="general" class="groupRadio" ${workGroup==='general'?'checked':''}> General Worker</label>
        <label class="work-group"><input type="radio" data-pin="${pin}" name="group_${pin}" value="unclassified" class="groupRadio" ${workGroup==='unclassified'?'checked':''}> Unclassified</label>
      </div>
    `;
    container.appendChild(row);
  });
  container.querySelectorAll('.nameInput').forEach(inp=>{
    inp.addEventListener('input', ()=>{ pinMap[inp.dataset.pin].name = inp.value; saveStoredMap(); });
  });
  container.querySelectorAll('.groupRadio').forEach(radio=>{
    radio.addEventListener('change', ()=>{
      const pin = radio.dataset.pin;
      const group = radio.value;
      pinMap[pin].workGroup = group;
      // Maintain guard flag for backward compatibility
      pinMap[pin].guard = (group === 'guard');
      saveStoredMap();
    });
  });
}

// ---------- Reusable summarizers (work on ANY byPinDate subset - full set or a filtered date range) ----------
function summarizeAll(byPinDateSubset){
  const allRows = [];
  const detailRows = [];
  Object.keys(byPinDateSubset).forEach(pin=>{
    const name = pinMap[pin].name;
    const dates = Object.keys(byPinDateSubset[pin]).sort();
    if(!dates.length) return;
    let daysPresent=0, totalPunches=0, sumInSec=0, sumOutSec=0;
    dates.forEach(dateKey=>{
      const times = byPinDateSubset[pin][dateKey].slice().sort((a,b)=>a-b);
      daysPresent++; totalPunches += times.length;
      const first = times[0], last = times[times.length-1];
      sumInSec += first.getHours()*3600+first.getMinutes()*60+first.getSeconds();
      sumOutSec += last.getHours()*3600+last.getMinutes()*60+last.getSeconds();
      detailRows.push({
        name, pin, date: dateKey,
        first: fmtTime(first),
        last: times.length>1 ? fmtTime(last) : '—',
        punches: times.length,
        singlePunch: times.length === 1
      });
    });
    allRows.push({
      name, pin, daysPresent, totalPunches,
      avgIn: fmtSec(sumInSec/daysPresent),
      avgOut: fmtSec(sumOutSec/daysPresent)
    });
  });
  allRows.sort((a,b)=>Number(a.pin)-Number(b.pin));
  detailRows.sort((a,b)=> Number(a.pin)-Number(b.pin) || a.date.localeCompare(b.date));
  return {allRows, detailRows};
}

function summarizeGuards(byPinDateSubset, mandateMin, offdutyMin){
  const guardPins = Object.keys(pinMap).filter(p=>pinMap[p].workGroup === 'guard');
  const summary = [];
  const daily = {};

  guardPins.forEach(pin=>{
    const name = pinMap[pin].name;
    const dates = Object.keys(byPinDateSubset[pin] || {}).sort();
    let okCount=0, violCount=0, totalChecks=0;
    daily[pin] = [];
    dates.forEach(dateKey=>{
      const times = byPinDateSubset[pin][dateKey].slice().sort((a,b)=>a-b);
      totalChecks += times.length;
      const gaps = [];
      for(let i=1;i<times.length;i++) gaps.push((times[i]-times[i-1])/60000);
      let exclIdx = -1;
      if(gaps.length>=3){
        exclIdx = gaps.indexOf(Math.max(...gaps));
        if(gaps[exclIdx] <= offdutyMin) exclIdx = -1;
      }
      const flags = gaps.map((g,i)=>{
        if(i===exclIdx && g>offdutyMin) return 'offduty';
        if(g>mandateMin) return 'violation';
        return 'ok';
      });
      const violationsToday = flags.filter(f=>f==='violation').length;
      okCount += flags.filter(f=>f==='ok').length;
      violCount += flags.filter(f=>f==='violation').length;
      daily[pin].push({
        date: dateKey,
        times: times.map(fmtTime),
        flags, violationsToday
      });
    });
    const denom = okCount+violCount;
    summary.push({
      name, pin,
      daysOnDuty: dates.length,
      totalChecks,
      okCount, violCount,
      compliance: denom ? Math.round(1000*okCount/denom)/10 : 0
    });
  });
  summary.sort((a,b)=>a.name.localeCompare(b.name));
  return {summary, daily};
}

function getSinglePunchRecords(detailRows){
  return detailRows.filter(r => r.singlePunch);
}

function getUnclassifiedEmployees(byPinDateSubset){
  return Object.keys(byPinDateSubset).filter(pin => pinMap[pin].workGroup === 'unclassified');
}

function runAnalysis(){
  const mandateMin = Number(document.getElementById('mandateMin').value) || 60;
  const offdutyMin = Number(document.getElementById('offdutyMin').value) || 240;
  document.getElementById('mandateEcho').textContent = mandateMin;

  const {allRows, detailRows} = summarizeAll(byPinDate);
  renderAllSummary(allRows);
  renderDetail(detailRows);
  renderWeeklyTimetable(byPinDate);

  const {summary: guardSummary, daily: guardDaily} = summarizeGuards(byPinDate, mandateMin, offdutyMin);
  renderGuardSummary(guardSummary, mandateMin);
  renderGuardDaily(guardSummary, guardDaily);

  document.getElementById('resultsSection').style.display = 'block';
  document.getElementById('reportBuilderCard').style.display = 'block';
  populatePeriodOptions();
  document.getElementById('resultsSection').scrollIntoView({behavior:'smooth'});
}

function fmtTime(d){ return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); }
function fmtSec(totalSec){
  totalSec = Math.round(totalSec);
  const h = Math.floor(totalSec/3600), m = Math.floor((totalSec%3600)/60);
  return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');
}
function fmtDateLabel(dateKey){
  const [y,m,d] = dateKey.split('-').map(Number);
  return new Date(y,m-1,d).toLocaleDateString('en-GB',{day:'2-digit',month:'short'});
}

function renderAllSummary(rows){
  const t = document.getElementById('allSummaryTable');
  let html = '<tr><th>Name</th><th>PIN</th><th>Days Present</th><th>Total Punches</th><th>Avg Clock-In</th><th>Avg Clock-Out</th></tr>';
  rows.forEach(r=>{
    html += `<tr><td style="text-align:left;font-weight:bold">${r.name}</td><td>${r.pin}</td><td>${r.daysPresent}</td><td>${r.totalPunches}</td><td>${r.avgIn}</td><td>${r.avgOut}</td></tr>`;
  });
  t.innerHTML = html;
}

function renderDetail(rows){
  const t = document.getElementById('detailTable');
  let html = '<tr><th>Name</th><th>PIN</th><th>Date</th><th>Clock-In</th><th>Clock-Out</th><th>Punches</th><th>Note</th></tr>';
  rows.forEach(r=>{
    const note = r.singlePunch ? '⚠ Single punch — verify direction' : '';
    html += `<tr><td style="text-align:left;font-weight:bold">${r.name}</td><td>${r.pin}</td><td>${fmtDateLabel(r.date)}</td><td>${r.first}</td><td>${r.last}</td><td>${r.punches}</td><td>${note}</td></tr>`;
  });
  t.innerHTML = html;
}

function renderGuardSummary(rows, mandateMin){
  const t = document.getElementById('guardSummaryTable');
  let html = `<tr><th>Guard</th><th>Days on Duty</th><th>Total Checks</th><th>Checks ≤${mandateMin}min Apart</th><th>Checks >${mandateMin}min Apart</th><th>Hourly Compliance</th></tr>`;
  rows.forEach(r=>{
    const cls = r.compliance<25?'compliance-low':(r.compliance<60?'compliance-mid':'compliance-high');
    html += `<tr><td style="text-align:left;font-weight:bold">${r.name}</td><td>${r.daysOnDuty}</td><td>${r.totalChecks}</td><td>${r.okCount}</td><td>${r.violCount}</td><td class="${cls}">${r.compliance}%</td></tr>`;
  });
  if(!rows.length) html += '<tr><td colspan="6">No staff marked as Security Guard.</td></tr>';
  t.innerHTML = html;
}

function renderGuardDaily(summaryRows, guardDaily){
  const container = document.getElementById('guardDailyLogs');
  container.innerHTML = '';
  summaryRows.forEach(g=>{
    const days = guardDaily[g.pin];
    if(!days.length){
      container.innerHTML += `<h3>${g.name}</h3><p style="color:#888">No attendance records this period.</p>`;
      return;
    }
    const maxChecks = Math.max(...days.map(d=>d.times.length));
    let html = `<h3>${g.name}</h3><div class="table-scroll"><table><tr><th>Date</th>`;
    for(let i=1;i<=maxChecks;i++) html += `<th>Check ${i}</th>`;
    html += `<th>Missed (>mandate)</th></tr>`;
    days.forEach(d=>{
      html += `<tr><td style="font-weight:bold">${fmtDateLabel(d.date)}</td>`;
      for(let i=0;i<maxChecks;i++){
        if(i>=d.times.length){ html+='<td></td>'; continue; }
        let cls='';
        if(i>0){
          const flag = d.flags[i-1];
          if(flag==='violation') cls='violation';
          else if(flag==='ok') cls='ok';
        }
        html += `<td class="${cls}">${d.times[i]}</td>`;
      }
      html += `<td class="${d.violationsToday>0?'violation':'ok'}">${d.violationsToday}</td></tr>`;
    });
    html += '</table></div>';
    container.innerHTML += html;
  });
}

function getMonday(d){
  const day = d.getDay(); // 0=Sun
  const diff = (day===0? -6 : 1-day);
  const nd = new Date(d); nd.setDate(d.getDate()+diff);
  return nd;
}

function renderWeeklyTimetable(byPinDate){
  const container = document.getElementById('weeklyTimetable');
  container.innerHTML = '';
  const allDates = punches.map(p=>p.dt);
  if(!allDates.length) return;
  const minD = new Date(Math.min(...allDates));
  const maxD = new Date(Math.max(...allDates));
  let weekStart = getMonday(minD);
  const lastWeekStart = getMonday(maxD);

  const pins = Object.keys(pinMap).sort((a,b)=>Number(a)-Number(b));

  while(weekStart <= lastWeekStart){
    const days = [];
    for(let i=0;i<6;i++){ // Mon..Sat
      const d = new Date(weekStart); d.setDate(weekStart.getDate()+i);
      days.push(d);
    }
    const weekEnd = days[5];
    const label = `${weekStart.toLocaleDateString('en-GB',{day:'numeric',month:'long'})} – ${weekEnd.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}`;
    let html = `<div class="week-title">${label}</div><div class="table-scroll"><table><tr><th rowspan="2">Name</th>`;
    days.forEach(d=> html += `<th colspan="2">${d.toLocaleDateString('en-GB',{weekday:'long'})}</th>`);
    html += '</tr><tr>';
    days.forEach(()=> html += '<th>Clock In</th><th>Clock Out</th>');
    html += '</tr>';
    pins.forEach(pin=>{
      html += `<tr><td style="text-align:left;font-weight:bold">${pinMap[pin].name}</td>`;
      days.forEach(d=>{
        const dateKey = d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
        const times = (byPinDate[pin] && byPinDate[pin][dateKey]) ? byPinDate[pin][dateKey].sort((a,b)=>a-b) : null;
        if(times){
          const first = fmtTime(times[0]);
          const last = times.length>1 ? fmtTime(times[times.length-1]) : '—';
          html += `<td>${first}</td><td>${last}</td>`;
        } else {
          html += '<td></td><td></td>';
        }
      });
      html += '</tr>';
    });
    html += '</table></div>';
    container.innerHTML += html;
    weekStart = new Date(weekStart); weekStart.setDate(weekStart.getDate()+7);
  }
}

function dateKeyOf(d){ return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }

// ================= Report Builder =================

document.getElementById('reportPeriodType').addEventListener('change', populatePeriodOptions);
document.getElementById('generateReportBtn').addEventListener('click', generateReport);

function computeAvailableWeeks(){
  const allDates = punches.map(p=>p.dt);
  if(!allDates.length) return [];
  const minD = new Date(Math.min(...allDates));
  const maxD = new Date(Math.max(...allDates));
  let weekStart = getMonday(minD);
  const lastWeekStart = getMonday(maxD);
  const weeks = [];
  while(weekStart <= lastWeekStart){
    const days = [];
    for(let i=0;i<6;i++){ const d = new Date(weekStart); d.setDate(weekStart.getDate()+i); days.push(d); }
    const label = `${weekStart.toLocaleDateString('en-GB',{day:'numeric',month:'long'})} – ${days[5].toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}`;
    weeks.push({key: dateKeyOf(weekStart), label, days});
    weekStart = new Date(weekStart); weekStart.setDate(weekStart.getDate()+7);
  }
  return weeks;
}

function computeAvailableMonths(){
  const set = new Set();
  punches.forEach(p=> set.add(p.dt.getFullYear()+'-'+String(p.dt.getMonth()+1).padStart(2,'0')));
  return [...set].sort().map(key=>{
    const [y,m] = key.split('-').map(Number);
    return {key, label: new Date(y,m-1,1).toLocaleDateString('en-GB',{month:'long', year:'numeric'})};
  });
}

function populatePeriodOptions(){
  const type = document.getElementById('reportPeriodType').value;
  const sel = document.getElementById('reportPeriodSelect');
  sel.innerHTML = '';
  const items = type==='weekly' ? computeAvailableWeeks() : computeAvailableMonths();
  items.forEach(it=>{
    const opt = document.createElement('option');
    opt.value = it.key; opt.textContent = it.label;
    sel.appendChild(opt);
  });
  // default to the most recent period
  if(sel.options.length) sel.selectedIndex = sel.options.length - 1;
}

function filterByPinDateRange(startKey, endKey, pins){
  const filtered = {};
  pins.forEach(pin=>{
    if(byPinDate[pin]){
      Object.keys(byPinDate[pin]).forEach(dateKey=>{
        if(dateKey >= startKey && dateKey <= endKey){
          filtered[pin] = filtered[pin] || {};
          filtered[pin][dateKey] = byPinDate[pin][dateKey];
        }
      });
    }
  });
  return filtered;
}

function getFilteredPinsByReportType(reportType){
  const allPins = Object.keys(pinMap);
  if(reportType === 'security'){
    return allPins.filter(p => pinMap[p].workGroup === 'guard');
  } else if(reportType === 'general'){
    return allPins.filter(p => pinMap[p].workGroup === 'general');
  } else {
    return allPins; // all-staff: include all including unclassified
  }
}

function guardTableHTML(guardSummary, mandateMin){
  let html = `<table class="rpt-table"><thead><tr><th>Guard</th><th>Days on Duty</th><th>Total Checks</th><th>Checks ≤${mandateMin}min Apart</th><th>Checks &gt;${mandateMin}min Apart</th><th>Hourly Compliance</th></tr></thead><tbody>`;
  guardSummary.forEach(r=>{
    const cls = r.compliance<25?'compliance-low':(r.compliance<60?'compliance-mid':'compliance-high');
    html += `<tr><td class="rpt-left rpt-bold">${r.name}</td><td>${r.daysOnDuty}</td><td>${r.totalChecks}</td><td>${r.okCount}</td><td>${r.violCount}</td><td class="${cls}">${r.compliance}%</td></tr>`;
  });
  if(!guardSummary.length) html += '<tr><td colspan="6">No security guards marked, or no guard punches fall within this period.</td></tr>';
  html += '</tbody></table>';
  return html;
}

function guardDailyHTML(guardSummary, guardDaily){
  let html = '';
  guardSummary.forEach(g=>{
    const days = guardDaily[g.pin];
    if(!days.length) return;
    const maxChecks = Math.max(...days.map(d=>d.times.length));
    html += `<h3>${g.name}</h3><table class="rpt-table"><thead><tr><th>Date</th>`;
    for(let i=1;i<=maxChecks;i++) html += `<th>Check ${i}</th>`;
    html += `<th>Missed</th></tr></thead><tbody>`;
    days.forEach(d=>{
      html += `<tr><td class="rpt-bold">${fmtDateLabel(d.date)}</td>`;
      for(let i=0;i<maxChecks;i++){
        if(i>=d.times.length){ html+='<td></td>'; continue; }
        let cls='';
        if(i>0){
          const flag = d.flags[i-1];
          if(flag==='violation') cls='violation';
          else if(flag==='ok') cls='ok';
        }
        html += `<td class="${cls}">${d.times[i]}</td>`;
      }
      html += `<td class="${d.violationsToday>0?'violation':'ok'}">${d.violationsToday}</td></tr>`;
    });
    html += '</tbody></table>';
  });
  return html;
}

function allSummaryHTML(allRows){
  let html = '<table class="rpt-table"><thead><tr><th>Name</th><th>PIN</th><th>Days Present</th><th>Total Punches</th><th>Avg Clock-In</th><th>Avg Clock-Out</th></tr></thead><tbody>';
  allRows.forEach(r=>{
    html += `<tr><td class="rpt-left rpt-bold">${r.name}</td><td>${r.pin}</td><td>${r.daysPresent}</td><td>${r.totalPunches}</td><td>${r.avgIn}</td><td>${r.avgOut}</td></tr>`;
  });
  html += '</tbody></table>';
  return html;
}

function weekTableHTML(week, byPinDateFiltered, pins){
  let html = `<div class="rpt-week-title">${week.label}</div><table class="rpt-table"><thead><tr><th rowspan="2">Name</th>`;
  week.days.forEach(d=> html += `<th colspan="2">${d.toLocaleDateString('en-GB',{weekday:'long'})}</th>`);
  html += '</tr><tr>';
  week.days.forEach(()=> html += '<th>Clock In</th><th>Clock Out</th>');
  html += '</tr></thead><tbody>';
  pins.forEach(pin=>{
    html += `<tr><td class="rpt-left rpt-bold">${pinMap[pin].name}</td>`;
    week.days.forEach(d=>{
      const dateKey = dateKeyOf(d);
      const times = (byPinDateFiltered[pin] && byPinDateFiltered[pin][dateKey]) ? byPinDateFiltered[pin][dateKey].slice().sort((a,b)=>a-b) : null;
      if(times){
        const first = fmtTime(times[0]);
        const last = times.length>1 ? fmtTime(times[times.length-1]) : '—';
        html += `<td>${first}</td><td>${last}</td>`;
      } else {
        html += '<td></td><td></td>';
      }
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  return html;
}

const REPORT_STYLE = `
  *{box-sizing:border-box;}
  body{font-family:Arial,Helvetica,sans-serif;color:#222;background:#e8e9ec;margin:0;padding:20px;}
  .report-page{max-width:850px;margin:0 auto;background:#fff;padding:36px 40px;box-shadow:0 1px 6px rgba(0,0,0,.15);}
  .rpt-header{border-bottom:2px solid #085395;padding-bottom:6px;margin-bottom:10px;color:#085395;font-weight:bold;font-size:13px;}
  .rpt-title{color:#085395;font-size:28px;margin:0 0 4px;}
  .rpt-subtitle{color:#555;font-size:13px;margin:0 0 20px;}
  .rpt-section{color:#085395;border-bottom:2px solid #085395;padding-bottom:6px;font-size:17px;margin:28px 0 10px;}
  .rpt-page ul{margin:0 0 10px;padding-left:20px;font-size:13px;}
  .rpt-page li{margin-bottom:4px;}
  .rpt-page p{font-size:13px;margin:6px 0;}
  .rpt-italic{font-style:italic;color:#555;}
  table.rpt-table{border-collapse:collapse;width:100%;font-size:11.5px;margin:6px 0 4px;}
  table.rpt-table th, table.rpt-table td{border:1px solid #ddd;padding:5px 7px;text-align:center;}
  table.rpt-table th{background:#085395;color:#fff;font-size:11px;}
  table.rpt-table tr:nth-child(even) td{background:#f2f2f2;}
  .rpt-left{text-align:left !important;}
  .rpt-bold{font-weight:bold;}
  .rpt-page h3{color:#085395;font-size:14px;margin:16px 0 6px;}
  .rpt-week-title{font-weight:bold;color:#085395;margin:14px 0 4px;font-size:13px;}
  .rpt-note{background:#FFF9E6;border-left:3px solid #FF9800;padding:8px 12px;margin:8px 0;font-size:12px;color:#333;}
  td.ok{background:#D4EDDA !important;color:#1E7B34;font-weight:bold;}
  td.violation{background:#F8D7DA !important;color:#A4262C;font-weight:bold;}
  td.compliance-low{background:#F8D7DA;color:#A4262C;font-weight:bold;}
  td.compliance-mid{background:#FFF3CD;color:#946C00;font-weight:bold;}
  td.compliance-high{background:#D4EDDA;color:#1E7B34;font-weight:bold;}
  .rpt-footer{text-align:center;color:#888;font-size:11px;margin-top:30px;border-top:1px solid #ddd;padding-top:10px;}
  @media print{
    body{background:#fff;padding:0;}
    .report-page{box-shadow:none;max-width:none;padding:0;}
  }
`;

function buildReportHTML(opts){
  const {reportType, typeLabel, label, startKey, endKey, allRows, detailRows, guardSummary, guardDaily, weeksForTimetable, mandateMin, filteredPins} = opts;
  const totalPunches = detailRows.reduce((a,d)=>a+d.punches,0);
  const staffPresent = allRows.length;
  const generatedOn = new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
  
  // Find single punch records and unclassified employees
  const singlePunchRecords = getSinglePunchRecords(detailRows);
  const unclassifiedPins = getUnclassifiedEmployees(opts.filteredByPinDate);

  let html = `<div class="report-page rpt-page">
    <div class="rpt-header">ZKTeco Report Builder</div>
    <h1 class="rpt-title">${typeLabel}</h1>
    <p class="rpt-subtitle">Biometric Device Export &nbsp;•&nbsp; Period: ${label}</p>

    <h2 class="rpt-section">Overview</h2>
    <ul>
      <li>Report Type: ${typeLabel}</li>
      <li>Period covered: ${label}</li>
      <li>Total punch records: ${totalPunches}</li>
      <li>Staff with activity this period: ${staffPresent}</li>
    </ul>`;

  if(reportType === 'security'){
    html += `
    <h2 class="rpt-section">Security Guard — Hourly Check Compliance</h2>
    <p class="rpt-italic">Mandate: a check-in at least every ${mandateMin} minutes while on duty.</p>
    ${guardTableHTML(guardSummary, mandateMin)}

    <h2 class="rpt-section">Security Guard — Daily Check Log</h2>
    <p>Green = within the required interval. Red = over the interval (missed check). Unshaded = start of a new duty period.</p>
    ${guardDailyHTML(guardSummary, guardDaily)}`;
  }

  html += `
    <h2 class="rpt-section">Staff Attendance Summary</h2>
    ${allSummaryHTML(allRows)}

    <h2 class="rpt-section">Clock In / Clock Out Timetable</h2>
    ${weeksForTimetable.map(w=>weekTableHTML(w, opts.filteredByPinDate, filteredPins)).join('')}`;

  // Add notes section if there are single punch records
  if(singlePunchRecords.length > 0){
    html += `<h2 class="rpt-section">Attendance Notes & Exceptions</h2>
    <div class="rpt-note"><strong>⚠ Single Punch Records:</strong> The following dates have only one recorded punch. Unable to determine if this is a clock-in or clock-out without additional information. Please verify manually.</div>
    <table class="rpt-table"><thead><tr><th>Employee</th><th>Date</th><th>Time</th><th>Action</th></tr></thead><tbody>`;
    singlePunchRecords.forEach(r=>{
      html += `<tr><td class="rpt-left rpt-bold">${r.name}</td><td>${fmtDateLabel(r.date)}</td><td>${r.first}</td><td>Verify direction</td></tr>`;
    });
    html += `</tbody></table>`;
  }

  // Add unclassified employees warning
  if(unclassifiedPins.length > 0 && reportType === 'all'){
    html += `<h2 class="rpt-section">Unclassified Employees</h2>
    <div class="rpt-note"><strong>⚠ Unclassified Records:</strong> The following employees have not been classified as Security Guards or General Workers. They are included in this all-staff report but should be properly classified for supervisor-specific reports.</div>
    <ul>`;
    unclassifiedPins.forEach(pin=>{
      html += `<li>${pinMap[pin].name} (PIN #${pin})</li>`;
    });
    html += `</ul>`;
  }

  // Final summary
  html += `<h2 class="rpt-section">Report Summary</h2>
    <ul>
      <li><strong>Report Type:</strong> ${typeLabel}</li>
      <li><strong>Period:</strong> ${label}</li>
      <li><strong>Employees Included:</strong> ${staffPresent}</li>
      <li><strong>Total Punch Events:</strong> ${totalPunches}</li>
      <li><strong>Records Requiring Attention:</strong> ${singlePunchRecords.length} (single punch)</li>`;
  
  if(reportType === 'security' && guardSummary.length > 0){
    html += `<li><strong>Security Guards Covered:</strong> ${guardSummary.length}</li>`;
  }
  
  html += `</ul>
    <div class="rpt-footer">ZKTeco Report Builder — ${typeLabel} — ${label} — Generated ${generatedOn}</div>
  </div>`;
  return html;
}

function generateReport(){
  const reportType = document.getElementById('reportType').value;
  const periodType = document.getElementById('reportPeriodType').value;
  const periodKey = document.getElementById('reportPeriodSelect').value;
  if(!periodKey){ alert('Load and analyze a punch log first.'); return; }
  const mandateMin = Number(document.getElementById('mandateMin').value) || 60;
  const offdutyMin = Number(document.getElementById('offdutyMin').value) || 240;

  let startKey, endKey, label, weeksForTimetable;

  if(periodType==='weekly'){
    const week = computeAvailableWeeks().find(w=>w.key===periodKey);
    startKey = dateKeyOf(week.days[0]); endKey = dateKeyOf(week.days[5]);
    label = week.label;
    weeksForTimetable = [week];
  } else {
    const [y,m] = periodKey.split('-').map(Number);
    const monthStart = new Date(y, m-1, 1);
    const monthEnd = new Date(y, m, 0);
    startKey = dateKeyOf(monthStart); endKey = dateKeyOf(monthEnd);
    label = monthStart.toLocaleDateString('en-GB',{month:'long', year:'numeric'});
    weeksForTimetable = [];
    let ws = getMonday(monthStart);
    const lastWs = getMonday(monthEnd);
    while(ws <= lastWs){
      const days = [];
      for(let i=0;i<6;i++){ const d = new Date(ws); d.setDate(ws.getDate()+i); days.push(d); }
      weeksForTimetable.push({
        key: dateKeyOf(ws),
        label: `${ws.toLocaleDateString('en-GB',{day:'numeric',month:'long'})} – ${days[5].toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}`,
        days
      });
      ws = new Date(ws); ws.setDate(ws.getDate()+7);
    }
  }

  const filteredPins = getFilteredPinsByReportType(reportType);
  const filtered = filterByPinDateRange(startKey, endKey, filteredPins);
  const {allRows, detailRows} = summarizeAll(filtered);
  const {summary: guardSummary, daily: guardDaily} = summarizeGuards(filtered, mandateMin, offdutyMin);

  let typeLabel = 'Staff Attendance Report';
  if(reportType === 'security') typeLabel = 'Security Guard Attendance Report';
  else if(reportType === 'general') typeLabel = 'General Workers Attendance Report';

  const html = buildReportHTML({
    reportType, typeLabel, label, startKey, endKey, allRows, detailRows, guardSummary, guardDaily,
    weeksForTimetable, filteredByPinDate: filtered, mandateMin, filteredPins
  });

  document.getElementById('reportPreview').innerHTML = `<style>${REPORT_STYLE}</style>${html}`;
  document.getElementById('reportPreviewWrapper').style.display = 'block';
  document.getElementById('reportPreviewWrapper').scrollIntoView({behavior:'smooth'});

  window._lastReportHTML = html;
  window._lastReportLabel = label;
  window._lastReportType = reportType;
}

function printReport(){
  document.body.classList.add('printing-report');
  window.addEventListener('afterprint', function handler(){
    document.body.classList.remove('printing-report');
    window.removeEventListener('afterprint', handler);
  });
  window.print();
}

function downloadReportHTML(){
  if(!window._lastReportHTML){ alert('Generate a report first.'); return; }
  const fullDoc = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<title>Staff Attendance Report — ${window._lastReportLabel}</title>
<style>${REPORT_STYLE}</style></head><body>${window._lastReportHTML}</body></html>`;
  const blob = new Blob([fullDoc], {type:'text/html'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  const safeLabel = window._lastReportLabel.replace(/[^a-z0-9]+/gi,'_');
  const typeStr = window._lastReportType === 'security' ? 'Security' : (window._lastReportType === 'general' ? 'General' : 'AllStaff');
  a.download = `${typeStr}_Report_${safeLabel}.html`;
  a.click();
}

function exportCSV(tableId, filename){
  const table = document.getElementById(tableId);
  const rows = [...table.querySelectorAll('tr')];
  const csv = rows.map(row=>
    [...row.children].map(cell=>{
      let text = cell.textContent.replace(/"/g,'""');
      return `"${text}"`;
    }).join(',')
  ).join('\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}
