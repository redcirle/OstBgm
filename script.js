const tagline = document.getElementById("tagline");

/**
 * ✅ 标语打字机（顿挫节奏版）
 * 目标节奏：
 *   请保持 / 心脏跳动，小丑猫 / 等着 / 与你共鸣。
 *
 * 说明：
 * - typingSpeed：单字速度
 * - microPause：每段打完后的小顿挫
 * - phrasePause：段与段之间的停顿（对应每个“/”）
 * - loopPause：整轮播放结束后，停顿再清空并重播
 */
const phraseArray = [
  "由于",
  "你的快乐，",
  "我",
  "受益良多。"
];

// 3 个“/”处停顿（ms）：请保持/心脏跳动，小丑猫/等着/与你共鸣。
const phrasePause = [200, 260, 260];

const typingSpeed = 240;
const microPause = 110;
const loopPause  = 1600;

let phraseIndex = 0;
let charIndex = 0;
let isTyping = true;

function typeWriter() {
  if (!tagline) return;

  const currentPhrase = phraseArray[phraseIndex];

  if (isTyping) {
    if (charIndex < currentPhrase.length) {
      tagline.innerHTML += currentPhrase[charIndex];
      charIndex++;
      setTimeout(typeWriter, typingSpeed);
    } else {
      // ✅ 段末微停一下（顿挫）
      isTyping = false;
      setTimeout(typeWriter, microPause);
    }
  } else {
    phraseIndex++;

    if (phraseIndex >= phraseArray.length) {
      // ✅ 一轮结束：停顿 -> 清空 -> 重播
      setTimeout(() => {
        tagline.innerHTML = "";
        phraseIndex = 0;
        charIndex = 0;
        isTyping = true;
        typeWriter(); // 关键：重新启动下一轮
      }, loopPause);
    } else {
      const pause = phrasePause[phraseIndex - 1] ?? 300;
      charIndex = 0;
      isTyping = true;
      setTimeout(typeWriter, pause);
    }
  }
}

function initSwiper() {
  window.swiper = new Swiper(".swiper-container", {
    loop: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    effect: "coverflow",
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: "auto",
    coverflowEffect: {
      rotate: 30,
      stretch: 0,
      depth: 150,
      modifier: 1,
      slideShadows: true,
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    on: {
      slideChangeTransitionStart: function () {
        document.querySelectorAll('.card-button').forEach(btn => {
          btn.classList.remove('auto-hover');
        });

        setTimeout(() => {
          const activeSlide = document.querySelector('.swiper-slide-active');
          const activeBtn = activeSlide?.querySelector('.card-button');
          if (activeBtn) {
            activeBtn.classList.add('auto-hover');
            setTimeout(() => {
              activeBtn.classList.remove('auto-hover');
            }, 1500);
          }
        }, 600);
      }
    }
  });
}

// 其他按钮逻辑不变：
function confirmAndGoXHS() {
  const confirmed = confirm("是否前往[小丑猫]小红书主页？");
  if (confirmed) {
    window.open("https://xhslink.com/m/41ZuKjemtVh", "_blank");
  }
}
function toggleQR() {
  const popup = document.getElementById("qr-popup");
  popup.style.display = popup.style.display === "flex" ? "none" : "flex";
}
function toggleWeChatPublicQR() {
  const popup = document.getElementById("wechat-public-qr-popup");
  popup.style.display = popup.style.display === "flex" ? "none" : "flex";
}

// ===================== 卡片内二维码弹窗（openQR / closeQR） =====================
// ✅ 对应 HTML 里：onclick="openQR('qr-xxx')" / onclick="closeQR('qr-xxx')"
// 仅控制指定 id 的弹窗显示/隐藏；不改动你现有的 toggleQR / toggleWeChatPublicQR 等逻辑。
function openQR(popupId) {
  const popup = document.getElementById(popupId);
  if (!popup) {
    console.warn("openQR: element not found ->", popupId);
    return;
  }
  popup.style.display = "flex";

  // ✅ 打开弹窗时暂停卡片轮播
  if (window.swiper && window.swiper.autoplay) {
    window.swiper.autoplay.stop();
  }
}

function closeQR(popupId) {
  const popup = document.getElementById(popupId);
  if (!popup) {
    console.warn("closeQR: element not found ->", popupId);
    return;
  }
  popup.style.display = "none";

  // ✅ 关闭弹窗后：先“动一下”让你立刻感觉轮播恢复，再启动自动轮播计时
  if (window.swiper) {
    try {
      // 立刻推进一张（给用户即时反馈，避免看起来“卡住”）
      window.swiper.slideNext(450);
    } catch (e) {}
  }

  // ✅ 恢复自动轮播（注意：start() 会从一个完整 delay 开始计时）
  if (window.swiper && window.swiper.autoplay) {
    window.swiper.autoplay.start();
  }
}

function confirmAndMail() {
  const confirmed = confirm("是否跳转到邮件应用？");
  if (confirmed) {
    window.location.href = "mailto:hello@joker.red";
  }
}
function toggleSecondQR() {
  const popup = document.getElementById("second-qr-popup");
  popup.style.display = popup.style.display === "flex" ? "none" : "flex";
}
function toggleThirdQR() {
  const popup = document.getElementById("third-qr-popup");
  if (!popup) {
    console.warn("toggleThirdQR: element #third-qr-popup not found");
    return;
  }
  popup.style.display = popup.style.display === "flex" ? "none" : "flex";
}
function isWeChatBrowser() {
  const ua = window.navigator.userAgent.toLowerCase();
  return ua.includes("micromessenger");
}
let autoHoverIntervalId = null;
let isAutoHoverPaused = false;
let lastButton = null;

function startAutoHoverFooterButtons(interval = 1600) {
  const buttons = Array.from(document.querySelectorAll('.footer-button'));

  function cycleHover() {
    if (isAutoHoverPaused) return;

    if (lastButton) lastButton.classList.remove('auto-hover');

    const candidates = buttons.filter(btn => btn !== lastButton && !(btn.id === "resonance-button" && isPlaying));
    const nextButton = candidates[Math.floor(Math.random() * candidates.length)];

    if (nextButton.id === "resonance-button") {
      autoHoverResonanceButton();
    } else {
      nextButton.classList.add('auto-hover');
    }

    lastButton = nextButton;
  }

  autoHoverIntervalId = setInterval(cycleHover, interval);
}

function pauseAutoHover() {
  isAutoHoverPaused = true;
}

function resumeAutoHover() {
  isAutoHoverPaused = false;
}
function confirmAndGoWeibo() {
  const confirmed = confirm("是否前往[小丑猫]微博主页？");
  if (confirmed) {
    window.open("https://weibo.com/u/7999616775", "_blank");
  }
}
// 与你共鸣按钮音频控制
const resonanceButton = document.getElementById("resonance-button");
const resonanceAudio = document.getElementById("tagline-audio");
let isPlaying = false;

function triggerResonanceAudio() {
  if (!resonanceButton || !resonanceAudio) return;
  if (!isPlaying && resonanceAudio) {
    isPlaying = true;
    resonanceAudio.currentTime = 0;
    resonanceAudio.play().catch(e => {
      console.warn("播放失败:", e);
    });
    resonanceButton.classList.add("auto-hover");
    pauseAutoHover(); // 🔸播放语音时暂停自动轮播
  }
}

if (resonanceButton) {
resonanceButton.addEventListener("click", triggerResonanceAudio);
}

resonanceAudio.addEventListener("ended", () => {
  isPlaying = false;
  resonanceButton.classList.remove("auto-hover");
  resumeAutoHover(); // 🔸播放完毕恢复轮播
});

// ✅ 自动 hover 调用时的判断逻辑
function autoHoverResonanceButton() {
  // 自动 hover 只做视觉，不播放语音（点击仍可播放）
  if (resonanceButton) resonanceButton.classList.add("auto-hover");
}

window.addEventListener("load", () => {
  if (!window.__typewriterStarted) { window.__typewriterStarted = true; typeWriter(); }

const images = document.querySelectorAll(".swiper-slide img");
  let loaded = 0;

  function checkAndInit() {
    loaded++;
    if (loaded === images.length) {
      initSwiper();
    }
  }
  images.forEach((img) => {
    if (img.complete) {
      checkAndInit();
    } else {
      img.onload = checkAndInit;
      img.onerror = checkAndInit;
    }
  });

  if (images.length === 0) {
    initSwiper();
  }

  startAutoHoverFooterButtons(1600);
});

// === Click to play & resume autohover (non-intrusive helper) ===
(function () {
  var btn = document.getElementById('resonance-button');
  var audio = document.getElementById('tagline-audio');
  if (!btn || !audio) return;

  function syntheticHover(el) {
    try {
      ['mouseenter','mouseover'].forEach(function(type){
        var ev = new Event(type, { bubbles: true, cancelable: true });
        el.dispatchEvent(ev);
      });
    } catch (_) {}
  }

  function clearAutoHoverClasses() {
    try {
      document.querySelectorAll('.auto-hover').forEach(function(n){ n.classList.remove('auto-hover'); });
    } catch (_) {}
  }

  function nextFooterButton(fromEl) {
    var list = Array.prototype.slice.call(document.querySelectorAll('.footer-button'));
    if (!list.length) return null;
    var idx = list.indexOf(fromEl);
    if (idx < 0) idx = -1;
    return list[(idx + 1) % list.length];
  }

  function resumeAutoHover() {
    var next = nextFooterButton(btn);
    if (!next) return;
    clearAutoHoverClasses();
    // small delay to let click styles settle
    setTimeout(function(){
      // mark next as auto-hover target
      next.classList.add('auto-hover');
      syntheticHover(next);
    }, 80);
  }

  btn.addEventListener('click', function () {
    // user gesture: play audio then resume autohover
    try {
      audio.currentTime = 0;
      var p = audio.play();
      if (p && typeof p.then === 'function') {
        p.catch(function(e){ /* swallow to avoid unhandled rejection */ });
      }
    } catch(_) {}

    resumeAutoHover();
  }, false);
})();


// ===================== 稀疏彩带（Confetti）点击触发 =====================
// ✅ 目标：
// - 从顶部飘落（像你发的成就彩带截图）
// - 彩带在二维码弹窗前面飘过（但不挡任何点击/扫码）
// - 只改 HTML 即可给任意按钮加触发：添加 data-confetti="true"
//
// 使用方式（HTML）：
//   <a ... data-confetti="true" ...>按钮</a>
//
// 说明：
// - 不改你的 CSS；canvas 的样式在这里内联设置
// - 播放完会自动清理 canvas，不常驻占资源

let __confettiCanvas = null;
let __confettiInstance = null;
let __confettiBusy = false;

function __ensureConfetti() {
  // canvas-confetti CDN 未加载时，直接跳过，不影响任何既有功能
  if (typeof window.confetti !== 'function') return null;

  if (__confettiInstance && __confettiCanvas) return __confettiInstance;

  const c = document.createElement('canvas');
  c.setAttribute('aria-hidden', 'true');
  c.style.position = 'fixed';
  c.style.left = '0';
  c.style.top = '0';
  c.style.width = '100%';
  c.style.height = '100%';
  c.style.pointerEvents = 'none';
  // ✅ 尽量高，确保在二维码弹窗前面
  c.style.zIndex = '2000';
  document.body.appendChild(c);

  __confettiCanvas = c;
  __confettiInstance = window.confetti.create(c, { resize: true, useWorker: true });
  return __confettiInstance;
}

function launchSparseConfetti() {
  const conf = __ensureConfetti();
  if (!conf || __confettiBusy) return;

  __confettiBusy = true;

  // ✅ 让彩带“真正落下来”：喷射时间和清理时间分开控制
  // - sprayDuration：持续生成新彩带的时间（稀疏飘落）
  // - cleanupDelay：停止喷射后，留给彩带落到底部并自然消失的缓冲时间
  const sprayDuration = 3000; // ✅ 喷射时间（ms）
  const cleanupDelay  = 7000; // ✅ 停止喷射后继续存在的时间（ms）
  const colors = ["#ff4d4f", "#ff9f0a", "#ffd60a", "#30d158", "#64d2ff", "#5e5ce6"];

  // ✅ 稀疏：用定时器而不是每帧喷，避免过密/过耗
  const timer = setInterval(() => {
    conf({
      particleCount: 420,      // ✅ 更稀疏
      startVelocity: 30,      // ✅ 更像“飘落”
      spread: 60,
      gravity: 1.1,         // ✅ 下降更慢，能看见落下过程
      ticks: 260,            // ✅ 粒子存活更久（避免半路消失）
      scalar: 0.9,
      shapes: ['square'],
      colors,
      origin: { x: Math.random(), y: -0.08 }
    });
  }, 160);

  setTimeout(() => {
    clearInterval(timer);
    // ✅ 结束：给粒子足够时间落完，再清理
    setTimeout(() => {
      try { conf.reset(); } catch (_) {}
      if (__confettiCanvas && __confettiCanvas.parentNode) {
        __confettiCanvas.parentNode.removeChild(__confettiCanvas);
      }
      __confettiCanvas = null;
      __confettiInstance = null;
      __confettiBusy = false;
    }, cleanupDelay);
  }, sprayDuration);
}

// ✅ 事件委托：以后你只改 HTML，加 data-confetti="true" 就能触发
// 用捕获阶段，确保就算按钮里有 inline onclick / confirm，也能先触发彩带
document.addEventListener('click', function (e) {
  const el = e.target && e.target.closest ? e.target.closest('[data-confetti="true"]') : null;
  if (!el) return;
  launchSparseConfetti();
}, true);



// ===================== 卡片内按钮：动作系统（不影响页脚按钮） =====================
// 用法（HTML 给卡片内 <a class="card-button"> 添加）：
//   data-action="obi-audio" data-audio="audio/obi.wav" data-confetti="true"
//   data-action="wave" data-confetti="true"
//   data-action="spotlight"
//   data-action="liquidflash"
//   data-action="pixelscan" data-scan-target=".swiper-container"

/* ===================== SFX Module (WebAudio synth) =====================
   目标：不引入外部音频文件，为以下动作提供合成音效
   - plasma-arc: 电弧嗡鸣 + 轻微噼啪
   - procedural-lightning: 高频瞬态裂响
   - perlin-distortion: 数字 glitch 噪声
   - teleport: 空间抽离 / 吸入声
   - pixelscan: CRT 扫描脉冲
   说明：所有 SFX 都是“非阻塞”的（不影响你现有动效/跳页逻辑）
======================================================================= */
window.SFX = (function () {
  let ctx = null;
  let master = null;
  let unlocked = false;

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();

      master = ctx.createGain();
      master.gain.value = 0.55; // 总音量（你后续可调）
      master.connect(ctx.destination);
    }
    return ctx;
  }

  // 在首次用户手势里调用，解锁 iOS/Safari 的 AudioContext
  async function unlock() {
    const c = ensure();
    if (!c) return;
    if (c.state === "suspended") {
      try { await c.resume(); } catch (_) {}
    }
    // 轻触发一个零音量的短 tone，确保真正“解锁”
    if (!unlocked) {
      try {
        const o = c.createOscillator();
        const g = c.createGain();
        g.gain.value = 0.0001;
        o.frequency.value = 220;
        o.connect(g);
        g.connect(master);
        o.start();
        o.stop(c.currentTime + 0.02);
      } catch (_) {}
      unlocked = true;
    }
  }

  function now() {
    return (ctx || ensure()) ? ctx.currentTime : 0;
  }

  function envGain(time, attack, hold, release, peak) {
    const c = ensure();
    if (!c) return null;
    const g = c.createGain();
    const t0 = time;
    const a = Math.max(0.001, attack || 0.001);
    const h = Math.max(0, hold || 0);
    const r = Math.max(0.001, release || 0.05);
    const p = Math.max(0.0001, peak || 0.4);

    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(p, t0 + a);
    if (h > 0) g.gain.setValueAtTime(p, t0 + a + h);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + h + r);
    return g;
  }

  function makeNoiseBuffer(durationSec) {
    const c = ensure();
    if (!c) return null;
    const sr = c.sampleRate;
    const len = Math.max(1, Math.floor(sr * durationSec));
    const buf = c.createBuffer(1, len, sr);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1);
    return buf;
  }

  function playNoiseBurst(time, dur, hpHz, lpHz, peak) {
    const c = ensure();
    if (!c) return;
    const src = c.createBufferSource();
    src.buffer = makeNoiseBuffer(dur);

    const hp = c.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = hpHz || 1200;

    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = lpHz || 10000;

    const g = envGain(time, 0.002, Math.max(0, dur - 0.01), 0.02, peak || 0.25);

    src.connect(hp);
    hp.connect(lp);
    lp.connect(g);
    g.connect(master);

    src.start(time);
    src.stop(time + dur);
  }

  // 轻量“软剪裁”，让噪声更像电子设备的失真
  function makeSoftClipper(amount) {
    const c = ensure();
    if (!c) return null;
    const ws = c.createWaveShaper();
    const k = Math.max(1, amount || 25);
    const n = 1024;
    const curve = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const x = (i * 2) / (n - 1) - 1;
      curve[i] = ((1 + k) * x) / (1 + k * Math.abs(x));
    }
    ws.curve = curve;
    ws.oversample = "2x";
    return ws;
  }

  /* -------------------- 1) plasma-arc -------------------- */
  function plasmaArc() {
    const c = ensure();
    if (!c) return;
    unlock();

    const t0 = now();
    const dur = 0.9;

    // 主嗡鸣：双振荡器 + 带通
    const o1 = c.createOscillator();
    const o2 = c.createOscillator();
    o1.type = "sawtooth";
    o2.type = "triangle";
    o1.frequency.setValueAtTime(86, t0);
    o2.frequency.setValueAtTime(172, t0);

    // 轻微不稳定（模拟电弧抖动）
    const lfo = c.createOscillator();
    const lfoG = c.createGain();
    lfo.type = "sine";
    lfo.frequency.value = 8.5;
    lfoG.gain.value = 6.5; // Hz
    lfo.connect(lfoG);
    lfoG.connect(o1.frequency);
    lfoG.connect(o2.frequency);

    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 260;
    bp.Q.value = 0.9;

    const clip = makeSoftClipper(18);

    const g = envGain(t0, 0.01, dur - 0.04, 0.06, 0.22);

    o1.connect(bp);
    o2.connect(bp);
    bp.connect(clip);
    clip.connect(g);
    g.connect(master);

    lfo.start(t0);
    o1.start(t0);
    o2.start(t0);

    o1.stop(t0 + dur);
    o2.stop(t0 + dur);
    lfo.stop(t0 + dur);

    // 轻微噼啪：随机短噪声脉冲
    const crackleCount = 5 + Math.floor(Math.random() * 4);
    for (let i = 0; i < crackleCount; i++) {
      const tt = t0 + 0.06 + Math.random() * (dur - 0.18);
      const dd = 0.008 + Math.random() * 0.018;
      playNoiseBurst(tt, dd, 2500 + Math.random() * 2500, 12000, 0.18 + Math.random() * 0.12);
    }
  }

  /* -------------------- 2) procedural-lightning -------------------- */
  function proceduralLightning() {
    const c = ensure();
    if (!c) return;
    unlock();

    const t0 = now();
    const dur = 0.12 + Math.random() * 0.06;

    // 主裂响：高通噪声极短 burst
    playNoiseBurst(t0, dur * 0.55, 4200 + Math.random() * 2500, 14000, 0.34);

    // 叠一条高频“尖啸”瞬态（像击穿瞬间）
    const o = c.createOscillator();
    o.type = "sine";
    const g = envGain(t0, 0.001, 0.01, 0.06, 0.18);
    o.frequency.setValueAtTime(8200 + Math.random() * 1200, t0);
    o.frequency.exponentialRampToValueAtTime(2600 + Math.random() * 400, t0 + 0.05);

    o.connect(g);
    g.connect(master);

    o.start(t0);
    o.stop(t0 + 0.08);

  // 追加“电流滋滋”尾音：带通噪声 + 轻微抖动（让紫色等离子更像电流）
    // （保持瞬态裂响为主，但补上持续电流质感）
    const tailDur = 0.20 + Math.random() * 0.10;
    // 中高频带通：1.2k ~ 7k，幅度较小但可感知
    playNoiseBurst(t0 + 0.015, tailDur, 1200 + Math.random() * 300, 7000 + Math.random() * 1200, 0.14);

  }

  /* -------------------- 3) perlin-distortion (glitch) -------------------- */
  function perlinDistortion() {
    const c = ensure();
    if (!c) return;
    unlock();

    const t0 = now();
    const dur = 0.55 + Math.random() * 0.25;

    // 噪声底：带通 + 软剪裁
    const src = c.createBufferSource();
    src.buffer = makeNoiseBuffer(dur);

    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 2200 + Math.random() * 1800;
    bp.Q.value = 1.2;

    const clip = makeSoftClipper(32);

    // “数字断续”：方波门控
    const gate = c.createGain();
    gate.gain.value = 0;

    const gateLfo = c.createOscillator();
    gateLfo.type = "square";
    gateLfo.frequency.value = 28 + Math.random() * 32;

    const gateDepth = c.createGain();
    gateDepth.gain.value = 0.5;
    gateLfo.connect(gateDepth);
    gateDepth.connect(gate.gain);

    const g = envGain(t0, 0.008, dur - 0.05, 0.08, 0.22);

    src.connect(bp);
    bp.connect(clip);
    clip.connect(gate);
    gate.connect(g);
    g.connect(master);

    gateLfo.start(t0);
    src.start(t0);
    src.stop(t0 + dur);
    gateLfo.stop(t0 + dur);

    // 叠少量随机 click（更像 glitch）
    const clicks = 6 + Math.floor(Math.random() * 6);
    for (let i = 0; i < clicks; i++) {
      const tt = t0 + Math.random() * (dur * 0.9);
      playNoiseBurst(tt, 0.006 + Math.random() * 0.01, 7000, 16000, 0.12 + Math.random() * 0.10);
    }
  }

  /* -------------------- 4) teleport (suction/inhale) -------------------- */
  function teleport() {
    const c = ensure();
    if (!c) return;
    unlock();

    const t0 = now();
    const dur = 0.75 + Math.random() * 0.25;

    // 主“吸入”扫频：锯齿 + 低通向下扫
    const o = c.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(260, t0);
    o.frequency.exponentialRampToValueAtTime(60, t0 + dur);

    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(1800, t0);
    lp.frequency.exponentialRampToValueAtTime(260, t0 + dur);
    lp.Q.value = 0.7;

    const g = envGain(t0, 0.02, dur - 0.08, 0.12, 0.20);

    o.connect(lp);
    lp.connect(g);
    g.connect(master);

    o.start(t0);
    o.stop(t0 + dur);

    // 叠一层“空气抽离”噪声：高通 + 反向包络感（快速起，慢慢吸走）
    playNoiseBurst(t0, dur * 0.55, 900, 7000, 0.14);

    // 末端轻微“收束”click
    playNoiseBurst(t0 + dur - 0.06, 0.03, 2500, 12000, 0.16);
  }

  /* -------------------- 5) pixelscan (CRT scan pulse) -------------------- */
  
  /* -------------------- Extra) wave (Join in) -------------------- */
  function waveHalo() {
    const c = ensure();
    if (!c) return;
    unlock();

    const t0 = now();
    const dur = 0.28 + Math.random() * 0.10;

    // 轻微“涌动/涟漪”音：柔和上滑的正弦 + 一点点空气噪声
    const o = c.createOscillator();
    o.type = "sine";
    const g = envGain(t0, 0.003, 0.06, dur * 0.55, 0.0001);
    o.frequency.setValueAtTime(260 + Math.random() * 40, t0);
    o.frequency.exponentialRampToValueAtTime(620 + Math.random() * 80, t0 + dur * 0.55);

    o.connect(g);
    g.connect(master);
    o.start(t0);
    o.stop(t0 + dur);

    // 空气感：低幅度带通噪声，模拟“水波丝”扩散的沙沙感
    playNoiseBurst(t0 + 0.01, dur * 0.75, 600, 4200, 0.06);
  }

function pixelScan() {
    const c = ensure();
    if (!c) return;
    unlock();

    const t0 = now();

    // 三连“扫描脉冲”
    const pulses = 3;
    for (let i = 0; i < pulses; i++) {
      const tt = t0 + i * 0.11;

      // 轻脉冲 tone（像 CRT 扫描线扫过）
      const o = c.createOscillator();
      o.type = "sine";
      const g = envGain(tt, 0.0015, 0.02, 0.05, 0.14);
      o.frequency.setValueAtTime(1450 + Math.random() * 120, tt);
      o.frequency.exponentialRampToValueAtTime(620 + Math.random() * 80, tt + 0.06);

      o.connect(g);
      g.connect(master);
      o.start(tt);
      o.stop(tt + 0.09);

      // 叠一点点噪声“扫描沙沙”
      playNoiseBurst(tt, 0.03, 1800, 9000, 0.09);
    }
  }

  

  // 🍄 蘑菇弹爆炸（纯代码合成，无需 wav）
  function mushroomBomb() {
    const c = ensure();
    if (!c) return;
    unlock();

    const t0 = now();

    // 1) 主爆炸：长噪声 + 低通扫频（闷爆 → 低频尾音）
    const seconds = 1.25;
    const frames = Math.floor(c.sampleRate * seconds);
    const buf = c.createBuffer(1, frames, c.sampleRate);
    const d = buf.getChannelData(0);

    // 带一点“瞬态”的衰减噪声，让爆炸更像冲击波
    for (let i = 0; i < frames; i++) {
      const k = i / frames;
      const env = Math.pow(1 - k, 2.2);
      d[i] = (Math.random() * 2 - 1) * env;
    }

    const noise = c.createBufferSource();
    noise.buffer = buf;

    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.Q.value = 0.7;
    lp.frequency.setValueAtTime(1900, t0);
    lp.frequency.exponentialRampToValueAtTime(140, t0 + seconds);

    const g = c.createGain();
    g.gain.setValueAtTime(0.0008, t0);
    g.gain.exponentialRampToValueAtTime(1.0, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0008, t0 + seconds);

    noise.connect(lp);
    lp.connect(g);
    g.connect(master);

    noise.start(t0);
    noise.stop(t0 + seconds);

    // 2) 低频冲击：三角波下扫（地面震动）
    const sub = c.createOscillator();
    sub.type = "triangle";
    sub.frequency.setValueAtTime(72, t0);
    sub.frequency.exponentialRampToValueAtTime(24, t0 + seconds);

    const subG = c.createGain();
    subG.gain.setValueAtTime(0.85, t0);
    subG.gain.exponentialRampToValueAtTime(0.0008, t0 + seconds);

    sub.connect(subG);
    subG.connect(master);
    sub.start(t0);
    sub.stop(t0 + seconds);

    // 3) 火花/碎裂：短促高频噪声 burst（增强“爆炸颗粒感”）
    for (let i = 0; i < 10; i++) {
      const tt = t0 + 0.03 + Math.random() * 0.22;
      playNoiseBurst(tt, 0.02 + Math.random() * 0.03, 1800, 12000, 0.10 + Math.random() * 0.06);
    }

    // 4) 远处回响：更低、更短的尾巴（像蘑菇云扩散后的“闷轰”）
    const tail = c.createOscillator();
    tail.type = "sine";
    tail.frequency.setValueAtTime(46, t0 + 0.08);
    tail.frequency.exponentialRampToValueAtTime(18, t0 + 0.95);

    const tailG = c.createGain();
    tailG.gain.setValueAtTime(0.35, t0 + 0.08);
    tailG.gain.exponentialRampToValueAtTime(0.0008, t0 + 1.05);

    tail.connect(tailG);
    tailG.connect(master);
    tail.start(t0 + 0.08);
    tail.stop(t0 + 1.08);
  }
return {
    unlock,
    plasmaArc,
    proceduralLightning,
    perlinDistortion,
    teleport,
    pixelScan,
    mushroomBomb,
    waveHalo,
  };
})();


(function initCardButtonActions() {
  const audioCache = new Map();

  // ===================== 统一管理所有特效时长（只改这里即可） =====================
  const EFFECT_TIME = {
    joinInRipple: 3600,      // Join in 彩虹水波丝扩散（越大越慢）
    pressStartNeon: 2600,    // PRESS START 舞厅霓虹闪烁
    liquidFlash: 900,        // Your move 液态玻璃闪光
    pixelScan: 1400,         // Play Me / INSERT COIN / CONTINUE 扫描像素解构
    laser: 1200,             // laser 激光
    teleport: 1200,          // teleport 传送门
    blackhole: 1800          // blackhole 黑洞漩涡
  };


  function playAudio(src) {
  // 统一的“播完再继续”Promise：用于欧比/未来所有语音按钮
  if (!src) return Promise.resolve();

  let a = audioCache.get(src);
  if (!a) {
    a = new Audio(src);
    a.preload = "auto";
    audioCache.set(src, a);
  }

  return new Promise((resolve) => {
    const done = () => resolve();

    const onEnded = () => done();
    const onError = () => done();

    // 用 once 避免重复绑定
    a.addEventListener("ended", onEnded, { once: true });
    a.addEventListener("error", onError, { once: true });

    try {
      a.currentTime = 0;
      const p = a.play();
      if (p && typeof p.catch === "function") {
        p.catch((e) => {
          console.warn("Audio play blocked (needs user gesture) or failed:", e);
          done();
        });
      }
    } catch (e) {
      console.warn("Audio play blocked (needs user gesture) or failed:", e);
      done();
    }
  });
}

  function spawnWaveHalo(button) {
  // Join in：彩虹“水波丝”一圈一圈向外扩散（石头入水）
  const rect = button.getBoundingClientRect();
  const cx = rect.left + rect.width / 2 + window.scrollX;
  const cy = rect.top + rect.height / 2 + window.scrollY;

  const rings = 5;              // 一次点击生成几圈水波（越多越“波纹”）
  const ringDelay = 340;        // 每圈的延迟（ms）——决定“圈圈”的节奏
  const dur = EFFECT_TIME.joinInRipple;

  for (let i = 0; i < rings; i++) {
    const ripple = document.createElement("div");
    ripple.className = "fx-rainbow-ripple";
    ripple.style.left = cx + "px";
    ripple.style.top = cy + "px";
    ripple.style.setProperty("--fx-dur", dur + "ms");
    ripple.style.setProperty("--fx-delay", (i * ringDelay) + "ms");
    document.body.appendChild(ripple);

    window.setTimeout(() => ripple.remove(), dur + i * ringDelay + 220);
  }

  return dur + (rings - 1) * ringDelay; // 告诉外层：这个效果大概多久算“完成”
}

// ===================== Join in：炸弹(蘑菇云)特效 =====================
// 设计目标：像微信“炸弹表情”那种爽感，但不破坏页面结构（只做视觉层覆盖）
// - 抛出：从按钮中心飞到“卡片中心偏下”
// - 爆炸：闪白 + 火花 + 蘑菇云(自下而上烟柱 + 云盖扩散)
// - 性能：轻量粒子数量 + 单次 RAF + 自动清理，避免卡死
function mushroomBombFX(button) {
  const rect = button.getBoundingClientRect();

  // 起点：按钮中心（视口坐标）
  const sx = rect.left + rect.width / 2;
  const sy = rect.top + rect.height / 2;

  // 终点：该按钮所在 slide/card 的中心偏下（更像“从卡片里扔出来并在卡片里炸”）
  const slide = button.closest(".swiper-slide") || button.closest(".card-content") || button.parentElement;
  const srect = slide ? slide.getBoundingClientRect() : rect;
  const tx = srect.left + srect.width / 2;
  const ty = srect.top + srect.height * 0.62;

  // Overlay 容器（不会阻挡点击）
  const wrap = document.createElement("div");
  wrap.className = "fx-bomb-wrap";
  wrap.style.cssText = "position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;z-index:9999;";
  document.body.appendChild(wrap);

  // 炸弹小球（更大一些）
  const bomb = document.createElement("div");
  bomb.className = "fx-bomb-ball";
  bomb.style.cssText = `
    position:absolute;
    width:34px;height:34px;border-radius:999px;
    left:${sx - 17}px; top:${sy - 17}px;
    background: radial-gradient(circle at 35% 35%, rgba(255,255,255,.95), rgba(180,180,255,.15) 38%, rgba(90,0,180,.55) 70%, rgba(10,10,10,.9) 100%);
    box-shadow: 0 0 18px rgba(160,80,255,.55), 0 0 32px rgba(255,255,255,.12);
    transform: translateZ(0);
  `;
  wrap.appendChild(bomb);

  // Canvas：火花 + 烟雾（同一张画布，避免多层重绘）
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.floor(window.innerWidth * (window.devicePixelRatio || 1)));
  c.height = Math.max(1, Math.floor(window.innerHeight * (window.devicePixelRatio || 1)));
  c.style.cssText = "position:absolute;left:0;top:0;width:100%;height:100%;";
  wrap.appendChild(c);

  const ctx = c.getContext("2d");
  const dpr = window.devicePixelRatio || 1;

  // 轻量粒子：火花
  const sparks = [];
  const smoke = [];

  function spawnExplosion(px, py) {
    // 闪白（短促曝光）
    const flash = document.createElement("div");
    flash.style.cssText = `position:absolute;left:${px}px;top:${py}px;width:18px;height:18px;border-radius:999px;
      transform:translate(-50%,-50%);
      background:radial-gradient(circle, rgba(255,255,255,.95) 0%, rgba(255,255,255,.45) 25%, rgba(255,255,255,0) 70%);
      filter: blur(0px);`;
    wrap.appendChild(flash);
    flash.animate([
      { transform:"translate(-50%,-50%) scale(1)", opacity:1 },
      { transform:"translate(-50%,-50%) scale(14)", opacity:0 }
    ], { duration: 180, easing: "cubic-bezier(.2,.9,.2,1)", fill:"forwards" });

    // 屏幕“扰动感”震动：改为 Perlin Distortion 风格（更像数字扰动/扭曲），不改你的其它逻辑
    // 用现有 FXCanvas.perlinDistortion 做短促 burst，并临时调整参数（结束后恢复）
    try {
      if (window.FXCanvas && typeof window.FXCanvas.perlinDistortion === "function") {
        const targetEl = document.querySelector(".swiper-container") || document.body;
        const cfg = window.FXCanvas.config && window.FXCanvas.config.perlinDistortion;
        if (cfg) {
          const old = { ...cfg };
          cfg.duration = 260;     // 更短：贴合“炸开”瞬间
          cfg.wobble = 14;        // 位移扰动幅度
          cfg.intensity = 1.2;    // blur 强度
          cfg.grain = Math.max(cfg.grain || 0.18, 0.28);
          window.FXCanvas.perlinDistortion(targetEl).finally(() => Object.assign(cfg, old));
        } else {
          window.FXCanvas.perlinDistortion(targetEl);
        }
      }
    } catch (e) {}
// 火花粒子（数量受控）
    const n = 46;
    for (let i=0;i<n;i++){
      const a = Math.random()*Math.PI*2;
      const sp = 180 + Math.random()*420;
      sparks.push({
        x:px, y:py,
        vx: Math.cos(a)*sp,
        vy: Math.sin(a)*sp - (140+Math.random()*180),
        life: 420 + Math.random()*260,
        r: 1.2 + Math.random()*1.8
      });
    }

    // 蘑菇云：先“烟柱”上升，再“云盖”扩散
    // 烟柱（自下而上）
    const stem = 12;
    for (let i=0;i<stem;i++){
      smoke.push({
        kind:"stem",
        x:px + (Math.random()*14-7),
        y:py + (Math.random()*8-4),
        vx:(Math.random()*24-12),
        vy:-(120 + Math.random()*160),
        life: 900 + Math.random()*260,
        age:0,
        size: 18 + Math.random()*12
      });
    }
    // 云盖（上升后横向扩散）
    const cap = 10;
    for (let i=0;i<cap;i++){
      smoke.push({
        kind:"cap",
        x:px + (Math.random()*18-9),
        y:py - (60 + Math.random()*40),
        vx:(Math.random()*160-80),
        vy:-(40 + Math.random()*40),
        life: 980 + Math.random()*280,
        age:0,
        size: 28 + Math.random()*18
      });
    }
  }

  // CSS 注入：轻震
  (function ensureShakeCSS(){
    if (document.getElementById("fx-shake-style")) return;
    const st = document.createElement("style");
    st.id = "fx-shake-style";
    st.textContent = `
      .fx-shake { animation: fx_shake 220ms linear; }
      @keyframes fx_shake {
        0%{ transform: translate3d(0,0,0); }
        20%{ transform: translate3d(-2px,1px,0); }
        40%{ transform: translate3d(2px,-1px,0); }
        60%{ transform: translate3d(-1px,-2px,0); }
        80%{ transform: translate3d(1px,2px,0); }
        100%{ transform: translate3d(0,0,0); }
      }`;
    document.head.appendChild(st);
  })();

  // 轨迹：二次贝塞尔（抛物线）
  const tStart = performance.now();
  const throwDur = 420;   // 抛投时间
  const totalDur = 1300;  // 总时长（爆炸+烟雾尾巴）
  const cx = (sx + tx)/2 + (Math.random()*40-20);
  const cy = Math.min(sy, ty) - (140 + Math.random()*90); // 抛物线顶点更高一点

  let exploded = false;

  function bez(t, p0, p1, p2){
    const u = 1-t;
    return u*u*p0 + 2*u*t*p1 + t*t*p2;
  }

  function draw(nowMs){
    const t = nowMs - tStart;

    // 清屏（用轻微残影让烟更柔，不要累积太多）
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,window.innerWidth,window.innerHeight);

    // 抛投阶段
    if (t <= throwDur) {
      const tt = t/throwDur;
      const x = bez(tt, sx, cx, tx);
      const y = bez(tt, sy, cy, ty);
      bomb.style.left = (x - 17) + "px";
      bomb.style.top  = (y - 17) + "px";
    } else if (!exploded) {
      exploded = true;
      bomb.remove();
      spawnExplosion(tx, ty);
    }

    // 更新火花
    for (let i=sparks.length-1;i>=0;i--){
      const p = sparks[i];
      p.life -= 16.7;
      p.vy += 720 * (16.7/1000); // 重力
      p.x += p.vx * (16.7/1000);
      p.y += p.vy * (16.7/1000);
      const a = Math.max(0, Math.min(1, p.life/520));
      ctx.globalAlpha = a;
      ctx.beginPath();
      ctx.fillStyle = "rgba(255,220,180,1)";
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();
      if (p.life <= 0) sparks.splice(i,1);
    }

    // 更新烟雾（自下而上 + 云盖扩散）
    for (let i=smoke.length-1;i>=0;i--){
      const s = smoke[i];
      s.age += 16.7;
      const k = s.age / s.life;
      s.x += s.vx * (16.7/1000);
      s.y += s.vy * (16.7/1000);

      // 烟柱：越往上越散
      let size = s.size * (s.kind==="stem" ? (1 + k*1.8) : (1 + k*2.2));
      // 云盖：横向扩散更明显
      if (s.kind==="cap") size *= (1 + k*0.9);

      const alpha = (1-k) * (s.kind==="stem" ? 0.22 : 0.18);
      ctx.globalAlpha = Math.max(0, alpha);

      // 颜色：偏灰紫，符合你的“紫色等离子世界观”
      const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, size);
      grad.addColorStop(0, "rgba(240,240,255,0.55)");
      grad.addColorStop(0.35, "rgba(170,140,255,0.22)");
      grad.addColorStop(1, "rgba(30,20,40,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(s.x, s.y, size, 0, Math.PI*2);
      ctx.fill();

      if (s.age >= s.life) smoke.splice(i,1);
    }

    ctx.globalAlpha = 1;

    // 收尾：到时清理
    if (t < totalDur) {
      requestAnimationFrame(draw);
    } else {
      wrap.remove();
    }
  }

  requestAnimationFrame(draw);

  return totalDur;
}



  let spotlightEl = null;
  let spotlightRAF = null;

  
// ===================== PRESS START：舞厅霓虹灯闪烁（全屏叠加层） =====================
function ensureNeon() {
  let el = document.getElementById("fx-neon");
  if (el) return el;

  el = document.createElement("div");
  el.id = "fx-neon";
  el.className = "fx-neon";
  el.innerHTML = `
    <div class="fx-neon__v"></div>
    <div class="fx-neon__h"></div>
    <div class="fx-neon__pulse"></div>
  `;
  document.body.appendChild(el);
  return el;
}

function startNeon(durationMs) {
  const el = ensureNeon();
  el.classList.add("is-on");
  window.setTimeout(() => el.classList.remove("is-on"), durationMs);
}

// ===================== laser：一束激光从按钮射出 =====================
function laserBurstFrom(button) {
  const rect = button.getBoundingClientRect();
  const x1 = rect.left + rect.width / 2;
  const y1 = rect.top + rect.height / 2;

  const angle = Math.random() * Math.PI * 2;
  const radius = Math.max(window.innerWidth, window.innerHeight) * (0.55 + Math.random() * 0.35);
  const x2 = x1 + Math.cos(angle) * radius;
  const y2 = y1 + Math.sin(angle) * radius;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const deg = Math.atan2(dy, dx) * 180 / Math.PI;

  const beam = document.createElement("div");
  beam.className = "fx-laser";
  beam.style.left = (x1 + window.scrollX) + "px";
  beam.style.top = (y1 + window.scrollY) + "px";
  beam.style.width = len + "px";
  beam.style.transform = `rotate(${deg}deg)`;
  document.body.appendChild(beam);

  window.setTimeout(() => beam.remove(), EFFECT_TIME.laser + 120);
}

// ===================== teleport：传送门 + 按钮轻微“故障闪烁” =====================
function teleportPulse(button) {
  // INSERT COIN：保留“plus/其它”效果与按钮 glitch，但取消彩虹传送门外扩散（fx-teleport）
  button.classList.add("fx-teleport-glitch");
  window.setTimeout(() => {
    button.classList.remove("fx-teleport-glitch");
  }, EFFECT_TIME.teleport + 120);
}

// ===================== blackhole：屏幕中心生成黑洞漩涡 =====================
function blackholeVortex() {
  let v = document.getElementById("fx-blackhole");
  if (!v) {
    v = document.createElement("div");
    v.id = "fx-blackhole";
    v.className = "fx-blackhole";
    document.body.appendChild(v);
  }
  v.classList.remove("is-on");
  void v.offsetWidth;
  v.classList.add("is-on");

  window.setTimeout(() => v.classList.remove("is-on"), EFFECT_TIME.blackhole + 120);
}

function ensureSpotlight() {
    if (spotlightEl) return spotlightEl;
    spotlightEl = document.createElement("div");
    spotlightEl.className = "fx-spotlight";
    document.body.appendChild(spotlightEl);
    return spotlightEl;
  }

  function startSpotlight(button, ms = 2000) {
    const el = ensureSpotlight();
    el.classList.add("is-on");

    const endAt = performance.now() + ms;

    const tick = () => {
      const now = performance.now();
      const r = button.getBoundingClientRect();
      const x = r.left + r.width / 2;
      const y = r.top + r.height / 2;

      el.style.setProperty("--x", `${x}px`);
      el.style.setProperty("--y", `${y}px`);

      if (now < endAt) {
        spotlightRAF = requestAnimationFrame(tick);
      } else {
        el.classList.remove("is-on");
        spotlightRAF = null;
      }
    };

    if (spotlightRAF) cancelAnimationFrame(spotlightRAF);
    spotlightRAF = requestAnimationFrame(tick);
  }

  let liquidEl = null;
  function liquidFlash() {
  if (!liquidEl) {
    liquidEl = document.createElement("div");
    liquidEl.className = "fx-liquid-flash";
    document.body.appendChild(liquidEl);
  }

  liquidEl.style.setProperty("--fx-dur", EFFECT_TIME.liquidFlash + "ms");

  // 重新触发动画
  liquidEl.classList.remove("run");
  void liquidEl.offsetWidth;
  liquidEl.classList.add("run");

  window.setTimeout(() => liquidEl.classList.remove("run"), EFFECT_TIME.liquidFlash + 50);
}

  let scanEl = null;
  let scanTimer = null;
  function pixelScan(targetSelector) {
    const t = EFFECT_TIME.pixelScan;
    const target = document.querySelector(targetSelector) || document.body;
    const r = target.getBoundingClientRect();

    if (!scanEl) {
      scanEl = document.createElement("div");
      scanEl.className = "fx-pixel-scan";
      document.body.appendChild(scanEl);
    }

    scanEl.style.left = `${r.left}px`;
    scanEl.style.top = `${r.top}px`;
    scanEl.style.width = `${r.width}px`;
    scanEl.style.height = `${r.height}px`;

    scanEl.classList.remove("run");
    void scanEl.offsetWidth;
    scanEl.classList.add("run");

    // 目标区域“被解构成像素”再恢复（视觉化、低成本）
    target.classList.add("fx-scan-target");
    if (scanTimer) clearTimeout(scanTimer);
    scanTimer = setTimeout(() => target.classList.remove("fx-scan-target"), t);
  }

  function waitMs(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, Math.max(0, ms || 0)));
}

async function runCardAction(btn) {
  const action = (btn.dataset.action || "").trim();
    // 🔊 Unlock WebAudio context on first user gesture
    try { window.SFX && window.SFX.unlock(); } catch (e) {}

  if (!action) return;

  // 统一：如果你在 HTML 写了 data-confetti="true"，就先放彩带（彩带可继续下落，不作为“等待完成”的阻塞项）
  if (btn.dataset.confetti === "true" && action !== "wave" && typeof window.launchSparseConfetti === "function") {
    window.launchSparseConfetti();
  }

  // 每个 action 返回一个“完成时刻”
  switch (action) {
    case "obi-audio": {
      // ✅ 语音类：必须等音频播完才算完成
      await playAudio(btn.dataset.audio);
      return;
    }
    case "wave": {
      // ✅ Join in：映射为“炸弹(蘑菇云)”特效；并且明确禁用该按钮的彩带/波纹
      try { window.SFX && window.SFX.mushroomBomb && window.SFX.mushroomBomb(); } catch (e) {}

      const total = mushroomBombFX(btn);
      await waitMs(total);
      return;
    }
    case "spotlight": {
      // 你目前用 spotlight 触发的是“霓虹/舞厅效果”（保持你现有实现）
      startNeon(EFFECT_TIME.pressStartNeon);
      await waitMs(EFFECT_TIME.pressStartNeon);
      return;
    }
    case "pressstart": {
      startNeon(EFFECT_TIME.pressStartNeon);
      await waitMs(EFFECT_TIME.pressStartNeon);
      return;
    }
    case "liquidflash": {
      liquidFlash();
      await waitMs(EFFECT_TIME.liquidFlash);
      return;
    }
    case "pixelscan": {
      // 🔊 SFX
      try { window.SFX && window.SFX.pixelScan(); } catch (e) {}

      pixelScan(btn.dataset.scanTarget || ".swiper-container");
      await waitMs(EFFECT_TIME.pixelScan);
      return;
    }
    case "laser": {
      laserBurstFrom(btn);
      await waitMs(EFFECT_TIME.laser);
      return;
    }
    case "teleport": {
      // 🔊 SFX
      try { window.SFX && window.SFX.teleport(); } catch (e) {}

      teleportPulse(btn);
      await waitMs(EFFECT_TIME.teleport);
      return;
    }
    case "blackhole": {
      blackholeVortex();
      await waitMs(EFFECT_TIME.blackhole);
      return;
    }
    
case "plasma-arc": {
      // 🔊 SFX
      try { window.SFX && window.SFX.plasmaArc(); } catch (e) {}

  // ✅ Canvas 特效：等待绘制完成再算完成
  if (typeof FXCanvas !== "undefined" && typeof FXCanvas.plasmaArc === "function") {
    await FXCanvas.plasmaArc(btn);
  } else {
    await waitMs(900);
  }
  return;
}
case "procedural-lightning": {
      // 🔊 SFX
      try { window.SFX && window.SFX.plasmaArc(); } catch (e) {}

  if (typeof FXCanvas !== "undefined" && typeof FXCanvas.proceduralLightning === "function") {
    await FXCanvas.proceduralLightning(btn);
  } else {
    await waitMs(650);
  }
  return;
}
case "perlin-distortion": {
      // 🔊 SFX
      try { window.SFX && window.SFX.perlinDistortion(); } catch (e) {}

  const sel = btn.dataset.scanTarget || ".swiper-container";
  const target = document.querySelector(sel) || null;
  if (typeof FXCanvas !== "undefined" && typeof FXCanvas.perlinDistortion === "function") {
    await FXCanvas.perlinDistortion(target);
  } else {
    await waitMs(900);
  }
  return;
}
default:
      return;
  }
}

  // ✅ 只拦截“卡片内按钮”且带 data-action 的元素，不影响页脚按钮/外链按钮
  document.addEventListener(
  "click",
  async (e) => {
    const btn = e.target.closest(".swiper-slide .card-button");
    if (!btn) return;

    const action = (btn.dataset.action || "").trim();
    if (!action) return;

    e.preventDefault();

    // ✅ 所有按钮：等效果“完成”后再滑到下一张
    await runCardAction(btn);

    // 只控制轮播卡片，不影响页脚按钮/外链按钮
    if (window.swiper) {
      try {
        window.swiper.slideNext(450);
      } catch (err) {}
    }
  },
  true
);
})();


// ✅ Fix: make inline onclick handlers work reliably
try {
  window.confirmAndGoXHS = confirmAndGoXHS;
  window.toggleWeChatPublicQR = toggleWeChatPublicQR;
  window.confirmAndMail = confirmAndMail;
  window.confirmAndGoWeibo = confirmAndGoWeibo;
  window.toggleQR = toggleQR;
  window.toggleSecondQR = toggleSecondQR;
  window.toggleThirdQR = toggleThirdQR;
  window.openQR = openQR;
  window.closeQR = closeQR;

  // （可选）如果你未来想在控制台手动触发：launchSparseConfetti()
  window.launchSparseConfetti = launchSparseConfetti;
} catch (e) {
  console.warn("Export functions to window failed:", e);
}


// ===================== OstBgm Canvas FX Engine =====================
// 说明：只新增一个透明 canvas 层，不影响页面布局/点击（CSS 里 pointer-events:none）
// 你可以在 FXCanvas.config 里微调每种动效的强度/速度/时长
const FXCanvas = (function(){
  const api = {};
  const config = {
    // Plasma Arc：电弧环绕按钮
    plasmaArc: {
      duration: 900,
      rings: 2,
      radiusPad: 14,     // 电弧离按钮边缘的距离
      jitter: 10,        // 抖动幅度（越大越“电”）
      lineWidth: 2.2,
      glow: 26,
      alpha: 0.65
    },
    // Procedural Lightning：从顶部劈向按钮附近（或屏幕上方）
    proceduralLightning: {
      duration: 650,
      segments: 18,
      spread: 26,
      forks: 2,          // 分叉次数
      forkSpread: 18,
      lineWidth: 2.6,
      glow: 30,
      alpha: 0.75
    },
    // Perlin Noise Distortion：短暂的噪声扭曲/抖动（低成本“扰动”）
    perlinDistortion: {
      duration: 950,
      intensity: 0.85,   // 0.3~1.2
      grain: 0.18,       // 颗粒透明度
      wobble: 10         // 抖动幅度（px）
    }
  };

  let canvas=null, ctx=null, raf=0;

  function ensure(){
    if (canvas && ctx) return true;
    canvas = document.getElementById('fx-canvas');
    if (!canvas) return false;
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    return true;
  }

  function resize(){
    if(!canvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    if (ctx) ctx.setTransform(dpr,0,0,dpr,0,0);
  }

  function clear(){
    if(!ctx) return;
    ctx.clearRect(0,0,window.innerWidth,window.innerHeight);
  }

  function stop(){
    if(raf) cancelAnimationFrame(raf);
    raf = 0;
    clear();
  }

  function now(){ return performance.now(); }

  function getButtonCenter(el){
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width/2, y: r.top + r.height/2, w:r.width, h:r.height };
  }

  // ---- Plasma Arc ----
  
// ---- Plasma Arc ----
// 每次调用都会随机形态/粗细/抖动，返回 Promise（用于“等动效结束再滑动”）
function plasmaArc(el){
  if(!ensure()) return Promise.resolve();
  stop();
  const t0 = now();
  const c = getButtonCenter(el);
  const radiusBase = Math.max(c.w, c.h)/2 + config.plasmaArc.radiusPad;

  // ✅ 每次触发随机化（在 config 基础上做可控浮动）
  const duration = Math.max(420, config.plasmaArc.duration * (0.75 + Math.random()*0.7));
  const rings    = Math.max(1, Math.round(config.plasmaArc.rings + (Math.random()>0.6 ? 1 : 0) - (Math.random()>0.85 ? 1 : 0)));
  const jitter   = Math.max(4,  config.plasmaArc.jitter   * (0.65 + Math.random()*1.1));
  const lineW    = Math.max(1.2,config.plasmaArc.lineWidth* (0.7  + Math.random()*1.0));
  const glow     = Math.max(10, config.plasmaArc.glow     * (0.65 + Math.random()*1.0));
  const alpha    = Math.min(0.95, Math.max(0.25, config.plasmaArc.alpha * (0.7 + Math.random()*0.8)));

  return new Promise((resolve)=>{
    function draw(){
      const t = now() - t0;
      const p = Math.min(1, t / duration);
      clear();

      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.shadowBlur = glow;
      ctx.shadowColor = 'rgba(197,140,255,1)';

      for(let k=0;k<rings;k++){
        ctx.beginPath();
        // 每圈用不同的相位，让形状更不一样
        const phase = Math.random()*Math.PI*2;
        for(let a=0; a<=Math.PI*2+0.001; a+=0.22){
          const j = (Math.sin(a*3 + phase) + (Math.random()-0.5)*2) * 0.5 * jitter;
          const r = radiusBase + k*6 + j;
          const x = c.x + Math.cos(a)*r;
          const y = c.y + Math.sin(a)*r;
          if(a===0) ctx.moveTo(x,y);
          else ctx.lineTo(x,y);
        }
        ctx.strokeStyle = `rgba(200,120,255,${alpha*(1-p)})`;
        ctx.lineWidth = lineW * (0.85 + Math.random()*0.4);
        ctx.stroke();
      }

      ctx.restore();

      if(p < 1){
        raf = requestAnimationFrame(draw);
      }else{
        stop();
        resolve();
      }
    }
    draw();
  });
}


  // ---- Procedural Lightning ----
  
// ---- Procedural Lightning ----
// 每次调用随机粗细/分段/分叉等，返回 Promise
function proceduralLightning(el){
  if(!ensure()) return Promise.resolve();
  stop();
  const t0 = now();
  const c = el ? getButtonCenter(el) : {x: window.innerWidth*0.5, y: window.innerHeight*0.5};

  // ✅ 每次触发随机化（在 config 基础上做可控浮动）
  const duration = Math.max(360, config.proceduralLightning.duration * (0.75 + Math.random()*0.8));
  const segments = Math.max(10,  Math.round(config.proceduralLightning.segments * (0.75 + Math.random()*0.9)));
  const spread   = Math.max(10,  config.proceduralLightning.spread * (0.65 + Math.random()*1.2));
  const lineW    = Math.max(1.2, config.proceduralLightning.lineWidth * (0.7 + Math.random()*1.1));
  const glow     = Math.max(10,  config.proceduralLightning.glow * (0.6 + Math.random()*1.2));
  const forks    = Math.max(0,   Math.round(config.proceduralLightning.forks + (Math.random()>0.55?1:0) - (Math.random()>0.85?1:0)));
  const forkSpread = Math.max(8, config.proceduralLightning.forkSpread * (0.7 + Math.random()*1.3));

  const start = { x: c.x + (Math.random()-0.5)*40, y: -20 };
  const end   = { x: c.x + (Math.random()-0.5)*28, y: c.y };

  function buildBolt(s,e,seg,sp){
    const pts = [{x:s.x,y:s.y}];
    for(let i=1;i<seg;i++){
      const k = i/seg;
      const x = s.x + (e.x - s.x)*k + (Math.random()-0.5)*sp;
      const y = s.y + (e.y - s.y)*k + (Math.random()-0.5)*sp*0.35;
      pts.push({x,y});
    }
    pts.push({x:e.x,y:e.y});
    return pts;
  }

  function drawPolyline(pts, alpha, width, blur){
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.shadowBlur = blur;
    ctx.shadowColor = 'rgba(197,140,255,1)';
    ctx.strokeStyle = `rgba(200,120,255,${alpha})`;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for(let i=1;i<pts.length;i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
    ctx.restore();
  }

  return new Promise((resolve)=>{
    function draw(){
      const t = now() - t0;
      const p = Math.min(1, t/duration);
      clear();

      const flick = 0.75 + Math.random()*0.45;
      const main = buildBolt(start,end,segments,spread);

      // 主线：外晕 + 内核
      drawPolyline(main, 0.42*(1-p)*flick, lineW*2.2, glow*1.1);
      drawPolyline(main, 0.95*(1-p)*flick, lineW, glow*0.6);

      // 分叉：数量/角度随机
      for(let f=0; f<forks; f++){
        const idx = 4 + Math.floor(Math.random()*(main.length-8));
        const s = main[idx];
        const e = {
          x: s.x + (Math.random()-0.5)*forkSpread*3.2,
          y: s.y + 60 + Math.random()*140
        };
        const fork = buildBolt(s,e, Math.max(6, Math.round(segments*0.35)), forkSpread);
        drawPolyline(fork, 0.35*(1-p)*flick, lineW*0.7, glow*0.75);
      }

      if(p<1) raf=requestAnimationFrame(draw);
      else { stop(); resolve(); }
    }
    draw();
  });
}


  // ---- Perlin-ish Distortion (low-cost) ----
  
// ---- Perlin Distortion ----
// 保持现有视觉，但返回 Promise（用于“等动效结束再滑动”）
function perlinDistortion(targetEl){
  if(!ensure()) return Promise.resolve();
  stop();
  const t0 = now();
  const duration = config.perlinDistortion.duration;
  const wobble = config.perlinDistortion.wobble;
  const intensity = config.perlinDistortion.intensity;

  // 目标区域：默认整屏（你也可以传入 .swiper-container）
  const rect = targetEl ? targetEl.getBoundingClientRect() : {left:0,top:0,width:window.innerWidth,height:window.innerHeight};

  return new Promise((resolve)=>{
    function draw(){
      const t = now()-t0;
      const p = Math.min(1, t/duration);

      clear();

      // 1) 画噪声“薄雾”层（模拟噪声扰动）
      const step = 10;
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = config.perlinDistortion.grain*(1-p);
      for(let y=rect.top; y<rect.top+rect.height; y+=step){
        for(let x=rect.left; x<rect.left+rect.width; x+=step){
          const n = (Math.sin((x+y+t*0.6)*0.02) + Math.sin((x*0.7-t)*0.03))*0.5;
          if(n>0.25){
            ctx.fillStyle = `rgba(200,120,255,${0.14 + n*0.08})`;
            ctx.fillRect(x,y,step,step);
          }
        }
      }
      ctx.restore();

      // 2) 目标区域轻微“扭曲/抖动”
      if(targetEl){
        const dx = Math.sin(t*0.02)*wobble*(1-p);
        const dy = Math.cos(t*0.018)*wobble*(1-p);
        targetEl.style.transform = `translate(${dx}px, ${dy}px)`;
        targetEl.style.filter = `blur(${intensity*(1-p)}px)`;
      }

      if(p<1){
        raf = requestAnimationFrame(draw);
      }else{
        if(targetEl){
          targetEl.style.transform = '';
          targetEl.style.filter = '';
        }
        stop();
        resolve();
      }
    }
    draw();
  });
}


  api.config = config;
  api.stop = stop;
  api.plasmaArc = plasmaArc;
  api.proceduralLightning = proceduralLightning;
  api.perlinDistortion = perlinDistortion;
  return api;
})();
window.FXCanvas = FXCanvas;
// =================== End Canvas FX Engine ===================

// ===================== Canvas FX action bindings =====================
