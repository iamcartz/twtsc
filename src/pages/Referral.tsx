import { useEffect, useMemo, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useSeo } from "../hooks/useSeo";
import "../styles/Referral.css";
import { Turnstile } from "@marsidev/react-turnstile";

const EMAIL = "info@twt.net.au";
const PHONE = "+61 433 883 614";
const Turnstile_SITE_KEY = "0x4AAAAAACZ-mU6ox2cWGFfP"; // ✅ Cloudflare Turnstile site key

const REFERRAL_TYPES = [
    "Not sure",
    "Personal Care & Daily Living",
    "In-Home Support",
    "Social & Community Participation",
    "Transport Support",
    "Capacity Building & Life Skills",
    "Psychosocial Disability / Mental Wellbeing",
    "Support Coordination (when available)",
    "Day Programs (coming soon)",
];

function usePrefersReducedMotion() {
    const [reduced, setReduced] = useState(false);

    useEffect(() => {
        const media = window.matchMedia("(prefers-reduced-motion: reduce)");
        const onChange = () => setReduced(media.matches);

        setReduced(media.matches);

        // modern browsers
        if (typeof media.addEventListener === "function") {
            media.addEventListener("change", onChange);
            return () => media.removeEventListener("change", onChange);
        }

        // fallback
        media.addListener(onChange);
        return () => media.removeListener(onChange);
    }, []);

    return reduced;
}

export default function Referral() {
    useSeo({
        title: "Referral | Together We Thrive",
        description:
            "Send a referral to Together We Thrive Support Co. Simple, respectful NDIS disability support across South Western Sydney.",
    });

    const reducedMotion = usePrefersReducedMotion();

    const [errors, setErrors] = useState<string[]>([]);
    const [status, setStatus] = useState<"" | "success">("");
    const [submitting, setSubmitting] = useState(false);

    // ✅ CSRF token from backend
    const [csrf, setCsrf] = useState("");
    useEffect(() => {
        fetch("/api/csrf.php")
            .then((r) => r.json())
            .then((j) => setCsrf(j?.csrf || ""))
            .catch(() => setCsrf(""));
    }, []);

    // ✅ Turnstile token
    const [turnstileToken, setTurnstileToken] = useState("");

    // ✅ hardcoded live URL for QR
    const referralUrl = useMemo(() => "https://twt.net.au/referral", []);

    const qrWrapRef = useRef<HTMLDivElement | null>(null);

    // for scrolling to messages
    const statusRef = useRef<HTMLDivElement | null>(null);

    // simple “flash” animation triggers (by changing key)
    const [msgTick, setMsgTick] = useState(0);

    function downloadQrPng() {
        const canvas = qrWrapRef.current?.querySelector("canvas");
        if (!canvas) return;

        const url = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = url;
        a.download = "together-we-thrive-referral-qr.png";
        a.click();
    }

    function focusStatus() {
        setMsgTick((t) => t + 1);
        window.requestAnimationFrame(() => {
            statusRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }

    function validateClient(payload: {
        referrerName: string;
        referrerEmail: string;
        participantName: string;
        participantPhone: string;
        participantEmail: string;
        message: string;
        consent: boolean;
    }) {
        const errs: string[] = [];

        if (!payload.referrerName) errs.push("Please enter your name.");
        if (!payload.referrerEmail || !/^\S+@\S+\.\S+$/.test(payload.referrerEmail))
            errs.push("Please enter a valid email address.");
        if (!payload.participantName) errs.push("Please enter the participant’s name.");
        if (!payload.participantPhone && !payload.participantEmail)
            errs.push("Please add at least one participant contact (phone or email).");
        if (payload.participantEmail && !/^\S+@\S+\.\S+$/.test(payload.participantEmail))
            errs.push("Participant email looks invalid.");
        if (!payload.message) errs.push("Please add a short referral note.");
        if (!payload.consent) errs.push("Please confirm consent.");

        return errs;
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErrors([]);
        setStatus("");

        const form = e.currentTarget;
        const data = new FormData(form);

        // honeypot
        const company = (data.get("company") || "").toString();
        if (company) return;

        // must have CSRF + turnstile
        if (!csrf) {
            setErrors(["Security token not ready yet. Please refresh the page and try again."]);
            focusStatus();
            return;
        }
        if (!turnstileToken) {
            setErrors(["Please complete the security check before submitting."]);
            focusStatus();
            return;
        }

        const payload = {
            referrerName: (data.get("referrerName") || "").toString().trim(),
            referrerEmail: (data.get("referrerEmail") || "").toString().trim(),
            referrerPhone: (data.get("referrerPhone") || "").toString().trim(),
            participantName: (data.get("participantName") || "").toString().trim(),
            participantPhone: (data.get("participantPhone") || "").toString().trim(),
            participantEmail: (data.get("participantEmail") || "").toString().trim(),
            referralType: (data.get("referralType") || "Not sure").toString(),
            message: (data.get("message") || "").toString().trim(),
            consent: !!data.get("consent"),

            // ✅ security fields backend expects
            csrf,
            turnstileToken,
            company: "",
        };

        const clientErrs = validateClient({
            referrerName: payload.referrerName,
            referrerEmail: payload.referrerEmail,
            participantName: payload.participantName,
            participantPhone: payload.participantPhone,
            participantEmail: payload.participantEmail,
            message: payload.message,
            consent: payload.consent,
        });

        if (clientErrs.length) {
            setErrors(clientErrs);
            focusStatus();
            return;
        }

        setSubmitting(true);

        try {
            const res = await fetch("/api/referral.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const out = await res.json().catch(() => ({}));

            if (!res.ok) {
                setErrors(out?.errors || ["Something went wrong. Please try again."]);
                setStatus("");
                focusStatus();
                return;
            }

            setStatus("success");
            setErrors([]);
            setTurnstileToken(""); // optional: require new verification next time
            setMsgTick((t) => t + 1);
            window.requestAnimationFrame(() => {
                statusRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            });

            form.reset();
        } catch {
            setErrors(["Network error. Please try again."]);
            setStatus("");
            focusStatus();
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="page" id="main">
            {/* HERO */}
            <div className={`hero ${reducedMotion ? "" : "hero-animate"}`}>
                <div className="hero-content">
                    <div className="hero-brand" aria-label="Together We Thrive Support Co">
                        <img className="hero-brand-logo" src="/logo.jpeg" alt="Together We Thrive logo" />
                        <div className="hero-brand-text">
                            <span className="hero-brand-title">Together We Thrive</span>
                            <span className="hero-brand-subtitle">Support Co</span>
                        </div>
                    </div>

                    <h1>Referral</h1>

                    <p className="lead">
                        A simple referral form for participants, families, coordinators, and professionals.
                    </p>

                    <div className="cta-row" aria-label="Referral actions">
                        <a className="btn primary" href={`mailto:${EMAIL}`}>
                            Email referral
                        </a>
                        <a className="btn ghost" href={`tel:${PHONE.replace(/\s/g, "")}`}>
                            Call {PHONE}
                        </a>
                    </div>

                    <p className="muted hero-helper">Keep it simple — we’ll respond with clear next steps.</p>
                </div>

                <div className="hero-image">
                    <img src="/images/referral-hero.png" alt="Support worker helping participant" />
                </div>
            </div>

            <div className="ref-grid">
                {/* LEFT */}
                <section className="ref-card" aria-label="Referral help">
                    <h3>What happens next?</h3>

                    <ul className="list">
                        <li>We review the referral</li>
                        <li>We contact the participant (or nominee)</li>
                        <li>We confirm goals and supports</li>
                        <li>We explain the next steps clearly</li>
                    </ul>

                    <div className="qr-block" aria-label="Referral QR code" style={{ marginTop: "1rem" }}>
                        <h4 style={{ margin: "0 0 .35rem" }}>Scan to refer</h4>

                        <div className="qr-wrap" ref={qrWrapRef}>
                            <QRCodeCanvas
                                value={referralUrl}
                                size={170}
                                includeMargin
                                level="M"
                                imageSettings={{
                                    src: "/logo.jpeg",
                                    height: 36,
                                    width: 36,
                                    excavate: true,
                                }}
                            />
                        </div>

                        <p className="muted" style={{ marginTop: ".6rem" }}>{referralUrl}</p>

                        <div className="cta-row" style={{ marginTop: ".5rem" }}>
                            <button type="button" className="btn ghost" onClick={downloadQrPng}>
                                Download PNG
                            </button>
                        </div>
                    </div>
                </section>

                {/* RIGHT */}
                <section className="ref-card" aria-label="Referral form">
                    <h3>Referral form</h3>

                    {/* Status / errors */}
                    <div
                        ref={statusRef}
                        className={`form-status ${errors.length ? "is-error" : status === "success" ? "is-success" : ""}`}
                        data-tick={msgTick}
                        aria-live="polite"
                        aria-atomic="true"
                        role="status"
                    >
                        {errors.length > 0 && (
                            <ul className="error-list form-pop">
                                {errors.map((er, i) => (
                                    <li key={i}>{er}</li>
                                ))}
                            </ul>
                        )}

                        {status === "success" && (
                            <p className="ref-success form-pop">Thank you! Your referral has been sent.</p>
                        )}
                    </div>

                    <form className="ref-form" onSubmit={handleSubmit} noValidate>
                        {/* Honeypot */}
                        <input type="text" name="company" tabIndex={-1} autoComplete="off" style={{ display: "none" }} />

                        <label>
                            Your name
                            <input name="referrerName" autoComplete="name" />
                        </label>

                        <label>
                            Your email
                            <input name="referrerEmail" type="email" autoComplete="email" />
                        </label>

                        <label>
                            Your phone (optional)
                            <input name="referrerPhone" type="tel" autoComplete="tel" />
                        </label>

                        <label>
                            Participant name
                            <input name="participantName" />
                        </label>

                        <label>
                            Participant phone (optional)
                            <input name="participantPhone" type="tel" />
                        </label>

                        <label>
                            Participant email (optional)
                            <input name="participantEmail" type="email" />
                        </label>

                        <label>
                            Support needed
                            <select name="referralType" defaultValue="Not sure">
                                {REFERRAL_TYPES.map((t) => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Referral notes (short and clear)
                            <textarea
                                name="message"
                                rows={5}
                                placeholder="Example: The participant would like support with routines, community access, and wellbeing support."
                            />
                        </label>

                        <label className="ref-check">
                            <input type="checkbox" name="consent" value="yes" />
                            <span>I confirm the participant (or nominee) has consented to share this information.</span>
                        </label>

                        {/* ✅ Turnstile */}
                        <div style={{ marginTop: ".5rem" }}>
                            <Turnstile
                                siteKey={Turnstile_SITE_KEY}
                                onSuccess={(token) => setTurnstileToken(token)}
                                onExpire={() => setTurnstileToken("")}
                                onError={() => setTurnstileToken("")}
                            />

                            <p className="muted" style={{ marginTop: ".35rem" }}>
                                This helps prevent spam submissions.
                            </p>
                        </div>

                        <button className="btn primary" type="submit" disabled={submitting || !turnstileToken}>
                            {submitting ? "Sending..." : "Send referral"}
                        </button>

                        <p className="muted ref-helper">
                            Prefer email? Send a referral to <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
                        </p>
                    </form>
                </section>
            </div>
        </main>
    );
}
