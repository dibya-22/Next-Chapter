"use client"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { type Book, type Categories, BookType } from "@/lib/types"
import { BooksGrid } from "@/components/books/books-grid"
import { SectionHeader } from "@/components/books/section-header"

const Books = () => {
    const searchParams = useSearchParams()
    const search = searchParams.get("search")

    // get books
    const [searchResultsBooks, setSearchResultsBooks] = useState<Book[]>([])
    const [bestSellersBooks, setBestSellersBooks] = useState<Book[]>([])
    const [topRatedBooks, setTopRatedBooks] = useState<Book[]>([])
    const [categoriesBooks, setCategoriesBooks] = useState<Categories>({
        fiction: [],
        nonFiction: [],
        selfHelp: [],
        business: [],
    })
    const [newArrivalsBooks, setNewArrivalsBooks] = useState<Book[]>([])

    const getBooks = async () => {
        try {
            const [bestSellers, topRated, newArrivals] = await Promise.all([
                fetch(`/api/books?type=${BookType.BEST_SELLERS}&limit=10`),
                fetch(`/api/books?type=${BookType.TOP_RATED}&limit=10`),
                fetch(`/api/books?type=${BookType.NEW_ARRIVALS}&limit=10`),
            ])

            setBestSellersBooks(await bestSellers.json())
            setTopRatedBooks(await topRated.json())
            setNewArrivalsBooks(await newArrivals.json())

            const [fiction, nonFiction, selfHelp, business] = await Promise.all([
                fetch(`/api/books?type=${BookType.CATEGORIES}&limit=5&category=fiction`),
                fetch(`/api/books?type=${BookType.CATEGORIES}&limit=5&category=nonFiction`),
                fetch(`/api/books?type=${BookType.CATEGORIES}&limit=5&category=self-Help`),
                fetch(`/api/books?type=${BookType.CATEGORIES}&limit=5&category=business`),
            ])
            setCategoriesBooks({
                fiction: await fiction.json(),
                nonFiction: await nonFiction.json(),
                selfHelp: await selfHelp.json(),
                business: await business.json(),
            })
        } catch (error) {
            console.error("Error fetching books:", error)
        }
    }

    const getSearchResults = async () => {
        const searchResults = await fetch(`/api/books?type=${BookType.SEARCH_RESULTS}&search=${search}`)
        const data = await searchResults.json()
        setSearchResultsBooks(data)
    }

    useEffect(() => {
        getBooks()
    }, [])

    useEffect(() => {
        if (search) {
            getSearchResults()
        }
    }, [search])

    return (
        <div className="font-[family-name:var(--font-poppins)] w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-[11vh] space-y-8 sm:space-y-12">
            {/* Search Results */}
            {search && (
                <section className="search-results">
                    {searchResultsBooks.length > 0 ? (
                        <SectionHeader title={`Search Results for "${search}"`} />
                    ) : (
                        <SectionHeader title={`No Results Found for "${search}"`} />
                    )}
                    <BooksGrid books={searchResultsBooks} />
                </section>
            )}

            {/* Best Sellers */}
            <section className="best-sellers">
                <SectionHeader title="Best Sellers" />
                <BooksGrid books={bestSellersBooks} />
            </section>

            {/* Top Rated Books */}
            <section className="top-rated-books">
                <SectionHeader title="Top Rated Books" />
                <BooksGrid books={topRatedBooks} />
            </section>

            {/* Categories */}
            <section className="categories space-y-8 sm:space-y-10">
                <SectionHeader title="Categories" />

                {/* Category - Fiction */}
                <div className="fiction">
                    <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800 dark:text-gray-200">Fiction</h2>
                    <BooksGrid books={categoriesBooks.fiction} />
                </div>

                {/* Category - Non-Fiction */}
                <div className="non-fiction">
                    <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800 dark:text-gray-200">Non-Fiction</h2>
                    <BooksGrid books={categoriesBooks.nonFiction} />
                </div>

                {/* Category - Self-Help */}
                <div className="self-help">
                    <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800 dark:text-gray-200">Self-Help</h2>
                    <BooksGrid books={categoriesBooks.selfHelp} />
                </div>

                {/* Category - Business */}
                <div className="business">
                    <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800 dark:text-gray-200">Business</h2>
                    <BooksGrid books={categoriesBooks.business} />
                </div>
            </section>

            {/* New Arrivals */}
            <section className="new-arrivals">
                <SectionHeader title="New Arrivals" />
                <BooksGrid books={newArrivalsBooks} />
            </section>
        </div>
    )
}

export default Books
