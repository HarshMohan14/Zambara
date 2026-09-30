import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'
import ExcelJS from 'exceljs'

export const dynamic = 'force-dynamic'

function formatTimestamp(ts: any) {
  if (!ts) return 'N/A'
  if (ts.toDate && typeof ts.toDate === 'function') {
    return ts.toDate().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })
  }
  if (typeof ts === 'string') {
    const d = new Date(ts)
    if (!isNaN(d.getTime())) {
      return d.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })
    }
    return ts
  }
  return String(ts)
}

function cleanPhone(phone: any) {
  if (!phone) return 'N/A'
  return String(phone).trim().replace(/\s+/g, '')
}

export async function GET() {
  try {
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
    ])

    const zambaaraTourneysMap: Record<string, any> = {}
    zambaaraTourneysSnap.docs.forEach((d: any) => {
      zambaaraTourneysMap[d.id] = { id: d.id, ...d.data() }
    })

    const tagconTourneysMap: Record<string, any> = {}
    tagconTourneysSnap.docs.forEach((d: any) => {
      tagconTourneysMap[d.id] = { id: d.id, ...d.data() }
    })

    const zambaaraBookingsByUser: Record<string, any> = {}
    zambaaraBookingsSnap.docs.forEach((d: any) => {
      const data = d.data()
      if (data.userId) zambaaraBookingsByUser[data.userId] = data
      const cleanNum = cleanPhone(data.userMobile)
      if (cleanNum && cleanNum !== 'N/A') zambaaraBookingsByUser[cleanNum] = data
    })

    const tagconBookingsByUser: Record<string, any> = {}
    tagconBookingsSnap.docs.forEach((d: any) => {
      const data = d.data()
      if (data.userId) tagconBookingsByUser[data.userId] = data
      const cleanNum = cleanPhone(data.userMobile)
      if (cleanNum && cleanNum !== 'N/A') tagconBookingsByUser[cleanNum] = data
    })

    const allMasterContacts: any[] = []
    const phoneSeen = new Map()

    function trackContact(contact: any) {
      allMasterContacts.push(contact)
      const phone = cleanPhone(contact.phone)
      if (phone && phone !== 'N/A' && phone.length >= 7) {
        if (!phoneSeen.has(phone)) {
          phoneSeen.set(phone, { name: contact.name, count: 0, sources: new Set() })
        }
        const entry = phoneSeen.get(phone)
        entry.count++
        entry.sources.add(contact.category)
      }
    }

    // 1. Zambaara
    const zambaaraRows: any[] = []
    zambaaraUsersSnap.docs.forEach((doc: any, idx: number) => {
      const data = doc.data()
      const phone = cleanPhone(data.mobile || data.number)
      const booking = zambaaraBookingsByUser[doc.id] || zambaaraBookingsByUser[phone]
      const tourney = booking ? zambaaraTourneysMap[booking.tournamentId] : Object.values(zambaaraTourneysMap)[0]

      let statusText = 'Waiting Reveal'
      if (booking) {
        statusText = booking.isZampion ? '👑 Ultimate Zampion' : booking.isWinner ? '★ Round Winner' : 'Seat Booked'
      } else if (data.status === 'confirmed') {
        statusText = 'Confirmed Pool (Ready to Seat)'
      } else if (data.status === 'completed' || data.tribe) {
        statusText = 'Tribe Revealed'
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
      }
      zambaaraRows.push(row)

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
      })
    })

    // 2. TagCon
    const tagconRows: any[] = []
    tagconUsersSnap.docs.forEach((doc: any, idx: number) => {
      const data = doc.data()
      const phone = cleanPhone(data.mobile || data.number)
      const booking = tagconBookingsByUser[doc.id] || tagconBookingsByUser[phone]
      const tourney = booking ? tagconTourneysMap[booking.tournamentId] : Object.values(tagconTourneysMap)[0]

      let statusText = 'Waiting Reveal'
      if (booking) {
        statusText = booking.isZampion ? '👑 Ultimate Zampion' : booking.isWinner ? '★ Round Winner' : 'Seat Booked'
      } else if (data.tribe) {
        statusText = 'Tribe Revealed'
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
      }
      tagconRows.push(row)

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
      })
    })

    // 3. Beach Battle
    const beachRows: any[] = []
    beachBattleSnap.docs.forEach((doc: any, idx: number) => {
      const data = doc.data()
      const phone = cleanPhone(data.phone)
      const row = {
        index: idx + 1,
        playerNumber: data.playerNumber ? `Player #${data.playerNumber}` : `Slot #${idx + 1}`,
        name: data.name || 'Gladiator',
        phone: phone,
        email: data.email || 'N/A',
        tribe: data.tribe ? data.tribe.toUpperCase() : 'COASTAL',
        status: 'Registered Player',
        createdAt: formatTimestamp(data.createdAt)
      }
      beachRows.push(row)

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
      })
    })

    // 4. PreBookings
    const preBookingRows: any[] = []
    preBookingsSnap.docs.forEach((doc: any, idx: number) => {
      const data = doc.data()
      const phone = cleanPhone(data.mobile)
      const row = {
        index: idx + 1,
        name: data.name || 'Party Host',
        phone: phone,
        email: data.email || 'N/A',
        playersCount: data.numberOfPlayers || 1,
        status: data.status ? String(data.status).toUpperCase() : 'CONFIRMED',
        notes: data.specialRequests || 'None',
        createdAt: formatTimestamp(data.createdAt)
      }
      preBookingRows.push(row)

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
      })
    })

    // 5. Scores
    const scoreRows: any[] = []
    scoresSnap.docs.forEach((doc: any) => {
      const data = doc.data()
      const phone = cleanPhone(data.playerMobile || data.winnerMobile)
      if (!phone || phone === 'N/A') return

      const row = {
        index: scoreRows.length + 1,
        name: data.playerName || 'Arena Challenger',
        phone: phone,
        gameId: data.gameId || 'Arena Game',
        scoreTime: data.time ? `${data.time}s` : 'Completed',
        createdAt: formatTimestamp(data.createdAt)
      }
      scoreRows.push(row)

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
      })
    })

    // Build Workbook
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'Zambara Engine'
    workbook.created = new Date()

    const applyHeader = (headerRow: any, count: number) => {
      headerRow.height = 28
      for (let c = 1; c <= count; c++) {
        const cell = headerRow.getCell(c)
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A1F2C' } }
        cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFD1A058' } }
        cell.alignment = { vertical: 'middle', horizontal: 'center' }
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD1A058' } },
          bottom: { style: 'medium', color: { argb: 'FFD1A058' } }
        }
      }
    }

    const applyData = (row: any, isEven: boolean, count: number) => {
      row.height = 22
      for (let c = 1; c <= count; c++) {
        const cell = row.getCell(c)
        cell.font = { name: 'Segoe UI', size: 10, color: { argb: 'FF1F2937' } }
        cell.alignment = { vertical: 'middle', horizontal: c === 1 ? 'center' : c === 3 ? 'center' : 'left' }
        if (isEven) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } }
        }
      }
    }

    // 1. Summary
    const summarySheet = workbook.addWorksheet('Summary & Overview')
    summarySheet.mergeCells('B2:G3')
    const titleCell = summarySheet.getCell('B2')
    titleCell.value = 'ZAMBARA ARENA — MASTER TOURNAMENTS & USER DIRECTORY'
    titleCell.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FFD1A058' } }
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' }
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A1F2C' } }

    const kpiHeaders = ['Category / Event', 'Total Participants', 'With Phone Numbers', 'Seat Bookings Confirmed', 'Revenue / Tickets', 'Worksheet Tab']
    summarySheet.getRow(6).values = ['', ...kpiHeaders]
    summarySheet.getRow(6).height = 26
    for (let c = 2; c <= 7; c++) {
      const cell = summarySheet.getRow(6).getCell(c)
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A1F2C' } }
      cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFD1A058' } }
      cell.alignment = { vertical: 'middle', horizontal: 'center' }
    }

    const kpiData = [
      ['Zambaara Tournament', zambaaraRows.length, zambaaraRows.filter(r => r.phone !== 'N/A').length, zambaaraBookingsSnap.docs.length, `${zambaaraRows.filter(r => r.hasBought === 'Yes').length} Paid`, 'Zambaara Tournament'],
      ['TagCon Arena', tagconRows.length, tagconRows.filter(r => r.phone !== 'N/A').length, tagconBookingsSnap.docs.length, `${tagconRows.filter(r => r.hasBought === 'Yes').length} Paid`, 'TagCon Tournament'],
      ['Beach Battle (Coastal Duels)', beachRows.length, beachRows.filter(r => r.phone !== 'N/A').length, beachRows.length, '16 Slots Full', 'Beach Battle'],
      ['VIP & Party Pre-Bookings', preBookingRows.length, preBookingRows.filter(r => r.phone !== 'N/A').length, preBookingRows.reduce((a, b) => a + (b.playersCount || 0), 0) + ' Guests', 'VIP Inquiries', 'Pre-Bookings & RSVPs'],
      ['Live Arena Scores & Matches', scoreRows.length, scoreRows.length, '28 Games Played', 'Leaderboard Entries', 'Arena Games & Scores'],
      ['TOTAL DIRECTORY CONTACTS', allMasterContacts.length, phoneSeen.size + ' Unique Numbers', `${zambaaraBookingsSnap.docs.length + tagconBookingsSnap.docs.length + beachRows.length} Confirmed`, 'Comprehensive Archive', 'All Contacts (Master Directory)']
    ]

    kpiData.forEach((row, i) => {
      const r = summarySheet.getRow(7 + i)
      r.values = ['', ...row]
      r.height = 24
      const isTotal = i === kpiData.length - 1
      for (let c = 2; c <= 7; c++) {
        const cell = r.getCell(c)
        cell.font = { name: 'Segoe UI', size: isTotal ? 10.5 : 10, bold: isTotal || c === 2, color: { argb: isTotal ? 'FFD1A058' : 'FF1F2937' } }
        cell.alignment = { vertical: 'middle', horizontal: c === 2 ? 'left' : 'center' }
        if (isTotal) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A1F2C' } }
        }
      }
    })

    summarySheet.getColumn(2).width = 30
    summarySheet.getColumn(3).width = 20
    summarySheet.getColumn(4).width = 22
    summarySheet.getColumn(5).width = 24
    summarySheet.getColumn(6).width = 20
    summarySheet.getColumn(7).width = 28

    // 2. Master
    const masterSheet = workbook.addWorksheet('All Contacts (Master Directory)')
    masterSheet.columns = [
      { header: '#', key: 'index', width: 6 },
      { header: 'Full Name', key: 'name', width: 26 },
      { header: 'Phone / Mobile Number', key: 'phone', width: 22 },
      { header: 'Source Category', key: 'category', width: 22 },
      { header: 'Tournament / Event Name', key: 'event', width: 26 },
      { header: 'Tribe', key: 'tribe', width: 14 },
      { header: 'Status / Stage', key: 'status', width: 28 },
      { header: 'Seat Number', key: 'seat', width: 16 },
      { header: 'Ticket Purchased', key: 'hasBought', width: 16 },
      { header: 'Email Address', key: 'email', width: 28 },
      { header: 'Date Logged', key: 'date', width: 20 },
    ]
    applyHeader(masterSheet.getRow(1), 11)
    allMasterContacts.forEach((c, idx) => {
      const row = masterSheet.addRow({ index: idx + 1, ...c })
      applyData(row, idx % 2 === 1, 11)
      row.getCell(3).numFmt = '@'
    })

    // 3. Zambaara Sheet
    const zambaaraSheet = workbook.addWorksheet('Zambaara Tournament')
    zambaaraSheet.columns = [
      { header: '#', key: 'index', width: 6 },
      { header: 'Player Name', key: 'name', width: 26 },
      { header: 'Phone / Mobile', key: 'phone', width: 20 },
      { header: 'Assigned Tribe', key: 'tribe', width: 16 },
      { header: 'Verification Status', key: 'status', width: 30 },
      { header: 'Allocated Seat', key: 'seatNumber', width: 16 },
      { header: 'Active Tournament', key: 'tournamentName', width: 24 },
      { header: 'Ticket Purchased', key: 'hasBought', width: 16 },
      { header: 'Registered Date', key: 'createdAt', width: 20 },
      { header: 'Tribe Reveal Date', key: 'revealedAt', width: 20 },
    ]
    applyHeader(zambaaraSheet.getRow(1), 10)
    zambaaraRows.forEach((r, idx) => {
      const row = zambaaraSheet.addRow(r)
      applyData(row, idx % 2 === 1, 10)
      row.getCell(3).numFmt = '@'
    })

    // 4. Tagcon Sheet
    const tagconSheet = workbook.addWorksheet('TagCon Tournament')
    tagconSheet.columns = [
      { header: '#', key: 'index', width: 6 },
      { header: 'Player Name', key: 'name', width: 26 },
      { header: 'Phone / Mobile', key: 'phone', width: 20 },
      { header: 'Assigned Tribe', key: 'tribe', width: 16 },
      { header: 'Tournament Status', key: 'status', width: 26 },
      { header: 'Allocated Seat', key: 'seatNumber', width: 16 },
      { header: 'Tournament Name', key: 'tournamentName', width: 24 },
      { header: 'Ticket Purchased', key: 'hasBought', width: 16 },
      { header: 'Registered Date', key: 'createdAt', width: 20 },
      { header: 'Tribe Reveal Date', key: 'revealedAt', width: 20 },
    ]
    applyHeader(tagconSheet.getRow(1), 10)
    tagconRows.forEach((r, idx) => {
      const row = tagconSheet.addRow(r)
      applyData(row, idx % 2 === 1, 10)
      row.getCell(3).numFmt = '@'
    })

    // 5. Beach Battle Sheet
    const beachSheet = workbook.addWorksheet('Beach Battle')
    beachSheet.columns = [
      { header: '#', key: 'index', width: 6 },
      { header: 'Slot / Player #', key: 'playerNumber', width: 16 },
      { header: 'Warrior Name', key: 'name', width: 26 },
      { header: 'Phone / Mobile', key: 'phone', width: 20 },
      { header: 'Email Address', key: 'email', width: 28 },
      { header: 'Assigned Tribe', key: 'tribe', width: 16 },
      { header: 'Tournament Status', key: 'status', width: 20 },
      { header: 'Registration Date', key: 'createdAt', width: 22 },
    ]
    applyHeader(beachSheet.getRow(1), 8)
    beachRows.forEach((r, idx) => {
      const row = beachSheet.addRow(r)
      applyData(row, idx % 2 === 1, 8)
      row.getCell(4).numFmt = '@'
    })

    // 6. PreBookings Sheet
    const preSheet = workbook.addWorksheet('Pre-Bookings & RSVPs')
    preSheet.columns = [
      { header: '#', key: 'index', width: 6 },
      { header: 'Contact Name', key: 'name', width: 26 },
      { header: 'Phone / Mobile', key: 'phone', width: 20 },
      { header: 'Email Address', key: 'email', width: 28 },
      { header: 'Number of Players', key: 'playersCount', width: 18 },
      { header: 'Booking Status', key: 'status', width: 18 },
      { header: 'Special Requests / Notes', key: 'notes', width: 36 },
      { header: 'Booking Request Date', key: 'createdAt', width: 22 },
    ]
    applyHeader(preSheet.getRow(1), 8)
    preBookingRows.forEach((r, idx) => {
      const row = preSheet.addRow(r)
      applyData(row, idx % 2 === 1, 8)
      row.getCell(3).numFmt = '@'
    })

    // 7. Scores Sheet
    const scoreSheet = workbook.addWorksheet('Arena Games & Scores')
    scoreSheet.columns = [
      { header: '#', key: 'index', width: 6 },
      { header: 'Player / Warrior Name', key: 'name', width: 26 },
      { header: 'Phone Number', key: 'phone', width: 20 },
      { header: 'Game ID / Challenge', key: 'gameId', width: 24 },
      { header: 'Score / Duration Time', key: 'scoreTime', width: 20 },
      { header: 'Played Date', key: 'createdAt', width: 22 },
    ]
    applyHeader(scoreSheet.getRow(1), 6)
    scoreRows.forEach((r, idx) => {
      const row = scoreSheet.addRow(r)
      applyData(row, idx % 2 === 1, 6)
      row.getCell(3).numFmt = '@'
    })

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer()

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="Zambara_Master_Contacts_Directory.xlsx"',
      },
    })
  } catch (error: any) {
    console.error('Error generating Excel file:', error)
    return NextResponse.json({ error: error.message || 'Failed to export Excel' }, { status: 500 })
  }
}
