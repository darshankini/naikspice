// Builds a 58mm receipt as raw ESC/POS bytes for a thermal printer.
// 58mm printers fit 32 characters per line in the default font.
import { lineTotal } from '../components/Layout';

export const SHOP = {
  name: 'RESTRO POS',
  tagline: 'Small Restaurant',
};

const WIDTH = 32;
const ESC = 0x1b;
const GS = 0x1d;

const CMD = {
  init: [ESC, 0x40],
  alignLeft: [ESC, 0x61, 0],
  alignCenter: [ESC, 0x61, 1],
  boldOn: [ESC, 0x45, 1],
  boldOff: [ESC, 0x45, 0],
  doubleOn: [GS, 0x21, 0x11],  // double width + height
  doubleOff: [GS, 0x21, 0x00],
  feed: (n) => [ESC, 0x64, n],
  cut: [GS, 0x56, 0x42, 0],     // partial cut (ignored by printers without a cutter)
};

// Printers only know ASCII in their default code page; ₹ and other symbols become "Rs." / "?".
const ascii = (s) => String(s ?? '').replace(/₹/g, 'Rs.').replace(/[^\x20-\x7e]/g, '?');
const amt = (n) => Number(n).toFixed(2);

// Left text and right text on one line, padded to the full width.
function row(left, right) {
  left = ascii(left);
  right = ascii(right);
  const space = WIDTH - right.length;
  if (left.length > space - 1) return [left, ' '.repeat(space) + right]; // wrap long names
  return [left + ' '.repeat(space - left.length) + right];
}

const RULE = '-'.repeat(WIDTH);

export function buildReceipt({ order, items, customer }) {
  const out = [];
  const raw = (bytes) => out.push(...bytes);
  const line = (s = '') => out.push(...ascii(s).split('').map((c) => c.charCodeAt(0)), 0x0a);

  const total = items.reduce((s, i) => s + lineTotal(i.price, i.grams), 0);
  const when = new Date(order?.created_at || Date.now()).toLocaleString();

  raw(CMD.init);
  raw(CMD.alignCenter);
  raw(CMD.doubleOn); line(SHOP.name); raw(CMD.doubleOff);
  if (SHOP.tagline) line(SHOP.tagline);
  raw(CMD.alignLeft);
  line(RULE);
  line(`Order #: ${order?.id ?? '-'}`);
  line(when);

  if (customer && (customer.name || customer.mobile || customer.email)) {
    line(RULE);
    if (customer.name) line(`Name: ${customer.name}`);
    if (customer.mobile) line(`Mobile: ${customer.mobile}`);
    if (customer.email) line(`Email: ${customer.email}`);
  }

  line(RULE);
  for (const i of items) {
    line(i.name);
    row(`  ${i.grams}g x ${amt(i.price)}/kg`, amt(lineTotal(i.price, i.grams))).forEach((l) => line(l));
  }
  line(RULE);
  raw(CMD.boldOn);
  row('TOTAL', `Rs.${amt(total)}`).forEach((l) => line(l));
  raw(CMD.boldOff);
  line(RULE);
  raw(CMD.alignCenter);
  line('Thank you! Visit again');
  raw(CMD.feed(4));
  raw(CMD.cut);

  return new Uint8Array(out);
}
