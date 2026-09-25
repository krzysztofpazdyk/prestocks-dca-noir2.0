"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { HOLDINGS, type Holding } from "@/lib/mock-data";
import { useI18n } from "@/lib/i18n";

type Props = {
  holdings?: Holding[];
};

export function HoldingsPie({ holdings = HOLDINGS }: Props) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
      <div className="relative h-56 w-full max-w-[240px] mx-auto">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={holdings}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={88}
              paddingAngle={2}
              stroke="#0c0e12"
              strokeWidth={2}
            >
              {holdings.map((h) => (
                <Cell key={h.name} fill={h.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#141820",
                border: "1px solid #1e2633",
                borderRadius: 6,
                fontSize: 12,
                color: "#e8eef5",
              }}
              formatter={(value) => [`${value}%`, t("holdings.share")]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] uppercase tracking-widest text-[#8b95a8]">
            {t("holdings.allocation")}
          </span>
          <span className="mono-num text-lg text-[#2dd4bf]">100%</span>
        </div>
      </div>
      <ul className="grid flex-1 grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        {holdings.map((h) => (
          <li key={h.name} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-[#c5cedb]">
              <span
                className="h-2 w-2 rounded-sm"
                style={{ background: h.color, boxShadow: `0 0 6px ${h.color}88` }}
              />
              {h.name}
            </span>
            <span className="mono-num text-[#8b95a8]">{h.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
