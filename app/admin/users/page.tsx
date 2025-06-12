"use client";
import React, { useEffect, useState } from 'react'

interface User {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    username: string | null;
    imageUrl: string;
    createdAt: Date;
    lastSignInAt: Date | null;
    role: 'admin' | 'user';
    status: 'active' | 'blocked';
}

interface ApiResponse {
    users: User[];
}

const Users = () => {
    const [users, setUsers] = useState<User[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/get-users', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data: ApiResponse = await response.json();

            if (!Array.isArray(data.users)) {
                console.error("Invalid response format:", data);
                return { error: "Invalid response format" };
            }

            setUsers(data.users);
        } catch (error) {
            console.error("Error fetching users:", error);
            return { error: "Failed to fetch users" };
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUsers();
    }, [])

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!users) {
        return <div>No users found</div>;
    }

    return (
        <div className='w-full flex flex-col gap-5 items-center'>
            {users.map(user => (
                <div key={user.id} className='bg-gray-500 text-white p-4 border border-white rounded-[0.5rem] w-full'>
                    <h2 className='font-semibold text-xl'>{user.firstName} {user.lastName}</h2>
                    <p>Email: {user.email}</p>
                    <p>Username: {user.username}</p>
                    <p>Role: {user.role}</p>
                    <p>Status: {user.status}</p>
                </div>
            ))}
        </div>
    )
}

export default Users
