"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormControl } from "@/components/ui/form";
import { FormField } from "@/components/ui/form";
import { FormItem } from "@/components/ui/form";
import { FormLabel } from "@/components/ui/form";
import { FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    RadioGroup,
    RadioGroupItem,
} from "@/components/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { sponsors } from "@/app/utils/mockData";
import { toast } from "sonner";
import { PlusCircle, MinusCircle, FileText } from "lucide-react";

const formSchema = z.object({
    name: z.string().min(2),
    legalName: z.string().min(2),
    cashValue: z.coerce.number().min(0),
    inKindValue: z.coerce.number().min(0),
    estimatedCost: z.coerce.number().min(0),
    actualCost: z.coerce.number().min(0).optional(),
    status: z.enum(["active", "pending", "completed"]),
    level: z.string(),
    priority: z.enum(["low", "mid", "high"]),
    notes: z.string().optional(),
    sponsorType: z.enum(["cash", "inKind", "hybrid"]),
    associatedEvents: z
        .array(
            z.object({
                eventName: z.string(),
                associationType: z.enum(["presents", "coPowered", "powered"]),
            })
        )
        .optional(),
    items: z
        .array(
            z.object({
                itemName: z.string(),
                units: z.number().positive(),
                valuePerUnit: z.number().positive(),
            })
        )
        .optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditSponsorForm({ sponsorId, onSuccess }: { sponsorId: number; onSuccess: () => void }) {
    const sponsor = sponsors.find((s) => s.id === sponsorId);
    const [mou, setMou] = useState<File | null>(null);
    const [items, setItems] = useState<{ itemName: string; units: number; valuePerUnit: number; totalValue: number }[]>([
        { itemName: "Sample Item", units: 10, valuePerUnit: 100, totalValue: 1000 },
    ]);
    const [events, setEvents] = useState<{ eventName: string; associationType: string }[]>([
        { eventName: "Main Event", associationType: "presents" },
    ]);

    if (!sponsor) return <div>Sponsor not found</div>;

    const determineSponsorType = () => {
        if (sponsor.cashValue > 0 && sponsor.inKindValue > 0) return "hybrid";
        else if (sponsor.cashValue > 0) return "cash";
        return "inKind";
    };

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: sponsor.name,
            legalName: sponsor.name + " LLC",
            cashValue: sponsor.cashValue,
            inKindValue: sponsor.inKindValue,
            estimatedCost: sponsor.estimatedCost,
            actualCost: sponsor.actualCost || undefined,
            status: sponsor.status as "active" | "pending" | "completed",
            notes: sponsor.notes || "",
            level: "platinum",
            priority: "high",
            sponsorType: determineSponsorType(),
        },
    });

    const sponsorType = form.watch("sponsorType");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setMou(file);
    };

    const onSubmit = (data: FormValues) => {
        console.log("Updating sponsors:", data);
        console.log("Items:", items);
        console.log("Events:", events);
        console.log("MOU:", mou);

        toast.success("Sponsor updated successfully", {
            description: `${data.name} has been updated.`,
        });
        onSuccess();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
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
                                            <Input placeholder="Company Name" {...field} />
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
                                            <Input placeholder="Legal Company Name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Additional notes about this sponsor..." {...field} />
                                    </FormControl>
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
                                            <FormLabel>Cash Value ($)</FormLabel>
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
                                                    <Label htmlFor={`item-${index}-value`}>Value per Unit ($)</Label>
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
                                                            value={`$${item.totalValue.toFixed(2)}`}
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
                                                    value={`$${items.reduce((sum, item) => sum + item.totalValue, 0).toFixed(2)}`}
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

                                <FormField
                                    control={form.control}
                                    name="inKindValue"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>In-Kind Value ($)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="5000"
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

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="estimatedCost"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estimated Cost ($)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="100"
                                                {...field}
                                                onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="actualCost"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Actual Cost ($) (Optional)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="100"
                                                {...field}
                                                onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                                                value={field.value || ''}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
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
                                    <div key={index} className="grid grid-cols-3 gap-4 items-end border p-4 rounded-lg">
                                        <div className="col-span-1">
                                            <Label htmlFor={`event-${index}-name`}>Event Name</Label>
                                            <Input
                                                id={`event-${index}-name`}
                                                value={event.eventName}
                                                onChange={(e) => handleUpdateEvent(index, "eventName", e.target.value)}
                                                placeholder="Event name"
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <Label htmlFor={`event-${index}-type`}>Association Type</Label>
                                            <Select
                                                value={event.associationType}
                                                onValueChange={(value) => handleUpdateEvent(index, "associationType", value)}
                                            >
                                                <SelectTrigger id={`event-${index}-type`}>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="presents">Presents</SelectItem>
                                                    <SelectItem value="coPowered">Co-Powered</SelectItem>
                                                    <SelectItem value="powered">Powered</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
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
                                    Upload a new MOU document if you need to update it.
                                </p>
                            </div>

                            <div className="mt-4">
                                <Label>Current Documents</Label>
                                <div className="border rounded-lg p-4 mt-2 bg-muted/30">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            <span>Current-MOU-{sponsor.name.replace(/\s+/g, '-')}.pdf</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm">Download</Button>
                                            <Button variant="destructive" size="sm">Delete</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onSuccess}>
                        Cancel
                    </Button>
                    <Button type="submit">Update Sponsor</Button>
                </div>
            </form>
        </Form>
    );
}
