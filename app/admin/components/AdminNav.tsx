import Link from "next/link"
import { Users, ChartBarBig, Book, BookPlus, Package2} from "lucide-react"
import { usePathname } from "next/navigation"

const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: ChartBarBig },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/orders", label: "Orders", icon: Package2 },
    { href: "/admin/books", label: "Books", icon: Book },
    { href: "/admin/add-book", label: "Add Book", icon: BookPlus },
]

export default function AdminNav() {
    const pathname = usePathname();
    return (
        <nav className="space-y-2">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Admin Panel</h2>
            {navItems.map((item) => {
                const Icon = item.icon
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 ${pathname === item.href ? 'bg-gray-500 dark:bg-gray-600' : ''}`}
                        title={item.label}
                    >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                    </Link>
                )
            })}
        </nav>
    )
}
