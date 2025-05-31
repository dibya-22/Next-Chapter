import { Button } from "@/components/ui/button";
import Warning from "@/components/Warning";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="font-[family-name:var(--font-poppins)] w-[70vw] mx-auto mt-[11vh] flex flex-col items-center justify-center gap-16">
      <Warning />
      <div className="flex flex-col items-center justify-center gap-5 mt-20">
        <h1 className="text-7xl font font-bold mb-4 text-center">Discover Your Next Chapter</h1>
        <p className="text-lg text-center text-gray-600 dark:text-gray-400 -mt-7">Explore a curated selection of books tailored to your interests.</p>
        <Button variant={"custom2"}>Browse Books</Button>
      </div>

      <div className="features flex flex-col items-center justify-center gap-5">
        <h2 className="text-3xl font-semibold mb-4 underline">Featured Books</h2>
        <div className="featuredBooks grid grid-cols-2 grid-rows-2 md:grid-cols-4 md:grid-rows-1 gap-10">
          <Link href="/">
            <Image width={180} height={270} src="/demo.jpg" alt="book cover" />
          </Link>
          <Link href="/">
            <Image width={180} height={270} src="/demo.jpg" alt="book cover" />
          </Link>
          <Link href="/">
            <Image width={180} height={270} src="/demo.jpg" alt="book cover" />
          </Link>
          <Link href="/">
            <Image width={180} height={270} src="/demo.jpg" alt="book cover" />
          </Link>
        </div>
      </div>

      <div className="categories">
        <h2 className="text-3xl font-semibold mb-4 underline">Popular Categories</h2>
      </div>
    </main>
  );
}
