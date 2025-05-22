// Final AddCostForm.tsx component (Styled with shadcn, no paymentType for food/accommodation)
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    RadioGroup, RadioGroupItem
} from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {Deliverable} from "@/index";

export const AddCostForm = ({ deliverable, refetchAction  }: { deliverable: Deliverable;  refetchAction: () => void  }) => {
    const form = useForm({
        defaultValues: {
            estimatedCost: deliverable.estimatedCost || 0,
            paymentType: deliverable.paymentType || '',
        }
    });


    const costType = deliverable.costType;

    const [number, setNumber] = useState(
        deliverable.numberOfPrintable !== undefined ? deliverable.numberOfPrintable : 0
    );

    const [size] = useState(
        deliverable.sizeOfPrintable !== undefined ? deliverable.sizeOfPrintable : ''
    );

    const [costPerUnit, setCostPerUnit] = useState(
        deliverable.costPerPrintable !== undefined ? deliverable.costPerPrintable : 0
    );
    const [accommodationList, setAccommodationList] = useState(
        deliverable.accommodations?.map(p => ({
            ...p,
            costPerPerson: p.costPerPerson ?? 0, // retain if present, default to 0
        })) || []
    );
    const [foodList, setFoodList] = useState(
        deliverable.food?.map(m => ({ ...m, costPerPerson: m.costPerPerson || 0 })) || []
    );

    const updateAccommodationCost = (index: number, value: number) => {
        const updated = [...accommodationList];
        updated[index].costPerPerson = value;
        setAccommodationList(updated);
    };

    const updateFoodCost = (index: number, value: number) => {
        const updated = [...foodList];
        updated[index].costPerPerson = value;
        setFoodList(updated);
    };

    const getTotal = () => {
        if (costType === 'posters' || costType === 'standee' || costType === 'banner') return number * costPerUnit;
        if (costType === 'accommodation') return accommodationList.reduce((acc, p) => acc + (p.costPerPerson ?? 0), 0);
        if (costType === 'food') return foodList.reduce((acc, m) => acc + m.numberOfPeople * m.costPerPerson, 0);
        return 0;
    };

    const handleSubmit = async () => {
        const payload = {
            deliverableId: deliverable.id,
            sponsorId: deliverable.sponsorId,
            costType,
            estimatedCost: getTotal(),
            costDetails: {
                ...(costType !== 'accommodation' && costType !== 'food' && {
                    numberOfPrintable: number,
                    sizeOfPrintable: size,
                    costPerPrintable: costPerUnit,
                }),
                ...(costType === 'accommodation' && { accommodations: accommodationList }),
                ...(costType === 'food' && { food: foodList }),
            }
        };

        try {
            const res = await fetch('/api/finance/add-cost', {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: { 'Content-Type': 'application/json' }
            });

            if (res.ok) {
                toast.success('Cost added successfully');
                refetchAction(); // ✅ Trigger refresh
                form.reset();
            } else {
                toast.error('Failed to submit cost');
            }
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong');
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {['posters', 'standee', 'banner'].includes(costType || '') && (
                    <div className="space-y-4 border rounded-lg p-4">
                        <h4 className="font-medium capitalize">{costType} Details</h4>
                        <div className="flex gap-2 mb-2">
                            <Badge variant="outline" className="text-sm px-3 py-1 rounded-full bg-muted text-muted-foreground">
                                {number} items
                            </Badge>
                            <Badge variant="outline" className="text-sm px-3 py-1 rounded-full bg-muted text-muted-foreground">
                                Size: {size}
                            </Badge>
                        </div>
                        <Input
                            type="number"
                            value={costPerUnit}
                            onChange={e => setCostPerUnit(parseInt(e.target.value) || 0)}
                            placeholder="Enter cost per unit"
                        />
                    </div>
                )}

                {costType === 'accommodation' && (
                    <div className="space-y-4 border rounded-lg p-4">
                        <h4 className="font-medium">Accommodation Details</h4>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Arrival</TableHead>
                                    <TableHead>Departure</TableHead>
                                    <TableHead>Cost</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {accommodationList.map((p, i) => (
                                    <TableRow key={i}>
                                        <TableCell>{p.personName}</TableCell>
                                        <TableCell>{String(p.arrivalDate)}</TableCell>
                                        <TableCell>{String(p.departureDate)}</TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                value={p.costPerPerson}
                                                onChange={e => updateAccommodationCost(i, Number(e.target.value))}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {costType === 'food' && (
                    <div className="space-y-4 border rounded-lg p-4">
                        <h4 className="font-medium">Food Details</h4>
                        {foodList.map((meal, i) => (
                            <div key={i} className="grid grid-cols-3 gap-4">
                                <p className="col-span-2">Meal: {meal.mealType} | People: {meal.numberOfPeople}</p>
                                <div>
                                    <p className="text-muted-foreground font-medium">Cost Per Person</p>
                                    <Input
                                        type="number"
                                        value={meal.costPerPerson}
                                        onChange={e => updateFoodCost(i, parseInt(e.target.value) || 0)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {costType !== 'accommodation' && costType !== 'food' && (
                    <FormField
                        control={form.control}
                        name="paymentType"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Payment Type</FormLabel>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value}
                                            className="flex gap-4">
                                    <FormItem><FormControl><RadioGroupItem
                                        value="event"/></FormControl><FormLabel>Event-Based</FormLabel></FormItem>
                                    <FormItem><FormControl><RadioGroupItem
                                        value="custom"/></FormControl><FormLabel>Custom</FormLabel></FormItem>
                                    <FormItem><FormControl><RadioGroupItem
                                        value="common"/></FormControl><FormLabel>Common</FormLabel></FormItem>
                                </RadioGroup>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <FormField
                    control={form.control}
                    name="estimatedCost"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Total Estimated Cost (₹)</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} value={getTotal()} readOnly className="bg-muted font-bold" />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <Button type="submit">Submit Cost</Button>
            </form>
        </Form>
    );
};
