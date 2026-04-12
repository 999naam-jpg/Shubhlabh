import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function generateInvoice(order) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()   // 210
  const H = doc.internal.pageSize.getHeight()  // 297
  const c = order.customer || {}
  const ML = 14  // margin left
  const MR = 14  // margin right

  // ── Palette ──
  const purple = [16, 185, 129]   // emerald green
  const dark   = [15, 23, 42]     // slate dark
  const white  = [255, 255, 255]
  const lgray  = [240, 253, 244]  // light green tint
  const mgray  = [100, 116, 139]
  const text   = [15, 23, 42]
  const green  = [22, 163, 74]
  const amber  = [180, 100, 0]

  // ══════════════════════════════════════
  // HEADER
  // ══════════════════════════════════════
  doc.setFillColor(...dark)
  doc.rect(0, 0, W, 42, 'F')
  doc.setFillColor(...purple)
  doc.rect(0, 0, 4, 42, 'F')

  // Company
  doc.setTextColor(...white)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text('Shubh Labh Event', ML + 4, 16)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(190, 190, 220)
  doc.text('Premium Event Decoration Rentals', ML + 4, 23)
  doc.text('shubh.labhevent@gmail.com  |  +91 95124 12800 / 84888 28839', ML + 4, 29)

  // Invoice title
  doc.setTextColor(...white)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(26)
  doc.text('INVOICE', W - MR, 18, { align: 'right' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(190, 190, 220)
  doc.text(order.id || '', W - MR, 26, { align: 'right' })

  const dateStr = order.createdAt?.seconds
    ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  doc.text(dateStr, W - MR, 32, { align: 'right' })

  // Status badge
  const sMap = {
    Confirmed: { bg: [209, 250, 229], fg: [16, 185, 129] },
    Delivered: { bg: [220, 252, 231], fg: [22, 163, 74] },
    Cancelled: { bg: [254, 226, 226], fg: [220, 38, 38] },
  }
  const s = sMap[order.status] || sMap.Confirmed
  doc.setFillColor(...s.bg)
  doc.roundedRect(W - MR - 30, 35, 30, 6, 1.5, 1.5, 'F')
  doc.setTextColor(...s.fg)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.text(order.status || 'Confirmed', W - MR - 15, 39.2, { align: 'center' })

  // ══════════════════════════════════════
  // BILL TO + EVENT DETAILS
  // ══════════════════════════════════════
  const infoY = 48
  const colW  = (W - ML - MR - 6) / 2   // ~88mm each
  const infoH = 40

  // Bill To box
  doc.setFillColor(...lgray)
  doc.roundedRect(ML, infoY, colW, infoH, 2, 2, 'F')
  doc.setFillColor(...purple)
  doc.roundedRect(ML, infoY, colW, 7, 2, 2, 'F')
  doc.rect(ML, infoY + 4, colW, 3, 'F')

  doc.setTextColor(...white)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.text('BILL TO', ML + 4, infoY + 5)

  doc.setTextColor(...text)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text(c.name || '-', ML + 4, infoY + 15)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...mgray)
  let by = infoY + 22
  if (c.phone)   { doc.text(`Phone: ${c.phone}`, ML + 4, by); by += 6 }
  if (c.email)   { doc.text(`Email: ${c.email}`, ML + 4, by); by += 6 }
  if (c.address) {
    const lines = doc.splitTextToSize(`Venue: ${c.address}`, colW - 8)
    doc.text(lines[0], ML + 4, by)
  }

  // Event Details box
  const col2X = ML + colW + 6
  doc.setFillColor(...lgray)
  doc.roundedRect(col2X, infoY, colW, infoH, 2, 2, 'F')
  doc.setFillColor(...purple)
  doc.roundedRect(col2X, infoY, colW, 7, 2, 2, 'F')
  doc.rect(col2X, infoY + 4, colW, 3, 'F')

  doc.setTextColor(...white)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.text('EVENT DETAILS', col2X + 4, infoY + 5)

  const eventRows = [
    ['Event Date',   c.date],
    ['Pickup Date',  c.pickupDate],
    ['Return Date',  c.returnDate],
    ['Home Address', c.homeAddress],
  ].filter(r => r[1])

  let ey = infoY + 15
  eventRows.forEach(([label, val]) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...mgray)
    doc.text(`${label}:`, col2X + 4, ey)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...text)
    const valLines = doc.splitTextToSize(String(val), colW - 36)
    doc.text(valLines[0], col2X + 34, ey)
    ey += 6
  })

  // ══════════════════════════════════════
  // ITEMS TABLE
  // ══════════════════════════════════════
  const tableY = infoY + infoH + 6

  const tableRows = (order.items || []).map((item, i) => {
    const unit = parseInt((item.price || '').replace(/[^0-9]/g, '')) || 0
    const lineTotal = unit * (item.qty || 1)
    return [
      String(i + 1),
      item.name || '-',
      item.source || '-',
      String(item.qty || 1),
      `Rs.${unit.toLocaleString()}`,
      `Rs.${lineTotal.toLocaleString()}`,
    ]
  })

  autoTable(doc, {
    startY: tableY,
    head: [['#', 'Item Name', 'Category', 'Qty', 'Unit Price', 'Amount']],
    body: tableRows,
    theme: 'plain',
    headStyles: {
      fillColor: purple,
      textColor: white,
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left',
      cellPadding: { top: 3.5, bottom: 3.5, left: 3, right: 3 },
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: text,
      cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
    },
    alternateRowStyles: { fillColor: lgray },
    columnStyles: {
      0: { cellWidth: 8,  halign: 'center' },
      1: { cellWidth: 62 },
      2: { cellWidth: 32 },
      3: { cellWidth: 10, halign: 'center' },
      4: { cellWidth: 30, halign: 'right' },
      5: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: ML, right: MR },
    tableLineColor: [220, 220, 235],
    tableLineWidth: 0.2,
  })

  // ══════════════════════════════════════
  // PAYMENT SUMMARY
  // ══════════════════════════════════════
  const sumStartY = doc.lastAutoTable.finalY + 8
  const total    = order.total    || 0
  const deposit  = order.deposit  || 0
  const discount = order.discount || 0
  const balance  = Math.abs(order.balance ?? (total - discount))
  const finalAmt = total + deposit

  // Summary box — right aligned, fixed width 80mm
  const boxW  = 80
  const boxX  = W - MR - boxW
  const lineH = 8

  const sumLines = [
    { label: 'Product Amount',  value: `Rs.${total.toLocaleString()}`,    color: text,  bold: false },
    ...(discount > 0 ? [{ label: `Discount${order.discountNote ? ` (${order.discountNote})` : ''}`, value: `- Rs.${discount.toLocaleString()}`, color: amber, bold: false }] : []),
    { label: 'Security Deposit', value: `Rs.${deposit.toLocaleString()}`, color: green, bold: false },
    { label: 'Final Amount',     value: `Rs.${(total + deposit - discount).toLocaleString()}`, color: dark, bold: true },
  ]

  const boxH = sumLines.length * lineH + 18
  doc.setFillColor(...lgray)
  doc.roundedRect(boxX, sumStartY, boxW, boxH, 2, 2, 'F')

  let sy = sumStartY + 7
  sumLines.forEach(row => {
    doc.setFont('helvetica', row.bold ? 'bold' : 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(...mgray)
    doc.text(row.label, boxX + 4, sy)
    doc.setTextColor(...row.color)
    doc.text(row.value, boxX + boxW - 4, sy, { align: 'right' })
    sy += lineH
  })

  // Divider
  doc.setDrawColor(...purple)
  doc.setLineWidth(0.4)
  doc.line(boxX + 2, sy - 2, boxX + boxW - 2, sy - 2)

  // Balance Due banner
  doc.setFillColor(...purple)
  doc.roundedRect(boxX, sy, boxW, 12, 2, 2, 'F')
  doc.setTextColor(...white)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('Balance Due', boxX + 5, sy + 7.5)
  doc.setFontSize(11)
  doc.text(`Rs.${balance.toLocaleString()}`, boxX + boxW - 5, sy + 7.5, { align: 'right' })

  // Deposit refund note — full width
  if (deposit > 0 && c.returnDate) {
    const noteY = sy + 16
    const noteW = W - ML - MR
    const noteH = 38
    doc.setFillColor(220, 252, 231)
    doc.roundedRect(ML, noteY, noteW, noteH, 2, 2, 'F')
    doc.setDrawColor(...green)
    doc.setLineWidth(0.8)
    doc.roundedRect(ML, noteY, noteW, noteH, 2, 2, 'S')

    // Green title bar
    doc.setFillColor(...green)
    doc.roundedRect(ML, noteY, noteW, 10, 2, 2, 'F')
    doc.rect(ML, noteY + 5, noteW, 5, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...white)
    doc.text('DEPOSIT REFUND POLICY', ML + 5, noteY + 7.5)

    // Refund lines
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9.5)
    doc.setTextColor(22, 101, 52)
    doc.text(`Return by ${c.returnDate} — security deposit of Rs.${deposit.toLocaleString()} is fully refundable.`, ML + 5, noteY + 19)
    doc.setFont('helvetica', 'normal')
    doc.text(`Upon successful pickup of all items, Rs.${deposit.toLocaleString()} will be refunded in full.`, ML + 5, noteY + 26)

    // Damage warning in red
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9.5)
    doc.setTextColor(185, 28, 28)
    doc.text('* Any damage or loss of rented items will be charged and deducted from the security deposit.', ML + 5, noteY + 34)
  } else {
    // No deposit — show only damage warning
    const noteY = sy + 16
    const noteW = W - ML - MR
    doc.setFillColor(254, 226, 226)
    doc.roundedRect(ML, noteY, noteW, 16, 2, 2, 'F')
    doc.setDrawColor(185, 28, 28)
    doc.setLineWidth(0.5)
    doc.roundedRect(ML, noteY, noteW, 16, 2, 2, 'S')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9.5)
    doc.setTextColor(185, 28, 28)
    doc.text('* Any damage or loss of rented items will be charged separately.', ML + 5, noteY + 10)
  }

  // ══════════════════════════════════════
  // NOTES (left of summary)
  // ══════════════════════════════════════
  if (c.note) {
    const noteW = boxX - ML - 6
    doc.setFillColor(255, 251, 235)
    doc.roundedRect(ML, sumStartY, noteW, 20, 2, 2, 'F')
    doc.setFillColor(217, 119, 6)
    doc.roundedRect(ML, sumStartY, noteW, 6, 2, 2, 'F')
    doc.rect(ML, sumStartY + 3, noteW, 3, 'F')
    doc.setTextColor(...white)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.text('NOTES', ML + 4, sumStartY + 4.5)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(100, 70, 10)
    const noteLines = doc.splitTextToSize(c.note, noteW - 8)
    doc.text(noteLines.slice(0, 2), ML + 4, sumStartY + 13)
  }

  // ══════════════════════════════════════
  // FOOTER
  // ══════════════════════════════════════
  doc.setFillColor(...dark)
  doc.rect(0, H - 16, W, 16, 'F')
  doc.setFillColor(...purple)
  doc.rect(0, H - 16, 4, 16, 'F')

  doc.setTextColor(190, 190, 220)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('Thank you for choosing Shubh Labh Event! We look forward to making your event truly special.', W / 2, H - 9, { align: 'center' })
  doc.setFontSize(7)
  doc.setTextColor(...mgray)
  doc.text('instagram.com/shubh.labhevent  |  shubh.labhevent@gmail.com', W / 2, H - 4, { align: 'center' })

  doc.save(`Invoice_${order.id}.pdf`)
}

export function sendInvoiceWhatsApp(order) {
  const c = order.customer || {}
  // Clean phone — remove spaces, dashes, brackets; add country code if missing
  let phone = (c.phone || '').replace(/[\s\-().+]/g, '')
  if (phone.startsWith('0')) phone = '91' + phone.slice(1)
  if (!phone.startsWith('91')) phone = '91' + phone

  const total    = order.total    || 0
  const deposit  = order.deposit  || 0
  const discount = order.discount || 0
  const balance  = order.balance  ?? Math.max(0, total - deposit - discount)

  const msg = [
    `Hello ${c.name || 'there'}! 👋`,
    ``,
    `Thank you for choosing *Shubh Labh Event*! 🌸`,
    ``,
    `Here are your order details:`,
    `📋 *Order ID:* ${order.id}`,
    `📅 *Event Date:* ${c.date || '-'}`,
    `📦 *Pickup Date:* ${c.pickupDate || '-'}`,
    `🔄 *Return Date:* ${c.returnDate || '-'}`,
    ``,
    `*Items Ordered:*`,
    ...(order.items || []).map(i => `  • ${i.name} x${i.qty} — ${i.price}`),
    ``,
    `💰 *Total Amount:* Rs.${total.toLocaleString()}`,
    ...(discount > 0 ? [`🏷️ *Discount:* - Rs.${discount.toLocaleString()}`] : []),
    ...(deposit > 0  ? [`✅ *Deposit Paid:* Rs.${deposit.toLocaleString()}`] : []),
    `💳 *Balance Due:* Rs.${balance.toLocaleString()}`,
    ``,
    `📍 *Venue:* ${c.address || '-'}`,
    ``,
    `For any queries, call us at +91 98765 43210.`,
    `Thank you! 🙏`,
  ].join('\n')

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
  window.open(url, '_blank')
}
