import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RoomAnalytics } from "../../types";
import { formatCurrency } from "../../utils/format";
import { Panel } from "../ui/Panel";

const palette = ["#10b981", "#2563eb", "#f97316", "#db2777", "#9333ea", "#14b8a6"];

type AnalyticsChartsProps = {
  analytics: RoomAnalytics;
};

export function AnalyticsCharts({ analytics }: AnalyticsChartsProps) {
  const userData = analytics.perUser.map((user) => ({ name: user.name.split(" ")[0], paid: Math.round(user.paid) }));
  const tagData = analytics.perTag.map((tag) => ({ name: tag.tagName, value: Math.round(tag.total) }));

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Panel>
        <h3 className="text-base font-bold text-slate-950 dark:text-white">Category-wise expenses</h3>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={tagData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={3}>
                {tagData.map((entry, index) => (
                  <Cell key={entry.name} fill={palette[index % palette.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel>
        <h3 className="text-base font-bold text-slate-950 dark:text-white">User-wise spending</h3>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={userData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `₹${Number(value) / 1000}k`} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="paid" radius={[6, 6, 0, 0]} fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel className="xl:col-span-2">
        <h3 className="text-base font-bold text-slate-950 dark:text-white">Monthly trend</h3>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.monthly}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `₹${Number(value) / 1000}k`} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>
  );
}
