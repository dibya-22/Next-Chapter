"use client"
import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { type Book, type Categories, BookType } from "@/lib/types"
import { BooksGrid } from "@/components/books/books-grid"
import { SectionHeader } from "@/components/section-header"
import Loading from "@/components/books/book-loading"

const LoadingDots = () => (
    <span className="inline-flex items-center">
        Searching
        <span className="ml-1 flex gap-1">
            <span className="animate-[bounce_1s_infinite_0ms]">.</span>
            <span className="animate-[bounce_1s_infinite_200ms]">.</span>
            <span className="animate-[bounce_1s_infinite_400ms]">.</span>
        </span>
    </span>
)

export default function Books() {
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
    const [deepSearching, setDeepSearching] = useState(false)
    const [deepSearchAttempted, setDeepSearchAttempted] = useState(false)
    const [extensiveSearchAttempted, setExtensiveSearchAttempted] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const getBooks = async () => {
        try {
            const [bestSellers, topRated, newArrivals] = await Promise.all([
                fetch(`/api/books?type=${BookType.BEST_SELLERS}&limit=10`),
                fetch(`/api/books?type=${BookType.TOP_RATED}&limit=10`),
                fetch(`/api/books?type=${BookType.NEW_ARRIVALS}&limit=10`),
            ])

            setBestSellersBooks((await bestSellers.json()).data || [])
            setTopRatedBooks((await topRated.json()).data || [])
            setNewArrivalsBooks((await newArrivals.json()).data || [])

            const [fiction, nonFiction, selfHelp, business] = await Promise.all([
                fetch(`/api/books?type=${BookType.CATEGORIES}&limit=5&category=fiction`),
                fetch(`/api/books?type=${BookType.CATEGORIES}&limit=5&category=nonFiction`),
                fetch(`/api/books?type=${BookType.CATEGORIES}&limit=5&category=self-Help`),
                fetch(`/api/books?type=${BookType.CATEGORIES}&limit=5&category=business`),
            ])
            setCategoriesBooks({
                fiction: (await fiction.json()).data || [],
                nonFiction: (await nonFiction.json()).data || [],
                selfHelp: (await selfHelp.json()).data || [],
                business: (await business.json()).data || [],
            })
        } catch {
            // do nothing
        } finally {
            setIsLoading(false)
        }
    }

    // Search
    const getSearchResults = useCallback(async () => {
        const searchResults = await fetch(`/api/books?type=${BookType.SEARCH_RESULTS}&search=${search}`)
        const data = await searchResults.json()
        setSearchResultsBooks(data.data || data.books || [])
    }, [search])

    const handleDeepSearch = async () => {
        if (!deepSearching) {
            setDeepSearching(true)
            setDeepSearchAttempted(true)
        }

        if (search) {
            try {
                const res = await fetch(`/api/search-books?query=${encodeURIComponent(search)}`)
                const data = await res.json()
                if (data.error) {
                    setSearchResultsBooks([])
                } else {
                    setSearchResultsBooks(data.books || data.data || [])
                }
            } catch {
                setSearchResultsBooks([])
            } finally {
                setDeepSearching(false)
            }
        }
    }

    const handleExtensiveSearch = async () => {
        if (!deepSearching) {
            setDeepSearching(true)
            setExtensiveSearchAttempted(true)
        }

        if (search) {
            try {
                const searchTerms = [
                    search,
                    search.split(' ').join(' OR '),
                    search + ' book',
                    search.split(' ').slice(0, 2).join(' ')
                ]
                const allResults = []
                for (const term of searchTerms) {
                    const res = await fetch(`/api/search-books?query=${encodeURIComponent(term)}`)
                    const data = await res.json()
                    if (data.books || data.data) {
                        allResults.push(...(data.books || data.data || []))
                    }
                }
                const uniqueResults = allResults.filter((book, index, self) =>
                    index === self.findIndex((b) => b.isbn === book.isbn)
                )
                setSearchResultsBooks(uniqueResults)
            } catch {
                setSearchResultsBooks([])
            } finally {
                setDeepSearching(false)
            }
        }
    }

    useEffect(() => {
        getBooks()
    }, [])

    useEffect(() => {
        if (search) {
            getSearchResults()
            setDeepSearching(false)
            setDeepSearchAttempted(false)
            setExtensiveSearchAttempted(false)
        }
    }, [search, getSearchResults])

    if (isLoading) {
        return <Loading />
    }

    return (
        <div className="font-[family-name:var(--font-poppins)] w-full max-w-7xl mx-auto my-6 sm:my-10 px-3 sm:px-4 lg:px-8 pt-20 sm:pt-24 lg:pt-28 space-y-6 sm:space-y-8 lg:space-y-12">
            {/* Search Results */}
            {search && (
                <section className="search-results">
                    {searchResultsBooks.length > 0 ? (
                        <>
                            <SectionHeader title={`Search Results for "${search}"`} />
                            <BooksGrid books={searchResultsBooks} />
                            {searchResultsBooks.length < 5 && !deepSearching && !deepSearchAttempted && (
                                <div onClick={handleDeepSearch} className="w-fit ml-4 sm:ml-10 mt-4 sm:mt-6 text-blue-500 cursor-pointer hover:text-blue-600 text-sm sm:text-base">
                                    Found only {searchResultsBooks.length} results. Try Deep Search...
                                </div>
                            )}
                            {searchResultsBooks.length < 5 && deepSearching && (
                                <div className="w-fit ml-4 sm:ml-10 mt-4 sm:mt-6 text-blue-500 text-sm sm:text-base">
                                    <LoadingDots />
                                </div>
                            )}
                            {searchResultsBooks.length < 5 && deepSearchAttempted && !deepSearching && !extensiveSearchAttempted && (
                                <div className="w-fit ml-4 sm:ml-10 mt-4 sm:mt-6 text-blue-500 cursor-pointer hover:text-blue-600 text-sm sm:text-base" onClick={handleExtensiveSearch}>
                                    Not Satisfied? Try Again...
                                </div>
                            )}
                            {searchResultsBooks.length < 5 && extensiveSearchAttempted && !deepSearching && (
                                <div className="w-fit ml-4 sm:ml-10 mt-4 sm:mt-6 text-gray-500 text-sm sm:text-base">
                                    No more books found in our database or Google Books API.
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <SectionHeader title={`No Results Found for "${search}"`} />
                            <BooksGrid books={searchResultsBooks} />
                            {!deepSearching && !deepSearchAttempted && (
                                <div onClick={handleDeepSearch} className="w-fit ml-4 sm:ml-10 mt-4 sm:mt-6 text-blue-500 cursor-pointer hover:text-blue-600 text-sm sm:text-base">
                                    Try Deep Search...
                                </div>
                            )}
                            {deepSearching && (
                                <div className="w-fit ml-4 sm:ml-10 mt-4 sm:mt-6 text-blue-500 text-sm sm:text-base">
                                    <LoadingDots />
                                </div>
                            )}
                            {deepSearchAttempted && !deepSearching && searchResultsBooks.length === 0 && !extensiveSearchAttempted && (
                                <div className="w-fit ml-4 sm:ml-10 mt-4 sm:mt-6 text-blue-500 cursor-pointer hover:text-blue-600 text-sm sm:text-base" onClick={handleExtensiveSearch}>
                                    Not Satisfied? Try Again...
                                </div>
                            )}
                            {extensiveSearchAttempted && !deepSearching && searchResultsBooks.length === 0 && (
                                <div className="w-fit ml-4 sm:ml-10 mt-4 sm:mt-6 text-gray-500 text-sm sm:text-base">
                                    No books found in our database or Google Books API.
                                </div>
                            )}
                        </>
                    )}
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
            <section className="categories space-y-6 sm:space-y-8 lg:space-y-10">
                <SectionHeader title="Categories" />

                {/* Category - Fiction */}
                <div className="fiction ml-2 sm:ml-10">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 lg:mb-6 text-gray-800 dark:text-gray-200">Fiction</h2>
                    <BooksGrid books={categoriesBooks.fiction} />
                </div>

                {/* Category - Non-Fiction */}
                <div className="non-fiction ml-2 sm:ml-10">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 lg:mb-6 text-gray-800 dark:text-gray-200">Non-Fiction</h2>
                    <BooksGrid books={categoriesBooks.nonFiction} />
                </div>

                {/* Category - Self-Help */}
                <div className="self-help ml-2 sm:ml-10">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 lg:mb-6 text-gray-800 dark:text-gray-200">Self-Help</h2>
                    <BooksGrid books={categoriesBooks.selfHelp} />
                </div>

                {/* Category - Business */}
                <div className="business ml-2 sm:ml-10">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 lg:mb-6 text-gray-800 dark:text-gray-200">Business</h2>
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