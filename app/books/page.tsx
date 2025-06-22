import { Suspense } from "react";
import Books from "@/components/books/Book";

export default function BooksPage (){
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen ">Loading...</div>}>
            <Books/>
        </Suspense>
    );
}

