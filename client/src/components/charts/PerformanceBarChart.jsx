import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const PerformanceBarChart = ({ data, xKey, barKey, color = "#0ea5e9" }) => (
  <div className="h-80">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.25} />
        <XAxis dataKey={xKey} stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip />
        <Bar dataKey={barKey} fill={color} radius={[12, 12, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default PerformanceBarChart;
