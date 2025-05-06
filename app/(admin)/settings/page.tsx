'use client';

import { PageTemplate } from '@/components/layout/PageTemplate';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCurrentUser, logout } from "@/lib/actions/auth.action";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import {User} from "@/index";

const Page = () => {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
        async function fetchUser() {
            const currentUser = await getCurrentUser();
            if (currentUser) {
                setUser(currentUser);
            } else {
                router.push('/');
            }
        }
        fetchUser();
    }, [router]);

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    if (!user) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    return (
        <PageTemplate
            title="Settings"
            description="Basic info and settings for the current user"
        >
            <div className="space-y-6">
                <div>
                    <h3 className="text-4xl font-extrabold tracking-tight ">Settings</h3>
                    <p className="text-muted-foreground ">Manage your basic information and preferences</p>
                </div>

                {/* Main User Card */}
                <div className="flex justify-center p-6">
                    <Card className="w-full max-w-md transition-all transform hover:scale-105 hover:shadow-lg hover:border-primary/50">
                        <CardHeader>
                            <CardTitle>{user.name}</CardTitle>
                            <CardDescription>Role: {user.role}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Email: {user.email}</p>
                        </CardContent>
                        <CardFooter className="flex justify-end">
                            <Button variant="destructive" onClick={handleLogout}>
                                Logout
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* Floating About Button with Dialog */}
                <div className="fixed bottom-6 right-6">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="secondary" size="sm">
                                About
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>About the Creators</DialogTitle>
                                <DialogDescription>
                                    <div className="mt-4 space-y-2">
                                        <p>👨‍💻 <strong>Aditya Gupta</strong> - Lead Developer</p>
                                        <p>🎨 <strong>Mayank</strong> - UI/UX Designer</p>
                                        <p>🧑‍💼 <strong>Rajat Gupta</strong> - Project Manager</p>
                                    </div>
                                </DialogDescription>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </PageTemplate>
    );
};

export default Page;
