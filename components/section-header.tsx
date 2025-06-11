interface SectionHeaderProps {
    title: string
    className?: string
}

export function SectionHeader({ title, className = "" }: SectionHeaderProps) {
    return (
        <h1 className={`text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-gray-50 ${className}`}>
            {title}
        </h1>
    )
}
