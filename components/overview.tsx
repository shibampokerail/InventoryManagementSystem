"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

// Use static or pre-defined data to avoid hydration mismatches
const data = [
  { name: "Jan", total: 2000 },
  { name: "Feb", total: 3000 },
  { name: "Mar", total: 2500 },
  { name: "Apr", total: 4000 },
  { name: "May", total: 3500 },
  { name: "Jun", total: 4500 },
  { name: "Jul", total: 3000 },
  { name: "Aug", total: 4000 },
  { name: "Sep", total: 3200 },
  { name: "Oct", total: 2800 },
  { name: "Nov", total: 3600 },
  { name: "Dec", total: 4100 },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Bar dataKey="total" fill="#adfa1d" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}