import React, { useState } from 'react';

export default function UrlInputForm({ onSubmit, loading }) {
  const [url, setUrl] = useState('');
  const [sentenceCount, setSentenceCount] = useState(5);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url) {
      onSubmit(url, sentenceCount, 'luhn');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-[20px] p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-white/20 w-full transition-all duration-300">
      <div className="mb-5 relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/70">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
          </svg>
        </div>
        <input
          id="url"
          type="url"
          required
          placeholder="Enter Article URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white/20 border border-transparent rounded-full text-white placeholder-white/70 focus:outline-none focus:border-white/40 focus:bg-white/30 transition-all shadow-inner"
        />
      </div>
      
      <div className="mb-8 relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/70">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        </div>
        <input
          id="sentenceCount"
          type="number"
          min="1"
          max="20"
          placeholder="Number of Images (e.g. 5)"
          value={sentenceCount}
          onChange={(e) => setSentenceCount(parseInt(e.target.value) || 5)}
          className="w-full pl-12 pr-4 py-3 bg-white/20 border border-transparent rounded-full text-white placeholder-white/70 focus:outline-none focus:border-white/40 focus:bg-white/30 transition-all shadow-inner"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !url}
        className={`w-full font-bold py-3.5 px-6 rounded-full text-white text-md tracking-wide transition-all transform ${
          loading 
            ? 'bg-blue-500/50 cursor-not-allowed' 
            : 'bg-[#007aff] hover:bg-blue-600 hover:scale-[1.02] shadow-[0_4px_14px_0_rgba(0,122,255,0.39)]'
        }`}
      >
        {loading ? 'Generating...' : 'Generate Images'}
      </button>
    </form>
  );
}
