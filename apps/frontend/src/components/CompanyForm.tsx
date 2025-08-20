import { useState, type ChangeEvent, type FormEvent } from "react";
import { saveCompanyLocal, saveCompanyRemote } from "@service/contactService";
import JobDetailsForm, { type JobDetails } from "./JobDetailsForm";

type Address = { straße: string; plz: string; ort: string };
type Contact = {
  name: string;
  email?: string;
  telefon?: string;
  linkedin?: string;
};
type Company = {
  name: string;
  adresse: Address;
  companyEmail?: string;
  companyNumber?: string;
  ansprechpartner?: Contact;
};

type FormState = {
  name: string;
  strasse: string;
  plz: string;
  ort: string;
  companyEmail: string;
  companyNumber: string;
  ansprechpartnerName: string;
  ansprechpartnerEmail: string;
  ansprechpartnerTelefon: string;
  ansprechpartnerLinkedIn: string;
};

const defaultForm: FormState = {
  name: "",
  strasse: "",
  plz: "",
  ort: "",
  companyEmail: "",
  companyNumber: "",
  ansprechpartnerName: "",
  ansprechpartnerEmail: "",
  ansprechpartnerTelefon: "",
  ansprechpartnerLinkedIn: "",
};

const styles = {
  container: {
    maxWidth: 760,
    margin: "2rem auto",
    padding: "1rem",
    fontFamily: "Arial, sans-serif",
    border: "1px solid #ddd",
    borderRadius: 4,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  } as const,
  fieldset: {
    marginBottom: "1.5rem",
    padding: "1rem",
    border: "1px solid #ccc",
    borderRadius: 4,
  } as const,
  legend: { fontWeight: 700, marginBottom: ".5rem" } as const,
  label: {
    display: "block",
    marginBottom: ".25rem",
    fontSize: ".9rem",
  } as const,
  input: {
    width: "100%",
    padding: ".5rem",
    marginBottom: "1rem",
    border: "1px solid #ccc",
    borderRadius: 4,
    fontSize: "1rem",
  } as const,
  checkboxRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: "1rem",
  } as const,
  btn: {
    padding: ".6rem 1.2rem",
    fontSize: "1rem",
    cursor: "pointer",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: 4,
  } as const,
  btnGhost: {
    padding: ".6rem 1.2rem",
    fontSize: "1rem",
    cursor: "pointer",
    backgroundColor: "#6c757d",
    color: "#fff",
    border: "none",
    borderRadius: 4,
  } as const,
  row: { display: "flex", gap: 8 } as const,
};

export default function CompanyForm() {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [hasContact, setHasContact] = useState<boolean>(true);
  const [job, setJob] = useState<JobDetails>({
    jobName: "Bewerbung",
    jobUrl: "",
    applyDate: "",
    dateNachfrage: "",
    dateRueckmeldung: "",
    skills: [],
    bemerkung: "",
    beworben: false,
    absage: false,
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    if (name === "hasContact") return setHasContact(checked);
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const buildCompany = (): Company => {
    const c: Company = {
      name: form.name,
      adresse: { straße: form.strasse, plz: form.plz, ort: form.ort },
    };
    if (form.companyEmail.trim()) c.companyEmail = form.companyEmail.trim();
    if (form.companyNumber.trim()) c.companyNumber = form.companyNumber.trim();

    if (hasContact && form.ansprechpartnerName.trim()) {
      const ap: Contact = { name: form.ansprechpartnerName.trim() };
      if (form.ansprechpartnerEmail.trim())
        ap.email = form.ansprechpartnerEmail.trim();
      if (form.ansprechpartnerTelefon.trim())
        ap.telefon = form.ansprechpartnerTelefon.trim();
      if (form.ansprechpartnerLinkedIn.trim())
        ap.linkedin = form.ansprechpartnerLinkedIn.trim();
      c.ansprechpartner = ap;
    }
    return c;
  };

  const reset = () => {
    setForm(defaultForm);
    setHasContact(true);
    setJob({
      jobName: "Bewerbung",
      jobUrl: "",
      applyDate: "",
      dateNachfrage: "",
      dateRueckmeldung: "",
      skills: [],
      bemerkung: "",
      beworben: false,
      absage: false,
    });
  };

  const onSubmitLocal = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await saveCompanyLocal(buildCompany());
      setSuccess("Lokal gespeichert!");
      reset();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const onSubmitRemote = async () => {
    setError(null);
    setSuccess(null);
    try {
      const entry = buildCompany();
      // options = SyncOptionsSchema im Backend
      const options = {
        jobName: job.jobName || "Bewerbung",
        jobUrl: job.jobUrl || undefined,
        applyDate: job.applyDate, // REQUIRED
        dateNachfrage: job.dateNachfrage || undefined,
        dateRueckmeldung: job.dateRueckmeldung || undefined,
        skills: job.skills && job.skills.length ? job.skills : undefined,
        bemerkung: job.bemerkung || undefined,
        beworben: job.beworben,
        absage: job.absage,
      };
      await saveCompanyRemote(entry, options);
      setSuccess("Direkt in Notion synchronisiert!");
      reset();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Firma hinzufügen</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <form onSubmit={onSubmitLocal}>
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>Firmendaten</legend>

          <label style={styles.label}>Firmenname</label>
          <input
            style={styles.input}
            name="name"
            value={form.name}
            onChange={onChange}
            required
          />

          <div style={styles.row}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Straße</label>
              <input
                style={styles.input}
                name="strasse"
                value={form.strasse}
                onChange={onChange}
                required
              />
            </div>
            <div style={{ width: 140 }}>
              <label style={styles.label}>PLZ</label>
              <input
                style={styles.input}
                name="plz"
                value={form.plz}
                onChange={onChange}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Ort</label>
              <input
                style={styles.input}
                name="ort"
                value={form.ort}
                onChange={onChange}
                required
              />
            </div>
          </div>

          <div style={styles.row}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Company E‑Mail (optional)</label>
              <input
                style={styles.input}
                name="companyEmail"
                value={form.companyEmail}
                onChange={onChange}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Company Telefon (optional)</label>
              <input
                style={styles.input}
                name="companyNumber"
                value={form.companyNumber}
                onChange={onChange}
              />
            </div>
          </div>
        </fieldset>

        <label style={styles.checkboxRow as any}>
          <input
            type="checkbox"
            name="hasContact"
            checked={hasContact}
            onChange={onChange}
          />
          Ansprechpartner hinzufügen
        </label>

        {hasContact && (
          <fieldset style={styles.fieldset}>
            <legend style={styles.legend}>Ansprechpartner (optional)</legend>
            <label style={styles.label}>Name</label>
            <input
              style={styles.input}
              name="ansprechpartnerName"
              value={form.ansprechpartnerName}
              onChange={onChange}
            />
            <label style={styles.label}>E‑Mail</label>
            <input
              style={styles.input}
              name="ansprechpartnerEmail"
              value={form.ansprechpartnerEmail}
              onChange={onChange}
            />
            <label style={styles.label}>Telefon</label>
            <input
              style={styles.input}
              name="ansprechpartnerTelefon"
              value={form.ansprechpartnerTelefon}
              onChange={onChange}
            />
            <label style={styles.label}>LinkedIn</label>
            <input
              style={styles.input}
              name="ansprechpartnerLinkedIn"
              value={form.ansprechpartnerLinkedIn}
              onChange={onChange}
            />
          </fieldset>
        )}

        {/* Neue Bewerbungsdetails */}
        <JobDetailsForm value={job} onChange={setJob} />

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button style={styles.btn} type="submit">
            Lokal speichern (JSON)
          </button>
          <button
            style={styles.btnGhost}
            type="button"
            onClick={onSubmitRemote}
          >
            Direkt in Notion syncen
          </button>
        </div>
      </form>
    </div>
  );
}
