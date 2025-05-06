'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Wallet, TrendingUp, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryResponse {
    totalValue: number;
    cashValue: number;
    inKindValue: number;
    cashPercentage: string;
    inKindPercentage: string;
    totalProfit: number;
    profitMargin: string;
    deliverableCompletionRate: string;
    profitChange: string;
    completionChange: string;
}

interface MetricCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    description?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
}

function MetricCard({ title, value, icon: Icon, description, trend, className }: MetricCardProps) {
    return (
        <Card className={cn("", className)}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && (
                    <p className="text-xs text-muted-foreground mt-1">
                        {description}
                    </p>
                )}
                {trend && (
                    <div className="flex items-center mt-1">
                        <TrendingUp
                            className={cn(
                                "h-3 w-3 mr-1",
                                trend.isPositive ? "text-green-500" : "text-red-500"
                            )}
                        />
                        <span
                            className={cn(
                                "text-xs",
                                trend.isPositive ? "text-green-500" : "text-red-500"
                            )}
                        >
                            {trend.isPositive ? '+' : '-'}
                            {Math.abs(trend.value)}% from last entry
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
interface Props {
    className?: string;
}
export function SummaryMetrics({ className }: Props) {
    const [data, setData] = useState<SummaryResponse | null>(null);

    useEffect(() => {
        async function fetchData() {
            const res = await fetch('/api/sponsors/summary');
            const json = await res.json();
            setData(json);
        }

        fetchData();
    }, []);

    if (!data) return <div>Loading...</div>;

    return (
        <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
            <MetricCard
                title="Total Sponsorship"
                value={`$${data.totalValue.toLocaleString()}`}
                icon={DollarSign}
                description="Total value of all sponsorships"
                trend={{ value: parseFloat(data.profitChange), isPositive: parseFloat(data.profitChange) >= 0 }}
            />
            <MetricCard
                title="Cash vs. In-kind"
                value={`${data.cashPercentage}% / ${data.inKindPercentage}%`}
                icon={Wallet}
                description={`$${data.cashValue.toLocaleString()} cash | $${data.inKindValue.toLocaleString()} in-kind`}
            />
            <MetricCard
                title="Profit Margin"
                value={`${data.profitMargin}%`}
                icon={TrendingUp}
                description={`$${data.totalProfit.toLocaleString()} profit`}
                trend={{ value: parseFloat(data.profitChange), isPositive: parseFloat(data.profitChange) >= 0 }}
            />
            <MetricCard
                title="Deliverable Completion"
                value={`${data.deliverableCompletionRate}%`}
                icon={CheckCircle}
                description="Overall completion rate"
                trend={{ value: parseFloat(data.completionChange), isPositive: parseFloat(data.completionChange) >= 0 }}
            />
        </div>
    );
}
