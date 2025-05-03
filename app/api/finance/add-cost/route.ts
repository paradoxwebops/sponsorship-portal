// app/api/finance/add-cost/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase/admin';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            deliverableId,
            sponsorId,
            costType,
            paymentType,
            costDetails
        } = body;

        if (!deliverableId || !sponsorId || !costType || !costDetails) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const deliverableRef = db.collection('deliverables').doc(deliverableId);
        const docSnap = await deliverableRef.get();

        if (!docSnap.exists) {
            return NextResponse.json({ error: 'Deliverable not found' }, { status: 404 });
        }

        const updateData: any = {};

        if (paymentType && costType !== 'accommodation' && costType !== 'food') {
            updateData.paymentType = paymentType;
        }

        if (costType === 'accommodation') {
            const accommodations = costDetails.accommodations || [];
            const totalCost = accommodations.reduce((acc: number, item: any) => acc + parseFloat(item.costPerPerson || 0), 0);
            updateData.accommodations = accommodations.map((p: any) => ({
                personName: p.personName,
                arrivalDate: p.arrivalDate,
                departureDate: p.departureDate,
                costPerPerson: parseFloat(p.costPerPerson || 0)
            }));
            updateData.estimatedCost = totalCost;
        } else if (costType === 'food') {
            const foodItems = costDetails.food || [];
            const totalCost = foodItems.reduce((acc: number, item: any) => acc + (item.numberOfPeople * item.costPerPerson), 0);
            updateData.food = foodItems.map((f: any) => ({
                mealType: f.mealType,
                numberOfPeople: f.numberOfPeople,
                costPerPerson: f.costPerPerson
            }));
            updateData.estimatedCost = totalCost;
        } else {
            const { numberOfPrintable, sizeOfPrintable, costPerPrintable } = costDetails;
            const totalCost = numberOfPrintable * costPerPrintable;
            updateData.numberOfPrintable = numberOfPrintable;
            updateData.sizeOfPrintable = sizeOfPrintable;
            updateData.costPerPrintable = costPerPrintable;
            updateData.estimatedCost = totalCost;
        }

        await deliverableRef.update(updateData);

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (err) {
        console.error('[ADD_COST_ERROR]', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
