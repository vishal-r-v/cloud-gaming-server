// Connect to local server
const socket = io("http://localhost:8080", { transports: ["websocket"] });

const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");
function resize(){ canvas.width = innerWidth; canvas.height = innerHeight; }
addEventListener("resize", resize); resize();

// Track all players
const players = new Map(); // id -> {x,y,color}
const me = { id: null, x: 200, y: 200, color: "#4ade80" };

// On connect, remember my id
socket.on("connect", () => { me.id = socket.id; players.set(me.id, me); });

// When others move
socket.on("player-move", ({ id, x, y }) => {
  if (!players.has(id)) players.set(id, { id, x, y, color: "#60a5fa" });
  const p = players.get(id); p.x = x; p.y = y;
});

// When others leave
socket.on("player-left", ({ id }) => players.delete(id));

// Keyboard control
const keys = new Set();
addEventListener("keydown", e => keys.add(e.key.toLowerCase()));
addEventListener("keyup", e => keys.delete(e.key.toLowerCase()));

function step(){
  const speed = 5;
  let moved = false;
  if (keys.has("arrowleft") || keys.has("a")) { me.x -= speed; moved = true; }
  if (keys.has("arrowright")|| keys.has("d")) { me.x += speed; moved = true; }
  if (keys.has("arrowup")   || keys.has("w")) { me.y -= speed; moved = true; }
  if (keys.has("arrowdown") || keys.has("s")) { me.y += speed; moved = true; }
  if (moved) socket.emit("move", { x: me.x, y: me.y });
}
setInterval(step, 33);

// Render loop
function render(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  // draw me
  ctx.fillStyle = me.color; ctx.beginPath(); ctx.arc(me.x, me.y, 12, 0, Math.PI*2); ctx.fill();
  // draw others
  for (const [id, p] of players){
    if (id === me.id) continue;
    ctx.fillStyle = p.color || "#60a5fa";
    ctx.beginPath(); ctx.arc(p.x || 100, p.y || 100, 12, 0, Math.PI*2); ctx.fill();
  }
  requestAnimationFrame(render);
}
render();
