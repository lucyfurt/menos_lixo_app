
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

interface ReportDetailsProps {
  reportId: string;
  onBack: () => void;
}

export function ReportDetails({ reportId, onBack }: ReportDetailsProps) {
  const [newComment, setNewComment] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);

  const report = useQuery(api.wasteReports.getReport, {
    reportId: reportId as Id<"wasteReports">
  });
  const addComment = useMutation(api.wasteReports.addComment);
  const markAsCleaned = useMutation(api.wasteReports.markAsCleaned);

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

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) {
      toast.error("Digite um comentário");
      return;
    }

    setIsAddingComment(true);

    try {
      await addComment({
        wasteReportId: reportId as Id<"wasteReports">,
        content: newComment.trim(),
      });

      setNewComment("");
      toast.success("Comentário adicionado!");
    } catch (error) {
      toast.error("Você precisa fazer login para comentar!");
    } finally {
      setIsAddingComment(false);
    }
  };

  const handleMarkAsCleaned = async () => {
    try {
      await markAsCleaned({ reportId: reportId as Id<"wasteReports"> });
      toast.success("Ponto marcado como limpo!");
    } catch (error) {
      toast.error("Você precisa fazer login para marcar como limpo!");
    }
  };

  const handleNavigateToLocation = () => {
    if (!report) return;

    const { latitude, longitude } = report;

    // Try to open in Google Maps app first, fallback to web
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

    // For mobile devices, try to open the native maps app
    if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      const mapsAppUrl = `geo:${latitude},${longitude}?q=${latitude},${longitude}(Ponto de Limpeza)`;

      // Try to open native app first
      const link = document.createElement('a');
      link.href = mapsAppUrl;
      link.click();

      // Fallback to Google Maps after a short delay
      setTimeout(() => {
        window.open(googleMapsUrl, '_blank');
      }, 1000);
    } else {
      // Desktop - open Google Maps directly
      window.open(googleMapsUrl, '_blank');
    }

    toast.success("Abrindo navegação para o local!");
  };

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:shadow-lg transition-shadow"
          >
            ←
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Detalhes do Relatório</h1>
        </div>

        {/* Report Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          {/* Image */}
          {report.imageUrl && (
            <img
              src={report.imageUrl}
              alt="Lixo reportado"
              className="w-full h-64 object-cover"
            />
          )}

          <div className="p-6">
            {/* Status and Type */}
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(report.status)}`}>
                {getStatusText(report.status)}
              </span>
              <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                {report.wasteType}
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-700 mb-4 leading-relaxed">{report.description}</p>

            {/* Metadata */}
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <p>
                <span className="font-medium">Reportado por:</span> {report.userName}
              </p>
              <p>
                <span className="font-medium">Data:</span> {new Date(report.reportedAt).toLocaleString()}
              </p>
              <div className="flex items-center justify-between">
                <p>
                  <span className="font-medium">Localização:</span> {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
                </p>
                <button
                  onClick={handleNavigateToLocation}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors flex items-center gap-1"
                >
                  🧭 Ir até lá para limpar
                </button>
              </div>
              {report.cleanedAt && (
                <p>
                  <span className="font-medium">Limpo em:</span> {new Date(report.cleanedAt).toLocaleString()}
                </p>
              )}
            </div>

            {/* Action Button */}
            {report.status !== "cleaned" && (
              <button
                onClick={handleMarkAsCleaned}
                className="w-full mt-4 bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Marcar como Limpo
              </button>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Comentários ({report.comments?.length || 0})
          </h3>

          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="mb-6">
            <div className="flex gap-3">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Adicione um comentário..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={isAddingComment}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {isAddingComment ? "..." : "Enviar"}
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {report.comments?.map((comment) => (
              <div key={comment._id} className="border-l-4 border-blue-200 pl-4 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-800">{comment.userName}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>
            ))}

            {(!report.comments || report.comments.length === 0) && (
              <p className="text-gray-500 text-center py-8">
                Nenhum comentário ainda. Seja o primeiro a comentar!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
