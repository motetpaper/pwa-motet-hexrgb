// app.js
// job    : handles apps actions
// git    : https://github.com/motetpaper/pwa-motet-hexrgb
// lic    : MIT

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register('./sw.js');
}

let rgb = {
  r: 0,
  g: 0,
  b: 0,
}

let hex = '000000';

let isAltKeyDown = false;
let isCtrlKeyDown = false;

const thepage = document.body;
const wrap = document.querySelector('#wrap');
const hexpad = document.querySelector('#hexpad');
const picker = document.querySelector('#colorpicker');

const bars = document.querySelectorAll('input[type=range]');
const boxes = document.querySelectorAll('input[type=text]');
const hexspan = document.querySelectorAll('#hexwrap span');
const btns = document.querySelectorAll('button');

document.addEventListener('DOMContentLoaded', (evt)=>{
  load_from_storage();

  // keyboard modes
  // the alt key enables parade mode
  // the ctrl key enables grey mode

  // NOTE: no decision yet about touch events

  thepage.addEventListener('keydown', (k_evt) => {
    isAltKeyDown = !!k_evt.altKey;
    isCtrlKeyDown = !!k_evt.ctrlKey;
  });

  thepage.addEventListener('keyup', (k_evt) => {
    isAltKeyDown = !!k_evt.altKey;
    isCtrlKeyDown = !!k_evt.ctrlKey;
  });


  // the built-in (native) web browser color picker
  // returns the color value as a hexadecimal triplet
  // this requires us to convert the value to RGB

  // processing built-in color picker values

  picker.addEventListener('input', (evt) => {
    setColorFromHexString(evt.target.value);
    upd();
  });

  picker.addEventListener('change', (evt) => {
    setColorFromHexString(evt.target.value);
    upd();
    save_later();
  });

  // text boxes, expecting number input,
  // clamps values between 0 and 255
  boxes.forEach((b)=> {
    b.addEventListener('input', (evt) => {
      const re = /[^\d]/g
      evt.target.value = asColorValue(evt.target.value.replace(re,''));
      rgb[evt.target.id[0]] = evt.target.value;
      upd();
    });
  });

  boxes.forEach((b)=> {
    b.addEventListener('blur', (evt) => {
      const re = /[^\d]/g
      evt.target.value = asColorValue(evt.target.value.replace(re,''));
      rgb[evt.target.id[0]] = evt.target.value;
      hex = asHexString();
      upd();
      save_later();
    });
  });


  // RGB sliders between 0 and 255
  bars.forEach((b)=> {
    b.addEventListener('input', (evt) => {

      // alt-click enables parade mode
      if(isAltKeyDown) {
        let diffValue = +evt.target.value - rgb[evt.target.id];

        // this is the "other bars idiom" instead of filter NodeLists
        'rgb'.split('')
          .filter((id)=>id!=evt.target.id)
          .forEach((id)=>{
            rgb[id] = asColorValue(+rgb[id] + diffValue);
          });

      // ctrl-click enables grey mode
      } else if (isCtrlKeyDown) {
        'rgb'.split('')
          .filter((id)=>id!=evt.target.id)
          .forEach((id)=>{
            rgb[id] = asColorValue(evt.target.value);
          });
      }

      rgb[evt.target.id] = evt.target.value;
      upd();
    });
  });

  bars.forEach((b)=> {
    b.addEventListener('change', (evt) => {
      rgb[evt.target.id] = evt.target.value;
      upd();
      save_later();
    });
  });

  // updates based on RGB color
  upd();
});


//
//
// done, below

function setGreyColor(str) {
  rgb.r = rgb.g = rgb.b = asColorValue(str);
}

// updates the color picker and hex value display
function updatePicker() {
  picker.value = `#${hex}`;
  hexpad.innerText = hex;
  hexspan.forEach((s)=> {
    s.style.color = isShiny() ? 'black' : 'white';
  })
}

// updates the text boxes
function updateBoxes() {
  boxes.forEach((b)=>{
    b.style.backgroundColor = asFuncNotation();
    b.style.color = isShiny() ? 'black' : 'white';
    const which = b.id.replace('box','');
    b.value = rgb[which];
  });
}

// updates the sliders
function updateBars() {
  bars.forEach((b)=>{
    b.style.backgroundColor = asFuncNotation();
    b.style.accentColor = isShiny() ? 'black' : 'white';
    b.value = rgb[b.id];
  });
}

// updates the page background
function updatePage() {
  thepage.style.backgroundColor = asFuncNotation();
  thepage.style.color = isShiny() ? 'black' : 'white';
}

// returns the current color in functional notation
function asFuncNotation() {
  return ` rgb(${rgb.r},${rgb.g},${rgb.b})`;
}

// relative luminance formula
// returns true if color too shiny; otherwise, false.
function isShiny() {

  rr = rgb.r / 255
  gg = rgb.g / 255
  bb = rgb.b / 255

  y = 0.2126 * rr + 0.7152 * gg + 0.0722 * bb;
  return (y > 0.5) ? true : false;
}

// returns rgb object as a hex string
function asHexString() {
  return Object.keys(rgb)
    // to hex digits
    .map((a)=>parseInt(rgb[a]).toString(16))
    // prepend zero on single hex digit
    .map((a)=>a.padStart(2,'0'))
    .join('');
}

// sets the color using a hex string, if valid
function setColorFromHexString(str) {
  const re = /[^A-Fa-f0-9]/ig;
  str = str.replace(re, '');
  rgb.r = parseInt(str.substr(0,2), 16);
  rgb.g = parseInt(str.substr(2,2), 16);
  rgb.b = parseInt(str.substr(4,2), 16);
}


// save or load settings

// loads the current color from localStorage
function load_from_storage() {
  rgb = localStorage['rgb'] ? JSON.parse(localStorage['rgb']) : {r: '128', g: '128', b: '128'};
  hex = asHexString(); // rgb is source of truth
}

// saves the current color to localStorage
function save_to_storage() {
  localStorage['hex'] = asHexString();
  localStorage['rgb'] = JSON.stringify(rgb)
}

// slightly delays saving the color to localStorage
function save_later() {
  setTimeout(save_to_storage, 1000);
}

// clamps color to values between 0 and 255
function asColorValue(str) {
  const clamped_rgb_value = new Uint8ClampedArray(1);
  clamped_rgb_value[0] = +str; // cast to unsigned int
  return '' + clamped_rgb_value[0]; // cast back to string
}

function upd() {
  hex = asHexString();
  updateBoxes();
  updateBars();
  updatePage();
  updatePicker();
}
