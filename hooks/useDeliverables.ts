// hooks/useDeliverables.ts
import { useState, useEffect, useCallback } from "react";

export function useDeliverables(sponsorId: string | undefined) {
    const [deliverables, setDeliverables] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDeliverables = useCallback(async () => {
        if (!sponsorId) return;

        try {
            setLoading(true);
            const res = await fetch(`/api/sponsors/${sponsorId}/deliverables`);
            const data = await res.json();
            setDeliverables(data.deliverables || []);
            console.log(data.deliverables)
        } catch (err) {
            console.error("🔥 Error fetching deliverables", err);
            setDeliverables([]);
        } finally {
            setLoading(false);
        }
    }, [sponsorId]);

    useEffect(() => {
        fetchDeliverables();
    }, [fetchDeliverables]);

    return { deliverables, loading, refetch: fetchDeliverables };
}
