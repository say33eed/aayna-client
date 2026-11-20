import type { Metadata } from "next";

export const metadata: Metadata = { title: "How it works" };

const steps = [
  { number: "01", title: "Discover", detail: "Browse salon and grooming services that suit your needs." },
  { number: "02", title: "Request", detail: "Choose your preferred time and request an appointment." },
  { number: "03", title: "Confirm & pay", detail: "After confirmation, securely pay for your appointment." },
];

export default function HowItWorksPage() {
  return (
    <section className="inner-page">
      <p className="eyebrow">A SIMPLER WAY TO BOOK</p>
      <h1>Simple from start to finish.</h1>
      <p className="inner-description">AAYNA is designed to make finding and booking grooming services feel effortless.</p>
      <div className="steps-grid">{steps.map((step) => <article key={step.number} className="step-card"><span className="step-number">{step.number}</span><h2>{step.title}</h2><p>{step.detail}</p></article>)}</div>
      <p className="support-note">Booking and payment features are under development.</p>
    </section>
  );
}
