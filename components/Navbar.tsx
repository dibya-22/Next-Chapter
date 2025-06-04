"use client";
import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import useSound from 'use-sound';
import { EB_Garamond } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from "@/components/ui/button"
import {
    SignInButton,
    SignedIn,
    SignedOut,
    UserButton,
} from '@clerk/nextjs'
import { redirect } from "next/navigation";


const ebGaramond = EB_Garamond({
    variable: "--font-eb-garamond",
    subsets: ['latin'],
    weight: ['600'],
    style: ['italic'],
    display: 'swap',
});



const Navbar = () => {
    const { theme, setTheme, systemTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
    const [isSearchBarOn, setIsSearchBarOn] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Sounds
    const [switchon] = useSound('/sounds/switch_on.mp3', { volume: 0.5 });
    const [switchoff] = useSound('/sounds/switch_off.mp3', { volume: 0.5 });
    const [openmenu] = useSound('/sounds/open-menu.wav', { volume: 0.5 });
    const [closemenu] = useSound('/sounds/close-menu.wav', { volume: 0.2 });
    const [pop] = useSound('/sounds/pop.wav', { volume: 0.5 });

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggletheme = () => {
        if (theme === "dark") {
            setTheme("light");
            switchon();
        } else {
            setTheme("dark");
            switchoff();
        }
    }

    const toggleMenu = () => {
        if (isMenuOpen) {
            closemenu();
        } else {
            openmenu();
        }
        setIsMenuOpen(!isMenuOpen);
    };

    const toggleCategoryMenu = () => {
        setIsCategoryMenuOpen(!isCategoryMenuOpen);
    };

    const handleSearch = () => {
        setIsSearchBarOn(!isSearchBarOn);
        pop();
    }

    const handleSearchQuerychange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    }

    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setSearchQuery("");
        const input = document.getElementById("search-bar");
        input?.blur();
        setIsSearchFocused(false);

        redirect(`/books?search=${encodeURIComponent(searchQuery)}`);
    }

    const handleSearchFocus = () => {
        setIsSearchFocused(true);
    }

    const handleSearchBlur = () => {
        setIsSearchFocused(false);
    }

    const currentTheme = theme === "system" ? systemTheme : theme;
    if (!mounted) {
        return null;
    }


    return (
        <nav className={`${ebGaramond.variable} bg-[#F5F5DC] dark:bg-[#2B2B2B] w-screen h-[10vh] px-3 md:px-[15vw] flex items-center justify-between fixed top-0 left-1/2 transform -translate-x-1/2 z-50`}>
            <div className="logo font-[family-name:var(--font-eb-garamond)] text-xl md:text-3xl font-bold">
                <Link href={"/"} className='flex gap-2 items-center'>
                    <span>NextChapter</span>
                    <Image
                        src="/icons/book.png"
                        width={0}
                        height={0}
                        sizes='100vw'
                        alt="a book with bookmark icon"
                        className={`w-[30px] h-[30px] md:w-[40px] md:h-[40px] ${currentTheme === "dark" ? "invert" : "invert-0"}`}
                    />
                </Link>
            </div>

            <div className={`search-bar ${isSearchBarOn ? "visible opacity-100 translate-x-0" : "invisible opacity-0 translate-x-60"} ${isSearchFocused ? "scale-105" : "scale-100"} transform  transition-all duration-500 ease-in-out`}>
                <form onSubmit={handleSearchSubmit} className='relative flex items-center'>
                    <input
                        type="text"
                        onChange={handleSearchQuerychange}
                        value={searchQuery}
                        name='search'
                        id='search-bar'
                        placeholder='Search for books, authors, genres...'
                        autoComplete='off'
                        onFocus={handleSearchFocus}
                        onBlur={handleSearchBlur}
                        className='w-[30vw] h-10 px-6 py-3 rounded-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800'
                    />
                    <button
                        type='button'
                        onClick={handleSearchSubmit}
                        className='absolute right-12 w-8 h-8 flex items-center justify-center'
                    >
                        <Image
                            src="/icons/search.png"
                            width={30}
                            height={30}
                            alt="search icon"
                            className={`${currentTheme === "dark" ? "invert opacity-75 hover:opacity-100" : "invert-0 opacity-75 hover:opacity-100"}`}
                        />
                    </button>
                    <button
                        type='button'
                        onClick={handleSearch}
                        className='absolute right-3 w-8 h-8 flex items-center justify-center'
                    >
                        <Image
                            src="/icons/close.png"
                            width={20}
                            height={20}
                            alt="close icon for search"
                            className='invert-0 opacity-75 hover:opacity-100 dark:invert'
                        />
                    </button>
                </form>
            </div>

            <div className="icons flex items-center gap-4">
                <div className='flex items-center gap-4'>
                    <div className="menu flex items-center gap-4 transition-all duration-500 ease-in-out">
                        <div className={`${isMenuOpen ? "flex visible opacity-100" : "hidden invisible opacity-0"} items-center gap-4 border px-4 py-2 rounded-full bg-gray-100 dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-800 shadow-[0_10px_30px_rgba(0,0,0,0.15)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.4)] transition-all duration-500 ease-in-out`}>
                            <Link href="/" className='w-8 h-8 flex items-center justify-center hover:animate-wiggle'>
                                <Image
                                    src="/icons/home.png"
                                    width={20}
                                    height={20}
                                    alt="home icon"
                                    className='dark:invert'
                                />
                            </Link>
                            <button onClick={handleSearch} className={`w-8 h-8 flex items-center justify-center hover:animate-wiggle active:animate-switch ${isSearchBarOn ? "hidden" : "block"}`}>
                                <Image
                                    src="/icons/search.png"
                                    width={30}
                                    height={30}
                                    alt="search icon"
                                    className='dark:invert'
                                />
                            </button>
                            <Link href="/cart" className="w-8 h-8 flex items-center justify-center hover:animate-wiggle">
                                <Image
                                    src="/icons/cart.png"
                                    width={23}
                                    height={23}
                                    alt="cart icon"
                                    className='dark:invert'
                                />
                            </Link>
                            <button onClick={toggleCategoryMenu} className="w-8 h-8 flex items-center justify-center hover:animate-wiggle active:animate-switch">
                                <Image
                                    src={isCategoryMenuOpen ? "/icons/category-open.png" : "/icons/category-close.png"}
                                    width={isCategoryMenuOpen ? 23 : 20}
                                    height={isCategoryMenuOpen ? 23 : 20}
                                    alt="category icon"
                                    className='dark:invert'
                                />
                            </button>
                        </div>
                        <button onClick={toggleMenu} className="w-8 h-8 flex items-center justify-center hover:animate-wiggle active:animate-switch">
                            <Image
                                src={isMenuOpen ? "/icons/close.png" : "/icons/menu.png"}
                                width={isMenuOpen ? 20 : 25}
                                height={isMenuOpen ? 20 : 25}
                                alt="menu icon"
                                className='dark:invert'
                            />
                        </button>
                    </div>
                    <button
                        onClick={toggletheme}
                        className="w-8 h-8 flex items-center justify-center hover:animate-wiggle active:animate-switch">
                        <Image
                            src={currentTheme === "dark" ? "/icons/moon.png" : "/icons/sun.png"}
                            width={20}
                            height={20}
                            alt="sun or moon"
                            className='dark:invert'
                        />
                    </button>
                </div>

                <div className='login flex items-center'>
                    <SignedOut>
                        <SignInButton>
                            <Button variant="custom" size="default">Login</Button>
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                        <UserButton
                            appearance={{
                                elements: {
                                    footerBox: "hidden",
                                    footerAction: "hidden",
                                    userButtonPopoverFooter: "hidden",
                                },
                            }}
                        />
                    </SignedIn>
                </div>
            </div>


        </nav>
    )
}

export default Navbar
