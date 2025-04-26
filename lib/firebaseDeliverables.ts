// import {Deliverable, Sponsor} from "@/app/utils/mockData";
// import {db} from "@/firebase/admin";
// import {doc} from "@firebase/firestore";
// import {runTransaction} from "@firebase/database";
//
// export async function deleteDeliverableAndUpdateSponsor(deliverableId: string, sponsorId: string) {
//     if (!deliverableId || !sponsorId) throw new Error("Missing deliverable or sponsor ID");
//
//     const deliverableRef = doc(db, "deliverables", deliverableId);
//     const sponsorRef = doc(db, "sponsors", sponsorId);
//
//     await runTransaction(db, async (transaction) => {
//         const deliverableSnap = await transaction.get(deliverableRef);
//         const sponsorSnap = await transaction.get(sponsorRef);
//
//         if (!deliverableSnap.exists()) {
//             throw new Error("Deliverable does not exist");
//         }
//         if (!sponsorSnap.exists()) {
//             throw new Error("Sponsor does not exist");
//         }
//
//         const deliverable = deliverableSnap.data() as Deliverable;
//         const sponsor = sponsorSnap.data() as Sponsor;
//
//         if (deliverable.status !== "pending" && deliverable.status !== "overdue") {
//             throw new Error("Only pending or overdue tasks can be deleted.");
//         }
//
//         const estimatedCost = deliverable.estimatedCost || 0;
//
//         transaction.update(sponsorRef, {
//             estimatedCost: Math.max((sponsor.estimatedCost || 0) - estimatedCost, 0),
//             totalDeliverables: Math.max((sponsor.totalDeliverables || 1) - 1, 0),
//         });
//
//         transaction.delete(deliverableRef);
//     });
// }
