import { getCurrentUser } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

export default async function DepartmentLayout({ children }: { children: React.ReactNode }) {
    const user = await getCurrentUser();
    const allowedRoles = ['department', 'finance', 'culturals', 'technicals', 'sports'];

    if (!user) redirect('/sign-in');
    if (!allowedRoles.includes(user.role)) redirect('/');

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar className="hidden md:block w-64 flex-shrink-0"/>
            <main className="flex-1 overflow-auto px-4 md:px-6 pt-[72px] md:pt-6 ">
                {children}
            </main>
        </div>
    );
}
