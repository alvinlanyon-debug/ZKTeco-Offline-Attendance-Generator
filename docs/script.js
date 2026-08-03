let punches = []; // {pin, dt, dateKey}
let pinMap = {};  // pin -> {name, guard}
let byPinDate = {}; // pin -> dateKey -> [Date,...]  (built once from all punches)
let importedNames = {}; // canonical PIN -> name, read from optional user.dat

const STORAGE_KEY = 'toptech_pin_map_v1';

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

// NOTE: full script continues, identical to archived/script.js
