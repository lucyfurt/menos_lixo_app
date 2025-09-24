import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useRef } from "react";
import { toast } from "sonner";

export function UserProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const profile = useQuery(api.userProfiles.getCurrentUserProfile);
  const leaderboard = useQuery(api.userProfiles.getLeaderboard);
  const updateProfile = useMutation(api.userProfiles.updateProfile);
  const generateUploadUrl = useMutation(api.wasteReports.generateUploadUrl);

  const handleEditProfile = () => {
    setDisplayName(profile?.displayName || "");
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      toast.error("Digite um nome");
      return;
    }

    setIsUpdating(true);

    try {
      let profileImageId = undefined;

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
        profileImageId = json.storageId;
      }

      await updateProfile({
        displayName: displayName.trim(),
        profileImageId,
      });

      setIsEditing(false);
      setSelectedImage(null);
      toast.success("Perfil atualizado!");
    } catch (error) {
      toast.error("Erro ao atualizar perfil");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const userRank = (leaderboard?.findIndex(user => user.userId === profile.userId) ?? -1) + 1 || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center overflow-hidden">
                {profile.profileImageUrl ? (
                  <img
                    src={profile.profileImageUrl}
                    alt="Perfil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl text-white">🙍🏻‍♂️</span>
                )}
              </div>
              {isEditing && (
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-blue-600 transition-colors"
                >
                  📷
                </button>
              )}
            </div>

            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="text-2xl font-bold text-gray-800 bg-transparent border-b-2 border-blue-500 focus:outline-none"
                  placeholder="Seu nome"
                />
              ) : (
                <h1 className="text-2xl font-bold text-gray-800">{profile.displayName}</h1>
              )}
              
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm text-gray-600">
                  Membro desde {new Date(profile.joinedAt).toLocaleDateString()}
                </span>
                {userRank > 0 && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                    #{userRank} no ranking
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              {isEditing ? (
                <div className="space-x-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    {isUpdating ? "Salvando..." : "Salvar"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleEditProfile}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Editar Perfil
                </button>
              )}
            </div>
          </div>

          <input
            type="file"
            accept="image/*"
            ref={imageInputRef}
            onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
            className="hidden"
          />

          {selectedImage && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Nova foto de perfil:</p>
              <img
                src={URL.createObjectURL(selectedImage)}
                alt="Preview"
                className="w-20 h-20 rounded-full object-cover"
              />
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Statistics */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Suas Estatísticas</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white">📍</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Relatórios Enviados</p>
                    <p className="text-sm text-gray-600">Pontos de lixo reportados</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-red-600">{profile.reportsCount}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white">🧹</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Limpezas Realizadas</p>
                    <p className="text-sm text-gray-600">Pontos marcados como limpos</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-green-600">{profile.cleanupsCount}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white">🏆</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Impacto Total</p>
                    <p className="text-sm text-gray-600">Contribuições para o meio ambiente</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-blue-600">
                  {profile.reportsCount + profile.cleanupsCount}
                </span>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Ranking de Contribuidores</h2>
            
            <div className="space-y-3">
              {leaderboard?.slice(0, 10).map((user, index) => (
                <div
                  key={user._id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    user.userId === profile.userId ? "bg-blue-50 border-2 border-blue-200" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-center w-8 h-8">
                    {index < 3 ? (
                      <span className="text-lg">
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                      </span>
                    ) : (
                      <span className="text-sm font-bold text-gray-600">#{index + 1}</span>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{user.displayName}</p>
                    <p className="text-sm text-gray-600">
                      {user.reportsCount} relatórios • {user.cleanupsCount} limpezas
                    </p>
                  </div>
                  
                  <span className="text-sm font-bold text-blue-600">
                    {user.reportsCount + user.cleanupsCount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
