import { Suspense } from "react";
import Books from "@/components/books/Book";

export default function BooksPage (){
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Books/>
        </Suspense>
    );
}

