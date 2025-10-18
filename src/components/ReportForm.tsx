import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { useCurrentUserProfile } from "@/hooks/useCurrentUserProfile";
interface ReportFormProps {
  onSuccess: () => void;
}

export function ReportForm({ onSuccess }: ReportFormProps) {
  const { loading, profile } = useCurrentUserProfile();
  const [description, setDescription] = useState("");
  const [wasteType, setWasteType] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const createReport = useMutation(api.wasteReports.createReport);
  const generateUploadUrl = useMutation(api.wasteReports.generateUploadUrl);

  const wasteTypes = [
    "Garrafas PET",
    "Sacolas Plásticas",
    "Embalagens de Alimentos",
    "Canudos e Utensílios",
    "Redes de Pesca",
    "Outros Plásticos"
  ];

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toString());
          setLongitude(position.coords.longitude.toString());
          toast.success("Localização obtida com sucesso!");
        },
        (error) => {
          toast.error("Erro ao obter localização. Digite manualmente.");
          setUseCurrentLocation(false);
        }
      );
    } else {
      toast.error("Geolocalização não suportada. Digite manualmente.");
      setUseCurrentLocation(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim() || !wasteType || !latitude || !longitude) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setIsSubmitting(true);

    try {
      let imageId = undefined;

      if (selectedImage) {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": selectedImage.type },
          body: selectedImage,
        });

        if (!result.ok) {
          throw new Error("Falha no upload da imagem");
        }

        const json = await result.json();
        imageId = json.storageId;
      }

      await createReport({
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        description: description.trim(),
        wasteType,
        imageId,
      });

      toast.success("Relatório enviado com sucesso!");
      onSuccess();
    } catch (error) {
      toast.error("Erro ao enviar relatório. Tente novamente.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  if (loading) return <p>Carregando perfil...</p>;
  return (

    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <p className="text-gray-600 mb-4">
        Logado como: <strong>{profile?.displayName}</strong>
      </p>
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-2xl">📍</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Denunciar Lixo</h2>
            <p className="text-gray-600 mt-2">Ajude a mapear pontos com lixo plástico</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Localização
              </label>
              {useCurrentLocation ? (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    📍 Usar Localização Atual
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseCurrentLocation(false)}
                    className="w-full text-sm text-gray-500 hover:text-gray-700"
                  >
                    Inserir coordenadas manualmente
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="any"
                    placeholder="Latitude"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <input
                    type="number"
                    step="any"
                    placeholder="Longitude"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              )}
            </div>

            {/* Waste Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Lixo *
              </label>
              <select
                value={wasteType}
                onChange={(e) => setWasteType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Selecione o tipo</option>
                {wasteTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva a situação do lixo encontrado..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                required
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foto (Opcional)
              </label>
              <input
                type="file"
                accept="image/*"
                ref={imageInputRef}
                onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {selectedImage && (
                <div className="mt-2">
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? "Enviando..." : "Enviar Relatório"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
