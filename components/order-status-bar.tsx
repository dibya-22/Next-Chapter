import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

type OrderStatus = "Order Placed" | "Processing" | "Shipped" | "Out for Delivery" | "Delivered"

interface OrderStatusBarProps {
    currentStatus: OrderStatus | null
}

const OrderStatusBar = ({ currentStatus = "Order Placed" }: OrderStatusBarProps) => {
    const statuses: OrderStatus[] = ["Order Placed", "Processing", "Shipped", "Out for Delivery", "Delivered"]
    const safeStatus: OrderStatus = currentStatus ?? "Order Placed"
    const currentIndex = statuses.indexOf(safeStatus)

    return (
        <div className="w-full max-w-4xl mx-auto p-6">
            <div className="relative">
                {/* Progress Line */}
                <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200">
                    <div
                        className="h-full bg-green-500 transition-all duration-500 ease-in-out"
                        style={{ width: `${(currentIndex / (statuses.length - 1)) * 100}%` }}
                    />
                </div>

                {/* Status Steps */}
                <div className="relative flex justify-between">
                    {statuses.map((status, index) => {
                        const isCompleted = index <= currentIndex
                        const isCurrent = index === currentIndex

                        return (
                            <div key={status} className="flex flex-col items-center">
                                {/* Dot */}
                                <div
                                    className={cn(
                                        "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                                        isCompleted ? "bg-green-500 border-green-500 text-white" : "bg-white border-gray-300 text-gray-400",
                                    )}
                                >
                                    {isCompleted ? (
                                        <Check className="w-4 h-4" />
                                    ) : (
                                        <span className="text-sm font-medium">{index + 1}</span>
                                    )}
                                </div>

                                {/* Status Label */}
                                <div className="mt-3 text-center">
                                    <p
                                        className={cn(
                                            "text-sm font-medium transition-colors duration-300",
                                            isCompleted ? "text-green-600" : isCurrent ? "text-gray-900" : "text-gray-400",
                                        )}
                                    >
                                        {status}
                                    </p>
                                    {isCurrent && <p className="text-xs text-gray-500 mt-1">Current Status</p>}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default OrderStatusBar
