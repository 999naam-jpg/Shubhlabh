import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function generateInvoice(order) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  const c = order.customer || {}
  const ML = 14, MR = 14

  // Colors
  const navy   = [14, 165, 233]   // #0ea5e9 sky blue
  const indigo = [56, 189, 248]   // #38bdf8 lighter blue
  const white  = [255, 255, 255]
  const light  = [240, 249, 255]  // very light blue tint
  const muted  = [100, 116, 139]
  const dark   = [15, 23, 42]
  const green  = [22, 163, 74]
  const red    = [185, 28, 28]

  // ── HEADER ──────────────────────────────
  doc.setFillColor(...navy)
  doc.rect(0, 0, W, 36, 'F')
  doc.setFillColor(...indigo)
  doc.rect(0, 0, 3, 36, 'F')

  // Brand name
  doc.setTextColor(...white)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('Shubh Labh Event', ML + 2, 13)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...white)
  doc.text('+91 95124 12800  |  +91 84888 28839  |  shubh.labhevent@gmail.com', ML + 2, 20)
  doc.text('@shubh.labhevent  |  Surat, Gujarat', ML + 2, 26)

  // INVOICE + ID + Date
  doc.setTextColor(...white)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text('INVOICE', W - MR, 14, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(180, 190, 220)
  doc.text(order.id || '', W - MR, 21, { align: 'right' })
  const dateStr = order.createdAt?.seconds
    ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  doc.text(dateStr, W - MR, 27, { align: 'right' })

  // Status badge
  const sMap = { Confirmed:[209,250,229,16,185,129], Delivered:[220,252,231,22,163,74], Cancelled:[254,226,226,220,38,38], Pending:[254,243,199,217,119,6] }
  const sc = sMap[order.status] || sMap.Confirmed
  doc.setFillColor(sc[0],sc[1],sc[2])
  doc.roundedRect(W-MR-24, 29, 24, 6, 1.5, 1.5, 'F')
  doc.setTextColor(sc[3],sc[4],sc[5])
  doc.setFont('helvetica','bold')
  doc.setFontSize(7)
  doc.text(order.status||'Confirmed', W-MR-12, 33, { align:'center' })

  // ── BILL TO + EVENT (2 cols) ─────────────
  const infoY = 42
  const colW = (W - ML - MR - 5) / 2

  // Bill To box
  doc.setFillColor(...light)
  doc.roundedRect(ML, infoY, colW, 36, 2, 2, 'F')
  doc.setFillColor(...indigo)
  doc.roundedRect(ML, infoY, colW, 6, 2, 2, 'F')
  doc.rect(ML, infoY+3, colW, 3, 'F')
  doc.setTextColor(...white)
  doc.setFont('helvetica','bold')
  doc.setFontSize(7)
  doc.text('BILL TO', ML+3, infoY+4.5)

  doc.setTextColor(...dark)
  doc.setFont('helvetica','bold')
  doc.setFontSize(10)
  doc.text(c.name || '-', ML+3, infoY+13)
  doc.setFont('helvetica','normal')
  doc.setFontSize(8)
  doc.setTextColor(...muted)
  let by = infoY+20
  if (c.phone) { doc.text(c.phone, ML+3, by); by+=5.5 }
  if (c.email) { doc.text(c.email, ML+3, by); by+=5.5 }
  if (c.address) { const l=doc.splitTextToSize(c.address, colW-6); doc.text(l[0], ML+3, by) }

  // Event Details box
  const c2X = ML + colW + 5
  doc.setFillColor(...light)
  doc.roundedRect(c2X, infoY, colW, 36, 2, 2, 'F')
  doc.setFillColor(...indigo)
  doc.roundedRect(c2X, infoY, colW, 6, 2, 2, 'F')
  doc.rect(c2X, infoY+3, colW, 3, 'F')
  doc.setTextColor(...white)
  doc.setFont('helvetica','bold')
  doc.setFontSize(7)
  doc.text('EVENT DETAILS', c2X+3, infoY+4.5)

  const evRows = [
    c.date       && ['Event Date', c.date],
    c.pickupDate && ['Pickup',     c.pickupDate],
    c.returnDate && ['Return',     c.returnDate],
    c.babyGender && ['Baby',       c.babyGender],
    c.note       && ['Notes',      c.note],
  ].filter(Boolean)

  let ey = infoY+13
  evRows.forEach(([lbl,val]) => {
    if (ey > infoY+34) return
    doc.setFont('helvetica','bold')
    doc.setFontSize(7.5)
    doc.setTextColor(...muted)
    doc.text(lbl+':', c2X+3, ey)
    doc.setFont('helvetica','normal')
    doc.setTextColor(...dark)
    doc.text(String(val), c2X+28, ey)
    ey += 5.5
  })

  // ── ITEMS TABLE ──────────────────────────
  const tableY = infoY + 42
  const itemImages = (order.items||[]).map(i=>i.image||'')

  const tableRows = (order.items||[]).map((item,i) => {
    const unit = parseInt((item.price||'').replace(/[^0-9]/g,''))||0
    return [String(i+1), '', item.name||'-', item.source||'-', String(item.qty||1), `Rs.${unit.toLocaleString()}`, `Rs.${(unit*(item.qty||1)).toLocaleString()}`]
  })

  autoTable(doc, {
    startY: tableY,
    head: [['#','','Item','Category','Qty','Rate','Amount']],
    body: tableRows,
    theme: 'plain',
    headStyles: { fillColor: navy, textColor: white, fontStyle:'bold', fontSize:8, cellPadding:{top:3,bottom:3,left:3,right:3} },
    bodyStyles: { fontSize:8.5, textColor:dark, cellPadding:{top:2,bottom:2,left:3,right:3}, minCellHeight:16 },
    alternateRowStyles: { fillColor: light },
    columnStyles: {
      0:{cellWidth:8, halign:'center'},
      1:{cellWidth:16},
      2:{cellWidth:72},
      3:{cellWidth:32},
      4:{cellWidth:12, halign:'center'},
      5:{cellWidth:21, halign:'right'},
      6:{cellWidth:21, halign:'right', fontStyle:'bold'},
    },
    margin:{left:ML,right:MR},
    tableLineColor:[226,232,240],
    tableLineWidth:0.2,
    didDrawCell:(data)=>{
      if(data.section==='body' && data.column.index===1){
        const url=itemImages[data.row.index]
        if(url&&(url.startsWith('http')||url.startsWith('data:'))){
          try{ doc.addImage(url,'JPEG',data.cell.x+1,data.cell.y+1,14,14) }catch(e){}
        }
      }
    },
  })

  // ── PAYMENT SUMMARY ──────────────────────
  const sumY = doc.lastAutoTable.finalY + 6
  const total   = order.total   || 0
  const deposit = order.deposit || 0
  const discount= order.discount|| 0
  const balance = Math.abs(order.balance ?? (total - discount))
  const boxW=80, boxX=W-MR-boxW

  const sumRows = [
    {lbl:'Product Amount', val:`Rs.${total.toLocaleString()}`, color:dark},
    ...(discount>0?[{lbl:`Discount${order.discountNote?` (${order.discountNote})`:''}`,val:`- Rs.${discount.toLocaleString()}`,color:[180,100,0]}]:[]),
    {lbl:'Security Deposit', val:`Rs.${deposit.toLocaleString()}`, color:green},
    {lbl:'Final Amount', val:`Rs.${(total+deposit-discount).toLocaleString()}`, color:dark, bold:true},
  ]

  const boxH = sumRows.length*8+16
  doc.setFillColor(...light)
  doc.roundedRect(boxX, sumY, boxW, boxH, 2, 2, 'F')
  doc.setDrawColor(...indigo)
  doc.setLineWidth(0.3)
  doc.roundedRect(boxX, sumY, boxW, boxH, 2, 2, 'S')

  let sy = sumY+7
  sumRows.forEach(r=>{
    doc.setFont('helvetica', r.bold?'bold':'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(...muted)
    doc.text(r.lbl, boxX+4, sy)
    doc.setTextColor(...r.color)
    doc.text(r.val, boxX+boxW-4, sy, {align:'right'})
    sy+=8
  })
  doc.setDrawColor(...indigo)
  doc.setLineWidth(0.4)
  doc.line(boxX+3, sy-2, boxX+boxW-3, sy-2)
  doc.setFillColor(...indigo)
  doc.roundedRect(boxX, sy, boxW, 11, 2, 2, 'F')
  doc.setTextColor(...white)
  doc.setFont('helvetica','bold')
  doc.setFontSize(9)
  doc.text('Balance Due', boxX+5, sy+7)
  doc.setFontSize(11)
  doc.text(`Rs.${balance.toLocaleString()}`, boxX+boxW-5, sy+7, {align:'right'})

  // ── REFUND / DAMAGE NOTE ─────────────────
  const noteY = sy + 15
  const noteW = W - ML - MR

  if (deposit>0 && c.returnDate) {
    doc.setFillColor(220,252,231)
    doc.roundedRect(ML, noteY, noteW, 34, 2, 2, 'F')
    doc.setFillColor(...green)
    doc.roundedRect(ML, noteY, noteW, 8, 2, 2, 'F')
    doc.rect(ML, noteY+5, noteW, 3, 'F')
    doc.setTextColor(...white)
    doc.setFont('helvetica','bold')
    doc.setFontSize(10)
    doc.text('DEPOSIT REFUND POLICY', ML+5, noteY+6)
    doc.setFont('helvetica','bold')
    doc.setFontSize(9)
    doc.setTextColor(22,101,52)
    doc.text(`Return by ${c.returnDate} — security deposit of Rs.${deposit.toLocaleString()} is fully refundable.`, ML+5, noteY+16)
    doc.setFont('helvetica','normal')
    doc.text(`Upon successful pickup of all items, Rs.${deposit.toLocaleString()} will be refunded in full.`, ML+5, noteY+23)
    doc.setFont('helvetica','bold')
    doc.setTextColor(...red)
    doc.text('* Any damage or loss of rented items will be charged and deducted from the security deposit.', ML+5, noteY+30)
  } else {
    doc.setFillColor(254,226,226)
    doc.roundedRect(ML, noteY, noteW, 12, 2, 2, 'F')
    doc.setFont('helvetica','bold')
    doc.setFontSize(9)
    doc.setTextColor(...red)
    doc.text('* Any damage or loss of rented items will be charged separately.', ML+5, noteY+8)
  }

  // ── FOOTER ───────────────────────────────
  doc.setFillColor(...navy)
  doc.rect(0, H-13, W, 13, 'F')
  doc.setFillColor(...indigo)
  doc.rect(0, H-13, 3, 13, 'F')
  doc.setTextColor(180,190,220)
  doc.setFont('helvetica','normal')
  doc.setFontSize(7.5)
  doc.text('Thank you for choosing Shubh Labh Event! We look forward to making your event truly special.', W/2, H-7.5, {align:'center'})
  doc.setFontSize(7)
  doc.setTextColor(...muted)
  doc.text('instagram.com/shubh.labhevent  |  shubh.labhevent@gmail.com  |  +91 95124 12800', W/2, H-3, {align:'center'})

  doc.save(`Invoice_${order.id}.pdf`)
}

export function sendInvoiceWhatsApp(order) {
  const c = order.customer || {}
  let phone = (c.phone || '').replace(/[\s\-().+]/g, '')
  if (!phone) { alert('No phone number found for this customer.'); return }
  if (phone.startsWith('0')) phone = '91' + phone.slice(1)
  if (!phone.startsWith('91')) phone = '91' + phone

  const total   = order.total   || 0
  const deposit = order.deposit || 0
  const discount= order.discount|| 0
  const balance = Math.abs(order.balance ?? (total - discount))

  const msg = [
    `Hello ${c.name || 'there'}! 👋`,
    ``,
    `Thank you for choosing *Shubh Labh Event*! 🌸`,
    ``,
    `*Order Details:*`,
    `📋 Order ID: ${order.id}`,
    `📅 Event Date: ${c.date || '-'}`,
    `📦 Pickup: ${c.pickupDate || '-'}`,
    `🔄 Return: ${c.returnDate || '-'}`,
    c.babyGender ? `👶 Baby: ${c.babyGender}` : null,
    ``,
    `*Items Ordered:*`,
    ...(order.items||[]).map(i=>`  • ${i.name} ×${i.qty} — ${i.price}`),
    ``,
    `💰 Product Amount: Rs.${total.toLocaleString()}`,
    ...(discount>0?[`🏷️ Discount: - Rs.${discount.toLocaleString()}`]:[]),
    ...(deposit>0?[`🔒 Security Deposit: Rs.${deposit.toLocaleString()}`]:[]),
    `💳 Balance Due: Rs.${balance.toLocaleString()}`,
    ``,
    `📍 Venue: ${c.address || '-'}`,
    ``,
    `For queries: +91 95124 12800 / +91 84888 28839`,
    `Thank you! 🙏`,
  ].filter(l => l !== null && l !== undefined).join('\n')

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
  const a = document.createElement('a')
  a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'
  document.body.appendChild(a); a.click(); document.body.removeChild(a)
}
