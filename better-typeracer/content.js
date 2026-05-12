(() => {
    "use strict";

    if (window.__typeracerUltraV6) return;
    window.__typeracerUltraV6 = true;

    const STORAGE_KEY = "trUltraV6Settings";

    const DEFAULTS = {
        hideOpponents: true,
        showOwnWPM: true,
        showOwnAvatar: false,
        hideOwnProgressLine: true,
        showScoreboard: true,

        centerLayout: true,
        layoutShiftY: 0,
        minimalMode: false,

        timerScale: 0.62,
        timerOpacity: 0.72,
        timerTop: 12,
        timerRight: 12,

        textSize: 1.55,
        inputSize: 1.15,

        font: "JetBrains Mono",

        background: "nebula",
        backgroundMotion: 58,
        backgroundIntensity: 1.0,

        accent: "gold",

        blur: 22,
        cardOpacity: 0.48,

        showProgressBar: true,
        progressBarHeight: 10,
        progressBarOpacity: 0.85,
        progressBarGlow: 0.95,

        compactCards: true
    };

    const ACCENTS = {
        gold: ["#ffd54f", "#ff9f43"],
        violet: ["#c084fc", "#7c3aed"],
        ice: ["#7dd3fc", "#38bdf8"],
        mint: ["#86efac", "#22c55e"],
        red: ["#fb7185", "#ef4444"]
    };

    let settings = load();
    let styleEl;
    let observer;
    let ownWpmTimer;
    let progressTimer;

    function load() {
        try {
            return {
                ...DEFAULTS,
                ...(JSON.parse(localStorage.getItem(STORAGE_KEY)) || {})
            };
        } catch {
            return { ...DEFAULTS };
        }
    }

    function save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }

    function injectStyles() {
        styleEl = document.createElement("style");
        styleEl.id = "tr-ultra-v6-style";

        styleEl.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&family=Fira+Code:wght@400;700&family=Space+Grotesk:wght@400;700&family=Outfit:wght@400;700&display=swap');

        :root{
            --bg:#04060b;
            --surface:rgba(12,16,24,.46);
            --surface2:rgba(12,16,24,.68);
            --border:rgba(255,255,255,.10);
            --text:#f4f7fb;
            --muted:rgba(255,255,255,.62);

            --accent:#ffd54f;
            --accent2:#ff9f43;

            --font:'JetBrains Mono', monospace;
            --text-size:1.55rem;
            --input-size:1.15rem;
            --layout-shift-y:0px;
            --bg-intensity:1;
            --bg-motion:58;
            --progress-height:10px;
            --progress-opacity:.85;
            --progress-glow:.95;
        }

        html,body{
            min-height:100%;
            background:var(--bg) !important;
            color:var(--text) !important;
            overflow-x:hidden !important;
        }

        body{
            position:relative;
            background:#04060b !important;
        }

        body.tr-ultra-active{
            background:
                radial-gradient(circle at 20% 20%, rgba(124,58,237,.12), transparent 35%),
                radial-gradient(circle at 80% 18%, rgba(14,165,233,.08), transparent 32%),
                radial-gradient(circle at 60% 80%, rgba(34,197,94,.06), transparent 36%),
                #04060b !important;
        }

        body.tr-ultra-active::before{
            content:"";
            position:fixed;
            inset:0;
            z-index:0;
            pointer-events:none;
            background:radial-gradient(circle at 50% 50%, transparent 40%, rgba(0,0,0,.36) 100%);
        }

        /* ACHTERGROND via alleen #tr-bg */
        #tr-bg{
            position:fixed !important;
            inset:0 !important;
            z-index:0 !important;
            pointer-events:none !important;
            overflow:hidden !important;
            background:#04060b !important;
        }

        #tr-bg::before,
        #tr-bg::after{
            content:"";
            position:absolute;
            inset:-10%;
            pointer-events:none;
        }

        .tr-layer{
            position:absolute;
            width:140vmax;
            height:140vmax;
            border-radius:50%;
            filter:blur(120px);
            opacity:calc(.22 * var(--bg-intensity));
            animation:trFloat 22s ease-in-out infinite alternate;
            mix-blend-mode:screen;
            will-change:transform;
        }

        .tr-layer.a{ top:-30%; left:-22%; background:#7c3aed; }
        .tr-layer.b{ bottom:-42%; right:-22%; background:#0ea5e9; animation-duration:28s; }
        .tr-layer.c{ top:18%; left:34%; background:#22c55e; animation-duration:34s; }

        @keyframes trFloat{
            0%{ transform:translate3d(-2%, -1%, 0) scale(1); }
            100%{ transform:translate3d(4%, 2%, 0) scale(1.12); }
        }

        /* ---- BACKGROUND THEMES ---- */
        body.tr-bg-nebula #tr-bg{
            background:
                radial-gradient(circle at 18% 18%, rgba(168,85,247,.22), transparent 26%),
                radial-gradient(circle at 82% 22%, rgba(34,197,94,.10), transparent 22%),
                radial-gradient(circle at 55% 72%, rgba(14,165,233,.18), transparent 28%),
                linear-gradient(180deg, #050711 0%, #060913 45%, #03040a 100%) !important;
        }
        body.tr-bg-nebula #tr-bg::before{
            background:
                radial-gradient(circle at 25% 20%, rgba(124,58,237,.18), transparent 18%),
                radial-gradient(circle at 78% 35%, rgba(56,189,248,.16), transparent 22%),
                radial-gradient(circle at 50% 80%, rgba(16,185,129,.12), transparent 24%);
            filter:blur(70px);
            animation:trDrift 20s ease-in-out infinite alternate;
            opacity: calc(.95 * var(--bg-intensity));
        }

        body.tr-bg-grid #tr-bg{
            background:linear-gradient(180deg, #04060b 0%, #050913 60%, #03040a 100%) !important;
        }
        body.tr-bg-grid #tr-bg::before{
            background:
                linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px),
                radial-gradient(circle at 25% 30%, rgba(14,165,233,.16), transparent 20%),
                radial-gradient(circle at 72% 65%, rgba(168,85,247,.16), transparent 24%);
            background-size: 64px 64px, 64px 64px, auto, auto;
            opacity: calc(.55 * var(--bg-intensity));
            mask-image: radial-gradient(circle at center, black 30%, transparent 100%);
        }
        body.tr-bg-grid #tr-bg::after{
            background:
                linear-gradient(120deg, transparent 30%, rgba(56,189,248,.16) 45%, transparent 60%),
                linear-gradient(300deg, transparent 35%, rgba(124,58,237,.12) 52%, transparent 68%);
            filter:blur(18px);
            transform:translateX(-8%);
            animation:trScan 16s linear infinite;
            opacity: calc(.85 * var(--bg-intensity));
        }

        body.tr-bg-stars #tr-bg{
            background:
                radial-gradient(circle at 50% 10%, rgba(255,255,255,.04), transparent 20%),
                radial-gradient(circle at 25% 80%, rgba(14,165,233,.10), transparent 26%),
                radial-gradient(circle at 78% 72%, rgba(236,72,153,.10), transparent 24%),
                #04060b !important;
        }
        body.tr-bg-stars #tr-bg::before{
            background:
                radial-gradient(circle, rgba(255,255,255,.9) 0 1px, transparent 1.5px),
                radial-gradient(circle, rgba(255,255,255,.55) 0 1px, transparent 1.5px),
                radial-gradient(circle, rgba(255,255,255,.35) 0 1px, transparent 1.5px);
            background-size: 160px 160px, 220px 220px, 300px 300px;
            background-position: 0 0, 40px 20px, 100px 60px;
            opacity: calc(.32 * var(--bg-intensity));
        }
        body.tr-bg-stars #tr-bg::after{
            background:
                radial-gradient(circle at 25% 22%, rgba(56,189,248,.16), transparent 20%),
                radial-gradient(circle at 70% 35%, rgba(168,85,247,.16), transparent 24%),
                radial-gradient(circle at 55% 78%, rgba(34,197,94,.10), transparent 22%);
            filter:blur(80px);
            opacity: calc(.95 * var(--bg-intensity));
            animation:trDrift 24s ease-in-out infinite alternate;
        }

        /* Black (moving stars) */
        body.tr-bg-black #tr-bg{
            background: #000000 !important;
        }
        body.tr-bg-black #tr-bg::before{
            content:"";
            position:absolute;
            inset:0;
            background:
                radial-gradient(1px 1px at 20% 15%, #fff, rgba(0,0,0,0)),
                radial-gradient(1px 1px at 40% 45%, #fff, rgba(0,0,0,0)),
                radial-gradient(1.5px 1.5px at 65% 25%, #fff, rgba(0,0,0,0)),
                radial-gradient(1px 1px at 25% 70%, #fff, rgba(0,0,0,0)),
                radial-gradient(1.5px 1.5px at 55% 60%, #fff, rgba(0,0,0,0)),
                radial-gradient(1px 1px at 80% 40%, #fff, rgba(0,0,0,0)),
                radial-gradient(2px 2px at 10% 55%, #fff, rgba(0,0,0,0)),
                radial-gradient(1px 1px at 70% 80%, #fff, rgba(0,0,0,0)),
                radial-gradient(1.5px 1.5px at 45% 15%, #fff, rgba(0,0,0,0)),
                radial-gradient(2px 2px at 90% 65%, #fff, rgba(0,0,0,0));
            background-size: 300px 300px;
            background-repeat: repeat;
            opacity: calc(.7 * var(--bg-intensity));
            animation: trStarMove 60s linear infinite;
        }
        @keyframes trStarMove{
            0%{ transform: translateY(0px) }
            100%{ transform: translateY(-300px) }
        }

        body.tr-bg-storm #tr-bg{
            background:linear-gradient(180deg, #04060b 0%, #050913 45%, #020308 100%) !important;
        }
        body.tr-bg-storm #tr-bg::before{
            background:
                linear-gradient(110deg, transparent 40%, rgba(56,189,248,.18) 50%, transparent 60%),
                linear-gradient(250deg, transparent 44%, rgba(239,68,68,.18) 52%, transparent 64%),
                radial-gradient(circle at 50% 50%, rgba(14,165,233,.08), transparent 40%);
            filter:blur(16px);
            animation:trScan 12s linear infinite;
            opacity: calc(.85 * var(--bg-intensity));
        }
        body.tr-bg-storm #tr-bg::after{
            background:
                radial-gradient(circle at 16% 28%, rgba(14,165,233,.18), transparent 18%),
                radial-gradient(circle at 82% 22%, rgba(236,72,153,.16), transparent 20%),
                radial-gradient(circle at 50% 82%, rgba(34,197,94,.08), transparent 22%);
            filter:blur(90px);
            animation:trDrift 18s ease-in-out infinite alternate;
            opacity: calc(1 * var(--bg-intensity));
        }

        body.tr-bg-ember #tr-bg{
            background:
                radial-gradient(circle at 20% 20%, rgba(251,113,133,.18), transparent 24%),
                radial-gradient(circle at 80% 24%, rgba(249,115,22,.14), transparent 22%),
                radial-gradient(circle at 58% 78%, rgba(168,85,247,.12), transparent 26%),
                #04060b !important;
        }
        body.tr-bg-ember #tr-bg::before{
            background:
                radial-gradient(circle at 30% 32%, rgba(251,113,133,.18), transparent 16%),
                radial-gradient(circle at 73% 58%, rgba(249,115,22,.16), transparent 18%),
                radial-gradient(circle at 50% 82%, rgba(168,85,247,.12), transparent 22%);
            filter:blur(70px);
            animation:trDrift 22s ease-in-out infinite alternate;
            opacity: calc(.98 * var(--bg-intensity));
        }

        body.tr-bg-void #tr-bg{
            background:linear-gradient(180deg, #04060b 0%, #04060b 100%) !important;
        }
        body.tr-bg-void #tr-bg::before{
            background:
                radial-gradient(circle at 20% 20%, rgba(124,58,237,.12), transparent 16%),
                radial-gradient(circle at 80% 70%, rgba(14,165,233,.10), transparent 18%),
                radial-gradient(circle at 45% 55%, rgba(255,255,255,.02), transparent 30%);
            filter:blur(90px);
            opacity: calc(.9 * var(--bg-intensity));
        }

        @keyframes trDrift{
            0%{ transform:translate3d(-2%, -1%, 0) scale(1); }
            100%{ transform:translate3d(4%, 2%, 0) scale(1.08); }
        }

        @keyframes trScan{
            0%{ transform:translateX(-8%) rotate(0deg); }
            100%{ transform:translateX(8%) rotate(0deg); }
        }

        /* LAYOUT */
        .ie-fixMinHeight,
        .flex-wrapper,
        .container,
        .main,
        .themeContent,
        #dUI,
        .mainViewportHolder,
        .mainViewport,
        .gameView,
        .podContainer,
        .view{
            position:relative !important;
            z-index:1 !important;
        }

        .themeHeader,
        .newNorthWidget,
        .newWestWidget,
        .newEastWidget,
        .newSouthWidget,
        .statsView,
        .sidebarBlocks,
        .podContainer.statsView,
        .createAccountLeaderboardPrompt,
        #footer,
        #offcanvas,
        .mobile-menu-trigger,
        .mobileNav,
        .embedded_ad_wrapper,
        [id*="playwire_ad"]{
            display:none !important;
        }

        .flex-wrapper.play,
        .main,
        .themeContent,
        .mainViewportHolder{
            background:transparent !important;
        }

        .mainViewportHolder{
            display:flex !important;
            justify-content:center !important;
            align-items:center !important;
            min-height:calc(100vh - 130px) !important;
            padding:28px 0 44px !important;
        }

        .mainViewport{
            width:min(1100px, 94vw) !important;
            margin:0 auto !important;
            transform:translateY(var(--layout-shift-y)) !important;
        }

        .mainViewport .chrome_m,
        .gameView,
        .podContainer.medium{
            background:rgba(10,14,22,var(--card-opacity)) !important;
            border:1px solid var(--border) !important;
            border-radius:30px !important;
            padding:22px !important;
            backdrop-filter:blur(var(--blur)) saturate(115%) !important;
            box-shadow:
                0 18px 60px rgba(0,0,0,.55),
                inset 0 1px 0 rgba(255,255,255,.04) !important;
            position:relative !important;
            overflow:hidden !important;
        }

        .mainViewport .chrome_m::before,
        .gameView::before,
        .podContainer.medium::before{
            content:"";
            position:absolute;
            inset:0;
            border-radius:inherit;
            padding:1px;
            background:linear-gradient(135deg, rgba(255,255,255,.10), transparent 32%, rgba(255,255,255,.03));
            -webkit-mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
            -webkit-mask-composite:xor;
            pointer-events:none;
        }

        /* TIMER */
        .timeDisplay{
            position:fixed !important;
            top:var(--timer-top) !important;
            right:var(--timer-right) !important;
            transform:scale(var(--timer-scale)) !important;
            transform-origin:top right !important;
            opacity:var(--timer-opacity) !important;
            z-index:99999 !important;
            pointer-events:none !important;
        }

        .timeDisplay .time{
            background:rgba(12,16,24,.55) !important;
            border:1px solid rgba(255,255,255,.08) !important;
            border-radius:999px !important;
            padding:8px 14px !important;
            font-size:1rem !important;
            color:rgba(255,255,255,.90) !important;
            font-weight:800 !important;
            box-shadow:0 10px 30px rgba(0,0,0,.25) !important;
            backdrop-filter:blur(12px) !important;
        }

        /* TEKST */
        [class*="SpRtcRhr"],
        .xJOttdun,
        .vsqluglD,
        .pilxulFB{
            font-family:var(--font) !important;
            font-size:var(--text-size) !important;
            line-height:1.65 !important;
            background:rgba(255,255,255,.025) !important;
            border:1px solid rgba(255,255,255,.06) !important;
            border-radius:18px !important;
            padding:16px 18px !important;
            color:var(--text) !important;
            box-shadow:
                inset 0 1px 0 rgba(255,255,255,.03),
                0 12px 26px rgba(0,0,0,.22) !important;
        }

        .inputPanel{ padding-top:10px !important; }

        .inputPanel .txtInput{
            font-family:var(--font) !important;
            font-size:var(--input-size) !important;
            border:1px solid rgba(255,255,255,.08) !important;
            border-radius:14px !important;
            background:rgba(8,10,16,.88) !important;
            color:#f8fafc !important;
            padding:10px 14px !important;
            min-height:42px !important;
            box-shadow:
                0 10px 24px rgba(0,0,0,.24),
                inset 0 1px 0 rgba(255,255,255,.04) !important;
        }

        .txtInput:focus{
            outline:none !important;
            box-shadow:
                0 0 0 3px rgba(255,213,79,.20),
                0 14px 30px rgba(0,0,0,.28) !important;
        }

        .smoothCaretInputBox{ border-radius:16px !important; }
        #smoothCaret{ border-radius:4px !important; }

        /* EIGEN WPM */
        #tr-own-wpm{
            position:fixed;
            left:20px;
            top:20px;
            z-index:99999;
            padding:14px 18px;
            border-radius:20px;
            background:rgba(12,16,24,.52);
            border:1px solid rgba(255,255,255,.08);
            backdrop-filter:blur(14px);
            box-shadow:0 12px 40px rgba(0,0,0,.35);
            color:white;
            font-family:'Inter',sans-serif;
        }

        #tr-own-wpm .label{
            font-size:12px;
            color:rgba(255,255,255,.6);
            margin-bottom:4px;
            letter-spacing:.08em;
            text-transform:uppercase;
        }

        #tr-own-wpm .value{
            font-size:1.9rem;
            font-weight:900;
            background:linear-gradient(135deg,var(--accent),var(--accent2));
            -webkit-background-clip:text;
            -webkit-text-fill-color:transparent;
        }

        /* SETTINGS PANEL */
        #tr-settings-btn{
            position:fixed;
            bottom:18px;
            left:18px;
            z-index:999999;
            border:none;
            border-radius:999px;
            padding:12px 16px;
            background:rgba(12,16,24,.78);
            border:1px solid rgba(255,255,255,.08);
            color:white;
            font-weight:800;
            cursor:pointer;
            backdrop-filter:blur(12px);
            box-shadow:0 12px 40px rgba(0,0,0,.35);
        }

        #tr-settings-panel{
            position:fixed;
            left:18px;
            bottom:70px;
            width:430px;
            max-height:80vh;
            overflow:auto;
            z-index:999999;
            background:rgba(10,14,22,.92);
            border:1px solid rgba(255,255,255,.08);
            border-radius:28px;
            padding:20px;
            display:none;
            backdrop-filter:blur(20px);
            color:white;
            box-shadow:0 24px 70px rgba(0,0,0,.45);
        }

        #tr-settings-panel h2{ margin:0 0 12px 0; font-size:1.25rem; }

        .tr-group{
            margin-bottom:16px;
            padding:14px;
            border-radius:18px;
            background:rgba(255,255,255,.04);
            border:1px solid rgba(255,255,255,.06);
        }

        .tr-group h3{
            margin:0 0 10px 0;
            font-size:.9rem;
            text-transform:uppercase;
            letter-spacing:.08em;
            color:rgba(255,255,255,.62);
        }

        .tr-control{ margin-bottom:12px; }

        .tr-control label{
            display:flex;
            justify-content:space-between;
            gap:12px;
            margin-bottom:6px;
            font-size:13px;
            color:rgba(255,255,255,.88);
        }

        .tr-control input,
        .tr-control select{
            width:100%;
            box-sizing:border-box;
        }

        .tr-control input[type="range"]{ accent-color:var(--accent); }

        .tr-control select{
            background:#0b1020 !important;
            border:1px solid rgba(255,255,255,.16) !important;
            color:#f8fafc !important;
            padding:10px 12px;
            border-radius:12px;
            appearance:none;
            -webkit-appearance:none;
            -moz-appearance:none;
            box-shadow:inset 0 1px 0 rgba(255,255,255,.03);
        }

        .tr-control select option{
            background:#0b1020 !important;
            color:#f8fafc !important;
        }

        .tr-toggle{
            display:flex;
            justify-content:space-between;
            align-items:center;
            gap:12px;
            margin-bottom:10px;
        }

        .tr-toggle input{
            width:18px;
            height:18px;
            accent-color:var(--accent);
            flex:0 0 auto;
        }

        .tr-actions{
            display:flex;
            gap:10px;
            margin-top:10px;
            flex-wrap:wrap;
        }

        .tr-btn{
            border:none;
            border-radius:14px;
            padding:10px 14px;
            font-weight:800;
            cursor:pointer;
            color:white;
            background:rgba(255,255,255,.08);
            border:1px solid rgba(255,255,255,.08);
        }

        .tr-btn.primary{
            background:linear-gradient(135deg,var(--accent),var(--accent2));
            color:#09111f;
        }

        .tr-small{
            color:rgba(255,255,255,.58);
            font-size:12px;
            line-height:1.4;
            margin-top:8px;
        }

        /* SCOREBOARD TOGGLE */
        body.tr-hide-scoreboard .scoreboardContainer,
        body.tr-hide-scoreboard .scoreboard{
            display:none !important;
        }

        /* HIDE/SHOW CLASSES */
        body.tr-hide-own-avatar .avatar-self .avatarContainer{
            display:none !important;
        }

        body.tr-hide-own-progress-line .avatar-self .progressBar,
        body.tr-hide-own-progress-line .avatar-self .progressBarContainer,
        body.tr-hide-own-progress-line .avatar-self .progressBarTrack{
            display:none !important;
            background:transparent !important;
            border:none !important;
            box-shadow:none !important;
        }

        body.tr-minimal-mode .themeHeader,
        body.tr-minimal-mode .newNorthWidget,
        body.tr-minimal-mode .newWestWidget,
        body.tr-minimal-mode .newEastWidget,
        body.tr-minimal-mode .newSouthWidget,
        body.tr-minimal-mode .statsView,
        body.tr-minimal-mode .sidebarBlocks,
        body.tr-minimal-mode .podContainer.statsView,
        body.tr-minimal-mode .createAccountLeaderboardPrompt,
        body.tr-minimal-mode #footer,
        body.tr-minimal-mode #offcanvas,
        body.tr-minimal-mode .mobile-menu-trigger,
        body.tr-minimal-mode .mobileNav,
        body.tr-minimal-mode .embedded_ad_wrapper,
        body.tr-minimal-mode [id*="playwire_ad"],
        body.tr-minimal-mode .gameStatusLabel,
        body.tr-minimal-mode .navControls,
        body.tr-minimal-mode .scoreboardContainer,
        body.tr-minimal-mode .scoreboard,
        body.tr-minimal-mode .progressBarContainer,
        body.tr-minimal-mode .rankPanelContainer,
        body.tr-minimal-mode .avatar,
        body.tr-minimal-mode .avatarContainer,
        body.tr-minimal-mode .nameContainer,
        body.tr-minimal-mode #tr-own-wpm,
        body.tr-minimal-mode #tr-progress-wrap{
            display:none !important;
        }

        body.tr-minimal-mode .mainViewportHolder{
            min-height:100vh !important;
            padding:0 !important;
            align-items:center !important;
        }

        body.tr-minimal-mode .mainViewport,
        body.tr-minimal-mode .gameView,
        body.tr-minimal-mode .mainViewport .chrome_m{
            width:min(980px, 94vw) !important;
        }

        body.tr-minimal-mode .mainViewport .chrome_m,
        body.tr-minimal-mode .gameView,
        body.tr-minimal-mode .podContainer.medium{
            padding:16px !important;
            border-radius:24px !important;
        }

        body.tr-minimal-mode .inputPanel{
            margin-top:8px !important;
        }

        body.tr-minimal-mode #tr-settings-btn,
        body.tr-minimal-mode #tr-settings-panel{
            opacity:.92;
        }

        /* PROGRESS BAR (race-voortgang) */
        #tr-progress-wrap{
            position:relative;
            width:100%;
            margin-top:12px;
            padding:0 2px;
            display:none;
        }

        #tr-progress-wrap.visible{ display:block; }

        #tr-progress-track{
            position:relative;
            width:100%;
            height:var(--progress-height);
            border-radius:999px;
            overflow:hidden;
            background:rgba(255,255,255,.08);
            border:1px solid rgba(255,255,255,.10);
            box-shadow:inset 0 1px 0 rgba(255,255,255,.04), 0 10px 24px rgba(0,0,0,.24);
            opacity:var(--progress-opacity);
        }

        #tr-progress-fill{
            height:100%;
            width:0%;
            border-radius:999px;
            background:linear-gradient(90deg, var(--accent), var(--accent2));
            box-shadow:
                0 0 calc(18px * var(--progress-glow)) rgba(255,213,79,.20),
                0 0 calc(24px * var(--progress-glow)) rgba(255,159,67,.16);
            transition:width .08s linear;
        }

        #tr-progress-label{
            margin-top:6px;
            font-size:12px;
            color:rgba(255,255,255,.66);
            letter-spacing:.06em;
            text-transform:uppercase;
            display:flex;
            justify-content:space-between;
            gap:12px;
        }
        `;

        document.head.appendChild(styleEl);
    }

    function removeUniverseBackground() {
        const el = document.getElementById("universe-background");
        if (el) el.remove();
    }

    function ensureBackgroundRoot() {
        let bg = document.getElementById("tr-bg");
        if (!bg) {
            bg = document.createElement("div");
            bg.id = "tr-bg";
            bg.innerHTML = `
                <div class="tr-layer a"></div>
                <div class="tr-layer b"></div>
                <div class="tr-layer c"></div>
            `;
            document.body.prepend(bg);
        }
    }

    function createOwnWPM() {
        const existing = document.getElementById("tr-own-wpm");
        if (existing) existing.remove();

        const box = document.createElement("div");
        box.id = "tr-own-wpm";
        box.innerHTML = `
            <div class="label">YOUR WPM</div>
            <div class="value">0</div>
        `;
        document.body.appendChild(box);

        if (ownWpmTimer) clearInterval(ownWpmTimer);
        ownWpmTimer = setInterval(() => {
            const el = document.querySelector(".rankPanelWpm-self");
            const target = box.querySelector(".value");
            if (el && target) target.textContent = el.textContent.trim();
            box.style.display = settings.showOwnWPM && !settings.minimalMode ? "block" : "none";
        }, 120);
    }

    function createProgressBar() {
        const holder = document.querySelector(".inputPanel");
        if (!holder) return;

        let wrap = document.getElementById("tr-progress-wrap");
        if (!wrap) {
            wrap = document.createElement("div");
            wrap.id = "tr-progress-wrap";
            wrap.innerHTML = `
                <div id="tr-progress-track"><div id="tr-progress-fill"></div></div>
                <div id="tr-progress-label"><span>Typing progress</span><span id="tr-progress-value">0%</span></div>
            `;
            holder.appendChild(wrap);
        }
        wrap.classList.toggle("visible", !!settings.showProgressBar && !settings.minimalMode);
    }

    function backgroundClass(name) {
        const allowed = new Set(["nebula", "grid", "stars", "storm", "ember", "void", "black"]);
        return allowed.has(name) ? `tr-bg-${name}` : "tr-bg-nebula";
    }

    function getTargetText() {
        const candidates = [
            ".pilxulFB",
            ".xJOttdun",
            ".vsqluglD",
            "[class*='SpRtcRhr']"
        ];
        for (const sel of candidates) {
            const el = document.querySelector(sel);
            if (!el) continue;
            const text = (el.textContent || "").replace(/\s+/g, " ").trim();
            if (text.length > 10) return text;
        }
        return "";
    }

    function getTypedText() {
        const input = document.querySelector(".txtInput");
        return (input?.value || "").replace(/\s+/g, " ");
    }

    function updateProgressBar() {
        const wrap = document.getElementById("tr-progress-wrap");
        const fill = document.getElementById("tr-progress-fill");
        const label = document.getElementById("tr-progress-value");
        if (!wrap || !fill || !label) return;

        const target = getTargetText();
        const typed = getTypedText();

        if (!settings.showProgressBar || settings.minimalMode || !target) {
            wrap.classList.remove("visible");
            return;
        }

        wrap.classList.add("visible");

        const pct = Math.max(0, Math.min(100, Math.round((typed.length / Math.max(target.length, 1)) * 100)));
        fill.style.width = `${pct}%`;
        label.textContent = `${pct}%`;
    }

    function applyTheme() {
        const [a1, a2] = ACCENTS[settings.accent] || ACCENTS.gold;

        document.documentElement.style.setProperty("--accent", a1);
        document.documentElement.style.setProperty("--accent2", a2);
        document.documentElement.style.setProperty("--font", `'${settings.font}', monospace`);
        document.documentElement.style.setProperty("--text-size", `${settings.textSize}rem`);
        document.documentElement.style.setProperty("--input-size", `${settings.inputSize}rem`);
        document.documentElement.style.setProperty("--timer-scale", settings.timerScale);
        document.documentElement.style.setProperty("--timer-opacity", settings.timerOpacity);
        document.documentElement.style.setProperty("--timer-top", `${settings.timerTop}px`);
        document.documentElement.style.setProperty("--timer-right", `${settings.timerRight}px`);
        document.documentElement.style.setProperty("--blur", `${settings.blur}px`);
        document.documentElement.style.setProperty("--card-opacity", settings.cardOpacity);
        document.documentElement.style.setProperty("--layout-shift-y", `${settings.layoutShiftY}px`);
        document.documentElement.style.setProperty("--bg-intensity", settings.backgroundIntensity);
        document.documentElement.style.setProperty("--bg-motion", settings.backgroundMotion);
        document.documentElement.style.setProperty("--progress-height", `${settings.progressBarHeight}px`);
        document.documentElement.style.setProperty("--progress-opacity", settings.progressBarOpacity);
        document.documentElement.style.setProperty("--progress-glow", settings.progressBarGlow);

        document.body.classList.add("tr-ultra-active");
        document.body.classList.toggle("tr-center-layout", !!settings.centerLayout);
        document.body.classList.toggle("tr-minimal-mode", !!settings.minimalMode);
        document.body.classList.toggle("tr-hide-own-avatar", !settings.showOwnAvatar);
        document.body.classList.toggle("tr-hide-own-progress-line", !!settings.hideOwnProgressLine);
        document.body.classList.toggle("tr-hide-scoreboard", !settings.showScoreboard);

        document.body.classList.remove(
            "tr-bg-nebula",
            "tr-bg-grid",
            "tr-bg-stars",
            "tr-bg-storm",
            "tr-bg-ember",
            "tr-bg-void",
            "tr-bg-black"
        );
        document.body.classList.add(backgroundClass(settings.background));

        const speed = Math.max(12, 44 - (settings.backgroundMotion / 2));
        document.querySelectorAll(".tr-layer").forEach(layer => {
            layer.style.animationDuration = `${speed}s`;
            layer.style.opacity = `calc(.22 * ${settings.backgroundIntensity})`;
        });

        createProgressBar();
        updateProgressBar();
    }

    function hideOpponents() {
        const rows = document.querySelectorAll(".scoreboard .row");
        rows.forEach(row => {
            const isSelf = !!row.querySelector(".rankPanelWpm-self");
            row.style.display = settings.minimalMode ? (isSelf ? "" : "none") : (settings.hideOpponents && !isSelf ? "none" : "");
        });
    }

    function createSettings() {
        const oldBtn = document.getElementById("tr-settings-btn");
        const oldPanel = document.getElementById("tr-settings-panel");
        if (oldBtn) oldBtn.remove();
        if (oldPanel) oldPanel.remove();

        const btn = document.createElement("button");
        btn.id = "tr-settings-btn";
        btn.textContent = "⚙ Settings";

        const panel = document.createElement("div");
        panel.id = "tr-settings-panel";

        panel.innerHTML = `
            <h2>TypeRacer Ultra</h2>

            <div class="tr-group">
                <h3>Basis</h3>

                <div class="tr-toggle">
                    <span>Hide opponents</span>
                    <input type="checkbox" id="tr-hideOpponents">
                </div>

                <div class="tr-toggle">
                    <span>Show own WPM</span>
                    <input type="checkbox" id="tr-showOwnWPM">
                </div>

                <div class="tr-toggle">
                    <span>Show own avatar</span>
                    <input type="checkbox" id="tr-showOwnAvatar">
                </div>

                <div class="tr-toggle">
                    <span>Hide own progress line</span>
                    <input type="checkbox" id="tr-hideOwnProgressLine">
                </div>

                <div class="tr-toggle">
                    <span>Scorebord tonen</span>
                    <input type="checkbox" id="tr-showScoreboard">
                </div>

                <div class="tr-toggle">
                    <span>Center layout</span>
                    <input type="checkbox" id="tr-centerLayout">
                </div>

                <div class="tr-toggle">
                    <span>Minimal mode</span>
                    <input type="checkbox" id="tr-minimalMode">
                </div>

                <div class="tr-actions">
                    <button class="tr-btn primary" id="tr-resetNormal">Terug naar normale pagina</button>
                    <button class="tr-btn" id="tr-resetSettings">Reset instellingen</button>
                </div>

                <div class="tr-small">
                    Minimal mode laat alleen timer, tekst, input en achtergrond staan.
                </div>
            </div>

            <div class="tr-group">
                <h3>Fonts</h3>
                <div class="tr-control">
                    <label>Typing Font</label>
                    <select id="tr-font">
                        <option>JetBrains Mono</option>
                        <option>Fira Code</option>
                        <option>Space Grotesk</option>
                        <option>Outfit</option>
                    </select>
                </div>
            </div>

            <div class="tr-group">
                <h3>Layout & Text</h3>
                <div class="tr-control">
                    <label>Layout Y offset</label>
                    <input type="range" min="-160" max="160" step="1" id="tr-layoutShiftY">
                </div>
                <div class="tr-control">
                    <label>Race text size</label>
                    <input type="range" min="1.0" max="2.6" step="0.05" id="tr-textSize">
                </div>
                <div class="tr-control">
                    <label>Input size</label>
                    <input type="range" min="0.85" max="1.8" step="0.05" id="tr-inputSize">
                </div>
            </div>

            <div class="tr-group">
                <h3>Background</h3>
                <div class="tr-control">
                    <label>Style</label>
                    <select id="tr-background">
                        <option value="nebula">Nebula</option>
                        <option value="grid">Neon Grid</option>
                        <option value="stars">Stars</option>
                        <option value="storm">Storm</option>
                        <option value="ember">Ember</option>
                        <option value="void">Void</option>
                        <option value="black">Black (moving stars)</option>
                    </select>
                </div>
                <div class="tr-control">
                    <label>Motion</label>
                    <input type="range" min="0" max="100" step="1" id="tr-backgroundMotion">
                </div>
                <div class="tr-control">
                    <label>Intensity</label>
                    <input type="range" min="0.2" max="2" step="0.05" id="tr-backgroundIntensity">
                </div>
                <div class="tr-control">
                    <label>Card opacity</label>
                    <input type="range" min="0.18" max="0.88" step="0.01" id="tr-cardOpacity">
                </div>
                <div class="tr-control">
                    <label>Blur</label>
                    <input type="range" min="0" max="36" step="1" id="tr-blur">
                </div>
            </div>

            <div class="tr-group">
                <h3>Progress bar</h3>
                <div class="tr-toggle">
                    <span>Show progress bar</span>
                    <input type="checkbox" id="tr-showProgressBar">
                </div>
                <div class="tr-control">
                    <label>Height</label>
                    <input type="range" min="4" max="18" step="1" id="tr-progressBarHeight">
                </div>
                <div class="tr-control">
                    <label>Opacity</label>
                    <input type="range" min="0.2" max="1" step="0.01" id="tr-progressBarOpacity">
                </div>
                <div class="tr-control">
                    <label>Glow</label>
                    <input type="range" min="0" max="2" step="0.05" id="tr-progressBarGlow">
                </div>
            </div>

            <div class="tr-group">
                <h3>Timer</h3>
                <div class="tr-control">
                    <label>Size</label>
                    <input type="range" min="0.4" max="1" step="0.01" id="tr-timerScale">
                </div>
                <div class="tr-control">
                    <label>Opacity</label>
                    <input type="range" min="0.2" max="1" step="0.01" id="tr-timerOpacity">
                </div>
            </div>

            <div class="tr-group">
                <h3>Accent</h3>
                <div class="tr-control">
                    <label>Color</label>
                    <select id="tr-accent">
                        <option value="gold">Gold</option>
                        <option value="violet">Violet</option>
                        <option value="ice">Ice</option>
                        <option value="mint">Mint</option>
                        <option value="red">Red</option>
                    </select>
                </div>
            </div>
        `;

        document.body.appendChild(btn);
        document.body.appendChild(panel);

        btn.onclick = () => {
            panel.style.display = panel.style.display === "block" ? "none" : "block";
        };

        panel.querySelector("#tr-resetNormal")?.addEventListener("click", () => {
            localStorage.removeItem(STORAGE_KEY);
            location.reload();
        });

        panel.querySelector("#tr-resetSettings")?.addEventListener("click", () => {
            localStorage.removeItem(STORAGE_KEY);
            location.reload();
        });

        bindControls(panel);
        syncUIValues(panel);
    }

    function bindControls(panel) {
        const bind = (id, key, type = "value") => {
            const el = panel.querySelector(`#${id}`);
            if (!el) return;

            if (type === "checked") el.checked = !!settings[key];
            else el.value = settings[key];

            el.addEventListener("input", () => {
                settings[key] = type === "checked"
                    ? el.checked
                    : typeof DEFAULTS[key] === "number"
                        ? Number(el.value)
                        : el.value;

                save();
                applyTheme();
                hideOpponents();
                updateProgressBar();
            });
        };

        bind("tr-hideOpponents", "hideOpponents", "checked");
        bind("tr-showOwnWPM", "showOwnWPM", "checked");
        bind("tr-showOwnAvatar", "showOwnAvatar", "checked");
        bind("tr-hideOwnProgressLine", "hideOwnProgressLine", "checked");
        bind("tr-showScoreboard", "showScoreboard", "checked");

        bind("tr-font", "font");
        bind("tr-layoutShiftY", "layoutShiftY");
        bind("tr-textSize", "textSize");
        bind("tr-inputSize", "inputSize");
        bind("tr-background", "background");
        bind("tr-backgroundMotion", "backgroundMotion");
        bind("tr-backgroundIntensity", "backgroundIntensity");
        bind("tr-cardOpacity", "cardOpacity");
        bind("tr-blur", "blur");
        bind("tr-showProgressBar", "showProgressBar", "checked");
        bind("tr-progressBarHeight", "progressBarHeight");
        bind("tr-progressBarOpacity", "progressBarOpacity");
        bind("tr-progressBarGlow", "progressBarGlow");
        bind("tr-timerScale", "timerScale");
        bind("tr-timerOpacity", "timerOpacity");
        bind("tr-accent", "accent");
    }

    function syncUIValues(panel) {
        if (!panel) return;
        const set = (id, value, checked = false) => {
            const el = panel.querySelector(`#${id}`);
            if (!el) return;
            if (checked) el.checked = value;
            else el.value = value;
        };

        set("tr-hideOpponents", settings.hideOpponents, true);
        set("tr-showOwnWPM", settings.showOwnWPM, true);
        set("tr-showOwnAvatar", settings.showOwnAvatar, true);
        set("tr-hideOwnProgressLine", settings.hideOwnProgressLine, true);
        set("tr-showScoreboard", settings.showScoreboard, true);
        set("tr-centerLayout", settings.centerLayout, true);
        set("tr-minimalMode", settings.minimalMode, true);

        set("tr-font", settings.font);
        set("tr-layoutShiftY", settings.layoutShiftY);
        set("tr-textSize", settings.textSize);
        set("tr-inputSize", settings.inputSize);
        set("tr-background", settings.background);
        set("tr-backgroundMotion", settings.backgroundMotion);
        set("tr-backgroundIntensity", settings.backgroundIntensity);
        set("tr-cardOpacity", settings.cardOpacity);
        set("tr-blur", settings.blur);
        set("tr-showProgressBar", settings.showProgressBar, true);
        set("tr-progressBarHeight", settings.progressBarHeight);
        set("tr-progressBarOpacity", settings.progressBarOpacity);
        set("tr-progressBarGlow", settings.progressBarGlow);
        set("tr-timerScale", settings.timerScale);
        set("tr-timerOpacity", settings.timerOpacity);
        set("tr-accent", settings.accent);
    }

    function observe() {
        if (observer) observer.disconnect();

        observer = new MutationObserver(() => {
            removeUniverseBackground();
            hideOpponents();
            updateProgressBar();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    function startProgressWatcher() {
        if (progressTimer) clearInterval(progressTimer);
        progressTimer = setInterval(updateProgressBar, 90);
    }

    function init() {
        injectStyles();
        removeUniverseBackground();
        ensureBackgroundRoot();
        createOwnWPM();
        createSettings();
        createProgressBar();
        applyTheme();
        hideOpponents();
        observe();
        startProgressWatcher();

        setTimeout(() => {
            applyTheme();
            hideOpponents();
            updateProgressBar();
        }, 250);

        console.log("TypeRacer Ultra V6 loaded");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();