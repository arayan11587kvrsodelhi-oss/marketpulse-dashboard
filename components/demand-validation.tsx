"use client";

import { type FormEvent, useState } from "react";

type FormKind = "individual" | "business";

type FormState = {
  name: string;
  email: string;
  useCase: string;
  company: string;
  brief: string;
};

const emptyForm: FormState = { name: "", email: "", useCase: "", company: "", brief: "" };
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateForm(kind: FormKind, form: FormState): Record<string, string> {
  const errors: Record<string, string> = {};
  if (kind === "business" && !form.name.trim()) errors.name = "Please enter your name.";
  if (!form.email.trim()) errors.email = "Please enter an email address.";
  else if (!emailPattern.test(form.email.trim())) errors.email = "Enter a valid email address.";
  if (kind === "business" && !form.brief.trim()) errors.brief = "Please describe the dashboard you need.";
  return errors;
}

function PreviewForm({ kind }: { kind: FormKind }) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState("");
  const isBusiness = kind === "business";
  const prefix = isBusiness ? "business" : "individual";

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setFeedback("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateForm(kind, form);
    setErrors(nextErrors);
    setFeedback(Object.keys(nextErrors).length ? "" : "Preview only: nothing was sent or stored. This form is ready for a future approved endpoint.");
  }

  return (
    <form className="preview-form" onSubmit={handleSubmit} noValidate>
      <div className="form-heading">
        <div><span className="form-kicker">{isBusiness ? "For teams" : "For individuals"}</span><h3>{isBusiness ? "Business dashboard inquiry" : "Individual early access"}</h3></div>
        <span className="preview-pill">Preview form</span>
      </div>
      <p className="form-disclosure">This is a local validation preview. It does not transmit or store personal information.</p>
      <div className="form-grid">
        <div className="field">
          <label htmlFor={`${prefix}-name`}>{isBusiness ? "Name" : "Name (optional)"}</label>
          <input id={`${prefix}-name`} name="name" value={form.name} onChange={(event) => updateField("name", event.target.value)} autoComplete="name" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? `${prefix}-name-error` : undefined} />
          {errors.name && <span className="field-error" id={`${prefix}-name-error`}>{errors.name}</span>}
        </div>
        <div className="field">
          <label htmlFor={`${prefix}-email`}>{isBusiness ? "Work email" : "Email"} <span aria-hidden="true">*</span></label>
          <input id={`${prefix}-email`} name="email" type="email" required value={form.email} onChange={(event) => updateField("email", event.target.value)} autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? `${prefix}-email-error` : undefined} />
          {errors.email && <span className="field-error" id={`${prefix}-email-error`}>{errors.email}</span>}
        </div>
        {isBusiness ? (
          <>
            <div className="field"><label htmlFor="business-company">Company or organization (optional)</label><input id="business-company" name="company" value={form.company} onChange={(event) => updateField("company", event.target.value)} autoComplete="organization" /></div>
            <div className="field field-wide"><label htmlFor="business-brief">What dashboard would you need? <span aria-hidden="true">*</span></label><textarea id="business-brief" name="brief" rows={3} required value={form.brief} onChange={(event) => updateField("brief", event.target.value)} aria-invalid={Boolean(errors.brief)} aria-describedby={errors.brief ? "business-brief-error" : undefined} />{errors.brief && <span className="field-error" id="business-brief-error">{errors.brief}</span>}</div>
          </>
        ) : (
          <div className="field field-wide"><label htmlFor="individual-use">What would be most valuable? (optional)</label><textarea id="individual-use" name="useCase" rows={3} value={form.useCase} onChange={(event) => updateField("useCase", event.target.value)} /></div>
        )}
      </div>
      <div className="form-actions"><button className="preview-button" type="submit">Preview form</button>{feedback && <p className="form-feedback" role="status">{feedback}</p>}</div>
    </form>
  );
}

export function DemandValidation() {
  return (
    <section className="demand-section" id="plans" aria-labelledby="plans-heading">
      <div className="demand-intro"><div><p className="eyebrow">Validate the next chapter</p><h2 id="plans-heading">A market workspace with room to grow.</h2></div><p>These are proposed offers for discovery, not launched subscriptions. Nothing here accepts payment or activates an account.</p></div>
      <div className="pricing-grid" aria-label="Proposed plans">
        <article className="pricing-card"><span className="plan-label">Free</span><div className="plan-price">₹0 <small>/ forever</small></div><p>Explore the simulated dashboard on one device.</p><ul><li>Simulated market overview</li><li>Basic instrument exploration</li><li>Local-device watchlist</li></ul><span className="plan-status">Available in demo</span></article>
        <article className="pricing-card featured"><span className="plan-label">Pro / proposed</span><div className="plan-price">₹199–₹299 <small>/ month</small></div><p>Planned depth for people who monitor markets regularly.</p><ul><li>Advanced watchlists <em>Planned</em></li><li>Price alerts <em>Planned</em></li><li>Enhanced analysis <em>Planned</em></li></ul><span className="plan-status">Proposed for validation</span></article>
        <article className="pricing-card"><span className="plan-label">Business / custom</span><div className="plan-price">Tailored scope</div><p>For organizations that need a focused market workflow or reporting view.</p><ul><li>Custom dashboard requirements</li><li>Workflow and reporting discussion</li><li>Individual proposal and pricing</li></ul><span className="plan-status">Discuss individually</span></article>
      </div>
      <div className="form-grid-shell"><PreviewForm kind="individual" /><PreviewForm kind="business" /></div>
    </section>
  );
}
