// 'use client';
//
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Pie, PieChart, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
//
// export function DeliverableStatus() {
//     const statusCounts = deliverables.reduce((acc, deliverable) => {
//         if (!acc[deliverable.status]) {
//             acc[deliverable.status] = 0;
//         }
//         acc[deliverable.status]++;
//         return acc;
//     }, {} as Record<string, number>);
//
//     const data = Object.entries(statusCounts).map(([status, count]) => ({
//         name: status.replace('_', ' '),
//         value: count,
//     }));
//
//     const COLORS = {
//         completed: "#4ade80",
//         in_progress: "#a78bfa",
//         pending: "#94a3b8",
//         overdue: "#f87171",
//     };
//
//     return (
//         <Card>
//             <CardHeader>
//                 <CardTitle>Deliverable Status</CardTitle>
//             </CardHeader>
//             <CardContent>
//                 <div className="h-[300px] flex justify-center">
//                     <ResponsiveContainer width="100%" height="100%">
//                         <PieChart>
//                             <Pie
//                                 data={data}
//                                 cx="50%"
//                                 cy="50%"
//                                 labelLine={false}
//                                 outerRadius={80}
//                                 fill="#8884d8"
//                                 dataKey="value"
//                                 label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                             >
//                                 {data.map((entry, index) => (
//                                     <Cell
//                                         key={`cell-${index}`}
//                                         fill={COLORS[entry.name.replace(' ', '_') as keyof typeof COLORS] || "#e5e7eb"}
//                                     />
//                                 ))}
//                             </Pie>
//                             <Tooltip
//                                 formatter={(value) => [`${value} deliverables`, ""]}
//                                 labelFormatter={(label) => `Status: ${label}`}
//                             />
//                             <Legend />
//                         </PieChart>
//                     </ResponsiveContainer>
//                 </div>
//             </CardContent>
//         </Card>
//     );
// }
