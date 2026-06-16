import type { ChartData } from "@/api/ai-assistant"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"

const COLORS = [
  "var(--color-primary)",
  "var(--color-accent)",
  "var(--color-warning)",
  "hsl(200 70% 50%)",
  "hsl(280 60% 55%)",
  "hsl(340 65% 50%)",
  "hsl(160 60% 45%)",
  "hsl(30 80% 55%)",
]

export default function AiChartRenderer({ chart }: { chart: ChartData }) {
  const xKey = chart.xKey || chart.nameKey || "name"
  const yKey = chart.yKey || chart.valueKey || "value"

  const tooltipStyle = {
    borderRadius: 12,
    border: "1px solid var(--color-border)",
    background: "var(--color-card)",
    fontSize: 12,
  }

  if (chart.type === "pie") {
    return (
      <div className="mt-3">
        <p className="mb-2 text-xs font-semibold">{chart.title}</p>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chart.data}
                dataKey={yKey}
                nameKey={xKey}
                innerRadius={45}
                outerRadius={75}
                paddingAngle={3}
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
                labelLine={false}
                fontSize={10}
              >
                {chart.data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {chart.data.map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[10px]">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span>{String(item[xKey])}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (chart.type === "line") {
    return (
      <div className="mt-3">
        <p className="mb-2 text-xs font-semibold">{chart.title}</p>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chart.data}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
                vertical={false}
              />
              <XAxis
                dataKey={xKey}
                tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                }
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey={yKey}
                stroke="var(--color-primary)"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "var(--color-primary)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  // Default: bar chart
  return (
    <div className="mt-3">
      <p className="mb-2 text-xs font-semibold">{chart.title}</p>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chart.data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
              vertical={false}
            />
            <XAxis
              dataKey={xKey}
              tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) =>
                v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
              }
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar
              dataKey={yKey}
              fill="var(--color-primary)"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
