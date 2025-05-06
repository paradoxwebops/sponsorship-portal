// app/(department)/finance/layout.tsx
import { getCurrentUser } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

export default async function FinanceLayout({
                                                children,
                                            }: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();

    if (!user) redirect("/sign-in");

    // Only allow finance or department users to access this section
    if (user.role !== "finance") {
        redirect("/"); // or to /department-dashboard if preferred
    }

    return (
        <div>
                {children}
        </div>
    );
}
