// src/pages/dashboard/components/PaymentMethods.tsx
import { QrCode, Banknote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { payments } from "./data";

export default function PaymentMethods() {
  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Payment Methods</CardTitle>
        <CardDescription>Today's collection split</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={payments} dataKey="v" innerRadius={50} outerRadius={75} paddingAngle={3}>
                {payments.map((p, i) => <Cell key={i} fill={p.c} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 space-y-2">
          {payments.map((p) => (
            <div key={p.name} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.c }} />
                {p.name === "QR / Wallet" && <QrCode className="h-3.5 w-3.5" />}
                {p.name === "Cash"        && <Banknote className="h-3.5 w-3.5" />}
                {p.name}
              </span>
              <span className="font-semibold">{p.v}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}