"use client";
import AuthForm from "../components/AuthForm";

export default function HomePage({ setIsLoggedIn }) {
  return (
    <main className="container">
      <AuthForm setIsLoggedIn={setIsLoggedIn} />
    </main>
  );
}
