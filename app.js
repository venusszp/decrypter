
(function () {
  /* ===== Canvas Living Background ===== */
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], orbs = [];
  let mouse = { x: -9999, y: -9999, vx: 0, vy: 0 };

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  canvas.addEventListener('mousemove', e => {
    mouse.vx = e.clientX - mouse.x;
    mouse.vy = e.clientY - mouse.y;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  canvas.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

  function initParticles() {
    particles = [];
    for (let i = 0; i < 180; i++) {
      particles.push({
        x: Math.random() * W, y: Math.random() * H,
        baseVx: (Math.random() - 0.5) * 0.4,
        baseVy: (Math.random() - 0.5) * 0.4,
        vx: 0, vy: 0,
        r: Math.random() * 2.2 + 0.6,
        alpha: Math.random() * 0.45 + 0.15,
        hue: 200 + Math.random() * 60,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.01 + Math.random() * 0.03,
      });
    }
  }
  initParticles();

  function initOrbs() {
    orbs = [];
    for (let i = 0; i < 4; i++) {
      orbs.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        r: 80 + Math.random() * 120,
        hue: [180, 240, 280, 320][i],
        alpha: 0.04 + Math.random() * 0.03,
      });
    }
  }
  initOrbs();

  let gridOffset = 0;
  let time = 0;

  function drawBackground() {
    time += 0.005;
    ctx.clearRect(0, 0, W, H);

    const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.8);
    grad.addColorStop(0, '#1a1a3a');
    grad.addColorStop(0.5, '#161630');
    grad.addColorStop(1, '#101025');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    orbs.forEach(o => {
      o.x += o.vx + Math.sin(time * 0.3 + o.hue) * 0.15;
      o.y += o.vy + Math.cos(time * 0.2 + o.hue) * 0.15;
      if (o.x < -200) o.x = W + 200; if (o.x > W + 200) o.x = -200;
      if (o.y < -200) o.y = H + 200; if (o.y > H + 200) o.y = -200;
      const grd = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
      grd.addColorStop(0, `hsla(${o.hue + Math.sin(time + o.hue) * 15}, 70%, 60%, ${o.alpha})`);
      grd.addColorStop(0.5, `hsla(${o.hue + Math.sin(time + o.hue) * 15}, 60%, 40%, ${o.alpha * 0.5})`);
      grd.addColorStop(1, `hsla(${o.hue + Math.sin(time + o.hue) * 15}, 50%, 20%, 0)`);
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2); ctx.fill();
    });

    ctx.strokeStyle = `hsla(220, 60%, 60%, 0.025)`; ctx.lineWidth = 1;
    gridOffset = (gridOffset + 0.1) % 70;
    for (let x = gridOffset; x < W; x += 70) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = gridOffset; y < H; y += 70) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    particles.forEach(p => {
      p.pulse += p.pulseSpeed;
      const pulseFactor = 0.7 + 0.3 * Math.sin(p.pulse);
      const dx = mouse.x - p.x, dy = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      let repForce = 0;
      if (dist < 120 && dist > 0) repForce = (120 - dist) / 120 * 0.6;

      const followX = (Math.random() - 0.5) * 0.05;
      const followY = (Math.random() - 0.5) * 0.05;

      p.vx += (p.baseVx + followX - p.vx * 0.02) * 0.03;
      p.vy += (p.baseVy + followY - p.vy * 0.02) * 0.03;

      if (dist < 120 && dist > 0) {
        p.vx -= (dx / dist) * repForce * 0.04;
        p.vy -= (dy / dist) * repForce * 0.04;
      }

      p.vx *= 0.98; p.vy *= 0.98;
      p.x += p.vx; p.y += p.vy;
      if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10; if (p.y > H + 10) p.y = -10;

      const r = p.r * pulseFactor;
      ctx.shadowColor = `hsla(${p.hue}, 70%, 70%, 0.12)`;
      ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue + Math.sin(p.pulse) * 10}, 65%, 70%, ${p.alpha * pulseFactor})`;
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.beginPath(); ctx.arc(p.x, p.y, r * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(220, 80%, 90%, ${p.alpha * 0.5 * pulseFactor})`;
      ctx.fill();
    });

    particles.forEach((a, i) => {
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          const f = 1 - dist / 140;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `hsla(${180 + f * 60}, 60%, 70%, ${0.035 * f})`;
          ctx.stroke();
        }
      }
    });

    if (mouse.x > 0 && mouse.y > 0) {
      const glow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 80);
      glow.addColorStop(0, 'rgba(140, 180, 255, 0.04)');
      glow.addColorStop(1, 'rgba(140, 180, 255, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(mouse.x, mouse.y, 80, 0, Math.PI * 2); ctx.fill();

      particles.forEach(p => {
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          ctx.beginPath(); ctx.moveTo(mouse.x, mouse.y); ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = `rgba(160, 200, 255, ${0.06 * (1 - dist / 130)})`;
          ctx.stroke();
        }
      });
    }
  }

  function animateBg() { drawBackground(); requestAnimationFrame(animateBg); }
  animateBg();
  window.addEventListener('resize', () => { resize(); initParticles(); initOrbs(); });

  /* ===== Crypto: XOR + Base64 ===== */
  function xorWithKey(text, key) {
    let result = '';
    for (let i = 0; i < text.length; i++)
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    return result;
  }

  function utf8ToBinary(str) {
    return encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
  }

  function binaryToUtf8(str) {
    return decodeURIComponent(str.split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
  }

  function encrypt(plainText, key) {
    if (!plainText) return '';
    return btoa(xorWithKey(utf8ToBinary(plainText), key));
  }

  function decrypt(cipherText, key) {
    if (!cipherText) return '';
    try { return binaryToUtf8(xorWithKey(atob(cipherText), key)); } catch { return null; }
  }

  /* ===== Sound Engine (Web Audio API) ===== */
  let audioCtx = null;

  function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function playTone(freq, duration, type, gainVal) {
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + duration);
    } catch {}
  }

  function playNoise(duration, gainVal) {
    try {
      const ctx = getAudioCtx();
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      src.connect(gain); gain.connect(ctx.destination);
      src.start(ctx.currentTime);
    } catch {}
  }

  function soundEncrypt() {
    playTone(880, 0.1, 'square', 0.08);
    setTimeout(() => playTone(1320, 0.08, 'square', 0.06), 60);
    setTimeout(() => playTone(1760, 0.12, 'sine', 0.05), 120);
    setTimeout(() => playTone(2200, 0.06, 'sine', 0.03), 200);
  }

  function soundDecrypt() {
    playTone(660, 0.1, 'square', 0.07);
    setTimeout(() => playTone(440, 0.12, 'sine', 0.06), 80);
    setTimeout(() => playTone(330, 0.08, 'sine', 0.04), 160);
  }

  function soundCopy() {
    playTone(1047, 0.06, 'sine', 0.06);
    setTimeout(() => playTone(1319, 0.08, 'sine', 0.05), 70);
    setTimeout(() => playTone(1568, 0.1, 'sine', 0.04), 140);
  }

  function soundClear() {
    playTone(180, 0.15, 'sawtooth', 0.06);
    setTimeout(() => playTone(120, 0.2, 'sawtooth', 0.05), 100);
    setTimeout(() => playTone(80, 0.25, 'sawtooth', 0.04), 220);
  }

  function soundError() {
    playTone(200, 0.12, 'square', 0.07);
    setTimeout(() => playTone(160, 0.12, 'square', 0.07), 130);
    setTimeout(() => playTone(120, 0.18, 'sawtooth', 0.06), 260);
    setTimeout(() => playTone(80, 0.25, 'sawtooth', 0.05), 400);
  }

  function soundReload() {
    playNoise(0.4, 0.035);
    playTone(300, 0.15, 'sine', 0.04);
    setTimeout(() => playTone(400, 0.12, 'sine', 0.035), 130);
    setTimeout(() => playTone(500, 0.1, 'sine', 0.03), 250);
    setTimeout(() => playTone(600, 0.08, 'sine', 0.025), 350);
  }

  function soundSuccess() {
    playTone(523, 0.1, 'sine', 0.05);
    setTimeout(() => playTone(659, 0.1, 'sine', 0.05), 100);
    setTimeout(() => playTone(784, 0.1, 'sine', 0.05), 200);
    setTimeout(() => playTone(1047, 0.2, 'sine', 0.06), 300);
  }

  /* ===== DOM refs ===== */
  const titleEl = document.getElementById('title');
  const subtitleEl = document.getElementById('subtitle');
  const keyRow = document.getElementById('keyRow');
  const outputArea = document.getElementById('outputArea');
  const inputEl = document.getElementById('input');
  const outputEl = document.getElementById('output');
  const keyEl = document.getElementById('key');
  const encryptBtn = document.getElementById('encryptBtn');
  const decryptBtn = document.getElementById('decryptBtn');
  const copyBtn = document.getElementById('copyBtn');
  const clearBtn = document.getElementById('clearBtn');
  const reloadBtn = document.getElementById('reloadBtn');
  const statusLed = document.getElementById('statusLed');
  const statusLabel = document.getElementById('statusLabel');
  const copyFeedback = document.getElementById('copyFeedback');

  /* ===== Status LED ===== */
  const LED_CLASSES = ['led-white', 'led-red', 'led-yellow', 'led-green'];
  const STATUS_TEXT = { 'led-white': 'ready', 'led-red': 'error', 'led-yellow': 'reboot', 'led-green': 'online' };

  function setLed(state) {
    LED_CLASSES.forEach(c => statusLed.classList.remove(c));
    statusLed.classList.add(state);
    statusLabel.textContent = STATUS_TEXT[state] || 'ready';
  }

  let ledBlinkTween = null;

  function blinkLedGreen() {
    if (ledBlinkTween) ledBlinkTween.kill();
    ledBlinkTween = gsap.timeline({ onComplete: () => { ledBlinkTween = null; } });
    for (let i = 0; i < 3; i++) {
      ledBlinkTween.to(statusLed, { opacity: 0.15, duration: 0.07, ease: 'power2.in' });
      ledBlinkTween.to(statusLed, { opacity: 1, duration: 0.12, ease: 'power2.out' });
    }
  }

  function startRedBlink() {
    if (ledBlinkTween) ledBlinkTween.kill();
    ledBlinkTween = gsap.timeline({ repeat: -1, repeatDelay: 0.15 });
    ledBlinkTween.to(statusLed, { opacity: 0.1, duration: 0.08, ease: 'power2.in' });
    ledBlinkTween.to(statusLed, { opacity: 1, duration: 0.08, ease: 'power2.out' });
  }

  /* ===== Typewriter ===== */
  let typewriterTimer = null;

  function typewriteText(el, text) {
    if (typewriterTimer) { clearInterval(typewriterTimer); typewriterTimer = null; }
    el.textContent = '';
    if (!text) return;
    const speed = text.length < 60 ? 12 : text.length < 200 ? 6 : 2;
    let i = 0;
    const chars = text.split('');
    typewriterTimer = setInterval(() => {
      if (i < chars.length) el.textContent += chars[i++];
      else { clearInterval(typewriterTimer); typewriterTimer = null; }
    }, speed);
  }

  /* ===== Processing state ===== */
  let isProcessing = false;
  let processingTimer = null;
  const actionBtns = [encryptBtn, decryptBtn, copyBtn];

  function setActionBtnsDisabled(disabled) {
    actionBtns.forEach(b => { b.disabled = disabled; });
  }

  function stopProcessing() {
    isProcessing = false;
    if (processingTimer) { clearTimeout(processingTimer); processingTimer = null; }
    setActionBtnsDisabled(false);
  }

  /* ===== Corrupt effect (zeros or krakozyabry) ===== */
  let savedState = null;

  function randomKrakozyabra(length) {
    const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';
    let s = '';
    for (let i = 0; i < length; i++) {
      if (Math.random() < 0.4) s += glyphs[Math.floor(Math.random() * glyphs.length)];
      else s += String.fromCharCode(0x0400 + Math.floor(Math.random() * 64));
    }
    return s;
  }

  function trigger000Effect() {
    if (processingTimer) { clearTimeout(processingTimer); processingTimer = null; }

    savedState = {
      title: titleEl.textContent, subtitle: subtitleEl.textContent,
      key: keyEl.value, input: inputEl.value, output: outputEl.textContent,
    };

    document.querySelectorAll('.btn').forEach(b => b.disabled = true);
    reloadBtn.disabled = false;

    const useKrakozyabry = Math.random() < 0.35;
    const corrupt = (n) => useKrakozyabry ? randomKrakozyabra(n) : '0'.repeat(Math.max(n, 1));

    titleEl.textContent = corrupt(titleEl.textContent.length);
    subtitleEl.textContent = corrupt(subtitleEl.textContent.length);
    keyEl.value = corrupt(Math.max(keyEl.value.length, 5));
    inputEl.value = corrupt(Math.max(inputEl.value.length, 20));
    outputEl.textContent = corrupt(Math.max(outputEl.textContent.length, 40));

    setLed('led-red');
    soundError();
    isProcessing = false;
  }

  /* ===== Reload handler with random bug ===== */
  function runSystemReset() {
    if (typewriterTimer) { clearInterval(typewriterTimer); typewriterTimer = null; }
    if (processingTimer) { clearTimeout(processingTimer); processingTimer = null; }
    if (ledBlinkTween) ledBlinkTween.kill();

    isProcessing = false;
    copyFeedback.classList.remove('show');

    if (savedState) {
      titleEl.textContent = savedState.title;
      subtitleEl.textContent = savedState.subtitle;
      keyEl.value = savedState.key;
      inputEl.value = savedState.input;
      outputEl.textContent = savedState.output;
    } else {
      inputEl.value = '';
      outputEl.textContent = '';
      keyEl.value = 'cyber';
    }
    savedState = null;

    setActionBtnsDisabled(true);
    reloadBtn.disabled = true;

    const isBuggy = Math.random() < 0.3;
    const bugCandidates = [encryptBtn, decryptBtn, copyBtn, clearBtn];
    const bugTarget = isBuggy ? bugCandidates[Math.floor(Math.random() * bugCandidates.length)] : null;

    setLed('led-yellow');
    soundReload();

    const allEls = [titleEl, subtitleEl, keyRow, inputEl, outputArea, reloadBtn, encryptBtn, decryptBtn, copyBtn, clearBtn];
    gsap.set(allEls, { opacity: 0, y: 20 });
    gsap.set(statusLed, { opacity: 1 });
    gsap.set(statusLabel, { opacity: 0, y: 0 });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.55 } });
    tl.to(titleEl, { opacity: 1, y: 0 })
      .to(subtitleEl, { opacity: 1, y: 0 }, '-=0.3')
      .to(keyRow, { opacity: 1, y: 0 }, '-=0.25')
      .to(inputEl, { opacity: 1, y: 0 }, '-=0.2')
      .to(outputArea, { opacity: 1, y: 0 }, '-=0.2')
      .to(reloadBtn, { opacity: 1, y: 0 }, '-=0.15');

    const btns = [encryptBtn, decryptBtn, copyBtn, clearBtn];
    btns.forEach((btn, idx) => {
      const isBroken = btn === bugTarget;
      tl.to(btn, {
        opacity: isBroken ? 0 : 1, y: 0, duration: 0.45, ease: 'power3.out',
        onComplete: () => {
          if (isBroken) {
            btn.disabled = true;
            btn.style.opacity = '0';
            reloadBtn.disabled = false;
            tl.clear();
            setLed('led-red');
            startRedBlink();
            soundError();
          }
        }
      }, '-=0.35');
    });

    if (!isBuggy) {
      tl.call(() => {
        setActionBtnsDisabled(false);
        reloadBtn.disabled = false;
        setLed('led-green');
        blinkLedGreen();
        soundSuccess();
      });
    } else {
      tl.call(() => {
        reloadBtn.disabled = false;
      });
    }
  }

  reloadBtn.addEventListener('click', runSystemReset);

  /* ===== Button handlers ===== */
  encryptBtn.addEventListener('click', () => {
    if (isProcessing) return;
    const key = keyEl.value || (window.CYBER_CONFIG && window.CYBER_CONFIG.cryptoKey) || "cyber";
    const text = inputEl.value;
    if (!text) { outputEl.textContent = 'Enter data to encrypt.'; return; }
    isProcessing = true;
    setActionBtnsDisabled(true);
    const result = encrypt(text, key);
    if (typewriterTimer) { clearInterval(typewriterTimer); typewriterTimer = null; }
    typewriteText(outputEl, result);
    soundEncrypt();
    setTimeout(() => { stopProcessing(); }, result.length * 2 + 100);
    gsap.timeline().to(encryptBtn, { scaleX: 0.88, scaleY: 0.88, duration: 0.06, ease: 'power2.in' }).to(encryptBtn, { scaleX: 1.04, scaleY: 1.04, duration: 0.08, ease: 'power2.out' }).to(encryptBtn, { scaleX: 1, scaleY: 1, duration: 0.12, ease: 'elastic.out(1.1, 0.3)' });
  });

  decryptBtn.addEventListener('click', () => {
    if (isProcessing) return;
    const key = keyEl.value || (window.CYBER_CONFIG && window.CYBER_CONFIG.cryptoKey) || "cyber";
    const text = inputEl.value;
    if (!text) { outputEl.textContent = 'Enter data to decrypt.'; return; }
    const result = decrypt(text, key);
    if (result === null) { outputEl.textContent = 'Decryption failed. Invalid key or data.'; soundClear(); return; }
    isProcessing = true;
    setActionBtnsDisabled(true);
    if (typewriterTimer) { clearInterval(typewriterTimer); typewriterTimer = null; }
    typewriteText(outputEl, result);
    soundDecrypt();
    setTimeout(() => { stopProcessing(); }, result.length * 2 + 100);
    gsap.timeline().to(decryptBtn, { scaleX: 0.88, scaleY: 0.88, duration: 0.06, ease: 'power2.in' }).to(decryptBtn, { scaleX: 1.04, scaleY: 1.04, duration: 0.08, ease: 'power2.out' }).to(decryptBtn, { scaleX: 1, scaleY: 1, duration: 0.12, ease: 'elastic.out(1.1, 0.3)' });
  });

  copyBtn.addEventListener('click', async () => {
    if (isProcessing) return;
    const text = outputEl.textContent;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.left = '-9999px';
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
    }
    copyFeedback.classList.remove('show');
    void copyFeedback.offsetWidth;
    copyFeedback.classList.add('show');
    setTimeout(() => copyFeedback.classList.remove('show'), 1800);
    soundCopy();
    gsap.timeline().to(copyBtn, { scaleX: 0.88, scaleY: 0.88, duration: 0.06, ease: 'power2.in' }).to(copyBtn, { scaleX: 1.04, scaleY: 1.04, duration: 0.08, ease: 'power2.out' }).to(copyBtn, { scaleX: 1, scaleY: 1, duration: 0.12, ease: 'elastic.out(1.1, 0.3)' });
  });

  clearBtn.addEventListener('click', () => {
    if (isProcessing) {
      trigger000Effect();
      return;
    }
    inputEl.value = '';
    outputEl.textContent = '';
    if (typewriterTimer) { clearInterval(typewriterTimer); typewriterTimer = null; }
    copyFeedback.classList.remove('show');
    soundClear();
    gsap.timeline().to(clearBtn, { scaleX: 0.88, scaleY: 0.88, duration: 0.06, ease: 'power2.in' }).to(clearBtn, { scaleX: 1.04, scaleY: 1.04, duration: 0.08, ease: 'power2.out' }).to(clearBtn, { scaleX: 1, scaleY: 1, duration: 0.12, ease: 'elastic.out(1.1, 0.3)' });
  });

  /* ===== Initial entrance: red -> yellow -> green ===== */
  setLed('led-red');
  gsap.set([statusLed, statusLabel], { opacity: 1 });

  const allEls = [titleEl, subtitleEl, keyRow, inputEl, outputArea, reloadBtn, encryptBtn, decryptBtn, copyBtn, clearBtn];
  gsap.set(allEls, { opacity: 0, y: 24 });

  const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.7 } });
  tl.call(() => { setLed('led-yellow'); soundReload(); }, null, '+=0.6')
    .to(titleEl, { opacity: 1, y: 0 }, '+=0.2')
    .to(subtitleEl, { opacity: 1, y: 0 }, '-=0.35')
    .to(keyRow, { opacity: 1, y: 0 }, '-=0.35')
    .to(inputEl, { opacity: 1, y: 0 }, '-=0.3')
    .to(outputArea, { opacity: 1, y: 0 }, '-=0.3')
    .to(reloadBtn, { opacity: 1, y: 0 }, '-=0.2')
    .to([encryptBtn, decryptBtn, copyBtn, clearBtn], { opacity: 1, y: 0, stagger: 0.06 }, '-=0.2')
    .call(() => {
      setLed('led-green');
      blinkLedGreen();
      soundSuccess();
    });
})();
