const pages = ["home","birth","dashboard","astro","tuvi","numbers","chat","pricing","settings","login"];
const ACCOUNTS_KEY = "astramindAccounts";
const SESSION_KEY = "astramindSession";
const GUEST_PROFILE_KEY = "astramindProfile";
const PAGE_KEY = "astramindLastPage";

const emptyProfile = () => ({name:"Bạn", gender:"", date:"", time:"", place:""});
let profile = emptyProfile();
let selectedGender = "";

function readJSON(key, fallback){
  try{ const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
  catch{ return fallback; }
}
function writeJSON(key, value){
  try{ localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch{ showToast("Trình duyệt đang chặn lưu dữ liệu (chế độ ẩn danh?)"); return false; }
}
function getAccounts(){ return readJSON(ACCOUNTS_KEY, {}); }
function getSessionEmail(){ return localStorage.getItem(SESSION_KEY) || ""; }

function loadProfile(){
  const email = getSessionEmail();
  if(email){
    const acc = getAccounts()[email];
    profile = acc && acc.profile ? acc.profile : emptyProfile();
  } else {
    profile = readJSON(GUEST_PROFILE_KEY, emptyProfile());
  }
  return profile;
}
function saveProfile(p){
  profile = p;
  const email = getSessionEmail();
  if(email){
    const accounts = getAccounts();
    if(accounts[email]){ accounts[email].profile = p; return writeJSON(ACCOUNTS_KEY, accounts); }
  }
  return writeJSON(GUEST_PROFILE_KEY, p);
}
function hasProfile(){ return Boolean(profile && profile.date); }

async function hashPassword(password){
  const data = new TextEncoder().encode("astramind:" + password);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");
}

async function login(){
  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value;
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ showToast("Email chưa hợp lệ ✦"); return; }
  if(password.length < 6){ showToast("Mật khẩu cần tối thiểu 6 ký tự ✦"); return; }

  const accounts = getAccounts();
  const hash = await hashPassword(password);
  let isNew = false;

  if(accounts[email]){
    if(accounts[email].passwordHash !== hash){ showToast("Sai mật khẩu, bạn thử lại nhé."); return; }
  } else {
    const guest = readJSON(GUEST_PROFILE_KEY, null);
    accounts[email] = { passwordHash: hash, profile: guest && guest.date ? guest : emptyProfile(), createdAt: new Date().toISOString() };
    if(!writeJSON(ACCOUNTS_KEY, accounts)) return;
    localStorage.removeItem(GUEST_PROFILE_KEY);
    isNew = true;
  }

  localStorage.setItem(SESSION_KEY, email);
  document.getElementById("loginForm").reset();
  loadProfile();
  updateAuthUI();
  showToast(isNew ? "Đã tạo tài khoản mới ✦" : "Đăng nhập thành công ✦");
  showPage(hasProfile() ? "dashboard" : "birth");
}

function logout(){
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(PAGE_KEY);
  profile = emptyProfile();
  updateAuthUI();
  showToast("Bạn đã đăng xuất.");
  showPage("home");
}
function handleNavAuth(){ getSessionEmail() ? logout() : showPage("login"); }
function updateAuthUI(){
  const btn = document.getElementById("navAuthBtn");
  if(btn) btn.textContent = getSessionEmail() ? "Đăng xuất" : "Đăng nhập";
}

function showPage(page){
  if(!pages.includes(page)) page = "home";
  pages.forEach(p=>{
    const el=document.getElementById("page-"+p);
    if(el) el.classList.toggle("active",p===page);
  });
  window.scrollTo({top:0,behavior:"smooth"});
  if(["dashboard","chat","tuvi","numbers"].includes(page)) refreshProfile();
  if(page==="birth") fillBirthForm();
  document.body.classList.toggle("chat-open", page==="chat");
  if(page!=="login") localStorage.setItem(PAGE_KEY, page);
  const nav=document.querySelector(".nav-links");
  if(nav && window.innerWidth<900) nav.style.display="";
}
function toggleMenu(){
  const nav=document.querySelector(".nav-links");
  nav.style.display = nav.style.display==="flex" ? "" : "flex";
  if(nav.style.display==="flex"){nav.style.position="absolute";nav.style.top="76px";nav.style.left="0";nav.style.right="0";nav.style.padding="20px";nav.style.background="white";nav.style.flexDirection="column";}
}
function nextStep(n){
  if(n===2 && !document.getElementById("nameInput").value.trim()){
    showToast("Bạn hãy nhập họ tên trước nhé ✦"); return;
  }
  document.querySelectorAll(".step-panel").forEach(x=>x.classList.remove("active"));
  document.getElementById("step"+n).classList.add("active");
  document.querySelectorAll(".step-dot").forEach((x,i)=>x.classList.toggle("active",i<n));
}
function toggleTime(){document.getElementById("timeInput").disabled=document.getElementById("unknownTime").checked}
function selectGender(btn){
  document.querySelectorAll(".gender-btn").forEach(b=>b.classList.remove("selected"));
  btn.classList.add("selected"); selectedGender=btn.textContent;
}
function fillBirthForm(){
  loadProfile();
  if(!hasProfile()) return;
  document.getElementById("nameInput").value = profile.name==="Bạn" ? "" : profile.name;
  document.getElementById("dateInput").value = profile.date || "";
  document.getElementById("timeInput").value = profile.time || "";
  document.getElementById("placeInput").value = profile.place || "";
  selectedGender = profile.gender || "";
  document.querySelectorAll(".gender-btn").forEach(b=>b.classList.toggle("selected", b.textContent===selectedGender));
}
function createProfile(){
  const date=document.getElementById("dateInput").value;
  const place=document.getElementById("placeInput").value.trim();
  if(!date || !place){showToast("Hãy điền ngày sinh và nơi sinh để tạo hồ sơ ✦");return}
  const unknown=document.getElementById("unknownTime").checked;
  const newProfile={
    name:document.getElementById("nameInput").value.trim()||"Bạn",
    gender:selectedGender, date,
    time: unknown ? "" : document.getElementById("timeInput").value,
    place, updatedAt:new Date().toISOString()
  };
  if(!saveProfile(newProfile)) return;
  showToast(getSessionEmail() ? "Hồ sơ đã được lưu vào tài khoản ✦" : "Hồ sơ đã được lưu ✦");
  nextStep(1);
  setTimeout(()=>showPage("dashboard"),500);
}
function formatDate(iso){
  if(!iso) return "";
  const [y,m,d]=iso.split("-"); return `${d}/${m}/${y}`;
}
function refreshProfile(){
  loadProfile();
  const name=profile.name||"Bạn";
  const d=document.getElementById("dashName"); if(d)d.textContent=name.split(" ").pop();
  const c=document.getElementById("chatProfileName"); if(c)c.textContent=name;
  const t=document.getElementById("tuviName"); if(t)t.textContent=hasProfile()?name.toUpperCase():"HỒ SƠ CÁ NHÂN";
  const lp=document.getElementById("lifePath"); if(lp)lp.textContent=calculateLifePath(profile.date);
  const meta=document.getElementById("dashMeta");
  if(meta){
    meta.textContent = hasProfile()
      ? [`Ngày sinh: ${formatDate(profile.date)}`, profile.time&&`Giờ sinh: ${profile.time}`, `Nơi sinh: ${profile.place}`, profile.gender&&`Giới tính: ${profile.gender}`].filter(Boolean).join(" · ")
      : "Bạn chưa có hồ sơ — bấm “Bắt đầu miễn phí” để tạo.";
  }
}
function calculateLifePath(date){
  if(!date)return 7;
  const digits=date.replaceAll("-","").split("").map(Number);
  let sum=digits.reduce((a,b)=>a+b,0);
  while(sum>9 && ![11,22,33].includes(sum)) sum=String(sum).split("").reduce((a,b)=>a+Number(b),0);
  return sum;
}
function openChatWith(q){showPage("chat");setTimeout(()=>{document.getElementById("chatInput").value=q;sendChat()},250)}
function sendSuggestion(q){document.getElementById("chatInput").value=q;sendChat()}
function sendChat(){
  const input=document.getElementById("chatInput"); const q=input.value.trim(); if(!q)return;
  addMessage(q,"user"); input.value="";
  setTimeout(()=>{
    let answer="Dựa trên hồ sơ AstraMind của bạn, mình sẽ xem đây như một góc nhìn để tự chiêm nghiệm chứ không phải một dự đoán chắc chắn. Điểm nổi bật là bạn có xu hướng phát triển tốt khi được chủ động tìm hiểu, có không gian suy nghĩ và biến insight thành hành động cụ thể.";
    if(/nghề|công việc|sự nghiệp/i.test(q)) answer="Về sự nghiệp, hồ sơ demo cho thấy sự kết hợp giữa tính phân tích, chiều sâu và khả năng thích nghi. Bạn có thể hợp với những hướng cần nghiên cứu, giải quyết vấn đề, dữ liệu, chiến lược hoặc công việc cho phép bạn liên tục học hỏi. Hãy dùng điều này như một giả thuyết để thử nghiệm qua trải nghiệm thực tế.";
    else if(/tình cảm|người yêu|tình yêu/i.test(q)) answer="Trong các mối quan hệ, bạn có xu hướng cần sự chân thành và chiều sâu hơn là kết nối quá hời hợt. Một câu hỏi hữu ích có thể là: “Mình đang cần cảm giác an toàn hay cần được thấu hiểu?” — câu trả lời của bạn quan trọng hơn bất kỳ lá số nào.";
    else if(/mạnh|điểm mạnh/i.test(q)) answer="Điểm mạnh nổi bật trong hồ sơ demo là khả năng quan sát, đào sâu và tự học. Khi kết hợp với tính linh hoạt, đây có thể trở thành lợi thế lớn trong những môi trường thay đổi nhanh.";
    else if(/cải thiện|phát triển/i.test(q)) answer="Một hướng phát triển đáng thử là biến việc suy nghĩ thành thử nghiệm nhỏ. Thay vì chờ đến khi chắc chắn, hãy đặt một giả thuyết, hành động trong 1–2 tuần, rồi nhìn lại dữ liệu và cảm nhận của chính bạn.";
    addMessage(answer,"ai");
  },650);
}
function addMessage(text,type){
  const box=document.getElementById("messages");
  const div=document.createElement("div"); div.className="message "+type;
  div.innerHTML=type==="ai"
    ? `<div class="msg-avatar">✦</div><div><p>${escapeHtml(text)}</p><small>AstraMind AI · vừa xong</small></div>`
    : `<div><p>${escapeHtml(text)}</p><small>Bạn · vừa xong</small></div>`;
  box.appendChild(div); box.scrollTop=box.scrollHeight;
}
function escapeHtml(str){return str.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function showToast(msg){
  const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");
  clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.classList.remove("show"),2800);
}
function downloadDemo(){
  const data={product:"AstraMind",account:getSessionEmail()||null,profile,exportedAt:new Date().toISOString()};
  const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="astramind-data.json";a.click();
  showToast("Đã tạo file dữ liệu.");
}
function confirmDelete(){
  if(!confirm("Bạn có chắc muốn xoá dữ liệu hồ sơ?")) return;
  saveProfile(emptyProfile());
  localStorage.removeItem(GUEST_PROFILE_KEY);
  refreshProfile();
  showToast("Dữ liệu hồ sơ đã được xoá.");
}
document.addEventListener("DOMContentLoaded",()=>{
  loadProfile();
  updateAuthUI();
  refreshProfile();
  const last=localStorage.getItem(PAGE_KEY);
  if(last && last!=="home") showPage(last);
});
