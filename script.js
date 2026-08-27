/* ===== SONGS ===== */
const songs = (function(){
    try {
        const urls  = JSON.parse(document.getElementById('songUrls').textContent  || '[]');
        const names = JSON.parse(document.getElementById('songNames').textContent || '[]');
        if(!urls || urls.length === 0) return [];
        return urls.map((src, i) => ({
            src:  src,
            name: names[i] || ('🎵 أغنية ' + (i+1))
        }));
    } catch(e){ return []; }
})();

/* ===== COUNTDOWN — التاريخ من الأدمن ===== */
const startDate = new Date('2026-04-01T00:00:00').getTime();

let curSong = 0;
const audio     = document.getElementById('loveSong');
const playIcon  = document.getElementById('playIcon');
const disc      = document.getElementById('disc');
const soundWave = document.getElementById('soundWave');
const fillEl    = document.getElementById('progressFill');
const curTEl    = document.getElementById('currentTime');
const totTEl    = document.getElementById('totalTime');

function fmt(s){ return Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0'); }

function loadSong(idx, autoplay){
    curSong = (idx + songs.length) % songs.length;
    if(!songs[curSong].src) return;
    audio.src = songs[curSong].src;
    document.getElementById('songName').textContent = songs[curSong].name;
    document.getElementById('songNum').textContent  = (curSong+1)+' / '+songs.length;
    fillEl.style.width='0%'; curTEl.textContent='0:00'; totTEl.textContent='0:00';
    if(autoplay){ audio.play(); setPlaying(true); } else { setPlaying(false); }
}

function setPlaying(on){
    playIcon.className = on ? 'fa-solid fa-pause' : 'fa-solid fa-play';
    soundWave.classList.toggle('playing', on);
    disc.classList.toggle('spinning', on);
}

function toggleMusic(){
    if(!audio.src && songs.length) loadSong(0, true);
    else if(audio.paused){ audio.play(); setPlaying(true); }
    else { audio.pause(); setPlaying(false); }
}

function prevSong(){ loadSong(curSong - 1, !audio.paused); }
function nextSong(){ loadSong(curSong + 1, !audio.paused); }

audio.addEventListener('timeupdate', ()=>{
    if(!audio.duration) return;
    fillEl.style.width=(audio.currentTime/audio.duration*100)+'%';
    curTEl.textContent=fmt(audio.currentTime);
});
audio.addEventListener('loadedmetadata', ()=>{ totTEl.textContent=fmt(audio.duration); });
audio.addEventListener('ended', ()=>{ nextSong(); });

// تشغيل الأغنية تلقائيًا فور فتح الموقع
if(songs.length && songs[0].src){
    loadSong(0, false);
    audio.play().then(()=>{
        setPlaying(true);
    }).catch(()=>{
        // المتصفح منع التشغيل التلقائي، هتشتغل مع أول تفاعل من الزائر
        const tryPlay = ()=>{
            audio.play().then(()=> setPlaying(true)).catch(()=>{});
            document.removeEventListener('click', tryPlay);
            document.removeEventListener('touchstart', tryPlay);
        };
        document.addEventListener('click', tryPlay, { once:true });
        document.addEventListener('touchstart', tryPlay, { once:true });
    });
}

/* ===== PAGE SWITCH ===== */
function showPage(id){
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    window.scrollTo({top:0});
}
function goToPage2(){
    showPage('page2');
    setTimeout(()=>{
        const el = document.getElementById('mainContent');
        if(el) el.scrollIntoView({behavior:'smooth'});
    }, 3000);
}
function backToMemories(){
    showPage('page2');
}
function goToPage3(){
    showPage('page3');
    setTimeout(()=>{
        document.querySelectorAll('#page3 .message').forEach((m,i)=>{
            m.classList.remove('show');
            setTimeout(()=> m.classList.add('show'), i * 800);
        });
    }, 100);
}


/* ===== TYPEWRITER ===== */
const fullText = document.getElementById('hiddenMessage').textContent.trim();
const textEl   = document.getElementById('typewriterText');
const startBtn = document.getElementById('startBtn');
let idx = 0, cur = '';

function showBtn(){ startBtn.classList.add('show'); }

function typeWriter(){
    if(idx < fullText.length){
        cur += fullText.charAt(idx);
        textEl.innerHTML = cur + '<span class="cursor"></span>';
        idx++;
        const ch = fullText.charAt(idx-1);
        setTimeout(typeWriter, (ch==='،'||ch==='.'||ch==='\n') ? 300 : 40);
    } else { showBtn(); }
}

if(fullText.length > 0){
    setTimeout(typeWriter, 800);
} else {
    textEl.innerHTML = '<span class="cursor"></span>';
    showBtn();
}

/* ===== COUNTDOWN ===== */
function updateCountdown(){
    const d = Date.now() - startDate;
    document.getElementById('days').textContent    = Math.floor(d/86400000);
    document.getElementById('hours').textContent   = String(Math.floor((d%86400000)/3600000)).padStart(2,'0');
    document.getElementById('minutes').textContent = String(Math.floor((d%3600000)/60000)).padStart(2,'0');
    document.getElementById('seconds').textContent = String(Math.floor((d%60000)/1000)).padStart(2,'0');
}
updateCountdown(); setInterval(updateCountdown, 1000);

/* ===== SEEK ===== */
function seekMusic(e){
    const bar = document.getElementById('progressBar');
    if(audio.duration) audio.currentTime = (e.offsetX / bar.offsetWidth) * audio.duration;
}

/* ===== TAP CARD ===== */
const hearts = ['❤️','💗','❤️','💗'];
function tapCard(e, card){
    const rc = card.querySelector('.ripple-container');
    if(rc){
        const r = document.createElement('div');
        r.className = 'ripple';
        const rect = rc.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 1.5;
        r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px;`;
        rc.appendChild(r);
        setTimeout(()=> r.remove(), 600);
    }
    const h = document.createElement('div');
    h.className = 'heart-burst';
    h.textContent = hearts[Math.floor(Math.random()*hearts.length)];
    const crect = card.getBoundingClientRect();
    h.style.left = (e.clientX - crect.left - 11) + 'px';
    h.style.top  = (e.clientY - crect.top  - 11) + 'px';
    card.appendChild(h);
    setTimeout(()=> h.remove(), 750);
}

/* ===== LIGHTBOX ===== */
function closeLightbox(e){
    if(e.target === document.getElementById('lightbox')){
        document.getElementById('lightbox').classList.remove('open');
        document.body.style.overflow = '';
    }
}
document.addEventListener('keydown', e=>{
    if(e.key==='Escape'){
        document.getElementById('lightbox').classList.remove('open');
        document.body.style.overflow='';
    }
});

/* ===== EVENT LISTENERS ===== */
document.getElementById('startBtn').addEventListener('click', goToPage2);
document.getElementById('toPage3Btn').addEventListener('click', goToPage3);
document.getElementById('backBtn').addEventListener('click', backToMemories);
const scrollHint = document.getElementById('scrollHint');
if(scrollHint) scrollHint.addEventListener('click', ()=>{
    document.getElementById('mainContent').scrollIntoView({behavior:'smooth'});
});

// event delegation للصور
document.addEventListener('click', (e)=>{
    const card = e.target.closest('.photo-card');
    if(card) tapCard(e, card);
});


const heartIcons = ['❤️','💗','❤️','💕'];
setInterval(()=>{
    for(let i=0;i<3;i++){
        const el = document.createElement('div');
        el.className = 'float-item';
        el.textContent = heartIcons[Math.floor(Math.random()*heartIcons.length)];
        el.style.left = Math.random()*100+'%';
        el.style.fontSize = (Math.random()*14+26)+'px';
        el.style.animationDuration = (Math.random()*5+8)+'s';
        el.style.animationDelay = (Math.random()*.8)+'s';
        el.style.opacity = '0';
        document.querySelector('.floats-container').appendChild(el);
        setTimeout(()=>el.remove(), 15000);
    }
}, 600);
