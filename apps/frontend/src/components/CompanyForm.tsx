import React, { useState, type ChangeEvent, type FormEvent } from "react";
import { saveCompanyLocal, saveCompanyRemote } from "@service/contactService";

interface Address {
  straße: string;
  plz: string;
  ort: string;
}
interface Contact {
  name: string;
  email?: string;
  telefon?: string;
  linkedin?: string;
}
interface Company {
  name: string;
  adresse: Address;
  ansprechpartner?: Contact;
}

interface FormState {
  name: string;
  strasse: string;
  plz: string;
  ort: string;
  ansprechpartnerName: string;
  ansprechpartnerEmail: string;
  ansprechpartnerTelefon: string;
  ansprechpartnerLinkedIn: string;
}

const defaultFormState: FormState = {
  name: "",
  strasse: "",
  plz: "",
  ort: "",
  ansprechpartnerName: "",
  ansprechpartnerEmail: "",
  ansprechpartnerTelefon: "",
  ansprechpartnerLinkedIn: "",
};

const styles = {
  container: {
    maxWidth: 720,
    margin: "2rem auto",
    padding: "1rem",
    fontFamily: "Arial, sans-serif",
    border: "1px solid #ddd",
    borderRadius: 4,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  fieldset: {
    marginBottom: "1.5rem",
    padding: "1rem",
    border: "1px solid #ccc",
    borderRadius: 4,
  },
  legend: { fontWeight: "bold" as const, marginBottom: ".5rem" },
  label: { display: "block", marginBottom: ".25rem", fontSize: ".9rem" },
  input: {
    width: "100%",
    padding: ".5rem",
    marginBottom: "1rem",
    border: "1px solid #ccc",
    borderRadius: 4,
    fontSize: "1rem",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    marginBottom: "1rem",
    fontSize: ".9rem",
  },
  checkbox: { marginRight: ".5rem" },
  row: { display: "flex", gap: "8px" },
  button: {
    padding: ".6rem 1.2rem",
    fontSize: "1rem",
    cursor: "pointer",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: 4,
  },
  buttonGhost: {
    padding: ".6rem 1.2rem",
    fontSize: "1rem",
    cursor: "pointer",
    backgroundColor: "#6c757d",
    color: "#fff",
    border: "none",
    borderRadius: 4,
  },
  message: { marginBottom: "1rem", fontSize: "1rem" },
};

export default function CompanyForm() {
  const [, setCompanies] = useState<Company[]>([]);
  const [hasContact, setHasContact] = useState<boolean>(true);
  const [form, setForm] = useState<FormState>(defaultFormState);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    if (name === "hasContact") setHasContact(checked);
    else setForm((prev) => ({ ...prev, [name]: value }));
  };

  const buildCompany = (): Company => {
    const company: Company = {
      name: form.name,
      adresse: { straße: form.strasse, plz: form.plz, ort: form.ort },
    };
    if (hasContact && form.ansprechpartnerName.trim()) {
      const ap: Contact = { name: form.ansprechpartnerName.trim() };
      if (form.ansprechpartnerEmail.trim())
        ap.email = form.ansprechpartnerEmail.trim();
      if (form.ansprechpartnerTelefon.trim())
        ap.telefon = form.ansprechpartnerTelefon.trim();
      if (form.ansprechpartnerLinkedIn.trim())
        ap.linkedin = form.ansprechpartnerLinkedIn.trim();
      company.ansprechpartner = ap;
    }
    return company;
  };

  const reset = () => {
    setForm(defaultFormState);
    setHasContact(true);
  };

  const onSubmitLocal = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const entry = buildCompany();
    try {
      await saveCompanyLocal(entry);
      setCompanies((p) => [...p, entry]);
      setSuccess("Lokal gespeichert!");
      reset();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const onSubmitRemote = async () => {
    setError(null);
    setSuccess(null);
    const entry = buildCompany();
    try {
      await saveCompanyRemote(entry, { defaultJobName: "Initiativbewerbung" });
      setCompanies((p) => [...p, entry]);
      setSuccess("Direkt in Notion synchronisiert!");
      reset();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Firma hinzufügen</h2>
      {error && <p style={{ ...styles.message, color: "red" }}>{error}</p>}
      {success && (
        <p style={{ ...styles.message, color: "green" }}>{success}</p>
      )}

      <form onSubmit={onSubmitLocal}>
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>Firmendaten</legend>

          <label style={styles.label}>Firmenname</label>
          <input
            style={styles.input}
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <label style={styles.label}>Straße</label>
          <input
            style={styles.input}
            name="strasse"
            value={form.strasse}
            onChange={handleChange}
            required
          />

          <label style={styles.label}>PLZ</label>
          <input
            style={styles.input}
            name="plz"
            value={form.plz}
            onChange={handleChange}
            required
          />

          <label style={styles.label}>Ort</label>
          <input
            style={styles.input}
            name="ort"
            value={form.ort}
            onChange={handleChange}
            required
          />
        </fieldset>

        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            name="hasContact"
            checked={hasContact}
            onChange={handleChange}
            style={styles.checkbox as React.CSSProperties}
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
              onChange={handleChange}
            />

            <label style={styles.label}>E-Mail</label>
            <input
              style={styles.input}
              name="ansprechpartnerEmail"
              type="email"
              value={form.ansprechpartnerEmail}
              onChange={handleChange}
            />

            <label style={styles.label}>Telefon</label>
            <input
              style={styles.input}
              name="ansprechpartnerTelefon"
              value={form.ansprechpartnerTelefon}
              onChange={handleChange}
            />

            <label style={styles.label}>LinkedIn</label>
            <input
              style={styles.input}
              name="ansprechpartnerLinkedIn"
              value={form.ansprechpartnerLinkedIn}
              onChange={handleChange}
            />
          </fieldset>
        )}

        <div style={styles.row}>
          <button style={styles.button} type="submit">
            Lokal speichern (JSON)
          </button>
          <button
            style={styles.buttonGhost}
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
