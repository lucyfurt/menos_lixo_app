import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

interface MapViewProps {
  onReportClick: (reportId: string) => void;
  onAddReport: () => void;
  onBack: () => void;
  loggedInUser?: boolean;
}

export function MapView({ onReportClick, onAddReport, onBack, loggedInUser }: MapViewProps) {
  const [statusFilter, setStatusFilter] = useState<"all" | "reported" | "cleaned">("all");

  const reports = useQuery(api.wasteReports.listReports, {
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "reported": return "bg-red-500";
      case "cleaned": return "bg-green-500";
      case "new": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "reported": return "Reportado";
      case "cleaned": return "Limpo";
      case "new": return "Novo";
      default: return "Desconhecido";
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 relative">
      {/* ===== HEADER TRANSPARENTE ===== */}
      <header className="absolute top-0 left-0 w-full z-10 p-4 flex items-center justify-between backdrop-blur-sm">
        {/* Botão Voltar */}
        <button
          onClick={onBack}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/20 transition"
        >
          ⬅️
        </button>

        {/* Filtros */}
        <div className="flex items-center gap-2 overflow-x-auto px-2 scrollbar-hide">
          {["all", "reported", "cleaned"].map((filter) => {
            const colors: Record<string, string> = {
              all: "bg-blue-500",
              reported: "bg-red-500",
              cleaned: "bg-green-500",
            };
            const labels: Record<string, string> = {
              all: "Todos",
              reported: "Reportados",
              cleaned: "Limpos",
            };
            const active = statusFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter as any)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${active
                    ? `${colors[filter]} text-white`
                    : "bg-white/20 text-gray-800 hover:bg-white/30"
                  }`}
              >
                {labels[filter]}
              </button>
            );
          })}
        </div>

        {/* Botão Adicionar */}
        <button
          onClick={onAddReport}
          className="px-4 py-2 rounded-full text-sm font-medium bg-green-500 text-white hover:bg-green-600 transition ml-4"
        >
          + Adicionar
        </button>

        {/* Botões Perfil e Sair */}
        {loggedInUser && (
          <div className="absolute top-4 right-4 flex gap-2 z-20">
            <button className="px-3 py-1 rounded-full text-sm font-medium bg-blue-500 text-white">
              Perfil
            </button>
            <button className="px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-800">
              Sair
            </button>
          </div>
        )}
      </header>

      {/* ===== MAP AREA / CARDS ===== */}
      <main className="flex-1 relative bg-gradient-to-br from-blue-100 to-green-100 overflow-y-auto pt-24 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {reports?.map((report) => (
            <div
              key={report._id}
              onClick={() => onReportClick(report._id)}
              className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md p-4 cursor-pointer hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(report.status)}`}></div>
                <span className="text-sm font-semibold text-gray-800 truncate">
                  {report.wasteType}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    report.status
                  )} text-white`}
                >
                  {getStatusText(report.status)}
                </span>
              </div>

              {report.imageUrl && (
                <img
                  src={report.imageUrl}
                  alt="Lixo reportado"
                  className="w-full h-36 object-cover rounded-lg mb-2"
                />
              )}

              <p className="text-sm text-gray-600 line-clamp-2">{report.description}</p>
              <p className="text-xs text-gray-500 mt-1">
                Por {report.userName} •{" "}
                {new Date(report.reportedAt).toLocaleDateString("pt-BR")}
              </p>
            </div>
          ))}

          {reports?.length === 0 && (
            <div className="col-span-full text-center text-gray-500 text-sm mt-6">
              Nenhum relatório encontrado.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
