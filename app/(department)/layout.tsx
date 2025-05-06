import { getCurrentUser } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

export default async function DepartmentLayout({ children }: { children: React.ReactNode }) {
    const user = await getCurrentUser();

    if (!user) redirect('/sign-in');
    if (user.role !== 'department' && user.role !== 'finance') redirect('/');

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar className="hidden md:block w-64 flex-shrink-0"/>
            <main className="flex-1 overflow-auto px-4 md:px-6 pt-[72px] md:pt-6 ">
                {children}
            </main>
        </div>
    );
}
