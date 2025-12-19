import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

interface RegistrationResult {
  name: string;
  roll_number: string;
  email: string;
  branch: string;
  created_at: string;
}

export const SearchRegistration = () => {
  const [rollNumber, setRollNumber] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<RegistrationResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!rollNumber.trim()) return;
    
    setIsSearching(true);
    setResult(null);
    setNotFound(false);
    setError(null);

    try {
      // Use secure Edge Function for search (rate-limited, validated)
      const { data, error: fetchError } = await supabase.functions.invoke('search-registration', {
        body: { roll_number: rollNumber.trim() }
      });

      if (fetchError) {
        console.error('Search error:', fetchError);
        setError('Search failed. Please try again.');
        return;
      }

      if (data?.error) {
        if (data.error.includes('Too many requests')) {
          setError('Too many searches. Please wait a moment and try again.');
        } else if (data.error.includes('Invalid roll number')) {
          setError('Invalid roll number format. Please use only letters, numbers, and hyphens.');
        } else {
          setError(data.error);
        }
        return;
      }

      if (data?.found && data?.registration) {
        setResult(data.registration);
      } else {
        setNotFound(true);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-panel p-6 mt-8"
    >
      <h3 className="font-display text-xl text-primary glow-text mb-4">
        Check My Registration
      </h3>
      
      <div className="flex gap-3">
        <input
          type="text"
          value={rollNumber}
          onChange={(e) => setRollNumber(e.target.value)}
          placeholder="Enter your roll number"
          className="input-cosmic flex-1"
          maxLength={50}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          disabled={isSearching}
          className="btn-cosmic px-6"
        >
          {isSearching ? '🔍' : 'Search'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/30"
          >
            <h4 className="font-display text-lg text-primary mb-3">
              Registration Found! ✨
            </h4>
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Name:</span> <span className="text-foreground">{result.name}</span></p>
              <p><span className="text-muted-foreground">Roll Number:</span> <span className="text-foreground">{result.roll_number}</span></p>
              <p><span className="text-muted-foreground">Email:</span> <span className="text-foreground">{result.email}</span></p>
              <p><span className="text-muted-foreground">Branch:</span> <span className="text-primary font-semibold">{result.branch}</span></p>
              <p><span className="text-muted-foreground">Registered:</span> <span className="text-foreground">{new Date(result.created_at).toLocaleString()}</span></p>
            </div>
          </motion.div>
        )}

        {notFound && (
          <motion.div
            key="notfound"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 p-4 rounded-lg bg-destructive/10 border border-destructive/30"
          >
            <p className="text-destructive font-display">
              No registration found for this roll number.
            </p>
          </motion.div>
        )}

        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 p-4 rounded-lg bg-destructive/10 border border-destructive/30"
          >
            <p className="text-destructive font-display">
              {error}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
