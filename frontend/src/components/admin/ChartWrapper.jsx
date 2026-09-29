import {
  LineChart,
  Line,
  Area,
  AreaChart,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const ChartWrapper = ({ type = "line", data = [], config = {} }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-center text-gray-500 text-sm">
        No data available
      </div>
    );
  }

  // Dashboard color palette
  const colors = [
    "#8b5cf6", // violet
    "#3b82f6", // blue
    "#f59e0b", // orange
    "#22c55e", // green
  ];

  // Shared tooltip styling
  const tooltipStyle = {
    backgroundColor: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "12px",
  };

  return (
    <ResponsiveContainer width="100%" height={250}>
      {type === "area" ? (
        <AreaChart
          data={data}
          margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="name" fontSize={10} padding={{ left: 0, right: 0 }} />
          <YAxis domain={["auto", "auto"]} fontSize={10} width={10} />
          {/* <CartesianGrid strokeDasharray="3 3" /> */}
          <Tooltip contentStyle={{ color: "#52525b" }} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#f97316"
            fillOpacity={1}
            fill="url(#colorUv)"
          />
        </AreaChart>
      ) : type === "bar" ? (
        <BarChart
          data={data}
          margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
        >
          <CartesianGrid stroke="#f0f0f0" strokeWidth={0.2} vertical={false} />
          <XAxis
            dataKey={config.xKey || "name"}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
          />
          <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar
            dataKey={config.yKey || "value"}
            fill={config.color || colors[1]}
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      ) : type === "pie" ? (
        <PieChart margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <Tooltip contentStyle={tooltipStyle} />
          <Legend
            verticalAlign="middle"
            align="right"
            layout="vertical"
            iconType="circle"
          />
          <Pie
            data={data}
            dataKey={config.yKey || "value"}
            nameKey={config.xKey || "name"}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            strokeWidth={0.2}
            label
          >
            {data.map((_, index) => (
              <Cell
                key={index}
                fill={
                  config.colors
                    ? config.colors[index % config.colors.length]
                    : colors[index % colors.length]
                }
              />
            ))}
          </Pie>
        </PieChart>
      ) : (
        <p>Invalid chart type</p>
      )}
    </ResponsiveContainer>
  );
};

export default ChartWrapper;
