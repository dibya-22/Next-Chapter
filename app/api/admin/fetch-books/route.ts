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
    categories?: string;
    imageLinks?: {
        thumbnail?: string;
    };
    industryIdentifiers?: IndustryIdentifier[];
    pageCount?: number;  // Add this line
}

const GOOGLE_BOOK_API = process.env.GOOGLE_BOOK_API_KEY;
const POPULAR_BOOK_QUERIES = [
    "Atomic Habits - James Clear",
    "Ikigai - Héctor García & Francesc Miralles",
    "The Psychology of Money - Morgan Housel",
    "The Power of Habit - Charles Duhigg",
    "Tiny Habits - BJ Fogg",
    "Mindset - Carol Dweck",
    "Grit - Angela Duckworth",
    "Deep Work - Cal Newport",
    "So Good They Cant Ignore You - Cal Newport",
    "Essentialism - Greg McKeown",
    "The One Thing - Gary Keller & Jay Papasan",
    "Make Your Bed - Admiral William H. McRaven",
    "The Subtle Art of Not Giving a F*ck - Mark Manson",
    "Everything is F*cked - Mark Manson",
    "Think Like a Monk - Jay Shetty",
    "Can't Hurt Me - David Goggins",
    "The 5 AM Club - Robin Sharma",
    "The Monk Who Sold His Ferrari - Robin Sharma",
    "Who Will Cry When You Die - Robin Sharma",
    "The Miracle Morning - Hal Elrod",
    "Start With Why - Simon Sinek",
    "Leaders Eat Last - Simon Sinek",
    "Drive - Daniel H. Pink",
    "The Slight Edge - Jeff Olson",
    "Rich Dad Poor Dad - Robert Kiyosaki",
    "The Almanack of Naval Ravikant - Eric Jorgenson",
    "Show Your Work - Austin Kleon",
    "Steal Like an Artist - Austin Kleon",
    "The Courage to Be Disliked - Ichiro Kishimi & Fumitake Koga",
    "Ego Is the Enemy - Ryan Holiday",
    "The Obstacle Is the Way - Ryan Holiday",
    "Stillness Is the Key - Ryan Holiday",
    "Tools of Titans - Tim Ferriss",
    "Tribe of Mentors - Tim Ferriss",
    "The 4-Hour Workweek - Tim Ferriss",
    "Outliers - Malcolm Gladwell",
    "Blink - Malcolm Gladwell",
    "The Tipping Point - Malcolm Gladwell",
    "How to Win Friends and Influence People - Dale Carnegie",
    "Think and Grow Rich - Napoleon Hill",
    "As a Man Thinketh - James Allen",
    "Mans Search for Meaning - Viktor E. Frankl",
    "The Art of Happiness - Dalai Lama",
    "Awaken the Giant Within - Tony Robbins",
    "Unlimited Power - Tony Robbins",
    "12 Rules for Life - Jordan B. Peterson",
    "Beyond Order - Jordan B. Peterson",
    "The Magic of Thinking Big - David J. Schwartz",
    "The Mountain Is You - Brianna Wiest",
    "101 Essays That Will Change The Way You Think - Brianna Wiest",
    "The Daily Stoic - Ryan Holiday",
    "Meditations - Marcus Aurelius",
    "Letters from a Stoic - Seneca",
    "The War of Art - Steven Pressfield",
    "Do the Work - Steven Pressfield",
    "Rework - Jason Fried & David Heinemeier Hansson",
    "Company of One - Paul Jarvis",
    "Linchpin - Seth Godin",
    "Purple Cow - Seth Godin",
    "The Dip - Seth Godin",
    "Quiet - Susan Cain",
    "Digital Minimalism - Cal Newport",
    "The Shallows - Nicholas Carr"
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
        const url = `https://www.googleapis.com/books/v1/volumes?q=${encodedQuery}&key=${GOOGLE_BOOK_API}&country=US&projection=full`;

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
    let totalAdded = 0;
    let totalSkipped = 0;

    try {
        for (const bookQuery of POPULAR_BOOK_QUERIES) {
            // Start a new transaction for each book query
            await client.query('BEGIN');

            try {
                console.log(`Processing query: ${bookQuery}`);
                const items = await fetchBooksFromGoogleAPI(bookQuery);

                if (!items?.length) {
                    console.log(`No results found for: ${bookQuery}`);
                    await client.query('COMMIT');
                    continue;
                }

                for (const item of items) {
                    const volume: VolumeInfo = item.volumeInfo;
                    const title = volume.title || 'Untitled';

                    // Check for duplicate by title
                    const exists = await client.query(
                        'SELECT title FROM books WHERE title ILIKE $1',
                        [title]
                    );

                    if (exists.rows.length > 0) {
                        console.log(`Skipping duplicate book: ${title}`);
                        totalSkipped++;
                        continue;  // Skip this book and continue with next one
                    }

                    // Process book data
                    const formattedAuthors = volume.authors?.map(a =>
                        a.replace(/"/g, '\\"').replace(/'/g, "''")
                    ) || ['Unknown'];
                    const authors = `{${formattedAuthors.map(a => `"${a}"`).join(',')}}`;

                    const description = volume.description || 'No description available';
                    const thumbnail = volume.imageLinks?.thumbnail?.replace('zoom=1', 'zoom=3')
                        ?.replace('http://', 'https://') || null;
                    const category = volume.categories?.[0]?.toLowerCase() || 'uncategorized';
                    const pages = volume.pageCount || 0;
                    const totalPages = Math.floor(pages > 0 ? pages : 0); // Ensure totalPages is an integer
                    const totalSold = 0;
                    const isbn = volume.industryIdentifiers
                        ? volume.industryIdentifiers.find((id: IndustryIdentifier) => id.type === 'ISBN_13')?.identifier ||
                        volume.industryIdentifiers.find((id: IndustryIdentifier) => id.type === 'ISBN_10')?.identifier ||
                        null
                        : null;

                    const price = Math.floor(Math.random() * 1000) + 150;
                    const discount = 15;
                    const stock = Math.floor(Math.random() * 200) + 50;
                    const rating = 0; // Default rating
                    const ratingCount = 0; // Default rating count

                    // Insert new book with error handling
                    try {
                        const insertValues = [
                            title, authors, description, thumbnail,
                            isbn, price, stock, category, totalSold,
                            discount, rating, ratingCount, totalPages
                        ];

                        console.log('Inserting book with values:', {
                            title,
                            price,
                            stock,
                            discount,
                            rating,
                            ratingCount,
                            totalPages
                        });

                        await client.query(
                            `INSERT INTO books (
                                title, authors, description, thumbnail, 
                                isbn, price, stock, category, total_sold, 
                                discount, rating, rating_count, pages
                            )
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
                            insertValues
                        );
                        console.log(`Added new book: ${title}`);
                        totalAdded++;
                    } catch (error) {
                        console.log(`Skipping book "${title}" due to: ${error instanceof Error ? error.message : 'Unknown error'}`);
                        totalSkipped++;
                        continue; // Skip to next book
                    }

                    await sleep(1000);
                }

                // Commit the transaction for this book query
                await client.query('COMMIT');
            } catch (error) {
                // If any error occurs during the processing of a book query
                await client.query('ROLLBACK');
                console.error(`Error processing query "${bookQuery}":`, error);
                // Continue with next book query
            }
        }

        return NextResponse.json({
            message: `Successfully added ${totalAdded} books. Skipped ${totalSkipped} duplicates.`,
            totalAdded,
            totalSkipped
        }, { status: 200 });

    } catch (error) {
        console.error('Fatal error in book processing:', {
            error: error instanceof Error ? error.message : String(error)
        });
        return NextResponse.json({
            error: 'Failed to process books',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    } finally {
        client.release();
    }
}