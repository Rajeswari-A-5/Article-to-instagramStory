import { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export function useSummarizeJob() {
  const [jobId, setJobId] = useState(null);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const startJob = async (url, sentenceCount, algorithm) => {
    setLoading(true);
    setError(null);
    setJobId(null);
    setJob(null);

    try {
      const response = await fetch(`${API_BASE_URL}/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          sentence_count: sentenceCount,
          algorithm
        }),
      });

      if (!response.ok) {
        let errorDetails = '';
        try {
          const errData = await response.json();
          errorDetails = errData.detail || response.statusText;
        } catch {
          errorDetails = response.statusText;
        }
        throw new Error(`Failed to start job (${response.status}): ${errorDetails}`);
      }

      const data = await response.json();
      setJobId(data.job_id);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    let intervalId;

    const pollJob = async () => {
      if (!jobId) return;

      try {
        const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
        if (response.ok) {
          const data = await response.json();
          setJob(data);

          if (data.status === 'done' || data.status === 'error') {
            setLoading(false);
            if (data.status === 'error') {
              setError(data.error);
            }
            clearInterval(intervalId);
          }
        }
      } catch (err) {
        console.error("Error polling job:", err);
      }
    };

    if (jobId && loading) {
      intervalId = setInterval(pollJob, 2000);
      pollJob(); // Initial poll
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [jobId, loading]);

  const resetJob = () => {
    setJobId(null);
    setJob(null);
    setLoading(false);
    setError(null);
  };

  return { startJob, job, loading, error, resetJob };
}
