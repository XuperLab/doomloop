import{P as wt,V as f,Q as Et,E as St,G as pt,a as Tt,M as w,b as g,c as Lt,B as Z,C as P,S as ft,d as gt,e as At,W as kt,A as xt,f as It,g as Pt,F as Mt,h as Dt,D as Rt,H as Ct}from"./three-B4v6BLg2.js";import{W as _t,N as Bt,M as Ht,C as Ft,B as $,P as Ot,V as z,a as Q,b as M,S as jt}from"./cannon-CbR5xzcU.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const o of s)if(o.type==="childList")for(const n of o.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&i(n)}).observe(document,{childList:!0,subtree:!0});function e(s){const o={};return s.integrity&&(o.integrity=s.integrity),s.referrerPolicy&&(o.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?o.credentials="include":s.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function i(s){if(s.ep)return;s.ep=!0;const o=e(s);fetch(s.href,o)}})();class zt{constructor(t=1/60,e=.1){this.lastTime=0,this.accumulator=0,this.running=!1,this.rafId=0,this.onFixedUpdate=null,this.onRender=null,this.frame=()=>{var n,r;if(!this.running)return;const i=performance.now()/1e3;let s=i-this.lastTime;for(this.lastTime=i,s>this.MAX_FRAME&&(s=this.MAX_FRAME),this.accumulator+=s;this.accumulator>=this.FIXED_DT;)(n=this.onFixedUpdate)==null||n.call(this,this.FIXED_DT),this.accumulator-=this.FIXED_DT;const o=this.accumulator/this.FIXED_DT;(r=this.onRender)==null||r.call(this,o),this.rafId=requestAnimationFrame(this.frame)},this.FIXED_DT=t,this.MAX_FRAME=e}start(){this.running||(this.running=!0,this.lastTime=performance.now()/1e3,this.accumulator=0,this.frame())}stop(){this.running=!1,this.rafId&&(cancelAnimationFrame(this.rafId),this.rafId=0)}isRunning(){return this.running}}const T=40,S=10,D=1,Wt=4,Nt=8,R=4,tt=3,Vt=[[0,1,10],[10,1,-10],[-10,1,10]],H=[0,1,0],F=[0,1,5],Yt=-30,Gt=1/60,Jt=.1,Ut=5,Xt=1.6,et=12,Kt=1.5,Zt=70,k=75,qt=.2,$t=.1,Qt=8,W=100,C=.5,N=1.8,te=14,it=3,ee=10,ie=.5,se=6,st=15,ot=15,oe=2,x=1.2,E=3,ne=.25,ae=100,re=1,he=3,le=.2,vt=.15,ce=60,de=5,me=.4,ue=25,pe=3,_=.5,q=5,fe=.03,ge=8,nt=.002,at=Math.PI/2-.05,ve=.2,rt={IMP:6,BOSS:15},ht=2,V=8,ye=.1,be=.4,we=.08,L=80,lt=.008,Ee=300,Se=3e3,Te=20,Le=50,Ae=100,ke=200,Y=8,G=.008,J=!0,ct="doomloop_touch_settings",yt="doomloop_help_shown",xe=300,Ie=2e3,Pe=50,l={PLAYER:1,ARENA:2,ENEMIES:4,PLAYER_PROJECTILE:8,HEALTH_PACK:32,BOSS_PROJECTILE:64},v={FLOOR:3815994,WALL:5592405,PILLAR:4473924,IMP:13391155,BOSS:8926003,PLAYER_PROJECTILE:4513279,BOSS_PROJECTILE:16737826,HEALTH_PACK:4521796},U=[{wave:1,enemyCount:3,enemyType:"imp",hasBoss:!1},{wave:2,enemyCount:5,enemyType:"imp",hasBoss:!1},{wave:3,enemyCount:7,enemyType:"imp",hasBoss:!1},{wave:4,enemyCount:10,enemyType:"imp",hasBoss:!1},{wave:5,enemyCount:0,enemyType:"none",hasBoss:!0}];class Me{constructor(){this.keys=new Map,this._mouseDeltaX=0,this._mouseDeltaY=0,this._firePressed=!1,this._jumpPressed=!1,this._restartPressed=!1,this._sprintHeld=!1,this._pointerLocked=!1,this._onPointerLockChange=null,this._onPointerLockError=null,this.onKeyDown=t=>{this.keys.set(t.code,!0),t.code==="KeyR"&&(this._restartPressed=!0),t.code==="Space"&&t.preventDefault()},this.onKeyUp=t=>{this.keys.set(t.code,!1)},this.onMouseMove=t=>{this._pointerLocked&&(this._mouseDeltaX+=t.movementX,this._mouseDeltaY+=t.movementY)},this.onMouseDown=t=>{t.button===0&&(this._firePressed=!0)},this.onPointerLockChangeEvent=()=>{var t;this._pointerLocked=document.pointerLockElement!==null,this._pointerLocked&&((t=this._onPointerLockChange)==null||t.call(this))},this.onPointerLockErrorEvent=()=>{var t;(t=this._onPointerLockError)==null||t.call(this)}}init(t){document.addEventListener("keydown",this.onKeyDown),document.addEventListener("keyup",this.onKeyUp),document.addEventListener("mousemove",this.onMouseMove),document.addEventListener("mousedown",this.onMouseDown),document.addEventListener("pointerlockchange",this.onPointerLockChangeEvent),document.addEventListener("pointerlockerror",this.onPointerLockErrorEvent)}destroy(){document.removeEventListener("keydown",this.onKeyDown),document.removeEventListener("keyup",this.onKeyUp),document.removeEventListener("mousemove",this.onMouseMove),document.removeEventListener("mousedown",this.onMouseDown),document.removeEventListener("pointerlockchange",this.onPointerLockChangeEvent),document.removeEventListener("pointerlockerror",this.onPointerLockErrorEvent)}requestPointerLock(t){t.requestPointerLock()}exitPointerLock(){document.pointerLockElement&&document.exitPointerLock()}get isPointerLocked(){return this._pointerLocked}set onPointerLockChange(t){this._onPointerLockChange=t}set onPointerLockError(t){this._onPointerLockError=t}poll(){const t={moveForward:!!this.keys.get("KeyW"),moveBackward:!!this.keys.get("KeyS"),moveLeft:!!this.keys.get("KeyA"),moveRight:!!this.keys.get("KeyD"),fire:this._firePressed,jumpPressed:this._jumpPressed,sprint:!!this.keys.get("ShiftLeft")||!!this.keys.get("ShiftRight"),mouseDeltaX:this._mouseDeltaX*nt,mouseDeltaY:this._mouseDeltaY*nt,restart:this._restartPressed};return this._firePressed=!1,this._jumpPressed=!1,this._restartPressed=!1,this._mouseDeltaX=0,this._mouseDeltaY=0,t}notifyJumpPressed(){this._jumpPressed=!0}notifyRestartPressed(){this._restartPressed=!0}reset(){this.keys.clear(),this._mouseDeltaX=0,this._mouseDeltaY=0,this._firePressed=!1,this._jumpPressed=!1,this._restartPressed=!1}}class dt{constructor(){this.state={moveForward:!1,moveBackward:!1,moveLeft:!1,moveRight:!1,fire:!1,jumpPressed:!1,sprint:!1,mouseDeltaX:0,mouseDeltaY:0,restart:!1,moveAnalogX:0,moveAnalogZ:0},this.isInitialized=!1,this.containerEl=null,this.touches=new Map,this.joystickTouchId=null,this.cameraTouchId=null,this.fireTouchId=null,this.jumpTouchId=null,this.joystickCenterX=0,this.joystickCenterY=0,this.joystickActive=!1,this.cameraLastX=0,this.cameraLastY=0,this.sprintActive=!1,this.lastForwardReleaseTime=0,this.dom=null,this.boundTouchStart=null,this.boundTouchMove=null,this.boundTouchEnd=null,this.boundTouchCancel=null,this.boundFireStart=null,this.boundFireEnd=null,this.boundJumpStart=null,this.boundGearClick=null,this.boundSettingsDismiss=null,this.boundSettingsClose=null,this.boundHelpDismiss=null,this.boundDeadZoneChange=null,this.boundSensitivityChange=null,this.boundHapticToggle=null,this.boundShowHelp=null,this.fadeTimer=null,this.settings={cameraSensitivity:G,joystickDeadZone:Y,hapticFeedback:J},this.settingsPanelOpen=!1,this.deadZoneSlider=null,this.sensitivitySlider=null,this.lastDamageHapticTime=0,this.hapticEnabled=!0,this.fireHoldStartTime=0,this.fireHoldTimer=null,this.isActiveHold=!1,this.helpHintFired=!1,this.boundViewportResize=null,this.viewportResizeTimer=null}poll(){const t={moveForward:this.state.moveForward,moveBackward:this.state.moveBackward,moveLeft:this.state.moveLeft,moveRight:this.state.moveRight,fire:this.state.fire,jumpPressed:this.state.jumpPressed,sprint:this.state.sprint,mouseDeltaX:this.state.mouseDeltaX*lt,mouseDeltaY:this.state.mouseDeltaY*lt,restart:this.state.restart,moveAnalogX:this.state.moveAnalogX,moveAnalogZ:this.state.moveAnalogZ};return this.state.jumpPressed=!1,this.state.restart=!1,this.state.mouseDeltaX=0,this.state.mouseDeltaY=0,t}init(t){this.isInitialized||(this.containerEl=t,this.createDOM(),this.loadSettings(),this.bindEvents(),this.setupViewportHandler(),this.startFadeTimer(),this.isInitialized=!0)}destroy(){this.isInitialized&&(this.unbindEvents(),this.removeDOM(),this.teardownViewportHandler(),this.touches.clear(),this.joystickTouchId=null,this.cameraTouchId=null,this.fireTouchId=null,this.jumpTouchId=null,this.fadeTimer&&(clearTimeout(this.fadeTimer),this.fadeTimer=null),this.fireHoldTimer&&(clearTimeout(this.fireHoldTimer),this.fireHoldTimer=null),this.isInitialized=!1)}reset(){this.sprintActive=!1,this.state.sprint=!1,this.joystickActive=!1,this.joystickTouchId=null,this.cameraTouchId=null,this.fireTouchId=null,this.jumpTouchId=null,this.touches.clear(),this.updateSprintVisual(),this.updateJoystickVisual(0,0),this.isActiveHold=!1,this.fireHoldStartTime=0,this.fireHoldTimer&&(clearTimeout(this.fireHoldTimer),this.fireHoldTimer=null)}loadSettings(){const t=localStorage.getItem(ct);if(t)try{const e=JSON.parse(t);this.settings={cameraSensitivity:typeof e.cameraSensitivity=="number"?e.cameraSensitivity:G,joystickDeadZone:typeof e.joystickDeadZone=="number"?e.joystickDeadZone:Y,hapticFeedback:typeof e.hapticFeedback=="boolean"?e.hapticFeedback:J}}catch{this.settings={cameraSensitivity:G,joystickDeadZone:Y,hapticFeedback:J}}this.applySettings(this.settings)}saveSettings(){localStorage.setItem(ct,JSON.stringify(this.settings))}applySettings(t){this.settings=t,this.hapticEnabled=t.hapticFeedback}getDeadZone(){return this.settings.joystickDeadZone}getSensitivity(){return this.settings.cameraSensitivity}triggerVibrate(t){if(this.hapticEnabled&&typeof navigator.vibrate=="function")try{navigator.vibrate(t)}catch{}}fireHaptic(){this.triggerVibrate(Te)}hitHaptic(){this.triggerVibrate(Le)}damageHaptic(){const t=performance.now();t-this.lastDamageHapticTime<ke||(this.lastDamageHapticTime=t,this.triggerVibrate(Ae))}createDOM(){const t=document.createElement("div");t.id="touch-controls",t.className="touch-device";const e=document.createElement("div");e.id="touch-left-zone";const i=document.createElement("div");i.id="touch-right-zone";const s=document.createElement("div");s.id="joystick-container";const o=document.createElement("div");o.id="joystick-base";const n=document.createElement("div");n.id="joystick-thumb";const r=document.createElement("div");r.id="sprint-indicator",r.textContent="SPRINT",s.appendChild(o),s.appendChild(n),s.appendChild(r);const h=document.createElement("div");h.id="fire-button",h.innerHTML='<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="2" x2="12" y2="7"/><line x1="12" y1="17" x2="12" y2="22"/><line x1="2" y1="12" x2="7" y2="12"/><line x1="17" y1="12" x2="22" y2="12"/></svg>';const a=document.createElement("div");a.id="jump-button",a.innerHTML='<svg viewBox="0 0 24 24"><polyline points="12,20 12,4 5,11 12,4 19,11" stroke-linejoin="round" stroke-linecap="round"/></svg>';const c=document.createElement("div");c.id="control-hint",c.className="visible",c.innerHTML=`
      <div class="hint-label" data-zone="left">Move</div>
      <div class="hint-label" data-zone="right">Look</div>
      <div class="hint-label" data-zone="fire">Fire</div>
      <div class="hint-label" data-zone="jump">Jump</div>
    `,t.appendChild(e),t.appendChild(i),t.appendChild(s),t.appendChild(h),t.appendChild(a),t.appendChild(c);const d=document.createElement("div");d.id="settings-gear",d.innerHTML='<svg viewBox="0 0 24 24"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>',t.appendChild(d);const m=this.createSettingsOverlay();t.appendChild(m);const b=this.createHelpOverlay();t.appendChild(b);const y=document.createElement("style");y.id="touch-controls-styles",y.textContent=this.getCSS(),document.head.appendChild(y),document.body.appendChild(t),this.recalcJoystickCenter(),this.dom={container:t,styleEl:y,joystickBase:o,joystickThumb:n,sprintIndicator:r,fireButton:h,jumpButton:a,controlHint:c,settingsGear:d,settingsOverlay:m,helpOverlay:b}}createSettingsOverlay(){const t=document.createElement("div");t.id="settings-overlay";const e=document.createElement("div");return e.id="settings-panel",e.innerHTML=`
      <h2>Touch Settings</h2>
      <div class="setting-row">
        <span class="setting-label">Dead Zone: <span id="dead-zone-value">${this.settings.joystickDeadZone}px</span></span>
        <input type="range" id="dead-zone-slider" min="4" max="20" step="1" value="${this.settings.joystickDeadZone}">
      </div>
      <div class="setting-row">
        <span class="setting-label">Sensitivity: <span id="sensitivity-value">${this.settings.cameraSensitivity.toFixed(3)}</span></span>
        <input type="range" id="sensitivity-slider" min="0.004" max="0.016" step="0.001" value="${this.settings.cameraSensitivity}">
      </div>
      <div class="toggle-row">
        <span class="setting-label">Haptic Feedback</span>
        <div class="toggle-track ${this.settings.hapticFeedback?"active":""}" id="haptic-toggle">
          <div class="toggle-knob"></div>
        </div>
      </div>
      <div class="settings-actions">
        <button class="settings-btn" id="show-help-btn">Show Help</button>
        <button class="settings-btn" id="close-settings-btn">Close</button>
      </div>
    `,t.appendChild(e),t}createHelpOverlay(){const t=document.createElement("div");return t.id="help-overlay",t.innerHTML=`
      <div id="help-content">
        <h2>How to Play</h2>
        <div class="help-row">
          <span class="help-icon joystick-icon">◉</span>
          <span>JOYSTICK — Move / Sprint (double-tap forward)</span>
        </div>
        <div class="help-row">
          <span class="help-icon joystick-icon">▤</span>
          <span>RIGHT SIDE — Look / Aim</span>
        </div>
        <div class="help-row">
          <span class="help-icon fire-icon">✕</span>
          <span>FIRE — Shoot (hold for auto-fire)</span>
        </div>
        <div class="help-row">
          <span class="help-icon jump-icon">▲</span>
          <span>JUMP — Tap to jump</span>
        </div>
        <button class="help-got-it" id="help-got-it-btn">Got it!</button>
      </div>
    `,t}removeDOM(){this.dom&&(this.dom.container.parentNode&&this.dom.container.parentNode.removeChild(this.dom.container),this.dom.styleEl.parentNode&&this.dom.styleEl.parentNode.removeChild(this.dom.styleEl),this.dom=null)}recalcJoystickCenter(){const t=document.getElementById("joystick-container");if(!t)return;const e=t.getBoundingClientRect();this.joystickCenterX=e.left+e.width/2,this.joystickCenterY=e.top+e.height/2}bindEvents(){if(this.boundTouchStart=this.onTouchStart.bind(this),this.boundTouchMove=this.onTouchMove.bind(this),this.boundTouchEnd=this.onTouchEnd.bind(this),this.boundTouchCancel=this.onTouchCancel.bind(this),document.addEventListener("touchstart",this.boundTouchStart,{passive:!0}),document.addEventListener("touchmove",this.boundTouchMove,{passive:!1}),document.addEventListener("touchend",this.boundTouchEnd,{passive:!0}),document.addEventListener("touchcancel",this.boundTouchCancel,{passive:!0}),this.dom){this.boundFireStart=n=>{n.stopPropagation();const r=n.changedTouches[0];this.fireTouchId=r.identifier,this.state.fire=!0,this.dom.fireButton.classList.add("active"),this.resetFadeTimer(),this.fireHaptic(),this.dom.fireButton.classList.remove("ripple"),this.dom.fireButton.offsetWidth,this.dom.fireButton.classList.add("ripple"),this.fireHoldStartTime=performance.now(),this.isActiveHold=!1,this.fireHoldTimer&&clearTimeout(this.fireHoldTimer),this.fireHoldTimer=setTimeout(()=>{this.fireTouchId!==null&&(this.isActiveHold=!0,this.dom.fireButton.classList.remove("active"),this.dom.fireButton.classList.add("active-hold"))},xe)},this.boundFireEnd=n=>{for(let r=0;r<n.changedTouches.length;r++)if(n.changedTouches[r].identifier===this.fireTouchId){this.state.fire=!1,this.fireTouchId=null,this.dom.fireButton.classList.remove("active"),this.dom.fireButton.classList.remove("active-hold"),this.dom.fireButton.classList.remove("ripple");break}this.fireHoldTimer&&(clearTimeout(this.fireHoldTimer),this.fireHoldTimer=null),this.isActiveHold=!1,this.resetFadeTimer()},this.boundJumpStart=n=>{n.stopPropagation();const r=n.changedTouches[0];this.jumpTouchId=r.identifier,this.state.jumpPressed=!0,this.dom.jumpButton.classList.add("active"),this.resetFadeTimer()},this.dom.fireButton.addEventListener("touchstart",this.boundFireStart,{passive:!0}),this.dom.fireButton.addEventListener("touchend",this.boundFireEnd,{passive:!0}),this.dom.fireButton.addEventListener("touchcancel",this.boundFireEnd,{passive:!0}),this.dom.jumpButton.addEventListener("touchstart",this.boundJumpStart,{passive:!0}),this.dom.jumpButton.addEventListener("touchend",()=>{this.jumpTouchId=null,this.dom&&this.dom.jumpButton.classList.remove("active"),this.resetFadeTimer()},{passive:!0}),this.boundGearClick=n=>{n.stopPropagation(),this.openSettings()},this.dom.settingsGear.addEventListener("touchstart",this.boundGearClick,{passive:!0}),this.boundSettingsDismiss=n=>{n.target===this.dom.settingsOverlay&&this.closeSettings()},this.dom.settingsOverlay.addEventListener("touchstart",this.boundSettingsDismiss,{passive:!0}),this.boundDeadZoneChange=n=>{const r=parseInt(n.target.value,10);this.settings.joystickDeadZone=r;const h=document.getElementById("dead-zone-value");h&&(h.textContent=`${r}px`),this.saveSettings(),this.applySettings(this.settings)},this.boundSensitivityChange=n=>{const r=parseFloat(n.target.value);this.settings.cameraSensitivity=r;const h=document.getElementById("sensitivity-value");h&&(h.textContent=r.toFixed(3)),this.saveSettings(),this.applySettings(this.settings)},this.boundHapticToggle=()=>{this.settings.hapticFeedback=!this.settings.hapticFeedback,this.saveSettings(),this.applySettings(this.settings);const n=document.getElementById("haptic-toggle");n&&n.classList.toggle("active",this.settings.hapticFeedback)},this.boundShowHelp=()=>{this.closeSettings(),this.showHelpOverlay()},this.boundSettingsClose=()=>{this.closeSettings()};const t=document.getElementById("dead-zone-slider"),e=document.getElementById("sensitivity-slider"),i=document.getElementById("haptic-toggle"),s=document.getElementById("show-help-btn"),o=document.getElementById("close-settings-btn");t&&(this.deadZoneSlider=t,t.addEventListener("input",this.boundDeadZoneChange)),e&&(this.sensitivitySlider=e,e.addEventListener("input",this.boundSensitivityChange)),i&&i.addEventListener("click",this.boundHapticToggle),s&&s.addEventListener("click",this.boundShowHelp),o&&o.addEventListener("click",this.boundSettingsClose),this.boundHelpDismiss=n=>{(n.target===this.dom.helpOverlay||n.target.id==="help-got-it-btn")&&this.dismissHelpOverlay()},this.dom.helpOverlay.addEventListener("touchstart",this.boundHelpDismiss,{passive:!0})}}unbindEvents(){if(this.boundTouchStart&&document.removeEventListener("touchstart",this.boundTouchStart),this.boundTouchMove&&document.removeEventListener("touchmove",this.boundTouchMove),this.boundTouchEnd&&document.removeEventListener("touchend",this.boundTouchEnd),this.boundTouchCancel&&document.removeEventListener("touchcancel",this.boundTouchCancel),this.dom){this.boundFireStart&&this.dom.fireButton.removeEventListener("touchstart",this.boundFireStart),this.boundFireEnd&&(this.dom.fireButton.removeEventListener("touchend",this.boundFireEnd),this.dom.fireButton.removeEventListener("touchcancel",this.boundFireEnd)),this.boundJumpStart&&this.dom.jumpButton.removeEventListener("touchstart",this.boundJumpStart),this.boundGearClick&&this.dom.settingsGear.removeEventListener("touchstart",this.boundGearClick),this.boundSettingsDismiss&&this.dom.settingsOverlay.removeEventListener("touchstart",this.boundSettingsDismiss),this.deadZoneSlider&&this.boundDeadZoneChange&&this.deadZoneSlider.removeEventListener("input",this.boundDeadZoneChange),this.sensitivitySlider&&this.boundSensitivityChange&&this.sensitivitySlider.removeEventListener("input",this.boundSensitivityChange);const t=document.getElementById("haptic-toggle");t&&this.boundHapticToggle&&t.removeEventListener("click",this.boundHapticToggle);const e=document.getElementById("show-help-btn");e&&this.boundShowHelp&&e.removeEventListener("click",this.boundShowHelp);const i=document.getElementById("close-settings-btn");i&&this.boundSettingsClose&&i.removeEventListener("click",this.boundSettingsClose),this.boundHelpDismiss&&this.dom.helpOverlay.removeEventListener("touchstart",this.boundHelpDismiss)}this.boundTouchStart=null,this.boundTouchMove=null,this.boundTouchEnd=null,this.boundTouchCancel=null,this.boundFireStart=null,this.boundFireEnd=null,this.boundJumpStart=null,this.boundGearClick=null,this.boundSettingsDismiss=null,this.boundDeadZoneChange=null,this.boundSensitivityChange=null,this.boundHapticToggle=null,this.boundShowHelp=null,this.boundSettingsClose=null,this.boundHelpDismiss=null}openSettings(){this.dom&&(this.settingsPanelOpen=!0,this.dom.settingsOverlay.classList.add("visible"))}closeSettings(){this.dom&&(this.settingsPanelOpen=!1,this.dom.settingsOverlay.classList.remove("visible"))}showHelpOverlay(){this.dom&&this.dom.helpOverlay.classList.add("visible")}dismissHelpOverlay(){this.dom&&(this.dom.helpOverlay.classList.remove("visible"),localStorage.setItem(yt,"true"))}setupViewportHandler(){const t=window.visualViewport;t&&(this.boundViewportResize=()=>{this.viewportResizeTimer&&clearTimeout(this.viewportResizeTimer),this.viewportResizeTimer=setTimeout(()=>{if(!this.dom)return;const e=window.visualViewport;if(!e)return;const i=e.offsetTop||0;this.dom.container.style.transform=`translateY(${-i}px)`,this.recalcJoystickCenter()},Pe)},t.addEventListener("resize",this.boundViewportResize))}teardownViewportHandler(){this.boundViewportResize&&window.visualViewport&&window.visualViewport.removeEventListener("resize",this.boundViewportResize),this.viewportResizeTimer&&(clearTimeout(this.viewportResizeTimer),this.viewportResizeTimer=null),this.boundViewportResize=null}onTouchStart(t){for(let e=0;e<t.changedTouches.length;e++){const i=t.changedTouches[e],s=this.getTouchZone(i.clientX,i.clientY);s==="fire"||s==="jump"||(this.touches.set(i.identifier,{identifier:i.identifier,zone:s}),s==="joystick"&&this.joystickTouchId===null?(this.joystickTouchId=i.identifier,this.joystickActive=!0,this.recalcJoystickCenter(),this.updateJoystickVisual(0,0),this.dom&&this.dom.joystickThumb.classList.add("active")):s==="camera"&&this.cameraTouchId===null&&(this.cameraTouchId=i.identifier,this.cameraLastX=i.clientX,this.cameraLastY=i.clientY),!this.helpHintFired&&this.dom&&(this.helpHintFired=!0,setTimeout(()=>{this.dom&&this.dom.controlHint.classList.remove("visible")},Ie)))}this.resetFadeTimer()}onTouchMove(t){t.preventDefault();for(let e=0;e<t.changedTouches.length;e++){const i=t.changedTouches[e],s=i.identifier;if(s===this.joystickTouchId){const o=i.clientX-this.joystickCenterX,n=i.clientY-this.joystickCenterY;let r=Math.sqrt(o*o+n*n),h=0,a=0;const c=this.getDeadZone();if(r>c){const y=Math.min(r,L)/r;h=o*y/L,a=-(n*y/L);const p=Math.sqrt(h*h+a*a);p>1&&(h/=p,a/=p)}this.state.moveAnalogX=h,this.state.moveAnalogZ=a,this.state.moveForward=a>.3,this.state.moveBackward=a<-.3,this.state.moveLeft=h<-.3,this.state.moveRight=h>.3;const d=o>0?Math.min(o,L):Math.max(o,-L),m=n>0?Math.min(n,L):Math.max(n,-L);this.updateJoystickVisual(d,m),this.resetFadeTimer()}if(s===this.cameraTouchId){const o=i.clientX-this.cameraLastX,n=i.clientY-this.cameraLastY;this.state.mouseDeltaX+=o,this.state.mouseDeltaY+=n,this.cameraLastX=i.clientX,this.cameraLastY=i.clientY,this.resetFadeTimer()}}}onTouchEnd(t){for(let e=0;e<t.changedTouches.length;e++){const i=t.changedTouches[e],s=i.identifier;if(s===this.joystickTouchId){const o=i.clientX-this.joystickCenterX,n=i.clientY-this.joystickCenterY;if(this.isForwardDirection(o,n)){const r=performance.now();r-this.lastForwardReleaseTime<Ee&&this.toggleSprint(),this.lastForwardReleaseTime=r}this.joystickTouchId=null,this.joystickActive=!1,this.state.moveAnalogX=0,this.state.moveAnalogZ=0,this.state.moveForward=!1,this.state.moveBackward=!1,this.state.moveLeft=!1,this.state.moveRight=!1,this.updateJoystickVisual(0,0),this.dom&&this.dom.joystickThumb.classList.remove("active")}s===this.cameraTouchId&&(this.cameraTouchId=null),s===this.fireTouchId&&(this.state.fire=!1,this.fireTouchId=null,this.dom&&(this.dom.fireButton.classList.remove("active"),this.dom.fireButton.classList.remove("active-hold"),this.dom.fireButton.classList.remove("ripple")),this.fireHoldTimer&&(clearTimeout(this.fireHoldTimer),this.fireHoldTimer=null),this.isActiveHold=!1),s===this.jumpTouchId&&(this.jumpTouchId=null,this.dom&&this.dom.jumpButton.classList.remove("active")),this.touches.delete(s)}this.resetFadeTimer()}onTouchCancel(t){for(let e=0;e<t.changedTouches.length;e++){const s=t.changedTouches[e].identifier;s===this.joystickTouchId&&(this.joystickTouchId=null,this.joystickActive=!1,this.state.moveAnalogX=0,this.state.moveAnalogZ=0,this.state.moveForward=!1,this.state.moveBackward=!1,this.state.moveLeft=!1,this.state.moveRight=!1,this.updateJoystickVisual(0,0),this.dom&&this.dom.joystickThumb.classList.remove("active")),s===this.cameraTouchId&&(this.cameraTouchId=null),s===this.fireTouchId&&(this.state.fire=!1,this.fireTouchId=null,this.dom&&(this.dom.fireButton.classList.remove("active"),this.dom.fireButton.classList.remove("active-hold"),this.dom.fireButton.classList.remove("ripple")),this.fireHoldTimer&&(clearTimeout(this.fireHoldTimer),this.fireHoldTimer=null),this.isActiveHold=!1),s===this.jumpTouchId&&(this.jumpTouchId=null,this.dom&&this.dom.jumpButton.classList.remove("active")),this.touches.delete(s)}this.resetFadeTimer()}getTouchZone(t,e){if(this.dom){const i=this.dom.fireButton.getBoundingClientRect();if(t>=i.left&&t<=i.right&&e>=i.top&&e<=i.bottom)return"fire";const s=this.dom.jumpButton.getBoundingClientRect();if(t>=s.left&&t<=s.right&&e>=s.top&&e<=s.bottom)return"jump"}return t<window.innerWidth/2?"joystick":"camera"}isForwardDirection(t,e){if(Math.abs(t)<1&&Math.abs(e)<1)return!1;const i=Math.atan2(e,t),s=Math.abs(i+Math.PI/2);return(s>Math.PI?2*Math.PI-s:s)<=Math.PI*.375}toggleSprint(){this.sprintActive=!this.sprintActive,this.state.sprint=this.sprintActive,this.updateSprintVisual()}updateSprintVisual(){this.dom&&(this.sprintActive?(this.dom.joystickBase.classList.add("sprint-active"),this.dom.sprintIndicator.classList.add("visible"),this.dom.joystickThumb.classList.add("sprint-active")):(this.dom.joystickBase.classList.remove("sprint-active"),this.dom.sprintIndicator.classList.remove("visible"),this.dom.joystickThumb.classList.remove("sprint-active")))}updateJoystickVisual(t,e){this.dom&&(this.dom.joystickThumb.style.transform=`translate(calc(-50% + ${t}px), calc(-50% + ${e}px))`)}startFadeTimer(){this.fadeTimer&&clearTimeout(this.fadeTimer),this.fadeTimer=setTimeout(()=>{this.dom&&this.dom.container.classList.add("fade-controls")},Se)}resetFadeTimer(){this.dom&&this.dom.container.classList.remove("fade-controls"),this.startFadeTimer()}getCSS(){return`
/* ── Sprint 3: Safe Area Insets (F01) ── */
:root {
  --safe-area-top: env(safe-area-inset-top, 20px);
  --safe-area-right: env(safe-area-inset-right, 20px);
  --safe-area-bottom: env(safe-area-inset-bottom, 20px);
  --safe-area-left: env(safe-area-inset-left, 20px);
  --control-margin: 10px;
  --joystick-bottom: calc(var(--safe-area-bottom) + var(--control-margin));
  --joystick-left: calc(var(--safe-area-left) + var(--control-margin));
  --fire-right: calc(var(--safe-area-right) + max(20px, 5vw));
  --fire-bottom: calc(var(--safe-area-bottom) + max(20px, 5vh));
  --hud-top: calc(var(--safe-area-top) + 10px);
}

/* ── Sprint 3: 300ms Tap Delay Elimination (F02) ── */
html { touch-action: manipulation; }

/* ── Touch Controls Container ── */
#touch-controls {
  position: fixed;
  inset: 0;
  z-index: 50;
  pointer-events: none;
  display: none;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}
#touch-controls.touch-device {
  display: block;
}

/* ── Virtual Joystick ── */
#joystick-container {
  position: fixed;
  left: var(--joystick-left);
  bottom: var(--joystick-bottom);
  width: min(160px, 30vmin);
  height: min(160px, 30vmin);
  pointer-events: none;
  touch-action: none;
}
#joystick-base {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: min(160px, 30vmin);
  height: min(160px, 30vmin);
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.05);
  pointer-events: none;
  transition: border-color 0.2s ease, opacity 0.3s ease;
}
#joystick-base.sprint-active {
  border-color: rgba(255, 200, 50, 0.8);
}

/* ── Sprint 3: Joystick Thumb Direction Indicator (F10) ── */
#joystick-thumb {
  position: absolute;
  left: 50%;
  top: 50%;
  width: min(30px, 6vmin);
  height: min(30px, 6vmin);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  pointer-events: none;
  transition: background 0.15s ease, opacity 0.3s ease;
}
#joystick-thumb.active {
  background: rgba(255, 255, 255, 0.7);
}
#joystick-thumb.sprint-active {
  background: rgba(255, 200, 50, 0.7);
  box-shadow: 0 0 8px rgba(255, 200, 50, 0.5);
}
#sprint-indicator {
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 200, 50, 0.9);
  font-family: 'Segoe UI', Tahoma, sans-serif;
  font-size: 0.7rem;
  font-weight: bold;
  letter-spacing: 0.1em;
  text-shadow: 0 0 4px rgba(0,0,0,0.8);
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
}
#sprint-indicator.visible {
  opacity: 1;
}

/* ── Fire Button ── */
#fire-button {
  position: fixed;
  right: var(--fire-right);
  bottom: var(--fire-bottom);
  width: 70px;
  width: min(70px, 12vmin);
  height: min(70px, 12vmin);
  border-radius: 50%;
  background: rgba(255, 68, 68, 0.4);
  border: 2px solid rgba(255, 68, 68, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: all;
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  transition: transform 0.1s ease, background 0.15s ease, opacity 0.3s ease;
  cursor: default;
  will-change: transform;
}
#fire-button.active {
  transform: scale(0.9);
  background: rgba(255, 68, 68, 0.7);
}

/* ── Sprint 3: Fire Button Active-Hold (F08) ── */
#fire-button.active-hold {
  opacity: 0.8;
  transform: scale(0.9);
  animation: hold-pulse 0.8s ease-in-out infinite;
}
@keyframes hold-pulse {
  0%, 100% { border-color: rgba(255, 68, 68, 0.6); }
  50%      { border-color: rgba(255, 68, 68, 1.0); }
}

/* ── Sprint 3: Fire Button Ripple Effect (F08) ── */
#fire-button::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}
#fire-button.ripple::after {
  opacity: 1;
  animation: fire-ripple 0.3s ease-out forwards;
}
@keyframes fire-ripple {
  0%   { transform: scale(0.2); opacity: 0.6; }
  100% { transform: scale(1.5); opacity: 0; }
}
#fire-button svg {
  width: 60%;
  height: 60%;
  fill: none;
  stroke: rgba(255, 255, 255, 0.8);
  stroke-width: 2;
  pointer-events: none;
}

/* ── Jump Button ── */
#jump-button {
  position: fixed;
  left: max(calc(var(--joystick-left) + 30vmin + 20px), calc(5vw + 30vmin));
  bottom: var(--joystick-bottom);
  width: 60px;
  width: min(60px, 10vmin);
  height: min(60px, 10vmin);
  border-radius: 50%;
  background: rgba(68, 200, 68, 0.4);
  border: 2px solid rgba(68, 200, 68, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: all;
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  transition: transform 0.1s ease, background 0.15s ease, opacity 0.3s ease;
  cursor: default;
  box-shadow: 0 0 4px rgba(68, 200, 68, 0.3);
  animation: jump-glow 1.5s ease-in-out infinite;
}
#jump-button.active {
  transform: scale(0.9);
  background: rgba(68, 200, 68, 0.7);
}

/* ── Sprint 3: Jump Button Glow Animation (F08) ── */
@keyframes jump-glow {
  0%, 100% { box-shadow: 0 0 4px rgba(68, 200, 68, 0.3); }
  50%      { box-shadow: 0 0 12px rgba(68, 200, 68, 0.5); }
}
#jump-button svg {
  width: 60%;
  height: 60%;
  fill: none;
  stroke: rgba(255, 255, 255, 0.8);
  stroke-width: 3;
  pointer-events: none;
}

/* ── Control Layout Hint ── */
#control-hint {
  position: fixed;
  inset: 0;
  z-index: 55;
  pointer-events: none;
  display: none;
}
#control-hint.visible {
  display: block;
}
.hint-label {
  position: absolute;
  color: rgba(255, 255, 255, 0.5);
  font-family: 'Segoe UI', Tahoma, sans-serif;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  text-shadow: 0 0 6px rgba(0,0,0,0.8);
  pointer-events: none;
}
.hint-label[data-zone="left"] {
  left: 15%;
  bottom: calc(var(--joystick-bottom) + 30vmin + 10px);
}
.hint-label[data-zone="right"] {
  right: 5%;
  top: 40%;
}
.hint-label[data-zone="fire"] {
  right: var(--fire-right);
  bottom: calc(var(--fire-bottom) + 12vmin + 8px);
}
.hint-label[data-zone="jump"] {
  left: max(calc(var(--joystick-left) + 30vmin + 20px), calc(5vw + 30vmin));
  bottom: calc(var(--joystick-bottom) + 10vmin + 8px);
}

/* ── Fade controls when idle ── */
#touch-controls.fade-controls #joystick-base,
#touch-controls.fade-controls #joystick-thumb,
#touch-controls.fade-controls #fire-button,
#touch-controls.fade-controls #jump-button {
  opacity: 0.3;
  transition: opacity 0.5s ease;
}

/* ── iOS / mobile prevention ── */
.touch-device canvas {
  touch-action: none;
}

/* ── Sprint 3: Settings Gear Icon (F07) ── */
#settings-gear {
  position: fixed;
  top: calc(var(--safe-area-top) + 10px);
  right: calc(var(--safe-area-right) + 10px);
  width: 32px;
  height: 32px;
  z-index: 65;
  pointer-events: all;
  touch-action: manipulation;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s ease, transform 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-touch-callout: none;
  user-select: none;
  -webkit-user-select: none;
}
#settings-gear:hover,
#settings-gear:active {
  opacity: 0.8;
  transform: rotate(30deg);
}
#settings-gear svg {
  width: 24px;
  height: 24px;
  fill: rgba(255, 255, 255, 0.7);
}

/* ── Sprint 3: Settings Overlay (F07) ── */
#settings-overlay {
  position: fixed;
  inset: 0;
  z-index: 70;
  background: rgba(0, 0, 0, 0.65);
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: all;
  touch-action: manipulation;
  -webkit-touch-callout: none;
  user-select: none;
  -webkit-user-select: none;
}
#settings-overlay.visible {
  display: flex;
}
#settings-panel {
  background: rgba(30, 30, 40, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 24px 28px;
  width: min(320px, 85vw);
  font-family: 'Segoe UI', Tahoma, sans-serif;
  color: #fff;
  pointer-events: all;
}
#settings-panel h2 {
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 16px 0;
  text-align: center;
}
#settings-panel .setting-row {
  display: flex;
  flex-direction: column;
  margin-bottom: 14px;
}
#settings-panel .setting-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 6px;
}
#settings-panel .setting-value {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 2px;
}
#settings-panel input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  outline: none;
  pointer-events: all;
}
#settings-panel input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  pointer-events: all;
}
#settings-panel .toggle-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}
#settings-panel .toggle-track {
  width: 44px;
  height: 24px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: background 0.2s ease;
  pointer-events: all;
}
#settings-panel .toggle-track.active {
  background: rgba(68, 200, 68, 0.6);
}
#settings-panel .toggle-knob {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: left 0.2s ease;
  pointer-events: none;
}
#settings-panel .toggle-track.active .toggle-knob {
  left: 22px;
}
#settings-panel .settings-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}
#settings-panel .settings-btn {
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.6);
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  pointer-events: all;
  font-family: 'Segoe UI', Tahoma, sans-serif;
  transition: background 0.15s ease;
}
#settings-panel .settings-btn:active {
  background: rgba(255, 255, 255, 0.1);
}

/* ── Sprint 3: Help Overlay (F09) ── */
#help-overlay {
  position: fixed;
  inset: 0;
  z-index: 75;
  background: rgba(0, 0, 0, 0.7);
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: all;
  touch-action: manipulation;
  -webkit-touch-callout: none;
  user-select: none;
  -webkit-user-select: none;
}
#help-overlay.visible {
  display: flex;
}
#help-content {
  background: rgba(30, 30, 40, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 28px 24px;
  width: min(320px, 85vw);
  font-family: 'Segoe UI', Tahoma, sans-serif;
  color: #fff;
  pointer-events: all;
  text-align: center;
}
#help-content h2 {
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 20px 0;
}
#help-content .help-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 14px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.4;
}
#help-content .help-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  flex-shrink: 0;
}
#help-content .help-icon.joystick-icon {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
#help-content .help-icon.fire-icon {
  background: rgba(255, 68, 68, 0.3);
  border: 1px solid rgba(255, 68, 68, 0.5);
}
#help-content .help-icon.jump-icon {
  background: rgba(68, 200, 68, 0.3);
  border: 1px solid rgba(68, 200, 68, 0.5);
}
#help-content .help-got-it {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 10px 40px;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  pointer-events: all;
  margin-top: 12px;
  font-family: 'Segoe UI', Tahoma, sans-serif;
}

/* ── Sprint 3: Mobile HUD Optimization (F12) ── */
@media (max-width: 768px) {
  #hp-bar-container {
    width: min(250px, 50vmin);
  }
  #hp-bar-container {
    top: calc(var(--safe-area-top) + 10px) !important;
  }
  #wave-display {
    font-size: 1rem;
  }
  #kill-count {
    font-size: 0.9rem;
  }
}
`}}function De(){var i;if(!("ontouchstart"in window||navigator.maxTouchPoints>0))return!1;const t=((i=window.matchMedia)==null?void 0:i.call(window,"(pointer: fine)").matches)??!1,e=window.innerWidth<1024;return!t||e}class Re{constructor(t){this.yaw=0,this.pitch=0,this.bobPhase=0,this.isMoving=!1,this.walking=!1,this.deathPitchOffset=0,this.deathRollOffset=0,this.camera=new wt(k,t,.1,200),this.camera.position.set(0,1.6,0),this.currentFov=k,this.targetFov=k}get aspect(){return this.camera.aspect}setAspect(t){this.camera.aspect=t,this.camera.updateProjectionMatrix()}rotate(t,e){this.yaw-=t,this.pitch+=e,this.pitch=Math.max(-at,Math.min(at,this.pitch))}setSprinting(t){this.targetFov=t?Zt:k}setMoving(t){this.isMoving=t,this.walking=t}setDeathPitch(t){this.deathPitchOffset=t}setDeathRoll(t){this.deathRollOffset=t}getForwardVector(){return new f(-Math.sin(this.yaw),0,-Math.cos(this.yaw)).normalize()}getRightVector(){return new f(Math.cos(this.yaw),0,-Math.sin(this.yaw)).normalize()}getLookDirection(){return new f(-Math.sin(this.yaw)*Math.cos(this.pitch),Math.sin(this.pitch),-Math.cos(this.yaw)*Math.cos(this.pitch)).normalize()}update(t){const e=this.targetFov-this.currentFov;if(this.currentFov+=e*Math.min(1,t*10),this.camera.fov=this.currentFov,this.camera.updateProjectionMatrix(),new f,this.isMoving&&this.walking){this.bobPhase+=t*ge;const o=Math.sin(this.bobPhase)*fe;new f(0,o,0)}else this.bobPhase=0;const i=this.pitch+this.deathPitchOffset,s=new Et;s.setFromEuler(new St(i,this.yaw,this.deathRollOffset,"YXZ")),this.camera.quaternion.copy(s)}reset(){this.yaw=0,this.pitch=0,this.currentFov=k,this.targetFov=k,this.bobPhase=0,this.isMoving=!1,this.deathPitchOffset=0,this.deathRollOffset=0}getYaw(){return this.yaw}getPitch(){return this.pitch}}class Ce{constructor(){this.collisionHandlers=[],this.world=new _t,this.world.gravity.set(0,Yt,0),this.world.broadphase=new Bt,this.world.allowSleep=!0,this.world.solver.iterations=Ut;const t=new Ht("default"),e=new Ft(t,t,{friction:.3,restitution:0});this.world.addContactMaterial(e),this.world.addEventListener("postStep",()=>{this.processCollisions()})}onCollide(t){this.collisionHandlers.push(t)}addBody(t){this.world.addBody(t)}removeBody(t){this.world.removeBody(t)}step(t){this.world.step(t,t,3)}clear(){for(;this.world.bodies.length>0;)this.world.removeBody(this.world.bodies[0]);this.collisionHandlers=[]}processCollisions(){const t=this.world.contacts,e=new Set;for(const i of t){if(!i.bi||!i.bj)continue;const s=i.bi,o=i.bj,n=s.id+"-"+o.id,r=o.id+"-"+s.id;if(!(e.has(n)||e.has(r))){e.add(n),e.add(r);for(const h of this.collisionHandlers)h({bodyA:s,bodyB:o})}}}createStaticBody(t,e,i=l.ARENA,s=65533){const o=new $({mass:0});return o.addShape(t),e instanceof f?o.position.set(e.x,e.y,e.z):o.position.set(e[0],e[1],e[2]),o.collisionFilterGroup=i,o.collisionFilterMask=s,o}createDynamicBody(t,e,i,s,o){const n=new $({mass:e});return n.addShape(t),i instanceof f?n.position.set(i.x,i.y,i.z):n.position.set(i[0],i[1],i[2]),n.collisionFilterGroup=s,n.collisionFilterMask=o,n.updateMassProperties(),n}}class bt{constructor(t){this.s=t|0}next(){let t=this.s+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}nextRange(t,e){return t+this.next()*(e-t)}nextInt(t,e){return Math.floor(this.nextRange(t,e+1))}nextBool(t=.5){return this.next()<t}pick(t){return t[Math.floor(this.next()*t.length)]}shuffle(t){for(let e=t.length-1;e>0;e--){const i=Math.floor(this.next()*(e+1));[t[e],t[i]]=[t[i],t[e]]}return t}}class _e{generate(t){const e=new bt(t),i=T/2,s=[{position:[0,S/2,-i],size:[T,S,D]},{position:[0,S/2,i],size:[T,S,D]},{position:[i,S/2,0],size:[D,S,T]},{position:[-i,S/2,0],size:[D,S,T]}],o=e.nextInt(Wt,Nt),n=[],r=[];for(let c=0;c<o;c++){const d=e.nextBool(.5)?"box":"cylinder";let m,b=0;do{const p=e.nextRange(-i+R,i-R),I=e.nextRange(-i+R,i-R);m=[p,0,I],b++}while(b<20&&r.some(p=>Math.sqrt((p[0]-m[0])**2+(p[2]-m[2])**2)<tt+1)&&Math.sqrt(m[0]**2+m[2]**2)<tt);r.push(m);const y=e.nextRange(3,8);if(d==="box"){const p=e.nextRange(1,3),I=e.nextRange(1,3);n.push({shape:d,position:m,height:y,size:[p,I]})}else{const p=e.nextRange(.5,1.5);n.push({shape:d,position:m,height:y,radius:p})}}const h=Vt.slice(0,pe),a=this.generateEnemySpawnPoints(e,i,n);return{seed:t,size:{width:T,depth:T},walls:s,pillars:n,healthPackPositions:h,enemySpawnPoints:a,playerSpawn:H,bossSpawn:F}}generateEnemySpawnPoints(t,e,i){const s=[],n=e-2;for(let r=0;r<20;r++){const h=t.nextInt(0,3);let a,c;switch(h){case 0:a=t.nextRange(-n,n),c=-n;break;case 1:a=t.nextRange(-n,n),c=n;break;case 2:a=n,c=t.nextRange(-n,n);break;default:a=-n,c=t.nextRange(-n,n);break}i.some(m=>Math.sqrt((m.position[0]-a)**2+(m.position[2]-c)**2)<2)||s.some(b=>Math.sqrt((b[0]-a)**2+(b[2]-c)**2)<3)||s.push([a,0,c])}if(s.length<10)for(let r=0;r<12;r++){const h=r/12*Math.PI*2,a=e-2-1;s.push([Math.cos(h)*a,0,Math.sin(h)*a])}return t.shuffle(s)}}class Be{constructor(t){this.collisionBodies=[],this.physicsWorld=t,this.group=new pt}build(t){this.clear(),this.createFloor(t);for(const e of t.walls)this.createWall(e);for(const e of t.pillars)this.createPillar(e)}createFloor(t){const e=new Tt(t.size.width,t.size.depth),i=new w({color:v.FLOOR,flatShading:!0}),s=new g(e,i);s.rotation.x=-Math.PI/2,s.position.set(0,-.01,0),this.group.add(s);const o=new Lt(t.size.width,Math.round(t.size.width/4),5592405,4473924);o.position.y=0,this.group.add(o);const n=this.physicsWorld.createStaticBody(new Ot,[0,0,0],l.ARENA,l.PLAYER|l.ENEMIES|l.PLAYER_PROJECTILE|l.BOSS_PROJECTILE);n.quaternion.setFromAxisAngle(new z(1,0,0),-Math.PI/2),this.physicsWorld.addBody(n),this.collisionBodies.push(n)}createWall(t){const[e,i,s]=t.size,[o,n,r]=t.position,h=new Z(e,i,s),a=new w({color:v.WALL,flatShading:!0}),c=new g(h,a);c.position.set(o,n,r),this.group.add(c);const d=this.physicsWorld.createStaticBody(new Q(new z(e/2,i/2,s/2)),[o,n,r],l.ARENA,l.PLAYER|l.ENEMIES|l.PLAYER_PROJECTILE|l.BOSS_PROJECTILE);this.physicsWorld.addBody(d),this.collisionBodies.push(d)}createPillar(t){const[e,i,s]=t.position;if(t.shape==="box"){const[o,n]=t.size??[2,2],r=t.height,h=new Z(o,r,n),a=new w({color:v.PILLAR,flatShading:!0}),c=new g(h,a);c.position.set(e,r/2,s),this.group.add(c);const d=this.physicsWorld.createStaticBody(new Q(new z(o/2,r/2,n/2)),[e,r/2,s],l.ARENA,l.PLAYER|l.ENEMIES|l.PLAYER_PROJECTILE|l.BOSS_PROJECTILE);this.physicsWorld.addBody(d),this.collisionBodies.push(d)}else{const o=t.radius??1,n=t.height,r=new P(o,o,n,8),h=new w({color:v.PILLAR,flatShading:!0}),a=new g(r,h);a.position.set(e,n/2,s),this.group.add(a);const c=this.physicsWorld.createStaticBody(new M(o,o,n,8),[e,n/2,s],l.ARENA,l.PLAYER|l.ENEMIES|l.PLAYER_PROJECTILE|l.BOSS_PROJECTILE);this.physicsWorld.addBody(c),this.collisionBodies.push(c)}}clear(){for(;this.group.children.length>0;){const t=this.group.children[0];t instanceof g&&(t.geometry.dispose(),Array.isArray(t.material)?t.material.forEach(e=>e.dispose()):t.material.dispose()),this.group.remove(t)}for(const t of this.collisionBodies)this.physicsWorld.removeBody(t);this.collisionBodies.length=0}}const j=class j{constructor(){this.isAlive=!0,this.id="ent_"+j.nextId++,this.createdAt=performance.now()}destroy(){this.isAlive=!1}};j.nextId=0;let A=j;class O extends A{constructor(t,e,i,s,o,n,r=vt,h,a=4513279){super(),this.trail=null,this.physicsWorld=h,this.speed=i,this.damage=s,this.owner=o,this.direction=e.normalize(),this.lifetime=n;const c=new ft(r,6,6),d=new gt({color:a});this.mesh=new g(c,d),this.mesh.position.copy(t);const m=new jt(r);this.body=h.createDynamicBody(m,1,[t.x,t.y,t.z],o==="player"?l.PLAYER_PROJECTILE:l.BOSS_PROJECTILE,o==="player"?l.ARENA|l.ENEMIES:l.PLAYER|l.ARENA),this.body.userData={entity:this},this.body.sleepSpeedLimit=0,this.body.sleepTimeLimit=999,h.addBody(this.body)}update(t){this.isAlive&&(this.body.velocity.x=this.direction.x*this.speed,this.body.velocity.y=this.direction.y*this.speed,this.body.velocity.z=this.direction.z*this.speed,this.lifetime-=t,this.lifetime<=0&&(this.isAlive=!1),this.mesh.position.set(this.body.position.x,this.body.position.y,this.body.position.z))}onHit(){this.isAlive=!1}destroy(){this.isAlive=!1,this.body&&this.physicsWorld.removeBody(this.body),this.mesh&&(this.mesh.geometry.dispose(),this.mesh.material.dispose())}}class He{constructor(t,e,i){this.fireRate=ne,this.lastFireTime=0,this.crosshairBloom=0,this.camera=t,this.physicsWorld=e,this.owner=i}canFire(){return performance.now()/1e3-this.lastFireTime>=this.fireRate}fire(){if(!this.canFire())return null;const t=performance.now()/1e3;this.lastFireTime=t;const e=this.camera.getLookDirection(),i=this.camera.camera.position.clone();i.add(e.clone().multiplyScalar(1));const s=new O(i,e,ae,re,"player",he,vt,this.physicsWorld,v.PLAYER_PROJECTILE);return this.crosshairBloom=1,s}update(t){this.crosshairBloom>0&&(this.crosshairBloom=Math.max(0,this.crosshairBloom-t/le))}}class mt extends A{constructor(t,e){super(),this.health=W,this.maxHealth=W,this.grounded=!1,this.isSprinting=!1,this.currentSpeed=0,this.camera=t,this.physicsWorld=e,this.weapon=new He(t,e,this);const i=new P(C,C,N,8),s=new w({color:3368652,flatShading:!0,transparent:!0,opacity:0});this.mesh=new g(i,s),this.mesh.visible=!1,this.body=e.createDynamicBody(new M(C,C,N,8),80,[0,N/2,0],l.PLAYER,l.ARENA|l.ENEMIES|l.HEALTH_PACK|l.BOSS_PROJECTILE),this.body.fixedRotation=!0,this.body.updateMassProperties(),this.body.linearDamping=0,this.body.userData={entity:this},e.addBody(this.body)}update(t){this.isAlive}applyMovement(t,e){if(!this.isAlive)return;this.isSprinting=t.sprint;const i=this.camera.getForwardVector(),s=this.camera.getRightVector(),o=new f;if(t.moveAnalogX!==void 0&&t.moveAnalogZ!==void 0){const a=i.clone().multiplyScalar(t.moveAnalogZ),c=s.clone().multiplyScalar(t.moveAnalogX);o.copy(a.add(c))}else t.moveForward&&o.add(i),t.moveBackward&&o.sub(i),t.moveLeft&&o.sub(s),t.moveRight&&o.add(s);o.lengthSq()>0&&o.normalize();const n=this.isSprinting?et*Kt:et,r=o.lengthSq()>0;r?this.currentSpeed=Math.min(this.currentSpeed+n/qt*e,n):this.currentSpeed=Math.max(this.currentSpeed-n/$t*e,0);const h=o.clone().multiplyScalar(this.currentSpeed);this.body.velocity.x=h.x,this.body.velocity.z=h.z,t.jumpPressed&&this.grounded&&(this.body.velocity.y=Qt,this.grounded=!1),this.camera.setSprinting(this.isSprinting),this.camera.setMoving(r)}applyLook(t,e){this.isAlive&&this.camera.rotate(t,e)}syncCamera(){this.isAlive&&this.camera.camera.position.set(this.body.position.x,this.body.position.y+Xt,this.body.position.z)}takeDamage(t){this.isAlive&&(this.health=Math.max(0,this.health-t),this.health<=0&&(this.isAlive=!1))}heal(t){this.isAlive&&(this.health=Math.min(this.maxHealth,this.health+t))}reset(t){this.health=W,this.isAlive=!0,this.grounded=!1,this.currentSpeed=0,this.body.velocity.set(0,0,0),this.body.angularVelocity.set(0,0,0),t&&this.body.position.set(t.x,t.y,t.z)}destroy(){this.isAlive=!1,this.physicsWorld.removeBody(this.body),this.mesh.geometry.dispose(),this.mesh.material.dispose()}}class B extends A{constructor(t,e){super(),this.health=it,this.maxHealth=it,this.speed=te,this.contactDamage=ee,this.target=new f,this.knockbackTimer=0,this.flashTimer=0,this.isFlashing=!1,this.physicsWorld=e;const i=new P(.4,.6,1.2,6),s=new w({color:v.IMP,flatShading:!0});this.mesh=new g(i,s),this.mesh.position.copy(t),this.mesh.position.y+=.6,this.body=e.createDynamicBody(new M(.4,.6,1.2,6),30,[t.x,t.y+.6,t.z],l.ENEMIES,l.PLAYER|l.ARENA|l.PLAYER_PROJECTILE|l.ENEMIES),this.body.fixedRotation=!0,this.body.linearDamping=.9,this.body.updateMassProperties(),this.body.userData={entity:this},e.addBody(this.body)}update(t){if(!this.isAlive)return;if(this.knockbackTimer>0){this.knockbackTimer-=t,this.syncMesh();return}const e=new f(this.target.x-this.body.position.x,0,this.target.z-this.body.position.z),i=e.length();if(i>.5?(e.normalize(),this.body.velocity.x=e.x*this.speed,this.body.velocity.z=e.z*this.speed):(this.body.velocity.x=0,this.body.velocity.z=0),i>.1){const s=Math.atan2(e.x,e.z);this.mesh.rotation.y=s}this.isFlashing&&(this.flashTimer-=t,this.flashTimer<=0&&(this.isFlashing=!1,this.mesh.material.color.setHex(v.IMP))),this.syncMesh()}takeDamage(t){this.isAlive&&(this.health-=t,this.flashTimer=.1,this.isFlashing=!0,this.mesh.material.color.setHex(16777215),this.health<=0&&(this.isAlive=!1))}applyKnockback(t){this.knockbackTimer=ie;const e=new f(this.body.position.x-t.x,0,this.body.position.z-t.z).normalize();this.body.velocity.x=e.x*15,this.body.velocity.z=e.z*15,this.body.velocity.y=5}syncMesh(){this.mesh.position.set(this.body.position.x,this.body.position.y,this.body.position.z)}destroy(){this.isAlive=!1,this.body&&this.physicsWorld.removeBody(this.body),this.mesh&&(this.mesh.geometry.dispose(),this.mesh.material.dispose())}}class X extends A{constructor(t,e){super(),this.health=st,this.maxHealth=st,this.moveSpeed=se,this.rangedDamage=ot,this.target=new f,this.fireCooldown=0,this.flashTimer=0,this.isFlashing=!1,this.physicsWorld=e,this.mesh=new pt;const i=new P(x*.8,x*1.2,E,8),s=new w({color:v.BOSS,flatShading:!0});this.bodyMesh=new g(i,s),this.bodyMesh.position.y=E/2,this.mesh.add(this.bodyMesh);const o=new ft(.6,6,6),n=new w({color:10040115,flatShading:!0}),r=new g(o,n);r.position.y=E+.3,this.mesh.add(r);for(let h=0;h<4;h++){const a=h/4*Math.PI*2,c=new At(.2,.5,4),d=new w({color:11149858,flatShading:!0}),m=new g(c,d);m.position.set(Math.cos(a)*x,E*.7,Math.sin(a)*x),m.rotation.z=Math.PI/4,m.rotation.y=a,this.mesh.add(m)}this.mesh.position.copy(t),this.mesh.position.y+=0,this.body=e.createDynamicBody(new M(x*.8,x*1.2,E,8),200,[t.x,t.y+E/2,t.z],l.ENEMIES,l.PLAYER|l.ARENA|l.PLAYER_PROJECTILE|l.ENEMIES),this.body.fixedRotation=!0,this.body.linearDamping=.8,this.body.updateMassProperties(),this.body.userData={entity:this},e.addBody(this.body)}update(t){if(!this.isAlive)return;const e=new f(this.target.x-this.body.position.x,0,this.target.z-this.body.position.z),i=e.length();if(i>3?(e.normalize(),this.body.velocity.x=e.x*this.moveSpeed,this.body.velocity.z=e.z*this.moveSpeed):(this.body.velocity.x*=.9,this.body.velocity.z*=.9),i>.1){const s=Math.atan2(e.x,e.z);this.mesh.rotation.y=s}this.fireCooldown-=t,this.fireCooldown<=0&&i<30&&(this.fireProjectile(),this.fireCooldown=oe),this.isFlashing&&(this.flashTimer-=t,this.flashTimer<=0&&(this.isFlashing=!1,this.bodyMesh.material.color.setHex(v.BOSS))),this.syncMesh()}fireProjectile(){const t=new f(this.target.x-this.body.position.x,this.target.y-this.body.position.y-E/2,this.target.z-this.body.position.z).normalize(),e=new f(this.body.position.x,this.body.position.y+E/2,this.body.position.z);return new O(e,t,ce,ot,"boss",de,me,this.physicsWorld,v.BOSS_PROJECTILE)}takeDamage(t){this.isAlive&&(this.health-=t,this.flashTimer=.1,this.isFlashing=!0,this.bodyMesh.material.color.setHex(16777215),this.health<=0&&(this.isAlive=!1))}syncMesh(){this.mesh.position.set(this.body.position.x,this.body.position.y-E/2,this.body.position.z)}destroy(){this.isAlive=!1,this.body&&this.physicsWorld.removeBody(this.body),this.mesh.traverse(t=>{t instanceof g&&(t.geometry.dispose(),Array.isArray(t.material)?t.material.forEach(e=>e.dispose()):t.material.dispose())})}}class K extends A{constructor(t,e){super(),this.healAmount=ue,this.consumed=!1,this.pulsePhase=0,this.physicsWorld=e;const i=new P(_,_,.3,8),s=new w({color:v.HEALTH_PACK,emissive:v.HEALTH_PACK,emissiveIntensity:.5,flatShading:!0});this.mesh=new g(i,s),this.mesh.position.copy(t),this.mesh.position.y+=.15,this.body=e.createDynamicBody(new M(_,_,.3,8),0,[t.x,t.y+.15,t.z],l.HEALTH_PACK,l.PLAYER),this.body.userData={entity:this},this.body.sleepSpeedLimit=0,e.addBody(this.body)}update(t){if(!this.isAlive||this.consumed)return;this.pulsePhase+=t*2,this.mesh.rotation.y+=t*1.5;const e=1+Math.sin(this.pulsePhase)*.15;this.mesh.scale.set(e,e,e),this.mesh.position.set(this.body.position.x,this.body.position.y,this.body.position.z)}onConsumed(){this.consumed=!0,this.isAlive=!1,this.mesh.visible=!1}destroy(){this.isAlive=!1,this.body&&this.physicsWorld.removeBody(this.body),this.mesh&&(this.mesh.geometry.dispose(),this.mesh.material.dispose())}}class Fe{constructor(){this.currentWaveIndex=0,this.state="idle",this.enemiesAlive=0,this.enemiesKilled=0,this.totalEnemiesThisWave=0,this.timer=0,this.currentWaveDef=U[0],this.onSpawnEnemies=null,this.onSpawnHealthPacks=null,this.onWaveStateChange=null}startGame(){this.currentWaveIndex=0,this.state="idle",this.enemiesAlive=0,this.enemiesKilled=0,this.timer=0,this.beginSpawning()}onEnemyKilled(){this.state==="fighting"&&(this.enemiesAlive=Math.max(0,this.enemiesAlive-1),this.enemiesKilled++,this.enemiesAlive<=0&&this.beginIntermission())}onPlayerDeath(){var t;this.state="gameOver",(t=this.onWaveStateChange)==null||t.call(this,"gameOver",this.currentWaveIndex+1)}update(t){this.timer-=t,this.state==="spawning"&&this.timer<=0&&this.beginFighting(),this.state==="intermission"&&this.timer<=0&&this.beginNextWave()}getCurrentWaveDef(){return this.currentWaveDef}isLastWave(){return this.currentWaveIndex>=q-1}reset(){this.currentWaveIndex=0,this.state="idle",this.enemiesAlive=0,this.enemiesKilled=0,this.totalEnemiesThisWave=0,this.timer=0,this.currentWaveDef=U[0]}beginSpawning(){var t,e;this.currentWaveDef=U[this.currentWaveIndex],this.enemiesKilled=0,this.currentWaveDef.enemyType==="imp"?(this.totalEnemiesThisWave=this.currentWaveDef.enemyCount,this.enemiesAlive=this.currentWaveDef.enemyCount):(this.totalEnemiesThisWave=this.currentWaveDef.hasBoss?1:0,this.enemiesAlive=this.currentWaveDef.hasBoss?1:0),this.state="spawning",this.timer=2,(t=this.onSpawnEnemies)==null||t.call(this,this.currentWaveDef.enemyCount,this.currentWaveDef),(e=this.onWaveStateChange)==null||e.call(this,"spawning",this.currentWaveIndex+1)}beginFighting(){var t;this.state="fighting",(t=this.onWaveStateChange)==null||t.call(this,"fighting",this.currentWaveIndex+1)}beginIntermission(){var t,e,i;if(this.isLastWave()&&this.currentWaveDef.hasBoss){this.state="victory",(t=this.onWaveStateChange)==null||t.call(this,"victory",this.currentWaveIndex+1);return}this.state="intermission",this.timer=3,(e=this.onSpawnHealthPacks)==null||e.call(this),(i=this.onWaveStateChange)==null||i.call(this,"intermission",this.currentWaveIndex+1)}beginNextWave(){var t;if(this.currentWaveIndex>=q-1){this.state="victory",(t=this.onWaveStateChange)==null||t.call(this,"victory",this.currentWaveIndex+1);return}this.currentWaveIndex++,this.beginSpawning()}}class Oe{constructor(){this.hpLabel=document.getElementById("hp-label"),this.hpFill=document.getElementById("hp-bar-fill"),this.waveDisplay=document.getElementById("wave-display"),this.killCount=document.getElementById("kill-count"),this.container=document.getElementById("hud")}show(){this.container.classList.add("visible")}hide(){this.container.classList.remove("visible")}update(t,e,i,s,o){const n=Math.max(0,t/e*100);this.hpFill.style.width=`${n}%`,this.hpLabel.textContent=`HP: ${Math.max(0,Math.round(t))}/${e}`,this.hpFill.classList.remove("low","medium","high"),n<=30?this.hpFill.classList.add("low"):n<=60?this.hpFill.classList.add("medium"):this.hpFill.classList.add("high"),this.waveDisplay.textContent=`Wave ${i}/${q}`,this.killCount.textContent=`${s}/${o} Killed`}}class je{constructor(){this.element=document.getElementById("crosshair"),this.svgCircle=this.element.querySelector("circle")}show(){this.element.classList.add("visible")}hide(){this.element.classList.remove("visible")}setBloom(t){if(this.svgCircle){const s=2+t*8;this.svgCircle.setAttribute("r",s.toString())}}reset(){this.setBloom(0)}}class ze{constructor(){this.onStartClick=null,this.onRestartFromDeath=null,this.onRestartFromVictory=null,this.onPointerLockRetry=null,this.startOverlay=document.getElementById("start-overlay"),this.deathScreen=document.getElementById("death-screen"),this.victoryScreen=document.getElementById("victory-screen"),this.notification=document.getElementById("notification"),this.deathWaveText=document.getElementById("death-wave-text"),this.notificationMain=this.notification.querySelector(".main-text"),this.notificationSub=this.notification.querySelector(".subtext"),this.pointerLockRequired=document.getElementById("pointer-lock-required"),this.loadingScreen=document.getElementById("loading-screen"),this.mobileStartText=document.getElementById("mobile-start-text"),this.mobileControlDiagram=document.getElementById("mobile-control-diagram"),this.bindEvents()}bindEvents(){var e,i,s;const t=()=>{var o;(o=this.onStartClick)==null||o.call(this)};this.startOverlay.addEventListener("click",t),this.startOverlay.addEventListener("touchstart",o=>{o.preventDefault(),t()},{passive:!1}),(e=document.getElementById("restart-from-death"))==null||e.addEventListener("click",()=>{var o;(o=this.onRestartFromDeath)==null||o.call(this)}),(i=document.getElementById("restart-from-victory"))==null||i.addEventListener("click",()=>{var o;(o=this.onRestartFromVictory)==null||o.call(this)}),(s=document.getElementById("pointer-lock-retry"))==null||s.addEventListener("click",()=>{var o;(o=this.onPointerLockRetry)==null||o.call(this)})}hideLoading(){this.loadingScreen.classList.add("hidden")}showStart(){this.startOverlay.classList.remove("hidden"),this.hideDeath(),this.hideVictory(),this.hideNotification(),this.mobileStartText.style.display="none",this.mobileControlDiagram.style.display="none";const t=this.startOverlay.querySelector(".controls-hint");t&&(t.style.display="block")}showMobileStart(){this.startOverlay.classList.remove("hidden"),this.hideDeath(),this.hideVictory(),this.hideNotification(),this.mobileStartText.style.display="block",this.mobileControlDiagram.style.display="flex";const t=this.startOverlay.querySelector(".controls-hint");t&&(t.style.display="none")}hideStart(){this.startOverlay.classList.add("hidden")}showDeath(t){this.deathScreen.classList.add("visible"),this.deathWaveText.textContent=`Wave ${t}/5`}showMobileDeath(t){this.deathScreen.classList.add("visible"),this.deathWaveText.textContent=`Wave ${t}/5`;const e=this.deathScreen.querySelector(".restart-hint");e&&(e.textContent="Tap to restart")}hideDeath(){this.deathScreen.classList.remove("visible")}showVictory(){this.victoryScreen.classList.add("visible")}showMobileVictory(){this.victoryScreen.classList.add("visible");const t=this.victoryScreen.querySelector(".restart-hint");t&&(t.textContent="Tap to play again")}hideVictory(){this.victoryScreen.classList.remove("visible")}showNotification(t,e="",i=2){this.notificationMain.textContent=t,this.notificationSub.textContent=e,this.notification.classList.add("show"),i>0&&setTimeout(()=>{this.hideNotification()},i*1e3)}hideNotification(){this.notification.classList.remove("show")}showPointerLockRequired(){this.pointerLockRequired.classList.add("visible")}hidePointerLockRequired(){this.pointerLockRequired.classList.remove("visible")}}class We{constructor(){this.active=!1,this.elapsed=0,this.duration=ve,this.element=document.getElementById("damage-flash")}show(){this.active=!0,this.elapsed=0,this.element.style.opacity="1"}update(t){if(!this.active)return;this.elapsed+=t;const e=this.elapsed/this.duration;e>=1?(this.active=!1,this.element.style.opacity="0"):this.element.style.opacity=(1-e).toString()}reset(){this.active=!1,this.elapsed=0,this.element.style.opacity="0"}}class Ne{constructor(){this.timer=0,this.element=document.getElementById("hit-marker")}show(){this.timer=ye,this.element.classList.add("show")}update(t){this.timer<=0||(this.timer-=t,this.timer<=0&&this.element.classList.remove("show"))}reset(){this.timer=0,this.element.classList.remove("show")}}class Ve{constructor(t,e){this.fragments=[],this.scene=t,this.physicsWorld=e}spawnImp(t){this.spawnFragments(t,v.IMP,rt.IMP,V)}spawnBoss(t){this.spawnFragments(t,v.BOSS,rt.BOSS,V*1.5),this.spawnFragments(t,16737826,8,V*2)}spawnFragments(t,e,i,s){for(let o=0;o<i;o++){const n=.1+Math.random()*.2,r=new Z(n,n,n),h=new gt({color:e}),a=new g(r,h);a.position.copy(t),a.position.x+=(Math.random()-.5)*.3,a.position.y+=(Math.random()-.5)*.3,a.position.z+=(Math.random()-.5)*.3;const c=new f((Math.random()-.5)*s*2,Math.random()*s,(Math.random()-.5)*s*2),d=new f((Math.random()-.5)*10,(Math.random()-.5)*10,(Math.random()-.5)*10);this.scene.add(a),this.fragments.push({mesh:a,velocity:c,lifetime:ht,angularVelocity:d})}}update(t){for(let e=this.fragments.length-1;e>=0;e--){const i=this.fragments[e];i.lifetime-=t,i.velocity.y+=-20*t,i.mesh.position.add(i.velocity.clone().multiplyScalar(t)),i.mesh.rotation.x+=i.angularVelocity.x*t,i.mesh.rotation.y+=i.angularVelocity.y*t,i.mesh.rotation.z+=i.angularVelocity.z*t;const s=Math.max(0,i.lifetime/ht),o=i.mesh.material;Array.isArray(o)||(o.transparent=!0,o.opacity=s),i.lifetime<=0&&(this.scene.remove(i.mesh),i.mesh.geometry.dispose(),i.mesh.material.dispose(),this.fragments.splice(e,1))}}clear(){for(const t of this.fragments)this.scene.remove(t.mesh),t.mesh.geometry.dispose(),t.mesh.material.dispose();this.fragments.length=0}}class Ye{constructor(t){this.timer=0,this.duration=be,this.intensity=we,this.camera=t}shake(t,e){this.timer=t??this.duration,this.intensity=e??this.intensity}update(t){if(!(this.timer<=0)&&(this.timer-=t,this.timer>0)){const e=this.timer/this.duration*this.intensity;this.camera.camera.position.x+=(Math.random()-.5)*e,this.camera.camera.position.y+=(Math.random()-.5)*e}}reset(){this.timer=0}}class Ge{constructor(t){this.player=null,this.imps=[],this.bosses=[],this.projectiles=[],this.healthPacks=[],this.pendingRemovals=[],this.gamePhase="loading",this.currentSeed=0,this.isTouchDevice=!1,this.lastInput={moveForward:!1,moveBackward:!1,moveLeft:!1,moveRight:!1,fire:!1,jumpPressed:!1,sprint:!1,mouseDeltaX:0,mouseDeltaY:0,restart:!1},this.touchAdapter=null,this.boundViewportResize=null,this.fixedUpdate=o=>{var n,r,h;if(this.lastInput=this.inputAdapter.poll(),this.gamePhase==="dead"||this.gamePhase==="victory"){this.lastInput.restart&&this.restart();return}if(!this.isDying&&this.gamePhase==="playing"){if(this.lastInput.restart){this.restart();return}if((n=this.player)==null||n.applyMovement(this.lastInput,o),(r=this.player)==null||r.applyLook(this.lastInput.mouseDeltaX,this.lastInput.mouseDeltaY),this.lastInput.fire&&this.player){const a=this.player.weapon.fire();a&&(this.projectiles.push(a),this.scene.add(a.mesh))}(h=this.player)==null||h.weapon.update(o);for(const a of this.imps)a.isAlive&&this.player&&a.target.set(this.player.body.position.x,this.player.body.position.y,this.player.body.position.z),a.update(o);for(const a of this.bosses)a.isAlive&&this.player&&a.target.set(this.player.body.position.x,this.player.body.position.y,this.player.body.position.z),a.update(o);for(const a of this.projectiles)a.update(o);for(const a of this.healthPacks)a.update(o);this.waveManager.update(o),this.physicsWorld.step(o),this.flushRemovals()}},this.renderFrame=o=>{var n;(n=this.player)==null||n.syncCamera(),this.camera.update(1/60),this.updateDeathAnimation(1/60),this.damageFlash.update(1/60),this.hitMarker.update(1/60),this.deathEffect.update(1/60),this.screenShake.update(1/60),this.gamePhase==="playing"&&this.player&&this.hud.update(this.player.health,this.player.maxHealth,this.waveManager.currentWaveIndex+1,this.waveManager.enemiesKilled,this.waveManager.totalEnemiesThisWave),this.player&&this.crosshair.setBloom(this.player.weapon.crosshairBloom),this.renderer.render(this.scene,this.camera.camera)},this.isDying=!1,this.deathAnimTimer=0,this.DEATH_ANIM_DURATION=1.2,this.onResize=()=>{const o=window.innerWidth,n=window.innerHeight;this.renderer.setSize(o,n),this.camera.setAspect(o/n),this.isTouchDevice&&this.inputAdapter instanceof dt},this.container=t,this.isTouchDevice=De(),this.renderer=new kt({antialias:!0}),this.renderer.setSize(window.innerWidth,window.innerHeight),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2)),this.renderer.shadowMap.enabled=!1,this.renderer.toneMapping=xt,this.renderer.toneMappingExposure=1,t.appendChild(this.renderer.domElement),this.scene=new It,this.scene.background=new Pt(1118498),this.scene.fog=new Mt(1118498,40,80);const e=new Dt(6715289,1.2);this.scene.add(e);const i=new Rt(16777215,2);i.position.set(10,20,10),this.scene.add(i);const s=new Ct(6719675,3355477,.8);this.scene.add(s),this.inputManager=new Me,this.inputAdapter=this.inputManager,this.camera=new Re(window.innerWidth/window.innerHeight),this.physicsWorld=new Ce,this.gameLoop=new zt(Gt,Jt),this.arenaGenerator=new _e,this.arenaMesh=new Be(this.physicsWorld),this.waveManager=new Fe,this.hud=new Oe,this.crosshair=new je,this.overlay=new ze,this.damageFlash=new We,this.hitMarker=new Ne,this.deathEffect=new Ve(this.scene,this.physicsWorld),this.screenShake=new Ye(this.camera),this.setupCollisions(),this.setupWaveManager(),this.setupInput(),window.addEventListener("resize",this.onResize),this.gameLoop.onFixedUpdate=this.fixedUpdate,this.gameLoop.onRender=this.renderFrame,this.currentSeed=Date.now()}async init(){if(this.isTouchDevice){const t=new dt;this.inputAdapter=t,this.touchAdapter=t,this.inputAdapter.init(this.renderer.domElement),this.setupVisualViewport(),localStorage.getItem(yt)||t.showHelpOverlay(),this.overlay.onStartClick=()=>{this.overlay.hideStart(),this.gamePhase==="menu"&&this.startPlaying()}}else this.inputManager.init(this.renderer.domElement),this.inputManager.onPointerLockChange=()=>{this.overlay.hideStart()},this.inputManager.onPointerLockError=()=>{this.overlay.showPointerLockRequired()},this.overlay.onStartClick=()=>{this.inputManager.requestPointerLock(this.renderer.domElement),this.gamePhase==="menu"&&this.startPlaying()},this.overlay.onPointerLockRetry=()=>{this.inputManager.requestPointerLock(this.renderer.domElement),this.overlay.hidePointerLockRequired()};this.overlay.onRestartFromDeath=()=>this.restart(),this.overlay.onRestartFromVictory=()=>this.restart(),this.buildArena(this.currentSeed),this.gamePhase="menu",this.overlay.hideLoading(),this.isTouchDevice?this.overlay.showMobileStart():this.overlay.showStart(),this.hud.hide(),this.crosshair.hide(),this.gameLoop.start()}buildArena(t){this.arenaMesh.clear();const e=this.arenaGenerator.generate(t);this.arenaMesh.build(e),this.scene.add(this.arenaMesh.group)}spawnPlayer(){this.player=new mt(this.camera,this.physicsWorld),this.player.body.position.set(H[0],H[1],H[2])}spawnImp(t){const e=new B(t,this.physicsWorld);this.imps.push(e),this.scene.add(e.mesh)}spawnBoss(){if(!this.player)return;const t=new f(F[0],F[1],F[2]),e=new X(t,this.physicsWorld);this.bosses.push(e),this.scene.add(e.mesh)}spawnHealthPack(t){const e=new K(t,this.physicsWorld);this.healthPacks.push(e),this.scene.add(e.mesh)}setupCollisions(){this.physicsWorld.onCollide(t=>{var b,y;const e=t.bodyA,i=t.bodyB,s=(b=e.userData)==null?void 0:b.entity,o=(y=i.userData)==null?void 0:y.entity;if(!s||!o)return;e.collisionFilterGroup,i.collisionFilterGroup;const n=[s,o],r=p=>n.find(I=>I instanceof p),h=r(mt),a=r(B),c=r(X),d=r(O),m=r(K);if(h&&a&&a.isAlive&&h.isAlive){h.takeDamage(a.contactDamage),this.damageFlash.show(),this.touchAdapter&&this.touchAdapter.damageHaptic();const p=new f(h.body.position.x,h.body.position.y,h.body.position.z);a.applyKnockback(p),h.isAlive||this.triggerPlayerDeath();return}if(h&&m&&!m.consumed&&h.isAlive){h.health<h.maxHealth&&(h.heal(m.healAmount),m.onConsumed());return}if(d&&d.owner==="player"&&(a||c)){const p=a??c;p.isAlive&&(p.takeDamage(d.damage),d.onHit(),this.hitMarker.show(),this.touchAdapter&&this.touchAdapter.hitHaptic(),p.isAlive||(p instanceof B?this.deathEffect.spawnImp(p.mesh.position):(this.deathEffect.spawnBoss(p.mesh.position),this.screenShake.shake()),this.waveManager.onEnemyKilled()),this.markForRemoval(d));return}if(d&&d.owner==="boss"&&h&&h.isAlive){h.takeDamage(d.damage),this.damageFlash.show(),this.touchAdapter&&this.touchAdapter.damageHaptic(),d.onHit(),this.markForRemoval(d),h.isAlive||this.triggerPlayerDeath();return}if(d&&!a&&!c&&!h&&!m){d.onHit(),this.markForRemoval(d);return}})}setupWaveManager(){this.waveManager.onSpawnEnemies=(t,e)=>{if(this.player)if(e.hasBoss)this.spawnBoss();else{const s=this.arenaGenerator.generate(this.currentSeed).enemySpawnPoints,o=new bt(this.currentSeed+this.waveManager.currentWaveIndex+1);for(let n=0;n<t;n++){const r=n%s.length,h=s[r],a=new f(h[0],h[1]+.5,h[2]);a.x+=(o.next()-.5)*2,a.z+=(o.next()-.5)*2,this.spawnImp(a)}}},this.waveManager.onSpawnHealthPacks=()=>{const t=this.arenaGenerator.generate(this.currentSeed);for(const e of t.healthPackPositions)this.spawnHealthPack(new f(e[0],e[1],e[2]))},this.waveManager.onWaveStateChange=(t,e)=>{t==="spawning"?this.overlay.showNotification(`Wave ${e}/5 incoming!`,"",2):t==="intermission"?this.overlay.showNotification(`Wave ${e-1} complete!`,"Get ready...",3):t==="victory"&&(this.gamePhase="victory",this.isTouchDevice?this.overlay.showMobileVictory():(this.overlay.showVictory(),this.inputManager.exitPointerLock()),this.hud.hide(),this.crosshair.hide())}}setupInput(){document.addEventListener("keydown",t=>{t.code==="Space"&&this.gamePhase==="playing"&&(this.inputManager.notifyJumpPressed(),t.preventDefault()),t.code==="KeyR"&&(this.gamePhase==="dead"||this.gamePhase==="victory")&&this.restart()})}triggerPlayerDeath(){this.isDying||(this.isDying=!0,this.deathAnimTimer=0,this.isTouchDevice||this.inputManager.exitPointerLock())}updateDeathAnimation(t){if(!this.isDying)return;this.deathAnimTimer+=t;const e=Math.min(this.deathAnimTimer/this.DEATH_ANIM_DURATION,1),i=1-Math.pow(1-e,3),s=i*(Math.PI/3);this.camera.setDeathPitch(s);const o=i*.15;this.camera.setDeathRoll(o),e>=1&&(this.isDying=!1,this.gamePhase="dead",this.isTouchDevice?this.overlay.showMobileDeath(this.waveManager.currentWaveIndex+1):this.overlay.showDeath(this.waveManager.currentWaveIndex+1),this.hud.hide(),this.crosshair.hide(),this.waveManager.onPlayerDeath())}startPlaying(){this.gamePhase="playing",this.hud.show(),this.crosshair.show(),this.overlay.hideStart(),this.overlay.hideDeath(),this.overlay.hideVictory(),this.waveManager.startGame()}restart(){this.clearEntities(),this.isDying=!1,this.deathAnimTimer=0,this.camera.setDeathPitch(0),this.camera.setDeathRoll(0),this.deathEffect.clear(),this.damageFlash.reset(),this.hitMarker.reset(),this.screenShake.reset(),this.currentSeed=Date.now()+Math.floor(Math.random()*1e5),this.buildArena(this.currentSeed),this.spawnPlayer(),this.waveManager.reset(),this.camera.reset(),this.inputAdapter.reset(),this.hud.show(),this.crosshair.show(),this.gamePhase="menu",this.overlay.hideDeath(),this.overlay.hideVictory(),this.isTouchDevice?this.overlay.showMobileStart():(this.overlay.showStart(),this.inputManager.requestPointerLock(this.renderer.domElement),this.startPlaying())}clearEntities(){this.player&&(this.player.destroy(),this.player=null);for(const t of this.imps)t.destroy();this.imps.length=0;for(const t of this.bosses)t.destroy();this.bosses.length=0;for(const t of this.projectiles)t.destroy();this.projectiles.length=0;for(const t of this.healthPacks)t.destroy();this.healthPacks.length=0,this.pendingRemovals.length=0}markForRemoval(t){t&&!this.pendingRemovals.includes(t)&&this.pendingRemovals.push(t)}flushRemovals(){for(const t of this.pendingRemovals){t.mesh&&this.scene.remove(t.mesh),t.body&&this.physicsWorld.removeBody(t.body);const e=(i,s)=>{const o=i.indexOf(s);o>=0&&i.splice(o,1)};t instanceof B?e(this.imps,t):t instanceof X?e(this.bosses,t):t instanceof O?e(this.projectiles,t):t instanceof K&&e(this.healthPacks,t)}this.pendingRemovals.length=0}setupVisualViewport(){const t=window.visualViewport;t&&(this.boundViewportResize=()=>{if(!this.touchAdapter)return;const e=window.visualViewport;e&&(this.renderer&&this.renderer.setSize(e.width,e.height),this.camera.setAspect(e.width/e.height))},t.addEventListener("resize",this.boundViewportResize))}destroy(){this.gameLoop.stop(),this.inputAdapter.destroy(),this.clearEntities(),this.arenaMesh.clear(),this.deathEffect.clear(),window.removeEventListener("resize",this.onResize),this.renderer.dispose(),this.container.removeChild(this.renderer.domElement)}}function ut(){const u=document.getElementById("app");if(!u){console.error("Doomloop: #app container not found");return}const t=new Ge(u);window.__doomloop=t,t.init().catch(e=>{console.error("Doomloop initialization error:",e)})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",ut):ut();
