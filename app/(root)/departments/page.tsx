'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import {PageTemplate} from "@/components/layout/PageTemplate";

interface DepartmentUser {
    userId: string;
    userName: string;
    userEmail: string;
}

export default function DepartmentUsersPage() {
    const [departmentUsers, setDepartmentUsers] = useState<DepartmentUser[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedName, setSelectedName] = useState('');

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
