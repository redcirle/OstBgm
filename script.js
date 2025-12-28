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
  "请保持",
  "心脏跳动，",
  "小丑猫",
  "等着",
  "与你共鸣。"
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
resonanceButton.addEventListener("mouseenter", triggerResonanceAudio);
resonanceButton.addEventListener("click", triggerResonanceAudio);
}

resonanceAudio.addEventListener("ended", () => {
  isPlaying = false;
  resonanceButton.classList.remove("auto-hover");
  resumeAutoHover(); // 🔸播放完毕恢复轮播
});

// ✅ 自动 hover 调用时的判断逻辑
function autoHoverResonanceButton() {
  if (!isPlaying) {
    triggerResonanceAudio();
  }
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
  const rect = button.getBoundingClientRect();
  const cx = rect.left + rect.width / 2 + window.scrollX;
  const cy = rect.top + rect.height / 2 + window.scrollY;

  const portal = document.createElement("div");
  portal.className = "fx-teleport";
  portal.style.left = cx + "px";
  portal.style.top = cy + "px";
  document.body.appendChild(portal);

  button.classList.add("fx-teleport-glitch");
  window.setTimeout(() => {
    portal.remove();
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
  if (!action) return;

  // 统一：如果你在 HTML 写了 data-confetti="true"，就先放彩带（彩带可继续下落，不作为“等待完成”的阻塞项）
  if (btn.dataset.confetti === "true" && typeof window.launchSparseConfetti === "function") {
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
      const total = spawnWaveHalo(btn);
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
      teleportPulse(btn);
      await waitMs(EFFECT_TIME.teleport);
      return;
    }
    case "blackhole": {
      blackholeVortex();
      await waitMs(EFFECT_TIME.blackhole);
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

