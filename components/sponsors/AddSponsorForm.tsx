"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PlusCircle, MinusCircle, FileText } from "lucide-react";
import { toast } from "sonner";
import {FilePreviewDialog} from "@/components/shared/FilePreviewDialog";
import {Sponsor} from "@/index"; // your existing interface

const formSchema = z.object({
    name: z.string().min(2),
    legalName: z.string().min(2),
    sponsorType: z.enum(["cash", "inKind", "hybrid"]),
    cashValue: z.number().optional(),
    inKindValue: z.number().optional(),
    level: z.string(),
    priority: z.enum(["low", "mid", "high"]),
});

export default function AddOrEditSponsorForm({
                                                 onSuccess,
                                                 sponsor,
                                             }: {
    onSuccess: () => void;
    sponsor?: Partial<Sponsor> & { id?: string };
}) {
    const isEditMode = !!sponsor;

    const [mou, setMou] = useState<File | null>(null);
    const [items, setItems] = useState<Sponsor["inKindItems"]>([]);
    const [events, setEvents] = useState<Sponsor["events"]>([]);

    const [previewOpen, setPreviewOpen] = useState(false);


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: sponsor?.name ?? "",
            legalName: sponsor?.legalName ?? "",
            sponsorType: sponsor?.sponsorType ?? "cash",
            cashValue: sponsor?.cashValue ?? 0,
            inKindValue: sponsor?.inKindValue ?? 0,
            level: sponsor?.level ?? "",
            priority: sponsor?.priority ?? "mid",
        },
    });

    useEffect(() => {
        if (sponsor) {
            setItems(sponsor.inKindItems || []);
            setEvents(sponsor.events || []);
        }
    }, [sponsor]);

    const sponsorType = form.watch("sponsorType");

    const handleAddItem = () => setItems([...items, { itemName: "", units: 0, valuePerUnit: 0, totalValue: 0 }]);
    const handleUpdateItem = (index: number, field: string, value: string | number) => {
        const newItems = [...items];
        newItems[index] = {
            ...newItems[index],
            [field]: value,
            totalValue:
                field === "units" || field === "valuePerUnit"
                    ? (field === "units" ? Number(value) : newItems[index].units) *
                    (field === "valuePerUnit" ? Number(value) : newItems[index].valuePerUnit)
                    : newItems[index].totalValue,
        };
        setItems(newItems);
    };
    const handleRemoveItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handleAddEvent = () => setEvents([...events, { eventName: "", associationType: "powered", departmentType: "Tech" }]);
    const handleUpdateEvent = (index: number, field: string, value: string) => {
        const newEvents = [...events];
        newEvents[index] = { ...newEvents[index], [field]: value };
        setEvents(newEvents);
    };
    const handleRemoveEvent = (index: number) => {
        const newEvents = [...events];
        newEvents.splice(index, 1);
        setEvents(newEvents);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setMou(file);
    };

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        try {
            const totalInKindValue = items.reduce((sum, item) => sum + item.totalValue, 0);
            const finalData = {
                ...data,
                inKindValue: totalInKindValue,
                inKindItems: items,
                events: events,
            };

            const formData = new FormData();
            formData.append("data", JSON.stringify(finalData));
            if (mou) formData.append("mou", mou);

            const res = await fetch(
                sponsor?.id ? `/api/sponsors/${sponsor.id}` : `/api/sponsors`,
                {
                    method: sponsor?.id ? "PATCH" : "POST",
                    body: formData,
                }
            );

            const result = await res.json();

            if (result.success) {
                toast.success(`Sponsor ${isEditMode ? "updated" : "added"} successfully!`);
                onSuccess();
            } else {
                toast.error(result.error || "Something went wrong");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit sponsors");
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Render the Tabs and each tab's content as-is from the original */}
                {/* Use the same layout and component structure as React */}
                {/* The code was already compatible with Next.js client components */}
                        <Tabs defaultValue="details" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="details">Sponsor Details</TabsTrigger>
                                <TabsTrigger value="financial">Financial Details</TabsTrigger>
                                <TabsTrigger value="events">Associated Events</TabsTrigger>
                                <TabsTrigger value="documents">Documents</TabsTrigger>
                            </TabsList>

                            <TabsContent value="details" className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Sponsor Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="TechCorp Inc." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="legalName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Legal Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="TechCorp Incorporated" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="priority"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel>Priority</FormLabel>
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    className="flex space-x-4"
                                                >
                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="low" />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">Low</FormLabel>
                                                    </FormItem>
                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="mid" />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">Mid</FormLabel>
                                                    </FormItem>
                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="high" />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">High</FormLabel>
                                                    </FormItem>
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="level"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Sponsor Level</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select level" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="platinum">Platinum</SelectItem>
                                                    <SelectItem value="gold">Gold</SelectItem>
                                                    <SelectItem value="silver">Silver</SelectItem>
                                                    <SelectItem value="bronze">Bronze</SelectItem>
                                                    <SelectItem value="partner">Partner</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TabsContent>

                            <TabsContent value="financial" className="space-y-4 py-4">
                                <FormField
                                    control={form.control}
                                    name="sponsorType"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel>Sponsorship Type</FormLabel>
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    className="flex space-x-4"
                                                >
                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="cash" />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">Cash</FormLabel>
                                                    </FormItem>
                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="inKind" />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">In-Kind</FormLabel>
                                                    </FormItem>
                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="hybrid" />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">Hybrid</FormLabel>
                                                    </FormItem>
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {(sponsorType === "cash" || sponsorType === "hybrid") && (
                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="cashValue"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Cash Value (₹)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            placeholder="10000"
                                                            {...field}
                                                            onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}

                                {(sponsorType === "inKind" || sponsorType === "hybrid") && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <Label>In-Kind Items</Label>
                                            <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                                                <PlusCircle className="h-4 w-4 mr-2" /> Add Item
                                            </Button>
                                        </div>

                                        {items.length > 0 ? (
                                            <div className="space-y-4">
                                                {items.map((item, index) => (
                                                    <div key={index} className="grid grid-cols-5 gap-4 items-end border p-4 rounded-lg">
                                                        <div className="col-span-2">
                                                            <Label htmlFor={`item-${index}-name`}>Item</Label>
                                                            <Input
                                                                id={`item-${index}-name`}
                                                                value={item.itemName}
                                                                onChange={(e) => handleUpdateItem(index, "itemName", e.target.value)}
                                                                placeholder="Item name"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label htmlFor={`item-${index}-units`}>Units</Label>
                                                            <Input
                                                                id={`item-${index}-units`}
                                                                type="number"
                                                                value={item.units}
                                                                onChange={(e) => handleUpdateItem(index, "units", e.target.valueAsNumber)}
                                                                placeholder="Units"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label htmlFor={`item-${index}-value`}>Value per Unit (₹)</Label>
                                                            <Input
                                                                id={`item-${index}-value`}
                                                                type="number"
                                                                value={item.valuePerUnit}
                                                                onChange={(e) => handleUpdateItem(index, "valuePerUnit", e.target.valueAsNumber)}
                                                                placeholder="Value"
                                                            />
                                                        </div>
                                                        <div className="flex items-end space-x-2">
                                                            <div className="flex-1">
                                                                <Label>Total Value</Label>
                                                                <Input
                                                                    value={`₹${item.totalValue.toFixed(2)}`}
                                                                    readOnly
                                                                    className="bg-muted"
                                                                />
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleRemoveItem(index)}
                                                                className="h-10 w-10"
                                                            >
                                                                <MinusCircle className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}

                                                <div className="flex justify-end">
                                                    <div className="w-1/3">
                                                        <Label>Total In-Kind Value</Label>
                                                        <Input
                                                            value={`₹${items.reduce((sum, item) => sum + item.totalValue, 0).toFixed(2)}`}
                                                            readOnly
                                                            className="bg-muted font-bold"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 border rounded-lg bg-muted/30">
                                                <p>No in-kind items added yet.</p>
                                                <p className="text-sm text-muted-foreground">Click "Add Item" to add in-kind contributions.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </TabsContent>
                            <TabsContent value="events" className="space-y-4 py-4">
                                <div className="flex items-center justify-between mb-2">
                                    <Label>Associated Events</Label>
                                    <Button type="button" variant="outline" size="sm" onClick={handleAddEvent}>
                                        <PlusCircle className="h-4 w-4 mr-2" /> Add Event
                                    </Button>
                                </div>

                                {events.length > 0 ? (
                                    <div className="space-y-4">
                                        {events.map((event, index) => (
                                            <div key={index} className="grid grid-cols-4 gap-4 items-end border p-4 rounded-lg">
                                                {/* Event Name */}
                                                <div className="col-span-1">
                                                    <Label htmlFor={`event-${index}-name`}>Event Name</Label>
                                                    <Input
                                                        id={`event-${index}-name`}
                                                        value={event.eventName}
                                                        onChange={(e) => handleUpdateEvent(index, "eventName", e.target.value)}
                                                        placeholder="Event name"
                                                    />
                                                </div>

                                                {/* Association Type */}
                                                <div className="col-span-1">
                                                    <Label htmlFor={`event-${index}-associationType`}>Association Type</Label>
                                                    <Select
                                                        value={event.associationType}
                                                        onValueChange={(value) => handleUpdateEvent(index, "associationType", value)}
                                                    >
                                                        <SelectTrigger id={`event-${index}-associationType`}>
                                                            <SelectValue placeholder="Select type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="presents">Presents</SelectItem>
                                                            <SelectItem value="coPowered">Co-Powered</SelectItem>
                                                            <SelectItem value="powered">Powered</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {/* Department Type */}
                                                <div className="col-span-1">
                                                    <Label htmlFor={`event-${index}-departmentType`}>Department Type</Label>
                                                    <Select
                                                        value={event.departmentType}
                                                        onValueChange={(value) => handleUpdateEvent(index, "departmentType", value)}
                                                    >
                                                        <SelectTrigger id={`event-${index}-departmentType`}>
                                                            <SelectValue placeholder="Select department" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Tech">Tech</SelectItem>
                                                            <SelectItem value="Sports">Sports</SelectItem>
                                                            <SelectItem value="Culturals">Culturals</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {/* Delete Button */}
                                                <div className="flex justify-end">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleRemoveEvent(index)}
                                                        className="h-10 w-10"
                                                    >
                                                        <MinusCircle className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 border rounded-lg bg-muted/30">
                                        <p>No events associated yet.</p>
                                        <p className="text-sm text-muted-foreground">Click "Add Event" to associate events with this sponsor.</p>
                                    </div>
                                )}
                            </TabsContent>
                            <TabsContent value="documents" className="space-y-4 py-4">
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="mou-upload">MOU Document (PDF)</Label>
                                        <div className="mt-2 flex items-center gap-4">
                                            <Input
                                                id="mou-upload"
                                                type="file"
                                                accept=".pdf"
                                                onChange={handleFileChange}
                                                className="flex-1"
                                            />
                                            {mou && (
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <FileText className="h-4 w-4" />
                                                    <span>{mou.name}</span>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Upload the signed Memorandum of Understanding (MOU) document.
                                        </p>
                                        {sponsor?.docUrl && !mou && (
                                            <>
                                                <Button variant="link"
                                                        type="button"
                                                        onClick={() => setPreviewOpen(true)}
                                                        className="text-blue-600 p-0 text-sm">
                                                    View File
                                                </Button>
                                                <FilePreviewDialog
                                                    filePath={sponsor?.docUrl || ""}
                                                    open={previewOpen}
                                                    onClose={() => setPreviewOpen(false)}
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>

                        <div className="flex justify-end space-x-2 pt-4 border-t">
                            <Button type="button" variant="outline" onClick={onSuccess}>
                                Cancel
                            </Button>
                            <Button type="submit">{isEditMode ? "Update Sponsor" : "Add Sponsor"}</Button>
                        </div>
            </form>
        </Form>
    );
}
