"use client"

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "react-toastify";
import Image from "next/image";

interface Book {
    id: string;
    title: string;
    author: string;
    price: number;
    stock: number;
    category: string;
    image_url: string;
}

export default function BooksPage() {
    const { userId, isLoaded } = useAuth();
    const [books, setBooks] = useState<Book[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchType, setSearchType] = useState("title");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBooks = async () => {
            if (!userId || !isLoaded) return;

            try {
                const response = await fetch('/api/admin/books');
                if (!response.ok) {
                    throw new Error('Failed to fetch books');
                }
                const data = await response.json();
                setBooks(data);
            } catch {
                toast.error('Failed to load books');
            } finally {
                setIsLoading(false);
            }
        };

        fetchBooks();
    }, [userId, isLoaded]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            const response = await fetch('/api/admin/books');
            const data = await response.json();
            setBooks(data);
            return;
        }

        try {
            const response = await fetch(`/api/admin/books/search?query=${searchQuery}&type=${searchType}`);
            if (!response.ok) {
                throw new Error('Search failed');
            }
            const data = await response.json();
            setBooks(data);
        } catch {
            toast.error('Search failed');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Books Management</h1>
                <button
                    onClick={() => window.location.href = '/admin/books/add'}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Add New Book
                </button>
            </div>

            <div className="mb-6 flex gap-4">
                <input
                    type="text"
                    placeholder="Search books..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-4 py-2 border rounded"
                />
                <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="px-4 py-2 border rounded"
                >
                    <option value="title">Title</option>
                    <option value="author">Author</option>
                    <option value="category">Category</option>
                </select>
                <button
                    onClick={handleSearch}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                    Search
                </button>
            </div>

            {isLoading ? (
                <div className="text-center">Loading...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {books.map((book) => (
                        <div key={book.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                            <Image
                                src={book.image_url}
                                alt={book.title}
                                width={400}
                                height={192}
                                className="w-full h-48 object-cover"
                                priority={false}
                                loading="lazy"
                            />
                            <div className="p-4">
                                <h3 className="text-lg font-semibold mb-2">{book.title}</h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-2">By {book.author}</p>
                                <p className="text-gray-600 dark:text-gray-300 mb-2">Category: {book.category}</p>
                                <p className="text-gray-600 dark:text-gray-300 mb-2">Price: ₹{book.price}</p>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">Stock: {book.stock}</p>
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => window.location.href = `/admin/books/edit/${book.id}`}
                                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => window.location.href = `/admin/books/delete/${book.id}`}
                                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}