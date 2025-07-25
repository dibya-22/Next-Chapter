import type { Book } from "@/lib/types"
import { BookCard } from "./book-card"

interface BooksGridProps {
    books: Book[]
}

export function BooksGrid({ books }: BooksGridProps) {
    if (!Array.isArray(books) || books.length === 0) return null

    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
            {books.map((book, i) => (
                <BookCard key={i} book={book} />
            ))}
        </div>
    )
}
