import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-gray-800 border-b border-gray-700 mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-white font-bold text-xl">
              Pagina Inicial
            </Link>
          </div>
          <div className="flex items-center">
            <Link href="/empresas" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
              Adicionar Empresa
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}