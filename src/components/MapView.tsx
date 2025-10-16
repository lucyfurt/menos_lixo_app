import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
interface MapViewProps {
  onReportClick: (reportId: string) => void;
  onAddReport: () => void;
}

export function MapView({ onReportClick, onAddReport }: MapViewProps) {
  const [statusFilter, setStatusFilter] = useState<"all" | "reported" | "cleaned">("all");
  const reports = useQuery(api.wasteReports.listReports, {
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "reported": return "bg-red-500";
      case "cleaned": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "reported": return "Reportado";
      case "cleaned": return "Limpo";

      default: return "Desconhecido";
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Filter Bar */}
      <div className="bg-white border-b p-4">
        <div className="flex gap-2 overflow-x-auto items-center">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = '/';
            }}
            className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
          >
            Voltar
          </a>
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${statusFilter === "all"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            Todos
          </button>
          <button
            onClick={() => setStatusFilter("reported")}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${statusFilter === "reported"
              ? "bg-red-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            Reportados
          </button>

          <button
            onClick={() => setStatusFilter("cleaned")}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${statusFilter === "cleaned"
              ? "bg-green-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            Limpos
          </button>

          <button
            onClick={onAddReport}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${statusFilter === "cleaned"
              ? "bg-green-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            Adicionar Reporte
          </button>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative bg-gradient-to-br from-blue-100 to-green-100">
        {/* Simulated Map */}
        {/* Reports List Overlay */}
        <div className="absolute top-4 left-4 right-4 max-h-96">
          <div className="space-y-2">
            {reports?.map((report) => (
              <div
                key={report._id}
                onClick={() => onReportClick(report._id)}
                className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(report.status)} mt-1`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-800">
                        {report.wasteType}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)} text-white`}>
                        {getStatusText(report.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{report.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Por {report.userName} • {new Date(report.reportedAt).toLocaleDateString()}
                    </p>
                  </div>
                  {report.imageUrl && (
                    <img
                      src={report.imageUrl}
                      alt="Lixo reportado"
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

  );
}
