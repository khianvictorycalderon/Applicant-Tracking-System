import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import { ROLE_BASED_API_URLS } from "../constants";

// ─── Types ────────────────────────────────────────────────────────────────────

type User = {
    id: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    birth_date: string;
    email: string;
    user_role: string;
    created_at: string;
    updated_at: string;
};

type EducationEntry  = { school: string; degree: string; year_started: number; year_ended: number | null };
type WorkEntry       = { company_name: string; position: string; year_started: number; year_ended: number | null };

type Applicant = {
    id: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    contact_number: string;
    email: string;
    education: EducationEntry[];
    work_experience: WorkEntry[];
    skills: string[];
    notes?: string;
    status: string;
    created_at: string;
    updated_at: string;
};

type PaginatedApplicants = {
    items: Applicant[];
    total_count: number;
    page: number;
    page_size: number;
    total_pages: number;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLE_BADGE: Record<string, string> = {
    Admin:  "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    Member: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
};

const STATUS_COLORS: Record<string, string> = {
    Applied:               "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    "Under Review":        "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    Shortlisted:           "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
    "Interview Scheduled": "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    Interviewed:           "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
    Offered:               "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
    Hired:                 "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    Rejected:              "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    Withdrawn:             "bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300",
};

const PAGE_SIZE = 10;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fullName = (o: { first_name: string; middle_name?: string; last_name: string }) =>
    [o.first_name, o.middle_name, o.last_name].filter(Boolean).join(" ");

const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

// ─── Applicant Detail Modal ───────────────────────────────────────────────────

function ApplicantDetailModal({ applicant, onClose }: { applicant: Applicant; onClose: () => void }) {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700 shrink-0">
                    <h2 className="font-semibold text-neutral-800 dark:text-neutral-100">Applicant Details</h2>
                    <button onClick={onClose} className="cursor-pointer p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-4 overflow-y-auto flex-1 space-y-4 text-sm">
                    {/* Name + status */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xl font-bold text-neutral-800 dark:text-neutral-100">{fullName(applicant)}</p>
                            <p className="text-neutral-500 dark:text-neutral-400">{applicant.email} · {applicant.contact_number}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[applicant.status] ?? "bg-neutral-100 text-neutral-600"}`}>
                            {applicant.status}
                        </span>
                    </div>

                    {/* Education */}
                    {applicant.education.length > 0 && (
                        <ViewSection title="Education">
                            {applicant.education.map((e, i) => (
                                <div key={i} className="text-neutral-700 dark:text-neutral-300">
                                    <span className="font-medium">{e.degree}</span> — {e.school} ({e.year_started}–{e.year_ended ?? "Present"})
                                </div>
                            ))}
                        </ViewSection>
                    )}

                    {/* Work Experience */}
                    {applicant.work_experience.length > 0 && (
                        <ViewSection title="Work Experience">
                            {applicant.work_experience.map((w, i) => (
                                <div key={i} className="text-neutral-700 dark:text-neutral-300">
                                    <span className="font-medium">{w.position}</span> — {w.company_name} ({w.year_started}–{w.year_ended ?? "Present"})
                                </div>
                            ))}
                        </ViewSection>
                    )}

                    {/* Skills */}
                    {applicant.skills.length > 0 && (
                        <ViewSection title="Skills">
                            <div className="flex flex-wrap gap-2">
                                {applicant.skills.map(s => (
                                    <span key={s} className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">{s}</span>
                                ))}
                            </div>
                        </ViewSection>
                    )}

                    {/* Notes */}
                    {applicant.notes && (
                        <ViewSection title="Notes">
                            <p className="text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap">{applicant.notes}</p>
                        </ViewSection>
                    )}

                    <p className="text-xs text-neutral-400 dark:text-neutral-500">
                        Added {new Date(applicant.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                </div>
                <div className="flex justify-end gap-2 p-4 border-t border-neutral-200 dark:border-neutral-700 shrink-0">
                    <button onClick={onClose} className="cursor-pointer px-4 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">Close</button>
                </div>
            </div>
        </div>
    );
}

// ─── Applicants List Modal ────────────────────────────────────────────────────

function ApplicantsModal({ user, onClose }: { user: User; onClose: () => void }) {
    const [data, setData] = useState<PaginatedApplicants | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [viewingApplicant, setViewingApplicant] = useState<Applicant | null>(null);

    const fetchApplicants = useCallback(async (p: number, s: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(
                `${ROLE_BASED_API_URLS.admin}/users/${user.id}/applicants`,
                { params: { page: p, pageSize: PAGE_SIZE, search: s || undefined }, withCredentials: true }
            );
            setData(res.data);
        } catch (e: unknown) {
            setError(String(e));
        } finally {
            setLoading(false);
        }
    }, [user.id]);

    useEffect(() => { fetchApplicants(page, search); }, [fetchApplicants, page, search]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape" && !viewingApplicant) onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose, viewingApplicant]);

    const handleSearch = () => { setPage(1); setSearch(searchInput); };
    const handleSearchKey = (e: React.KeyboardEvent) => { if (e.key === "Enter") handleSearch(); };

    return (
        <>
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                onClick={e => { if (e.target === e.currentTarget) onClose(); }}
            >
                <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700 w-full max-w-3xl max-h-[85vh] flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 shrink-0">
                        <div>
                            <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-100">
                                {fullName(user)}'s Applicants
                            </h2>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{user.email}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Search */}
                    <div className="px-6 py-3 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search by name, email, or contact..."
                                    value={searchInput}
                                    onChange={e => setSearchInput(e.target.value)}
                                    onKeyDown={handleSearchKey}
                                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <button onClick={handleSearch} className="cursor-pointer px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors">
                                Search
                            </button>
                            {search && (
                                <button onClick={() => { setSearchInput(""); setSearch(""); setPage(1); }} className="cursor-pointer px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Table body */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center h-40 text-neutral-500 dark:text-neutral-400 text-sm">Loading applicants...</div>
                        ) : error ? (
                            <div className="p-6 text-red-500 text-sm">{error}</div>
                        ) : !data || data.items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-neutral-400 dark:text-neutral-500 text-sm gap-2">
                                <svg className="w-8 h-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m2 8H7a2 2 0 01-2-2V6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v10a2 2 0 01-2 2z" />
                                </svg>
                                {search ? "No applicants match your search." : "This member has no applicants yet."}
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="sticky top-0 bg-neutral-50 dark:bg-neutral-900/80 border-b border-neutral-200 dark:border-neutral-700">
                                    <tr>
                                        <th className="text-left px-5 py-3 font-semibold text-neutral-600 dark:text-neutral-400">Name</th>
                                        <th className="text-left px-5 py-3 font-semibold text-neutral-600 dark:text-neutral-400">Contact</th>
                                        <th className="text-left px-5 py-3 font-semibold text-neutral-600 dark:text-neutral-400">Email</th>
                                        <th className="text-left px-5 py-3 font-semibold text-neutral-600 dark:text-neutral-400">Status</th>
                                        <th className="text-left px-5 py-3 font-semibold text-neutral-600 dark:text-neutral-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.items.map(a => (
                                        <tr key={a.id} className="border-b last:border-0 border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                                            <td className="px-5 py-3 font-medium text-neutral-800 dark:text-neutral-100">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-300 font-semibold text-xs shrink-0">
                                                        {a.first_name[0]}{a.last_name[0]}
                                                    </div>
                                                    {fullName(a)}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-neutral-600 dark:text-neutral-300">{a.contact_number}</td>
                                            <td className="px-5 py-3 text-neutral-600 dark:text-neutral-300">{a.email}</td>
                                            <td className="px-5 py-3">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[a.status] ?? "bg-neutral-100 text-neutral-600"}`}>
                                                    {a.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <button
                                                    onClick={() => setViewingApplicant(a)}
                                                    title="View details"
                                                    className="cursor-pointer p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Footer — count + pagination */}
                    {data && data.total_count > 0 && (
                        <div className="flex items-center justify-between px-6 py-3 border-t border-neutral-200 dark:border-neutral-700 shrink-0 bg-neutral-50 dark:bg-neutral-900/50 rounded-b-2xl">
                            <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                {data.total_count > PAGE_SIZE
                                    ? `Showing ${((data.page - 1) * data.page_size) + 1}–${Math.min(data.page * data.page_size, data.total_count)} of ${data.total_count}`
                                    : `${data.total_count} applicant${data.total_count !== 1 ? "s" : ""}`}
                                {search && ` matching "${search}"`}
                            </span>
                            {data.total_pages > 1 && (
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page <= 1}
                                        className="cursor-pointer disabled:opacity-40 disabled:cursor-default px-3 py-1 text-xs rounded border border-neutral-200 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition-colors"
                                    >Prev</button>
                                    {Array.from({ length: data.total_pages }, (_, i) => i + 1).map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p)}
                                            className={`cursor-pointer px-3 py-1 text-xs rounded border transition-colors ${p === page ? "bg-purple-600 text-white border-purple-600" : "border-neutral-200 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300"}`}
                                        >{p}</button>
                                    ))}
                                    <button
                                        onClick={() => setPage(p => Math.min(data.total_pages, p + 1))}
                                        disabled={page >= data.total_pages}
                                        className="cursor-pointer disabled:opacity-40 disabled:cursor-default px-3 py-1 text-xs rounded border border-neutral-200 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition-colors"
                                    >Next</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Detail modal stacked on top */}
            {viewingApplicant && (
                <ApplicantDetailModal
                    applicant={viewingApplicant}
                    onClose={() => setViewingApplicant(null)}
                />
            )}
        </>
    );
}

// ─── View Section (shared with detail modal) ──────────────────────────────────

function ViewSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">{title}</h3>
            <div className="space-y-1">{children}</div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function UsersManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get(`${ROLE_BASED_API_URLS.admin}/users`, { withCredentials: true });
                setUsers(res.data.users);
            } catch (e: unknown) {
                setError(String(e));
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const filtered = users.filter(u => {
        const q = search.toLowerCase();
        return (
            u.first_name.toLowerCase().includes(q) ||
            u.last_name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            u.user_role.toLowerCase().includes(q)
        );
    });

    if (loading) return (
        <div className="flex items-center justify-center h-48 text-neutral-500 dark:text-neutral-400">
            Loading users...
        </div>
    );

    if (error) return <div className="text-red-500 p-4">{error}</div>;

    return (
        <>
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">Users Management</h1>
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">{users.length} user{users.length !== 1 ? "s" : ""} total</span>
                </div>

                {/* Search */}
                <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by name, email, or role..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/40">
                                    <th className="text-left px-4 py-3 font-semibold text-neutral-600 dark:text-neutral-400">Name</th>
                                    <th className="text-left px-4 py-3 font-semibold text-neutral-600 dark:text-neutral-400">Email</th>
                                    <th className="text-left px-4 py-3 font-semibold text-neutral-600 dark:text-neutral-400">Role</th>
                                    <th className="text-left px-4 py-3 font-semibold text-neutral-600 dark:text-neutral-400">Birth Date</th>
                                    <th className="text-left px-4 py-3 font-semibold text-neutral-600 dark:text-neutral-400">Joined</th>
                                    <th className="text-left px-4 py-3 font-semibold text-neutral-600 dark:text-neutral-400">Applicants</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12 text-neutral-400 dark:text-neutral-500">
                                            {search ? "No users match your search." : "No users found."}
                                        </td>
                                    </tr>
                                ) : filtered.map(u => (
                                    <tr key={u.id} className="border-b last:border-0 border-neutral-100 dark:border-neutral-700/50 hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors">
                                        <td className="px-4 py-3 font-medium text-neutral-800 dark:text-neutral-100">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-700 dark:text-purple-300 font-semibold text-xs shrink-0">
                                                    {u.first_name[0]}{u.last_name[0]}
                                                </div>
                                                {fullName(u)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{u.email}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_BADGE[u.user_role] ?? "bg-neutral-100 text-neutral-600"}`}>
                                                {u.user_role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">
                                            {new Date(u.birth_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                                        </td>
                                        <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">{formatDate(u.created_at)}</td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => setSelectedUser(u)}
                                                className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50 transition-colors"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Applicants list modal */}
            {selectedUser && (
                <ApplicantsModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                />
            )}
        </>
    );
}
