// @ts-nocheck
/* eslint-disable */
// AUTO-GENERATED from design/prototypes by scripts/cinematic/gen.sh — edit the prototype + patch script, then regenerate.
'use client'
import React from 'react'
import { PreBookModal, RankingsBlock, NewsletterBlock, ContactBlock } from './blocks'
import './desktop.css'

const S = (x: any) => (x == null ? '' : String(x))

export default class DesktopHome extends React.Component<any, any> {

  constructor(...a) {
    super(...a);
    this.state = { title: false, ended: false, nar: -1, sy: 0, lv: 0, sel: -1, joined: false, gsel: -1, tribe: 0, pack: 0, pimg: 0, qty: 1, acc: 0, cart: 0, added: false, zx: 50, zy: 50, zoom: false, pb: false, menu: false };
    this.L = { fw: 1440, fh: 900, hw: 1440, hh: 900 };
    this.raw = 0; this.cur = 0; this.last = 0;
    this.TITLE_AT = 8.3;
    this.LINES = [
      { a: 0.3, b: 1.15, t: 'FROM STONE…', c: '#C9BFB4' },
      { a: 1.4, b: 3.9, t: '…FIRE IS BORN', c: '#F59A6E' },
      { a: 4.15, b: 5.5, t: 'RAIN TAMES THE FLAME', c: '#8EC3EC' },
      { a: 5.75, b: 7.1, t: 'WIND BINDS THEM AS ONE', c: '#EDEDED' }
    ];
    this.CARDS = [
      { n: 'LAVA', src: '/cinematic/cards/lava.webp', c: 'rgba(224,65,47,.85)' },
      { n: 'RAIN', src: '/cinematic/cards/rain.webp', c: 'rgba(47,143,216,.85)' },
      { n: 'WIND', src: '/cinematic/cards/wind.webp', c: 'rgba(225,225,225,.7)' },
      { n: 'MOUNTAIN', src: '/cinematic/cards/mountain.webp', c: 'rgba(170,160,150,.7)' },
      { n: 'FREEZE', src: '/cinematic/cards/freeze.webp', c: 'rgba(143,211,240,.8)' },
      { n: 'LIGHTNING', src: '/cinematic/cards/lightning.webp', c: 'rgba(240,120,42,.85)' },
      { n: 'REVERSE', src: '/cinematic/cards/reverse.webp', c: 'rgba(190,120,240,.85)' },
      { n: 'METEOR', src: '/cinematic/cards/meteor.webp', c: 'rgba(232,190,90,.85)' }
    ];
    this.GEO = { cy: 50, k: 1, ds: (sw, sh) => Math.min(sw / 1600, sh / 900), matX: 1000, matY: 500, ms0: 0.46, hsc: (sw, sh) => Math.min(sw / 1600, sh / 900), bcx: 470, bcy: 450, bsc: (sw, sh) => Math.max(Math.min(sw / 1600, sh / 900), 0.4) };
    this.BACK = '/cinematic/cards/back-hd.webp';
    this.META = [
      { kind: 'TRIBE CARD', icon: '/cinematic/icons/lava.png', fg: '#F59A6E', tint: 'rgba(120,24,10,.55)', tag: 'Pure force in motion.', lore: 'Lava advances without hesitation, reshaping the arena through pressure and heat.', pile: 'Attack Pile', type: 'Tribe card · Elemental cycle: Lava beats Wind, Wind beats Rain, Rain beats Lava, Mountain blocks all' },
      { kind: 'TRIBE CARD', icon: '/cinematic/icons/rain.png', fg: '#8EC3EC', tint: 'rgba(14,50,100,.55)', tag: 'Measured and deliberate.', lore: 'Rain cools excess, restoring control where chaos once ruled.', pile: 'Attack Pile', type: 'Tribe card · Elemental cycle: Lava beats Wind, Wind beats Rain, Rain beats Lava, Mountain blocks all' },
      { kind: 'TRIBE CARD', icon: '/cinematic/icons/wind.png', fg: '#EDEDED', tint: 'rgba(70,80,100,.5)', tag: 'Swift and unseen.', lore: 'Wind alters the course of battle, carrying power where it is least expected.', pile: 'Attack Pile', type: 'Tribe card · Elemental cycle: Lava beats Wind, Wind beats Rain, Rain beats Lava, Mountain blocks all' },
      { kind: 'TRIBE CARD', icon: '/cinematic/icons/mountain.png', fg: '#C9BFB4', tint: 'rgba(60,55,50,.55)', tag: 'Enduring and immovable.', lore: 'Mountain holds the ground, absorbing impact and standing against the flow.', pile: 'Attack Pile', type: 'Tribe card · Elemental cycle: Lava beats Wind, Wind beats Rain, Rain beats Lava, Mountain blocks all' },
      { kind: 'POWER CARD', icon: '/cinematic/icons/freeze.png', fg: '#B5E2F5', tint: 'rgba(40,90,120,.5)', tag: 'A pause imposed upon time.', lore: 'Freeze halts a Seeker’s advance, forcing stillness and reflection.', pile: 'Punish Pile', type: 'Power card · punish' },
      { kind: 'POWER CARD', icon: '/cinematic/icons/lightning.png', fg: '#F5B26E', tint: 'rgba(120,60,10,.5)', tag: 'Instant and indiscriminate.', lore: 'Lightning fractures the moment, striking all others in a single flash.', pile: 'Punish Pile', type: 'Power card · punish' },
      { kind: 'POWER CARD', icon: '/cinematic/icons/reverse.png', fg: '#C9A6FA', tint: 'rgba(70,30,110,.55)', tag: 'A command over direction itself.', lore: 'Reverse turns the arena around, dissolving momentum and resetting order.', pile: 'Special play — see the rulebook', type: 'Power card · special' },
      { kind: 'POWER CARD', icon: '/cinematic/icons/meteor.png', fg: '#F3D594', tint: 'rgba(110,80,20,.5)', tag: 'An intrusion from beyond the Cycle.', lore: 'Meteor overwhelms the arena, answerable only to a force equally absolute.', pile: 'Special play — see the rulebook', type: 'Power card · special' }
    ];
    this.tapOK = () => { const p = this.ptr; if (!p || !p.up || performance.now() - p.up > 900) return true; return !p.moved && (p.up - p.t) < 550 && !p.wasMoving && Math.abs(this.raw - p.raw) < 6; };
    this.onPD = (e) => { this.ptrType = e.pointerType; const now = performance.now(); this.ptr = { x: e.clientX, y: e.clientY, t: now, up: 0, moved: false, raw: this.raw, wasMoving: now - (this.lastMove || 0) < 140 || Math.abs(this.raw - this.cur) > 8 }; if (e.pointerType !== 'mouse' && this.state.zoom) this.setState({ zoom: false }); };
    this.onPM = (e) => { this.ptrType = e.pointerType; const p = this.ptr; if (p && !p.up && Math.hypot(e.clientX - p.x, e.clientY - p.y) > 10) p.moved = true; };
    this.onPU = () => { if (this.ptr) this.ptr.up = performance.now(); };
    this.onPC = () => { if (this.ptr) { this.ptr.moved = true; this.ptr.up = performance.now(); } };
    this.picks = this.CARDS.map((c, i) => () => { if (this.tapOK()) this.setState({ sel: i }); });
    this.closeSel = () => this.setState({ sel: -1 });
    this.GT = [
      { src: '/cinematic/gallery/friends-table.webp', cap: 'TABLES OF LAUGHTER', c: 1, r: 0, cs: 2, rs: 2 },
      { src: '/cinematic/gallery/box-waterfall.webp', cap: 'THE BOX BY THE FALLS', c: 0, r: 0, cs: 1, rs: 1 },
      { src: '/cinematic/gallery/hand.webp', cap: 'A HAND WORTH PLAYING', c: 0, r: 1, cs: 1, rs: 2 },
      { src: '/cinematic/gallery/tree.webp', cap: 'IN THE WILD', c: 3, r: 0, cs: 1, rs: 2 },
      { src: '/cinematic/gallery/face.webp', cap: 'HIDE YOUR STRATEGY', c: 3, r: 2, cs: 1, rs: 1 },
      { src: '/cinematic/gallery/cave-cards.webp', cap: 'THE TRIBES COLLIDE', c: 1, r: 2, cs: 1, rs: 1 }
    ];
    this.gpicks = this.GT.map((g, i) => () => { if (this.tapOK()) this.setState({ gsel: i }); });
    this.closeG = () => this.setState({ gsel: -1 });
    this.nextG = () => this.setState({ gsel: (this.state.gsel + 1) % this.GT.length });
    this.prevG = () => this.setState({ gsel: (this.state.gsel + this.GT.length - 1) % this.GT.length });
    this.tpicks = [0, 1, 2, 3].map((i) => () => this.setState({ tribe: i }));
    this.noop = () => {};
    this.PIMG = [['/cinematic/product/battle-pack.jpg', 'Zambaara Battle Pack: card deck, burlap pouch, tribe bracelets and card box'], ['/cinematic/gallery/fan-table.webp', 'The full Zambaara deck fanned out'], ['/cinematic/bracelets/bracelets-stack-photo.webp', 'The four Zambaara tribe bracelets'], ['/cinematic/gallery/cave-cards.webp', 'Mountain, Rain and Lava cards'], ['/cinematic/gallery/box-waterfall.webp', 'The Zambaara wooden box outdoors']];
    this.ipicks = this.PIMG.map((x, i) => () => this.setState({ pimg: i }));
    this.qMinus = () => this.setState({ qty: Math.max(1, this.state.qty - 1) });
    this.qPlus = () => this.setState({ qty: Math.min(10, this.state.qty + 1) });
    this.addCart = () => { this.setState({ cart: this.state.cart + this.state.qty, added: true }); clearTimeout(this.tAdd); this.tAdd = setTimeout(() => this.setState({ added: false }), 3200); };
    this.accPicks = [0, 1, 2].map((i) => () => this.setState({ acc: this.state.acc === i ? -1 : i }));
    this.setZoom = (el) => { this.zoomEl = el; };
    this.zoomMove = (e) => { if (!this.zoomEl || (this.ptrType && this.ptrType !== 'mouse')) return; const r = this.zoomEl.getBoundingClientRect(); this.setState({ zoom: true, zx: ((e.clientX - r.left) / r.width * 100), zy: ((e.clientY - r.top) / r.height * 100) }); };
    this.zoomOut = () => this.setState({ zoom: false });
    this.pbOpenFn = () => this.setState({ pb: true });
    this.pbClose = () => this.setState({ pb: false });
    this.menuOpenFn = () => this.setState({ menu: true });
    this.menuClose = () => this.setState({ menu: false });
    this.onKey = (e) => { if (e.key === 'Escape' && (this.state.sel >= 0 || this.state.gsel >= 0)) this.setState({ sel: -1, gsel: -1 }); };
    this.pk1 = () => this.setState({ pack: 0 }); this.pk2 = () => this.setState({ pack: 1 });
    this.nextSel = () => this.setState({ sel: (this.state.sel + 1) % 8 });
    this.prevSel = () => this.setState({ sel: (this.state.sel + 7) % 8 });
    this.join = (e) => { if (e && e.preventDefault) e.preventDefault(); this.setState({ joined: true }); };
    this.ICONS = {
      LAVA: 'M12 3c1 3 4 4.5 4 8.5A4 4 0 0 1 8 11.5c0-1.6.8-2.7 1.6-3.4C9.8 10 11 10.5 11 10.5 10.5 7.5 11 5 12 3z',
      RAIN: 'M12 3.5 7.2 11a5.6 5.6 0 1 0 9.6 0z',
      WIND: 'M12 12m-1.5 0a1.5 1.5 0 1 0 3 0M12 6.5a5.5 5.5 0 0 1 5.5 5.5M17.5 12A5.5 5.5 0 0 1 12 17.5M12 17.5A5.5 5.5 0 0 1 6.5 12M6.5 12A5.5 5.5 0 0 1 12 6.5',
      MOUNTAIN: 'M4 17 12 6l8 11'
    };
    let seed = 5; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const mk = (n) => [...Array(n)].map(() => ({ x: (rnd() * 100).toFixed(2), y: (rnd() * 100).toFixed(2), d: (rnd() * 3).toFixed(2) }));
    this.stars1 = mk(70); this.stars2 = mk(30);
    const mute = (el) => { if (el) { el.muted = true; el.defaultMuted = true; el.setAttribute('muted', ''); el.setAttribute('playsinline', ''); } };
    const R = (k) => (el) => { this[k] = el; };
    this.setRoot = R('root'); this.setFixed = R('fixed'); this.setHero = R('hero');
    this.setDeck = R('deck'); this.setDeckStage = R('deckStage');
    this.setTrain = R('train'); this.setTrainStage = R('trainStage');
    this.setHow = R('how'); this.setHowStage = R('howStage');
    this.setHost = R('hostSec'); this.setHostStage = R('hostStage');
    this.setCta = R('ctaSec'); this.setFoot = R('foot'); this.setGal = R('gal'); this.setGalStage = R('galStage'); this.setVoices = R('voices'); this.setReel = R('reel');
    this.GAL = [['/cinematic/gallery/box-waterfall.webp','THE BOX · BY THE FALLS',0.75],['/cinematic/gallery/hand.webp','A HAND WORTH PLAYING',0.75],['/cinematic/gallery/cave-cards.webp','THE TRIBES COLLIDE',2.79],['/cinematic/gallery/friends-table.webp','TABLES OF LAUGHTER',0.75],['/cinematic/gallery/face.webp','HIDE YOUR STRATEGY',0.75],['/cinematic/gallery/fan-table.webp','THE FULL DECK',1.5],['/cinematic/gallery/tree.webp','ZAMBAARA, IN THE WILD',0.75],['/cinematic/gallery/player-pouch.webp','THE POUCH · THE BRACELETS',0.5625]];
    this.setIntro = (el) => { this.intro = el; mute(el); };
    this.setLoop = (el) => { this.loopV = el; mute(el); };
    this.onResize = () => this.layout();
    this.onEnded = () => this.finish();
    this.skip = () => { if (this.intro) this.intro.pause(); this.finish(); };
    this.replay = () => {
      this.setState({ title: false, ended: false, nar: -1 }, () => {
        if (this.loopV) this.loopV.pause();
        if (this.intro) { this.intro.currentTime = 0; const p = this.intro.play(); if (p && p.catch) p.catch(() => this.finish()); }
      });
    };
    this.tick = (ts) => {
      this.raf = requestAnimationFrame(this.tick);
      const dt = Math.min(64, ts - (this.lastTs || ts)); this.lastTs = ts;
      if (this.raw !== this.prevRaw) { this.lastMove = ts; this.prevRaw = this.raw; }
      if (this.root) this.raw = -this.root.getBoundingClientRect().top;
      const k = 1 - Math.pow(1 - 0.11, dt / 16.67);
      const d = this.raw - this.cur;
      this.cur = Math.abs(d) < 0.3 ? this.raw : this.cur + d * k;
      const upd = {};
      if (Math.abs(this.cur - this.state.sy) > 0.25) upd.sy = this.cur;
      const v = this.intro;
      if (v && !this.state.ended) {
        const ct = v.currentTime;
        if (!this.state.title && ct >= this.TITLE_AT) upd.title = true;
        let n = -1;
        this.LINES.forEach((l, i) => { if (ct >= l.a && ct < l.b) n = i; });
        if (n !== this.state.nar) upd.nar = n;
      }
      if (Object.keys(upd).length) this.setState(upd);
    };
  }
  layout() {
    if (!this.root) return;
    const rt = this.root.getBoundingClientRect().top;
    const sec = (el, st) => {
      if (!el) return { top: 0, h: 1, sh: 1, sw: 1440 };
      const r = el.getBoundingClientRect();
      return { top: r.top - rt, h: r.height, sh: st ? st.offsetHeight : 1, sw: st ? st.offsetWidth : 1440 };
    };
    const f = this.fixed ? this.fixed.getBoundingClientRect() : { width: 1440, height: 900 };
    const h = this.hero ? this.hero.getBoundingClientRect() : { width: 1440, height: 900 };
    this.L = {
      fw: f.width, fh: f.height, hw: h.width, hh: h.height,
      deck: sec(this.deck, this.deckStage), train: sec(this.train, this.trainStage),
      how: sec(this.how, this.howStage), host: sec(this.hostSec, this.hostStage),
      gal: sec(this.gal, this.galStage), voices: sec(this.voices, null), cta: sec(this.ctaSec, null), ctaW: this.ctaSec ? this.ctaSec.offsetWidth : 1440, ctaH: this.ctaSec ? this.ctaSec.offsetHeight : 1100, foot: sec(this.foot, null), vh: window.innerHeight || 900, total: this.root ? this.root.offsetHeight : 10000
    };
    this.setState({ lv: (this.state.lv || 0) + 1 });
  }
  prog(s, sy) {
    if (!s) return 0;
    const span = s.h - s.sh;
    return span > 0 ? Math.min(1, Math.max(0, (sy - s.top) / span)) : 0;
  }
  near(s, sy) { return s && sy > s.top - s.sh * 1.2 && sy < s.top + s.h + s.sh * 0.2; }
  finish() {
    if (this.loopV) { try { this.loopV.currentTime = 0; const p = this.loopV.play(); if (p && p.catch) p.catch(() => {}); } catch (e) {} }
    this.setState({ title: true, ended: true, nar: -1 });
  }
  componentDidMount() {
    document.body.classList.add('zh-body');
    window.addEventListener('keydown', this.onKey);
    if (typeof ResizeObserver !== 'undefined' && this.root) { this.ro = new ResizeObserver(() => { clearTimeout(this.roT); this.roT = setTimeout(() => this.layout(), 120); }); this.ro.observe(this.root); }
    window.addEventListener('resize', this.onResize);
    this.layout();
    this.t1 = setTimeout(() => this.layout(), 300);
    this.t2 = setTimeout(() => this.layout(), 1500);
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (this.intro) {
      this.intro.addEventListener('ended', this.onEnded);
      if (reduce) this.finish();
      else { const p = this.intro.play(); if (p && p.catch) p.catch(() => this.finish()); }
    }
    this.raf = requestAnimationFrame(this.tick);
    window.addEventListener('pointerdown', this.onPD, true); window.addEventListener('pointermove', this.onPM, true); window.addEventListener('pointerup', this.onPU, true); window.addEventListener('pointercancel', this.onPC, true);
  }
  componentDidUpdate(pp, ps) {
    const was = ps.sel >= 0 || ps.gsel >= 0, now = this.state.sel >= 0 || this.state.gsel >= 0;
    if (was !== now) document.documentElement.style.overflow = now ? 'hidden' : '';
  }
  componentWillUnmount() {
    document.documentElement.style.overflow = '';
    window.removeEventListener('keydown', this.onKey);
    document.body.classList.remove('zh-body');
    if (this.ro) this.ro.disconnect(); clearTimeout(this.roT);
    window.removeEventListener('pointerdown', this.onPD, true); window.removeEventListener('pointermove', this.onPM, true); window.removeEventListener('pointerup', this.onPU, true); window.removeEventListener('pointercancel', this.onPC, true);
    window.removeEventListener('resize', this.onResize);
    if (this.intro) this.intro.removeEventListener('ended', this.onEnded);
    cancelAnimationFrame(this.raf); clearTimeout(this.t1); clearTimeout(this.t2);
  }

  deckCards(q) {
    const cl = (x) => Math.min(1, Math.max(0, x));
    const ss = (a, b) => { const x = cl((q - a) / (b - a)); return x * x * (3 - 2 * x); };
    const L = (a, b, t) => a + (b - a) * t;
    const mix = (p, o, t) => ({ x: L(p.x, o.x, t), y: L(p.y, o.y, t), r: L(p.r, o.r, t), s: L(p.s, o.s, t) });
    const CX = 800, CY = 500;
    const e = ss(0, 0.1), sp = ss(0.12, 0.2), fin = ss(0.62, 0.8);
    const bounce = Math.sin(Math.PI * ss(0.34, 0.4)) * 0.05;
    return this.CARDS.map((cd, i) => {
      const half = i % 2 ? 1 : -1, h = Math.floor(i / 2);
      const k = (i * 3) % 8;
      const rank = h * 2 + (half > 0 ? 1 : 0);
      let p = { x: CX + i * 0.5, y: CY - i * 0.9, r: (i % 2 ? 1.6 : -1.6), s: 1 };
      p = mix(p, { x: CX + half * 240, y: CY + 14 - h * 3, r: half * 14, s: 1 }, sp);
      const rs = 0.2 + rank * 0.016, rp = ss(rs, rs + 0.05);
      p = mix(p, { x: CX + k * 0.5, y: CY - k * 0.9, r: (k % 3 - 1) * 1.2, s: 1 }, rp);
      p.y -= 80 * Math.sin(Math.PI * rp);
      p.s += bounce;
      const fs = 0.42 + i * 0.013, fp = ss(fs, fs + 0.08);
      const ang = (-1 + 2 * i / 7) * 30 * Math.PI / 180;
      p = mix(p, { x: CX + 1050 * Math.sin(ang), y: CY + 30 + 1050 * (1 - Math.cos(ang)), r: ang * 180 / Math.PI, s: 1 }, fp);
      const row = i < 4 ? 0 : 1, col = i % 4;
      const ds = 0.64 + col * 0.02 + row * 0.03, dp = ss(ds, ds + 0.1);
      p = mix(p, { x: CX + (col - 1.5) * 236, y: row ? 638 : 330, r: 0, s: 0.86 }, dp);
      const ex = ss(0.86 + i * 0.008, 0.97);
      p = mix(p, { x: CX + i * 0.5, y: CY - i * 0.9, r: (i % 2 ? 1.6 : -1.6), s: 1 }, ex);
      let z = 10 - h;
      if (rp > 0) z = rp < 1 ? 40 + rank : 20 + k;
      if (fp > 0) z = 60 + i;
      return {
        x: p.x.toFixed(1), y: p.y.toFixed(1), r: p.r.toFixed(2), s: p.s.toFixed(3), z: z,
        o: ((this.deckIn == null ? 1 : this.deckIn) * (1 - (this.deckOut || 0))).toFixed(3), f: (Math.min(180, 180 * (1 - ss(fs + 0.03, fs + 0.1)) + 180 * ex) + (ex > 0 && ex < 1 ? Math.sin(Math.PI * ex) * (i % 2 ? 8 : -8) : 0)).toFixed(1), src: cd.src, alt: cd.n + ' card',
        go: fin.toFixed(3), gc: cd.c, pick: this.picks[i], pe: dp > 0.98 && ex < 0.1 ? 'auto' : 'none', lab: 'Show ' + cd.n + ' card details'
      };
    });
  }
  trainRow(q, which, tw, th) {
    const ch = Math.max(170, Math.min(300, th * (which ? 0.24 : 0.3)));
    const cw = ch * 0.684, gap = which ? 22 : 30;
    const order = which ? this.CARDS.slice().reverse() : this.CARDS;
    const items = order.concat(order);
    const Ltot = items.length * (cw + gap);
    const a = tw * 0.12, b = tw * 0.88 - Ltot;
    const off = which ? b + (a - b) * q : a + (b - a) * q;
    const y = which ? th * 0.66 : th * 0.33;
    return items.map((cd, i) => {
      const x = off + i * (cw + gap);
      const n = Math.max(-1.3, Math.min(1.3, (x + cw / 2 - tw / 2) / (tw / 2)));
      return {
        x: x.toFixed(1), y: (y - ch / 2).toFixed(1), w: cw.toFixed(1), h: ch.toFixed(1),
        ry: (-n * 26).toFixed(2), s: (1 - 0.12 * Math.min(1, Math.abs(n))).toFixed(3),
        o: ((which ? 0.62 : 1) * (1 - 0.45 * Math.min(1, Math.abs(n)))).toFixed(3), src: cd.src, alt: cd.n + ' card'
      };
    });
  }
  howTo(q, sw, sh) {
    const cl = (x) => Math.min(1, Math.max(0, x));
    const ss = (a, b) => { const x = cl((q - a) / (b - a)); return x * x * (3 - 2 * x); };
    const L = (a, b, t) => a + (b - a) * t;
    const bump = (a, b, c, d) => ss(a, b) * (1 - ss(c, d));
    // camera keys: [t, fx, fy, scale, tilt]
    const K = [[0, 800, 400, 0.46, 72], [0.08, 800, 400, 0.6, 50], [0.12, 800, 400, 0.6, 50], [0.16, 150, 400, 1.02, 40], [0.25, 150, 400, 1.02, 40],
      [0.29, 800, 470, 0.86, 44], [0.41, 800, 470, 0.86, 44], [0.45, 418, 400, 1.0, 40], [0.57, 418, 400, 1.0, 40], [0.61, 1182, 400, 1.0, 40],
      [0.73, 1182, 400, 1.0, 40], [0.77, 1454, 400, 1.08, 38], [0.88, 1454, 400, 1.08, 38], [0.93, 800, 400, 0.6, 48], [1, 800, 400, 0.6, 48]];
    let i = 0; while (i < K.length - 2 && q > K[i + 1][0]) i++;
    const a = K[i], b = K[i + 1];
    const t = cl((q - a[0]) / Math.max(1e-4, b[0] - a[0])); const e = t * t * (3 - 2 * t);
    const fx = L(a[1], b[1], e), fy = L(a[2], b[2], e), ms = L(a[3], b[3], e), tilt = L(a[4], b[4], e);
    const z = [bump(0.13, 0.17, 0.26, 0.29), bump(0.27, 0.31, 0.42, 0.45), bump(0.44, 0.48, 0.58, 0.61), bump(0.6, 0.64, 0.74, 0.77), bump(0.76, 0.8, 0.89, 0.92)];
    const fin = ss(0.91, 0.96);
    // bracelets (the real photo, dropped in band by band)
    const bandRows = [[16, 61, 'Lava bracelet'], [38, 42, 'Rain bracelet'], [57, 27, 'Wind bracelet'], [72, 9, 'Mountain bracelet']];
    const chosenL = ss(0.21, 0.24);
    const BR = [['/cinematic/bracelets/bracelet-lava.webp', 'Lava bracelet', 'rgba(255,80,40,.9)'], ['/cinematic/bracelets/bracelet-rain.webp', 'Rain bracelet', 'rgba(70,160,255,.8)'], ['/cinematic/bracelets/bracelet-wind.webp', 'Wind bracelet', 'rgba(230,240,255,.7)'], ['/cinematic/bracelets/bracelet-mountain.webp', 'Mountain bracelet', 'rgba(200,190,180,.6)']];
    const slotY = [-62, -22, 18, 58];
    const brs = BR.map((bd, j) => {
      const en = ss(0.14 + j * 0.022, 0.205 + j * 0.022);
      const ch = j === 0 ? chosenL : 0;
      return { src: bd[0], alt: bd[1], x: (-300 * (1 - en) + 70 * ch).toFixed(1), y: (L(-260, slotY[j], en) + (j === 0 ? 62 * ch : 0)).toFixed(1), r: (-25 * (1 - en) + (j - 1.5) * 2).toFixed(2),
        s: ((0.75 + 0.25 * en) * (1 + 0.28 * ch) * (j && chosenL > 0 ? 0.92 : 1)).toFixed(3), o: (en * (j && chosenL > 0 ? 0.55 + 0.45 * (1 - chosenL) : 1)).toFixed(3), z: j === 0 && ch > 0 ? 9 : 4 - j,
        f: ch > 0 ? 'drop-shadow(0 0 ' + (18 * ch).toFixed(0) + 'px ' + bd[2] + ')' : 'none' };
    });
    const tribes = [['LAVA', '#C8301F', '#FFFFFF', 'rgba(255,90,60,.9)'], ['RAIN', '#1F74B8', '#FFFFFF', 'rgba(80,170,255,.9)'], ['WIND', '#E6E6E6', '#222222', 'rgba(255,255,255,.8)'], ['MOUNTAIN', '#141414', '#FFFFFF', 'rgba(200,190,180,.7)']];
    const slots = [[-36, -36], [36, -36], [-36, 36], [36, 36]];
    const meds = tribes.map((tr, j) => {
      const en = ss(0.14 + j * 0.018, 0.2 + j * 0.018);
      const sx = 150 + slots[j][0], sy0 = 400 + slots[j][1];
      const ox = -260 - j * 40, oy = -260 + j * 120;
      const chosen = j === 0 ? ss(0.21, 0.24) : 0;
      return {
        bg: tr[1], ic: tr[2], d: this.ICONS[tr[0]], gc: tr[3],
        x: L(ox, sx, en).toFixed(1), y: L(oy, sy0, en).toFixed(1),
        s: (0.6 + 0.4 * en + 0.25 * chosen).toFixed(3), o: en.toFixed(3), gl: (4 + 26 * chosen + 10 * fin).toFixed(0)
      };
    });
    // cards on the mat
    const pieces = [];
    for (let j = 0; j < 5; j++) {
      const dpp = 1;
      pieces.push({ src: this.BACK, alt: '', x: (800 + j * 1.5).toFixed(1), y: (400 - j * 2.5).toFixed(1), r: ((j % 2 ? 1 : -1) * 3 * (1 - dpp) + (j - 2) * 0.8).toFixed(2), s: (1.9 - 0.9 * dpp).toFixed(3), o: dpp.toFixed(3), z: 10 + j });
    }
    const hand = [[this.CARDS[0], 650, 692, -16], [this.CARDS[1], 750, 676, -5], [this.CARDS[4], 850, 676, 5], [this.CARDS[5], 950, 692, 16]];
    hand.forEach((hc, j) => {
      const dl = ss(0.34 + j * 0.018, 0.39 + j * 0.018);
      let x = L(800, hc[1], dl), y = L(400, hc[2], dl), r = L(0, hc[3], dl), s = L(1, 0.82, dl);
      let z = 30 + j;
      if (j === 0) { const m = ss(0.46, 0.53); x = L(x, 418, m); y = L(y, 400, m) - 120 * Math.sin(Math.PI * m); r = L(r, 0, m) + 10 * Math.sin(Math.PI * m); s = L(s, 1.25, m); if (m > 0) z = 50; }
      if (j === 2) { const m = ss(0.62, 0.665); x = L(x, 1176, m); y = L(y, 396, m) - 120 * Math.sin(Math.PI * m); r = L(r, -4, m) - 10 * Math.sin(Math.PI * m); s = L(s, 1.25, m); if (m > 0) z = 50; }
      if (j === 3) { const m = ss(0.665, 0.71); x = L(x, 1190, m); y = L(y, 408, m) - 120 * Math.sin(Math.PI * m); r = L(r, 7, m) - 10 * Math.sin(Math.PI * m); s = L(s, 1.25, m); if (m > 0) z = 51; }
      pieces.push({ src: hc[0].src, alt: hc[0].n + ' card', x: x.toFixed(1), y: y.toFixed(1), r: r.toFixed(2), s: s.toFixed(3), o: dl.toFixed(3), z: z });
    });
    const clk = ss(0.79, 0.88);
    const caps = [
      { n: '—', t: 'Take your seat', p: 'The Zambaara mat has five zones. Scroll to play through a round with the Host.' },
      { n: 'I', t: 'Choose your tribe', p: 'Lava, Rain, Wind or Mountain. The four tribe bracelets wait in the Bracelet Chamber — claim yours.' },
      { n: 'II', t: 'Draw from the deck', p: 'The Draw Deck sits at the heart of the arena. Every hand begins here.' },
      { n: 'III', t: 'Attack', p: 'Play a tribe card onto the Attack Pile to strike your opponent.' },
      { n: 'IV', t: 'Punish', p: 'Only two powers belong on the Punish Pile — Freeze and Lightning. Play them to turn the fight against your rival.' },
      { n: 'V', t: 'Beat the Sand Clock', p: 'The sand clock turns and every battle is timed. The fastest Zampion claims the bracelet.' },
      { n: '✦', t: 'You’re ready', p: 'Watch the full tutorial, gather your tribe and take the table.' }
    ];
    const win = [[0.0, 0.12], [0.14, 0.27], [0.29, 0.43], [0.46, 0.59], [0.62, 0.75], [0.78, 0.9], [0.93, 1.01]];
    const capsOut = caps.map((c, j) => {
      const w = win[j];
      const o = (j === 0 ? 1 : ss(w[0], w[0] + 0.025)) * (j === 6 ? 1 : 1 - ss(w[1], w[1] + 0.02));
      return { n: c.n, t: c.t, p: c.p, final: j === 6, o: (o * ss(0.02, 0.07)).toFixed(3), y: (18 * (1 - o)).toFixed(1), pe: o > 0.5 ? 'auto' : 'none' };
    });
    const active = z.map((v) => v > 0.5);
    const rail = ['I', 'II', 'III', 'IV', 'V'].map((n, j) => ({ n: n, fg: active[j] || fin > 0.5 ? '#0B0907' : (q > win[j + 1][1] ? '#E8C989' : '#8F8372'), bg: active[j] || fin > 0.5 ? '#C9A063' : 'transparent', bd: active[j] || q > win[j + 1][0] ? '#C9A063' : 'rgba(201,160,99,.35)' }));
    const enter = ss(0, 0.08);
    return {
      scale: Math.min(sw / 1600, sh / 900).toFixed(4),
      hostO: (enter * (1 - 0.35 * ss(0.14, 0.2))).toFixed(3), hostX: (-80 * (1 - enter) - 30 * q).toFixed(1), hostY: (40 * (1 - enter) - 30 * q).toFixed(1), hostS: (1.06 - 0.06 * enter).toFixed(3),
      headO: enter.toFixed(3), matO: ss(0.01, 0.07).toFixed(3),
      tilt: tilt.toFixed(2), ms: ms.toFixed(4), mx: (800 - fx).toFixed(1), my: (400 - fy).toFixed(1),
      z1: Math.max(z[0], fin).toFixed(3), z2: Math.max(z[1], fin).toFixed(3), z3: Math.max(z[2], fin).toFixed(3), z4: Math.max(z[3], fin).toFixed(3), z5: Math.max(z[4], fin).toFixed(3),
      deckLab: (1 - ss(0.28, 0.31)).toFixed(3),
      brs: brs, chosenO: (chosenL * (1 - ss(0.27, 0.3))).toFixed(3), chLab: (1 - ss(0.13, 0.16)).toFixed(3), pieces: pieces,
      flashA: (ss(0.52, 0.535) * (1 - ss(0.54, 0.6))).toFixed(3), flashP: Math.max(ss(0.655, 0.67) * (1 - ss(0.675, 0.7)), ss(0.7, 0.715) * (1 - ss(0.72, 0.76))).toFixed(3),
      hgPos: (-120 * Math.min(23, Math.floor(clk * 23.99))).toFixed(0), hgRot: (180 * (1 - ss(0.765, 0.79))).toFixed(1), clockO: (0.25 + 0.75 * ss(0.76, 0.79)).toFixed(3), clockLab: (1 - ss(0.75, 0.77)).toFixed(3), secs: Math.round(347 * clk),
      caps: capsOut, rail: rail
    };
  }
  beatHost(q, sw, sh) {
    const cl = (x) => Math.min(1, Math.max(0, x));
    const ss = (a, b) => { const x = cl((q - a) / (b - a)); return x * x * (3 - 2 * x); };
    const enter = ss(0, 0.14), toB = ss(0.5, 0.62);
    const cx = 480, cy = 330;
    const back = [], front = [];
    [0, 1, 2, 3].forEach((j) => {
      const th = (q * 600 + j * 90) * Math.PI / 180;
      const sn = Math.sin(th);
      const o = ss(0.06 + j * 0.03, 0.16 + j * 0.03) * (1 - 0.7 * toB);
      const item = { src: this.CARDS[j].src, x: (cx + 360 * Math.cos(th)).toFixed(1), y: (cy + 110 * sn).toFixed(1), r: (Math.cos(th) * -14).toFixed(2), s: (0.72 + 0.28 * (sn + 1) / 2).toFixed(3), o: (o * (0.55 + 0.45 * (sn + 1) / 2)).toFixed(3) };
      (sn > 0 ? front : back).push(item);
    });
    return {
      scale: Math.max(Math.min(sw / 1600, sh / 900), 0.4).toFixed(4),
      hostO: enter.toFixed(3), hostX: (160 * (1 - enter) + 120 * toB).toFixed(1), hostS: (1.12 - 0.12 * enter - 0.06 * toB).toFixed(3), hostB: (1 - 0.55 * toB).toFixed(3),
      orbBack: back, orbFront: front,
      aO: (ss(0.06, 0.18) * (1 - ss(0.46, 0.54))).toFixed(3), aY: (30 * (1 - ss(0.06, 0.18)) - 30 * ss(0.46, 0.54)).toFixed(1), aPE: q > 0.1 && q < 0.5 ? 'auto' : 'none',
      bO: ss(0.54, 0.66).toFixed(3), bY: (80 * (1 - ss(0.54, 0.7))).toFixed(1), bS: ((0.86 + 0.14 * ss(0.54, 0.72))).toFixed(3), ringR: (q * 120).toFixed(1),
      cO: (ss(0.62, 0.72) * (1 - ss(0.82, 0.9))).toFixed(3), cY: (30 * (1 - ss(0.62, 0.72)) - 40 * ss(0.82, 0.9)).toFixed(1), cPE: q > 0.64 ? 'auto' : 'none'
    };
  }
  gallery(q, sw, sh) {
    const cl = (x) => Math.min(1, Math.max(0, x));
    const ss = (a, b) => { const x = cl((q - a) / (b - a)); return x * x * (3 - 2 * x); };
    const X0 = 120, Y0 = 160, CW = 328, G = 16, RH = (870 - Y0 - 2 * G) / 3;
    const rect = (c, r, cs, rs) => ({ x: X0 + c * (CW + G), y: Y0 + r * (RH + G), w: cs * CW + (cs - 1) * G, h: rs * RH + (rs - 1) * G });
    const e0 = ss(0.1, 0.4);
    const tiles = this.GT.map((g, i) => {
      const R_ = rect(g.c, g.r, g.cs, g.rs);
      const cx = R_.x + R_.w / 2, cy = R_.y + R_.h / 2;
      if (i === 0) {
        const S0 = Math.max(1600 / R_.w, 900 / R_.h) * 1.02;
        const k = 1 - e0;
        return { src: g.src, cap: g.cap, lab: 'Open image: ' + g.cap.toLowerCase(), pick: this.gpicks[i], w: R_.w.toFixed(0), h: R_.h.toFixed(0),
          x: (R_.x + (800 - cx) * k).toFixed(1), y: (R_.y + (450 - cy) * k + (q - 0.75) * -20).toFixed(1), s: (1 + (S0 - 1) * k).toFixed(4), ci: 0, cx: 0, o: 1, z: 1, is: (1 + 0.15 * k).toFixed(3) };
      }
      const ek = ss(0.26 + i * 0.045, 0.48 + i * 0.045);
      const vx = cx - 800, vy = cy - 450, vl = Math.sqrt(vx * vx + vy * vy) + 1;
      const depth = [0, 50, -40, 70, -30, 40][i];
      return { src: g.src, cap: g.cap, lab: 'Open image: ' + g.cap.toLowerCase(), pick: this.gpicks[i], w: R_.w.toFixed(0), h: R_.h.toFixed(0),
        x: (R_.x + vx / vl * 160 * (1 - ek)).toFixed(1), y: (R_.y + vy / vl * 160 * (1 - ek) + (q - 0.75) * -depth).toFixed(1), s: (0.92 + 0.08 * ek).toFixed(3),
        ci: (50 * (1 - ek)).toFixed(2), cx: (12 * (1 - ek)).toFixed(2), o: ek.toFixed(3), z: 2, is: (1.2 - 0.2 * ek).toFixed(3) };
    });
    const VR = rect(2, 2, 1, 1), ev = ss(0.5, 0.72);
    return {
      scale: Math.min(sw / 1600, sh / 900).toFixed(4), tiles: tiles,
      v: { w: VR.w.toFixed(0), h: VR.h.toFixed(0), x: VR.x.toFixed(1), y: (VR.y + 120 * (1 - ev)).toFixed(1), ci: (50 * (1 - ev)).toFixed(2), o: ev.toFixed(3) },
      tO: (1 - ss(0.06, 0.2)).toFixed(3), tY: (-60 * ss(0.06, 0.2)).toFixed(1),
      lO: ss(0.36, 0.5).toFixed(3), lY: (20 * (1 - ss(0.36, 0.5))).toFixed(1), vidOn: ev > 0.6
    };
  }
  ctaV(Lo, sy) {
    const c = Lo.cta || {}, vh = Lo.vh || 900;
    const q = c.h ? Math.min(1, Math.max(0, (sy - c.top + vh) / (c.h + vh))) : 0;
    const cl = (x) => Math.min(1, Math.max(0, x));
    const ss = (a, b) => { const x = cl((q - a) / (b - a)); return x * x * (3 - 2 * x); };
    const st = this.state, pk = st.pack || 0, pi = st.pimg || 0;
    const e1 = ss(0.06, 0.3), e2 = ss(0.12, 0.36);
    const ACC = [
      ['WHAT’S IN THE BOX', 'Zambaara card deck — Lava, Rain, Wind and Mountain cards plus the Meteor, Lightning, Freeze and Reverse power cards\nBurlap carry pouch\nTribe bracelets\nCard box'],
      ['HOW TO PLAY', 'Distribute the cards equally among all players and place the bracelets in the center. Learn the elemental cycle — Lava beats Wind, Wind beats Rain, Rain beats Lava, Mountain blocks all. Take turns playing cards to win rounds and collect bracelets, and deploy Meteor, Lightning, Freeze or Reverse at key moments. Collect all the bracelets to become the Zampion. The full rulebook and video guide are linked below.'],
      ['PRE-BOOKING & ORDERS', 'Pre-book with your name, email and mobile number and we will contact you when the game is ready to ship. For bulk, café or event orders, send us a message through the contact form below.']
    ];
    const gold = (on) => ({ bg: on ? '#C9A063' : 'transparent', fg: on ? '#0B0907' : '#CFC4B3', bd: on ? '#C9A063' : 'rgba(201,160,99,.4)' });
    const g1 = gold(pk === 0), g2 = gold(pk === 1);
    return {
      o: e1.toFixed(3), y: (50 * (1 - e1)).toFixed(1), ci: (50 * (1 - ss(0.04, 0.3))).toFixed(2), o2: e2.toFixed(3), y2: (40 * (1 - e2)).toFixed(1),
      imgs: this.PIMG.map((g, i) => ({ src: g[0], alt: g[1], o: i === pi ? 1 : 0, s: i === pi ? (st.zoom ? 1.8 : (1.04 - 0.04 * e1)).toFixed(3) : 1.06 })),
      thumbs: this.PIMG.map((g, i) => ({ src: g[0], lab: 'Show image ' + (i + 1) + ': ' + g[1], pick: this.ipicks[i], on: i === pi ? 'true' : 'false', bd: i === pi ? '#E8C989' : 'rgba(201,160,99,.25)', op: i === pi ? 1 : 0.6 })),
      price: ((pk === 0 ? 799 : 899) * st.qty).toLocaleString('en-IN'), qtyNote: st.qty > 1 ? ' · ' + st.qty + ' × ₹' + (pk === 0 ? 799 : 899) : '',
      ed: pk === 0 ? '2–4 PLAYERS' : '5–8 PLAYERS', edNote: pk === 0 ? 'Perfect for intimate gaming sessions. Experience the thrill of elemental mastery with a smaller group of players.' : 'Ideal for larger gatherings. Battle with more players and unlock the full potential of the Zambaara experience.', p1: pk === 0 ? 'true' : 'false', p2: pk === 1 ? 'true' : 'false',
      p1bg: g1.bg, p1fg: g1.fg, p1bd: g1.bd, p2bg: g2.bg, p2fg: g2.fg, p2bd: g2.bd,
      acc: ACC.map((x, i) => ({ t: x[0], b: x[1], pick: this.accPicks[i], open: st.acc === i, on: st.acc === i ? 'true' : 'false', rot: st.acc === i ? 45 : 0 }))
    };
  }
  footV(Lo, sy) {
    const f = Lo.foot || {}, vh = Lo.vh || 900;
    const q = f.h ? Math.min(1, Math.max(0, (sy + vh - f.top) / Math.max(1, Math.min(f.h, vh)))) : 0;
    const cl = (x) => Math.min(1, Math.max(0, x));
    const ss = (a, b) => { const x = cl((q - a) / (b - a)); return x * x * (3 - 2 * x); };
    const word = 'ZAMBAARA'.split('');
    const icons = [['Lava', '/cinematic/icons/lava.png', 'rgba(224,65,47,.7)'], ['Rain', '/cinematic/icons/rain.png', 'rgba(47,143,216,.7)'], ['Wind', '/cinematic/icons/wind.png', 'rgba(230,230,240,.6)'], ['Mountain', '/cinematic/icons/mountain.png', 'rgba(170,160,150,.6)']];
    return {
      hy: (220 * (1 - ss(0, 0.6))).toFixed(1), sun: ss(0.3, 0.6).toFixed(3), sy: (60 * (1 - ss(0.3, 0.7))).toFixed(1),
      letters: word.map((c, i) => { const ek = ss(0.25 + i * 0.04, 0.55 + i * 0.04); return { c: c, y: (90 * (1 - ek)).toFixed(1), o: ek.toFixed(3), f: (100 * ss(0.6 + i * 0.03, 0.85 + i * 0.03)).toFixed(1) }; }),
      icons: icons.map((t, i) => ({ n: t[0], src: t[1], g: t[2], y: (30 * (1 - ss(0.55 + i * 0.05, 0.8 + i * 0.05))).toFixed(1) })),
      o: ss(0.55, 0.85).toFixed(3), y: (30 * (1 - ss(0.55, 0.85))).toFixed(1)
    };
  }
  heroCards(sy, hh, Lo, hs) {
    const cl = (x) => Math.min(1, Math.max(0, x));
    const sst = (a, b, x) => { const t = cl((x - a) / (b - a)); return t * t * (3 - 2 * t); };
    const L = (a, b, t) => a + (b - a) * t;
    const vw = Lo.fw || 1440, vh = Lo.vh || 900, dk = Lo.deck || { top: hh, sh: vh, sw: vw };
    const ds = Math.min((dk.sw || vw) / 1600, (dk.sh || vh) / 900);
    const tx = vw / 2, ty = (dk.top - sy) + (dk.sh || vh) / 2 + 50 * ds;
    const flip = sst(0.03 * hh, 0.32 * hh, sy);
    const gat = sst(0.18 * hh, 0.5 * hh, sy);
    const fly = sst(0.42 * hh, dk.top, sy);
    const o = 1 - sst(dk.top - 24, dk.top + 4, sy);
    const base = [[300, 330, -14], [490, 300, -6], [1110, 300, 6], [1300, 330, 14]];
    return [0, 1, 2, 3].map((i) => {
      const b = base[i];
      const hx = vw / 2 + (b[0] - 800) * hs, hy = hh / 2 + (b[1] - 450) * hs;
      const gx = vw / 2 + (i - 1.5) * 34 * hs, gy = hh / 2 + (330 - 450) * hs;
      const fl = sst(0.42 * hh + i * 18, dk.top - (3 - i) * 10, sy);
      let x = L(L(hx, gx, gat), tx + i * 0.5, fl), y = L(L(hy, gy, gat), ty - i * 0.9, fl);
      x += Math.sin(Math.PI * fl) * (i - 1.5) * 60; y -= Math.sin(Math.PI * fl) * 40;
      const r = L(L(b[2], (i - 1.5) * 4, gat), (i % 2 ? 1.6 : -1.6), fl) + Math.sin(Math.PI * fl) * (i - 1.5) * 10;
      const sc = L(hs, 190 * ds / 170, fl);
      const f = 180 * flip + (i % 2 ? 6 : -6) * Math.sin(Math.PI * flip);
      return { src: this.CARDS[i].src, glow: this.CARDS[i].c, gb: (38 * (1 - flip)).toFixed(0), lab: 'Show ' + this.CARDS[i].n + ' card details', pick: this.picks[i],
        x: x.toFixed(1), y: y.toFixed(1), r: r.toFixed(2), s: sc.toFixed(4), f: f.toFixed(1), z: 10 + i,
        o: o.toFixed(3), pe: o > 0.5 && flip < 0.5 ? 'auto' : 'none', fx: ((800 - b[0]) * hs).toFixed(0), fy: ((290 - b[1]) * hs).toFixed(0), fr: (-b[2] * 2).toFixed(0), d: (2.3 + i * 0.12).toFixed(2), bd: (i * 0.9).toFixed(1) };
    });
  }
  transit(Lo, sy) {
    const cl = (x) => Math.min(1, Math.max(0, x));
    const sst = (a, b, x) => { const t = cl((x - a) / (b - a)); return t * t * (3 - 2 * t); };
    const L = (a, b, t) => a + (b - a) * t;
    const G = this.GEO, dk = Lo.deck, hw = Lo.how;
    if (!dk || !hw || !dk.h) return { list: [], d: 'none' };
    const vw = Lo.fw || 1440;
    const dEnd = dk.top + dk.h - dk.sh;
    if (sy < dEnd - 20 || sy > hw.top + 0.1 * (hw.h - hw.sh)) return { list: [], d: 'none' };
    const ds = G.ds(dk.sw, dk.sh), hsc = G.hsc(hw.sw, hw.sh);
    const dTop = Math.min(0, dEnd - sy), hTop = Math.max(0, hw.top - sy);
    const x0 = vw / 2, y0 = dTop + dk.sh / 2 + G.cy * ds;
    const x1 = vw / 2 + (G.matX - 800) * hsc, y1 = hTop + hw.sh / 2 + (G.matY - 450) * hsc;
    const t = sst(dEnd, hw.top, sy);
    const o = sst(dEnd - 6, dEnd, sy) * (1 - sst(hw.top + 0.045 * (hw.h - hw.sh), hw.top + 0.075 * (hw.h - hw.sh), sy));
    const s0 = ds * G.k, s1 = 150 * G.ms0 * hsc / 190;
    const list = [];
    for (let i = 0; i < 8; i++) {
      const ti = cl(t * 1.15 - i * 0.02);
      const e = ti * ti * (3 - 2 * ti);
      list.push({ x: (L(x0 + i * 0.5, x1 + i * 0.4, e) + Math.sin(Math.PI * e) * (i - 3.5) * 14).toFixed(1), y: (L(y0 - i * 0.9, y1 - i * 1.2 * hsc, e) - Math.sin(Math.PI * e) * 90 * ds).toFixed(1),
        rx: (72 * Math.pow(e, 1.4)).toFixed(1), r: (L(i % 2 ? 1.6 : -1.6, (i - 2) * 0.8, e) + Math.sin(Math.PI * e) * (i - 3.5) * 3).toFixed(2), s: L(s0, s1, e).toFixed(4), o: o.toFixed(3), z: i });
    }
    return { list: list, d: 'block' };
  }
  mosaicV(Lo, sy) {
    const cl = (x) => Math.min(1, Math.max(0, x));
    const sst = (a, b, x) => { const t = cl((x - a) / (b - a)); return t * t * (3 - 2 * t); };
    const L = (a, b, t) => a + (b - a) * t;
    const G = this.GEO, hs = Lo.host, gs = Lo.gal;
    const off = { d: 'none', o: 0, bk: 0, tiles: [], tw: 0, th: 0, bw: 0, bh: 0, gx: 0, gy: 0, go: 0, gs: 1, rad: 0, bdo: 0 };
    if (!hs || !gs || !hs.h || !gs.h) return off;
    const vw = Lo.fw || 1440, vh = Lo.vh || 900, span = hs.h - hs.sh, hEnd = hs.top + span, P = hs.sh || vh, gspan = Math.max(1, gs.h - gs.sh);
    const A0 = hEnd - 0.16 * span, A1 = hEnd - 0.015 * span, B0 = hEnd + 0.06 * P, B1 = gs.top - 0.08 * P, C0 = gs.top + 0.004 * gspan, C1 = gs.top + 0.05 * gspan;
    if (sy < A0 - 2 || sy > C1 + 2) return off;
    const cols = Math.max(4, Math.min(12, Math.round(vw / 140))), rows = Math.max(6, Math.min(8, Math.round(vh / 140)));
    const tw = vw / cols, th = vh / rows;
    const bsc = G.bsc(hs.sw, hs.sh);
    const cxP = vw / 2 + (G.bcx - 800) * bsc, cyP = hs.sh / 2 + (G.bcy - 450) * bsc;
    const GB = { SW: 1600, SH: 900, rw: 672, rh: 468, yo: 15 };
    const gsc = Math.min((gs.sw || vw) / GB.SW, (gs.sh || vh) / GB.SH);
    const S0 = Math.max(GB.SW / GB.rw, GB.SH / GB.rh) * 1.02 * 1.15;
    const BW = GB.rw * S0 * gsc, BH = GB.rh * S0 * gsc, BX = vw / 2 - BW / 2, BY = vh / 2 + GB.yo * gsc - BH / 2;
    const maxD = Math.hypot(Math.max(cxP, vw - cxP), Math.max(cyP, vh - cyP)) || 1;
    const FE = B1 - 0.14 * P, close = sst(FE, B1, sy), dealT = sst(A0, A1, sy);
    const tiles = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const l = c * tw, t = r * th, mx = l + tw / 2, my = t + th / 2;
      const dn = Math.hypot(mx - cxP, my - cyP) / maxD, rnd = ((c * 73 + r * 151 + 17) % 97) / 97;
      const da = A0 + (A1 - A0) * 0.6 * (0.7 * dn + 0.3 * rnd), e = sst(da, da + (A1 - A0) * 0.4, sy);
      const fs = B0 + (FE - B0) * 0.58 * (0.75 * dn + 0.25 * rnd), ft = sst(fs, fs + (FE - B0) * 0.42, sy);
      const fk = Math.sin(Math.PI * ft);
      tiles.push({ l: l.toFixed(1), t: t.toFixed(1),
        x: ((cxP - mx) * (1 - e)).toFixed(1), y: ((cyP - my) * (1 - e) - Math.sin(Math.PI * e) * 50).toFixed(1),
        r: ((rnd - 0.5) * 80 * (1 - e) + (rnd - 0.5) * 6 * fk).toFixed(2), s: (L(0.16, 1, e) * (1 - 0.07 * (1 - close)) * (1 + 0.07 * fk)).toFixed(4),
        o: Math.min(1, e * 5).toFixed(3), f: (180 * ft).toFixed(1), z: fk > 0.05 ? 3 : 1, ix: (BX - l).toFixed(1), iy: (BY - t).toFixed(1) });
    }
    return { d: 'block', o: (1 - sst(C0, C1, sy)).toFixed(3), bk: (0.92 * sst(A0 + 0.5 * (A1 - A0), A1, sy)).toFixed(3), tiles: tiles,
      tw: tw.toFixed(2), th: th.toFixed(2), bw: BW.toFixed(1), bh: BH.toFixed(1), gx: cxP.toFixed(1), gy: (cyP + Math.min(0, hEnd - sy)).toFixed(1),
      go: (Math.sin(Math.PI * cl(dealT * 1.4)) * 0.95).toFixed(3), gs: (0.4 + 1.2 * dealT).toFixed(3), rad: (6 * (1 - close)).toFixed(2), bdo: (0.85 * (1 - close)).toFixed(3) };
  }
  spine(Lo, sy) {
    const vh = Lo.vh || 900, tot = Math.max(1, (Lo.total || 10000) - vh);
    const S = [['#top', 'HERO', 0], ['#deck', 'THE DECK', (Lo.deck || {}).top], ['#howto', 'HOW TO PLAY', (Lo.how || {}).top], ['#host', 'BEAT THE HOST', (Lo.host || {}).top], ['#chronicles', 'GALLERY', (Lo.gal || {}).top], ['#voices', 'VOICES', (Lo.voices || {}).top], ['#next', 'BATTLE PACK', (Lo.cta || {}).top]];
    let act = 0; S.forEach((d, i) => { if (sy >= (d[2] || 0) - vh * 0.4) act = i; });
    return { dots: S.map((d, i) => ({ href: d[0], n: d[1], t: (Math.min(1, (d[2] || 0) / tot) * 100).toFixed(2), cls: i === act ? 'act' : '' })), fill: (Math.min(1, sy / tot) * 100).toFixed(2) };
  }
  voicesV(q) {
    const cl = (x) => Math.min(1, Math.max(0, x));
    const ss = (a, b) => { const x = cl((q - a) / (b - a)); return x * x * (3 - 2 * x); };
    const srcs = [['/cinematic/gallery/player-pouch.webp', 'Player holding the Zambaara pouch and bracelets', 'BATTLE MASTER', 'Zampion Champion', 'Mastered the elements and claimed the bracelets at the table.', false], ['/cinematic/gallery/player-reader.webp', 'Player reading a Lava card', 'ELEMENT WIELDER', 'Elite Player', 'Reads every tell, plays every power at the perfect moment.', false], ['/cinematic/gallery/player-box.webp', 'Player holding the Zambaara wooden box', 'YOUR STORY NEXT', 'Become a Zampion', 'Beat the Host at a live event and join the Zampions.', true]];
    const k = [110, -40, 150];
    return {
      hO: ss(0.05, 0.25).toFixed(3), hY: (30 * (1 - ss(0.05, 0.25))).toFixed(1),
      cards: srcs.map((c, j) => {
        const e = ss(0.12 + j * 0.06, 0.38 + j * 0.06);
        const xo = ss(0.72 + j * 0.03, 0.98);
        return { src: c[0], alt: c[1], k: c[2], t: c[3], p: c[4], cta: c[5], y: ((0.5 - q) * k[j] + 90 * (1 - e) - 120 * xo).toFixed(1), r: ((j - 1) * 2 * (1 - e) + (j - 1) * 6 * xo).toFixed(2), o: (e * (1 - 0.85 * xo)).toFixed(3), py: ((q - 0.5) * -60).toFixed(1) };
      })
    };
  }
  renderVals() {
    const s = this.state, Lo = this.L;
    const sy = s.sy;
    const cl = (x) => Math.min(1, Math.max(0, x));
    const sst = (a, b, x) => { const t = cl((x - a) / (b - a)); return t * t * (3 - 2 * t); };
    const hh = Lo.hh || 900;
    const fixScale = Math.max(Lo.fw / 1600, Lo.fh / 900);
    const heroScale = Math.max(Lo.hw / 1600, hh / 900);
    const titleK = Math.min(1, (Lo.hw / heroScale) / 1080);
    const q2 = this.prog(Lo.deck, sy), q3 = this.prog(Lo.train, sy), q4 = this.prog(Lo.how, sy), q5 = this.prog(Lo.host, sy);
    const line = s.nar >= 0 ? this.LINES[s.nar].t : '';
    if (line) { this.lastLine = line; this.lastC = this.LINES[s.nar].c; }
    const fhh = Lo.fh || 900;
    const t1 = -((sy * 0.22) % fhh), t2 = -((sy * 0.4) % fhh);
    const ph = q2 < 0.12 ? 'THE DECK' : q2 < 0.4 ? 'SHUFFLE' : q2 < 0.62 ? 'DRAW' : 'REVEAL';
    const ds = (a, b) => sst(a, b, q2);
    const dk = Lo.deck || {}, tr = Lo.train || {}, hw = Lo.how || {}, hs = Lo.host || {};
    this.deckIn = dk.top ? sst(dk.top - 40, dk.top, sy) : 1;
    this.deckOut = dk.top ? sst(dk.top + dk.h - dk.sh - 6, dk.top + dk.h - dk.sh, sy) : 0;
    if (!this.cDeck || this.near(dk, sy)) this.cDeck = this.deckCards(q2);
        if (!this.cHow || this.near(hw, sy)) this.cHow = this.howTo(q4, hw.sw || 1440, hw.sh || 900);
    if (!this.cHost || this.near(hs, sy)) this.cHost = this.beatHost(q5, hs.sw || 1440, hs.sh || 900);
    const gs = Lo.gal || {}, vs = Lo.voices || {}, vh = Lo.vh || 900;
    const q6 = this.prog(gs, sy);
    if (!this.cGal || this.near(gs, sy)) this.cGal = this.gallery(q6, gs.sw || 1440, gs.sh || 900);
    const q7 = vs.h ? Math.min(1, Math.max(0, (sy - vs.top + vh) / (vs.h + vh))) : 0;
    if (!this.cVoc || (sy > vs.top - vh * 1.5 && sy < vs.top + vs.h + vh)) this.cVoc = this.voicesV(q7);
    if (this.reel) { const want = this.cGal && this.cGal.vidOn && this.near(gs, sy); if (want && this.reel.paused && !this.reelUser) { const pp = this.reel.play(); if (pp && pp.catch) pp.catch(() => {}); } else if (!want && !this.reel.paused) this.reel.pause(); }
    const redIn = hs.top ? sst(hs.top - (hs.sh || 900) * 0.8, hs.top, sy) * (1 - sst(hs.top + hs.h - (hs.sh || 900), hs.top + hs.h, sy)) : 0;
    const th = tr.sh || 900;
    return {
      setRoot: this.setRoot, setFixed: this.setFixed, setHero: this.setHero, setDeck: this.setDeck, setDeckStage: this.setDeckStage,
      setTrain: this.setTrain, setTrainStage: this.setTrainStage, setHow: this.setHow, setHowStage: this.setHowStage,
      setHost: this.setHost, setHostStage: this.setHostStage, setIntro: this.setIntro, setLoop: this.setLoop,
      skip: this.skip, replay: this.replay,
      rootCls: s.title ? 'on' : '',
      fixScale: fixScale.toFixed(4), heroScale: heroScale.toFixed(4), titleK: titleK.toFixed(3),
      skyTY: (-sy * 0.05).toFixed(1),
      introO: s.ended ? '0' : (1 - sst(0, 0.75 * hh, sy)).toFixed(3),
      vidO: (1 - sst(0, 0.75 * hh, sy)).toFixed(3),
      heroTY: (sy * 0.38).toFixed(1), heroO: (1 - sst(0.05 * hh, 0.6 * hh, sy)).toFixed(3),
      dimO: (0.32 * sst(0.4 * hh, hh, sy)).toFixed(3), redO: redIn.toFixed(3),
      twO: (0.85 * sst(0.3 * hh, hh, sy)).toFixed(3), smkO: (0.12 + 0.13 * sst(0.3 * hh, hh, sy)).toFixed(3), smkO2: (0.15 * sst(0.5 * hh, 1.5 * hh, sy)).toFixed(3), smkY: (-((sy * 0.12) % 900)).toFixed(1), smkY2: (-((sy * 0.25) % 900)).toFixed(1), tw1: t1.toFixed(1), tw2: t2.toFixed(1),
      stars1: this.stars1, stars2: this.stars2,
      narC: (s.nar >= 0 ? this.LINES[s.nar].c : this.lastC) || '#D7C4A0', narText: line || this.lastLine || '', narO: s.nar >= 0 ? '1' : '0', narY: s.nar >= 0 ? '0' : '8',
      showSkip: !s.title, showReplay: s.ended && sy < 40,
      navBg: sy > hh * 0.6 ? 'rgba(5,6,11,.82)' : 'linear-gradient(rgba(0,0,0,.7), rgba(0,0,0,0))',
      navLine: sy > hh * 0.6 ? 'rgba(201,160,99,.2)' : 'transparent',
      deckScale: Math.min((dk.sw || 1440) / 1600, (dk.sh || 900) / 900).toFixed(4),
      cards: this.cDeck,
      halo: (0.4 + 0.6 * ds(0.1, 0.3) - 0.5 * ds(0.6, 0.8)).toFixed(3),
      haloS: (0.8 + 0.3 * Math.sin(Math.PI * ds(0.3, 0.42))).toFixed(3),
      headO: ds(0, 0.08).toFixed(3),
      h1o: (1 - ds(0.38, 0.43)).toFixed(3), h2o: (ds(0.4, 0.45) * (1 - ds(0.6, 0.65))).toFixed(3), h3o: ds(0.62, 0.67).toFixed(3),
      rowLab: (ds(0.76, 0.84) * (1 - ds(0.88, 0.92))).toFixed(3),
      deckHud: (ds(0.02, 0.08) * (1 - ds(0.95, 1))).toFixed(3), deckPhase: ph, deckPct: (q2 * 100).toFixed(1),
      tcards: this.transit(Lo, sy).list, tDisp: this.transit(Lo, sy).d, mz: this.mosaicV(Lo, sy),
      ht: this.cHow, bh: this.cHost, gl: this.cGal, vc: this.cVoc,
      ct: this.ctaV(Lo, sy), qty: s.qty, qMinus: this.qMinus, qPlus: this.qPlus, addCart: this.addCart, added: !!s.added, cartN: s.cart, setZoom: this.setZoom, zoomMove: this.zoomMove, zoomOut: this.zoomOut, zx: (s.zx || 50).toFixed(1), zy: (s.zy || 50).toFixed(1), ft: this.footV(Lo, sy), setFoot: this.setFoot, pk1: this.pk1, pk2: this.pk2, hcards: this.heroCards(sy, hh, Lo, heroScale), hcDisp: sy > ((Lo.deck || {}).top || 99999) + 60 ? 'none' : 'block', spDots: this.spine(Lo, sy).dots, spFill: this.spine(Lo, sy).fill, spO: Math.min(1, Math.max(0, (sy - hh * 0.5) / (hh * 0.4))).toFixed(3),
      hasG: s.gsel >= 0, closeG: this.closeG, nextG: this.nextG, prevG: this.prevG,
      gsel: s.gsel >= 0 ? { src: this.GT[s.gsel].src, cap: this.GT[s.gsel].cap, idx: s.gsel + 1, n: this.GT.length } : { src: '', cap: '', idx: 0, n: 0 },
      join: this.join, joined: !!s.joined, notJoined: !s.joined, setCta: this.setCta,
      pbOn: !!s.pb, pbOpenFn: this.pbOpenFn, pbClose: this.pbClose, pkI: s.pack || 0, menuOn: !!s.menu, menuOpenFn: this.menuOpenFn, menuClose: this.menuClose,
      hasSel: s.sel >= 0, closeSel: this.closeSel, nextSel: this.nextSel, prevSel: this.prevSel,
      sel: s.sel >= 0 ? Object.assign({ n: this.CARDS[s.sel].n, src: this.CARDS[s.sel].src, glow: this.CARDS[s.sel].c, idx: s.sel + 1 }, this.META[s.sel]) : { n: '', src: '', glow: '', idx: 0 },
      setGal: this.setGal, setGalStage: this.setGalStage, setVoices: this.setVoices, setReel: this.setReel
    };
  }

  render() {
    const __v: any = this.renderVals()
    return (
<><div ref={__v.setRoot} className={__v.rootCls} style={{ position: 'relative', background: '#05060B', color: '#EDE6DA', fontFamily: '\'Saira\', sans-serif' }}>

<div ref={__v.setFixed} aria-hidden={'true'} style={{ position: 'fixed', left: '0', top: '0', width: '100%', height: 'min(100vh, 1200px)', overflow: 'hidden', zIndex: '0', background: '#05060B' }}>
<div className={'g3'} style={{ position: 'absolute', left: '50%', top: '50%', width: '1600px', height: '900px', transform: `translate3d(-50%, -50%, 0) translateY(${S(__v.skyTY)}px) scale(${S(__v.fixScale)})` }}>
<div className={'sky'}></div>
<video ref={__v.setLoop} src={'/cinematic/video/hero-b-loop.mp4'} poster={'/cinematic/video/hero-b-poster.jpg'} muted={true} loop={true} playsInline={true} preload={'auto'} style={{ position: 'absolute', left: '0', top: '0', width: '1600px', height: '900px', objectFit: 'cover', display: 'block', opacity: __v.vidO }}></video>
<video ref={__v.setIntro} src={'/cinematic/video/hero-b-intro.mp4'} muted={true} playsInline={true} preload={'auto'} style={{ position: 'absolute', left: '0', top: '0', width: '1600px', height: '900px', objectFit: 'cover', display: 'block', opacity: __v.introO }}></video>
</div>
<div className={'g3'} style={{ position: 'absolute', left: '0', top: '0', width: '100%', height: '200%', transform: `translate3d(0, ${S(__v.tw1)}px, 0)`, opacity: __v.twO }}>
{(__v.stars1 || []).map((s: any, $index: number) => (<React.Fragment key={$index}><i className={'tw'} style={{ left: `${S(s?.x)}%`, top: `${S(s?.y)}%`, animationDelay: `${S(s?.d)}s` }}></i></React.Fragment>))}
</div>
<div className={'g3'} style={{ position: 'absolute', left: '0', top: '0', width: '100%', height: '200%', transform: `translate3d(0, ${S(__v.tw2)}px, 0)`, opacity: __v.twO }}>
{(__v.stars2 || []).map((s: any, $index: number) => (<React.Fragment key={$index}><i className={'tw'} style={{ left: `${S(s?.x)}%`, top: `${S(s?.y)}%`, width: '3px', height: '3px', animationDelay: `${S(s?.d)}s` }}></i></React.Fragment>))}
</div>
<div className={'g3'} style={{ position: 'absolute', inset: '0', opacity: __v.smkO, transform: `translate3d(0, ${S(__v.smkY)}px, 0)` }}><div className={'smk'}></div></div>
<div className={'g3'} style={{ position: 'absolute', inset: '0', opacity: __v.smkO2, transform: `translate3d(0, ${S(__v.smkY2)}px, 0) scaleX(-1)` }}><div className={'smk'} style={{ animationDuration: '80s', animationDirection: 'alternate-reverse' }}></div></div>
<div style={{ position: 'absolute', inset: '0', background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 50%, rgba(0,0,0,.6) 100%)' }}></div>
<div style={{ position: 'absolute', inset: '0', background: '#03040A', opacity: __v.dimO }}></div>
<div style={{ position: 'absolute', inset: '0', background: 'radial-gradient(ellipse at 70% 40%, rgba(150,22,18,.55) 0%, rgba(60,8,8,.5) 40%, rgba(5,2,2,.92) 100%)', opacity: __v.redO }}></div>
</div>

<nav className={'nv'} style={{ position: 'fixed', left: '0', right: '0', top: '0', zIndex: '20', height: '76px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 36px', background: __v.navBg, borderBottom: `1px solid ${S(__v.navLine)}`, transition: 'background .4s, border-color .4s' }}>
<a href={'#top'} style={{ fontFamily: '\'Cinzel\', serif', fontWeight: '700', fontSize: '22px', letterSpacing: '.24em', color: '#E8C989', textDecoration: 'none' }}>ZAMBAARA</a>
<div className={'navl'}><a href={'#deck'}>CARDS</a><a href={'#howto'}>HOW TO PLAY</a><a href={'/beat-the-host'}>BEAT THE HOST</a><a href={'/tournaments'}>TOURNAMENTS</a><a href={'/beach-battle'}>BEACH BATTLE</a><a href={'#chronicles'}>GALLERY</a></div>
<a href={'#next'} className={'cta'} aria-label={'Shop'} style={{ minHeight: '44px', padding: '0 20px', fontSize: '13px' }}>PRE-BOOK</a>
</nav>
<div style={{ position: 'fixed', left: '0', top: '0', width: '100%', height: '100%', zIndex: '15', pointerEvents: 'none', overflow: 'hidden', display: __v.hcDisp }}>
{(__v.hcards || []).map((h: any, $index: number) => (<React.Fragment key={$index}>
<button type={'button'} className={'hcw'} aria-label={h?.lab} onClick={h?.pick} style={{ transform: `translate3d(${S(h?.x)}px, ${S(h?.y)}px, 0) rotate(${S(h?.r)}deg) scale(${S(h?.s)})`, opacity: h?.o, pointerEvents: h?.pe, zIndex: h?.z }}>
<div className={'hci'} style={{ '--fx': `${S(h?.fx)}px`, '--fy': `${S(h?.fy)}px`, '--fr': `${S(h?.fr)}deg`, animationDelay: `${S(h?.d)}s` }}><div className={'hcb'} style={{ animationDelay: `${S(h?.bd)}s` }}><div className={'hfl'} style={{ transform: `rotateY(${S(h?.f)}deg)` }}><img src={h?.src} alt={''} style={{ boxShadow: `0 26px 60px rgba(0,0,0,.7), 0 0 ${S(h?.gb)}px ${S(h?.glow)}` }} /><img className={'hbk'} src={'/cinematic/cards/back.webp'} alt={''} style={{ boxShadow: '0 26px 60px rgba(0,0,0,.7)' }} /></div></div></div>
</button>
</React.Fragment>))}
</div>
<div aria-hidden={'true'} style={{ position: 'fixed', left: '0', top: '0', width: '100%', height: '100%', zIndex: '16', pointerEvents: 'none', overflow: 'hidden', display: __v.tDisp }}>
{(__v.tcards || []).map((t: any, $index: number) => (<React.Fragment key={$index}><div className={'tcw'} style={{ transform: `translate3d(${S(t?.x)}px, ${S(t?.y)}px, 0) perspective(900px) rotateX(${S(t?.rx)}deg) rotate(${S(t?.r)}deg) scale(${S(t?.s)})`, opacity: t?.o, zIndex: t?.z }}><img src={'/cinematic/cards/back.webp'} alt={''} /></div></React.Fragment>))}
</div>
<div aria-hidden={'true'} style={{ position: 'fixed', left: '0', top: '0', width: '100%', height: '100%', zIndex: '16', pointerEvents: 'none', overflow: 'hidden', display: __v.mz?.d, opacity: __v.mz?.o }}>
<div style={{ position: 'absolute', inset: '0', background: '#05060B', opacity: __v.mz?.bk }}></div>
{(__v.mz?.tiles || []).map((t: any, $index: number) => (<React.Fragment key={$index}><div className={'mzt'} style={{ left: `${S(t?.l)}px`, top: `${S(t?.t)}px`, width: `${S(__v.mz?.tw)}px`, height: `${S(__v.mz?.th)}px`, transform: `translate3d(${S(t?.x)}px, ${S(t?.y)}px, 0) rotate(${S(t?.r)}deg) scale(${S(t?.s)})`, opacity: t?.o, zIndex: t?.z }}><div className={'mzf'} style={{ transform: `perspective(900px) rotateY(${S(t?.f)}deg)` }}><div className={'mzb'} style={{ borderRadius: `${S(__v.mz?.rad)}px`, borderColor: `rgba(232,201,137,${S(__v.mz?.bdo)})` }}></div><div className={'mzp'} style={{ borderRadius: `${S(__v.mz?.rad)}px` }}><img src={'/cinematic/gallery/friends-table.webp'} alt={''} style={{ left: `${S(t?.ix)}px`, top: `${S(t?.iy)}px`, width: `${S(__v.mz?.bw)}px`, height: `${S(__v.mz?.bh)}px` }} /></div></div></div></React.Fragment>))}
<div style={{ position: 'absolute', left: `${S(__v.mz?.gx)}px`, top: `${S(__v.mz?.gy)}px`, width: '640px', height: '640px', margin: '-320px 0 0 -320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,232,170,.9), rgba(232,170,80,.35) 28%, rgba(0,0,0,0) 62%)', opacity: __v.mz?.go, transform: `scale(${S(__v.mz?.gs)})`, mixBlendMode: 'screen', zIndex: '99' }}></div>
</div>
<nav className={'spine'} aria-label={'Sections'} style={{ opacity: __v.spO }}>
<div style={{ position: 'absolute', left: '0', top: '0', width: '1px', height: '100%', background: 'rgba(201,160,99,.25)' }}></div>
<div style={{ position: 'absolute', left: '0', top: '0', width: '1px', height: `${S(__v.spFill)}%`, background: 'linear-gradient(#E8C989, #C9A063)', boxShadow: '0 0 8px rgba(232,201,137,.7)' }}></div>
{(__v.spDots || []).map((d: any, $index: number) => (<React.Fragment key={$index}><a href={d?.href} className={d?.cls} style={{ top: `${S(d?.t)}%` }}><i></i><span>{d?.n}</span></a></React.Fragment>))}
</nav>

<section id={'top'} ref={__v.setHero} style={{ position: 'relative', zIndex: '2', height: 'min(100vh, 1000px)', minHeight: '600px', overflow: 'hidden' }}><span id={'hero'} aria-hidden={'true'} style={{ position: 'absolute', left: '0', top: '0', width: '1px', height: '1px' }}></span>
<div className={'g3'} style={{ position: 'absolute', left: '50%', top: '50%', width: '1600px', height: '900px', transform: `translate3d(-50%, -50%, 0) translateY(${S(__v.heroTY)}px) scale(${S(__v.heroScale)})`, opacity: __v.heroO }}>
<div style={{ position: 'absolute', left: '0', top: '488px', width: '1600px', display: 'flex', justifyContent: 'center' }}>
<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transform: `scale(${S(__v.titleK)})`, transformOrigin: '50% 0', textShadow: '0 4px 30px rgba(0,0,0,.75)' }}>
<div style={{ position: 'relative' }}>
<h1 className={'L'} aria-label={'Zambaara'} style={{ margin: '0', paddingLeft: '.22em', fontFamily: '\'Cinzel\', serif', fontWeight: '700', fontSize: '112px', lineHeight: '1.1', letterSpacing: '.22em', color: '#E8C989', whiteSpace: 'nowrap' }}><span>Z</span><span>A</span><span>M</span><span>B</span><span>A</span><span>A</span><span>R</span><span>A</span></h1>
<div className={'shine'} aria-hidden={'true'} style={{ paddingLeft: '.22em', fontFamily: '\'Cinzel\', serif', fontWeight: '700', fontSize: '112px', lineHeight: '1.1', letterSpacing: '.22em', whiteSpace: 'nowrap', textShadow: 'none' }}>ZAMBAARA</div>
</div>
<div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginTop: '18px' }}><i className={'rl'}></i><div className={'tg'} style={{ paddingLeft: '.6em', fontFamily: '\'Cinzel\', serif', fontWeight: '700', fontSize: '20px', color: '#D7C4A0', whiteSpace: 'nowrap' }}>MASTER THE ELEMENTS</div><i className={'rl r'}></i></div>
<div className={'up'} style={{ marginTop: '18px', fontSize: '14px', letterSpacing: '.22em', paddingLeft: '.22em', color: '#CFC4B3', whiteSpace: 'nowrap' }}>THE ULTIMATE ELEMENTAL CARD GAME  ·  2–8 PLAYERS</div>
<a href={'#next'} className={'cta up'} style={{ marginTop: '48px' }}>PRE-BOOK NOW</a>
</div>
</div>
</div>
<div className={'lb lbT'} style={{ top: '0' }}></div>
<div className={'lb lbB'} style={{ bottom: '0' }}></div>
<div className={'nar'} aria-live={'polite'} style={{ position: 'absolute', left: '0', right: '0', bottom: '4.5%', zIndex: '5', textAlign: 'center', fontFamily: '\'Cinzel\', serif', fontSize: '18px', letterSpacing: '.32em', color: __v.narC, opacity: __v.narO, transform: `translateY(${S(__v.narY)}px)` }}>{__v.narText}</div>
<div className={'cue'} style={{ position: 'absolute', left: '50%', bottom: '26px', width: '400px', marginLeft: '-200px', zIndex: '5', textAlign: 'center', whiteSpace: 'nowrap', fontSize: '12px', letterSpacing: '.26em', color: '#A89A86' }}>SCROLL TO ENTER THE ARENA<i></i></div>
<div style={{ position: 'absolute', right: '28px', bottom: '26px', zIndex: '7' }}>
{__v.showSkip ? (<><button type={'button'} className={'ghost'} onClick={__v.skip}>SKIP INTRO  ›</button></>) : null}
{__v.showReplay ? (<><button type={'button'} className={'ghost'} onClick={__v.replay} aria-label={'Replay intro'}>↺  REPLAY</button></>) : null}
</div>
</section>

<section id={'deck'} ref={__v.setDeck} style={{ position: 'relative', zIndex: '2', height: '3600px' }}><span id={'cards'} aria-hidden={'true'} style={{ position: 'absolute', left: '0', top: '0', width: '1px', height: '1px' }}></span>
<div ref={__v.setDeckStage} style={{ position: 'sticky', top: '0', height: 'min(100vh, 1000px)', minHeight: '600px', overflow: 'hidden' }}>
<div style={{ position: 'absolute', left: '50%', top: '50%', width: '1600px', height: '900px', transform: `translate(-50%, -50%) scale(${S(__v.deckScale)})` }}>
<div className={'g3'} style={{ position: 'absolute', left: '800px', top: '500px', width: '900px', height: '900px', margin: '-450px 0 0 -450px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,190,120,.28) 0%, rgba(232,190,120,0) 60%)', opacity: __v.halo, transform: `scale(${S(__v.haloS)})` }}></div>
<div style={{ position: 'absolute', left: '0', right: '0', top: '70px', textAlign: 'center', opacity: __v.headO }}>
<div style={{ fontFamily: '\'Cinzel\', serif', fontSize: '15px', letterSpacing: '.34em', color: '#C9A063' }}>02 · GAME CARDS</div>
<div style={{ position: 'relative', height: '66px', marginTop: '12px' }}>
<h2 style={{ position: 'absolute', left: '0', right: '0', margin: '0', fontFamily: '\'Cinzel\', serif', fontWeight: '700', fontSize: '50px', letterSpacing: '.08em', color: '#E8C989', opacity: __v.h1o }}>SHUFFLE THE ELEMENTS</h2>
<h2 style={{ position: 'absolute', left: '0', right: '0', margin: '0', fontFamily: '\'Cinzel\', serif', fontWeight: '700', fontSize: '50px', letterSpacing: '.08em', color: '#E8C989', opacity: __v.h2o }}>DRAW YOUR HAND</h2>
<h2 style={{ position: 'absolute', left: '0', right: '0', margin: '0', fontFamily: '\'Cinzel\', serif', fontWeight: '700', fontSize: '50px', letterSpacing: '.08em', color: '#E8C989', opacity: __v.h3o }}>FOUR TRIBES · FOUR POWERS</h2>
</div>
</div>
<div style={{ position: 'absolute', left: '0', right: '0', top: '182px', textAlign: 'center', fontSize: '13px', letterSpacing: '.3em', color: '#C9A063', opacity: __v.rowLab }}>THE TRIBES</div>
<div style={{ position: 'absolute', left: '0', right: '0', top: '490px', textAlign: 'center', fontSize: '13px', letterSpacing: '.3em', color: '#C9A063', opacity: __v.rowLab }}>THE POWERS</div>
<div style={{ position: 'absolute', left: '0', right: '0', top: '812px', textAlign: 'center', fontSize: '15px', letterSpacing: '.26em', color: '#E8C989', opacity: __v.rowLab }}><span className={'cue'} style={{ opacity: '1' }}>✦  TAP ANY CARD TO REVEAL ITS DETAILS  ✦</span></div>
{(__v.cards || []).map((c: any, $index: number) => (<React.Fragment key={$index}>
<button type={'button'} className={'card'} aria-label={c?.lab} onClick={c?.pick} style={{ transform: `translate3d(${S(c?.x)}px, ${S(c?.y)}px, 0) rotate(${S(c?.r)}deg) scale(${S(c?.s)})`, zIndex: c?.z, opacity: c?.o, pointerEvents: c?.pe }}>
<div className={'flip'} style={{ transform: `rotateY(${S(c?.f)}deg)` }}>
<img className={'face'} src={c?.src} alt={c?.alt} />
<img className={'face bk'} src={'/cinematic/cards/back.webp'} alt={''} />
</div>
<div className={'glow'} style={{ boxShadow: `0 0 34px ${S(c?.gc)}`, opacity: c?.go }}></div>
</button>
</React.Fragment>))}
</div>
<div style={{ position: 'absolute', left: '32px', bottom: '30px', display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px', letterSpacing: '.2em', color: '#A89A86', opacity: __v.deckHud }}><span style={{ color: '#C9A063' }}>{__v.deckPhase}</span><span style={{ display: 'block', width: '180px', height: '2px', background: 'rgba(201,160,99,.2)' }}><span style={{ display: 'block', height: '2px', width: `${S(__v.deckPct)}%`, background: '#C9A063' }}></span></span></div>
</div>
</section>

<section id={'howto'} ref={__v.setHow} style={{ position: 'relative', zIndex: '2', height: '5600px' }}><span id={'how-to-play'} aria-hidden={'true'} style={{ position: 'absolute', left: '0', top: '0', width: '1px', height: '1px' }}></span>
<div ref={__v.setHowStage} style={{ position: 'sticky', top: '0', height: 'min(100vh, 1000px)', minHeight: '600px', overflow: 'hidden' }}>
<div style={{ position: 'absolute', left: '50%', top: '50%', width: '1600px', height: '900px', transform: `translate(-50%, -50%) scale(${S(__v.ht?.scale)})` }}>

<div className={'g3'} style={{ position: 'absolute', left: '-40px', top: '40px', width: '600px', height: '900px', opacity: __v.ht?.hostO, transform: `translate3d(${S(__v.ht?.hostX)}px, ${S(__v.ht?.hostY)}px, 0) scale(${S(__v.ht?.hostS)})` }}>
<div style={{ position: 'absolute', left: '60px', top: '120px', width: '480px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,40,24,.45), rgba(200,40,24,0) 65%)' }}></div>
<img className={'feath'} src={'/cinematic/host/host-throw.webp'} alt={'The Zambaara host conjuring Mountain, Rain and Lava cards'} style={{ position: 'absolute', left: '0', top: '0', width: '600px', height: '900px', objectFit: 'cover', display: 'block' }} />
</div>

<div style={{ position: 'absolute', left: '600px', right: '40px', top: '56px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', opacity: __v.ht?.headO }}>
<div>
<div style={{ fontFamily: '\'Cinzel\', serif', fontSize: '15px', letterSpacing: '.34em', color: '#C9A063' }}>04 · HOW TO PLAY</div>
<h2 style={{ margin: '10px 0 0', fontFamily: '\'Cinzel\', serif', fontWeight: '700', fontSize: '46px', letterSpacing: '.08em', color: '#E8C989' }}>ENTER THE ARENA</h2>
</div>
<div className={'rail'} style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
{(__v.ht?.rail || []).map((r: any, $index: number) => (<React.Fragment key={$index}><span style={{ color: r?.fg, borderColor: r?.bd, background: r?.bg }}>{r?.n}</span></React.Fragment>))}
</div>
</div>

<div style={{ position: 'absolute', left: '1000px', top: '500px', width: '0', height: '0', perspective: '1700px', opacity: __v.ht?.matO }}>
<div className={'mat'} style={{ transform: `translate(-50%, -50%) rotateX(${S(__v.ht?.tilt)}deg) scale(${S(__v.ht?.ms)}) translate(${S(__v.ht?.mx)}px, ${S(__v.ht?.my)}px)` }}>
<div style={{ position: 'absolute', left: '80px', top: '-320px', width: '1440px', height: '1440px', borderRadius: '50%', border: '1px solid rgba(201,160,99,.35)' }}></div>
<div style={{ position: 'absolute', left: '300px', top: '-100px', width: '1000px', height: '1000px', borderRadius: '50%', border: '1px solid rgba(201,160,99,.3)' }}></div>
<div style={{ position: 'absolute', left: '18px', top: '18px', right: '18px', bottom: '18px', border: '1.5px solid rgba(201,160,99,.85)', borderRadius: '6px' }}></div>
<div style={{ position: 'absolute', left: '0', right: '0', top: '399px', height: '1px', background: 'rgba(201,160,99,.4)' }}></div>

<div className={'zone'} style={{ left: '36px', top: '288px', width: '220px', height: '220px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className={'zg'} style={{ opacity: __v.ht?.z1 }}></div><div className={'zlab'} style={{ fontSize: '17px', lineHeight: '1.5', opacity: __v.ht?.chLab }}>BRACELET<br  />CHAMBER</div>
<div style={{ position: 'absolute', left: '0', top: '0', width: '100%', height: '100%' }}>
{(__v.ht?.brs || []).map((b: any, $index: number) => (<React.Fragment key={$index}><img src={b?.src} alt={b?.alt} style={{ position: 'absolute', left: '50%', top: '50%', width: '176px', height: 'auto', margin: '-56px 0 0 -88px', transform: `translate3d(${S(b?.x)}px, ${S(b?.y)}px, 0) rotate(${S(b?.r)}deg) scale(${S(b?.s)})`, opacity: b?.o, zIndex: b?.z, filter: b?.f }} /></React.Fragment>))}
</div>
<div className={'plq'} style={{ bottom: '-48px', width: '210px', marginLeft: '-105px', fontSize: '15px', opacity: __v.ht?.chosenO }}>LAVA CHOSEN</div></div>
<div className={'zone'} style={{ left: '278px', top: '202px', width: '280px', height: '396px', borderRadius: '14px' }}><div className={'zg'} style={{ opacity: __v.ht?.z3 }}></div><div className={'plq'} style={{ top: '-18px', transform: 'rotate(180deg)' }}>ATTACK PILE</div><div className={'plq'} style={{ bottom: '-18px' }}>ATTACK PILE</div></div>
<div className={'zone'} style={{ left: '600px', top: '198px', width: '400px', height: '400px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className={'zg'} style={{ opacity: __v.ht?.z2 }}></div><div className={'zlab'} style={{ fontSize: '22px', lineHeight: '1.5', opacity: __v.ht?.deckLab }}>DRAW<br  />DECK</div></div>
<div className={'zone'} style={{ left: '1042px', top: '202px', width: '280px', height: '396px', borderRadius: '14px' }}><div className={'zg'} style={{ opacity: __v.ht?.z4 }}></div><div className={'plq'} style={{ top: '-18px', transform: 'rotate(180deg)' }}>PUNISH PILE</div><div className={'plq'} style={{ bottom: '-18px' }}>PUNISH PILE</div></div>
<div className={'zone'} style={{ left: '1344px', top: '288px', width: '220px', height: '220px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}><div className={'zg'} style={{ opacity: __v.ht?.z5 }}></div>
<div className={'zlab'} style={{ fontSize: '16px', lineHeight: '1.4', opacity: __v.ht?.clockLab }}>SAND<br  />CLOCK</div>
<div aria-label={'Sand clock'} style={{ position: 'absolute', left: '50%', top: '50%', width: '120px', height: '200px', margin: '-100px 0 0 -60px', backgroundImage: 'url(/cinematic/sprites/hourglass-sprite.webp)', backgroundSize: '2880px 200px', backgroundPosition: `${S(__v.ht?.hgPos)}px 0`, opacity: __v.ht?.clockO, transform: `rotate(${S(__v.ht?.hgRot)}deg)`, filter: 'drop-shadow(0 0 14px rgba(232,180,90,.5))' }}></div>
<div style={{ position: 'absolute', left: '50%', top: '100%', width: '200px', margin: '30px 0 0 -100px', textAlign: 'center', fontFamily: '\'Cinzel\', serif', fontWeight: '700', fontSize: '34px', color: '#F3D594', opacity: __v.ht?.clockO }}>{__v.ht?.secs}s</div>
</div>
<div style={{ position: 'absolute', left: '0', right: '0', bottom: '34px', textAlign: 'center', fontFamily: '\'Cinzel\', serif', fontWeight: '700', fontSize: '34px', letterSpacing: '.3em', color: '#E8C989' }}>ZAMBAARA</div>

{(__v.ht?.pieces || []).map((p: any, $index: number) => (<React.Fragment key={$index}>
<div className={'pc'} style={{ transform: `translate3d(${S(p?.x)}px, ${S(p?.y)}px, 0) rotate(${S(p?.r)}deg) scale(${S(p?.s)})`, opacity: p?.o, zIndex: p?.z }}><img src={p?.src} alt={p?.alt} /></div>
</React.Fragment>))}
<div style={{ position: 'absolute', left: '418px', top: '400px', width: '600px', height: '600px', margin: '-300px 0 0 -300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,120,60,.8), rgba(255,80,40,0) 60%)', opacity: __v.ht?.flashA, pointerEvents: 'none' }}></div>
<div style={{ position: 'absolute', left: '1182px', top: '400px', width: '600px', height: '600px', margin: '-300px 0 0 -300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,214,120,.85), rgba(255,200,90,0) 60%)', opacity: __v.ht?.flashP, pointerEvents: 'none' }}></div>
</div>
</div>

<div style={{ position: 'absolute', left: '70px', top: '610px', width: '500px', height: '250px' }}>
{(__v.ht?.caps || []).map((c: any, $index: number) => (<React.Fragment key={$index}>
<div style={{ position: 'absolute', left: '0', top: '0', width: '500px', opacity: c?.o, transform: `translateY(${S(c?.y)}px)`, pointerEvents: c?.pe }}>
<div style={{ padding: '26px 28px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(14,10,8,.92), rgba(14,10,8,.72))', border: '1px solid rgba(201,160,99,.35)', boxShadow: '0 30px 60px rgba(0,0,0,.5)' }}>
<div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}><span style={{ fontFamily: '\'Cinzel\', serif', fontWeight: '700', fontSize: '40px', color: '#C9A063', lineHeight: '1' }}>{c?.n}</span><h3 style={{ margin: '0', fontFamily: '\'Cinzel\', serif', fontWeight: '700', fontSize: '26px', letterSpacing: '.06em', color: '#E8C989' }}>{c?.t}</h3></div>
<p style={{ margin: '14px 0 0', fontSize: '17px', lineHeight: '1.55', color: '#D9CFC0' }}>{c?.p}</p>
{c?.final ? (<><div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}><a href={'https://youtu.be/nxtyDh9SD-Q'} target={'_blank'} rel={'noopener'} className={'cta ctaf'} style={{ minHeight: '48px', padding: '0 22px', fontSize: '14px' }}>▶  WATCH THE TUTORIAL</a><a href={'#next'} className={'cta'} style={{ minHeight: '48px', padding: '0 22px', fontSize: '14px' }}>PRE-BOOK</a></div></>) : null}
</div>
</div>
</React.Fragment>))}
</div>
</div>
</div>
</section>

<section id={'host'} ref={__v.setHost} style={{ position: 'relative', zIndex: '2', height: '3800px' }}>
<div ref={__v.setHostStage} style={{ position: 'sticky', top: '0', height: 'min(100vh, 1000px)', minHeight: '600px', overflow: 'hidden' }}>
<div style={{ position: 'absolute', left: '50%', top: '50%', width: '1600px', height: '900px', transform: `translate(-50%, -50%) scale(${S(__v.bh?.scale)})` }}>

<div className={'g3'} style={{ position: 'absolute', left: '700px', top: '-40px', width: '900px', height: '1000px', opacity: __v.bh?.hostO, transform: `translate3d(${S(__v.bh?.hostX)}px, 0, 0) scale(${S(__v.bh?.hostS)})`, transformOrigin: '60% 40%' }}>
{(__v.bh?.orbBack || []).map((o: any, $index: number) => (<React.Fragment key={$index}><div className={'orb'} style={{ transform: `translate3d(${S(o?.x)}px, ${S(o?.y)}px, 0) rotate(${S(o?.r)}deg) scale(${S(o?.s)})`, opacity: o?.o }}><img src={o?.src} alt={''} /></div></React.Fragment>))}
<img className={'feathL'} src={'/cinematic/host/host-portrait.webp'} alt={'Portrait of the Zambaara host in his red top hat'} style={{ position: 'absolute', left: '150px', top: '0', width: '667px', height: '1000px', objectFit: 'cover', display: 'block', filter: `brightness(${S(__v.bh?.hostB)})` }} />
{(__v.bh?.orbFront || []).map((o: any, $index: number) => (<React.Fragment key={$index}><div className={'orb'} style={{ transform: `translate3d(${S(o?.x)}px, ${S(o?.y)}px, 0) rotate(${S(o?.r)}deg) scale(${S(o?.s)})`, opacity: o?.o }}><img src={o?.src} alt={''} /></div></React.Fragment>))}
</div>

<div style={{ position: 'absolute', left: '110px', top: '220px', width: '600px', opacity: __v.bh?.aO, transform: `translateY(${S(__v.bh?.aY)}px)`, pointerEvents: __v.bh?.aPE }}>
<div style={{ fontFamily: '\'Cinzel\', serif', fontSize: '15px', letterSpacing: '.34em', color: '#E07A5F' }}>05 · BEAT THE HOST</div>
<h2 style={{ margin: '14px 0 0', fontFamily: '\'Cinzel\', serif', fontWeight: '900', fontSize: '84px', lineHeight: '1.02', letterSpacing: '.04em', color: '#F3D594', textShadow: '0 0 40px rgba(200,40,24,.5)' }}>BEAT<br  />THE HOST</h2>
<p style={{ margin: '24px 0 0', maxWidth: '470px', fontSize: '19px', lineHeight: '1.6', color: '#E4D8C8' }}>Sit across the table from the Zambaara Host at our live events. Read his tells, out-draw his deck — and walk away a Zampion.</p>
<div style={{ display: 'flex', gap: '14px', marginTop: '30px' }}><a href={'/beat-the-host'} className={'cta ctaf'}>FIND AN EVENT</a><a href={'#next'} className={'cta'}>PRE-BOOK</a></div>
</div>

<div className={'g3'} style={{ position: 'absolute', left: '140px', top: '120px', width: '660px', height: '660px', opacity: __v.bh?.bO, transform: `translate3d(0, ${S(__v.bh?.bY)}px, 0) scale(${S(__v.bh?.bS)})` }}>
<div style={{ position: 'absolute', inset: '0', borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,190,110,.35), rgba(232,190,110,0) 62%)' }}></div>
<img className={'brc'} src={'/cinematic/bracelets/bracelets-stack-photo.webp'} alt={'Four Zambaara tribe bracelets stacked: Lava red, Rain blue, Wind opal and Mountain onyx'} style={{ position: 'absolute', left: '30px', top: '30px', width: '600px', height: '600px', display: 'block', borderRadius: '50%' }} />
<div style={{ position: 'absolute', inset: '18px', borderRadius: '50%', border: '1.5px solid rgba(232,201,137,.8)', boxShadow: '0 0 40px rgba(232,190,110,.35)' }}></div>
<div style={{ position: 'absolute', inset: '-14px', borderRadius: '50%', border: '1px dashed rgba(201,160,99,.45)', transform: `rotate(${S(__v.bh?.ringR)}deg)` }}></div>
</div>
<div style={{ position: 'absolute', left: '860px', top: '250px', width: '600px', textShadow: '0 2px 18px rgba(0,0,0,.9)', opacity: __v.bh?.cO, transform: `translateY(${S(__v.bh?.cY)}px)`, pointerEvents: __v.bh?.cPE }}>
<div style={{ fontFamily: '\'Cinzel\', serif', fontSize: '15px', letterSpacing: '.34em', color: '#C9A063' }}>THE REWARD</div>
<h2 style={{ margin: '14px 0 0', fontFamily: '\'Cinzel\', serif', fontWeight: '700', fontSize: '60px', lineHeight: '1.05', letterSpacing: '.05em', color: '#F3D594' }}>WIN THE<br  />BRACELETS</h2>
<p style={{ margin: '22px 0 0', maxWidth: '470px', fontSize: '19px', lineHeight: '1.6', color: '#E4D8C8' }}>One for every tribe — red Lava, blue Rain, opal Wind and onyx Mountain. Collect your tribe, or claim all four.</p>
<div style={{ display: 'flex', gap: '10px', marginTop: '26px' }}>
<span style={{ padding: '8px 14px', borderRadius: '999px', border: '1px solid #D83A2A', color: '#F29A8E', fontSize: '13px', letterSpacing: '.14em' }}>LAVA</span>
<span style={{ padding: '8px 14px', borderRadius: '999px', border: '1px solid #2F8FD8', color: '#8EC3EC', fontSize: '13px', letterSpacing: '.14em' }}>RAIN</span>
<span style={{ padding: '8px 14px', borderRadius: '999px', border: '1px solid #D8D8D8', color: '#EDEDED', fontSize: '13px', letterSpacing: '.14em' }}>WIND</span>
<span style={{ padding: '8px 14px', borderRadius: '999px', border: '1px solid #8A8178', color: '#C9BFB4', fontSize: '13px', letterSpacing: '.14em' }}>MOUNTAIN</span>
</div>
<div style={{ marginTop: '26px', padding: '16px 18px', borderRadius: '12px', border: '1px solid rgba(201,160,99,.35)', background: 'rgba(10,8,6,.7)', maxWidth: '520px' }}>
<div style={{ fontSize: '12px', letterSpacing: '.24em', color: '#C9A063' }}>WIN AT BEAT THE HOST</div>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px 18px', marginTop: '10px', fontSize: '15px', color: '#EDE6DA' }}><span>✦ Earth Bracelet · 10% off</span><span>✦ Ice Bracelet · 20% off</span><span>✦ A free game</span><span>✦ Buy 2 at ₹850</span></div>
</div>
</div>
</div>
</div>
</section>

<section id={'chronicles'} ref={__v.setGal} style={{ position: 'relative', zIndex: '2', height: '3400px' }}>
<div ref={__v.setGalStage} style={{ position: 'sticky', top: '0', height: 'min(100vh, 1000px)', minHeight: '600px', overflow: 'hidden' }}>
<div style={{ position: 'absolute', left: '50%', top: '50%', width: '1600px', height: '900px', transform: `translate(-50%, -50%) scale(${S(__v.gl?.scale)})` }}>
<div style={{ position: 'absolute', left: '120px', right: '120px', top: '92px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', opacity: __v.gl?.lO, transform: `translateY(${S(__v.gl?.lY)}px)` }}>
<div style={{ display: 'flex', alignItems: 'baseline', gap: '22px' }}><span style={{ fontFamily: '\'Cinzel\', serif', fontSize: '15px', letterSpacing: '.34em', color: '#C9A063' }}>06</span><h2 style={{ margin: '0', fontFamily: '\'Cinzel\', serif', fontWeight: '700', fontSize: '44px', letterSpacing: '.14em', color: '#F3D594' }}>GALLERY</h2></div>
<span style={{ fontSize: '14px', letterSpacing: '.24em', color: '#A89A86' }}>MOMENTS FROM THE ARENA · TAP TO EXPAND</span>
</div>
{(__v.gl?.tiles || []).map((g: any, $index: number) => (<React.Fragment key={$index}>
<button type={'button'} className={'gt'} aria-label={g?.lab} onClick={g?.pick} style={{ width: `${S(g?.w)}px`, height: `${S(g?.h)}px`, transform: `translate3d(${S(g?.x)}px, ${S(g?.y)}px, 0) scale(${S(g?.s)})`, transformOrigin: '50% 50%', clipPath: `inset(${S(g?.ci)}% ${S(g?.cx)}% ${S(g?.ci)}% ${S(g?.cx)}% round 14px)`, opacity: g?.o, zIndex: g?.z }}><img src={g?.src} alt={''} style={{ transform: `scale(${S(g?.is)})` }} /><span className={'gcap'}>{g?.cap}</span></button>
</React.Fragment>))}
<div className={'gt'} style={{ cursor: 'default', width: `${S(__v.gl?.v?.w)}px`, height: `${S(__v.gl?.v?.h)}px`, transform: `translate3d(${S(__v.gl?.v?.x)}px, ${S(__v.gl?.v?.y)}px, 0)`, clipPath: `inset(${S(__v.gl?.v?.ci)}% 0 ${S(__v.gl?.v?.ci)}% 0 round 14px)`, opacity: __v.gl?.v?.o }}>
<video ref={__v.setReel} src={'/cinematic/video/gallery-film.mp4'} poster={'/cinematic/gallery/fan-table.webp'} muted={true} loop={true} playsInline={true} preload={'metadata'} aria-label={'Zambaara gallery film'}></video>
<span className={'gcap'} style={{ transform: 'none' }}>THE FILM ▸</span>
</div>
<div style={{ position: 'absolute', left: '0', right: '0', top: '330px', textAlign: 'center', pointerEvents: 'none', zIndex: '5', opacity: __v.gl?.tO, transform: `translateY(${S(__v.gl?.tY)}px)`, textShadow: '0 6px 40px rgba(0,0,0,.8)' }}>
<div style={{ fontFamily: '\'Cinzel\', serif', fontSize: '16px', letterSpacing: '.5em', color: '#F3D594' }}>06 · WITNESS THE ELEMENTS IN ACTION</div>
<div style={{ marginTop: '8px', fontFamily: '\'Cinzel\', serif', fontWeight: '700', fontSize: '150px', letterSpacing: '.2em', paddingLeft: '.2em', color: '#FFF5DE' }}>GALLERY</div>
</div>
</div>
</div>
</section>

{__v.hasG ? (<>
<div className={'mdl'} role={'dialog'} aria-modal={'true'} aria-label={'Gallery image'} style={{ position: 'fixed', inset: '0', zIndex: '60', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '70px 24px', boxSizing: 'border-box' }}>
<button type={'button'} aria-label={'Close gallery'} onClick={__v.closeG} style={{ position: 'absolute', inset: '0', border: '0', cursor: 'zoom-out', background: 'rgba(3,3,5,.94)' }}></button>
<figure style={{ position: 'relative', margin: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', maxHeight: '100%' }}>
<img className={'mcard'} src={__v.gsel?.src} alt={__v.gsel?.cap} style={{ maxWidth: 'min(1100px, 90vw)', maxHeight: 'calc(100vh - 220px)', objectFit: 'contain', borderRadius: '12px', border: '1px solid rgba(232,201,137,.6)', boxShadow: '0 40px 100px rgba(0,0,0,.8)' }} />
<figcaption style={{ fontFamily: '\'Cinzel\', serif', fontWeight: '700', fontSize: '18px', letterSpacing: '.24em', color: '#F3D594' }}>{__v.gsel?.cap}  ·  {__v.gsel?.idx} / {__v.gsel?.n}</figcaption>
<div style={{ display: 'flex', gap: '10px' }}><button type={'button'} className={'nb'} onClick={__v.prevG}>‹  PREV</button><button type={'button'} className={'nb'} onClick={__v.nextG}>NEXT  ›</button></div>
</figure>
<button type={'button'} className={'mx'} onClick={__v.closeG} aria-label={'Close'} style={{ position: 'absolute', right: '24px', top: '24px' }}>✕</button>
</div>
</>) : null}

<section id={'voices'} ref={__v.setVoices} style={{ position: 'relative', zIndex: '2', padding: '140px 24px 120px', overflow: 'hidden' }}>
<div style={{ maxWidth: '1240px', margin: '0 auto' }}>
<div style={{ textAlign: 'center', opacity: __v.vc?.hO, transform: `translateY(${S(__v.vc?.hY)}px)` }}>
<div style={{ fontFamily: '\'Cinzel\', serif', fontSize: '15px', letterSpacing: '.34em', color: '#C9A063' }}>07 · VOICES OF THE ARENA</div>
<h2 style={{ margin: '12px 0 0', fontFamily: '\'Cinzel\', serif', fontWeight: '700', fontSize: 'clamp(32px, 4.4vw, 56px)', letterSpacing: '.08em', color: '#E8C989' }}>HEAR FROM THE ZAMPIONS</h2>
</div>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '36px', marginTop: '70px', alignItems: 'start' }}>
{(__v.vc?.cards || []).map((v: any, $index: number) => (<React.Fragment key={$index}>
<figure className={'g3'} style={{ margin: '0', transform: `translate3d(0, ${S(v?.y)}px, 0) rotate(${S(v?.r)}deg)`, opacity: v?.o }}>
<div style={{ position: 'relative', aspectRatio: '9 / 16', borderRadius: '14px', overflow: 'hidden', border: '1.5px solid rgba(232,201,137,.8)', boxShadow: '0 0 0 7px rgba(10,8,6,.9), 0 0 0 8px rgba(201,160,99,.35), 0 40px 80px rgba(0,0,0,.6)' }}>
<img src={v?.src} alt={v?.alt} style={{ position: 'absolute', left: '0', top: '-8%', width: '100%', height: '116%', objectFit: 'cover', transform: `translate3d(0, ${S(v?.py)}px, 0) scale(1.06)` }} />
<div style={{ position: 'absolute', inset: '0', background: 'linear-gradient(rgba(0,0,0,0) 45%, rgba(8,6,4,.92))' }}></div>
<div style={{ position: 'absolute', left: '22px', right: '22px', bottom: '22px' }}>
<div style={{ fontSize: '11px', letterSpacing: '.3em', color: '#C9A063' }}>{v?.k}</div><div style={{ marginTop: '8px', fontFamily: '\'Cinzel\', serif', fontWeight: '700', fontSize: '26px', lineHeight: '1.1', color: '#F3D594' }}>{v?.t}</div><p style={{ margin: '8px 0 0', fontSize: '15px', lineHeight: '1.5', color: '#EDE6DA' }}>{v?.p}</p>{v?.cta ? (<><a href={'/beat-the-host'} className={'cta ctaf'} style={{ marginTop: '14px', minHeight: '44px', padding: '0 16px', fontSize: '12px' }}>FIND AN EVENT</a></>) : null}
</div>
</div>
</figure>
</React.Fragment>))}
</div>
</div>
</section>

<section id={'next'} ref={__v.setCta} style={{ position: 'relative', zIndex: '2', padding: '130px 40px 130px', overflow: 'hidden' }}><span id={'battle-pack'} aria-hidden={'true'} style={{ position: 'absolute', left: '0', top: '0', width: '1px', height: '1px' }}></span><span id={'cave'} aria-hidden={'true'} style={{ position: 'absolute', left: '0', top: '0', width: '1px', height: '1px' }}></span>
<div aria-hidden={'true'} style={{ position: 'absolute', left: '50%', top: '0', width: '1400px', height: '900px', marginLeft: '-700px', background: 'radial-gradient(ellipse at 50% 30%, rgba(232,180,100,.16), rgba(0,0,0,0) 60%)', opacity: __v.ct?.o }}></div>
<div style={{ position: 'relative', maxWidth: '1240px', margin: '0 auto' }}>
<nav aria-label={'Breadcrumb'} style={{ fontSize: '12px', letterSpacing: '.14em', color: '#8F8372', marginBottom: '22px', opacity: __v.ct?.o }}><a href={'#top'} style={{ color: '#A89A86', textDecoration: 'none' }}>HOME</a>  /  <span>SHOP</span>  /  <span style={{ color: '#E8C989' }}>ZAMBAARA BATTLE PACK</span></nav>
<div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.08fr) minmax(0, 1fr)', gap: '56px', alignItems: 'start' }}>

<div style={{ opacity: __v.ct?.o, transform: `translateY(${S(__v.ct?.y)}px)` }}>
<div ref={__v.setZoom} onMouseMove={__v.zoomMove} onMouseLeave={__v.zoomOut} style={{ position: 'relative', aspectRatio: '1 / 1', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(201,160,99,.45)', background: '#0b0806', boxShadow: '0 40px 100px rgba(0,0,0,.6)', clipPath: `inset(${S(__v.ct?.ci)}% 0 ${S(__v.ct?.ci)}% 0 round 16px)`, cursor: 'zoom-in' }}>
{(__v.ct?.imgs || []).map((g: any, $index: number) => (<React.Fragment key={$index}><img src={g?.src} alt={g?.alt} style={{ position: 'absolute', inset: '0', width: '100%', height: '100%', objectFit: 'cover', opacity: g?.o, transform: `scale(${S(g?.s)})`, transformOrigin: `${S(__v.zx)}% ${S(__v.zy)}%`, transition: 'opacity .6s ease, transform .5s cubic-bezier(.22,1,.36,1)' }} /></React.Fragment>))}
<span style={{ position: 'absolute', left: '14px', top: '14px', padding: '7px 12px', borderRadius: '999px', background: 'rgba(10,8,6,.8)', border: '1px solid rgba(201,160,99,.5)', fontSize: '11px', letterSpacing: '.18em', color: '#F3D594' }}>PRE-BOOKING OPEN</span>
</div>
<div role={'group'} aria-label={'Product images'} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '10px', marginTop: '12px' }}>
{(__v.ct?.thumbs || []).map((t: any, $index: number) => (<React.Fragment key={$index}><button type={'button'} onClick={t?.pick} aria-label={t?.lab} aria-pressed={t?.on} style={{ padding: '0', aspectRatio: '1 / 1', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer', background: '#0b0806', border: `1.5px solid ${S(t?.bd)}`, opacity: t?.op, transition: 'border-color .3s, opacity .3s' }}><img src={t?.src} alt={''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /></button></React.Fragment>))}
</div>
</div>

<div style={{ display: 'flex', flexDirection: 'column', gap: '20px', opacity: __v.ct?.o2, transform: `translateY(${S(__v.ct?.y2)}px)` }}>
<div>
<div style={{ fontSize: '12px', letterSpacing: '.3em', color: '#C9A063' }}>08 · THE BATTLE PACK</div>
<h2 style={{ margin: '10px 0 0', fontFamily: '\'Cinzel\', serif', fontWeight: '700', fontSize: 'clamp(36px, 3.6vw, 52px)', lineHeight: '1.08', letterSpacing: '.03em', color: '#F3D594' }}>Zambaara Battle Pack</h2>
<p style={{ margin: '8px 0 0', fontSize: '16px', color: '#A89A86' }}>Strategic gameplay for 2–8 players</p>
<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '14px' }}><span style={{ padding: '5px 11px', borderRadius: '999px', border: '1px solid rgba(201,160,99,.35)', fontSize: '11px', letterSpacing: '.16em', color: '#CFC4B3' }}>CARD GAME</span><span style={{ padding: '5px 11px', borderRadius: '999px', border: '1px solid rgba(201,160,99,.35)', fontSize: '11px', letterSpacing: '.16em', color: '#CFC4B3' }}>STRATEGY GAME</span><span style={{ padding: '5px 11px', borderRadius: '999px', border: '1px solid rgba(201,160,99,.35)', fontSize: '11px', letterSpacing: '.16em', color: '#CFC4B3' }}>PARTY GAME</span></div>
</div>
<div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', flexWrap: 'wrap', paddingBottom: '18px', borderBottom: '1px solid rgba(201,160,99,.2)' }}>
<span style={{ fontFamily: '\'Cinzel\', serif', fontWeight: '700', fontSize: '40px', color: '#F3D594' }}>₹{__v.ct?.price}</span>
<span style={{ fontSize: '13px', color: '#A89A86' }}>Pre-book price{__v.ct?.qtyNote}</span>
</div>
<p style={{ margin: '0', fontSize: '16px', lineHeight: '1.7', color: '#D9CFC0' }}>The ultimate elemental card game. Master the four tribes — Lava, Rain, Wind and Mountain — wield the power cards Freeze, Lightning, Reverse and Meteor, and outplay the table to become the Zampion. Quick to learn, built for game nights, cafés and live tournaments.</p>

<div>
<div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', letterSpacing: '.2em', color: '#A89A86', marginBottom: '10px' }}><span>EDITION</span><span style={{ color: '#E8C989' }}>{__v.ct?.ed}</span></div>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
<button type={'button'} className={'pt'} onClick={__v.pk1} aria-pressed={__v.ct?.p1} style={{ minHeight: '52px', background: __v.ct?.p1bg, color: __v.ct?.p1fg, borderColor: __v.ct?.p1bd }}>2–4 PLAYERS</button>
<button type={'button'} className={'pt'} onClick={__v.pk2} aria-pressed={__v.ct?.p2} style={{ minHeight: '52px', background: __v.ct?.p2bg, color: __v.ct?.p2fg, borderColor: __v.ct?.p2bd }}>5–8 PLAYERS</button>
</div>
<p style={{ margin: '10px 0 0', fontSize: '14px', lineHeight: '1.6', color: '#A89A86' }}>{__v.ct?.edNote}</p>
</div>

<div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'stretch' }}>
<div role={'group'} aria-label={'Quantity'} style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(201,160,99,.45)', borderRadius: '6px', overflow: 'hidden' }}>
<button type={'button'} onClick={__v.qMinus} aria-label={'Decrease quantity'} style={{ width: '46px', minHeight: '52px', border: '0', background: 'transparent', color: '#E8C989', fontSize: '20px', cursor: 'pointer' }}>−</button>
<span aria-live={'polite'} style={{ minWidth: '36px', textAlign: 'center', fontSize: '16px', color: '#EDE6DA' }}>{__v.qty}</span>
<button type={'button'} onClick={__v.qPlus} aria-label={'Increase quantity'} style={{ width: '46px', minHeight: '52px', border: '0', background: 'transparent', color: '#E8C989', fontSize: '20px', cursor: 'pointer' }}>+</button>
</div>
<button type={'button'} className={'cta ctaf'} onClick={__v.pbOpenFn} style={{ flex: '1', minWidth: '150px', minHeight: '52px', fontFamily: '\'Saira\', sans-serif' }}>PRE-BOOK NOW</button><a className={'cta'} href={'/how-to-play'} style={{ flex: '1', minWidth: '150px', minHeight: '52px' }}>HOW TO PLAY</a>
</div>
<p style={{ margin: '0', fontSize: '13px', lineHeight: '1.5', color: '#A89A86' }}>Fill out the pre-booking form and we will contact you when the game is ready to ship.</p>

<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '10px' }}>
<div style={{ padding: '14px 12px', borderRadius: '10px', border: '1px solid rgba(201,160,99,.22)', textAlign: 'center' }}><div style={{ fontFamily: '\'Cinzel\', serif', fontSize: '18px', color: '#F3D594' }}>2–8</div><div style={{ marginTop: '4px', fontSize: '11px', letterSpacing: '.14em', color: '#A89A86' }}>PLAYERS</div></div>
<div style={{ padding: '14px 12px', borderRadius: '10px', border: '1px solid rgba(201,160,99,.22)', textAlign: 'center' }}><div style={{ fontFamily: '\'Cinzel\', serif', fontSize: '18px', color: '#F3D594' }}>4 + 4</div><div style={{ marginTop: '4px', fontSize: '11px', letterSpacing: '.14em', color: '#A89A86' }}>TRIBES · POWERS</div></div>
<div style={{ padding: '14px 12px', borderRadius: '10px', border: '1px solid rgba(201,160,99,.22)', textAlign: 'center' }}><div style={{ fontFamily: '\'Cinzel\', serif', fontSize: '18px', color: '#F3D594' }}>Live</div><div style={{ marginTop: '4px', fontSize: '11px', letterSpacing: '.14em', color: '#A89A86' }}>TOURNAMENTS</div></div>
</div>

<div style={{ borderTop: '1px solid rgba(201,160,99,.2)' }}>
{(__v.ct?.acc || []).map((x: any, $index: number) => (<React.Fragment key={$index}>
<div style={{ borderBottom: '1px solid rgba(201,160,99,.2)' }}>
<button type={'button'} onClick={x?.pick} aria-expanded={x?.on} style={{ width: '100%', minHeight: '54px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '0', background: 'transparent', color: '#EDE6DA', font: '500 14px Saira, sans-serif', letterSpacing: '.16em', cursor: 'pointer', padding: '0' }}>{x?.t}<span style={{ color: '#C9A063', fontSize: '18px', transform: `rotate(${S(x?.rot)}deg)`, transition: 'transform .3s' }}>+</span></button>
{x?.open ? (<><div className={'mdl'} style={{ padding: '0 0 18px', fontSize: '15px', lineHeight: '1.7', color: '#CFC4B3', whiteSpace: 'pre-line' }}>{x?.b}</div></>) : null}
</div>
</React.Fragment>))}
</div>
<div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', fontSize: '13px' }}><a href={'/how-to-play'}>Rulebook</a><a href={'https://youtu.be/nxtyDh9SD-Q'} target={'_blank'} rel={'noopener'}>Video tutorial</a><a href={'#contact'}>Bulk &amp; café orders</a></div>
</div>
</div>
</div>
</section>

<RankingsBlock></RankingsBlock>
<NewsletterBlock></NewsletterBlock>
<ContactBlock></ContactBlock>
<footer ref={__v.setFoot} style={{ position: 'relative', zIndex: '2', overflow: 'hidden', padding: '260px 24px 36px' }}>
<div aria-hidden={'true'} className={'g3'} style={{ position: 'absolute', left: '50%', top: '120px', width: '3000px', height: '3000px', marginLeft: '-1500px', borderRadius: '50%', background: 'radial-gradient(circle at 50% 0%, #120c08 0%, #050403 18%)', boxShadow: '0 -2px 0 rgba(232,201,137,.85), 0 -30px 90px rgba(232,170,80,.35), inset 0 40px 120px rgba(232,170,80,.12)', transform: `translate3d(0, ${S(__v.ft?.hy)}px, 0)` }}></div>
<div aria-hidden={'true'} style={{ position: 'absolute', left: '50%', top: '110px', width: '18px', height: '18px', marginLeft: '-9px', borderRadius: '50%', background: '#FFE7B3', boxShadow: '0 0 30px 10px rgba(255,200,120,.7)', opacity: __v.ft?.sun, transform: `translateY(${S(__v.ft?.sy)}px)` }}></div>
<div style={{ position: 'relative', maxWidth: '1240px', margin: '0 auto' }}>
<div className={'fw'} aria-label={'Zambaara'} style={{ textAlign: 'center', fontFamily: '\'Cinzel\', serif', fontWeight: '700', fontSize: 'clamp(56px, 12vw, 180px)', letterSpacing: '.14em', paddingLeft: '.14em', lineHeight: '1', whiteSpace: 'nowrap', overflow: 'hidden' }}>
{(__v.ft?.letters || []).map((l: any, $index: number) => (<React.Fragment key={$index}><span aria-hidden={'true'} style={{ transform: `translate3d(0, ${S(l?.y)}px, 0)`, opacity: l?.o, color: 'transparent', WebkitTextStroke: '1px rgba(232,201,137,.7)', backgroundImage: `linear-gradient(0deg, #E8C989 ${S(l?.f)}%, rgba(232,201,137,0) ${S(l?.f)}%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>{l?.c}</span></React.Fragment>))}
</div>
<div style={{ display: 'flex', justifyContent: 'center', gap: '18px', margin: '30px 0 60px', opacity: __v.ft?.o }}>
{(__v.ft?.icons || []).map((i: any, $index: number) => (<React.Fragment key={$index}><img src={i?.src} alt={i?.n} style={{ width: '42px', height: '42px', transform: `translateY(${S(i?.y)}px)`, filter: `drop-shadow(0 0 10px ${S(i?.g)})` }} /></React.Fragment>))}
</div>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '36px', padding: '40px 0', borderTop: '1px solid rgba(201,160,99,.22)', borderBottom: '1px solid rgba(201,160,99,.22)', opacity: __v.ft?.o, transform: `translateY(${S(__v.ft?.y)}px)` }}>
<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><img src={'/cinematic/brand/logo.png'} alt={''} style={{ width: '38px' }} /><span style={{ fontFamily: '\'Cinzel\', serif', fontWeight: '700', fontSize: '18px', letterSpacing: '.22em', color: '#E8C989' }}>ZAMBAARA</span></div><p style={{ margin: '0', fontSize: '14px', lineHeight: '1.6', color: '#A89A86' }}>The ultimate elemental card game. Strategic gameplay for 2–8 players. Master the elements, win the bracelets, become the Zampion.</p></div>
<nav className={'fl'} aria-label={'The game'}><div style={{ fontFamily: '\'Cinzel\', serif', fontSize: '13px', letterSpacing: '.24em', color: '#C9A063', marginBottom: '8px' }}>THE GAME</div><a href={'#deck'}>The Cards</a><a href={'#howto'}>How to Play</a><a href={'/how-to-play'}>Rulebook</a><a href={'#next'}>Battle Pack</a></nav>
<nav className={'fl'} aria-label={'The arena'}><div style={{ fontFamily: '\'Cinzel\', serif', fontSize: '13px', letterSpacing: '.24em', color: '#C9A063', marginBottom: '8px' }}>THE ARENA</div><a href={'/beat-the-host'}>Beat the Host</a><a href={'/tournaments'}>Tournaments</a><a href={'/beach-battle'}>Beach Battle</a><a href={'#rankings'}>Event Rankings</a></nav>
<nav className={'fl'} aria-label={'Community'}><div style={{ fontFamily: '\'Cinzel\', serif', fontSize: '13px', letterSpacing: '.24em', color: '#C9A063', marginBottom: '8px' }}>COMMUNITY</div><a href={'#chronicles'}>Gallery</a><a href={'#voices'}>Zampion Voices</a><a href={'#contact'}>Contact</a><a href={'https://youtu.be/nxtyDh9SD-Q'} target={'_blank'} rel={'noopener'}>Video Tutorial</a></nav>
</div>
<div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', paddingTop: '22px', fontSize: '13px', letterSpacing: '.12em', color: '#6E6457' }}><span>© 2026 ZAMBAARA · MASTER THE ELEMENTS, BECOME THE ZAMPION</span><a href={'#top'} style={{ color: '#C9A063', textDecoration: 'none', letterSpacing: '.2em' }}>RETURN TO THE BEGINNING  ↑</a></div>
</div>
</footer>

<PreBookModal open={__v.pbOn} onClose={__v.pbClose} edition={__v.pkI} qty={__v.qty}></PreBookModal>
{__v.hasSel ? (<>
<div className={'mdl'} role={'dialog'} aria-modal={'true'} aria-label={`${S(__v.sel?.n)} card details`} style={{ position: 'fixed', inset: '0', zIndex: '60', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', boxSizing: 'border-box' }}>
<button type={'button'} aria-label={'Close card details'} onClick={__v.closeSel} style={{ position: 'absolute', inset: '0', border: '0', cursor: 'pointer', background: `radial-gradient(circle at 40% 50%, ${S(__v.sel?.tint)} 0%, rgba(3,3,6,.94) 60%)` }}></button>
<div style={{ position: 'relative', display: 'flex', gap: '56px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '1060px', width: '100%', maxHeight: '100%', overflow: 'auto' }}>
<div style={{ position: 'relative' }}>
<div aria-hidden={'true'} style={{ position: 'absolute', inset: '-50px', borderRadius: '50%', background: `radial-gradient(circle, ${S(__v.sel?.glow)}, rgba(0,0,0,0) 65%)` }}></div>
<img className={'mcard'} src={__v.sel?.src} alt={`${S(__v.sel?.n)} card`} style={{ position: 'relative', width: 'min(320px, 70vw)', height: 'auto', display: 'block', borderRadius: '16px', boxShadow: `0 40px 90px rgba(0,0,0,.75), 0 0 50px ${S(__v.sel?.glow)}` }} />
</div>
<div className={'minfo'} style={{ flex: '1', minWidth: '280px', maxWidth: '520px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
<div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}><img src={__v.sel?.icon} alt={''} style={{ width: '54px', height: '54px' }} /><span style={{ fontSize: '13px', letterSpacing: '.3em', color: __v.sel?.fg }}>{__v.sel?.kind}  ·  {__v.sel?.idx} / 8</span></div>
<h3 style={{ margin: '0', fontFamily: '\'Cinzel\', serif', fontWeight: '700', fontSize: '64px', letterSpacing: '.08em', lineHeight: '1', color: '#F3D594' }}>{__v.sel?.n}</h3>
<p style={{ margin: '0', fontFamily: '\'Cinzel\', serif', fontSize: '20px', lineHeight: '1.5', color: __v.sel?.fg }}>{__v.sel?.tag}</p>
<p style={{ margin: '0', fontSize: '17px', lineHeight: '1.65', color: '#D9CFC0' }}>{__v.sel?.lore}</p>
<div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px 20px', padding: '18px 20px', borderRadius: '12px', border: '1px solid rgba(201,160,99,.3)', background: 'rgba(14,10,8,.7)', fontSize: '15px', color: '#CFC4B3' }}><span style={{ color: '#C9A063', letterSpacing: '.14em', fontSize: '12px', paddingTop: '2px' }}>CARD TYPE</span><span>{__v.sel?.type}</span><span style={{ color: '#C9A063', letterSpacing: '.14em', fontSize: '12px', paddingTop: '2px' }}>GOES TO</span><span>{__v.sel?.pile}</span><span style={{ color: '#C9A063', letterSpacing: '.14em', fontSize: '12px', paddingTop: '2px' }}>RULES</span><a href={'/how-to-play'} style={{ color: '#E8C989' }}>Full rulebook &amp; video guide ›</a></div>
<div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}><button type={'button'} className={'nb'} onClick={__v.prevSel} aria-label={'Previous card'}>‹  PREV</button><button type={'button'} className={'nb'} onClick={__v.nextSel} aria-label={'Next card'}>NEXT  ›</button></div>
</div>
</div>
<button type={'button'} className={'mx'} onClick={__v.closeSel} aria-label={'Close'} style={{ position: 'absolute', right: '24px', top: '24px' }}>✕</button>
</div>
</>) : null}
</div></>
    )
  }
}
