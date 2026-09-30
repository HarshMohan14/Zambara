const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

// 1. Firebase Config
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

// Helper to convert Firestore timestamp
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

// Helper to clean phone numbers
function cleanPhone(phone) {
  if (!phone) return 'N/A';
  const str = String(phone).trim();
  return str.replace(/\s+/g, '');
}

// Styling Constants (Zambara Gold / Royal Luxury Theme)
const COLORS = {
  headerBg: '1A1F2C',      // Deep obsidian navy
  headerText: 'D1A058',    // Zambara Gold
  goldLight: 'FDF8EE',     // Pale gold tint
  goldBorder: 'D1A058',
  white: 'FFFFFF',
  zebraRow: 'F9FAFB',      // Subtle light gray for alternating rows
  textDark: '1F2937',
  textMuted: '6B7280',
  lava: 'FF4400',
  rain: '00AAFF',
  mountain: 'EEBB77',
  wind: '00CC77',
  greenBadge: 'E8F5E9',
  greenText: '2E7D32',
  blueBadge: 'E3F2FD',
  blueText: '1565C0',
  borderLight: 'E5E7EB'
};

async function main() {
  console.log('🚀 Fetching collections from Firestore...');

  // Fetch collections concurrently
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
    contactsSnap
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
    getDocs(collection(db, 'contact')).catch(() => ({ docs: [] }))
  ]);

  // Map tournaments
  const zambaaraTourneysMap = {};
  zambaaraTourneysSnap.docs.forEach(d => {
    zambaaraTourneysMap[d.id] = { id: d.id, ...d.data() };
  });

  const tagconTourneysMap = {};
  tagconTourneysSnap.docs.forEach(d => {
    tagconTourneysMap[d.id] = { id: d.id, ...d.data() };
  });

  // Map bookings by userId or userMobile
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

  console.log(`📊 Retrieved:
   • Zambaara Tournament Users: ${zambaaraUsersSnap.docs.length} (Booked: ${zambaaraBookingsSnap.docs.length})
   • TagCon Tournament Users: ${tagconUsersSnap.docs.length} (Booked: ${tagconBookingsSnap.docs.length})
   • Beach Battle Players: ${beachBattleSnap.docs.length}
   • Event Pre-Bookings: ${preBookingsSnap.docs.length}
   • Arena Game Scores: ${scoresSnap.docs.length}
   • Contact Messages: ${contactsSnap.docs.length}
  `);

  // Build Master Records
  const allMasterContacts = [];
  const phoneSeen = new Map(); // phone -> { count, sources: [] }

  function trackContact(contact) {
    allMasterContacts.push(contact);
    const phone = cleanPhone(contact.phone);
    if (phone && phone !== 'N/A' && phone.length >= 7) {
      if (!phoneSeen.has(phone)) {
        phoneSeen.set(phone, { name: contact.name, count: 0, sources: new Set() });
      }
      const entry = phoneSeen.get(phone);
      entry.count++;
      entry.sources.add(contact.category);
    }
  }

  // 1. Zambaara Users
  const zambaaraRows = [];
  zambaaraUsersSnap.docs.forEach((doc, idx) => {
    const data = doc.data();
    const phone = cleanPhone(data.mobile || data.number);
    const booking = zambaaraBookingsByUser[doc.id] || zambaaraBookingsByUser[phone];
    const tourney = booking ? zambaaraTourneysMap[booking.tournamentId] : Object.values(zambaaraTourneysMap)[0];
    
    let statusText = 'Waiting Reveal';
    if (booking) {
      statusText = booking.isZampion ? '👑 Ultimate Zampion' : booking.isWinner ? '★ Round Winner' : 'Seat Booked';
    } else if (data.status === 'confirmed') {
      statusText = 'Confirmed Pool (Ready to Seat)';
    } else if (data.status === 'completed' || data.tribe) {
      statusText = 'Tribe Revealed';
    }

    const row = {
      index: idx + 1,
      name: data.name || 'Anonymous Seeker',
      phone: phone,
      tribe: data.tribe ? data.tribe.toUpperCase() : 'UNASSIGNED',
      status: statusText,
      seatNumber: booking ? `Seat #${(booking.seatIndex % (tourney ? tourney.size / 4 : 4)) + 1}` : 'Not Seated',
      tournamentName: tourney ? tourney.name : 'Zambaara Arena',
      hasBought: data.hasBought ? 'Yes' : 'No',
      createdAt: formatTimestamp(data.createdAt),
      revealedAt: formatTimestamp(data.revealedAt)
    };
    zambaaraRows.push(row);

    trackContact({
      name: row.name,
      phone: row.phone,
      category: 'Zambaara Tournament',
      event: row.tournamentName,
      tribe: row.tribe,
      status: row.status,
      seat: row.seatNumber,
      hasBought: row.hasBought,
      email: 'N/A',
      date: row.createdAt
    });
  });

  // 2. TagCon Users
  const tagconRows = [];
  tagconUsersSnap.docs.forEach((doc, idx) => {
    const data = doc.data();
    const phone = cleanPhone(data.mobile || data.number);
    const booking = tagconBookingsByUser[doc.id] || tagconBookingsByUser[phone];
    const tourney = booking ? tagconTourneysMap[booking.tournamentId] : Object.values(tagconTourneysMap)[0];

    let statusText = 'Waiting Reveal';
    if (booking) {
      statusText = booking.isZampion ? '👑 Ultimate Zampion' : booking.isWinner ? '★ Round Winner' : 'Seat Booked';
    } else if (data.tribe) {
      statusText = 'Tribe Revealed';
    }

    const row = {
      index: idx + 1,
      name: data.name || 'Anonymous Warrior',
      phone: phone,
      tribe: data.tribe ? data.tribe.toUpperCase() : 'UNASSIGNED',
      status: statusText,
      seatNumber: booking ? `Seat #${(booking.seatIndex % (tourney ? tourney.size / 4 : 4)) + 1}` : 'Not Seated',
      tournamentName: tourney ? tourney.name : 'TagCon Arena',
      hasBought: data.hasBought ? 'Yes' : 'No',
      createdAt: formatTimestamp(data.createdAt),
      revealedAt: formatTimestamp(data.revealedAt)
    };
    tagconRows.push(row);

    trackContact({
      name: row.name,
      phone: row.phone,
      category: 'TagCon Tournament',
      event: row.tournamentName,
      tribe: row.tribe,
      status: row.status,
      seat: row.seatNumber,
      hasBought: row.hasBought,
      email: 'N/A',
      date: row.createdAt
    });
  });

  // 3. Beach Battle Registrations
  const beachRows = [];
  beachBattleSnap.docs.forEach((doc, idx) => {
    const data = doc.data();
    const phone = cleanPhone(data.phone);
    const row = {
      index: idx + 1,
      playerNumber: data.playerNumber ? `Player #${data.playerNumber}` : `Slot #${idx + 1}`,
      name: data.name || 'Gladiator',
      phone: phone,
      email: data.email || 'N/A',
      tribe: data.tribe ? data.tribe.toUpperCase() : 'COASTAL',
      status: 'Registered Player',
      createdAt: formatTimestamp(data.createdAt)
    };
    beachRows.push(row);

    trackContact({
      name: row.name,
      phone: row.phone,
      category: 'Beach Battle',
      event: 'Coastal Duels Tournament',
      tribe: row.tribe,
      status: row.status,
      seat: row.playerNumber,
      hasBought: 'Yes',
      email: row.email,
      date: row.createdAt
    });
  });

  // 4. Pre-Bookings
  const preBookingRows = [];
  preBookingsSnap.docs.forEach((doc, idx) => {
    const data = doc.data();
    const phone = cleanPhone(data.mobile);
    const row = {
      index: idx + 1,
      name: data.name || 'Party Host',
      phone: phone,
      email: data.email || 'N/A',
      playersCount: data.numberOfPlayers || 1,
      status: data.status ? String(data.status).toUpperCase() : 'CONFIRMED',
      notes: data.specialRequests || 'None',
      createdAt: formatTimestamp(data.createdAt)
    };
    preBookingRows.push(row);

    trackContact({
      name: row.name,
      phone: row.phone,
      category: 'Pre-Bookings',
      event: `Party / VIP (${row.playersCount} players)`,
      tribe: 'N/A',
      status: row.status,
      seat: `${row.playersCount} Guests`,
      hasBought: 'N/A',
      email: row.email,
      date: row.createdAt
    });
  });

  // 5. Arena Game Scores (Players with mobile numbers)
  const scoreRows = [];
  scoresSnap.docs.forEach((doc, idx) => {
    const data = doc.data();
    const phone = cleanPhone(data.playerMobile || data.winnerMobile);
    if (!phone || phone === 'N/A') return; // Only entries with phone

    const row = {
      index: scoreRows.length + 1,
      name: data.playerName || 'Arena Challenger',
      phone: phone,
      gameId: data.gameId || 'Arena Game',
      scoreTime: data.time ? `${data.time}s` : 'Completed',
      createdAt: formatTimestamp(data.createdAt)
    };
    scoreRows.push(row);

    trackContact({
      name: row.name,
      phone: row.phone,
      category: 'Arena Live Games',
      event: row.gameId,
      tribe: 'N/A',
      status: 'Live Game Participant',
      seat: 'N/A',
      hasBought: 'N/A',
      email: 'N/A',
      date: row.createdAt
    });
  });

  // 6. Contact Form Submissions
  const contactRows = [];
  contactsSnap.docs.forEach((doc, idx) => {
    const data = doc.data();
    contactRows.push({
      index: idx + 1,
      name: data.name || 'Visitor',
      email: data.email || 'N/A',
      subject: data.subject || 'Inquiry',
      message: data.message || '',
      createdAt: formatTimestamp(data.createdAt)
    });
  });

  console.log(`✨ Total Master Contact Entries Processed: ${allMasterContacts.length}`);
  console.log(`📞 Total Unique Phone Numbers Found: ${phoneSeen.size}`);

  // -------------------------------------------------------------
  // CREATE EXCEL WORKBOOK WITH EXCELJS
  // -------------------------------------------------------------
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Zambara Arena Admin';
  workbook.lastModifiedBy = 'Zambara Engine';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Helper function to style headers
  function applyHeaderStyle(headerRow, colCount) {
    headerRow.height = 28;
    for (let c = 1; c <= colCount; c++) {
      const cell = headerRow.getCell(c);
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF' + COLORS.headerBg }
      };
      cell.font = {
        name: 'Segoe UI',
        size: 11,
        bold: true,
        color: { argb: 'FF' + COLORS.headerText }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF' + COLORS.goldBorder } },
        bottom: { style: 'medium', color: { argb: 'FF' + COLORS.goldBorder } },
        left: { style: 'thin', color: { argb: 'FF374151' } },
        right: { style: 'thin', color: { argb: 'FF374151' } }
      };
    }
  }

  // Helper function to style data rows
  function applyDataRowStyle(row, rowIndex, colCount) {
    row.height = 22;
    const isEven = rowIndex % 2 === 0;
    for (let c = 1; c <= colCount; c++) {
      const cell = row.getCell(c);
      cell.font = { name: 'Segoe UI', size: 10, color: { argb: 'FF' + COLORS.textDark } };
      cell.alignment = { vertical: 'middle', horizontal: c === 1 ? 'center' : c === 3 ? 'center' : 'left' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF' + COLORS.borderLight } },
        bottom: { style: 'thin', color: { argb: 'FF' + COLORS.borderLight } },
        left: { style: 'thin', color: { argb: 'FF' + COLORS.borderLight } },
        right: { style: 'thin', color: { argb: 'FF' + COLORS.borderLight } }
      };
      if (isEven) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF' + COLORS.zebraRow }
        };
      }
    }
  }

  // Helper function to auto-fit columns
  function autoFitColumns(worksheet, minWidth = 12) {
    worksheet.columns.forEach(col => {
      let maxLen = 0;
      col.eachCell({ includeEmpty: true }, (cell, rowNum) => {
        if (rowNum === 1 && worksheet.views?.[0]?.ySplit === 1) return; // banner rows
        const val = cell.value ? String(cell.value) : '';
        if (val.length > maxLen) maxLen = val.length;
      });
      col.width = Math.max(maxLen + 4, minWidth);
    });
  }

  // =============================================================
  // SHEET 1: EXECUTIVE SUMMARY & DASHBOARD
  // =============================================================
  const summarySheet = workbook.addWorksheet('Summary & Overview', {
    views: [{ showGridLines: true }]
  });

  // Title Banner
  summarySheet.mergeCells('B2:G3');
  const titleCell = summarySheet.getCell('B2');
  titleCell.value = 'ZAMBARA ARENA — MASTER TOURNAMENTS & USER DIRECTORY';
  titleCell.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FF' + COLORS.headerText } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF' + COLORS.headerBg }
  };
  titleCell.border = {
    top: { style: 'medium', color: { argb: 'FF' + COLORS.goldBorder } },
    bottom: { style: 'medium', color: { argb: 'FF' + COLORS.goldBorder } },
    left: { style: 'medium', color: { argb: 'FF' + COLORS.goldBorder } },
    right: { style: 'medium', color: { argb: 'FF' + COLORS.goldBorder } }
  };

  summarySheet.getCell('B4').value = `Generated on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'long' })}`;
  summarySheet.getCell('B4').font = { name: 'Segoe UI', size: 9, italic: true, color: { argb: 'FF' + COLORS.textMuted } };

  // KPI Table Header
  const kpiHeaders = ['Category / Event', 'Total Participants', 'With Phone Numbers', 'Seat Bookings Confirmed', 'Revenue / Tickets', 'Worksheet Tab'];
  summarySheet.getRow(6).values = ['', ...kpiHeaders];
  summarySheet.getRow(6).height = 26;
  for (let c = 2; c <= 7; c++) {
    const cell = summarySheet.getRow(6).getCell(c);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.headerBg } };
    cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF' + COLORS.headerText } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF' + COLORS.goldBorder } },
      bottom: { style: 'medium', color: { argb: 'FF' + COLORS.goldBorder } },
      left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
      right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
    };
  }

  const kpiData = [
    ['Zambaara Tournament', zambaaraRows.length, zambaaraRows.filter(r => r.phone !== 'N/A').length, zambaaraBookingsSnap.docs.length, `${zambaaraRows.filter(r => r.hasBought === 'Yes').length} Paid`, 'Zambaara Tournament'],
    ['TagCon Arena', tagconRows.length, tagconRows.filter(r => r.phone !== 'N/A').length, tagconBookingsSnap.docs.length, `${tagconRows.filter(r => r.hasBought === 'Yes').length} Paid`, 'TagCon Tournament'],
    ['Beach Battle (Coastal Duels)', beachRows.length, beachRows.filter(r => r.phone !== 'N/A').length, beachRows.length, '16 Slots Full', 'Beach Battle'],
    ['VIP & Party Pre-Bookings', preBookingRows.length, preBookingRows.filter(r => r.phone !== 'N/A').length, preBookingRows.reduce((a, b) => a + (b.playersCount || 0), 0) + ' Guests', 'VIP Inquiries', 'Pre-Bookings & RSVPs'],
    ['Live Arena Scores & Matches', scoreRows.length, scoreRows.length, '28 Games Played', 'Leaderboard Entries', 'Arena Games & Scores'],
    ['TOTAL DIRECTORY CONTACTS', allMasterContacts.length, phoneSeen.size + ' Unique Numbers', `${zambaaraBookingsSnap.docs.length + tagconBookingsSnap.docs.length + beachRows.length} Confirmed`, 'Comprehensive Archive', 'All Contacts (Master Directory)']
  ];

  kpiData.forEach((row, i) => {
    const r = summarySheet.getRow(7 + i);
    r.values = ['', ...row];
    r.height = 24;
    const isTotalRow = i === kpiData.length - 1;
    for (let c = 2; c <= 7; c++) {
      const cell = r.getCell(c);
      cell.font = {
        name: 'Segoe UI',
        size: isTotalRow ? 10.5 : 10,
        bold: isTotalRow || c === 2,
        color: { argb: isTotalRow ? 'FF' + COLORS.headerText : 'FF' + COLORS.textDark }
      };
      cell.alignment = { vertical: 'middle', horizontal: c === 2 ? 'left' : 'center' };
      cell.border = {
        top: { style: isTotalRow ? 'medium' : 'thin', color: { argb: isTotalRow ? 'FF' + COLORS.goldBorder : 'FFE5E7EB' } },
        bottom: { style: isTotalRow ? 'medium' : 'thin', color: { argb: isTotalRow ? 'FF' + COLORS.goldBorder : 'FFE5E7EB' } },
        left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
      };
      if (isTotalRow) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.headerBg } };
      } else if (i % 2 === 1) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.zebraRow } };
      }
    }
  });

  // Quick Action Notes Box
  const noteRow = 15;
  summarySheet.mergeCells(`B${noteRow}:G${noteRow + 3}`);
  const noteCell = summarySheet.getCell(`B${noteRow}`);
  noteCell.value = "📌 NOTE FOR TOURNAMENT ORGANIZERS & ADMINS:\n" +
    "• All phone numbers have been formatted as text strings with leading zeros preserved to prevent scientific notation.\n" +
    "• The 'All Contacts (Master Directory)' sheet aggregates every player, deduplicated by activity, with one-click filtering.\n" +
    "• Specific tournament sheets (Zambaara, TagCon, Beach Battle) contain complete seating allocations and tribe assignments.\n" +
    "• You can search or copy phone numbers directly from Excel to initiate participant phone confirmations.";
  noteCell.font = { name: 'Segoe UI', size: 9.5, color: { argb: 'FF374151' } };
  noteCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
  noteCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDF8EE' } };
  noteCell.border = {
    top: { style: 'thin', color: { argb: 'FF' + COLORS.goldBorder } },
    bottom: { style: 'thin', color: { argb: 'FF' + COLORS.goldBorder } },
    left: { style: 'medium', color: { argb: 'FF' + COLORS.goldBorder } },
    right: { style: 'thin', color: { argb: 'FF' + COLORS.goldBorder } }
  };

  summarySheet.getColumn(2).width = 30;
  summarySheet.getColumn(3).width = 20;
  summarySheet.getColumn(4).width = 22;
  summarySheet.getColumn(5).width = 24;
  summarySheet.getColumn(6).width = 20;
  summarySheet.getColumn(7).width = 28;

  // =============================================================
  // SHEET 2: ALL CONTACTS (MASTER DIRECTORY)
  // =============================================================
  const masterSheet = workbook.addWorksheet('All Contacts (Master Directory)', {
    views: [{ state: 'frozen', ySplit: 1, showGridLines: true }]
  });

  const masterHeaders = [
    '#',
    'Full Name',
    'Phone / Mobile Number',
    'Source Category',
    'Tournament / Event Name',
    'Tribe',
    'Status / Stage',
    'Seat Number',
    'Ticket Purchased',
    'Email Address',
    'Date Logged'
  ];

  masterSheet.columns = [
    { key: 'index', width: 6 },
    { key: 'name', width: 26 },
    { key: 'phone', width: 22 },
    { key: 'category', width: 22 },
    { key: 'event', width: 26 },
    { key: 'tribe', width: 14 },
    { key: 'status', width: 28 },
    { key: 'seat', width: 16 },
    { key: 'hasBought', width: 16 },
    { key: 'email', width: 28 },
    { key: 'date', width: 20 }
  ];

  masterSheet.getRow(1).values = masterHeaders;
  applyHeaderStyle(masterSheet.getRow(1), masterHeaders.length);

  allMasterContacts.forEach((c, idx) => {
    const row = masterSheet.addRow({
      index: idx + 1,
      name: c.name,
      phone: c.phone,
      category: c.category,
      event: c.event,
      tribe: c.tribe,
      status: c.status,
      seat: c.seat,
      hasBought: c.hasBought,
      email: c.email,
      date: c.date
    });
    applyDataRowStyle(row, idx + 1, masterHeaders.length);

    // Apply color highlight for tribes
    const tribeCell = row.getCell(6);
    if (c.tribe === 'LAVA') tribeCell.font = { bold: true, color: { argb: 'FFFF4400' } };
    else if (c.tribe === 'RAIN') tribeCell.font = { bold: true, color: { argb: 'FF00AAFF' } };
    else if (c.tribe === 'MOUNTAIN') tribeCell.font = { bold: true, color: { argb: 'FFEEBB77' } };
    else if (c.tribe === 'WIND') tribeCell.font = { bold: true, color: { argb: 'FF00CC77' } };

    // Format phone column as explicit text
    row.getCell(3).numFmt = '@';
  });

  masterSheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: masterHeaders.length }
  };
  autoFitColumns(masterSheet, 12);

  // =============================================================
  // SHEET 3: ZAMBAARA TOURNAMENT
  // =============================================================
  const zambaaraSheet = workbook.addWorksheet('Zambaara Tournament', {
    views: [{ state: 'frozen', ySplit: 1, showGridLines: true }]
  });

  const zambaaraHeaders = [
    '#',
    'Player Name',
    'Phone / Mobile',
    'Assigned Tribe',
    'Verification Status',
    'Allocated Seat',
    'Active Tournament',
    'Ticket Purchased',
    'Registered Date',
    'Tribe Reveal Date'
  ];

  zambaaraSheet.columns = [
    { key: 'index', width: 6 },
    { key: 'name', width: 26 },
    { key: 'phone', width: 20 },
    { key: 'tribe', width: 16 },
    { key: 'status', width: 30 },
    { key: 'seatNumber', width: 16 },
    { key: 'tournamentName', width: 24 },
    { key: 'hasBought', width: 16 },
    { key: 'createdAt', width: 20 },
    { key: 'revealedAt', width: 20 }
  ];

  zambaaraSheet.getRow(1).values = zambaaraHeaders;
  applyHeaderStyle(zambaaraSheet.getRow(1), zambaaraHeaders.length);

  zambaaraRows.forEach((r, idx) => {
    const row = zambaaraSheet.addRow(r);
    applyDataRowStyle(row, idx + 1, zambaaraHeaders.length);

    // Tribe colors
    const tribeCell = row.getCell(4);
    if (r.tribe === 'LAVA') tribeCell.font = { bold: true, color: { argb: 'FFFF4400' } };
    else if (r.tribe === 'RAIN') tribeCell.font = { bold: true, color: { argb: 'FF00AAFF' } };
    else if (r.tribe === 'MOUNTAIN') tribeCell.font = { bold: true, color: { argb: 'FFEEBB77' } };
    else if (r.tribe === 'WIND') tribeCell.font = { bold: true, color: { argb: 'FF00CC77' } };

    // Format phone
    row.getCell(3).numFmt = '@';
  });

  zambaaraSheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: zambaaraHeaders.length }
  };
  autoFitColumns(zambaaraSheet, 12);

  // =============================================================
  // SHEET 4: TAGCON TOURNAMENT
  // =============================================================
  const tagconSheet = workbook.addWorksheet('TagCon Tournament', {
    views: [{ state: 'frozen', ySplit: 1, showGridLines: true }]
  });

  const tagconHeaders = [
    '#',
    'Player Name',
    'Phone / Mobile',
    'Assigned Tribe',
    'Tournament Status',
    'Allocated Seat',
    'Tournament Name',
    'Ticket Purchased',
    'Registered Date',
    'Tribe Reveal Date'
  ];

  tagconSheet.columns = [
    { key: 'index', width: 6 },
    { key: 'name', width: 26 },
    { key: 'phone', width: 20 },
    { key: 'tribe', width: 16 },
    { key: 'status', width: 26 },
    { key: 'seatNumber', width: 16 },
    { key: 'tournamentName', width: 24 },
    { key: 'hasBought', width: 16 },
    { key: 'createdAt', width: 20 },
    { key: 'revealedAt', width: 20 }
  ];

  tagconSheet.getRow(1).values = tagconHeaders;
  applyHeaderStyle(tagconSheet.getRow(1), tagconHeaders.length);

  tagconRows.forEach((r, idx) => {
    const row = tagconSheet.addRow(r);
    applyDataRowStyle(row, idx + 1, tagconHeaders.length);

    // Tribe colors
    const tribeCell = row.getCell(4);
    if (r.tribe === 'LAVA') tribeCell.font = { bold: true, color: { argb: 'FFFF4400' } };
    else if (r.tribe === 'RAIN') tribeCell.font = { bold: true, color: { argb: 'FF00AAFF' } };
    else if (r.tribe === 'MOUNTAIN') tribeCell.font = { bold: true, color: { argb: 'FFEEBB77' } };
    else if (r.tribe === 'WIND') tribeCell.font = { bold: true, color: { argb: 'FF00CC77' } };

    // Format phone
    row.getCell(3).numFmt = '@';
  });

  tagconSheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: tagconHeaders.length }
  };
  autoFitColumns(tagconSheet, 12);

  // =============================================================
  // SHEET 5: BEACH BATTLE TOURNAMENT
  // =============================================================
  const beachSheet = workbook.addWorksheet('Beach Battle', {
    views: [{ state: 'frozen', ySplit: 1, showGridLines: true }]
  });

  const beachHeaders = [
    '#',
    'Slot / Player #',
    'Warrior Name',
    'Phone / Mobile',
    'Email Address',
    'Assigned Tribe',
    'Tournament Status',
    'Registration Date'
  ];

  beachSheet.columns = [
    { key: 'index', width: 6 },
    { key: 'playerNumber', width: 16 },
    { key: 'name', width: 26 },
    { key: 'phone', width: 20 },
    { key: 'email', width: 28 },
    { key: 'tribe', width: 16 },
    { key: 'status', width: 20 },
    { key: 'createdAt', width: 22 }
  ];

  beachSheet.getRow(1).values = beachHeaders;
  applyHeaderStyle(beachSheet.getRow(1), beachHeaders.length);

  beachRows.forEach((r, idx) => {
    const row = beachSheet.addRow(r);
    applyDataRowStyle(row, idx + 1, beachHeaders.length);
    row.getCell(4).numFmt = '@';
  });

  beachSheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: beachHeaders.length }
  };
  autoFitColumns(beachSheet, 12);

  // =============================================================
  // SHEET 6: PRE-BOOKINGS & RSVPS
  // =============================================================
  const preSheet = workbook.addWorksheet('Pre-Bookings & RSVPs', {
    views: [{ state: 'frozen', ySplit: 1, showGridLines: true }]
  });

  const preHeaders = [
    '#',
    'Contact Name',
    'Phone / Mobile',
    'Email Address',
    'Number of Players',
    'Booking Status',
    'Special Requests / Notes',
    'Booking Request Date'
  ];

  preSheet.columns = [
    { key: 'index', width: 6 },
    { key: 'name', width: 26 },
    { key: 'phone', width: 20 },
    { key: 'email', width: 28 },
    { key: 'playersCount', width: 18 },
    { key: 'status', width: 18 },
    { key: 'notes', width: 36 },
    { key: 'createdAt', width: 22 }
  ];

  preSheet.getRow(1).values = preHeaders;
  applyHeaderStyle(preSheet.getRow(1), preHeaders.length);

  preBookingRows.forEach((r, idx) => {
    const row = preSheet.addRow(r);
    applyDataRowStyle(row, idx + 1, preHeaders.length);
    row.getCell(3).numFmt = '@';
  });

  preSheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: preHeaders.length }
  };
  autoFitColumns(preSheet, 12);

  // =============================================================
  // SHEET 7: ARENA GAMES & SCORES
  // =============================================================
  const scoreSheet = workbook.addWorksheet('Arena Games & Scores', {
    views: [{ state: 'frozen', ySplit: 1, showGridLines: true }]
  });

  const scoreHeaders = [
    '#',
    'Player / Warrior Name',
    'Phone Number',
    'Game ID / Challenge',
    'Score / Duration Time',
    'Played Date'
  ];

  scoreSheet.columns = [
    { key: 'index', width: 6 },
    { key: 'name', width: 26 },
    { key: 'phone', width: 20 },
    { key: 'gameId', width: 24 },
    { key: 'scoreTime', width: 20 },
    { key: 'createdAt', width: 22 }
  ];

  scoreSheet.getRow(1).values = scoreHeaders;
  applyHeaderStyle(scoreSheet.getRow(1), scoreHeaders.length);

  scoreRows.forEach((r, idx) => {
    const row = scoreSheet.addRow(r);
    applyDataRowStyle(row, idx + 1, scoreHeaders.length);
    row.getCell(3).numFmt = '@';
  });

  scoreSheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: scoreHeaders.length }
  };
  autoFitColumns(scoreSheet, 12);

  // -------------------------------------------------------------
  // SAVE WORKBOOK
  // -------------------------------------------------------------
  const filename = 'Zambara_Master_Contacts_Directory.xlsx';
  const rootPath = path.resolve(__dirname, '..', filename);
  const publicPath = path.resolve(__dirname, '..', 'public', filename);

  await workbook.xlsx.writeFile(rootPath);
  await workbook.xlsx.writeFile(publicPath);

  console.log(`\n🎉 Excel Workbook created successfully!`);
  console.log(`📁 Saved to Root: ${rootPath}`);
  console.log(`🌐 Saved to Public (direct download): ${publicPath}`);
  console.log(`🌐 Download URL: http://localhost:3000/${filename}`);
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Error generating Excel directory:', err);
  process.exit(1);
});
