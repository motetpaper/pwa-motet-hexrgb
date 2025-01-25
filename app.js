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

const thepage = document.body;
const wrap = document.querySelector('#wrap');
const bars = document.querySelectorAll('input[type=range]');
const boxes = document.querySelectorAll('input[type=text]');
const hexpad = document.querySelector('#hexpad');
const hexspan = document.querySelectorAll('#hexwrap span');
const picker = document.querySelector('#colorpicker');

const btns = document.querySelectorAll('button');

bars.filter = Array.prototype.filter;
document.addEventListener('DOMContentLoaded', (evt)=>{
  console.log('loaded');
  load_from_storage();

  // the built-in (native) web browser color picker
  // returns the color value as a hexadecimal triplet
  // this requires us to convert the value to RGB

  // processing built-in color picker values

  picker.addEventListener('input', (evt) => {
    setColorFromHexString(evt.target.value);
    console.log(hex, rgb);
    upd();
  });

  picker.addEventListener('change', (evt) => {
    setColorFromHexString(evt.target.value);
    console.log(hex, rgb);
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
      console.log(rgb);
      upd();
    });
  });

  boxes.forEach((b)=> {
    b.addEventListener('blur', (evt) => {
      const re = /[^\d]/g
      evt.target.value = asColorValue(evt.target.value.replace(re,''));
      rgb[evt.target.id[0]] = evt.target.value;
      hex = asHexString();
      console.log(rgb);
      upd();
      save_later();
    });
  });


  // RGB sliders between 0 and 255
  bars.forEach((b)=> {
    b.addEventListener('input', (evt) => {
      rgb[evt.target.id] = evt.target.value;
      console.log(rgb);
      upd();
    });

    // ctrl+click grey mode
    b.addEventListener('mousemove', (m_evt) => {
      if(!!m_evt.ctrlKey && !!m_evt.which) {
        setGreyColor(m_evt.target.value);
        upd();
      }
      console.log(rgb);
    });
  });

  bars.forEach((b)=> {
    b.addEventListener('change', (evt) => {
      rgb[evt.target.id] = evt.target.value;
      console.log(rgb);
      upd();
      save_later();
    });

    // ctrl+click grey mode color saved
    b.addEventListener('mouseup', (m_evt) => {
      if(!!m_evt.ctrlKey && !!m_evt.which) {
        setGreyColor(m_evt.target.value);
        upd();
        save_later();
      }
      console.log(rgb);
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
  console.log(hex);
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
  hex = localStorage['hex'];
  rgb = JSON.parse(localStorage['rgb']);
  console.log('loaded', hex,rgb);
}

// saves the current color to localStorage
function save_to_storage() {
  localStorage['hex'] = asHexString();
  localStorage['rgb'] = JSON.stringify(rgb);
  console.log('saved', localStorage);
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
  console.log('fn:upd');
  hex = asHexString();
  updateBoxes();
  updateBars();
  updatePage();
  updatePicker();
}
