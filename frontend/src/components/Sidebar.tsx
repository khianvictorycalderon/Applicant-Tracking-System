import { Link, useLocation, useNavigate } from "react-router-dom";
import { BUILT_IN_API_URLS, SIDEBAR_BUTTONS, type UserRole } from "../constants";
import axios from "axios";

type Props = {
    open: boolean;
    setOpen: (v: boolean) => void;
    user: {
        role: UserRole;
    };
};

type SidebarItem = {
    label: string;
    path?: string;
    icon?: string;
    action?: "logout";
};

export default function Sidebar({ open, setOpen, user }: Props) {
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path: string) =>
        location.pathname === path || location.pathname.startsWith(path + "/");

    const filteredButtons = SIDEBAR_BUTTONS.filter(
        (item) => item.roles.includes(user.role)
    );

    // ✅ keep logout button
    const SIDEBAR_ITEMS: SidebarItem[] = [
        ...filteredButtons,
        {
            label: "Logout",
            action: "logout",
        },
    ];

    const handleLogout = async () => {
        try {
            await axios.delete(BUILT_IN_API_URLS.logout, {
                withCredentials: true,
            });

            navigate("/login");
        } catch (err) {
            console.error("Logout failed", err);
        }
    };

    return (
        <>
            {/* BACKDROP */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 md:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <aside
                className={`
                    fixed md:static z-50
                    top-0 left-0 h-screen w-64
                    bg-neutral-50 dark:bg-neutral-800
                    flex flex-col
                    overflow-y-auto
                    transform transition-transform duration-200
                    border-r border-neutral-200 dark:border-neutral-700
                    ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
                `}
            >
                {/* HEADER */}
                <div className="md:hidden relative p-4 pb-8 font-semibold text-neutral-900 dark:text-neutral-100 border-b border-neutral-200 dark:border-neutral-800">    
                    <button
                        onClick={() => setOpen(false)}
                        className="md:hidden absolute right-3 top-3 p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* NAVIGATION */}
                <nav className="p-2 space-y-1 flex-1">
                    {SIDEBAR_ITEMS.map((item, idx) => {
                        // 🔥 LOGOUT BUTTON
                        if (item.action === "logout") {
                            return (
                                <button
                                    key={`logout-${idx}`}
                                    onClick={handleLogout}
                                    className="
                                        cursor-pointer
                                        w-full text-left flex items-center gap-2 px-3 py-2 rounded-md text-sm
                                        text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30
                                    "
                                >
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
                                        />
                                    </svg>

                                    Logout
                                </button>
                            );
                        }

                        // 🔥 NORMAL NAV ITEM
                        return (
                            <Link
                                key={item.path}
                                to={item.path!}
                                onClick={() => setOpen(false)}
                                className={`
                                    flex items-center gap-2 px-3 py-2 rounded-md text-sm transition
                                    ${
                                        isActive(item.path!)
                                            ? "bg-purple-600 dark:bg-purple-500 text-neutral-100"
                                            : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                    }
                                `}
                            >
                                <span
                                    className="w-5 h-5"
                                    dangerouslySetInnerHTML={{ __html: item.icon! }}
                                />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
}