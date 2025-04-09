'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {summaryMetrics} from "@/app/utils/mockData";

const data = [
  {
    name: "Total",
    Cash: summaryMetrics.cashSponsorship,
    "In-kind": summaryMetrics.inKindSponsorship,
    Expenses: summaryMetrics.totalExpenses,
  },
];

const financialData = [
  {
    name: "TechCorp",
    Revenue: 125000,
    Expenses: 52800,
    Profit: 125000 - 52800,
  },
  {
    name: "Global Media",
    Revenue: 85000,
    Expenses: 34500,
    Profit: 85000 - 34500,
  },
  {
    name: "Infinite Energy",
    Revenue: 200000,
    Expenses: 88700,
    Profit: 200000 - 88700,
  },
  {
    name: "Metro Bank",
    Revenue: 150000,
    Expenses: 63200,
    Profit: 150000 - 63200,
  },
  {
    name: "Stellar",
    Revenue: 60000,
    Expenses: 26900,
    Profit: 60000 - 26900,
  },
];

export function FinancialMetrics() {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Financial Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={financialData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis
                tickFormatter={(value) =>
                  new Intl.NumberFormat("en-US", {
                    notation: "compact",
                    compactDisplay: "short",
                  }).format(value)
                }
              />
              <Tooltip
                formatter={(value) =>
                  new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 0,
                  }).format(Number(value))
                }
              />
              <Legend />
              <Bar dataKey="Revenue" fill="#8c52e5" name="Revenue" />
              <Bar dataKey="Expenses" fill="#E5DEFF" name="Expenses" />
              <Bar dataKey="Profit" fill="#6730aa" name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
