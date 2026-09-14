import React from 'react';
import UrlInputForm from './components/UrlInputForm';
import StoryImageCarousel from './components/StoryImageCarousel';
import { useSummarizeJob } from './hooks/useSummarizeJob';

function App() {
  const { startJob, job, loading, error, resetJob } = useSummarizeJob();
  
  const showCarousel = job?.status === 'done' && job?.images?.length > 0;

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat font-sans text-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop')" }}
    >
      {/* Dark overlay to make the glass card pop better */}
      <div className="absolute inset-0 bg-blue-900/30 mix-blend-multiply pointer-events-none"></div>
      
      <div className="max-w-3xl mx-auto w-full relative z-10 flex flex-col items-center justify-center min-h-[600px]">
        
        <div className="text-center mb-6 w-full">
          <h1 className="text-5xl font-extrabold text-white mb-3 drop-shadow-lg tracking-tight">
            Article to Image
          </h1>
          <p className="text-white/90 text-lg drop-shadow-md font-medium whitespace-nowrap">
            Transform any web article into stunning, shareable 9:16 stories.
          </p>
        </div>

        {!showCarousel && !loading && (
          <div className="w-full max-w-md">
            <UrlInputForm onSubmit={startJob} loading={loading} />
          </div>
        )}

        {error && !loading && (
          <div className="mt-6 bg-red-500/10 backdrop-blur-md border border-red-500/30 text-white px-6 py-4 rounded-2xl shadow-lg relative text-center w-full max-w-md">
            <span className="block sm:inline">{error}</span>
            <button onClick={resetJob} className="mt-4 bg-white/20 px-4 py-2 rounded-full text-sm block mx-auto hover:bg-white/30 transition-all">Try Again</button>
          </div>
        )}

        {loading && (
          <div className="text-center text-white bg-black/20 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 shadow-2xl w-full max-w-md">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-6"></div>
            <p className="text-lg animate-pulse font-medium">Crafting your images...</p>
          </div>
        )}

        {showCarousel && (
          <div className="animate-fade-in-up w-full">
            <StoryImageCarousel images={job.images} onReset={resetJob} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
