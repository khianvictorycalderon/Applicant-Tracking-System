import { useEffect } from "react";
import { getTheme, setTheme } from "./utils/theme";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ErrorPage from "./public_pages/ErrorPage";
import Login from "./public_pages/Login";
import Register from "./public_pages/Register";
import LandingPage from "./public_pages/LandingPage";
import PrivateLayout from "./layouts/PrivateLayout";
import Dashboard from "./private_pages/Dashboard";
import Account from "./private_pages/Account";
import PublicLayout from "./layouts/PublicLayout";
import About from "./public_pages/About";
import Changelogs from "./public_pages/Changelogs";
import SlideToTop from "./components/SlideToTop";
import PrivacyPolicy from "./public_pages/PrivacyPolicy";
import TermsConditions from "./public_pages/TermsConditions";
import PublicLayoutRedirect from "./layouts/PublicLayoutRedirect";
import ApplicantsManagement from "./private_pages/ApplicantsManagement";
import UsersManagement from "./private_pages/UsersManagement";
import { ENV } from "./constants";

const PUBLIC_PAGES = [
  { path: "/", element: <LandingPage /> },
  { path: "/about", element: <About /> },
  { path: "/changelogs", element: <Changelogs /> },
  { path: "/privacy-policy", element: <PrivacyPolicy /> },
  { path: "/terms-and-conditions", element: <TermsConditions /> },
];

const PUBLIC_PAGES_REDIRECT = [
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
];

const PRIVATE_PAGES = [
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/applicants", element: <ApplicantsManagement /> },
  { path: "/users", element: <UsersManagement /> },
  { path: "/account", element: <Account /> },
];

export default function App() {

  // Ping the backend to wake-up before going to the login or register page
  const handlePingBackend = async() => {
    try {
      await fetch(ENV.VITE_API_URL);
      console.log("Ping success!");
    } catch (e: unknown) {
      console.error(`Ping failed: ${String(e)}`);
    }
  }

  // Theme initializer
  useEffect(() => {
    handlePingBackend();
    setTheme(getTheme());
  }, []);

  return (
    <BrowserRouter>
      <SlideToTop/>
      <Routes>

        {/* Public pages without any layout */}
        <Route element={<PublicLayoutRedirect/>}>
          {PUBLIC_PAGES_REDIRECT.map((page, i) => (
            <Route key={i} path={page.path} element={page.element} />
          ))}
        </Route>

        {/* Public pages with navbar layout */}
        <Route element={<PublicLayout/>}>
          {PUBLIC_PAGES.map((page, i) => (
            <Route key={i} path={page.path} element={page.element} />
          ))}
        </Route>

        {/* Private pages (with sidebar layout) */}
        <Route element={<PrivateLayout />}>
          {PRIVATE_PAGES.map((page, i) => (
            <Route key={i} path={page.path} element={page.element} />
          ))}
        </Route>

        {/* Error page */}
        <Route path="*" element={<ErrorPage />} />

      </Routes>
    </BrowserRouter>
  );
}