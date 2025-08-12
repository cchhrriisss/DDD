// Drag & Drop
const img = document.querySelector(".draggable");
let offsetX, offsetY;

img.addEventListener("mousedown", (e) => {
  offsetX = e.clientX - img.offsetLeft;
  offsetY = e.clientY - img.offsetTop;

  function mouseMoveHandler(ev) {
    img.style.left = `${ev.clientX - offsetX}px`;
    img.style.top = `${ev.clientY - offsetY}px`;
  }

  function mouseUpHandler() {
    document.removeEventListener("mousemove", mouseMoveHandler);
    document.removeEventListener("mouseup", mouseUpHandler);
  }

  document.addEventListener("mousemove", mouseMoveHandler);
  document.addEventListener("mouseup", mouseUpHandler);
});

// Bewegender Text
const title = document.querySelector("h1");
let pos = 0;
setInterval(() => {
  pos += 2;
  title.style.transform = `translateX(${pos}px)`;
  if (pos > window.innerWidth) pos = -200;
}, 30);
