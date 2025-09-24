import { Authenticated, Unauthenticated, useQuery } from "convex/react";
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

type Screen = "welcome" | "map" | "report" | "details" | "profile";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-green-50">
      <Authenticated>
        <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">♻️</span>
            </div>
            <h2 className="text-lg font-bold text-gray-800">Menos Plástico, Mais Futuro!</h2>
          </div>
          <div className="flex items-center gap-4">
            <nav className="flex gap-2">
              <button
                onClick={() => setCurrentScreen("map")}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  currentScreen === "map" 
                    ? "bg-blue-500 text-white" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Mapa
              </button>
              <button
                onClick={() => setCurrentScreen("profile")}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  currentScreen === "profile" 
                    ? "bg-blue-500 text-white" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Perfil
              </button>
            </nav>
            <SignOutButton />
          </div>
        </header>
      </Authenticated>

      <main className="flex-1">
        <Content 
          currentScreen={currentScreen}
          setCurrentScreen={setCurrentScreen}
          selectedReportId={selectedReportId}
          setSelectedReportId={setSelectedReportId}
        />
      </main>
      <Toaster />
    </div>
  );
}

function Content({ 
  currentScreen, 
  setCurrentScreen, 
  selectedReportId, 
  setSelectedReportId 
}: {
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
  selectedReportId: string | null;
  setSelectedReportId: (id: string | null) => void;
}) {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Unauthenticated>
        <WelcomeScreen />
        <div className="max-w-md mx-auto p-8">
          <SignInForm />
        </div>
      </Unauthenticated>

      <Authenticated>
        {currentScreen === "welcome" && (
          <WelcomeScreen onStart={() => setCurrentScreen("map")} />
        )}
        {currentScreen === "map" && (
          <MapView 
            onReportClick={(id) => {
              setSelectedReportId(id);
              setCurrentScreen("details");
            }}
            onAddReport={() => setCurrentScreen("report")}
          />
        )}
        {currentScreen === "report" && (
          <ReportForm onSuccess={() => setCurrentScreen("map")} />
        )}
        {currentScreen === "details" && selectedReportId && (
          <ReportDetails 
            reportId={selectedReportId}
            onBack={() => setCurrentScreen("map")}
          />
        )}
        {currentScreen === "profile" && (
          <UserProfile />
        )}
      </Authenticated>
    </>
  );
}
