import Warning from "@/components/Warning"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Sparkles, PersonStanding, Carrot, ArrowRight, BriefcaseBusiness } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import Chatbot from "@/components/Chatbot"

type Category = {
  name: string;
  url: string;
  icon: React.ElementType;
  count: string;
  color: string;
};

const categories = [
  { name: "Fiction", url: "/books?search=fiction", icon: BookOpen, count: "2,847 books", color: "#7C3AED" },
  { name: "Self Help", url: "/books?search=self-help", icon: PersonStanding, count: "1,234 books", color: "#059669" },
  { name: "Business", url: "/books?search=business", icon: BriefcaseBusiness, count: "987 books", color: "#F59E42" },
  { name: "Comic", url: "/books?search=comic", icon: Carrot, count: "1,567 books", color: "#EC4899" },
]

function CategoryCard({ category }: { category: Category }) {
  return (
    <Card
      key={category.name}
      className="group cursor-pointer border border-gray-200 bg-white dark:bg-[#3C3C3C] shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-xl"
    >
      <CardContent className="p-6 text-center">
        <div
          className="w-14 h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md group-hover:scale-110 transition-transform duration-300"
          style={{ backgroundColor: category.color }}
        >
          <category.icon className="h-7 w-7 lg:h-8 lg:w-8 text-white" />
        </div>
        <h3 className="text-lg lg:text-xl font-semibold mb-1 sm:mb-2">{category.name}</h3>
        <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">{category.count}</p>
        <Link href={category.url}>
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto rounded-full group-hover:bg-black group-hover:text-white dark:group-hover:bg-[#F5F5DC] dark:group-hover:text-[#2B2B2B] hover:border-gray-500 dark:hover:border-[#F5F5DC] transition-colors duration-300 bg-transparent text-xs sm:text-sm"
          >
            Explore
            <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

export default function Home() {
  return (
    <main className="font-[family-name:var(--font-poppins)] w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-[11vh] md:mt-7 flex flex-col items-center justify-center gap-8 sm:gap-12 lg:gap-16">
      <Warning />
      <Chatbot />

      <section className=" flex flex-col items-center justify-center gap-3 sm:gap-5 mt-8 sm:mt-12 lg:mt-20">
        <Badge variant="default" className="mb-2 sm:mb-6 text-xs sm:text-sm font-medium bg-[#E6E6C0] dark:bg-[#3C3C3C]">
          <Sparkles className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          Over 50,000 books available
        </Badge>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-tight mb-4 sm:mb- text-center">
          Discover Your Next{" "}
          <span className="bg-gradient-to-r from-[#2B2B2B] via-[#7D7D6A] to-[#F5F5DC] dark:from-[#F5F5DC] dark:via-[#C0C0AA] dark:to-[#2B2B2B] bg-clip-text text-transparent inline-block">
            Chapter
          </span>
        </h1>

        <p className="text-sm sm:text-base lg:text-lg text-center text-gray-600 dark:text-gray-400 max-w-2xl px-4">
          Explore a curated selection of books tailored to your interests.
        </p>

        <Link href="/books">
          <Button className="w-full sm:w-auto bg-black dark:bg-white dark:text-[#2B2B2B] text-[#F5F5DC] text-sm sm:text-base lg:text-lg px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 flex gap-2 rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform">
            Browse Books
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 transition-all duration-300 group-hover:translate-x-1" />
          </Button>
        </Link>
      </section>

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
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
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
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
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
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
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
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
              className="object-cover"
            />
          </Link>
        </div>
      </div>

      <section className="py-12 sm:py-16 lg:py-24 bg-muted/30 w-full">
        <div className="container px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-3 sm:mb-4 underline">
              Popular Categories
            </h2>
            <p className="text-sm mx-auto sm:text-base lg:text-lg text-center text-gray-600 dark:text-gray-400 max-w-2xl px-4">
              Explore our most loved genres and discover books that match your interests
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.name} category={category} />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
