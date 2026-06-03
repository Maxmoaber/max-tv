import React from 'react'

export default function Footer(){
  return (
    <footer className="bg-gradient-to-r from-[#0a0e14] to-[#121a24] text-gray-400 mt-16 border-t border-[#1e2a36]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="text-2xl font-extrabold text-[#e50914] mb-3">Max.tv</div>
            <p className="text-sm max-w-md leading-relaxed">
              Tu plataforma de streaming con las mejores películas y series. 
              Disfruta del mejor contenido en calidad HD con recomendaciones personalizadas.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Navegación</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Inicio</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Tendencias</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Películas</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Series</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Términos de uso</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacidad</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#1e2a36] pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <div>© {new Date().getFullYear()} Max.tv. Todos los derechos reservados.</div>
          <div className="flex items-center gap-4">
            <span className="hover:text-white transition-colors cursor-pointer">Términos</span>
            <span className="hover:text-white transition-colors cursor-pointer">Privacidad</span>
            <span className="hover:text-white transition-colors cursor-pointer">Cookies</span>
          </div>
          <div className="text-xs text-gray-500 md:text-right">
            Desarrollado por{" "}
            <a
              href="https://www.linkedin.com/in/emiliano-gonzalez-605993321/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-[#e50914] transition-colors"
            >
              Emiliano González
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
