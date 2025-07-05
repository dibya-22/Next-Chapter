"use client"

import { useState, useRef, useEffect } from "react"
import { X, BookOpen, Book, BotMessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import ChatInput from "./chat-input"
import { useUser } from "@clerk/nextjs"

interface Message {
    role: "user" | "assistant"
    content: string
}

const BoldText = ({ text }: { text: string }) => {
    const parts = []
    let currentIndex = 0
    
    const boldRegex = /\*+([^*]+?)\*+/g
    let match
    
    while ((match = boldRegex.exec(text)) !== null) {
        if (match.index > currentIndex) {
            parts.push(text.slice(currentIndex, match.index))
        }
        
        parts.push(<strong key={match.index}>{match[1]}</strong>)
        
        currentIndex = match.index + match[0].length
    }
    
    if (currentIndex < text.length) {
        parts.push(text.slice(currentIndex))
    }
    
    return <>{parts}</>
}

export default function Chatbot() {
    const { isSignedIn } = useUser();

    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isLoading])

    const toggleChat = () => {
        setIsOpen(!isOpen)
    }

    const handleSendMessage = async (message: string) => {
        if (!message.trim()) return

        // Add user message immediately
        const userMessage: Message = { role: "user", content: message }
        setMessages(prev => [...prev, userMessage])
        setIsLoading(true)

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message,
                    conversationHistory: messages
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                const errorMessage: Message = { 
                    role: "assistant", 
                    content: data.error || "Sorry, I encountered an error. Please try again." 
                }
                setMessages(prev => [...prev, errorMessage])
            } else {
                const assistantMessage: Message = { 
                    role: "assistant", 
                    content: data.message 
                }
                setMessages(prev => [...prev, assistantMessage])
            }
        } catch (error) {
            console.error("Error sending message:", error)
            const errorMessage: Message = { 
                role: "assistant", 
                content: "Sorry, I'm having trouble connecting. Please try again." 
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
            {/* Login Warning Tooltip */}
            {isOpen && !isSignedIn && (
                <div className="absolute bottom-16 right-0 sm:bottom-20 w-64 bg-white dark:bg-gray-900 border-2 border-gray-800 dark:border-gray-300 rounded-[0.5rem] shadow-2xl animate-in slide-in-from-bottom-4 duration-300 z-20">
                    {/* Tooltip Arrow */}
                    <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white dark:bg-gray-900 border-r-2 border-b-2 border-gray-800 dark:border-gray-300 transform rotate-45"></div>
                    
                    {/* Warning Content */}
                    <div className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Login Required</h3>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Please sign in to use the chat</p>
                            </div>
                        </div>
                        
                        <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                            You need to be signed in to access the Next Chapter assistant. Please log in to your account to start chatting about books and get personalized recommendations.
                        </div>
                        
                        <button 
                            onClick={toggleChat}
                            className="mt-3 w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-[0.5rem] transition-colors duration-200 border border-gray-300 dark:border-gray-600"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Chat Interface */}
            {isOpen && isSignedIn && (
                <div className="absolute bottom-16 right-0 sm:bottom-20 w-[calc(100vw-2rem)] sm:w-80 md:w-[500px] h-[70vh] sm:h-[600px] md:h-[700px] bg-white dark:bg-gray-900 border-2 border-gray-800 dark:border-gray-300 rounded-[0.5rem] shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 duration-300 overflow-hidden z-20">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 sm:p-6 bg-gray-100 dark:bg-gray-800 border-b-2 border-gray-800 dark:border-gray-300">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-800 dark:bg-gray-200 rounded-[0.5rem] flex items-center justify-center">
                                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white dark:text-gray-800" />
                            </div>
                            <div>
                                <span className="font-bold text-base sm:text-lg text-gray-900 dark:text-gray-100 font-serif">
                                    Next Chapter
                                </span>
                                <div className="text-xs text-gray-600 dark:text-gray-400 font-serif italic">Chat Assistant</div>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleChat}
                            className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-[0.5rem] border border-gray-400 dark:border-gray-600"
                        >
                            <X className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Button>
                    </div>

                    {/* Messages */}
                    <ScrollArea className="flex-1 p-4 sm:p-6 bg-amber-50/30 dark:bg-gray-900/50">
                        <div className="space-y-4 sm:space-y-6">
                            {messages.length === 0 && (
                                <div className="text-center py-6 sm:py-8">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-800 dark:bg-gray-200 rounded-[0.5rem] flex items-center justify-center mx-auto mb-3 sm:mb-4 border-2 border-gray-900 dark:border-gray-100">
                                        <Book className="w-6 h-6 sm:w-8 sm:h-8 text-white dark:text-gray-800" />
                                    </div>
                                    <div className="text-gray-700 dark:text-gray-300 text-sm mb-2 font-serif font-semibold">
                                        Welcome to Next Chapter!
                                    </div>
                                    <div className="text-gray-600 dark:text-gray-400 text-xs font-serif italic px-2">
                                        Your literary companion for book recommendations & inquiries
                                    </div>
                                </div>
                            )}
                            {messages.map((message, index) => (
                                <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                                    <div
                                        className={`flex gap-2 sm:gap-3 max-w-[90%] sm:max-w-[85%] ${message.role === "user" ? "flex-row-reverse" : ""}`}
                                    >
                                        {message.role === "assistant" && (
                                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-800 dark:bg-gray-200 rounded-[0.5rem] flex items-center justify-center flex-shrink-0 mt-1 border border-gray-900 dark:border-gray-100">
                                                <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-white dark:text-gray-800" />
                                            </div>
                                        )}
                                        <div
                                            className={`p-3 sm:p-4 text-xs sm:text-sm leading-relaxed font-serif rounded-[0.5rem] ${message.role === "user"
                                                    ? "bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 border-2 border-gray-900 dark:border-gray-100"
                                                    : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-2 border-gray-300 dark:border-gray-600 shadow-sm"
                                                }`}
                                        >
                                            <div className="whitespace-pre-wrap">
                                                <BoldText text={message.content} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="flex gap-2 sm:gap-3 max-w-[90%] sm:max-w-[85%]">
                                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-800 dark:bg-gray-200 rounded-[0.5rem] flex items-center justify-center flex-shrink-0 mt-1 border border-gray-900 dark:border-gray-100">
                                            <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-white dark:text-gray-800" />
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-[0.5rem] border-2 border-gray-300 dark:border-gray-600 shadow-sm">
                                            <div className="flex space-x-1 sm:space-x-2">
                                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-600 dark:bg-gray-400 rounded-full animate-bounce"></div>
                                                <div
                                                    className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-600 dark:bg-gray-400 rounded-full animate-bounce"
                                                    style={{ animationDelay: "0.1s" }}
                                                ></div>
                                                <div
                                                    className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-600 dark:bg-gray-400 rounded-full animate-bounce"
                                                    style={{ animationDelay: "0.2s" }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/* Invisible div to scroll to */}
                            <div ref={messagesEndRef} />
                        </div>
                    </ScrollArea>

                    {/* Chat Input */}
                    <ChatInput onSubmit={handleSendMessage} disabled={isLoading} />
                </div>
            )}

            {/* Chat Icon */}
            <Button
                onClick={toggleChat}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-800 dark:bg-gray-200 hover:bg-gray-900 dark:hover:bg-gray-100 text-white dark:text-gray-900 shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center group border-2 border-gray-900 dark:border-gray-100"
            >
                {isOpen ? <X className="w-6 h-6 sm:w-8 sm:h-8" /> : <BotMessageSquare className="w-6 h-6 sm:w-8 sm:h-8" />}
            </Button>
        </div>
    )
}
