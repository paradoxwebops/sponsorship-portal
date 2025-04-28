'use client';

import { useEffect, useState } from 'react';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

interface DepartmentUser {
    userId: string;
    userName: string;
    userEmail: string;
    message: string | undefined;
}

interface DepartmentUserDropdownProps {
    excludeUserIds?: string[];
    onSelectUserAction: (user: DepartmentUser | null) => void;
}

export function DepartmentUserDropdown({
                                           excludeUserIds = [],
                                           onSelectUserAction,
                                       }: DepartmentUserDropdownProps) {
    const [departmentUsers, setDepartmentUsers] = useState<DepartmentUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDepartmentUsers() {
            try {
                const res = await fetch('/api/users/departments');
                const data = await res.json();
                setDepartmentUsers(data.users || []);
            } catch (error) {
                console.error("Failed to fetch department users:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchDepartmentUsers();
    }, []);

    const filteredUsers = departmentUsers.filter(
        (user) => !excludeUserIds.includes(user.userId)
    );

    return (
        <Select
            onValueChange={(selectedUserId) => {
                const selectedUser = departmentUsers.find(user => user.userId === selectedUserId) || null;
                onSelectUserAction(selectedUser);
            }}
        >
            <SelectTrigger className="w-[250px]" disabled={loading}>
                {/* Always show static text */}
                <div className="text-muted-foreground">Select more departments...</div>
            </SelectTrigger>
            <SelectContent>
                {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                        <SelectItem key={user.userId} value={user.userId}>
                            {user.userName}
                        </SelectItem>
                    ))
                ) : (
                    <div className="p-2 text-center text-muted-foreground text-sm">
                        All users selected
                    </div>
                )}
            </SelectContent>
        </Select>
    );
}
