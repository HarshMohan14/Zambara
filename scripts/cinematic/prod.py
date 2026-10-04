"""Turn the approved prototypes into production sources for the Next.js site.

Input : design prototypes (P02 desktop, P03 mobile) with /_blob asset ids
Output: patched .dc.html files ready for dc2tsx.py

Changes:
  * assets → /cinematic/... (public folder)
  * real site content (prices ₹799 / ₹899, card texts from the live site, rules, testimonials)
  * pre-booking form (existing /api/pre-bookings) instead of a fake cart
  * links to the site's real routes, legacy anchors (#hero #cards #how-to-play #battle-pack #cave #rankings #contact)
  * rankings / newsletter / contact blocks wired to the existing APIs
  * mobile: window scrolling instead of an inner scroller, real viewport sizes, menu
"""
import json, re, sys

def run(src, dst, manifest, mobile):
    s = open(src).read()

    def R(a, b, cnt=1):
        nonlocal s
        c = s.count(a)
        assert c == cnt, (a[:100], c)
        s = s.replace(a, b)

    def RX(pat, rep, cnt=1, flags=re.S):
        nonlocal s
        s2, n = re.subn(pat, rep, s, flags=flags)
        assert n == cnt, (pat[:100], n)
        s = s2

    # ---------- assets ----------
    amap = {m['prototype_blob_id']: '/cinematic/' + m['file'][len('assets/'):] for m in manifest}
    s = re.sub(r'/_blob/([0-9a-f]{32})', lambda m: amap[m.group(1)], s)
    assert '/_blob/' not in s

    # ---------- links ----------
    s = s.replace('https://www.zambaara.com/#rankings', '#rankings').replace('https://www.zambaara.com/#contact', '#contact')
    s = s.replace('https://www.zambaara.com/#battle-pack', '#next')
    s = s.replace('https://www.zambaara.com/', '/')
    s = s.replace('href="https://www.youtube.com/embed/nxtyDh9SD-Q"', 'href="https://youtu.be/nxtyDh9SD-Q" target="_blank" rel="noopener"')
    if not mobile:
        R('<a href="#next" class="cta ctaf">FIND AN EVENT</a>', '<a href="/beat-the-host" class="cta ctaf">FIND AN EVENT</a>')
        R('<a href="#howto" class="cta ctaf"', '<a href="https://youtu.be/nxtyDh9SD-Q" target="_blank" rel="noopener" class="cta ctaf"')
        R('<div class="navl"><a href="#deck">THE DECK</a><a href="#deck">CARDS</a><a href="#howto">HOW TO PLAY</a><a href="#host">BEAT THE HOST</a><a href="#chronicles">GALLERY</a></div>',
          '<div class="navl"><a href="#deck">CARDS</a><a href="#howto">HOW TO PLAY</a><a href="/beat-the-host">BEAT THE HOST</a><a href="/tournaments">TOURNAMENTS</a><a href="/beach-battle">BEACH BATTLE</a><a href="#chronicles">GALLERY</a></div>')
    # footer columns
    RX(r'<a href="#host">Beat the Host</a>', '<a href="/beat-the-host">Beat the Host</a>')
    RX(r'<a href="#chronicles">Gallery</a><a href="#voices">Zampion Voices</a>', '<a href="#chronicles">Gallery</a><a href="#voices">Zampion Voices</a>')

    # ---------- legacy anchors ----------
    span = lambda i: f'<span id="{i}" aria-hidden="true" style="position: absolute; left: 0; top: 0; width: 1px; height: 1px"></span>'
    RX(r'(<section id="top" [^>]*>)', r'\1' + span('hero'))
    RX(r'(<section id="deck" [^>]*>)', r'\1' + span('cards'))
    RX(r'(<section id="howto" [^>]*>)', r'\1' + span('how-to-play'))
    RX(r'(<section id="next" [^>]*>)', r'\1' + span('battle-pack') + span('cave'))

    # ---------- card texts from the live site ----------
    real = [
        ('Pure force in motion.', 'Lava advances without hesitation, reshaping the arena through pressure and heat.'),
        ('Measured and deliberate.', 'Rain cools excess, restoring control where chaos once ruled.'),
        ('Swift and unseen.', 'Wind alters the course of battle, carrying power where it is least expected.'),
        ('Enduring and immovable.', 'Mountain holds the ground, absorbing impact and standing against the flow.'),
        ('A pause imposed upon time.', 'Freeze halts a Seeker’s advance, forcing stillness and reflection.'),
        ('Instant and indiscriminate.', 'Lightning fractures the moment, striking all others in a single flash.'),
        ('A command over direction itself.', 'Reverse turns the arena around, dissolving momentum and resetting order.'),
        ('An intrusion from beyond the Cycle.', 'Meteor overwhelms the arena, answerable only to a force equally absolute.'),
    ]
    a = s.index('    this.META = ['); b = s.index('    ];', a) + len('    ];')
    old = s[a:b]
    ent = re.findall(r"\{ kind: '([^']*)', icon: '([^']*)', fg: '([^']*)', tint: '([^']*)'", old)
    assert len(ent) == 8, len(ent)
    cyc = 'Tribe card · Elemental cycle: Lava beats Wind, Wind beats Rain, Rain beats Lava, Mountain blocks all'
    piles = ['Attack Pile'] * 4 + ['Punish Pile', 'Punish Pile', 'Special play — see the rulebook', 'Special play — see the rulebook']
    types = [cyc] * 4 + ['Power card · punish', 'Power card · punish', 'Power card · special', 'Power card · special']
    js = lambda x: "'" + x.replace("\\", "\\\\").replace("'", "\\'") + "'"
    rows = []
    for (kind, icon, fg, tint), (tag, lore), pile, ty in zip(ent, real, piles, types):
        rows.append(f"      {{ kind: {js(kind)}, icon: {js(icon)}, fg: {js(fg)}, tint: {js(tint)}, tag: {js(tag)}, lore: {js(lore)}, pile: {js(pile)}, type: {js(ty)} }}")
    s = s[:a] + '    this.META = [\n' + ',\n'.join(rows) + '\n    ];' + s[b:]

    # ---------- product: real prices, pre-booking instead of a cart ----------
    R("price: (799 * st.qty).toLocaleString('en-IN'), qtyNote: st.qty > 1 ? ' · ' + st.qty + ' × ₹799' : '',",
      "price: ((pk === 0 ? 799 : 899) * st.qty).toLocaleString('en-IN'), qtyNote: st.qty > 1 ? ' · ' + st.qty + ' × ₹' + (pk === 0 ? 799 : 899) : '',")
    R("'Built for the bigger table: game nights, cafés and group battles for up to eight players.'",
      "'Ideal for larger gatherings. Battle with more players and unlock the full potential of the Zambaara experience.'")
    RX(r'<button type="button" class="cta" onClick="\{\{addCart\}\}"[^>]*>ADD TO CART</button>\s*<a class="cta ctaf" href="#next"[^>]*>PRE-BOOK NOW</a>',
       '<button type="button" class="cta ctaf" onClick="{{pbOpenFn}}" style="flex: 1; min-width: 150px; min-height: 52px; font-family: \'Saira\', sans-serif">PRE-BOOK NOW</button><a class="cta" href="/how-to-play" style="flex: 1; min-width: 150px; min-height: 52px">HOW TO PLAY</a>')
    RX(r'<sc-if value="\{\{added\}\}".*?</sc-if>',
       '<p style="margin: 0; font-size: 13px; line-height: 1.5; color: #A89A86">Fill out the pre-booking form and we will contact you when the game is ready to ship.</p>')
    R("['HOW TO PLAY', 'Choose your tribe, draw from the deck, attack and punish — and race the sand clock. Most groups are playing within minutes of opening the box. The full rulebook and video guide are linked below.'],",
      "['HOW TO PLAY', 'Distribute the cards equally among all players and place the bracelets in the center. Learn the elemental cycle — Lava beats Wind, Wind beats Rain, Rain beats Lava, Mountain blocks all. Take turns playing cards to win rounds and collect bracelets, and deploy Meteor, Lightning, Freeze or Reverse at key moments. Collect all the bracelets to become the Zampion. The full rulebook and video guide are linked below.'],")
    R("['SHIPPING & RETURNS', '[Add delivery timelines, shipping regions and the returns policy here.]']",
      "['PRE-BOOKING & ORDERS', 'Pre-book with your name, email and mobile number and we will contact you when the game is ready to ship. For bulk, café or event orders, send us a message through the contact form below.']")
    R("['WHAT’S IN THE BOX', 'Zambaara card deck — tribe cards and power cards\\nBurlap carry pouch\\nTribe bracelets\\nCard box'],",
      "['WHAT’S IN THE BOX', 'Zambaara card deck — Lava, Rain, Wind and Mountain cards plus the Meteor, Lightning, Freeze and Reverse power cards\\nBurlap carry pouch\\nTribe bracelets\\nCard box'],")
    # state + handlers
    R("added: false, zx: 50, zy: 50, zoom: false };", "added: false, zx: 50, zy: 50, zoom: false, pb: false, menu: false };")
    R("    this.pk1 = () => this.setState({ pack: 0 });",
      "    this.pbOpenFn = () => this.setState({ pb: true });\n    this.pbClose = () => this.setState({ pb: false });\n    this.menuOpenFn = () => this.setState({ menu: true });\n    this.menuClose = () => this.setState({ menu: false });\n    this.pk1 = () => this.setState({ pack: 0 });")
    R("      hasSel: s.sel >= 0,", "      pbOn: !!s.pb, pbOpenFn: this.pbOpenFn, pbClose: this.pbClose, pkI: s.pack || 0, menuOn: !!s.menu, menuOpenFn: this.menuOpenFn, menuClose: this.menuClose,\n      hasSel: s.sel >= 0,")
    R('<sc-if value="{{hasSel}}"', '<PreBookModal open="{{pbOn}}" onClose="{{pbClose}}" edition="{{pkI}}" qty="{{qty}}"></PreBookModal>\n<sc-if value="{{hasSel}}"')

    # ---------- voices: real testimonial names, no invented quotes ----------
    RX(r'<div style="font-family: \'Cinzel\', serif; font-size: 44px; line-height: \.6; color: #C9A063">“</div>\s*<p [^>]*>\[Player quote from the review video\]</p>\s*<div [^>]*>\[PLAYER NAME\] · \[EVENT\]</div>',
       '<div style="font-size: 11px; letter-spacing: .3em; color: #C9A063">{{v.k}}</div>'
       '<div style="margin-top: 8px; font-family: \'Cinzel\', serif; font-weight: 700; font-size: 26px; line-height: 1.1; color: #F3D594">{{v.t}}</div>'
       '<p style="margin: 8px 0 0; font-size: 15px; line-height: 1.5; color: #EDE6DA">{{v.p}}</p>'
       '<sc-if value="{{v.cta}}" hint-placeholder-val="{{false}}"><a href="/beat-the-host" class="cta ctaf" style="margin-top: 14px; min-height: 44px; padding: 0 16px; font-size: 12px">FIND AN EVENT</a></sc-if>')
    R("    const srcs = [['/cinematic/gallery/player-pouch.webp', 'Player holding the Zambaara pouch and bracelets'], ['/cinematic/gallery/player-reader.webp', 'Player reading a Lava card'], ['/cinematic/gallery/player-box.webp', 'Player holding the Zambaara wooden box']];",
      "    const srcs = [['/cinematic/gallery/player-pouch.webp', 'Player holding the Zambaara pouch and bracelets', 'BATTLE MASTER', 'Zampion Champion', 'Mastered the elements and claimed the bracelets at the table.', false], ['/cinematic/gallery/player-reader.webp', 'Player reading a Lava card', 'ELEMENT WIELDER', 'Elite Player', 'Reads every tell, plays every power at the perfect moment.', false], ['/cinematic/gallery/player-box.webp', 'Player holding the Zambaara wooden box', 'YOUR STORY NEXT', 'Become a Zampion', 'Beat the Host at a live event and join the Zampions.', true]];")
    R("        return { src: c[0], alt: c[1],", "        return { src: c[0], alt: c[1], k: c[2], t: c[3], p: c[4], cta: c[5],")

    # ---------- extra sections (live data) ----------
    R('<footer ref="{{setFoot}}"', '<RankingsBlock></RankingsBlock>\n<NewsletterBlock></NewsletterBlock>\n<ContactBlock></ContactBlock>\n<footer ref="{{setFoot}}"')

    # ---------- mount / unmount ----------
    R("  componentDidMount() {\n",
      "  componentDidMount() {\n    document.body.classList.add('zh-body');\n    if (typeof ResizeObserver !== 'undefined' && this.root) { this.ro = new ResizeObserver(() => { clearTimeout(this.roT); this.roT = setTimeout(() => this.layout(), 120); }); this.ro.observe(this.root); }\n")
    R("  componentWillUnmount() {\n",
      "  componentDidUpdate(pp, ps) {\n    const was = ps.sel >= 0 || ps.gsel >= 0, now = this.state.sel >= 0 || this.state.gsel >= 0;\n    if (was !== now) document.documentElement.style.overflow = now ? 'hidden' : '';\n  }\n  componentWillUnmount() {\n    document.documentElement.style.overflow = '';\n    window.removeEventListener('keydown', this.onKey);\n    document.body.classList.remove('zh-body');\n    if (this.ro) this.ro.disconnect(); clearTimeout(this.roT);\n")
    R("    this.pk1 = () => this.setState({ pack: 0 });",
      "    this.onKey = (e) => { if (e.key === 'Escape' && (this.state.sel >= 0 || this.state.gsel >= 0)) this.setState({ sel: -1, gsel: -1 }); };\n    this.pk1 = () => this.setState({ pack: 0 });")
    R("    document.body.classList.add('zh-body');\n", "    document.body.classList.add('zh-body');\n    window.addEventListener('keydown', this.onKey);\n")
    if mobile:
        mobile_patches(R, RX)
        s = MOBILE_FIX(s)
    open(dst, 'w').write(s)


def mobile_patches(R, RX):
    # window scrolling instead of the design-canvas inner scroller
    R("""<div ref="{{setFrame}}" class="{{rootCls}}" style="position: relative; width: 390px; height: 844px; overflow: hidden; background: #05060B; color: #EDE6DA; font-family: 'Saira', sans-serif">""",
      """<div ref="{{setFrame}}" class="{{rootCls}}" style="position: relative; width: 100%; background: #05060B; color: #EDE6DA; font-family: 'Saira', sans-serif">""")
    R('<div ref="{{setFixed}}" aria-hidden="true" style="position: absolute;', '<div ref="{{setFixed}}" aria-hidden="true" style="position: fixed;')
    R('<nav class="nv" style="position: absolute;', '<nav class="nv" style="position: fixed;')
    R('<div style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; z-index: 25; pointer-events: none; overflow: hidden; display: {{hcDisp}}">',
      '<div style="position: fixed; left: 0; top: 0; width: 100%; height: 100%; z-index: 25; pointer-events: none; overflow: hidden; display: {{hcDisp}}">')
    R('<div aria-hidden="true" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; z-index: 16;', '<div aria-hidden="true" style="position: fixed; left: 0; top: 0; width: 100%; height: 100%; z-index: 16;', 2)
    R('<div ref="{{setScroller}}" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; overflow-y: auto; overflow-x: hidden; z-index: 2; -webkit-overflow-scrolling: touch">',
      '<div style="position: relative; z-index: 2">')
    R('role="dialog" aria-modal="true" aria-label="Gallery image" style="position: absolute; inset: 0;', 'role="dialog" aria-modal="true" aria-label="Gallery image" style="position: fixed; inset: 0;')
    R('aria-label="{{sel.n}} card details" style="position: absolute; inset: 0;', 'aria-label="{{sel.n}} card details" style="position: fixed; inset: 0;')
    # real viewport heights
    R('<section id="top" ref="{{setHero}}" style="position: relative; z-index: 2; height: 844px; overflow: hidden">',
      '<section id="top" ref="{{setHero}}" class="zh-vh" style="position: relative; z-index: 2; overflow: hidden">')
    R('style="position: sticky; top: 0; height: 844px; overflow: hidden"', 'class="zh-vh" style="position: sticky; top: 0; overflow: hidden"', 4)
    R('<div class="g3" style="position: absolute; left: 0; right: 0; top: 470px;', '<div class="g3" style="position: absolute; left: 0; right: 0; top: 55.7%;')
    # menu
    R('<a href="#next" class="cta" style="min-height: 44px; padding: 0 14px; font-size: 12px">PRE-BOOK</a>\n</nav>',
      '<div style="display: flex; gap: 8px; align-items: center"><a href="#next" class="cta" style="min-height: 44px; padding: 0 14px; font-size: 12px">PRE-BOOK</a><button type="button" class="ghost" onClick="{{menuOpenFn}}" aria-label="Open menu" style="min-height: 44px; padding: 0 14px; border-radius: 6px">MENU</button></div>\n</nav>')
    R('<PreBookModal open="{{pbOn}}"', '<MobileMenu open="{{menuOn}}" onClose="{{menuClose}}"></MobileMenu>\n<PreBookModal open="{{pbOn}}"')


def MOBILE_FIX(s):
    def R(a, b, cnt=1):
        nonlocal s
        c = s.count(a)
        assert c == cnt, (a[:100], c)
        s = s.replace(a, b)
    R("      if (this.scroller) this.raw = this.scroller.scrollTop;", "      this.raw = window.scrollY || window.pageYOffset || 0;")
    R("vh: this.frame ? this.frame.clientHeight : 844,", "vh: window.innerHeight || 844,")
    # hero cards: real viewport geometry
    R("    const ds = 1;\n    const tx = vw / 2, ty = (dk.top - sy) + 430;",
      "    const ds = Math.min((dk.sw || vw) / 390, (dk.sh || vh) / 844);\n    const kx = Math.min(vw / 390, 1.15), ky = hh / 844;\n    const tx = vw / 2, ty = (dk.top - sy) + (dk.sh || vh) / 2 + 8 * ds;")
    R("      const hx = b[0], hy = b[1];", "      const hx = vw / 2 + (b[0] - 195) * kx, hy = b[1] * ky;")
    R("      const gx = vw / 2 + (i - 1.5) * 16, gy = 300;", "      const gx = vw / 2 + (i - 1.5) * 16, gy = 300 * ky;")
    R("      const sc = L(hs, 190 * 0.5 / 170, fl);", "      const sc = L(hs, 190 * 0.5 * ds / 170, fl);")
    return s


if __name__ == '__main__':
    src, dst, man, mob = sys.argv[1:5]
    run(src, dst, json.load(open(man)), mob == 'mobile')
    print('ok', dst)
