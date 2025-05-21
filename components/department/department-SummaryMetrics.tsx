// 'use client';
//
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { DollarSign, Users, CheckCircle, BarChart, TrendingUp, Gift, Wallet } from "lucide-react";
// import { cn } from "@/lib/utils";
//
// interface MetricCardProps {
//     title: string;
//     value: string | number;
//     icon: React.ElementType;
//     description?: string;
//     trend?: {
//         value: number;
//         isPositive: boolean;
//     };
//     className?: string;
// }
//
// function MetricCard({ title, value, icon: Icon, description, trend, className }: MetricCardProps) {
//     return (
//         <Card className={cn("", className)}>
//             <CardHeader className="flex flex-row items-center justify-between pb-2">
//                 <CardTitle className="text-sm font-medium text-muted-foreground">
//                     {title}
//                 </CardTitle>
//                 <Icon className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//                 <div className="text-2xl font-bold">{value}</div>
//                 {description && (
//                     <p className="text-xs text-muted-foreground mt-1">
//                         {description}
//                     </p>
//                 )}
//                 {trend && (
//                     <div className="flex items-center mt-1">
//                         <TrendingUp
//                             className={cn(
//                                 "h-3 w-3 mr-1",
//                                 trend.isPositive ? "text-green-500" : "text-red-500"
//                             )}
//                         />
//                         <span
//                             className={cn(
//                                 "text-xs",
//                                 trend.isPositive ? "text-green-500" : "text-red-500"
//                             )}
//                         >
//               {trend.isPositive ? "+" : "-"}
//                             {trend.value}% from last month
//             </span>
//                     </div>
//                 )}
//             </CardContent>
//         </Card>
//     );
// }
//
// interface SummaryMetricsProps {
//     data: SummaryMetricsType;
//     className?: string;
// }
//
// export function DepartmentSummaryMetrics({ data, className }: SummaryMetricsProps) {
//     return (
//         <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
//             <MetricCard
//                 title="Total Sponsorship"
//                 value={`₹${(data.totalSponsorship).toLocaleString()}`}
//                 icon={DollarSign}
//                 description="Total value of all sponsorships"
//                 trend={{ value: 12, isPositive: true }}
//             />
//             <MetricCard
//                 title="Cash vs. In-kind"
//                 value={`${Math.round((data.cashSponsorship / data.totalSponsorship) * 100)}% / ${Math.round((data.inKindSponsorship / data.totalSponsorship) * 100)}%`}
//                 icon={Wallet}
//                 description={`₹${data.cashSponsorship.toLocaleString()} cash | ₹${data.inKindSponsorship.toLocaleString()} in-kind`}
//             />
//             <MetricCard
//                 title="Profit Margin"
//                 value={`${data.overallProfitMargin.toFixed(1)}%`}
//                 icon={TrendingUp}
//                 description={`₹${(data.totalSponsorship - data.totalExpenses).toLocaleString()} profit`}
//                 trend={{ value: 3.5, isPositive: true }}
//             />
//             <MetricCard
//                 title="Deliverable Completion"
//                 value={`${(data.deliverableCompletionRate * 100).toFixed(0)}%`}
//                 icon={CheckCircle}
//                 description="Overall completion rate"
//                 trend={{ value: 5, isPositive: true }}
//             />
//         </div>
//     );
// }
