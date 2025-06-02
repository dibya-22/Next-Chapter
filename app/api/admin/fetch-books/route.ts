import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

interface IndustryIdentifier {
    type: string;
    identifier: string;
}

interface VolumeInfo {
    title: string;
    authors?: string[];
    description?: string;
    categories?: string[];
    imageLinks?: {
        thumbnail?: string;
    };
    industryIdentifiers?: IndustryIdentifier[];
}

const GOOGLE_BOOK_API = process.env.GOOGLE_BOOK_API_KEY;
const POPULAR_BOOK_QUERIES = [
    "12 Rules for Life",
    "Beyond Order",
    "The Gifts of Imperfection",
    "The Daily Stoic",
    "The Artist's Way",
    "The Secret",
    "The Life-Changing Magic of Tidying Up",
    "The Let Them Theory",
    "Don't Believe Everything You Think",
    "Think and Grow Rich",
    "The Millionaire Fastlane",
    "The Anxious Generation",
    "Abundance",
    "On Thriving",
    "We Can Do Hard Things",
    "The Trading Game",
    "The Creative Habit",
    "Letters to Misty",
    "Dancing on My Grave",
    "Homegoing",
    "Beautiful Ruins",
    "The Power of Now",
    "The Mindful Way Through Depression",
    "The Assertiveness Workbook",
    "Sex, Drugs, Gambling, & Chocolate",
    "Predictably Irrational",
    "The Laws of Human Nature",
    "The Checklist Manifesto",
    "Talent Is Overrated",
    "The Talent Code",
    "Digital Minimalism",
    "The Code of the Extraordinary Mind",
    "The Obstacle Is the Way",
    "Ego Is the Enemy",
    "The 10X Rule",
    "The Innovator's Dilemma",
    "Lean In",
    "Originals",
    "The Tipping Point",
    "Switch",
    "The Compound Effect",
    "The Slight Edge",
    "Blink",
    "Purple Cow",
    "The Art of Possibility",
    "Thinking in Systems",
    "Emotional Intelligence",
    "The 4-Hour Workweek",
    "Remote",
    "Rework",
    "Show Your Work",
    "Steal Like an Artist",
    "Made to Stick",
    "The E-Myth Revisited",
    "Who Moved My Cheese?",
    "The Effective Executive",
    "Good Strategy Bad Strategy",
    "The Art of Happiness",
    "The Five Dysfunctions of a Team",
    "Factfulness",
    "The Book Thief"
];

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function fetchBooksFromGoogleAPI(query: string) {
    try {
        // First, verify API key is present
        if (!GOOGLE_BOOK_API) {
            throw new Error('API key is not configured');
        }

        // Test with a simpler URL first
        const encodedQuery = encodeURIComponent(query);
        const url = `https://www.googleapis.com/books/v1/volumes?q=${encodedQuery}&key=${GOOGLE_BOOK_API}`;

        console.log('Making request to:', url.replace(GOOGLE_BOOK_API, 'API_KEY_HIDDEN'));

        const response = await fetch(url);
        const textResponse = await response.text();

        // Log raw response for debugging
        console.log('Raw Response:', textResponse.substring(0, 200) + '...');

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} - ${textResponse}`);
        }

        const data = JSON.parse(textResponse);

        if (!data.items) {
            console.log('No results found for query:', query);
            return [];
        }

        await sleep(1000); // Reduced sleep time
        return data.items;

    } catch (error) {
        console.error('Detailed error:', {
            error: error instanceof Error ? error.message : String(error),
            query,
            apiKeyExists: !!GOOGLE_BOOK_API,
            apiKeyLength: GOOGLE_BOOK_API?.length
        });
        throw error;
    }
}

export async function POST() {
    console.log('Starting book fetch process...');
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        let totalAdded = 0;

        for (const bookQuery of POPULAR_BOOK_QUERIES) {
            console.log(`Processing query: ${bookQuery}`);

            const items = await fetchBooksFromGoogleAPI(bookQuery);

            if (!items?.length) {
                console.log(`No results found for: ${bookQuery}`);
                continue;
            }

            // Process all items from the response
            for (const item of items) {
                const volume: VolumeInfo = item.volumeInfo;
                const title = volume.title || 'Untitled';

                // Check if book exists
                const exists = await client.query(
                    'SELECT * FROM books WHERE title ILIKE $1',
                    [title]
                );

                if (exists.rows.length > 0) {
                    console.log(`Skipping existing book: ${title}`);
                    continue;
                }

                // Process book data
                const formattedAuthors = volume.authors?.map(a =>
                    a.replace(/"/g, '\\"').replace(/'/g, "''")
                ) || ['Unknown'];
                const authors = `{${formattedAuthors.map(a => `"${a}"`).join(',')}}`;

                const description = volume.description || 'No description available';
                const thumbnail = volume.imageLinks?.thumbnail || null;
                const category = volume.categories?.[0]?.toLowerCase() || 'uncategorized';
                const totalSold = 0;
                const isbn = volume.industryIdentifiers
                    ? volume.industryIdentifiers.find((id: IndustryIdentifier) => id.type === 'ISBN_13')?.identifier ||
                    volume.industryIdentifiers.find((id: IndustryIdentifier) => id.type === 'ISBN_10')?.identifier ||
                    null
                    : null;

                const price = Math.floor(Math.random() * 1000) + 150;
                const stock = Math.floor(Math.random() * 200) + 50;

                // Insert new book
                await client.query(
                    `INSERT INTO books (
                        title, authors, description, thumbnail, 
                        isbn, price, stock, category, total_sold
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                    [title, authors, description, thumbnail, isbn,
                        price, stock, category, totalSold]
                );

                console.log(`Added new book: ${title}`);
                totalAdded++;
            }

            // Add delay between queries to respect rate limits
            await sleep(1000);
        }

        await client.query('COMMIT');
        return NextResponse.json({
            message: `Successfully added ${totalAdded} books.`,
            totalBooks: totalAdded
        }, { status: 200 });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error in book processing:', error);
        return NextResponse.json({
            error: 'Failed to process books',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    } finally {
        client.release();
    }
}