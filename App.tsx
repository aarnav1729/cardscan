
import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { CardUploader } from './components/CardUploader';
import { CardList } from './components/CardList';
import { CardModal } from './components/CardModal';
import { BusinessCard, ScanStatus } from './types';
import { extractCardData } from './services/geminiService';

const App: React.FC = () => {
  const [cards, setCards] = useState<BusinessCard[]>([]);
  const [scanStatus, setScanStatus] = useState<ScanStatus>(ScanStatus.IDLE);
  const [selectedCard, setSelectedCard] = useState<BusinessCard | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load cards from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('cardpulse_storage');
    if (saved) {
      try {
        setCards(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load cards", e);
      }
    }
  }, []);

  // Save cards to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('cardpulse_storage', JSON.stringify(cards));
  }, [cards]);

  const handleCardCapture = async (imageUrl: string) => {
    setScanStatus(ScanStatus.SCANNING);
    setError(null);

    try {
      const data = await extractCardData(imageUrl);
      const newCard: BusinessCard = {
        ...data,
        id: crypto.randomUUID(),
        imageUrl,
        createdAt: Date.now(),
      };
      setCards(prev => [newCard, ...prev]);
      setScanStatus(ScanStatus.SUCCESS);
      
      // Auto-open the newly scanned card
      setSelectedCard(newCard);
      
      // Reset status after a delay
      setTimeout(() => setScanStatus(ScanStatus.IDLE), 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to extract card details. Please try another photo.");
      setScanStatus(ScanStatus.ERROR);
    }
  };

  const handleDeleteCard = (id: string) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      setCards(prev => prev.filter(c => c.id !== id));
      if (selectedCard?.id === id) setSelectedCard(null);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            Digital <span className="text-indigo-600">Rolodex</span>
          </h1>
          <p className="mt-3 text-lg text-gray-500 max-w-2xl mx-auto">
            Scan physical business cards into organized, actionable data using Gemini AI.
          </p>
        </header>

        <section className="mb-12">
          <CardUploader 
            onCapture={handleCardCapture} 
            status={scanStatus}
            error={error}
          />
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Recent Captures</h2>
            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
              {cards.length} Contacts
            </span>
          </div>
          
          <CardList 
            cards={cards} 
            onView={setSelectedCard} 
            onDelete={handleDeleteCard} 
          />
        </section>
      </div>

      {selectedCard && (
        <CardModal 
          card={selectedCard} 
          onClose={() => setSelectedCard(null)} 
        />
      )}
    </Layout>
  );
};

export default App;
