import Dashboard from './components/Dashboard';
import { useSimulation } from './hooks/useSimulation';

const App = () => {
  const simulation = useSimulation();

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans">
      <header className="bg-stone-900 text-stone-100 py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-light tracking-wide">ER Simulation</h1>
          <p className="text-stone-400 text-sm mt-1">
            Hospital Emergency Department Flow Analysis
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Dashboard {...simulation} />
      </main>

      <footer className="border-t border-stone-200 py-6 mt-auto">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-stone-500 text-sm">
          <div>Hospital Emergency Room Simulation Project</div>
          <div className="mt-2 md:mt-0">
            <a
              href="https://github.com/joshfermano"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center hover:text-stone-700 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 mr-2">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
              Josh Khovick Fermano
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
