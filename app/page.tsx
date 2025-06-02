import Warning from "@/components/Warning";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"

export default function Home() {
  return (
    <main className="font-[family-name:var(--font-poppins)] w-[70vw] mx-0 md:mx-auto mt-[11vh] flex flex-col items-center justify-center gap-16">
      <Warning />
      <div className="flex flex-col items-center justify-center gap-5 mt-20">
        <h1 className="text-7xl font font-bold mb-4 text-center">Discover Your Next Chapter</h1>
        <p className="text-lg text-center text-gray-600 dark:text-gray-400 -mt-7">Explore a curated selection of books tailored to your interests.</p>
        <Link href="/books"><Button variant={"custom2"}>Browse Books</Button></Link>
      </div>

      <div className="features flex flex-col items-center justify-center gap-5">
        <h2 className="text-3xl font-semibold mb-4 underline">Featured Books</h2>
        <div className="featuredBooks grid grid-cols-2 grid-rows-2 md:grid-cols-4 md:grid-rows-1 gap-10">
          <Link href="/" className="relative w-[180px] h-[270px] border-2 border-gray-200 dark:border-gray-700 overflow-hidden hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-300 ease-in-out">
            <Image
              src="/demo.jpg"
              alt="book cover"
              fill
              className="object-cover"
            />
          </Link>
          <Link href="/" className="relative w-[180px] h-[270px] border-2 border-gray-200 dark:border-gray-700 overflow-hidden hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-300 ease-in-out">
            <Image
              src="/demo2.jpg"
              alt="book cover"
              fill
              className="object-cover"
            />
          </Link>
          <Link href="/" className="relative w-[180px] h-[270px] border-2 border-gray-200 dark:border-gray-700 overflow-hidden hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-300 ease-in-out">
            <Image
              src="/demo.jpg"
              alt="book cover"
              fill
              className="object-cover"
            />
          </Link>
          <Link href="/" className="relative w-[180px] h-[270px] border-2 border-gray-200 dark:border-gray-700 overflow-hidden hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-300 ease-in-out">
            <Image
              src="/demo2.jpg"
              alt="book cover"
              fill
              className="object-cover"
            />
          </Link>
        </div>
      </div>

      <div className="categories flex flex-col items-center justify-center gap-3">
        <h2 className="text-3xl font-semibold mb-4 underline">Popular Categories</h2>
        <div className="categoriesList flex items-center justify-center gap-5 transition-all duration-300 ease-in-out">
          <Badge variant="default">Fiction</Badge>
          <Badge variant="default">Non-Fiction</Badge>
          <Badge variant="default">Mystery</Badge>
          <Badge variant="default">Fantasy</Badge>
        </div>
      </div>
    </main>
  );
}
