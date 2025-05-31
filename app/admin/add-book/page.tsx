"use client";
import React, { useState } from 'react';

interface BookForm {
    title: string;
    author: string;
    price: number;
    stock: number;
    description: string;
    cover: File | null;
}

export default function AddBookPage() {
    const [bookForm, setBookForm] = useState<BookForm>({
        title: '',
        author: '',
        price: 0,
        stock: 0,
        description: '',
        cover: null
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setBookForm((prevForm) => ({
            ...prevForm,
            [name]: value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        setBookForm((prevForm) => ({
            ...prevForm,
            cover: file
        }));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Book Form Submitted:', bookForm);
        setBookForm({
            title: '',
            author: '',
            price: 0,
            stock: 0,
            description: '',
            cover: null
        });
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-gray-100 dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-800 shadow-[0_10px_30px_rgba(0,0,0,0.15)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.4)] rounded-lg  p-8">
                <h1 className="text-3xl font-bold mb-8">Add New Book</h1>

                <form onSubmit={handleSubmit} className="space-y-6 ">
                    {/* Title and Author Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium mb-2">
                                Book Title
                            </label>
                            <input
                                value={bookForm.title}
                                onChange={handleInputChange}
                                type="text"
                                id="title"
                                name="title"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter book title"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="author" className="block text-sm font-medium mb-2">
                                Author
                            </label>
                            <input
                                value={bookForm.author}
                                onChange={handleInputChange}
                                type="text"
                                id="author"
                                name="author"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter author name"
                                required
                            />
                        </div>
                    </div>

                    {/* Price and Stock Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium mb-2">
                                Price
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500">₹</span>
                                <input
                                    value={bookForm.price}
                                    onChange={handleInputChange}
                                    type="number"
                                    id="price"
                                    name="price"
                                    step="0.01"
                                    min="0"
                                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="stock" className="block text-sm font-medium mb-2">
                                Stock Quantity
                            </label>
                            <input
                                value={bookForm.stock}
                                onChange={handleInputChange}
                                type="number"
                                id="stock"
                                name="stock"
                                min="0"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter stock quantity"
                                required
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium mb-2">
                            Description
                        </label>
                        <textarea
                            value={bookForm.description}
                            onChange={handleInputChange}
                            id="description"
                            name="description"
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter book description"
                            required
                        />
                    </div>

                    {/* Cover Image */}
                    <div>
                        <label htmlFor="cover" className="block text-sm font-medium mb-2">
                            Cover Image
                        </label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <svg
                                    className="mx-auto h-12 w-12 text-gray-400"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 48 48"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                <div className="flex text-sm text-gray-600">
                                    <label
                                        htmlFor="cover"
                                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                                    >
                                        <span>Upload a file</span>
                                        <input
                                            onChange={handleFileChange}
                                            id="cover"
                                            name="cover"
                                            type="file"
                                            className="sr-only"
                                            accept="image/*"
                                        />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                        >
                            Add Book
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}