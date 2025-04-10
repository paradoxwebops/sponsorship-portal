"use client";

import React from "react";

interface PageTemplateProps {
    title: string;
    description?: string;
    children?: React.ReactNode;
}

export function PageTemplate({
                                 title,
                                 description,
                                 children,
                             }: PageTemplateProps) {
    return (
        <div className="flex h-screen overflow-hidden w-full">
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto p-6 bg-background/95">
                    <div className="space-y-6">
                        {/*<div>*/}
                        {/*    <h1 className="text-3xl font-bold tracking-tight">{title}</h1>*/}
                        {/*    {description && (*/}
                        {/*        <p className="text-muted-foreground">{description}</p>*/}
                        {/*    )}*/}
                        {/*</div>*/}
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
