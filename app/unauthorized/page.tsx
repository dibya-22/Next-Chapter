import Link from "next/link";

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f5f5dc] dark:bg-[#2b2b2b]">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-[0.5rem] shadow-md max-w-md w-full text-center border border-gray-200 dark:border-gray-700">
                <h1 className="text-2xl font-bold text-red-600 dark:text-red-500 mb-4">
                    Unauthorized Access
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    You don&#39;t have permission to access this page. Please contact an administrator if you believe this is an error.
                </p>
                <Link 
                    href="/"
                    className="inline-block bg-blue-600 dark:bg-blue-500 
                        text-white px-6 py-2 rounded-md 
                        hover:bg-blue-700 dark:hover:bg-blue-600 
                        transition-colors duration-200
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                        dark:focus:ring-offset-gray-800"
                >
                    Return to Home
                </Link>
            </div>
        </div>
    );
} 