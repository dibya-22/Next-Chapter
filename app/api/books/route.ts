// get some books of various types from db

import { NextResponse } from 'next/server';
import pool from "@/lib/db";
import { BookType } from "@/lib/types";

const getBooksFromDB = async (n: number, type: BookType, search?: string, category?: string) => {
    const client = await pool.connect();
    try {
        if (type === BookType.SEARCH_RESULTS) {
            const query = `
                SELECT * FROM books
                WHERE title ILIKE $1
                OR authors::text ILIKE $1
                OR category ILIKE $1
                LIMIT $2
            `
            const result = await client.query(query, [`%${search}%`, n]);
            return result.rows;
        }
        else if (type === BookType.BEST_SELLERS) {
            const query = `
                SELECT * FROM books
                ORDER BY total_sold DESC
                LIMIT $1
            `
            const result = await client.query(query, [n]);
            return result.rows;
        }
        else if (type === BookType.TOP_RATED) {
            const query = `
                SELECT * FROM books
                ORDER BY rating DESC
                LIMIT $1
            `
            const result = await client.query(query, [n]);
            return result.rows;
        }
        else if (type === BookType.NEW_ARRIVALS) {
            const query = `
                SELECT * FROM books
                ORDER BY created_at DESC
                LIMIT $1
            `
            const result = await client.query(query, [n]);
            return result.rows;
        }
        else if (type === BookType.CATEGORIES) {
            const query = `
                SELECT * FROM books
                WHERE category ILIKE $1
                ORDER BY total_sold DESC
                LIMIT $2
            `
            const result = await client.query(query, [`%${category}%`, n]);
            return result.rows;
        }
        else {
            throw new Error("Invalid book type");
        }
    } finally {
        client.release();
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') as BookType;
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || undefined;
        const category = searchParams.get('category') || undefined;

        if (!type || !Object.values(BookType).includes(type)) {
            return NextResponse.json(
                { error: 'Invalid book type' },
                { status: 400 }
            );
        }

        if (type === BookType.SEARCH_RESULTS && !search) {
            return NextResponse.json(
                { error: 'Search query is required for search results' },
                { status: 400 }
            );
        }

        if (type === BookType.CATEGORIES && !category) {
            return NextResponse.json(
                { error: 'Category is required for category search' },
                { status: 400 }
            );
        }

        const books = await getBooksFromDB(limit, type, search, category);
        return NextResponse.json(books);
    } catch (error) {
        console.error('Error fetching books:', error);
        return NextResponse.json(
            { error: 'Failed to fetch books' },
            { status: 500 }
        );
    }
}