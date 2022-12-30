const drawingCanvas = document.getElementById("drawing");
const sourceImage = document.getElementById("image");
const ctxdrw = drawingCanvas.getContext("2d");
const ctximg = sourceImage.getContext("2d");
const rgbWordArray = ["a", "b", "c", "d", "e", "f"];

var canvasPieces;
var drawColor = "white";
var lineStroke = 1;
var initX;
var initY;
var absWidth = window.innerWidth / 2;
var absHeight = window.innerHeight - 80;
var isDrawing = false;
var isStreaming = false;
var appReady = false;
var isValidImageUrl = false;
var pattern = new RegExp(
  "^(https?:\\/\\/)?" + // protocol
    "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
    "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
    "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
    "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
    "(\\#[-a-z\\d_]*)?$",
  "i"
);
var pictureWrapper = document.getElementById("container");
var imageSrcErrorMsgEl = document.getElementsByClassName("error-message")[0];
var videoWrap = document.getElementById("video");
var saveBtn = document.getElementById("saveBtn");
var undoBtn = document.getElementById("undoBtn");
var clearAllBtn = document.getElementById("clearAllBtn");

ctxdrw.canvas.width = absWidth;
ctximg.canvas.width = absWidth;
ctxdrw.canvas.height = absHeight;
ctximg.canvas.height = absHeight;

var image = new Image();
image.setAttribute("crossOrigin", "");
var imageFromLink = document.getElementById("imageFromLink");
var imageFromUpload = document.getElementById("imageFromUpload");
var imageFromUnsplash = document.getElementById("imageFromUnsplash");
var logoEl = document.getElementById("logo");

imageFromLink.onkeyup = function (e) {
  checkState(e);
  if (isValidImageUrl) {
    setImageFromLink(e.target.value);
  }
};

document.body.onkeyup = function (e) {
  if (e.keyCode == 32) {
    undo();
  }
};

imageFromUnsplash.onclick = function (e) {
  e.target.className = "disabled";
  fetch("https://source.unsplash.com/random/")
    .then((res) => res.url)
    .then((url) => setImageFromLink(url));
};

imageFromUpload.onclick = function (e) {
  if (imageFromLink) {
    imageFromLink.classList = "";
  }
};

logoEl.onclick = function (e) {
  saveLogo();
};

invokeCamera();
generateLogo();

imageFromUpload.onchange = function (e) {
  setImageFromUpload(e.target);
};

drawingCanvas.onmousedown = function (e) {
  startDrawing(e);
};

drawingCanvas.onmouseup = function (e) {
  stopDrawing(e);
};

drawingCanvas.onmouseout = function (e) {
  stopDrawing(e);
};

drawingCanvas.onmousemove = function (e) {
  draw(e);
};

function expandImageFromLink() {
  if (imageFromLink) {
    imageFromLink.className =
      imageFromLink.className === "expand" ? "" : "expand";
  }
}

function invokeCamera() {
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: false })
    .then(function (stream) {
      var newVideoEl = document.createElement("video");
      if (videoWrap) {
        videoWrap.appendChild(newVideoEl);
        newVideoEl.srcObject = stream;
        newVideoEl.play();
        document.getElementById("takePhotoBtn").style.display = "block";
      }
    })
    .catch(function (err) {});
}

function createSvgPath() {
  var newElement = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  newElement.setAttribute(
    "d",
    "M" +
      randomN(51, 2) +
      " " +
      randomN(115, 11) +
      " L" +
      randomN(36, 2) +
      " " +
      randomN(43, 12)
  );
  let rgbValues = ["#f4edea", "#22332250", "#f6ebaa"];
  newElement.style.stroke = rgbValues[randomN(2, 0)];
  newElement.style.strokeWidth = randomN(5, 1) + "px";
  return newElement;
}

function createSvgCircle() {
  var newElement = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  newElement.setAttribute(
    "fill",
    "#" +
      rgbWordArray[randomN(5, 0)] +
      rgbWordArray[randomN(5, 0)] +
      randomN(9, 0) +
      rgbWordArray[randomN(5, 0)] +
      randomN(9, 0) +
      rgbWordArray[randomN(5, 0)] +
      rgbWordArray[randomN(5, 0)] +
      randomN(9, 0)
  );
  newElement.setAttribute("cx", randomN(65, 18));
  newElement.setAttribute("cy", randomN(30, 2));
  newElement.setAttribute("r", randomN(24, 8));
  return newElement;
}

function createSvgText(wordArray, i) {
  var newElement = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "text"
  );
  let rgbValues = ["#ff9569", "#ffc145", "#00000010"];
  newElement.setAttribute("fill", rgbValues[randomN(2, 0)]);
  newElement.setAttribute("x", randomN(28, 3));
  newElement.setAttribute("y", randomN(46, 9));
  newElement.setAttribute("font-weight", randomN(900, 300));
  newElement.setAttribute("font-size", randomN(48, 12) + "px");
  newElement.setAttribute("stroke-dashoffset", randomN(28, 0));
  newElement.setAttribute(
    "transform",
    "rotate(" +
      randomN(12, 2) +
      " " +
      randomN(-26, 24) +
      " " +
      randomN(44, 24) +
      ")"
  );
  newElement.textContent = wordArray[i];
  return newElement;
}

function generateLogo() {
  if (logoEl) {
    var difsEl = logoEl.firstChild;
    var rndR = randomN(90, 35);
    var rnd = randomN(7, 2);
    var wordArray = combineRandomName(rnd);
    for (var i = 0; i < rnd; i += 1) {
      logoEl.appendChild(createSvgCircle());
    }
    for (var i = 0; i < randomN(22, 12); i += 1) {
      logoEl.appendChild(createSvgPath());
    }
    for (var i = 0; i < randomN(14, 3); i += 1) {
      logoEl.appendChild(createSvgText(wordArray, i));
    }
    logoEl.children[randomN(rnd, 1)].style.transform =
      "rotate(-" + randomN(120, 35) + "deg)";
    logoEl.children[randomN(rnd, 1)].style.transform =
      "rotate(-" + randomN(90, -15) + "deg)";
    for (var i = 0; i < 4; i += 1) {}
  }
}

function saveLogo() {
  if (logoEl) {
    var svgString = new XMLSerializer().serializeToString(logoEl);

    var canvas = document.getElementById("logoCanvas");
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#467599";
    ctx.filter = "blur(" + randomN(5, 1) + "px)";
    ctx.fillRect(0, 0, 500, 500);
    var DOMURL = self.URL || self.webkitURL || self;
    var img = new Image();
    var svg = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    var url = DOMURL.createObjectURL(svg);
    img.onload = function () {
      ctx.drawImage(img, 0, 0, 500, 500);
      var imgURL = canvas.toDataURL("image/png");
      DOMURL.revokeObjectURL(imgURL);
      var dlLink = document.createElement("a");
      dlLink.download = "logo_" + combineRandomName(randomN(8, 4));
      dlLink.href = imgURL;
      dlLink.dataset.downloadurl = [
        "image/png",
        dlLink.download,
        dlLink.href,
      ].join(":");
      document.body.appendChild(dlLink);
      dlLink.click();
      document.body.removeChild(dlLink);
    };
    img.src = url;
  }
}

function randomN(mx, mn) {
  return Math.floor(Math.random() * (mx - mn) + mn);
}

function closeCamera() {
  while (videoWrap.firstChild) {
    videoWrap.firstChild.pause();
    videoWrap.removeChild(videoWrap.firstChild);
  }
}

function checkState(e) {
  var el = e.target;
  if (el && !!pattern.test(el.value)) {
    isValidImageUrl = true;
    imageSrcErrorMsgEl.style.display = "none";
  } else if (el && el.value === "") {
    imageSrcErrorMsgEl.style.display = "none";
  } else {
    imageSrcErrorMsgEl.style.display = "block";
  }
}

function clearAll() {
  while (pictureWrapper.firstChild) {
    pictureWrapper.removeChild(pictureWrapper.firstChild);
  }
  togglWorkBtns();
}

function drawImageToCanvas(obj, isVideo) {
  var objW = isVideo ? obj.clientWidth : obj.width;
  var objH = isVideo ? obj.clientHeight : obj.height;
  var canvas = ctximg.canvas;
  var hRatio = canvas.width / objW;
  var vRatio = canvas.height / objH;
  var ratio = Math.min(hRatio, vRatio);
  var centerShift_x = (canvas.width - objW * ratio) / 2;
  var centerShift_y = (canvas.height - objH * ratio) / 2;
  ctximg.clearRect(0, 0, canvas.width, canvas.height);
  ctximg.drawImage(
    obj,
    0,
    0,
    objW,
    objH,
    centerShift_x,
    centerShift_y,
    objW * ratio,
    objH * ratio
  );
}

function takePhoto() {
  if (videoWrap && videoWrap.firstChild) {
    drawImageToCanvas(videoWrap.firstChild, true);
    appReady = true;
    closeCamera();
  }
}

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

function setImageFromUpload(imageEl) {
  var imgFile = imageEl.files[0];
  if (imgFile && imgFile.type.substr(0, 5) === "image") {
    getBase64(imgFile).then((data) => {
      image.src = data;

      image.onload = function () {
        drawImageToCanvas(image);
      };

      appReady = true;
      imgFile.value = null;
    });
  }
}

function setImageFromLink(imageSrc) {
  image.src = imageSrc;

  image.onload = function () {
    drawImageToCanvas(image);

    appReady = true;
    isValidImageUrl = false;
    imageFromLink.className = "";
    imageFromLink.value = null;
    image.src = "";
    imageFromUnsplash.className = "";
  };
}

function startDrawing(event) {
  if (appReady) {
    isDrawing = true;
    ctxdrw.beginPath();

    initX = event.clientX - drawingCanvas.offsetLeft;
    initY = event.clientY - 60 - drawingCanvas.offsetTop;

    ctxdrw.moveTo(
      event.clientX - drawingCanvas.offsetLeft,
      event.clientY - 60 - drawingCanvas.offsetTop
    );
  }

  event.preventDefault();
}

function undo() {
  if (pictureWrapper.hasChildNodes()) {
    pictureWrapper.removeChild(pictureWrapper.lastChild);
  } else {
    togglWorkBtns();
  }
}

function draw(event) {
  if (
    isDrawing &&
    event.clientX - drawingCanvas.offsetLeft < window.innerWidth / 2
  ) {
    ctxdrw.lineTo(
      event.clientX - drawingCanvas.offsetLeft,
      event.clientY - 60 - drawingCanvas.offsetTop
    );

    ctxdrw.strokeStyle = drawColor;
    ctxdrw.lineWidth = lineStroke;
    ctxdrw.lineCap = "round";
    ctxdrw.lineJoin = "round";
    ctxdrw.stroke();
  }

  event.preventDefault();
}

function closeLine() {
  ctxdrw.lineTo(initX, initY);
  ctxdrw.strokeStyle = drawColor;
  ctxdrw.lineWidth = lineStroke + 1;
  ctxdrw.lineCap = "round";
  ctxdrw.lineJoin = "round";
  ctxdrw.stroke();
  ctxdrw.fillStyle = "white";
  ctxdrw.fill();
  copyCropped();
  togglWorkBtns(true);
}

function togglWorkBtns(show) {
  saveBtn.style.display = show ? "block" : "none";
  undoBtn.style.display = show ? "block" : "none";
  clearAllBtn.style.display = show ? "block" : "none";
}

function stopDrawing(event) {
  if (isDrawing) {
    closeLine();
    ctxdrw.closePath();
    isDrawing = false;
  }

  event.preventDefault();
}

function clearCanvas() {
  ctxdrw.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
}

function copyCropped() {
  var newCanvas = document.createElement("canvas");
  pictureWrapper.appendChild(newCanvas);

  var ctxnc = newCanvas.getContext("2d");
  ctxnc.canvas.width = window.innerWidth / 2;
  ctxnc.canvas.height = window.innerHeight;

  var resultPixData = ctxnc.getImageData(
    0,
    0,
    newCanvas.width,
    newCanvas.height
  ).data;
  var layerPixData = ctxdrw.getImageData(
    0,
    0,
    drawingCanvas.width,
    drawingCanvas.height
  ).data;
  var picturePixData = ctximg.getImageData(
    0,
    0,
    sourceImage.width,
    sourceImage.height
  ).data;

  /* First, get pixel data from your 3 canvas into
   * layerPixData, resultPixData, picturePixData
   */

  // read the entire pixel array
  for (var i = 0; i < layerPixData.length; i += 4) {
    //if the pixel is not blank, ie. it is part of the selected shape
    if (
      layerPixData[i] === 255 ||
      layerPixData[i + 1] === 255 ||
      layerPixData[i + 2] === 255
    ) {
      // copy the data of the picture to the result
      resultPixData[i] = picturePixData[i]; //red
      resultPixData[i + 1] = picturePixData[i + 1]; //green
      resultPixData[i + 2] = picturePixData[i + 2]; //blue
      resultPixData[i + 3] = picturePixData[i + 3]; //alpha
      // here you can put the pixels of your picture to white if you want
    }
  }
  var newImageData = new ImageData(
    new Uint8ClampedArray(resultPixData),
    newCanvas.width,
    newCanvas.height
  );

  if (checkIfCroppingNeeded(newImageData)) {
    ctxnc.putImageData(newImageData, 0, 0);
    cropImageFromCanvas(ctxnc);
    addDraggability(newCanvas);
  } else {
    pictureWrapper.removeChild(pictureWrapper.lastChild);
  }
  clearCanvas();
}

function checkIfCroppingNeeded(newImageData) {
  var pixels = new Uint32Array(newImageData.data.buffer);
  return pixels.find((pixel) => pixel !== 0);
}

function addDraggability(element) {
  var pos1 = 0;
  var pos2 = 0;
  var pos3 = 0;
  var pos4 = 0;
  var parent = pictureWrapper;
  element.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    parent.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    parent.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    element.style.top = element.offsetTop - pos2 + "px";
    element.style.left = element.offsetLeft - pos1 + "px";
  }

  function closeDragElement(e) {
    // stop moving when mouse button is released:
    parent.onmouseup = null;
    parent.onmousemove = null;
  }
}

function cropImageFromCanvas(context) {
  var canvas = context.canvas;
  var w = canvas.width;
  var h = canvas.height;
  var pix = { x: [], y: [] };
  var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  var x;
  var y;
  var index;

  for (y = 0; y < h; y++) {
    for (x = 0; x < w; x++) {
      index = (y * w + x) * 4;
      if (imageData.data[index + 3] > 0) {
        pix.x.push(x);
        pix.y.push(y);
      }
    }
  }
  pix.x.sort(function (a, b) {
    return a - b;
  });
  pix.y.sort(function (a, b) {
    return a - b;
  });
  var n = pix.x.length - 1;

  w = 1 + pix.x[n] - pix.x[0];
  h = 1 + pix.y[n] - pix.y[0];
  if (context.getImageData(pix.x[0], pix.y[0], w, h)) {
    var cut = context.getImageData(pix.x[0], pix.y[0], w, h);
  }

  canvas.width = w;
  canvas.height = h;
  context.putImageData(cut, 0, 0);
}

function save() {
  var elementsToMerge = document.querySelectorAll("#container canvas");
  var merger = document.createElement("canvas");
  merger.width = drawingCanvas.width; // sum of widths
  merger.height = drawingCanvas.height;
  var ctx = merger.getContext("2d");
  // iterate through all our strips
  elementsToMerge.forEach(function drawToMerger(el, i) {
    // simply draw at index * width
    var dx = el.offsetLeft - window.innerWidth / 2;
    var dy = el.offsetTop;
    ctx.drawImage(el, dx, dy);
    // ctx.drawImage(el, i * el.width, 0);
  });
  // export
  merger.toBlob(function (blob) {
    const blobUrl = URL.createObjectURL(blob);
    // document.getElementById("img").src = blobUrl;
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = "image_" + combineRandomName(randomN(8, 4)) + ".png";
    // Append link to the body
    document.body.appendChild(link);
    link.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      })
    );

    // Remove link from body
    document.body.removeChild(link);
  });
}

function combineRandomName(length) {
  var result = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
