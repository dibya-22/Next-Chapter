"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ChatInputProps {
    onSubmit: (message: string) => void
    disabled?: boolean
}

export default function ChatInput({ onSubmit, disabled = false }: ChatInputProps) {
    const [message, setMessage] = useState("")
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const adjustHeight = () => {
        const textarea = textareaRef.current
        if (textarea) {
            textarea.style.height = "auto"
            const scrollHeight = textarea.scrollHeight
            const lineHeight = 24 // approximate line height in pixels
            const maxLines = 4
            const maxHeight = lineHeight * maxLines
            if (scrollHeight <= maxHeight) {
                textarea.style.height = `${scrollHeight}px`
            } else {
                textarea.style.height = `${maxHeight}px`
            }
        }
    }

    useEffect(() => {
        adjustHeight()
    }, [message])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (message.trim() && !disabled) {
            onSubmit(message.trim())
            setMessage("")
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
        }
    }
    return (
        <div className="p-4 sm:p-6 border-t-2 border-gray-800 dark:border-gray-300 bg-gray-50 dark:bg-gray-800">
            <form onSubmit={handleSubmit} className="relative">
                <div className="flex items-end bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus-within:border-gray-400 dark:focus-within:border-gray-300 focus-within:shadow-md transition-all duration-200">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about books, authors, or recommendations..."
                        className="flex-1 resize-none border-0 bg-transparent px-3 sm:px-4 py-2 sm:py-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-0 min-h-[24px] max-h-[96px] overflow-y-auto leading-6 font-[family-name:var(--font-poppins)] text-xs sm:text-sm"
                        rows={1}
                        disabled={disabled}
                    />
                    <div className="flex items-end p-1.5 sm:p-2">
                        <Button
                            type="submit"
                            size="sm"
                            disabled={!message.trim() || disabled}
                            className="rounded-[0.5rem] bg-gray-900 dark:bg-gray-200 hover:bg-gray-800 dark:hover:bg-gray-100 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200 p-1.5 sm:p-2 text-white dark:text-gray-900"
                        >
                            <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                    </div>
                </div>
            </form>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2 font-[family-name:var(--font-poppins)] hidden sm:block">
                Press Enter to send, Shift + Enter for new line
            </p>
        </div>
    )
}
