// get some books of various types from db

import pool from "@/lib/db";
import { BookType } from "@/lib/types";

export const getBooksFromDB = async (n: number, type: BookType, search?: string, category?: string) => {
    const client = await pool.connect();

    if (type === BookType.SEARCH_RESULTS) {
        const query = `
            SELECT * FROM books
            WHERE title ILIKE $1
            OR author ILIKE $1
            OR category ILIKE $1
        `
        const result = await client.query(query, [search, n]);
        return result.rows;
    }
    else if (type === BookType.BEST_SELLERS) {
        const query = `
            SELECT * FROM books
            ORDER BY sales DESC
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
            LIMIT $2
        `
        const result = await client.query(query, [category, n]);
        return result.rows;
    }
    else {
        throw new Error("Invalid book type");
    }
}