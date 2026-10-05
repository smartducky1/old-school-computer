// ====== CONFIG ======
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyWp1nLdV-HZFNYVYeHnqwfZ9DRzNwx53LDGbbCVjKFCz13dKSbzEcvuENLe0NW4uxb/exec";
const X_PROFILE = "https://x.com/YOUR_HANDLE";
const PINNED_POST = "https://x.com/YOUR_HANDLE/status/YOUR_POST_ID";
// ====================

const $ = id => document.getElementById(id);
const loadedAt = Date.now();

$("goFollow").href = X_PROFILE;
$("goLike").href = PINNED_POST;
$("goRt").href = PINNED_POST;

// Art grid (shows 7 of 8, arrows rotate)
let imgs = [1,2,3,4,5,6,7,8];
function render(){
  $("grid").innerHTML = imgs.slice(0,7).map(n => `<img src="images/${n}.jpg" alt="Old school computer ${n}" loading="lazy">`).join("");
}
$("next").onclick = () => { imgs.push(imgs.shift()); render(); };
$("prev").onclick = () => { imgs.unshift(imgs.pop()); render(); };
render();

// Form
const msg = $("msg");
const say = (t, ok) => { msg.textContent = t; msg.className = ok ? "ok" : ""; };
// Sends data as a script request so the reply is always readable (no cross-site blocking)
function send(data) {
  return new Promise((resolve, reject) => {
    const cb = "cb" + Date.now();
    const s = document.createElement("script");
    const done = () => { clearTimeout(t); delete window[cb]; s.remove(); };
    const t = setTimeout(() => { done(); reject(new Error("timeout")); }, 30000);
    window[cb] = r => { done(); resolve(r); };
    s.onerror = () => { done(); reject(new Error("network")); };
    s.src = APPS_SCRIPT_URL + "?" + new URLSearchParams({ ...data, callback: cb });
    document.head.appendChild(s);
  });
}

const statusRe = /^https?:\/\/(www\.)?(x|twitter)\.com\/[A-Za-z0-9_]+\/status\/\d+/i;

$("wl").addEventListener("submit", async e => {
  e.preventDefault();
  const data = {
    xuser: $("xuser").value.trim().replace(/^@/, ""),
    qt: $("qt").value.trim(),
    tag: $("tag").value.trim(),
    wallet: $("wallet").value.trim(),
    website: $("website").value,
    elapsed: Date.now() - loadedAt
  };
  if (![1,2,3,4,5].every(i => $("c"+i).checked)) return say("Complete and tick all 5 tasks.");
  if (!/^[A-Za-z0-9_]{1,15}$/.test(data.xuser)) return say("Enter a valid X username.");
  if (!statusRe.test(data.qt)) return say("Enter a valid X post link for task 03.");
  if (!statusRe.test(data.tag)) return say("Enter a valid X comment link for task 04.");
  if (!/^0x[a-fA-F0-9]{40}$/.test(data.wallet)) return say("Enter a valid EVM wallet (0x + 40 characters).");

  const btn = $("submit"); btn.disabled = true; btn.textContent = "SUBMITTING..."; say("Please wait, do not close this page.", true);
  try {
    const out = await send(data);
    if (out.ok) { say(""); $("wl").reset(); openModal(); }
    else say(out.error || "Something went wrong. Try again.");
  } catch (err) { say(err.message === "timeout" ? "Timed out. Check your connection and try again." : "Network error. Try again."); }
  btn.disabled = false; btn.innerHTML = "SUBMIT &rarr;";
});

// Success popup
const modal = $("modal");
function openModal(){ modal.hidden = false; $("ok").focus(); }
function closeModal(){ modal.hidden = true; }
$("ok").onclick = $("close").onclick = closeModal;
modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });
