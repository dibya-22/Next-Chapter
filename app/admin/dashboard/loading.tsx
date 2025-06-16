import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

function MetricCardSkeleton() {
    return (
        <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-5 w-5 rounded-full" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-8 w-[120px] mb-2" />
                <Skeleton className="h-3 w-[140px]" />
            </CardContent>
        </Card>
    )
}

function MetricSectionSkeleton({ 
    gridCols = "md:grid-cols-2 lg:grid-cols-4",
    itemCount = 4 
}: { 
    gridCols?: string;
    itemCount: number;
}) {
    return (
        <div className="space-y-4">
            <div>
                <Skeleton className="h-6 w-[200px] mb-2" />
                <Skeleton className="h-4 w-[300px]" />
            </div>
            <div className={`grid gap-4 ${gridCols}`}>
                {[...Array(itemCount)].map((_, i) => (
                    <MetricCardSkeleton key={i} />
                ))}
            </div>
        </div>
    )
}

export default function DashboardLoading() {
    return (
        <div className="space-y-4 p-4">
            <div>
                <Skeleton className="h-8 w-[200px] mb-2" />
                <Skeleton className="h-4 w-[400px]" />
            </div>

            <Separator className="my-4 bg-gray-200 dark:bg-gray-700" />

            <MetricSectionSkeleton itemCount={3} />

            <Separator className="my-4 bg-gray-200 dark:bg-gray-700" />

            <MetricSectionSkeleton itemCount={5} />

            <Separator className="my-4 bg-gray-200 dark:bg-gray-700" />

            <MetricSectionSkeleton itemCount={4} />

            <Separator className="my-4 bg-gray-200 dark:bg-gray-700" />

            <MetricSectionSkeleton itemCount={3} gridCols="md:grid-cols-3 lg:grid-cols-4" />
        </div>
    )
} 