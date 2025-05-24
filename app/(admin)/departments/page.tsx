'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import {PageTemplate} from "@/components/layout/PageTemplate";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface DepartmentUser {
    userId: string;
    userName: string;
    userEmail: string;
}

export default function DepartmentUsersPage() {
    const [departmentUsers, setDepartmentUsers] = useState<DepartmentUser[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedName, setSelectedName] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'culturals' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchDepartmentUsers() {
            try {
                const res = await fetch('/api/users/departments');
                const data = await res.json();
                setDepartmentUsers(data.users || []);
            } catch (error) {
                console.error("Failed to fetch users:", error);
            }
        }
        fetchDepartmentUsers();
    }, []);

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/users/create-subdepartment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                toast.success('Subdepartment user created!');
                setDialogOpen(false);
                setForm({ name: '', email: '', password: '', role: 'culturals' });
                // Refresh user list
                const res2 = await fetch('/api/users/departments');
                const data2 = await res2.json();
                setDepartmentUsers(data2.users || []);
            } else {
                toast.error(data.message || 'Failed to create user');
            }
        } catch (err) {
            toast.error('Error creating user');
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = departmentUsers.filter((user) => {
        const name = user.userName || '';
        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSelected = selectedName ? name === selectedName : true;
        return matchesSearch && matchesSelected;
    });

    return (
        <PageTemplate
            title="Settings"
            description="Basic info and settings for the current user"
        >
        <div className="flex flex-col gap-6 p-8 min-h-screen">
            <h1 className="text-3xl font-bold text-center">Department & Finance Users</h1>

            <div className="flex justify-end mb-4">
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="default">Add Subdepartment User</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Subdepartment User</DialogTitle>
                        </DialogHeader>
                        <form className="space-y-4" onSubmit={handleAddUser}>
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Password</label>
                                <Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Subdepartment Role</label>
                                <Select value={form.role} onValueChange={role => setForm(f => ({ ...f, role }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="culturals">Culturals</SelectItem>
                                        <SelectItem value="technicals">Technicals</SelectItem>
                                        <SelectItem value="sports">Sports</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Creating...' : 'Create User'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
                <Input
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-1/3"
                />

                <Select value={selectedName} onValueChange={(value) => setSelectedName(value)}>
                    <SelectTrigger className="w-full md:w-1/3">
                        <SelectValue placeholder="Filter by user" />
                    </SelectTrigger>
                    <SelectContent>
                        {departmentUsers.map((user) => (
                            <SelectItem key={user.userId} value={user.userName}>
                                {user.userName}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Users List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                        <Card key={user.userId} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <CardTitle>{user.userName}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{user.userEmail}</p>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full text-center text-muted-foreground mt-8">
                        No users found.
                    </div>
                )}
            </div>
        </div>
        </PageTemplate>
    );
}
