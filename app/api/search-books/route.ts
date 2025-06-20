import { NextResponse } from 'next/server';
import pool from "@/lib/db";
import { Book } from "@/lib/types";

const GOOGLE_BOOK_API = process.env.GOOGLE_BOOK_API_KEY;

interface GoogleBookResponse {
    items?: Array<{
        id: string;
        volumeInfo: {
            title: string;
            authors?: string[];
            description?: string;
            imageLinks?: {
                thumbnail?: string;
            };
            industryIdentifiers?: Array<{
                type: string;
                identifier: string;
            }>;
            pageCount?: number;
            categories?: string[];
        };
    }>;
}

export async function GET(request: Request) {
    const client = await pool.connect();
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('query');

        console.log('Search query:', query);
        console.log('Google Books API Key:', GOOGLE_BOOK_API ? 'Present' : 'Missing');

        if (!query) {
            return NextResponse.json(
                { error: 'Search query is required' },
                { status: 400 }
            );
        }

        if (!GOOGLE_BOOK_API) {
            console.error('Google Books API key is missing');
            return NextResponse.json(
                { error: 'API configuration error' },
                { status: 500 }
            );
        }

        // Search Google Books API
        const googleBooksUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${GOOGLE_BOOK_API}`;
        console.log('Fetching from Google Books API:', googleBooksUrl);

        const response = await fetch(googleBooksUrl);
        const data: GoogleBookResponse = await response.json();

        console.log('Google Books API response items:', data.items?.length || 0);

        if (!data.items || data.items.length === 0) {
            return NextResponse.json(
                { error: 'No books found' },
                { status: 404 }
            );
        }

        // Process and save each book
        const savedBooks: Book[] = [];
        const errors: string[] = [];

        for (const item of data.items) {
            try {
                const volume = item.volumeInfo;

                // Skip if no title
                if (!volume.title) {
                    console.log('Skipping book with no title');
                    continue;
                }

                // Format authors
                const authors = volume.authors || ['Unknown Author'];

                // Get ISBN
                const isbn = volume.industryIdentifiers
                    ? volume.industryIdentifiers.find(id => id.type === 'ISBN_13')?.identifier ||
                    volume.industryIdentifiers.find(id => id.type === 'ISBN_10')?.identifier ||
                    null
                    : null;

                console.log('Processing book:', {
                    title: volume.title,
                    isbn: isbn,
                    hasThumbnail: !!volume.imageLinks?.thumbnail
                });

                // Check if book already exists
                let existingBook;
                if (isbn) {
                    existingBook = await client.query(
                        'SELECT * FROM books WHERE isbn = $1',
                        [isbn]
                    );
                }
                
                // If no ISBN or no match found, check by title and authors
                if (!existingBook?.rows.length) {
                    existingBook = await client.query(
                        'SELECT * FROM books WHERE title ILIKE $1 AND authors::text ILIKE $2',
                        [volume.title, `%${authors.join('%')}%`]
                    );
                }

                if (existingBook?.rows.length > 0) {
                    console.log('Book already exists:', volume.title);
                    savedBooks.push(existingBook.rows[0]);
                    continue;
                }

                // Prepare book data
                const DEFAULT_COVER = 'https://books.google.com/books/content?id=llWzyQEACAAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api';
                const bookData = {
                    title: volume.title,
                    authors: authors,
                    description: volume.description || 'No description available',
                    thumbnail: volume.imageLinks?.thumbnail 
                        ? volume.imageLinks.thumbnail.replace('http://', 'https://')
                        : DEFAULT_COVER,
                    isbn: isbn,
                    price: Math.floor(Math.random() * 1000) + 150, // Random price between 150-1150
                    discount: 15,
                    stock: Math.floor(Math.random() * 200) + 50, // Random stock 50-250
                    category: volume.categories?.[0]?.toLowerCase() || 'uncategorized',
                    total_sold: 0,
                    rating: 0,
                    rating_count: 0,
                    pages: volume.pageCount || 0
                };

                try {
                    // Insert new book with error handling
                    const result = await client.query(
                        `INSERT INTO books (
                            title, authors, description, thumbnail, isbn, price, discount,
                            stock, category, total_sold, rating, rating_count, pages, created_at
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP)
                        ON CONFLICT (isbn) DO UPDATE SET
                            title = EXCLUDED.title,
                            authors = EXCLUDED.authors,
                            description = EXCLUDED.description,
                            thumbnail = EXCLUDED.thumbnail,
                            price = EXCLUDED.price,
                            discount = EXCLUDED.discount,
                            stock = EXCLUDED.stock,
                            category = EXCLUDED.category,
                            pages = EXCLUDED.pages
                        RETURNING *`,
                        [
                            bookData.title,
                            bookData.authors,
                            bookData.description,
                            bookData.thumbnail,
                            bookData.isbn,
                            bookData.price,
                            bookData.discount,
                            bookData.stock,
                            bookData.category,
                            bookData.total_sold,
                            bookData.rating,
                            bookData.rating_count,
                            bookData.pages
                        ]
                    );

                    console.log('Successfully saved book:', volume.title);
                    savedBooks.push(result.rows[0]);
                } catch (error) {
                    console.error('Error saving book:', volume.title, error);
                    errors.push(`Failed to save book: ${volume.title}`);
                    continue;
                }
            } catch (error) {
                // Log error but continue processing other books
                console.error('Error processing book:', error);
                errors.push(`Failed to process book: ${item.volumeInfo.title}`);
                continue;
            }
        }

        console.log('Search complete. Books saved:', savedBooks.length);
        console.log('Errors encountered:', errors.length);

        return NextResponse.json({
            books: savedBooks,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        console.error('Error searching books:', error);
        return NextResponse.json(
            { error: 'Failed to search books' },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}