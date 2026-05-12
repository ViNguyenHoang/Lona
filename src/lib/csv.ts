// RFC-4180-ish CSV utilities. Handles quotes, escapes, CRLF, UTF-8 BOM.

const BOM = '﻿'

export function serializeCsv(rows: string[][]): string {
  return BOM + rows.map((r) => r.map(escapeCell).join(',')).join('\r\n')
}

function escapeCell(value: string): string {
  if (value === '' || value == null) return ''
  const needsQuote = /[",\r\n]/.test(value)
  const escaped = value.replace(/"/g, '""')
  return needsQuote ? `"${escaped}"` : escaped
}

export function parseCsv(text: string): string[][] {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1)
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        cell += ch
      }
      continue
    }

    if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      row.push(cell)
      cell = ''
    } else if (ch === '\n' || ch === '\r') {
      row.push(cell)
      cell = ''
      // skip the trailing \n in CRLF
      if (ch === '\r' && text[i + 1] === '\n') i++
      // ignore fully-empty trailing lines
      if (row.length === 1 && row[0] === '') {
        row = []
      } else {
        rows.push(row)
        row = []
      }
    } else {
      cell += ch
    }
  }

  if (cell !== '' || row.length > 0) {
    row.push(cell)
    rows.push(row)
  }

  return rows
}
