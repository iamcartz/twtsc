import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import HowWeHelp from "./pages/HowWeHelp";
import Contact from "./pages/Contact";

export default function App() {
  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/who-we-support" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/how-we-help" element={<HowWeHelp />} />
          <Route path="/contact" element={<Contact />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
