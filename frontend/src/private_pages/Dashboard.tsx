import axios from "axios";
import { useEffect, useState } from "react";
import { ROLE_BASED_API_URLS } from "../constants";
import { Bar, Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

type MemberDashboard = {
    total_applicants: number;
    by_status: Record<string, number>;
    recent_this_month: number;
    top_skills: string[];
};

type AdminDashboard = {
    total_users: number;
    total_admins: number;
    total_members: number;
    total_applicants: number;
    applicants_by_status: Record<string, number>;
    users_by_month: Record<string, number>;
    applicants_by_month: Record<string, number>;
};

const STATUS_COLORS: Record<string, string> = {
    Applied:               "rgba(99,102,241,0.8)",
    "Under Review":        "rgba(245,158,11,0.8)",
    Shortlisted:           "rgba(59,130,246,0.8)",
    "Interview Scheduled": "rgba(139,92,246,0.8)",
    Interviewed:           "rgba(20,184,166,0.8)",
    Offered:               "rgba(34,197,94,0.8)",
    Hired:                 "rgba(16,185,129,0.8)",
    Rejected:              "rgba(239,68,68,0.8)",
    Withdrawn:             "rgba(107,114,128,0.8)",
};

const CHART_OPTS = {
    responsive: true,
    plugins: { legend: { position: "bottom" as const } },
};

export default function Dashboard() {
    const [memberData, setMemberData] = useState<MemberDashboard | null>(null);
    const [adminData, setAdminData] = useState<AdminDashboard | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${ROLE_BASED_API_URLS.admin}/dashboard`, { withCredentials: true });
                setAdminData(res.data);
            } catch {
                try {
                    const res = await axios.get(`${ROLE_BASED_API_URLS.member}/dashboard`, { withCredentials: true });
                    setMemberData(res.data);
                } catch (e: unknown) {
                    setError(String(e));
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-48 text-neutral-500 dark:text-neutral-400">
            Loading dashboard...
        </div>
    );
    if (error) return <div className="text-red-500 p-4">{error}</div>;
    if (adminData) return <AdminDashboardView data={adminData} />;
    if (memberData) return <MemberDashboardView data={memberData} />;
    return null;
}

function MemberDashboardView({ data }: { data: MemberDashboard }) {
    const statusLabels = Object.keys(data.by_status);
    const statusValues = Object.values(data.by_status);

    const statusDoughnut = {
        labels: statusLabels,
        datasets: [{ data: statusValues, backgroundColor: statusLabels.map(l => STATUS_COLORS[l] ?? "rgba(156,163,175,0.8)"), borderWidth: 1 }],
    };

    const skillBar = {
        labels: data.top_skills,
        datasets: [{
            label: "Frequency",
            data: data.top_skills.map((_, i) => data.top_skills.length - i),
            backgroundColor: "rgba(139,92,246,0.7)",
            borderRadius: 4,
        }],
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">Dashboard</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Applicants" value={data.total_applicants} color="purple" />
                <StatCard label="This Month" value={data.recent_this_month} color="blue" />
                <StatCard label="Hired" value={data.by_status["Hired"] ?? 0} color="green" />
                <StatCard label="Rejected" value={data.by_status["Rejected"] ?? 0} color="red" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ChartCard title="Applicants by Status">
                    {statusLabels.length > 0 ? <Doughnut data={statusDoughnut} options={CHART_OPTS} /> : <EmptyChart />}
                </ChartCard>
                <ChartCard title="Top Skills">
                    {data.top_skills.length > 0 ? <Bar data={skillBar} options={{ ...CHART_OPTS, indexAxis: "y" as const }} /> : <EmptyChart />}
                </ChartCard>
            </div>
        </div>
    );
}

function AdminDashboardView({ data }: { data: AdminDashboard }) {
    const statusLabels = Object.keys(data.applicants_by_status);

    const statusDoughnut = {
        labels: statusLabels,
        datasets: [{ data: Object.values(data.applicants_by_status), backgroundColor: statusLabels.map(l => STATUS_COLORS[l] ?? "rgba(156,163,175,0.8)"), borderWidth: 1 }],
    };
    const userMonthBar = {
        labels: Object.keys(data.users_by_month),
        datasets: [{ label: "New Users", data: Object.values(data.users_by_month), backgroundColor: "rgba(99,102,241,0.7)", borderRadius: 4 }],
    };
    const applicantMonthBar = {
        labels: Object.keys(data.applicants_by_month),
        datasets: [{ label: "New Applicants", data: Object.values(data.applicants_by_month), backgroundColor: "rgba(139,92,246,0.7)", borderRadius: 4 }],
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">Admin Dashboard</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Users" value={data.total_users} color="purple" />
                <StatCard label="Admins" value={data.total_admins} color="blue" />
                <StatCard label="Members" value={data.total_members} color="indigo" />
                <StatCard label="Total Applicants" value={data.total_applicants} color="green" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ChartCard title="Applicants by Status">
                    {statusLabels.length > 0 ? <Doughnut data={statusDoughnut} options={CHART_OPTS} /> : <EmptyChart />}
                </ChartCard>
                <ChartCard title="New Users (Last 6 Months)">
                    <Bar data={userMonthBar} options={CHART_OPTS} />
                </ChartCard>
                <ChartCard title="New Applicants (Last 6 Months)" className="md:col-span-2">
                    <Bar data={applicantMonthBar} options={CHART_OPTS} />
                </ChartCard>
            </div>
        </div>
    );
}

function StatCard({ label, value, color }: { label: string; value: number; color: "purple"|"blue"|"green"|"red"|"indigo" }) {
    const colors = {
        purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
        blue:   "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
        green:  "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
        red:    "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300",
        indigo: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300",
    };
    return (
        <div className={`rounded-xl p-4 ${colors[color]}`}>
            <p className="text-sm font-medium opacity-80">{label}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
    );
}

function ChartCard({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
    return (
        <div className={`bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-sm border border-neutral-200 dark:border-neutral-700 ${className}`}>
            <h2 className="text-sm font-semibold text-neutral-600 dark:text-neutral-300 mb-4">{title}</h2>
            {children}
        </div>
    );
}

function EmptyChart() {
    return (
        <div className="flex items-center justify-center h-32 text-sm text-neutral-400 dark:text-neutral-500">
            No data yet
        </div>
    );
}
