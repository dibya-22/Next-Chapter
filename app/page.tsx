import Warning from "@/components/Warning"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="font-[family-name:var(--font-poppins)] w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-[11vh] md:mt-7 flex flex-col items-center justify-center gap-8 sm:gap-12 lg:gap-16">
      <Warning />

      <div className="flex flex-col items-center justify-center gap-3 sm:gap-5 mt-8 sm:mt-12 lg:mt-20">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-2 sm:mb-4 text-center leading-tight">
          Discover Your Next Chapter
        </h1>
        <p className="text-sm sm:text-base lg:text-lg text-center text-gray-600 dark:text-gray-400 max-w-2xl px-4">
          Explore a curated selection of books tailored to your interests.
        </p>
        <Link href="/books" className="mt-2 sm:mt-4">
          <Button variant={"custom2"}>
            Browse Books
          </Button>
        </Link>
      </div>

      <div className="features flex flex-col items-center justify-center gap-3 sm:gap-5 w-full">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-2 sm:mb-4 underline text-center">
          Featured Books
        </h2>
        <div className="featuredBooks grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-10 w-full max-w-4xl">
          <Link
            href={`/books?search=ikigai`}
            className="relative aspect-[2/3] border-2 border-gray-200 dark:border-gray-700 overflow-hidden hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-300 ease-in-out rounded-lg shadow-md hover:shadow-lg"
          >
            <Image
              src="https://books.google.com/books/content?id=CbouDwAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api"
              alt="Ikigai book cover"
              fill
              className="object-cover"
            />
          </Link>
          <Link
            href={`/books?search=atomic%20habit`}
            className="relative aspect-[2/3] border-2 border-gray-200 dark:border-gray-700 overflow-hidden hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-300 ease-in-out rounded-lg shadow-md hover:shadow-lg"
          >
            <Image
              src="https://books.google.com/books/content?id=fFCjDQAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api"
              alt="Atomic Habit book cover"
              fill
              className="object-cover"
            />
          </Link>
          <Link
            href={`/books?search=kaizen`}
            className="relative aspect-[2/3] border-2 border-gray-200 dark:border-gray-700 overflow-hidden hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-300 ease-in-out rounded-lg shadow-md hover:shadow-lg"
          >
            <Image
              src="https://books.google.com/books/content?id=5EORDwAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api"
              alt="Kaizen book cover"
              fill
              className="object-cover"
            />
          </Link>
          <Link
            href={`/books?search=${encodeURIComponent('vagabond 37')}`}
            className="relative aspect-[2/3] border-2 border-gray-200 dark:border-gray-700 overflow-hidden hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-300 ease-in-out rounded-lg shadow-md hover:shadow-lg"
          >
            <Image
              src="https://books.google.com/books/content?id=A3CPoAEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api"
              alt="Vagabond book cover"
              fill
              className="object-cover"
            />
          </Link>
        </div>
      </div>

      <div className="categories flex flex-col items-center justify-center gap-3 sm:gap-5 w-full">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-2 sm:mb-4 underline text-center">
          Popular Categories
        </h2>
        <div className="categoriesList flex flex-wrap items-center justify-center gap-3 sm:gap-4 lg:gap-5 transition-all duration-1000 ease-in-out max-w-2xl">
          <Link
            href={`/books?search=fiction`}
            className="capsule bg-gray-300 hover:bg-gray-300/50 dark:bg-gray-500 dark:hover:bg-gray-500/50  w-fit px-2 py-0.5 rounded-xl cursor-pointer transform hover:scale-105 active:scale-95 font-bold text-sm"
          >
            Fiction
          </Link>
          <Link
            href={`/books?search=comic`}
            className="capsule bg-gray-300 hover:bg-gray-300/50 dark:bg-gray-500 dark:hover:bg-gray-500/50  w-fit px-2 py-0.5 rounded-xl cursor-pointer transform hover:scale-105 active:scale-95 font-bold text-sm"
          >
            Comic
          </Link>
          <Link
            href={`/books?search=self-help`}
            className="capsule bg-gray-300 hover:bg-gray-300/50 dark:bg-gray-500 dark:hover:bg-gray-500/50  w-fit px-2 py-0.5 rounded-xl cursor-pointer transform hover:scale-105 active:scale-95 font-bold text-sm"
          >
            Self Help
          </Link>
          <Link
            href={`/books?search=business`}
            className="capsule bg-gray-300 hover:bg-gray-300/50 dark:bg-gray-500 dark:hover:bg-gray-500/50  w-fit px-2 py-0.5 rounded-xl cursor-pointer transform hover:scale-105 active:scale-95 font-bold text-sm"
          >
            Business
          </Link>
        </div>
      </div>
    </main>
  )
}
