import { getCurrentUser } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar"; // if you want admin sidebar

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const user = await getCurrentUser();

    if (!user) redirect('/sign-in');
    if (user.role !== 'admin' && user.role !== 'viewer') redirect('/department-dashboard');

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar className="hidden md:block w-64 flex-shrink-0" />
            {/* Main content area */}
            <main className="flex-1 overflow-auto px-4 md:px-6 pt-[72px] md:pt-6 ">
                {children}
            </main>
        </div>
    );
}
