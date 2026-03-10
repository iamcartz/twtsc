import { useEffect, useMemo, useRef, useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import "../styles/intakeform.css";
import { useNavigate } from "react-router-dom";

// ✅ Put your Cloudflare Turnstile SITE KEY here (public key)
const TURNSTILE_SITE_KEY = "0x4AAAAAACZ-mU6ox2cWGFfP";

// ✅ Update if your PHP endpoint path is different
const ENDPOINT = "/api/intake.php";

type Status =
    | { type: "idle" }
    | { type: "sending" }
    | { type: "success"; message: string }
    | { type: "error"; message: string };

function Modal({
    open,
    title,
    message,
    busy,
    onClose,
}: {
    open: boolean;
    title: string;
    message: string;
    busy?: boolean;
    onClose: () => void;
}) {
    if (!open) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            className="modal-backdrop"
            onClick={() => {
                if (!busy) onClose();
            }}
        >
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-head">
                    <h3 className="modal-title">{title}</h3>
                </div>

                <div className="modal-body">
                    <p>{message}</p>
                    {busy && <p style={{ marginTop: 10, fontWeight: 800 }}>Sending…</p>}
                </div>

                <div className="modal-actions">
                    <button
                        type="button"
                        className="btn"
                        onClick={onClose}
                        disabled={!!busy}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function IntakeForm() {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const logoUrl = origin ? `${origin}/logo.jpeg` : "/logo.jpeg";

    const navigate = useNavigate();

    const formRef = useRef<HTMLFormElement | null>(null);
    const fileRef = useRef<HTMLInputElement | null>(null);

    const [status, setStatus] = useState<Status>({ type: "idle" });

    const [turnstileToken, setTurnstileToken] = useState("");
    const [turnstileKey, setTurnstileKey] = useState(0);

    // ✅ CSRF token from backend
    const [csrf, setCsrf] = useState("");
    useEffect(() => {
        fetch("/api/csrf.php", { credentials: "same-origin" })
            .then((r) => r.json())
            .then((j) => setCsrf(j?.csrf || ""))
            .catch(() => setCsrf(""));
    }, []);

    const endpoint = useMemo(() => ENDPOINT, []);

    // ✅ MODAL STATE
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState("Notice");
    const [modalMessage, setModalMessage] = useState("");
    const [modalBusy, setModalBusy] = useState(false);

    function showModal(title: string, message: string, busy = false) {
        setModalTitle(title);
        setModalMessage(message);
        setModalBusy(busy);
        setModalOpen(true);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        // show feedback immediately
        showModal("Submitting", "Please wait while we submit your form.", true);

        if (!formRef.current) {
            setStatus({ type: "error", message: "Form not ready. Please refresh and try again." });
            showModal("Not submitted", "Form not ready. Please refresh and try again.");
            return;
        }

        if (!csrf) {
            setStatus({ type: "error", message: "Security token missing. Please refresh the page." });
            showModal("Not submitted", "Security token missing. Please refresh the page and try again.");
            return;
        }

        if (!turnstileToken) {
            setStatus({ type: "error", message: "Please complete the anti-robot check." });
            showModal("Not submitted", "Please complete the anti-robot check (Turnstile) then press Submit again.");
            return;
        }

        setStatus({ type: "sending" });

        try {
            const fd = new FormData(formRef.current);

            // Send CSRF + Turnstile token to server
            fd.set("csrf", csrf);
            fd.set("cf_turnstile_response", turnstileToken);

            // Make sure multi uploads are sent as uploads[]
            fd.delete("uploads");
            fd.delete("uploads[]");

            const files = fileRef.current?.files;
            if (files && files.length > 0) {
                for (const file of Array.from(files)) {
                    fd.append("uploads[]", file, file.name);
                }
            }

            const res = await fetch(endpoint, {
                method: "POST",
                body: fd,
                credentials: "same-origin", // important for CSRF session cookie
            });

            let data: any = null;
            try {
                data = await res.json();
            } catch {
                // non-json response
            }

            if (!res.ok || !data?.ok) {
                const message =
                    data?.error ||
                    `Submission failed. Server responded with ${res.status} ${res.statusText}`;
                setStatus({ type: "error", message });

                // Reset Turnstile on error
                setTurnstileToken("");
                setTurnstileKey((k) => k + 1);

                showModal("Not submitted", message);
                return;
            }

            const okMsg = data?.message || "Submitted successfully!";
            setStatus({ type: "success", message: okMsg });

            // Reset form + Turnstile
            formRef.current.reset();
            setTurnstileToken("");
            setTurnstileKey((k) => k + 1);

            showModal("Submitted", okMsg);

            navigate("/thank-you");
        } catch (err: any) {
            const msg = err?.message || "Network error. Please try again.";
            setStatus({ type: "error", message: msg });

            setTurnstileToken("");
            setTurnstileKey((k) => k + 1);

            showModal("Not submitted", msg);
        } finally {
            setModalBusy(false);
        }
    }

    return (
        <main className="intake-wrap">
            {/* ✅ Modal always visible even if user is scrolled */}
            <Modal
                open={modalOpen}
                title={modalTitle}
                message={modalMessage}
                busy={modalBusy}
                onClose={() => setModalOpen(false)}
            />
            <form className="intake" ref={formRef} onSubmit={handleSubmit}>
                {/* CSRF hidden */}
                <input type="hidden" name="csrf" value={csrf} />
                {/* Header */}
                <header className="intake-header intake-header-row">
                    {/* Logo */}
                    <div className="intake-logo-wrap">
                        <img
                            src={logoUrl}
                            alt="Together We Thrive Support Co"
                            className="intake-logo"
                        />
                    </div>

                    {/* Header Text */}
                    <div className="intake-header-text">
                        <div className="intake-kicker">CLIENT</div>
                        <h1>INTAKE FORM</h1>
                        <div className="intake-docno">CAF002.01 CLIENT INTAKE FORM</div>
                    </div>
                </header>

                {/* Clients Personal Details */}
                <section className="card">
                    <h2 className="section-title">Clients Personal Details</h2>

                    <div className="grid two">
                        <label className="field">
                            <span className="label">Legal Name:</span>
                            <input className="input" name="legalName" type="text" />
                        </label>

                        <label className="field">
                            <span className="label">Preferred Name:</span>
                            <input className="input" name="preferredName" type="text" />
                        </label>

                        <label className="field">
                            <span className="label">Gender:</span>
                            <input className="input" name="gender" type="text" />
                        </label>

                        <label className="field">
                            <span className="label">DOB:</span>
                            <input className="input" name="dob" type="date" />
                        </label>

                        <label className="field">
                            <span className="label">Country of Birth:</span>
                            <input className="input" name="countryOfBirth" type="text" />
                        </label>

                        <div className="field">
                            <span className="label"> </span>
                            <div className="checks">
                                <label className="check">
                                    <input type="checkbox" name="aboriginal" value="yes" /> Aboriginal
                                </label>
                                <label className="check">
                                    <input type="checkbox" name="tsi" value="yes" /> Torres Strait Islander
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="grid two">
                        <label className="field">
                            <span className="label">Mobile:</span>
                            <input className="input" name="mobile" type="tel" />
                        </label>

                        <label className="field">
                            <span className="label">Landline:</span>
                            <input className="input" name="landline" type="tel" />
                        </label>

                        <label className="field">
                            <span className="label">Email:</span>
                            <input className="input" name="email" type="email" />
                        </label>

                        <label className="field">
                            <span className="label">Address:</span>
                            <input className="input" name="address" type="text" />
                        </label>

                        <label className="field">
                            <span className="label">Suburb:</span>
                            <input className="input" name="suburb" type="text" />
                        </label>

                        <label className="field">
                            <span className="label">Postcode:</span>
                            <input className="input" name="postcode" type="text" />
                        </label>
                    </div>

                    <div className="row">
                        <div className="field">
                            <span className="label">Preferred contact method:</span>
                            <div className="checks">
                                <label className="check">
                                    <input type="checkbox" name="prefMobile" value="yes" /> Mobile
                                </label>
                                <label className="check">
                                    <input type="checkbox" name="prefLandline" value="yes" /> Landline
                                </label>
                                <label className="check">
                                    <input type="checkbox" name="prefEmail" value="yes" /> Email
                                </label>
                                <label className="check">
                                    <input type="checkbox" name="prefMail" value="yes" /> Mail
                                </label>
                            </div>
                        </div>
                    </div>

                    <label className="field">
                        <span className="label">
                            List beliefs/ values you would like us to know about you below (things that you believe are important in the
                            way you live such as tradition, religion, family, culture, sexual orientation etc):
                        </span>
                        <textarea className="textarea" name="beliefsValues" rows={6} />
                    </label>

                    <label className="field">
                        <span className="label">List any Support Worker preference(s) you may have (male, older, active, LGBT etc):</span>
                        <textarea className="textarea" name="supportWorkerPrefs" rows={5} />
                    </label>

                    <div className="grid two">
                        <label className="field">
                            <span className="label">Designated Care/ Emergency contact person's name:</span>
                            <input className="input" name="emergencyName" type="text" />
                        </label>

                        <label className="field">
                            <span className="label">Relationship with Client:</span>
                            <input className="input" name="emergencyRelationship" type="text" />
                        </label>

                        <label className="field">
                            <span className="label">Mobile Phone:</span>
                            <input className="input" name="emergencyMobile" type="tel" />
                        </label>

                        <label className="field">
                            <span className="label">Home Phone:</span>
                            <input className="input" name="emergencyHome" type="tel" />
                        </label>
                    </div>

                    <div className="row">
                        <div className="field">
                            <span className="label">Are there any Guardianship/ Public Trustee/ Financial management orders in place?</span>
                            <div className="checks">
                                <label className="check">
                                    <input type="radio" name="guardianshipOrders" value="yes" /> Yes
                                </label>
                                <label className="check">
                                    <input type="radio" name="guardianshipOrders" value="no" /> No
                                </label>
                            </div>
                        </div>
                    </div>

                    <label className="field">
                        <span className="label">If yes, please provide details:</span>
                        <textarea className="textarea" name="guardianshipDetails" rows={4} />
                    </label>

                    <label className="field">
                        <span className="label">Current Living Accommodation:</span>
                        <textarea className="textarea" name="accommodation" rows={3} />
                    </label>
                </section>

                {/* Client’s Disability/ Health Details */}
                <section className="card">
                    <h2 className="section-title">Client’s Disability/ Health Details</h2>

                    <label className="field">
                        <span className="label">Primary Disability:</span>
                        <input className="input" name="primaryDisability" type="text" />
                    </label>

                    <label className="field">
                        <span className="label">Any other disability:</span>
                        <input className="input" name="otherDisability" type="text" />
                    </label>

                    <label className="field">
                        <span className="label">Clinical Diagnosis (Mental Health):</span>
                        <input className="input" name="clinicalDiagnosis" type="text" />
                    </label>
                </section>

                {/* Client Risks */}
                <section className="card">
                    <h2 className="section-title">Client Risks</h2>

                    <div className="split">
                        <div className="subcard">
                            <h3 className="sub-title">Allergy Information</h3>
                            <p className="hint">Please provide details</p>
                            <div className="checks">
                                <label className="check">
                                    <input type="radio" name="allergy" value="yes" /> Yes
                                </label>
                                <label className="check">
                                    <input type="radio" name="allergy" value="no" /> No
                                </label>
                            </div>
                            <label className="field">
                                <span className="label">If Yes please provide Details:</span>
                                <textarea className="textarea" name="allergyDetails" rows={4} />
                            </label>
                        </div>

                        <div className="subcard">
                            <h3 className="sub-title">Individual Risk Profile</h3>
                            <p className="hint">
                                Due to their disability or medical condition what are related risks for the client. We need to know the
                                possible risks that are associated to the client such as:
                            </p>
                            <div className="checks stack">
                                <label className="check"><input type="checkbox" name="riskFalls" value="yes" /> <span>Falls</span></label>
                                <label className="check"><input type="checkbox" name="riskChoking" value="yes" /> <span>Choking</span></label>
                                <label className="check"><input type="checkbox" name="riskSeizures" value="yes" /> <span>Seizures – Triggers</span></label>
                                <label className="check"><input type="checkbox" name="riskPressure" value="yes" /> <span>Pressure Injuries</span></label>
                                <label className="check"><input type="checkbox" name="riskSelfHarm" value="yes" /> <span>Self-Harm – Triggers</span></label>
                                <label className="check"><input type="checkbox" name="riskInjuries" value="yes" /> <span>Injuries</span></label>
                                <label className="check"><input type="checkbox" name="riskOther" value="yes" /> <span>Other</span></label>
                            </div>

                            <label className="field">
                                <span className="label">Notes / triggers / strategies:</span>
                                <textarea className="textarea" name="riskNotes" rows={5} />
                            </label>
                        </div>
                    </div>

                    <div className="split">
                        <div className="subcard">
                            <h3 className="sub-title">Behaviour Of Concern</h3>
                            <p className="hint">List of behaviours/triggers &amp; strategies to assist</p>
                            <div className="checks">
                                <label className="check">
                                    <input type="radio" name="behaviourConcern" value="yes" /> Yes
                                </label>
                                <label className="check">
                                    <input type="radio" name="behaviourConcern" value="no" /> No
                                </label>
                            </div>
                            <label className="field">
                                <span className="label">If Yes please provide Details:</span>
                                <textarea className="textarea" name="behaviourDetails" rows={5} />
                            </label>
                        </div>

                        <div className="subcard">
                            <h3 className="sub-title">Fears</h3>
                            <p className="hint">Details of any fears (e.g., touch, loud noises). Provide triggers &amp; strategies.</p>
                            <div className="checks stack">
                                <label className="check"><input type="checkbox" name="fearTouch" value="yes" /> <span>Touch</span></label>
                                <label className="check"><input type="checkbox" name="fearLoud" value="yes" /> <span>Loud Noises</span></label>
                                <label className="check"><input type="checkbox" name="fearAnxiety" value="yes" /> <span>Anxiety – Triggers</span></label>
                                <label className="check"><input type="checkbox" name="fearOther" value="yes" /> <span>Other</span></label>
                            </div>

                            <label className="field">
                                <span className="label">Triggers / strategies:</span>
                                <textarea className="textarea" name="fearNotes" rows={5} />
                            </label>
                        </div>
                    </div>
                </section>

                {/* Support Needs */}
                <section className="card">
                    <h2 className="section-title">Participant’s Current Level of Support Needs</h2>

                    <p className="hint">Please tick which support(s) you are enquiring about with Cherub Care?</p>
                    <div className="checks wrap">
                        <label className="check"><input type="checkbox" name="supportInHomeCare" value="yes" /> In Home Care</label>
                        <label className="check"><input type="checkbox" name="supportCommunity" value="yes" /> Community Participation</label>
                        <label className="check"><input type="checkbox" name="supportSkill" value="yes" /> Skill Building</label>
                        <label className="check"><input type="checkbox" name="supportCoordination" value="yes" /> Support Coordination</label>
                    </div>

                    <label className="field">
                        <span className="label">A brief description of supports required (Communication or sensory impairment etc):</span>
                        <textarea className="textarea" name="supportsDescription" rows={5} />
                    </label>

                    <label className="field">
                        <span className="label">Days and hours of support you are requiring (e.g., PC 2 hrs daily; CP 3hrs Tue &amp; Fri):</span>
                        <textarea className="textarea" name="daysHours" rows={4} />
                    </label>

                    <p className="hint">NB: Please attach a recent Occupational Therapy (OT) Assessment if available.</p>

                    <div className="row">
                        <div className="field">
                            <span className="label">Level of support required (please tick):</span>
                            <div className="checks">
                                <label className="check"><input type="radio" name="supportLevel" value="low" /> Low care</label>
                                <label className="check"><input type="radio" name="supportLevel" value="standard" /> Standard care</label>
                                <label className="check"><input type="radio" name="supportLevel" value="complex" /> Complex care</label>
                            </div>
                        </div>
                    </div>
                </section>

                {/* NDIA Plan Details */}
                <section className="card">
                    <h2 className="section-title">NDIA Plan Details</h2>

                    <label className="field">
                        <span className="label">NDIS Participant Reference Number:</span>
                        <input className="input" name="ndisRef" type="text" />
                    </label>

                    <div className="subcard">
                        <h3 className="sub-title">Plan Management Type</h3>
                        <div className="checks stack">
                            <label className="check">
                                <input type="radio" name="planType" value="ndia" />
                                <span>NDIA Managed – agency manages Participant’s Plan</span>
                            </label>
                            <label className="check">
                                <input type="radio" name="planType" value="nominee" />
                                <span>Plan Nominee – Guardian/Representative manages Plan</span>
                            </label>
                            <label className="check">
                                <input type="radio" name="planType" value="self" />
                                <span>Self-Managed – participant manages own Plan</span>
                            </label>
                            <label className="check">
                                <input type="radio" name="planType" value="manager" />
                                <span>Plan Manager – external organisation acting on behalf of Participant</span>
                            </label>
                        </div>
                    </div>

                    <div className="subcard">
                        <h3 className="sub-title">If applicable, Plan Nominee/ Plan Manager details</h3>
                        <div className="grid two">
                            <label className="field">
                                <span className="label">Name:</span>
                                <input className="input" name="planName" type="text" />
                            </label>
                            <label className="field">
                                <span className="label">Organisation:</span>
                                <input className="input" name="planOrg" type="text" />
                            </label>
                            <label className="field">
                                <span className="label">Email:</span>
                                <input className="input" name="planEmail" type="email" />
                            </label>
                            <label className="field">
                                <span className="label">Phone:</span>
                                <input className="input" name="planPhone" type="tel" />
                            </label>
                            <label className="field">
                                <span className="label">Plan start date:</span>
                                <input className="input" name="planStart" type="date" />
                            </label>
                            <label className="field">
                                <span className="label">Plan end date:</span>
                                <input className="input" name="planEnd" type="date" />
                            </label>
                            <label className="field">
                                <span className="label">Review date:</span>
                                <input className="input" name="reviewDate" type="date" />
                            </label>
                        </div>

                        <p className="hint">NB: Please attach a copy of NDIS plan approval received from NDIA.</p>
                    </div>
                </section>

                {/* Referrer’s Details */}
                <section className="card">
                    <h2 className="section-title">Referrer’s Details (if applicable)</h2>

                    <div className="grid two">
                        <label className="field">
                            <span className="label">Referrer Name:</span>
                            <input className="input" name="referrerName" type="text" />
                        </label>
                        <label className="field">
                            <span className="label">Relationship to Participant:</span>
                            <input className="input" name="referrerRelationship" type="text" />
                        </label>
                        <label className="field">
                            <span className="label">Position:</span>
                            <input className="input" name="referrerPosition" type="text" />
                        </label>
                        <label className="field">
                            <span className="label">Organisation:</span>
                            <input className="input" name="referrerOrg" type="text" />
                        </label>
                        <label className="field">
                            <span className="label">E-mail:</span>
                            <input className="input" name="referrerEmail" type="email" />
                        </label>
                        <label className="field">
                            <span className="label">Contact Number:</span>
                            <input className="input" name="referrerContact" type="tel" />
                        </label>
                    </div>

                    <label className="field">
                        <span className="label">Address:</span>
                        <input className="input" name="referrerAddress" type="text" />
                    </label>

                    <div className="grid two">
                        <label className="field">
                            <span className="label">Signature:</span>
                            <input className="input" name="referrerSignature" type="text" placeholder="Type full name" />
                        </label>
                        <label className="field">
                            <span className="label">Date:</span>
                            <input className="input" name="referrerDate" type="date" />
                        </label>
                    </div>

                    <div className="row">
                        <div className="field">
                            <span className="label">Does you have consent from the participant to make this referral?</span>
                            <div className="checks">
                                <label className="check"><input type="radio" name="refConsent" value="yes" /> Yes</label>
                                <label className="check"><input type="radio" name="refConsent" value="no" /> No</label>
                            </div>
                        </div>
                    </div>

                    <div className="subcard">
                        <h3 className="sub-title">Please attach the following documents where applicable</h3>
                        <div className="checks stack">
                            <label className="check"><input type="checkbox" name="docNdiaPlan" value="yes" /> Approved NDIA Plan</label>
                            <label className="check"><input type="checkbox" name="docGpLetter" value="yes" /> Letter from the GP stating past and present medical history</label>
                            <label className="check"><input type="checkbox" name="docConsentNdiaShare" value="yes" /> Consent for the NDIA to share your information</label>
                            <label className="check"><input type="checkbox" name="docDischarge" value="yes" /> D/C letter if hospitalized in the last 12 months</label>
                            <label className="check"><input type="checkbox" name="docBehaviourPlans" value="yes" /> Behaviour Plans/ Assessments</label>
                            <label className="check"><input type="checkbox" name="docSafetyPlan" value="yes" /> Safety Plan</label>
                            <label className="check"><input type="checkbox" name="docOtAssessment" value="yes" /> Recent OT or Specialist Assessment</label>
                            <label className="check"><input type="checkbox" name="docMhRisk" value="yes" /> Mental Health Review Risk Assessment</label>
                            <label className="check"><input type="checkbox" name="docOther" value="yes" /> Any other relevant documents</label>
                        </div>

                        <label className="field">
                            <span className="label">Upload files:</span>
                            <input
                                ref={fileRef}
                                className="input"
                                type="file"
                                name="uploads"
                                multiple
                            />
                            <span className="hint">You can select multiple files.</span>
                        </label>
                    </div>

                    <div className="notice">
                        <p>
                            Thank you for your interest in receiving service from Together We Thrive Support Co. Please email this referral
                            form and all other relevant documents to <strong>Admin@twt.net.au</strong>.
                        </p>
                        <p>
                            We will be in touch within the next 3 business days to organise an appointment. However, in the meantime, if
                            you have any questions about our services or require urgent support, please contact Chloe Lewis on <strong>0433883614</strong>.
                        </p>
                    </div>
                </section>

                {/* Consent for release of information */}
                <section className="card">
                    <h2 className="section-title">Consent for release of information</h2>

                    <p className="para">
                        I hereby give permission to Together We Thrive Support Co to obtain verbal or written information from GPs and/or
                        Specialists, the Community Mental Health Team, Allied Health Professionals and my family members/ Guardian or any
                        person I authorise, concerning relevant information related to this application.
                    </p>
                    <p className="para">
                        Consent can be withdrawn any time by contacting Together We Thrive Support Co in person or by Phone on 0433883614
                        or by emailing Admin@twt.net.au
                    </p>

                    <div className="grid two">
                        <label className="field">
                            <span className="label">Participant’s Name:</span>
                            <input className="input" name="participantName" type="text" />
                        </label>
                        <label className="field">
                            <span className="label">Signature:</span>
                            <input className="input" name="participantSignature" type="text" placeholder="Type full name" />
                        </label>
                        <label className="field">
                            <span className="label">Date:</span>
                            <input className="input" name="participantDate" type="date" />
                        </label>
                    </div>

                    <div className="grid two">
                        <label className="field">
                            <span className="label">Witness Name:</span>
                            <input className="input" name="witnessName" type="text" />
                        </label>
                        <label className="field">
                            <span className="label">Relationship:</span>
                            <input className="input" name="witnessRelationship" type="text" />
                        </label>
                        <label className="field">
                            <span className="label">Signature:</span>
                            <input className="input" name="witnessSignature" type="text" placeholder="Type full name" />
                        </label>
                        <label className="field">
                            <span className="label">Date:</span>
                            <input className="input" name="witnessDate" type="date" />
                        </label>
                    </div>

                    <div className="subcard">
                        <h3 className="sub-title">Verbal consent (staff use only)</h3>
                        <p className="hint">
                            To be used ONLY if unable to obtain a written consent).
                            I have discussed the proposed referrals with the person being referred or their authorised representative and I
                            am satisfied that the participant understands the proposed uses and disclosures and has provided his/ her informed consent to these.
                        </p>

                        <div className="grid two">
                            <label className="field"><span className="label">Referrer Name:</span><input className="input" name="verbalRefName" type="text" /></label>
                            <label className="field"><span className="label">Organisation:</span><input className="input" name="verbalOrg" type="text" /></label>
                            <label className="field"><span className="label">Position:</span><input className="input" name="verbalPos" type="text" /></label>
                            <label className="field"><span className="label">Contact Number:</span><input className="input" name="verbalContact" type="tel" /></label>
                            <label className="field"><span className="label">Signature:</span><input className="input" name="verbalSig" type="text" placeholder="Type full name" /></label>
                            <label className="field"><span className="label">Date:</span><input className="input" name="verbalDate" type="date" /></label>
                        </div>
                    </div>

                    <div className="subcard">
                        <h3 className="sub-title">If No Consent Available (Staff Use Only)</h3>
                        <p className="hint">
                            In the event where the consent is not able to be obtained because the participant is too unwell or other reason,
                            please fill the form below:
                        </p>

                        <div className="grid two">
                            <label className="field"><span className="label">Referrer Name:</span><input className="input" name="noConsentRefName" type="text" /></label>
                            <label className="field"><span className="label">Organisation:</span><input className="input" name="noConsentOrg" type="text" /></label>
                            <label className="field"><span className="label">Position:</span><input className="input" name="noConsentPos" type="text" /></label>
                            <label className="field"><span className="label">Contact Number:</span><input className="input" name="noConsentContact" type="tel" /></label>
                            <label className="field"><span className="label">Signature:</span><input className="input" name="noConsentSig" type="text" placeholder="Type full name" /></label>
                            <label className="field"><span className="label">Date:</span><input className="input" name="noConsentDate" type="date" /></label>
                        </div>
                    </div>

                    <div className="subcard">
                        <h3 className="sub-title">Together We Thrive Support Co Privacy Statement</h3>
                        <p className="para">
                            All information gathered through this application process is kept strictly confidential and will not be disclosed
                            to any third parties outside of Together We Thrive Support Co except as may be permitted or required by law.
                        </p>
                    </div>
                </section>

                <footer className="intake-footer">
                    <div className="fineprint">Version 1.2 – February 2026</div>

                    {/* (Optional) keep footer messages too */}
                    {status.type === "sending" && (
                        <div className="notice" style={{ marginTop: 12 }}>
                            <p><strong>Sending…</strong> Please wait.</p>
                        </div>
                    )}
                    {status.type === "success" && (
                        <div className="notice" style={{ marginTop: 12 }}>
                            <p><strong>Submitted:</strong> {status.message}</p>
                        </div>
                    )}
                    {status.type === "error" && (
                        <div className="notice" style={{ marginTop: 12 }}>
                            <p><strong>Not submitted:</strong> {status.message}</p>
                        </div>
                    )}

                    <div style={{ marginTop: 12 }}>
                        <Turnstile
                            key={turnstileKey}
                            siteKey={TURNSTILE_SITE_KEY}
                            onSuccess={(token) => setTurnstileToken(token)}
                            onExpire={() => setTurnstileToken("")}
                            onError={() => setTurnstileToken("")}
                            options={{ theme: "light" }}
                        />
                    </div>

                    <div className="actions">
                        <button
                            className="btn primary"
                            type="submit"
                            disabled={status.type === "sending" || !csrf || !turnstileToken}
                            title={
                                !csrf
                                    ? "Loading security token…"
                                    : !turnstileToken
                                        ? "Please complete the anti-robot check"
                                        : undefined
                            }
                        >
                            {status.type === "sending" ? "Submitting..." : "Submit"}
                        </button>
                    </div>
                </footer>
            </form>
        </main>
    );
}