interface WelcomeScreenProps {
  onStart?: () => void;
}
import bgImage from './assets/background.png';
export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <>

      <div className="min-h-screen flex items-center " style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh"
      }}>
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Menos Plástico,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
                Mais Futuro
              </span>
            </h1>
          </div>
          {onStart && (
            <button
              onClick={onStart}
              className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg
             hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Começar Agora
            </button>
          )}
          <br />
          <br />
          <br />
          <div className="flex flex-col md:flex-row gap-6 mb-8 justify-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl flex-1">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📍</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Denuncie</h3>
                <p className="text-sm text-gray-600">
                  Reporte pontos com lixo plástico na cidade
                </p>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl flex-1">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🗺️</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Mapeie</h3>
                <p className="text-sm text-gray-600">
                  Visualize todos os pontos reportados no mapa
                </p>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl flex-1">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🧹</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Limpe</h3>
                <p className="text-sm text-gray-600">
                  Participe de limpezas e marque pontos como limpos
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer className="text-center p-4 text-sm text-gray-500">
        © 2025 Menos Plástico, Mais Futuro. Todos os direitos reservados.
        <br />
        Desenvolvido por IEMA - Curso Informática para Internet.
      </footer>
    </>

  );
}
