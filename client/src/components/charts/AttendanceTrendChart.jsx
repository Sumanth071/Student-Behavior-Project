import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const AttendanceTrendChart = ({ data }) => (
  <div className="h-80">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="attendanceFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.45} />
            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.25} />
        <XAxis dataKey="label" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="attendanceRate"
          stroke="#0891b2"
          strokeWidth={3}
          fill="url(#attendanceFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export default AttendanceTrendChart;
