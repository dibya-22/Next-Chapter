import { Suspense } from "react";
import Books from "@/components/books/Book";

export default function BooksPage() {
    return (
        <Suspense>
            <Books />
        </Suspense>
    );
}

