export enum BookType {
    SEARCH_RESULTS = "SEARCH_RESULTS",
    BEST_SELLERS = "BEST_SELLERS",
    TOP_RATED = "TOP_RATED",
    CATEGORIES = "CATEGORIES",
    NEW_ARRIVALS = "NEW_ARRIVALS"
}

export interface Book {
    id?: number;
    title: string;
    authors: string[];
    description: string;
    thumbnail: string | null;
    isbn: string | null;
    price: number;
    discount: number;
    stock: number;
    category: string;
    total_sold: number;
    rating: number;
    rating_count: number;
    pages: number;
    created_at?: Date;
}


export interface Categories {
    fiction: Book[];
    nonFiction: Book[];
    selfHelp: Book[];
    business: Book[];
}

export interface CartItem {
    id: string
    title: string
    authors: string | string[]
    thumbnail?: string
    originalPrice: number
    discount: number
    quantity: number
}
