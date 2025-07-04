"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from 'react-toastify';

const AddBook = () => {
    const [isFetching, setIsFetching] = useState(false);
    const [bookList, setBookList] = useState('');

    const handleFetch = async () => {
        setIsFetching(true);
        try {
            // Parse the book list
            const books = bookList.split(',').map(book => book.trim()).filter(book => book.length > 0);
            
            if (books.length === 0) {
                toast.error("Please enter at least one book name");
                setIsFetching(false);
                return;
            }

            const response = await fetch("/api/admin/fetch-books", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ books })
            });
            
            if (response.ok) {
                const result = await response.json();
                toast.success(`Successfully fetched ${result.totalAdded} books. Skipped ${result.totalSkipped} duplicates.`);
            } else {
                toast.error("Failed to fetch books.");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred while fetching books.");
        } finally {
            setIsFetching(false);
        }
    };

    return (
        <div className='w-full p-6 max-w-2xl mx-auto space-y-6'>
            <div>
                <h1 className="text-3xl font-bold mb-2">Add Books</h1>
                <p className="text-gray-600 dark:text-gray-400">Enter book names separated by commas to fetch from Google Books API</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="bookList">Book Names</Label>
                    <textarea
                        id="bookList"
                        value={bookList}
                        onChange={(e) => setBookList(e.target.value)}
                        placeholder="ikigai, atomic habit, deep work, the power of habit, mindset, grit"
                        className="w-full min-h-[120px] p-3 border border-gray-300 dark:border-gray-600 rounded-[0.5rem] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-vertical focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-sm text-gray-500">Enter book names separated by commas. You can add multiple books at once.</p>
                </div>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button disabled={isFetching || !bookList.trim()} variant="destructive" className="w-full">
                            {isFetching ? "Fetching Books..." : "Fetch Books"}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-md max-h-[80vh]">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Fetch Books from Google API?</AlertDialogTitle>
                            <AlertDialogDescription className="space-y-3">
                                <p>This will fetch the following books:</p>
                                <ScrollArea className="h-32 w-full border rounded-md p-2 bg-gray-50 dark:bg-gray-900">
                                    <div className="font-mono text-sm text-gray-700 dark:text-gray-300">
                                        {bookList.split(',').map(book => book.trim()).filter(book => book.length > 0).join(', ')}
                                    </div>
                                </ScrollArea>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    This action may take some time. Do you want to continue?
                                </p>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleFetch}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
};

export default AddBook; 