import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import HowWeHelp from "./pages/HowWeHelp";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Accessibility from "./pages/Accessibility";
import Referral from "./pages/Referral";
import IntakeForm from "./pages/IntakeForm";
import ParticipantSafeguards from "./pages/ParticipantSafeguards";
import ServiceAgreements from "./pages/ServiceAgreementForm";
import NdisSupport from "./pages/NdisSupport";
import ThankYou from "./pages/ThankYou";

function SiteLayout() {
  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

function LandingPageLayout() {
  return (
    <main id="main-content" tabIndex={-1}>
      <Outlet />
    </main>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        {/* Standalone landing page: no header, no footer */}
        <Route element={<LandingPageLayout />}>
          <Route path="/ndis-support" element={<NdisSupport />} />
          <Route path="/thank-you" element={<ThankYou />} />
        </Route>

        {/* Main website pages */}
        <Route element={<SiteLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:id" element={<ServiceDetail />} />
          <Route path="/how-we-help" element={<HowWeHelp />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/accessibility" element={<Accessibility />} />
          <Route path="/referral" element={<Referral />} />
          <Route path="/intake" element={<IntakeForm />} />
          <Route path="/participant-safeguards" element={<ParticipantSafeguards />} />
          <Route path="/service-agreements" element={<ServiceAgreements />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}