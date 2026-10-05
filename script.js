const pages = ["home","birth","dashboard","astro","tuvi","numbers","chat","pricing","settings","login"];
let profile = {name:"Bạn", gender:"", date:"", time:"", place:""};
let selectedGender = "";

function showPage(page){
  pages.forEach(p=>{
    const el=document.getElementById("page-"+p);
    if(el) el.classList.toggle("active",p===page);
  });
  window.scrollTo({top:0,behavior:"smooth"});
  if(page==="dashboard"||page==="chat") refreshProfile();
  if(page==="chat") document.body.classList.add("chat-open"); else document.body.classList.remove("chat-open");
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
function createProfile(){
  const date=document.getElementById("dateInput").value;
  const place=document.getElementById("placeInput").value.trim();
  if(!date || !place){showToast("Hãy điền ngày sinh và nơi sinh để tạo hồ sơ ✦");return}
  profile={
    name:document.getElementById("nameInput").value.trim()||"Bạn",
    gender:selectedGender,date,time:document.getElementById("timeInput").value,place
  };
  localStorage.setItem("astramindProfile",JSON.stringify(profile));
  showToast("Hồ sơ đã được tạo ✦");
  setTimeout(()=>showPage("dashboard"),500);
}
function refreshProfile(){
  const saved=localStorage.getItem("astramindProfile");
  if(saved) profile=JSON.parse(saved);
  const name=profile.name||"Bạn";
  const d=document.getElementById("dashName"); if(d)d.textContent=name.split(" ")[0];
  const c=document.getElementById("chatProfileName"); if(c)c.textContent=name;
  const lp=document.getElementById("lifePath"); if(lp)lp.textContent=calculateLifePath(profile.date)||7;
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
  const data={product:"AstraMind",profile,exportedAt:new Date().toISOString(),note:"Demo export"};
  const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="astramind-data.json";a.click();
  showToast("Đã tạo file dữ liệu mẫu.");
}
function confirmDelete(){
  if(confirm("Bạn có chắc muốn xoá dữ liệu demo?")){
    localStorage.removeItem("astramindProfile");profile={name:"Bạn"};
    showToast("Dữ liệu demo đã được xoá.");
  }
}
document.addEventListener("DOMContentLoaded",()=>{
  const saved=localStorage.getItem("astramindProfile");
  if(saved)profile=JSON.parse(saved);
  refreshProfile();
});
