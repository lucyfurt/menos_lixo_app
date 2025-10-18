import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

/**
 * Hook para obter os dados do perfil do usuário autenticado.
 * Retorna nome, imagem e informações do perfil.
 */
export function useCurrentUserProfile() {
  const profile = useQuery(api.userProfiles.getCurrentUserProfile);

  if (profile === undefined) {
    return { loading: true, profile: null };
  }

  return { loading: false, profile };
}
