// app.js
// job    : handles apps actions
// git    : https://github.com/motetpaper/pwa-motet-hexrgb
// lic    : MIT

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register('./sw.js');
}

const thepage = document.body;
const wrap = document.querySelector('#wrap');
const bars = document.querySelectorAll('input[type=range]');
const boxes = document.querySelectorAll('input[type=text]');
const hexpad = document.querySelector('#hexpad');
const hexspan = document.querySelectorAll('#hexwrap span');
const picker = document.querySelector('#colorpicker');

const btns = document.querySelectorAll('button');

const rgb = {
  r: 0,
  g: 0,
  b: 0,
}

document.addEventListener('DOMContentLoaded', (evt)=>{
  console.log('loaded');
  restoreColors();

  btns.forEach((a) => {
    a.addEventListener('click', (evt)=>{
      switch(evt.target.id){
        case 'export-favicon':
          motet_export_favicon();
          break;
        case 'export-icon':
          motet_export_png_icon();
          break;
        case 'export-photocard':
          motet_export_photo_4r();
          break;
        case 'export-wallpaper-notext':
          motet_export_desktop_wallpaper();
          break;
        case 'export-wallpaper':
          motet_export_desktop_wallpaper(true);
          break;
        default:
          // nothing
          break;
      }
    });
  });

  // the built-in (native) web browser color picker
  // returns the color value as a hexadecimal triplet
  // this requires us to convert the value to RGB

  // processing built-in color picker values

  picker.addEventListener('input', (evt) => {
    setColorFromHexString(evt.target.value);
    console.log(rgb);
  });

  picker.addEventListener('change', (evt) => {
    setColorFromHexString(evt.target.value);
    console.log(rgb);
  });

  // processing input from text boxes
  boxes.forEach((a)=>{
    // prevents non-number to be entered
    a.addEventListener('input', (evt) => {
      const re = /[^\d]/ig;

      // the 'clamp' keeps all the entered number between 0 and 255 (inclusive)
      const clamed_rgb_value = new Uint8ClampedArray(1);
      const s = evt.target.value.replace(re,'');
      clamed_rgb_value[0] = +s; // clamps the value between 0 and 255
      evt.target.value = clamed_rgb_value[0];
      const which = evt.target.id.replace('box','');
      rgb[which] = clamed_rgb_value[0];
      console.log(rgb);
      updateBars();
      updatePage();
      updateBoxes();
    });

    a.addEventListener('blur', (evt) => {
      const which = evt.target.id.replace('box','');
      rgb[which] = evt.target.value;
      console.log(rgb);
      updateBars();
      updatePage();
      updateBoxes();
    });
  });
  bars.filter = Array.prototype.filter;
  bars.forEach((a)=>{
    // updates when the range selection has completed
    a.addEventListener('change', (evt) => {
      console.log(evt);
      evt.target.addEventListener('onmouseup', function(m_evt){
        if(!!m_evt.ctrlKey && !!m_evt.which) {
          // the Ctrl + click creates "quick grey mode"
          // sets the other bars to the exact same color
            bars.filter((b)=>b.id != m_evt.target.id)
            .forEach((b)=>b.value = m_evt.target.value);
          console.log(m_evt.which);
          console.log(m_evt);
        }
      });
      saveColors();
    });

    a.addEventListener('click', (evt) => {
      console.log(evt);
      evt.target.addEventListener('mousedown', function(m_evt){
        if(!!m_evt.ctrlKey && !!m_evt.which) {
          // the Ctrl + click creates "quick grey mode"
          // sets the other bars to the exact same color
          val = m_evt.target.value;
          bars.forEach((b)=> rgb[b.id] = val);
        }
      });
          updateBars();
      saveColors();
    });


    a.addEventListener('click', (evt) => {
        if(!!evt.ctrlKey && !!evt.which) {
          // the Ctrl + click creates "quick grey mode"
          // sets the other bars to the exact same color
          val = evt.target.value;
          bars.forEach((b)=> rgb[b.id] = val);
        }

      console.log(evt);
      evt.target.addEventListener('mousemove', function(m_evt){
        if(!!m_evt.ctrlKey && !!m_evt.which) {
          // the Ctrl + click creates "quick grey mode"
          // sets the other bars to the exact same color
          val = m_evt.target.value;
          bars.forEach((b)=> rgb[b.id] = val);
        }
      });
      saveColors();
    });

    // constantly updates while range selection in progress
    a.addEventListener('input', (evt) => {
      console.log(evt);
      evt.target.addEventListener('mouseover', function(m_evt){
        if(!!m_evt.ctrlKey && !!m_evt.which) {
          // the Ctrl + click creates "quick grey mode"
          // sets the other bars to the exact same color
            [...bars].forEach((b)=>b.value = m_evt.target.value);
          console.log(m_evt.which);
          console.log(m_evt);
        }
      });
      saveColors();
    });
  });
});

// saves RGB color in persistent local storage
// saves RGB in memory
function saveColors() {
  bars.forEach((a)=>{
    localStorage[a.id] = a.value;
    rgb[a.id] = a.value;
  });
  update();
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


function setColorFromHexString(str) {

  const re = /[^A-Fa-f0-9]/ig;
  str = str.replace(re, '');

  rgb.r = parseInt(str.substr(0,2), 16);
  rgb.g = parseInt(str.substr(2,2), 16);
  rgb.b = parseInt(str.substr(4,2), 16);

  updateBars();
  saveColors();
}


// loads color settings
function restoreColors() {
  bars.forEach((a)=>{
    a.value = localStorage[a.id];
    rgb[a.id] = a.value;
  });
  update();
}

function updateBoxes(bg) {
  boxes.forEach((b)=>{
    const which = b.id.replace('box','');
    b.value = rgb[which];
    b.style.backgroundColor = asFuncNotation();
    b.style.color = isShiny() ? 'black' : 'white';
  });

  hexspan.forEach((a)=>{
    a.style.color = isShiny() ? 'black' : 'white';
  });

  hexpad.innerText = asHexString();
}

function updateBars() {
  bars.forEach((b)=>{
    b.value = rgb[b.id];
    b.style.accentColor = isShiny() ? 'black' : 'white';
  });
}

// updates colors everywhere
function update() {
  console.log('fn:update');
  thepage.style.backgroundColor = asFuncNotation();
  updateBars();
  updatePage();
  updateBoxes();
  updatePicker();
}

function updatePicker() {
  const hex = asHexString();
  picker.value = `#${hex}`;
}

function updatePage() {
  thepage.style.backgroundColor = asFuncNotation();
  thepage.style.color = isShiny() ? 'black' : 'white';
}

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

function motet_export_favicon() {
  const canvas = document.createElement('canvas');
  canvas.height = 16;
  canvas.width = 16;
  const ctx = canvas.getContext('2d');
  const img = new Image();
  img.src = 'favicon.ico'
  img.onload = function() {
    ctx.drawImage(img, 0, 0);
    const hex = asHexString();
    ctx.fillStyle = `#${hex}`;
    console.log(ctx.fillStyle);
    ctx.fillRect(0,0,16,16);
    const url = canvas.toDataURL('image/x-icon');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'favicon.ico';
    a.click();
  };
}

function motet_export_png_icon() {
  const size = 1024;
  const fn = `icon${size}.png`;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const hex = asHexString();
  ctx.fillStyle = `#${hex}`;
  ctx.fillRect(0,0,size,size);
  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = fn;
  a.click();
}


function motet_export_photo_4r() {
  const woffset = 800;
  const canvas = document.createElement('canvas');
  canvas.width = w = 3600;
  canvas.height = h = 2400;
  const ctx = canvas.getContext('2d');
  const hex = asHexString();
  const fn = `photo-4r-${hex}.png`;
  ctx.fillStyle = `#${hex}`;
  ctx.fillRect(0,0,w,h);
  ctx.fillStyle = isShiny() ? 'black' : 'white';
  ctx.font = '72px monospace';
  ctx.fillText(asFuncNotation().trim(), w-woffset, h-175);
  ctx.font = '144px monospace';
  ctx.fillText(`#${hex}`, w-woffset, h-275);
  ctx.font = 'bold 36px monospace';
  ctx.fillText(`motetpaper.github.io/hexrgb`, w-woffset, h-100);
  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = fn;
  a.click();
}


function motet_export_desktop_wallpaper(showText) {
  const canvas = document.createElement('canvas');
  canvas.width = w = window.screen.width;
  canvas.height = h = window.screen.height;

  const woffset = Math.floor(0.1 * w);
  const ctx = canvas.getContext('2d');
  const hex = asHexString();
  const fn = `desktop-wallpaper-${hex}.png`;
  ctx.fillStyle = `#${hex}`;
  ctx.fillRect(0,0,w,h);

  txt = {};
  if(showText) {

    txt.fp1 = 144,
    txt.fp2 = 72,
    txt.fp3 = 36,
    txt.fh1 = 275,
    txt.fh2 = 175,
    txt.fh3 = 100

    if(w < 800) {
      txt.fp1 = 72,
      txt.fp2 = 30,
      txt.fp3 = 18,
      txt.fh1 = 175,
      txt.fh2 = 125,
      txt.fh3 = 75
    }

    ctx.fillStyle = isShiny() ? 'black' : 'white';
    ctx.font = `bold ${txt.fp1}px monospace`;
    ctx.fillText(`#${hex}`, woffset, h-txt.fh1);
    ctx.font = `${txt.fp2}px monospace`;
    ctx.fillText(asFuncNotation().trim(), woffset, h-txt.fh2);
    ctx.font = `bold ${txt.fp3}px monospace`;
    ctx.fillText(`motetpaper.github.io/hexrgb`, woffset, h-txt.fh3);
  }
  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = fn;
  a.click();
}
