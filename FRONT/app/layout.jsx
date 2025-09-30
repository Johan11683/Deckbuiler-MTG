import "../styles/global.scss";
import { AuthProvider } from "../contexts/AuthContext";
import Header from "../components/Header";

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
