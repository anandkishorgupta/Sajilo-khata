// src/pages/dashboard/data.ts

export const revenue = [
    { d: "Mon", v: 18400 }, { d: "Tue", v: 22100 }, { d: "Wed", v: 19800 },
    { d: "Thu", v: 26700 }, { d: "Fri", v: 31200 }, { d: "Sat", v: 38500 },
    { d: "Sun", v: 24580 },
];

export const monthly = Array.from({ length: 12 }, (_, i) => ({
    m: ["Baisakh", "Jestha", "Ashar", "Shrawan", "Bhadra", "Ashoj", "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"][i],
    v: 80000 + Math.round(Math.sin(i / 1.5) * 40000 + i * 6000),
}));

export const payments = [
    { name: "QR / Wallet", v: 62, c: "var(--color-primary)" },
    { name: "Cash", v: 28, c: "var(--color-accent)" },
    { name: "Credit", v: 10, c: "var(--color-warning)" },
];

export const expenses = [
    { name: "Restock", v: 14200 },
    { name: "Rent", v: 8000 },
    { name: "Salary", v: 6500 },
    { name: "Electricity", v: 1800 },
    { name: "Other", v: 1200 },
];

export const txns = [
    { id: "INV-2841", c: "Rajesh Shrestha", a: 2480, m: "QR", t: "2 min ago", s: "paid" },
    { id: "INV-2840", c: "Sita Maharjan", a: 1240, m: "Cash", t: "8 min ago", s: "paid" },
    { id: "INV-2839", c: "Anita Yadav", a: 6820, m: "Credit", t: "22 min ago", s: "due" },
    { id: "INV-2838", c: "Bikash Thapa", a: 380, m: "QR", t: "41 min ago", s: "paid" },
    { id: "INV-2837", c: "Walk-in", a: 950, m: "Cash", t: "1 hr ago", s: "paid" },
];

export const topProducts = [
    { name: "Wai Wai (Chicken)", sold: 142, rev: 2840 },
    { name: "Coca-Cola 500ml", sold: 96, rev: 6720 },
    { name: "Surya Daal 1kg", sold: 54, rev: 9180 },
    { name: "Mustard Oil 1L", sold: 38, rev: 8740 },
    { name: "Lay's Magic Masala", sold: 71, rev: 1775 },
];

export const lowStock = [
    { name: "Surya Daal 1kg", left: 4, min: 10 },
    { name: "Mustard Oil 1L", left: 2, min: 8 },
    { name: "Wheat Flour 5kg", left: 1, min: 5 },
];