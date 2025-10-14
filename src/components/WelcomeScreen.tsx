interface WelcomeScreenProps {
  onStart?: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-4xl">♻️</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Menos Plástico,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
              Mais Futuro
            </span>
          </h1>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl mb-8">
          <p className="text-lg text-gray-700 mb-6 leading-relaxed">
            Juntos podemos mapear e limpar o lixo plástico da cidade de São Luís. 
            Denuncie pontos com excesso de resíduos, acompanhe limpezas e faça parte 
            da mudança que nossa cidade precisa.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📍</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Denuncie</h3>
              <p className="text-sm text-gray-600">
                Reporte pontos com lixo plástico na cidade
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🗺️</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Mapeie</h3>
              <p className="text-sm text-gray-600">
                Visualize todos os pontos reportados no mapa
              </p>
            </div>
            
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

        {onStart && (
          <button
            onClick={onStart}
            className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Começar Agora
          </button>
        )}
      </div>
    </div>
  );
}
