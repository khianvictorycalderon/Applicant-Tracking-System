// ---------------------------------------------------
// ROLES
// ---------------------------------------------------
export type UserRole = "Admin" | "Member";

// ---------------------------------------------------
// API URL
// ---------------------------------------------------
const ENV = import.meta.env;

export const ROLE_BASED_API_URLS = {
    admin: `${ENV.VITE_API_URL}/api/admin`,
    member: `${ENV.VITE_API_URL}/api/member`,
} as const;

export const BUILT_IN_API_URLS = {
    login: `${ENV.VITE_API_URL}/api/login`,                                                                // POST
    logout: `${ENV.VITE_API_URL}/api/logout`,                                                              // DELETE
    register: `${ENV.VITE_API_URL}/api/register`,                                                          // POST
    getUserData: `${ENV.VITE_API_URL}/api/users/me`,                                                       // GET
    updateUserData: `${ENV.VITE_API_URL}/api/users`, // extend with /<id>                                  // PATCH
    updatePassword: `${ENV.VITE_API_URL}/api/users/password`,                                              // PATCH
    deleteUser: `${ENV.VITE_API_URL}/api/users`,  // extend with /<id>                                     // DELETE
    verify: `${ENV.VITE_API_URL}/api/verify`,  // used to verify if user currently logged in or not        // GET
    sessions: `${ENV.VITE_API_URL}/api/login-sessions`                                                          // GET, DELETE only
} as const;
export const PRIVATE_ROUTE_FIRST_PATH = "/dashboard";

// ---------------------------------------------------
// Sidebar Buttons
// ---------------------------------------------------
export type SidebarButton = {
  label: string;
  path: string;
  icon: string;
  roles: UserRole[];
};

export type PrivateRoute = {
  path: string;
  element: React.ReactNode;
  roles: UserRole[];
};

export const SIDEBAR_BUTTONS: SidebarButton[] = [
    {
        label: "Dashboard",
        path: "/dashboard",
        icon: `
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path 
                    stroke-linecap="round" 
                    stroke-linejoin="round" 
                    stroke-width="2" 
                    d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"
                />
            </svg>
        `,
        roles: ["Admin", "Member"]
    },
    {
        label: "Applicants",
        path: "/applicants",
        icon: `
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path 
                    stroke-linecap="round" 
                    stroke-linejoin="round" 
                    stroke-width="2" 
                    d="M9 12h6m2 8H7a2 2 0 01-2-2V6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v10a2 2 0 01-2 2z"
                />
            </svg>
        `,
        roles: ["Member"]
    },
    {
        label: "Users Management",
        path: "/users",
        icon: `
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path 
                    stroke-linecap="round" 
                    stroke-linejoin="round" 
                    stroke-width="2" 
                    d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m10-4a4 4 0 10-8 0 4 4 0 008 0z"
                />
            </svg>
        `,
        roles: ["Admin"]
    },
    {
        label: "Account",
        path: "/account",
        icon: `
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path 
                    stroke-linecap="round" 
                    stroke-linejoin="round" 
                    stroke-width="2" 
                    d="M5.121 17.804A10.95 10.95 0 0112 15c2.5 0 4.847.84 6.879 2.254M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
            </svg>
        `,
        roles: ["Admin", "Member"]
    }
];

export const TOPNAV_HEADER = "Applicant Tracking System Portal";

// ---------------------------------------------------
// Navbar Buttons
// ---------------------------------------------------
export const NAVBAR_BUTTONS: { label: string; path: string }[] = [
    {
        label: "Home",
        path: "/"
    },
    {
        label: "About",
        path: "/about"
    },
    {
        label: "Changelogs",
        path: "/changelogs"
    }
];

export const NAVBAR_HEADER = "ATS";

import type React from "react";
// ---------------------------------------------------
// Register Page
// ---------------------------------------------------
import type { HTMLInputTypeAttribute } from "react";

export interface RegisterFieldsProps {
    label: string;
    id: string;
    type: HTMLInputTypeAttribute;

    // optional validation
    pattern?: string; // regex string
    required?: boolean;
    minLength?: number;
    maxLength?: number;

    placeholder?: string;
}

export const REGISTER_FIELDS: RegisterFieldsProps[] = [
    {
        label: "First Name",
        id: "first_name",
        type: "text",
        required: true,
        minLength: 2,
        maxLength: 30,
        placeholder: "John",
    },
    {
        label: "Middle Name",
        id: "middle_name",
        type: "text",
        required: false,
        minLength: 2,
        maxLength: 30,
        placeholder: "Michael",
    },
    {
        label: "Last Name",
        id: "last_name",
        type: "text",
        required: true,
        minLength: 2,
        maxLength: 30,
        placeholder: "Doe",
    },
    {
        label: "Birth Date",
        id: "birth_date",
        type: "date",
        required: true,
    },
    {
        label: "Email",
        id: "email",
        type: "email",
        required: true,
        pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
        placeholder: "you@example.com",
    },
    {
        label: "Password",
        id: "password",
        type: "password",
        required: true,
        minLength: 8,
        placeholder: "••••••••",
    },
    {
        label: "Confirm Password",
        id: "confirm_password",
        type: "password",
        required: true,
        minLength: 8,
        placeholder: "••••••••",
    },
];

// ---------------------------------------------------
// Footer
// ---------------------------------------------------
export const FOOTER_BUTTONS: Record<
  string,
  { label: string; href: string }[]
> = {

  "Website Developer by": [
    { label: "Khian Victory Calderon", href: "https://khian.netlify.app" },
    { label: "Khian Victory Calderon (GitHub)", href: "https://github.com/khianvictorycalderon" },
  ],

  A: [
    { label: "Placeholder", href: "#" },
    { label: "Placeholder", href: "#" },
    { label: "Placeholder", href: "#" },
    { label: "Placeholder", href: "#" },
  ],

  B: [
    { label: "Placeholder", href: "#" },
    { label: "Placeholder", href: "#" },
    { label: "Placeholder", href: "#" },
    { label: "Placeholder", href: "#" },
  ],

  C: [
    { label: "Placeholder", href: "#" },
    { label: "Placeholder", href: "#" },
    { label: "Placeholder", href: "#" },
    { label: "Placeholder", href: "#" },
  ],
};

export const PRIVATE_FOOTER_LABEL = "Applicant Tracking System by Khian Victory D. Calderon";

// ---------------------------------------------------
// About Page
// ---------------------------------------------------
export const ABOUT_DESCRIPTION: string = "Learn more about Applicant Tracking System";
export const ABOUT: { title: string; desc: string }[] = [
    {
        title: "About ATS",
        desc: "This website was specifically developed for <b>HR</b> interviewer for processing applicants seamlessly.",
    },
    {
        title: "Logo Credits",
        desc: '<a href="https://www.flaticon.com/free-icons/my-profile" class="text-purple-600 dark:text-purple-500 hover:underline cursor-pinter" title="my profile icons">My profile icons created by Lizel Arina - Flaticon</a>"'
    },
];

// ---------------------------------------------------
// Changelogs Page
// ---------------------------------------------------
export const CHANGELOGS: { release: string; changes: string[] }[] = [
    {
        release: "1.0.0",
        changes: [
            "Initial Release", 
            "Released on June X 2026."
        ]
    },
  ];

// ---------------------------------------------------
// Terms and Conditions
// ---------------------------------------------------
export const TERMS_LAST_UPDATED_DATE: string = "June X, 2026 @ X:XX PM";

export const TERMS_CONDITIONS: { title: string; desc: string }[] = [
    {
        title: "Usage",
        desc: "This service is provided for personal and lawful use only. You agree not to misuse, exploit, or engage in any activity that may harm the system, other users, or violate applicable laws or regulations."
    },
    {
        title: "Legal Framework",
        desc: "By using this service, you agree to comply with all applicable local and international laws. Any illegal or unauthorized use of the platform is strictly prohibited and may result in termination of access."
    },
    {
        title: "Disclaimer",
        desc: "The service is provided 'as is' without warranties of any kind. We are not responsible for any loss, damage, or consequences arising from the use or inability to use the service."
    },
    {
        title: "User Responsibility",
        desc: "Users are responsible for ensuring they review any updates to these terms. Continued use of the service after changes are made constitutes acceptance of the updated terms."
    }
];


// ---------------------------------------------------
// Privacy Policy
// ---------------------------------------------------
export const PRIVACY_LAST_UPDATED_DATE: string = "June X, 2026 @ X:XX PM";

export const PRIVACY_POLICY: { title: string; desc: string }[] = [
    {
        title: "Data Collection",
        desc: "We only collect necessary data that you voluntarily provide through the platform, such as inputs, form entries, or information required to deliver core functionality."
    },
    {
        title: "Data Usage",
        desc: "Collected data is used strictly to operate, maintain, and improve the service experience. We do not use your data for unrelated purposes."
    },
    {
        title: "Third-Party Sharing",
        desc: "We do not sell, rent, or trade personal data to third parties. Data is only shared when required for service functionality or legal compliance."
    },
    {
        title: "Data Protection",
        desc: "Reasonable security measures are implemented to protect user data against unauthorized access, alteration, disclosure, or destruction."
    },
    {
        title: "Updates",
        desc: "This privacy policy may be updated from time to time. Users are responsible for reviewing changes. Continued use of the service implies acceptance of the updated policy."
    }
];

// ---------------------------------------------------
// Error Page
// ---------------------------------------------------
export const ERROR_PAGE_MESSAGE: { main: string; additional: string } = {
    main: "Page not found",
    additional: "The page you're looking for doesn't exist or has been removed."
};