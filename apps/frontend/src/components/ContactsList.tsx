import  { useState, useEffect } from "react";

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
  companyCard: {
    marginBottom: "1.5rem",
    padding: "1rem",
    border: "1px solid #ccc",
    borderRadius: 4,
  },
  title: { margin: 0, fontSize: "1.2rem" },
  subtitle: {
    margin: "0.5rem 0 0.25rem",
    fontSize: "1rem",
    fontWeight: "bold" as const,
  },
  text: { margin: "0.25rem 0" },
};

export default function ContactsList() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/contacts")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<Company[]>;
      })
      .then((data) => setCompanies(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Lade Kontakte…</p>;
  if (error)
    return <p style={{ color: "red", textAlign: "center" }}>Fehler: {error}</p>;

  return (
    <div style={styles.container}>
      <h2>Alle gespeicherten Firmen</h2>
      {companies.length === 0 && <p>Keine Einträge vorhanden.</p>}
      {companies.map((c, i) => (
        <div key={i} style={styles.companyCard}>
          <h3 style={styles.title}>{c.name}</h3>
          <p style={styles.text}>
            <span style={styles.subtitle}>Adresse:</span>
            <br />
            {c.adresse.straße}, {c.adresse.plz} {c.adresse.ort}
          </p>
          {c.ansprechpartner && (
            <>
              <p style={styles.subtitle}>Ansprechpartner:</p>
              <p style={styles.text}>Name: {c.ansprechpartner.name}</p>
              {c.ansprechpartner.email && (
                <p style={styles.text}>E-Mail: {c.ansprechpartner.email}</p>
              )}
              {c.ansprechpartner.telefon && (
                <p style={styles.text}>Telefon: {c.ansprechpartner.telefon}</p>
              )}
              {c.ansprechpartner.linkedin && (
                <p style={styles.text}>
                  LinkedIn:{" "}
                  <a
                    href={c.ansprechpartner.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Profil
                  </a>
                </p>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
