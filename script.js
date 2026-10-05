// ====== CONFIG ======
const APPS_SCRIPT_URL = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";
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

  const btn = $("submit"); btn.disabled = true; say("Submitting...", true);
  try {
    const res = await fetch(APPS_SCRIPT_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(data) });
    const out = await res.json();
    if (out.ok) { say("Application received. You're on the list.", true); $("wl").reset(); }
    else say(out.error || "Something went wrong. Try again.");
  } catch (err) { say("Network error. Try again."); }
  btn.disabled = false;
});
