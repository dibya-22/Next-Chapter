import { Skeleton } from "@/components/ui/skeleton"

const SectionHeaderSkeleton = () => (
    <div className="mb-4 sm:mb-6 lg:mb-8">
        <Skeleton className="h-8 sm:h-10 lg:h-12 w-48 sm:w-64 lg:w-80" />
    </div>
)

const BookCardSkeleton = () => (
    <div className="flex flex-col space-y-2 sm:space-y-3">
        <Skeleton className="aspect-[3/4] w-full rounded-lg" />
        <Skeleton className="h-4 sm:h-5 w-3/4" />
        <Skeleton className="h-3 sm:h-4 w-1/2" />
        <Skeleton className="h-4 sm:h-5 w-1/3" />
    </div>
)

const BooksGridSkeleton = ({ count = 5 }: { count?: number }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
        {Array.from({ length: count }).map((_, index) => (
            <BookCardSkeleton key={index} />
        ))}
    </div>
)

const CategorySectionSkeleton = () => (
    <div className="ml-2 sm:ml-10">
        <div className="mb-3 sm:mb-4 lg:mb-6">
            <Skeleton className="h-6 sm:h-7 lg:h-8 w-32 sm:w-40 lg:w-48" />
        </div>
        <BooksGridSkeleton />
    </div>
)

export default function Loading() {
    return (
        <div className="font-[family-name:var(--font-poppins)] w-full max-w-7xl mx-auto my-6 sm:my-10 px-3 sm:px-4 lg:px-8 pt-20 sm:pt-24 lg:pt-28 space-y-6 sm:space-y-8 lg:space-y-12">
            {/* Search Results Skeleton - Only show if there might be search params */}
            <section className="search-results">
                <SectionHeaderSkeleton />
                <BooksGridSkeleton />
                <div className="w-fit ml-4 sm:ml-10 mt-4 sm:mt-6">
                    <Skeleton className="h-4 sm:h-5 w-48 sm:w-64" />
                </div>
            </section>

            {/* Best Sellers Skeleton */}
            <section className="best-sellers">
                <SectionHeaderSkeleton />
                <BooksGridSkeleton count={10} />
            </section>

            {/* Top Rated Books Skeleton */}
            <section className="top-rated-books">
                <SectionHeaderSkeleton />
                <BooksGridSkeleton count={10} />
            </section>

            {/* Categories Skeleton */}
            <section className="categories space-y-6 sm:space-y-8 lg:space-y-10">
                <SectionHeaderSkeleton />

                {/* Fiction Category */}
                <CategorySectionSkeleton />

                {/* Non-Fiction Category */}
                <CategorySectionSkeleton />

                {/* Self-Help Category */}
                <CategorySectionSkeleton />

                {/* Business Category */}
                <CategorySectionSkeleton />
            </section>

            {/* New Arrivals Skeleton */}
            <section className="new-arrivals">
                <SectionHeaderSkeleton />
                <BooksGridSkeleton count={10} />
            </section>
        </div>
    )
}
