import { useState } from "react";
import { TOPNAV_HEADER } from "../constants";
import { getTheme, setTheme } from "../utils/theme";

type Props = {
    onMenuClick: () => void;
};

export default function TopNav({ onMenuClick }: Props) {

    const [themeOpen, setThemeOpen] = useState(false);
    const [theme, setThemeState] = useState<"System" | "Light" | "Dark">(
        getTheme()
    );

    const THEMES = ["System", "Light", "Dark"] as const;

    const changeTheme = (t: "System" | "Light" | "Dark") => {
        setTheme(t);
        setThemeState(t);
        setThemeOpen(false);
    };

    return (
        <nav className="h-14 flex items-center px-4 border-neutral-200 dark:border-neutral-700 bg-purple-600 dark:bg-purple-700">

            {/* Left: Hamburger */}
            <button
                onClick={onMenuClick}
                className="md:hidden p-2 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 cursor-pointer"
                aria-label="Open sidebar"
            >
                <svg
                    className="w-6 h-6 text-neutral-100"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                    />
                </svg>
            </button>

            {/* Title */}
            <div className="text-xs md:text-base ml-2 font-semibold text-neutral-100 truncate">
                {TOPNAV_HEADER}
            </div>

            {/* Theme dropdown */}
            <div className="ml-auto relative">
                <button
                onClick={() => setThemeOpen((v) => !v)}
                className="px-3 py-1.5 rounded-lg border-2 border-neutral-100 bg-purple-700 dark:bg-purple-800 hover:bg-purple-500 text-xs text-neutral-100 cursor-pointer"
                >
                Theme: {theme} <span className="hidden md:inline">▾</span>
                </button>

                {themeOpen && (
                <div className="z-100 absolute right-0 mt-2 w-36 rounded-lg border border-purple-300 dark:border-purple-900 bg-purple-600 dark:bg-purple-700 shadow-lg overflow-hidden">
                    {THEMES.map((t) => (
                    <button
                        key={t}
                        onClick={() => changeTheme(t)}
                        className="w-full text-left px-3 py-2 text-sm text-neutral-100 hover:bg-purple-500 cursor-pointer transition"
                    >
                        {t}
                    </button>
                    ))}
                </div>
                )}
            </div>

        </nav>
    );
}