const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDQY85sYWa1bA6eHUY5Wd2zs7uPktfXFNU',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'zambara.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'zambara',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'zambara.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '213267817462',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:213267817462:web:d74bfb1edd2b2a97d21dd7',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-WXCR5VW5V0'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function formatTimestamp(ts) {
  if (!ts) return 'N/A';
  if (ts.toDate && typeof ts.toDate === 'function') {
    return ts.toDate().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
  }
  if (typeof ts === 'string') {
    const d = new Date(ts);
    if (!isNaN(d.getTime())) {
      return d.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
    }
    return ts;
  }
  return String(ts);
}

function cleanPhone(phone) {
  if (!phone) return 'N/A';
  return String(phone).trim().replace(/\s+/g, '');
}

async function generate() {
  console.log('Fetching live data from Firestore...');
  const [
    zambaaraUsersSnap,
    zambaaraTourneysSnap,
    zambaaraBookingsSnap,
    tagconUsersSnap,
    tagconTourneysSnap,
    tagconBookingsSnap,
    beachBattleSnap,
    preBookingsSnap,
    scoresSnap,
  ] = await Promise.all([
    getDocs(collection(db, 'zambaara_users')).catch(() => ({ docs: [] })),
    getDocs(collection(db, 'zambaara_tournaments')).catch(() => ({ docs: [] })),
    getDocs(collection(db, 'zambaara_bookings')).catch(() => ({ docs: [] })),
    getDocs(collection(db, 'tagcon_users')).catch(() => ({ docs: [] })),
    getDocs(collection(db, 'tournaments')).catch(() => ({ docs: [] })),
    getDocs(collection(db, 'bookings')).catch(() => ({ docs: [] })),
    getDocs(collection(db, 'beachBattleRegistrations')).catch(() => ({ docs: [] })),
    getDocs(collection(db, 'preBookings')).catch(() => ({ docs: [] })),
    getDocs(collection(db, 'scores')).catch(() => ({ docs: [] })),
  ]);

  const zambaaraTourneysMap = {};
  zambaaraTourneysSnap.docs.forEach(d => { zambaaraTourneysMap[d.id] = { id: d.id, ...d.data() }; });

  const tagconTourneysMap = {};
  tagconTourneysSnap.docs.forEach(d => { tagconTourneysMap[d.id] = { id: d.id, ...d.data() }; });

  const zambaaraBookingsByUser = {};
  zambaaraBookingsSnap.docs.forEach(d => {
    const data = d.data();
    if (data.userId) zambaaraBookingsByUser[data.userId] = data;
    const cleanNum = cleanPhone(data.userMobile);
    if (cleanNum && cleanNum !== 'N/A') zambaaraBookingsByUser[cleanNum] = data;
  });

  const tagconBookingsByUser = {};
  tagconBookingsSnap.docs.forEach(d => {
    const data = d.data();
    if (data.userId) tagconBookingsByUser[data.userId] = data;
    const cleanNum = cleanPhone(data.userMobile);
    if (cleanNum && cleanNum !== 'N/A') tagconBookingsByUser[cleanNum] = data;
  });

  const records = [];

  // 1. Zambaara
  zambaaraUsersSnap.docs.forEach((doc, idx) => {
    const data = doc.data();
    const phone = cleanPhone(data.mobile || data.number);
    const booking = zambaaraBookingsByUser[doc.id] || zambaaraBookingsByUser[phone];
    const tourney = booking ? zambaaraTourneysMap[booking.tournamentId] : Object.values(zambaaraTourneysMap)[0];

    let status = 'Waiting Reveal';
    if (booking) {
      status = booking.isZampion ? '👑 Ultimate Zampion' : booking.isWinner ? '★ Round Winner' : 'Seat Booked';
    } else if (data.status === 'confirmed') {
      status = 'Confirmed Pool';
    } else if (data.status === 'completed' || data.tribe) {
      status = 'Tribe Revealed';
    }

    records.push({
      id: 'ZAM-' + (idx + 1),
      name: data.name || 'Anonymous Seeker',
      phone: phone,
      category: 'Zambaara Tournament',
      event: tourney ? tourney.name : 'Elemental Arena',
      tribe: data.tribe ? data.tribe.toUpperCase() : 'UNASSIGNED',
      status: status,
      seat: booking ? `Seat #${(booking.seatIndex % (tourney ? tourney.size / 4 : 4)) + 1}` : 'Not Seated',
      hasBought: data.hasBought ? 'Yes' : 'No',
      email: data.email || 'N/A',
      date: formatTimestamp(data.createdAt)
    });
  });

  // 2. TagCon
  tagconUsersSnap.docs.forEach((doc, idx) => {
    const data = doc.data();
    const phone = cleanPhone(data.mobile || data.number);
    const booking = tagconBookingsByUser[doc.id] || tagconBookingsByUser[phone];
    const tourney = booking ? tagconTourneysMap[booking.tournamentId] : Object.values(tagconTourneysMap)[0];

    let status = 'Waiting Reveal';
    if (booking) {
      status = booking.isZampion ? '👑 Ultimate Zampion' : booking.isWinner ? '★ Round Winner' : 'Seat Booked';
    } else if (data.tribe) {
      status = 'Tribe Revealed';
    }

    records.push({
      id: 'TAG-' + (idx + 1),
      name: data.name || 'Anonymous Warrior',
      phone: phone,
      category: 'TagCon Tournament',
      event: tourney ? tourney.name : 'TagCon Arena',
      tribe: data.tribe ? data.tribe.toUpperCase() : 'UNASSIGNED',
      status: status,
      seat: booking ? `Seat #${(booking.seatIndex % (tourney ? tourney.size / 4 : 4)) + 1}` : 'Not Seated',
      hasBought: data.hasBought ? 'Yes' : 'No',
      email: data.email || 'N/A',
      date: formatTimestamp(data.createdAt)
    });
  });

  // 3. Beach Battle
  beachBattleSnap.docs.forEach((doc, idx) => {
    const data = doc.data();
    records.push({
      id: 'BCH-' + (idx + 1),
      name: data.name || 'Gladiator',
      phone: cleanPhone(data.phone),
      category: 'Beach Battle',
      event: 'Coastal Duels (32 Slots)',
      tribe: data.tribe ? data.tribe.toUpperCase() : 'COASTAL',
      status: 'Registered Slot',
      seat: data.playerNumber ? `Slot #${data.playerNumber}` : `Slot #${idx + 1}`,
      hasBought: 'Yes',
      email: data.email || 'N/A',
      date: formatTimestamp(data.createdAt)
    });
  });

  // 4. PreBookings
  preBookingsSnap.docs.forEach((doc, idx) => {
    const data = doc.data();
    records.push({
      id: 'PRE-' + (idx + 1),
      name: data.name || 'Party Host',
      phone: cleanPhone(data.mobile),
      category: 'Pre-Bookings',
      event: `Party VIP (${data.numberOfPlayers || 1} Guests)`,
      tribe: 'N/A',
      status: data.status ? String(data.status).toUpperCase() : 'CONFIRMED',
      seat: `${data.numberOfPlayers || 1} Guests`,
      hasBought: 'Inquiry',
      email: data.email || 'N/A',
      date: formatTimestamp(data.createdAt)
    });
  });

  // 5. Scores
  scoresSnap.docs.forEach((doc, idx) => {
    const data = doc.data();
    const phone = cleanPhone(data.playerMobile || data.winnerMobile);
    if (!phone || phone === 'N/A') return;
    records.push({
      id: 'SCR-' + (idx + 1),
      name: data.playerName || 'Arena Challenger',
      phone: phone,
      category: 'Arena Live Games',
      event: data.gameId || 'Challenger Match',
      tribe: 'N/A',
      status: 'Match Played',
      seat: data.time ? `${data.time}s` : 'Completed',
      hasBought: 'N/A',
      email: 'N/A',
      date: formatTimestamp(data.createdAt)
    });
  });

  console.log(`Total normalized records: ${records.length}`);

  // Create the HTML Content with Embedded CSS, JS, and Data
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Zambara — Master Intelligence & Tournament Contacts Analytics</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-dark: #07090E;
      --bg-surface: #0E131F;
      --bg-surface-elevated: #141B2D;
      --bg-glass: rgba(18, 24, 38, 0.7);
      --gold-primary: #D1A058;
      --gold-light: #F7D59A;
      --gold-dark: #9E7432;
      --gold-glow: rgba(209, 160, 88, 0.35);
      --border-gold: rgba(209, 160, 88, 0.22);
      --border-subtle: rgba(255, 255, 255, 0.08);
      --text-main: #F3F4F6;
      --text-muted: #9CA3AF;
      --lava-color: #FF5722;
      --lava-bg: rgba(255, 87, 34, 0.12);
      --rain-color: #00B0FF;
      --rain-bg: rgba(0, 176, 255, 0.12);
      --mountain-color: #FFB300;
      --mountain-bg: rgba(255, 179, 0, 0.12);
      --wind-color: #00E676;
      --wind-bg: rgba(0, 230, 118, 0.12);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg-dark);
      color: var(--text-main);
      font-family: 'Plus Jakarta Sans', sans-serif;
      min-height: 100vh;
      overflow-x: hidden;
      background-image: 
        radial-gradient(circle at 10% 15%, rgba(209, 160, 88, 0.08) 0%, transparent 40%),
        radial-gradient(circle at 90% 85%, rgba(255, 87, 34, 0.06) 0%, transparent 45%),
        radial-gradient(circle at 50% 50%, rgba(0, 176, 255, 0.04) 0%, transparent 60%);
      background-attachment: fixed;
    }

    .container {
      max-width: 1480px;
      margin: 0 auto;
      padding: 2.5rem 1.5rem 4rem;
    }

    /* Ambient Header */
    header {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      margin-bottom: 2rem;
      border-bottom: 1px solid var(--border-gold);
      padding-bottom: 1.75rem;
      position: relative;
    }

    @media (min-width: 768px) {
      header {
        flex-direction: row;
        justify-content: space-between;
        align-items: flex-end;
      }
    }

    .brand-title {
      font-family: 'Cinzel', serif;
      font-size: 2.25rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      background: linear-gradient(135deg, #FFFFFF 20%, var(--gold-light) 60%, var(--gold-primary) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      line-height: 1.2;
    }

    .brand-subtitle {
      color: var(--text-muted);
      font-size: 0.95rem;
      margin-top: 0.35rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .badge-live {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: rgba(0, 230, 118, 0.12);
      border: 1px solid rgba(0, 230, 118, 0.3);
      color: var(--wind-color);
      padding: 0.2rem 0.6rem;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .pulse-dot {
      width: 6px;
      height: 6px;
      background-color: var(--wind-color);
      border-radius: 50%;
      box-shadow: 0 0 8px var(--wind-color);
      animation: pulse 1.8s infinite;
    }

    @keyframes pulse {
      0% { opacity: 0.4; transform: scale(0.9); }
      50% { opacity: 1; transform: scale(1.3); }
      100% { opacity: 0.4; transform: scale(0.9); }
    }

    /* Actions Header */
    .header-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.65rem 1.15rem;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      cursor: pointer;
      transition: all 0.25s ease;
      text-decoration: none;
      border: none;
      outline: none;
    }

    .btn-gold {
      background: linear-gradient(135deg, var(--gold-light), var(--gold-primary));
      color: #07090E;
      box-shadow: 0 4px 14px var(--gold-glow);
    }

    .btn-gold:hover {
      background: linear-gradient(135deg, #FFFFFF, var(--gold-light));
      transform: translateY(-2px);
      box-shadow: 0 6px 18px var(--gold-glow);
    }

    .btn-outline {
      background: rgba(255, 255, 255, 0.03);
      color: var(--text-main);
      border: 1px solid var(--border-gold);
      backdrop-filter: blur(8px);
    }

    .btn-outline:hover {
      background: rgba(209, 160, 88, 0.1);
      border-color: var(--gold-primary);
      color: var(--gold-light);
    }

    /* KPI Analytics Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .kpi-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-gold);
      border-radius: 12px;
      padding: 1.25rem 1.2rem;
      position: relative;
      overflow: hidden;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
      transition: transform 0.2s ease, border-color 0.2s ease;
    }

    .kpi-card:hover {
      transform: translateY(-2px);
      border-color: var(--gold-primary);
    }

    .kpi-card::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--gold-primary), transparent);
    }

    .kpi-label {
      font-size: 0.78rem;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: var(--text-muted);
      margin-bottom: 0.4rem;
    }

    .kpi-value {
      font-family: 'Cinzel', serif;
      font-size: 2rem;
      font-weight: 700;
      color: #FFFFFF;
      display: flex;
      align-items: baseline;
      gap: 0.4rem;
    }

    .kpi-sub {
      font-size: 0.8rem;
      color: var(--gold-primary);
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 600;
    }

    /* Tribe Bar */
    .tribe-bar-container {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 12px;
      padding: 1.25rem;
      margin-bottom: 2rem;
    }

    .tribe-bar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .tribe-bar-title {
      font-family: 'Cinzel', serif;
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--gold-light);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .tribe-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 1.25rem;
      font-size: 0.82rem;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-weight: 600;
    }

    .legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 2px;
    }

    .bar-strip {
      height: 14px;
      border-radius: 999px;
      overflow: hidden;
      display: flex;
      background: #111522;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .bar-segment {
      height: 100%;
      transition: width 0.4s ease;
      position: relative;
    }

    /* Filters Section */
    .filter-panel {
      background: var(--bg-surface);
      border: 1px solid var(--border-gold);
      border-radius: 14px;
      padding: 1.25rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
    }

    .search-row {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    @media (min-width: 900px) {
      .search-row {
        grid-template-columns: 2fr 1fr 1fr 1fr;
      }
    }

    .input-group {
      position: relative;
    }

    .input-group input, .input-group select {
      width: 100%;
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      padding: 0.7rem 1rem;
      color: var(--text-main);
      font-size: 0.88rem;
      font-family: inherit;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .input-group input:focus, .input-group select:focus {
      border-color: var(--gold-primary);
      box-shadow: 0 0 0 3px rgba(209, 160, 88, 0.15);
    }

    /* Category Pill Selector */
    .pill-tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--border-subtle);
    }

    .pill {
      background: transparent;
      border: 1px solid var(--border-subtle);
      color: var(--text-muted);
      padding: 0.45rem 0.95rem;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .pill:hover {
      border-color: var(--gold-primary);
      color: var(--text-main);
    }

    .pill.active {
      background: var(--gold-primary);
      color: #07090E;
      border-color: var(--gold-primary);
      font-weight: 700;
      box-shadow: 0 2px 10px var(--gold-glow);
    }

    /* Data Table Card */
    .table-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-gold);
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
    }

    .table-topbar {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--border-subtle);
      gap: 0.75rem;
      background: rgba(0, 0, 0, 0.2);
    }

    .results-count {
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .results-count strong {
      color: var(--gold-light);
    }

    .page-size-selector {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .page-size-selector select {
      background: var(--bg-surface-elevated);
      color: var(--text-main);
      border: 1px solid var(--border-subtle);
      border-radius: 6px;
      padding: 0.3rem 0.6rem;
      outline: none;
      cursor: pointer;
    }

    .table-wrapper {
      width: 100%;
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    thead {
      background: var(--bg-surface-elevated);
      border-bottom: 2px solid var(--gold-primary);
      position: sticky;
      top: 0;
      z-index: 10;
    }

    th {
      padding: 0.95rem 1rem;
      font-family: 'Cinzel', serif;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: var(--gold-light);
      text-transform: uppercase;
      white-space: nowrap;
      cursor: pointer;
      user-select: none;
      transition: background 0.15s;
    }

    th:hover {
      background: rgba(209, 160, 88, 0.08);
      color: #FFFFFF;
    }

    th .sort-icon {
      font-size: 0.7rem;
      margin-left: 0.35rem;
      opacity: 0.5;
    }

    th.sorted .sort-icon {
      opacity: 1;
      color: var(--gold-primary);
    }

    tbody tr {
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      transition: background 0.15s;
    }

    tbody tr:hover {
      background: rgba(209, 160, 88, 0.05);
    }

    tbody tr:nth-child(even) {
      background: rgba(0, 0, 0, 0.15);
    }

    td {
      padding: 0.95rem 1rem;
      font-size: 0.88rem;
      vertical-align: middle;
      color: var(--text-main);
    }

    .cell-name {
      font-weight: 600;
      color: #FFFFFF;
    }

    .cell-phone {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.84rem;
      color: var(--gold-light);
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }

    .copy-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 2px 4px;
      border-radius: 4px;
      transition: color 0.15s, background 0.15s;
    }

    .copy-btn:hover {
      color: var(--gold-primary);
      background: rgba(209, 160, 88, 0.15);
    }

    .badge-tribe {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.22rem 0.65rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .tribe-LAVA { background: var(--lava-bg); color: var(--lava-color); border: 1px solid rgba(255, 87, 34, 0.3); }
    .tribe-RAIN { background: var(--rain-bg); color: var(--rain-color); border: 1px solid rgba(0, 176, 255, 0.3); }
    .tribe-MOUNTAIN { background: var(--mountain-bg); color: var(--mountain-color); border: 1px solid rgba(255, 179, 0, 0.3); }
    .tribe-WIND { background: var(--wind-bg); color: var(--wind-color); border: 1px solid rgba(0, 230, 118, 0.3); }
    .tribe-COASTAL { background: rgba(0, 176, 255, 0.12); color: #80D8FF; border: 1px solid rgba(0, 176, 255, 0.25); }
    .tribe-UNASSIGNED, .tribe-NA { background: rgba(255, 255, 255, 0.05); color: var(--text-muted); border: 1px solid rgba(255, 255, 255, 0.1); }

    .badge-status {
      display: inline-block;
      padding: 0.25rem 0.65rem;
      border-radius: 999px;
      font-size: 0.74rem;
      font-weight: 600;
      background: rgba(255, 255, 255, 0.06);
      color: var(--text-muted);
      border: 1px solid rgba(255, 255, 255, 0.08);
      white-space: nowrap;
    }

    .status-booked, .status-seated {
      background: rgba(0, 230, 118, 0.12);
      color: var(--wind-color);
      border-color: rgba(0, 230, 118, 0.3);
    }

    .status-confirmed {
      background: rgba(209, 160, 88, 0.15);
      color: var(--gold-light);
      border-color: rgba(209, 160, 88, 0.4);
    }

    .status-waiting {
      background: rgba(255, 179, 0, 0.1);
      color: var(--mountain-color);
      border-color: rgba(255, 179, 0, 0.3);
    }

    /* Pagination Footer */
    .pagination-bar {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      padding: 1.15rem 1.25rem;
      border-top: 1px solid var(--border-subtle);
      gap: 1rem;
      background: rgba(0, 0, 0, 0.25);
    }

    .page-controls {
      display: flex;
      gap: 0.35rem;
      align-items: center;
    }

    .page-btn {
      background: var(--bg-surface-elevated);
      color: var(--text-main);
      border: 1px solid var(--border-subtle);
      min-width: 34px;
      height: 34px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
    }

    .page-btn:hover:not(:disabled) {
      border-color: var(--gold-primary);
      color: var(--gold-light);
    }

    .page-btn.active {
      background: var(--gold-primary);
      color: #07090E;
      border-color: var(--gold-primary);
      font-weight: 700;
    }

    .page-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    /* Toast Notification */
    #toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: var(--bg-surface-elevated);
      color: var(--gold-light);
      border: 1px solid var(--gold-primary);
      padding: 0.85rem 1.4rem;
      border-radius: 10px;
      font-size: 0.9rem;
      font-weight: 600;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7), 0 0 15px var(--gold-glow);
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.3s ease;
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    #toast.show {
      opacity: 1;
      transform: translateY(0);
    }

    /* Print Stylesheet */
    @media print {
      body { background: #FFFFFF; color: #000000; }
      .header-actions, .filter-panel, .pagination-bar, .page-size-selector { display: none !important; }
      .kpi-card, .table-card { border: 1px solid #CCC; box-shadow: none; }
      th { color: #000; border-bottom: 2px solid #000; }
      td { color: #222; }
    }
  </style>
</head>
<body>

  <div class="container">
    
    <!-- Top Header -->
    <header>
      <div>
        <div class="badge-live">
          <span class="pulse-dot"></span>
          Live Database Sync
        </div>
        <h1 class="brand-title">Zambara Master Intelligence</h1>
        <p class="brand-subtitle">
          Double-verification participant directory, tournament rosters, and phone outreach console.
        </p>
      </div>

      <div class="header-actions">
        <button class="btn btn-outline" onclick="copyAllFilteredPhones()">
          <span>📋</span> Copy Filtered Phones
        </button>
        <button class="btn btn-outline" onclick="exportFilteredCSV()">
          <span>📥</span> Export CSV
        </button>
        <a href="/Zambara_Master_Contacts_Directory.xlsx" class="btn btn-gold" download>
          <span>📊</span> Download Excel
        </a>
      </div>
    </header>

    <!-- Executive KPIs -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">Total Participants</div>
        <div class="kpi-value" id="kpi-total">279</div>
        <div class="kpi-sub">Across All Tournaments</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Unique Phone Numbers</div>
        <div class="kpi-value" id="kpi-unique-phones">259</div>
        <div class="kpi-sub">Verified Mobile Contacts</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Arena Seats Booked</div>
        <div class="kpi-value" id="kpi-booked">60</div>
        <div class="kpi-sub">Active Brackets Confirmed</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Zambaara & TagCon Paid</div>
        <div class="kpi-value" id="kpi-paid">44</div>
        <div class="kpi-sub">Purchased Entry Passes</div>
      </div>
    </div>

    <!-- Elemental Tribe Balance Bar -->
    <div class="tribe-bar-container">
      <div class="tribe-bar-header">
        <div class="tribe-bar-title">Elemental Tribe Balance</div>
        <div class="tribe-legend" id="tribe-legend">
          <!-- Populated dynamically -->
        </div>
      </div>
      <div class="bar-strip" id="tribe-bar">
        <!-- Populated dynamically -->
      </div>
    </div>

    <!-- Filter & Control Panel -->
    <div class="filter-panel">
      <div class="search-row">
        <div class="input-group">
          <input type="text" id="searchInput" placeholder="Search name, phone (+91...), seat, or event..." oninput="onSearchChange()">
        </div>
        <div class="input-group">
          <select id="tribeFilter" onchange="applyFilters()">
            <option value="ALL">All Tribes</option>
            <option value="LAVA">🔥 Lava Tribe</option>
            <option value="RAIN">💧 Rain Tribe</option>
            <option value="MOUNTAIN">🏔️ Mountain Tribe</option>
            <option value="WIND">🌪️ Wind Tribe</option>
            <option value="COASTAL">🌊 Coastal</option>
            <option value="UNASSIGNED">Unassigned / Waiting</option>
          </select>
        </div>
        <div class="input-group">
          <select id="statusFilter" onchange="applyFilters()">
            <option value="ALL">All Statuses</option>
            <option value="BOOKED">Seat Booked / Seated</option>
            <option value="CONFIRMED">Confirmed Pool</option>
            <option value="REVEALED">Tribe Revealed</option>
            <option value="WAITING">Waiting Reveal</option>
          </select>
        </div>
        <div class="input-group">
          <select id="paidFilter" onchange="applyFilters()">
            <option value="ALL">All Payment States</option>
            <option value="YES">Paid / Purchased Ticket</option>
            <option value="NO">Unpaid</option>
          </select>
        </div>
      </div>

      <!-- Category Tabs -->
      <div class="pill-tabs" id="categoryPills">
        <button class="pill active" onclick="setCategoryFilter('ALL', this)">All Categories (279)</button>
        <button class="pill" onclick="setCategoryFilter('Zambaara Tournament', this)">Zambaara Tournament</button>
        <button class="pill" onclick="setCategoryFilter('TagCon Tournament', this)">TagCon Arena</button>
        <button class="pill" onclick="setCategoryFilter('Beach Battle', this)">Beach Battle</button>
        <button class="pill" onclick="setCategoryFilter('Pre-Bookings', this)">VIP Pre-Bookings</button>
        <button class="pill" onclick="setCategoryFilter('Arena Live Games', this)">Arena Match Scores</button>
      </div>
    </div>

    <!-- Data Table Container -->
    <div class="table-card">
      <div class="table-topbar">
        <div class="results-count" id="resultsCount">
          Showing <strong>0</strong> to <strong>0</strong> of <strong>0</strong> participants
        </div>

        <div class="page-size-selector">
          <label for="pageSize">Rows per page:</label>
          <select id="pageSize" onchange="onPageSizeChange()">
            <option value="15" selected>15</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="ALL">All</option>
          </select>
        </div>
      </div>

      <div class="table-wrapper">
        <table id="dataTable">
          <thead>
            <tr>
              <th onclick="onSort('id')">ID <span class="sort-icon">⇅</span></th>
              <th onclick="onSort('name')">Participant Name <span class="sort-icon">⇅</span></th>
              <th onclick="onSort('phone')">Phone Number <span class="sort-icon">⇅</span></th>
              <th onclick="onSort('category')">Category / Source <span class="sort-icon">⇅</span></th>
              <th onclick="onSort('event')">Tournament / Event <span class="sort-icon">⇅</span></th>
              <th onclick="onSort('tribe')">Tribe <span class="sort-icon">⇅</span></th>
              <th onclick="onSort('seat')">Seat Allocated <span class="sort-icon">⇅</span></th>
              <th onclick="onSort('status')">Verification Status <span class="sort-icon">⇅</span></th>
              <th onclick="onSort('hasBought')">Paid Ticket <span class="sort-icon">⇅</span></th>
              <th onclick="onSort('date')">Date Logged <span class="sort-icon">⇅</span></th>
            </tr>
          </thead>
          <tbody id="tableBody">
            <!-- Rendered by JS -->
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div class="pagination-bar">
        <div class="results-count" id="paginationSummary">
          Page 1 of 1
        </div>
        <div class="page-controls" id="pageControls">
          <!-- Page buttons -->
        </div>
      </div>
    </div>

  </div>

  <div id="toast">📋 Copied to clipboard!</div>

  <script>
    // Embedded Master Data (279 records)
    const RAW_DATA = ${JSON.stringify(records, null, 2)};

    let filteredData = [...RAW_DATA];
    let currentPage = 1;
    let pageSize = 15;
    let selectedCategory = 'ALL';
    let sortColumn = 'id';
    let sortAsc = true;

    // Toast helper
    function showToast(msg) {
      const t = document.getElementById('toast');
      t.innerText = msg;
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 2400);
    }

    function copyToClipboard(text, label = 'Phone number') {
      if (!text || text === 'N/A') return;
      navigator.clipboard.writeText(text).then(() => {
        showToast(\`📋 Copied \${label}: \${text}\`);
      }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast(\`📋 Copied: \${text}\`);
      });
    }

    // Set Category Filter
    function setCategoryFilter(cat, elem) {
      selectedCategory = cat;
      document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      if (elem) elem.classList.add('active');
      applyFilters();
    }

    // Filter Logic
    function applyFilters() {
      const q = document.getElementById('searchInput').value.toLowerCase().trim();
      const tribe = document.getElementById('tribeFilter').value;
      const status = document.getElementById('statusFilter').value;
      const paid = document.getElementById('paidFilter').value;

      filteredData = RAW_DATA.filter(item => {
        // Category
        if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;

        // Tribe
        if (tribe !== 'ALL') {
          if (tribe === 'UNASSIGNED') {
            if (item.tribe !== 'UNASSIGNED' && item.tribe !== 'N/A') return false;
          } else if (item.tribe !== tribe) {
            return false;
          }
        }

        // Status
        if (status !== 'ALL') {
          const s = (item.status || '').toLowerCase();
          if (status === 'BOOKED' && !s.includes('booked') && !s.includes('seated') && !s.includes('winner') && !s.includes('zampion')) return false;
          if (status === 'CONFIRMED' && !s.includes('confirmed')) return false;
          if (status === 'REVEALED' && !s.includes('revealed')) return false;
          if (status === 'WAITING' && !s.includes('waiting')) return false;
        }

        // Paid
        if (paid !== 'ALL') {
          if (paid === 'YES' && item.hasBought !== 'Yes') return false;
          if (paid === 'NO' && item.hasBought !== 'No') return false;
        }

        // Search text
        if (q) {
          const matchName = (item.name || '').toLowerCase().includes(q);
          const matchPhone = (item.phone || '').toLowerCase().includes(q);
          const matchSeat = (item.seat || '').toLowerCase().includes(q);
          const matchEvent = (item.event || '').toLowerCase().includes(q);
          const matchEmail = (item.email || '').toLowerCase().includes(q);
          const matchTribe = (item.tribe || '').toLowerCase().includes(q);
          if (!matchName && !matchPhone && !matchSeat && !matchEvent && !matchEmail && !matchTribe) return false;
        }

        return true;
      });

      // Sort
      sortData();
      currentPage = 1;
      renderTable();
      updateTribeBar();
    }

    function onSearchChange() {
      applyFilters();
    }

    function onPageSizeChange() {
      const val = document.getElementById('pageSize').value;
      pageSize = val === 'ALL' ? filteredData.length : parseInt(val, 10);
      currentPage = 1;
      renderTable();
    }

    // Sort Handler
    function onSort(col) {
      if (sortColumn === col) {
        sortAsc = !sortAsc;
      } else {
        sortColumn = col;
        sortAsc = true;
      }
      sortData();
      renderTable();
    }

    function sortData() {
      filteredData.sort((a, b) => {
        let vA = a[sortColumn] || '';
        let vB = b[sortColumn] || '';

        // If numeric ID
        if (sortColumn === 'id') {
          const numA = parseInt(vA.replace(/\\D/g, '') || 0, 10);
          const numB = parseInt(vB.replace(/\\D/g, '') || 0, 10);
          return sortAsc ? numA - numB : numB - numA;
        }

        vA = String(vA).toLowerCase();
        vB = String(vB).toLowerCase();
        if (vA < vB) return sortAsc ? -1 : 1;
        if (vA > vB) return sortAsc ? 1 : -1;
        return 0;
      });
    }

    // Render Table
    function renderTable() {
      const tbody = document.getElementById('tableBody');
      tbody.innerHTML = '';

      const total = filteredData.length;
      const effectivePageSize = pageSize === 'ALL' ? total : pageSize;
      const totalPages = Math.max(1, Math.ceil(total / effectivePageSize));
      if (currentPage > totalPages) currentPage = totalPages;

      const startIdx = (currentPage - 1) * effectivePageSize;
      const endIdx = Math.min(startIdx + effectivePageSize, total);
      const pageItems = filteredData.slice(startIdx, endIdx);

      // Render Rows
      if (pageItems.length === 0) {
        tbody.innerHTML = \`<tr><td colspan="10" style="text-align:center; padding: 2.5rem; color: var(--text-muted);">No matching participants found.</td></tr>\`;
      } else {
        pageItems.forEach(item => {
          const tr = document.createElement('tr');
          const tribeClass = 'tribe-' + (item.tribe || 'UNASSIGNED');
          
          let statusClass = 'status-waiting';
          const s = (item.status || '').toLowerCase();
          if (s.includes('booked') || s.includes('seated') || s.includes('zampion') || s.includes('winner')) statusClass = 'status-booked';
          else if (s.includes('confirmed')) statusClass = 'status-confirmed';

          tr.innerHTML = \`
            <td style="color:var(--text-muted); font-family:'JetBrains Mono',monospace; font-size:0.75rem;">\${item.id}</td>
            <td class="cell-name">\${escapeHtml(item.name)}</td>
            <td>
              <span class="cell-phone">
                \${item.phone !== 'N/A' ? item.phone : '<span style="color:#6B7280;">N/A</span>'}
                \${item.phone !== 'N/A' ? \`<button class="copy-btn" title="Copy Phone" onclick="copyToClipboard('\${item.phone}', 'Phone')">📋</button><a href="https://wa.me/\${item.phone.replace(/\\D/g,'')}" target="_blank" class="copy-btn" title="Open WhatsApp" style="text-decoration:none;">💬</a>\` : ''}
              </span>
            </td>
            <td style="font-size:0.8rem; color:var(--text-muted);">\${item.category}</td>
            <td style="font-size:0.82rem; font-weight:600; color:var(--gold-light);">\${escapeHtml(item.event)}</td>
            <td><span class="badge-tribe \${tribeClass}">\${item.tribe}</span></td>
            <td style="font-family:'JetBrains Mono',monospace; font-size:0.82rem; color:\${item.seat !== 'Not Seated' ? 'var(--wind-color)' : 'var(--text-muted)'};">\${item.seat}</td>
            <td><span class="badge-status \${statusClass}">\${item.status}</span></td>
            <td>
              <span style="font-weight:700; font-size:0.8rem; color:\${item.hasBought === 'Yes' ? 'var(--wind-color)' : item.hasBought === 'No' ? 'var(--lava-color)' : 'var(--text-muted)'};">
                \${item.hasBought === 'Yes' ? 'Paid ✓' : item.hasBought === 'No' ? 'Unpaid ✕' : item.hasBought}
              </span>
            </td>
            <td style="font-size:0.75rem; color:var(--text-muted); white-space:nowrap;">\${item.date}</td>
          \`;
          tbody.appendChild(tr);
        });
      }

      // Update counters
      document.getElementById('resultsCount').innerHTML = \`Showing <strong>\${total === 0 ? 0 : startIdx + 1}</strong> to <strong>\${endIdx}</strong> of <strong>\${total}</strong> participants (Total: \${RAW_DATA.length})\`;
      document.getElementById('paginationSummary').innerText = \`Page \${currentPage} of \${totalPages}\`;

      // Update pagination buttons
      renderPagination(totalPages);
    }

    function renderPagination(totalPages) {
      const container = document.getElementById('pageControls');
      container.innerHTML = '';

      if (totalPages <= 1) return;

      // Prev Button
      const prev = document.createElement('button');
      prev.className = 'page-btn';
      prev.innerHTML = '←';
      prev.disabled = currentPage === 1;
      prev.onclick = () => { if (currentPage > 1) { currentPage--; renderTable(); } };
      container.appendChild(prev);

      // Page numbers (smart window)
      let pages = [];
      if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
      } else {
        if (currentPage <= 4) {
          pages = [1, 2, 3, 4, 5, '...', totalPages];
        } else if (currentPage >= totalPages - 3) {
          pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        } else {
          pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
        }
      }

      pages.forEach(p => {
        if (p === '...') {
          const dots = document.createElement('span');
          dots.style.padding = '0 6px';
          dots.style.color = 'var(--text-muted)';
          dots.innerText = '...';
          container.appendChild(dots);
        } else {
          const btn = document.createElement('button');
          btn.className = 'page-btn' + (p === currentPage ? ' active' : '');
          btn.innerText = p;
          btn.onclick = () => { currentPage = p; renderTable(); };
          container.appendChild(btn);
        }
      });

      // Next Button
      const next = document.createElement('button');
      next.className = 'page-btn';
      next.innerHTML = '→';
      next.disabled = currentPage === totalPages;
      next.onclick = () => { if (currentPage < totalPages) { currentPage++; renderTable(); } };
      container.appendChild(next);
    }

    // Elemental Tribe Distribution Bar
    function updateTribeBar() {
      const counts = { LAVA: 0, RAIN: 0, MOUNTAIN: 0, WIND: 0, OTHER: 0 };
      filteredData.forEach(d => {
        if (counts[d.tribe] !== undefined) counts[d.tribe]++;
        else counts.OTHER++;
      });

      const total = filteredData.length || 1;
      const pLava = ((counts.LAVA / total) * 100).toFixed(1);
      const pRain = ((counts.RAIN / total) * 100).toFixed(1);
      const pMountain = ((counts.MOUNTAIN / total) * 100).toFixed(1);
      const pWind = ((counts.WIND / total) * 100).toFixed(1);
      const pOther = ((counts.OTHER / total) * 100).toFixed(1);

      document.getElementById('tribe-bar').innerHTML = \`
        <div class="bar-segment" style="width: \${pLava}%; background: var(--lava-color);" title="Lava: \${counts.LAVA} (\${pLava}%)"></div>
        <div class="bar-segment" style="width: \${pRain}%; background: var(--rain-color);" title="Rain: \${counts.RAIN} (\${pRain}%)"></div>
        <div class="bar-segment" style="width: \${pMountain}%; background: var(--mountain-color);" title="Mountain: \${counts.MOUNTAIN} (\${pMountain}%)"></div>
        <div class="bar-segment" style="width: \${pWind}%; background: var(--wind-color);" title="Wind: \${counts.WIND} (\${pWind}%)"></div>
        <div class="bar-segment" style="width: \${pOther}%; background: #374151;" title="Other / Unassigned: \${counts.OTHER} (\${pOther}%)"></div>
      \`;

      document.getElementById('tribe-legend').innerHTML = \`
        <span class="legend-item"><span class="legend-dot" style="background:var(--lava-color)"></span> 🔥 Lava: \${counts.LAVA} (\${pLava}%)</span>
        <span class="legend-item"><span class="legend-dot" style="background:var(--rain-color)"></span> 💧 Rain: \${counts.RAIN} (\${pRain}%)</span>
        <span class="legend-item"><span class="legend-dot" style="background:var(--mountain-color)"></span> 🏔️ Mountain: \${counts.MOUNTAIN} (\${pMountain}%)</span>
        <span class="legend-item"><span class="legend-dot" style="background:var(--wind-color)"></span> 🌪️ Wind: \${counts.WIND} (\${pWind}%)</span>
        <span class="legend-item"><span class="legend-dot" style="background:#4B5563"></span> Others: \${counts.OTHER}</span>
      \`;
    }

    // Copy All Filtered Phone Numbers
    function copyAllFilteredPhones() {
      const phones = [];
      const seen = new Set();
      filteredData.forEach(d => {
        if (d.phone && d.phone !== 'N/A' && !seen.has(d.phone)) {
          seen.add(d.phone);
          phones.push(d.phone);
        }
      });

      if (phones.length === 0) {
        showToast('⚠️ No phone numbers found in current filter!');
        return;
      }

      copyToClipboard(phones.join(', '), \`\${phones.length} Phone Numbers\`);
    }

    // Export Filtered View to CSV
    function exportFilteredCSV() {
      const headers = ['ID', 'Name', 'Phone', 'Category', 'Event', 'Tribe', 'Seat', 'Status', 'Paid', 'Email', 'Date'];
      const rows = filteredData.map(d => [
        d.id,
        \`"\${(d.name || '').replace(/"/g, '""')}"\`,
        \`"\${d.phone}"\`,
        \`"\${d.category}"\`,
        \`"\${(d.event || '').replace(/"/g, '""')}"\`,
        d.tribe,
        \`"\${d.seat}"\`,
        \`"\${d.status}"\`,
        d.hasBought,
        \`"\${d.email}"\`,
        \`"\${d.date}"\`
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', \`Zambara_Export_\${new Date().toISOString().slice(0, 10)}.csv\`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(\`📥 Exported \${filteredData.length} rows to CSV!\`);
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    // Initial load
    applyFilters();
  </script>
</body>
</html>
`;

  // Write file to root and public
  const rootPath = path.resolve(__dirname, '..', 'Zambara_Analytics_Directory.html');
  const publicPath = path.resolve(__dirname, '..', 'public', 'Zambara_Analytics_Directory.html');
  const publicShort = path.resolve(__dirname, '..', 'public', 'directory.html');

  fs.writeFileSync(rootPath, htmlContent, 'utf8');
  fs.writeFileSync(publicPath, htmlContent, 'utf8');
  fs.writeFileSync(publicShort, htmlContent, 'utf8');

  console.log('✅ HTML Analytics Document generated successfully!');
  console.log(`📁 Saved to Root: ${rootPath}`);
  console.log(`🌐 Public URL: http://localhost:3000/directory.html`);
  process.exit(0);
}

generate().catch(err => {
  console.error('Error generating analytics HTML:', err);
  process.exit(1);
});
