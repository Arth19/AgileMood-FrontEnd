"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

// Tipos para os dados dos gráficos
export interface EmotionChartData {
  name: string;
  value: number;
  color?: string;
}

export interface EmotionTimeSeriesData {
  date: string;
  [key: string]: string | number;
}

interface EmotionBarChartProps {
  data: EmotionChartData[];
  title?: string;
  height?: number;
}

interface EmotionPieChartProps {
  data: EmotionChartData[];
  title?: string;
  height?: number;
}

interface EmotionTimeSeriesChartProps {
  data: EmotionTimeSeriesData[];
  emotions: string[];
  colors: string[];
  title?: string;
  height?: number;
}

// Gráfico de barras para emoções
export function EmotionBarChart({ data, title, height = 300 }: EmotionBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] bg-gray-50 rounded-md">
        <p className="text-gray-500">Sem dados disponíveis para exibir</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-medium mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip 
            formatter={(value) => [`${value} ocorrências`, "Frequência"]}
            labelFormatter={(label) => `Emoção: ${label}`}
          />
          <Legend />
          <Bar
            dataKey="value"
            name="Frequência"
            fill="#8884d8"
            radius={[4, 4, 0, 0]}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || `#${Math.floor(Math.random()*16777215).toString(16)}`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Gráfico de pizza para emoções
export function EmotionPieChart({ data, title, height = 300 }: EmotionPieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] bg-gray-50 rounded-md">
        <p className="text-gray-500">Sem dados disponíveis para exibir</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-medium mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || `#${Math.floor(Math.random()*16777215).toString(16)}`} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`${value} ocorrências`, "Frequência"]}
            labelFormatter={(label) => `Emoção: ${label}`}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// Gráfico de linha para séries temporais de emoções
export function EmotionTimeSeriesChart({ 
  data, 
  emotions, 
  colors, 
  title, 
  height = 300 
}: EmotionTimeSeriesChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] bg-gray-50 rounded-md">
        <p className="text-gray-500">Sem dados disponíveis para exibir</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-medium mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          {emotions.map((emotion, index) => (
            <Line
              key={emotion}
              type="monotone"
              dataKey={emotion}
              stroke={colors[index % colors.length]}
              activeDot={{ r: 8 }}
              name={emotion}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 