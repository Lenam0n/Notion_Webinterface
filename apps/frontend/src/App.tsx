import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "@component/Sidebar";
import CompanyForm from "@component/CompanyForm";
import ContactsList from "@component/ContactsList";

const containerStyle: React.CSSProperties = { display: "flex" };
const contentStyle: React.CSSProperties = { flex: 1, padding: "1rem" };

export default function App() {
  return (
    <div style={containerStyle}>
      <Sidebar />
      <main style={contentStyle}>
        <Routes>
          <Route path="/" element={<CompanyForm />} />
          <Route path="/all" element={<ContactsList />} />
        </Routes>
      </main>
    </div>
  );
}
