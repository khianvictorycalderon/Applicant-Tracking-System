import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { ROLE_BASED_API_URLS } from "../constants";

// ---- Types ----
type EducationEntry = { school: string; degree: string; year_started: number; year_ended: number | null };
type WorkEntry      = { company_name: string; position: string; year_started: number; year_ended: number | null };

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
};

type Paginated = {
    items: Applicant[];
    total_count: number;
    page: number;
    page_size: number;
    total_pages: number;
};

const STATUSES = [
    "Applied", "Under Review", "Shortlisted", "Interview Scheduled",
    "Interviewed", "Offered", "Hired", "Rejected", "Withdrawn",
];

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

const BLANK_FORM = {
    first_name: "", middle_name: "", last_name: "",
    contact_number: "", email: "", notes: "", status: "Applied",
    education: [] as EducationEntry[],
    work_experience: [] as WorkEntry[],
    skills: [] as string[],
};

type FormData = typeof BLANK_FORM;

export default function ApplicantsManagement() {
    const [paginated, setPaginated] = useState<Paginated | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [error, setError] = useState<string | null>(null);

    // Modal state
    const [modalMode, setModalMode] = useState<"create" | "edit" | "view" | "delete" | null>(null);
    const [selected, setSelected] = useState<Applicant | null>(null);
    const [form, setForm] = useState<FormData>({ ...BLANK_FORM });
    const [formError, setFormError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Skills chip input
    const [skillInput, setSkillInput] = useState("");

    const PAGE_SIZE = 10;

    const fetchApplicants = async (p = page, s = search) => {
        setLoading(true);
        try {
            const res = await axios.get(`${ROLE_BASED_API_URLS.member}/applicants`, {
                params: { page: p, pageSize: PAGE_SIZE, search: s || undefined },
                withCredentials: true,
            });
            setPaginated(res.data);
        } catch (e: unknown) {
            setError(String(e));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchApplicants(); }, [page, search]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        setSearch(searchInput);
    };

    // ---- Modal helpers ----
    const openCreate = () => {
        setForm({ ...BLANK_FORM });
        setFormError(null);
        setSkillInput("");
        setModalMode("create");
    };
    const openEdit = (a: Applicant) => {
        setSelected(a);
        setForm({
            first_name: a.first_name, middle_name: a.middle_name ?? "",
            last_name: a.last_name, contact_number: a.contact_number,
            email: a.email, notes: a.notes ?? "", status: a.status,
            education: a.education, work_experience: a.work_experience, skills: a.skills,
        });
        setFormError(null);
        setSkillInput("");
        setModalMode("edit");
    };
    const openView = (a: Applicant) => { setSelected(a); setModalMode("view"); };
    const openDelete = (a: Applicant) => { setSelected(a); setModalMode("delete"); };
    const closeModal = () => { setModalMode(null); setSelected(null); setFormError(null); };

    // ---- Submit ----
    const handleSubmit = async () => {
        setFormError(null);
        if (!form.first_name.trim() || !form.last_name.trim() || !form.contact_number.trim() || !form.email.trim()) {
            setFormError("First name, last name, contact number, and email are required.");
            return;
        }
        setSubmitting(true);
        try {
            if (modalMode === "create") {
                await axios.post(`${ROLE_BASED_API_URLS.member}/applicants`, form, { withCredentials: true });
            } else if (modalMode === "edit" && selected) {
                await axios.patch(`${ROLE_BASED_API_URLS.member}/applicants/${selected.id}`, form, { withCredentials: true });
            }
            closeModal();
            fetchApplicants();
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) setFormError(e.response?.data?.message ?? "Something went wrong.");
            else setFormError(String(e));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selected) return;
        setSubmitting(true);
        try {
            await axios.delete(`${ROLE_BASED_API_URLS.member}/applicants/${selected.id}`, { withCredentials: true });
            closeModal();
            if (paginated && paginated.items.length === 1 && page > 1) setPage(p => p - 1);
            else fetchApplicants();
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) setFormError(e.response?.data?.message ?? "Delete failed.");
            else setFormError(String(e));
        } finally {
            setSubmitting(false);
        }
    };

    // ---- Education & Work list helpers ----
    const addEducation = () => setForm(f => ({ ...f, education: [...f.education, { school: "", degree: "", year_started: new Date().getFullYear(), year_ended: null }] }));
    const removeEducation = (i: number) => setForm(f => ({ ...f, education: f.education.filter((_, idx) => idx !== i) }));
    const updateEducation = (i: number, key: keyof EducationEntry, val: string | number | null) =>
        setForm(f => ({ ...f, education: f.education.map((e, idx) => idx === i ? { ...e, [key]: val } : e) }));

    const addWork = () => setForm(f => ({ ...f, work_experience: [...f.work_experience, { company_name: "", position: "", year_started: new Date().getFullYear(), year_ended: null }] }));
    const removeWork = (i: number) => setForm(f => ({ ...f, work_experience: f.work_experience.filter((_, idx) => idx !== i) }));
    const updateWork = (i: number, key: keyof WorkEntry, val: string | number | null) =>
        setForm(f => ({ ...f, work_experience: f.work_experience.map((e, idx) => idx === i ? { ...e, [key]: val } : e) }));

    const addSkill = () => {
        const s = skillInput.trim();
        if (s && !form.skills.includes(s)) setForm(f => ({ ...f, skills: [...f.skills, s] }));
        setSkillInput("");
    };
    const removeSkill = (s: string) => setForm(f => ({ ...f, skills: f.skills.filter(x => x !== s) }));

    const fullName = (a: Applicant) => [a.first_name, a.middle_name, a.last_name].filter(Boolean).join(" ");

    if (error) return <div className="text-red-500 p-4">{error}</div>;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">Applicants</h1>
                <button onClick={openCreate} className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add Applicant
                </button>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" /></svg>
                    <input
                        type="text" placeholder="Search by name, email, or contact..."
                        value={searchInput} onChange={e => setSearchInput(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
                <button type="submit" className="cursor-pointer px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors">Search</button>
                {search && (
                    <button type="button" onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }} className="cursor-pointer px-3 py-2 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800">Clear</button>
                )}
            </form>

            {/* Table */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/40">
                                <th className="text-left px-4 py-3 font-semibold text-neutral-600 dark:text-neutral-400">Name</th>
                                <th className="text-left px-4 py-3 font-semibold text-neutral-600 dark:text-neutral-400">Contact</th>
                                <th className="text-left px-4 py-3 font-semibold text-neutral-600 dark:text-neutral-400">Email</th>
                                <th className="text-left px-4 py-3 font-semibold text-neutral-600 dark:text-neutral-400">Status</th>
                                <th className="text-left px-4 py-3 font-semibold text-neutral-600 dark:text-neutral-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="text-center py-12 text-neutral-400 dark:text-neutral-500">Loading...</td></tr>
                            ) : !paginated || paginated.items.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-12 text-neutral-400 dark:text-neutral-500">{search ? "No applicants match your search." : "No applicants yet. Click \"Add Applicant\" to get started."}</td></tr>
                            ) : paginated.items.map(a => (
                                <tr key={a.id} className="border-b last:border-0 border-neutral-100 dark:border-neutral-700/50 hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors">
                                    <td className="px-4 py-3 font-medium text-neutral-800 dark:text-neutral-100">{fullName(a)}</td>
                                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{a.contact_number}</td>
                                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{a.email}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[a.status] ?? "bg-neutral-100 text-neutral-600"}`}>{a.status}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => openView(a)} title="View" className="cursor-pointer p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            </button>
                                            <button onClick={() => openEdit(a)} title="Edit" className="cursor-pointer p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </button>
                                            <button onClick={() => openDelete(a)} title="Delete" className="cursor-pointer p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {paginated && paginated.total_pages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200 dark:border-neutral-700">
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            Showing {((paginated.page - 1) * paginated.page_size) + 1}–{Math.min(paginated.page * paginated.page_size, paginated.total_count)} of {paginated.total_count}
                        </span>
                        <div className="flex gap-1">
                            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="cursor-pointer disabled:opacity-40 disabled:cursor-default px-3 py-1 text-xs rounded border border-neutral-200 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition-colors">Prev</button>
                            {Array.from({ length: paginated.total_pages }, (_, i) => i + 1).map(p => (
                                <button key={p} onClick={() => setPage(p)} className={`cursor-pointer px-3 py-1 text-xs rounded border transition-colors ${p === page ? "bg-purple-600 text-white border-purple-600" : "border-neutral-200 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300"}`}>{p}</button>
                            ))}
                            <button disabled={page >= paginated.total_pages} onClick={() => setPage(p => p + 1)} className="cursor-pointer disabled:opacity-40 disabled:cursor-default px-3 py-1 text-xs rounded border border-neutral-200 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition-colors">Next</button>
                        </div>
                    </div>
                )}
            </div>

            {/* ---- MODALS ---- */}
            {/* Create / Edit Modal */}
            {(modalMode === "create" || modalMode === "edit") && (
                <Modal title={modalMode === "create" ? "Add Applicant" : "Edit Applicant"} onClose={closeModal} wide>
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                        {/* Basic info */}
                        <Section title="Basic Information">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <Field label="First Name *">
                                    <input className={INPUT} value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} placeholder="John" />
                                </Field>
                                <Field label="Middle Name">
                                    <input className={INPUT} value={form.middle_name} onChange={e => setForm(f => ({ ...f, middle_name: e.target.value }))} placeholder="Michael" />
                                </Field>
                                <Field label="Last Name *">
                                    <input className={INPUT} value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} placeholder="Doe" />
                                </Field>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <Field label="Contact Number *">
                                    <input className={INPUT} value={form.contact_number} onChange={e => setForm(f => ({ ...f, contact_number: e.target.value }))} placeholder="+63 900 000 0000" />
                                </Field>
                                <Field label="Email *">
                                    <input className={INPUT} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="john@email.com" />
                                </Field>
                            </div>
                            <Field label="Status *">
                                <select className={INPUT} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                                </select>
                            </Field>
                        </Section>

                        {/* Education */}
                        <Section title="Education">
                            {form.education.map((edu, i) => (
                                <div key={i} className="bg-neutral-50 dark:bg-neutral-900/30 rounded-lg p-3 space-y-2 relative">
                                    <button onClick={() => removeEducation(i)} className="cursor-pointer absolute top-2 right-2 text-neutral-400 hover:text-red-500">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <Field label="School"><input className={INPUT_SM} value={edu.school} onChange={e => updateEducation(i, "school", e.target.value)} placeholder="University of..." /></Field>
                                        <Field label="Degree"><input className={INPUT_SM} value={edu.degree} onChange={e => updateEducation(i, "degree", e.target.value)} placeholder="BS Computer Science" /></Field>
                                        <Field label="Year Started"><input className={INPUT_SM} type="number" value={edu.year_started} onChange={e => updateEducation(i, "year_started", parseInt(e.target.value))} /></Field>
                                        <Field label="Year Ended (blank = present)"><input className={INPUT_SM} type="number" value={edu.year_ended ?? ""} onChange={e => updateEducation(i, "year_ended", e.target.value ? parseInt(e.target.value) : null)} placeholder="Present" /></Field>
                                    </div>
                                </div>
                            ))}
                            <button onClick={addEducation} className="cursor-pointer text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                Add Education
                            </button>
                        </Section>

                        {/* Work Experience */}
                        <Section title="Work Experience (Optional)">
                            {form.work_experience.map((work, i) => (
                                <div key={i} className="bg-neutral-50 dark:bg-neutral-900/30 rounded-lg p-3 space-y-2 relative">
                                    <button onClick={() => removeWork(i)} className="cursor-pointer absolute top-2 right-2 text-neutral-400 hover:text-red-500">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <Field label="Company"><input className={INPUT_SM} value={work.company_name} onChange={e => updateWork(i, "company_name", e.target.value)} placeholder="Company Inc." /></Field>
                                        <Field label="Position"><input className={INPUT_SM} value={work.position} onChange={e => updateWork(i, "position", e.target.value)} placeholder="Software Engineer" /></Field>
                                        <Field label="Year Started"><input className={INPUT_SM} type="number" value={work.year_started} onChange={e => updateWork(i, "year_started", parseInt(e.target.value))} /></Field>
                                        <Field label="Year Ended (blank = present)"><input className={INPUT_SM} type="number" value={work.year_ended ?? ""} onChange={e => updateWork(i, "year_ended", e.target.value ? parseInt(e.target.value) : null)} placeholder="Present" /></Field>
                                    </div>
                                </div>
                            ))}
                            <button onClick={addWork} className="cursor-pointer text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                Add Work Experience
                            </button>
                        </Section>

                        {/* Skills */}
                        <Section title="Skills">
                            <div className="flex gap-2">
                                <input
                                    className={`${INPUT} flex-1`}
                                    value={skillInput}
                                    onChange={e => setSkillInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                                    placeholder="Type skill and press Enter or Add"
                                />
                                <button onClick={addSkill} className="cursor-pointer px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg">Add</button>
                            </div>
                            {form.skills.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {form.skills.map(s => (
                                        <span key={s} className="flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                                            {s}
                                            <button onClick={() => removeSkill(s)} className="cursor-pointer hover:text-red-500 ml-0.5">×</button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </Section>

                        {/* Notes */}
                        <Section title="Notes (Optional)">
                            <textarea
                                className={`${INPUT} min-h-[80px] resize-y`}
                                value={form.notes}
                                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                                placeholder="Any additional notes about this applicant..."
                            />
                        </Section>
                    </div>

                    {formError && <p className="text-red-500 text-sm mt-3">{formError}</p>}
                    <div className="flex justify-end gap-2 mt-4">
                        <button onClick={closeModal} className="cursor-pointer px-4 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">Cancel</button>
                        <button onClick={handleSubmit} disabled={submitting} className="cursor-pointer disabled:opacity-60 px-4 py-2 text-sm rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors">
                            {submitting ? "Saving..." : modalMode === "create" ? "Create Applicant" : "Save Changes"}
                        </button>
                    </div>
                </Modal>
            )}

            {/* View Modal */}
            {modalMode === "view" && selected && (
                <Modal title="Applicant Details" onClose={closeModal} wide>
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 text-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xl font-bold text-neutral-800 dark:text-neutral-100">{fullName(selected)}</p>
                                <p className="text-neutral-500 dark:text-neutral-400">{selected.email} · {selected.contact_number}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[selected.status] ?? "bg-neutral-100 text-neutral-600"}`}>{selected.status}</span>
                        </div>
                        {selected.education.length > 0 && (
                            <ViewSection title="Education">
                                {selected.education.map((e, i) => (
                                    <div key={i} className="text-neutral-700 dark:text-neutral-300">
                                        <span className="font-medium">{e.degree}</span> — {e.school} ({e.year_started}–{e.year_ended ?? "Present"})
                                    </div>
                                ))}
                            </ViewSection>
                        )}
                        {selected.work_experience.length > 0 && (
                            <ViewSection title="Work Experience">
                                {selected.work_experience.map((w, i) => (
                                    <div key={i} className="text-neutral-700 dark:text-neutral-300">
                                        <span className="font-medium">{w.position}</span> — {w.company_name} ({w.year_started}–{w.year_ended ?? "Present"})
                                    </div>
                                ))}
                            </ViewSection>
                        )}
                        {selected.skills.length > 0 && (
                            <ViewSection title="Skills">
                                <div className="flex flex-wrap gap-2">
                                    {selected.skills.map(s => (
                                        <span key={s} className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">{s}</span>
                                    ))}
                                </div>
                            </ViewSection>
                        )}
                        {selected.notes && (
                            <ViewSection title="Notes">
                                <p className="text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap">{selected.notes}</p>
                            </ViewSection>
                        )}
                        <p className="text-xs text-neutral-400 dark:text-neutral-500">Added {new Date(selected.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button onClick={() => { closeModal(); openEdit(selected); }} className="cursor-pointer px-4 py-2 text-sm rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors">Edit</button>
                        <button onClick={closeModal} className="cursor-pointer px-4 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">Close</button>
                    </div>
                </Modal>
            )}

            {/* Delete Modal */}
            {modalMode === "delete" && selected && (
                <Modal title="Delete Applicant" onClose={closeModal}>
                    <p className="text-neutral-600 dark:text-neutral-300 text-sm">
                        Are you sure you want to delete <span className="font-semibold">{fullName(selected)}</span>? This action cannot be undone.
                    </p>
                    {formError && <p className="text-red-500 text-sm mt-2">{formError}</p>}
                    <div className="flex justify-end gap-2 mt-4">
                        <button onClick={closeModal} className="cursor-pointer px-4 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">Cancel</button>
                        <button onClick={handleDelete} disabled={submitting} className="cursor-pointer disabled:opacity-60 px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors">
                            {submitting ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
}

// ---- Reusable sub-components ----
function Modal({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
    const ref = useRef<HTMLDivElement>(null);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div ref={ref} className={`bg-white dark:bg-neutral-800 rounded-xl shadow-xl w-full ${wide ? "max-w-2xl" : "max-w-md"} max-h-[90vh] flex flex-col`}>
                <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
                    <h2 className="font-semibold text-neutral-800 dark:text-neutral-100">{title}</h2>
                    <button onClick={onClose} className="cursor-pointer p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-4 overflow-y-auto flex-1">{children}</div>
            </div>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">{title}</h3>
            {children}
        </div>
    );
}

function ViewSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">{title}</h3>
            <div className="space-y-1">{children}</div>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{label}</label>
            {children}
        </div>
    );
}

const INPUT = "w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500";
const INPUT_SM = "w-full px-2 py-1.5 rounded border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500";
