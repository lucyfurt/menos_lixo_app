import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { useState } from "react";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { MapView } from "./components/MapView";
import { ReportForm } from "./components/ReportForm";
import { ReportDetails } from "./components/ReportDetails";
import { UserProfile } from "./components/UserProfile";

type Screen = "welcome" | "map" | "details" | "report" | "profile";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const loggedInUser = useQuery(api.auth.loggedInUser);

  return (
    <div>
      <header>
        <div className="flex items-center justify-between w-full p-4">
          {/* Área do botão Voltar (mantém espaço mesmo quando não visível) */}
          <div className="w-[90px]">
            {currentScreen !== "welcome" && (
              <button
                onClick={() =>
                  setCurrentScreen(currentScreen === "map" ? "welcome" : "map")
                }
                className="px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                ← Voltar
              </button>
            )}
          </div>
          {/* Botões Perfil e Sair - sempre fixos à direita */}
          <div className="flex items-center justify-end gap-4">
            <nav className="flex gap-2">
              {loggedInUser && (
                <button
                  onClick={() => setCurrentScreen("profile")}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${currentScreen === "profile"
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  Perfil
                </button>
              )}
            </nav>
            {loggedInUser && <SignOutButton />}
          </div>
        </div>
      </header >

      <main className="flex-1">
        <Content
          currentScreen={currentScreen}
          setCurrentScreen={setCurrentScreen}
          selectedReportId={selectedReportId}
          setSelectedReportId={setSelectedReportId}
          loggedInUser={loggedInUser}
        />
      </main>

      <Toaster />
    </div >
  );
}

function Content({
  currentScreen,
  setCurrentScreen,
  selectedReportId,
  setSelectedReportId,
  loggedInUser
}: {
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
  selectedReportId: string | null;
  setSelectedReportId: (id: string | null) => void;
  loggedInUser: any;
}) {
  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Conteúdo público
  if (currentScreen === "welcome") {
    return <WelcomeScreen onStart={() => setCurrentScreen("map")} />;
  }
  if (currentScreen === "map") {
    return (
      <MapView
        onBack={() => setCurrentScreen("welcome")}
        onReportClick={(id) => {
          setSelectedReportId(id);
          setCurrentScreen("details");

        }}
        onAddReport={() => setCurrentScreen("report")}

      />
    );
  }
  if (currentScreen === "details" && selectedReportId) {
    return (
      <ReportDetails
        reportId={selectedReportId}
        onBack={() => setCurrentScreen("map")}
      />
    );
  }

  // Só mostra o formulário de login se tentar acessar "report" ou "profile" sem estar logado
  if ((currentScreen === "report" || currentScreen === "profile") && !loggedInUser) {
    return (
      <div className="max-w-md mx-auto p-8">
        <SignInForm />
      </div>
    );
  }

  if (currentScreen === "report" && loggedInUser) {
    return <ReportForm onSuccess={() => setCurrentScreen("map")} />;
  }
  if (currentScreen === "profile" && loggedInUser) {
    return <UserProfile />;
  }

  return null;
}