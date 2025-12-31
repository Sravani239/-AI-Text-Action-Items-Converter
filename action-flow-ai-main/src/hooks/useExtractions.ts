import { useState, useEffect } from 'react';

export interface ActionItem {
  id: string;
  task: string;
  owner: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  confidence: number;
}

export interface Extraction {
  id: string;
  title: string;
  source: 'text' | 'zoom';
  sourceUrl?: string;
  rawText: string;
  actionItems: ActionItem[];
  createdAt: string;
}

export function useExtractions() {
  const [extractions, setExtractions] = useState<Extraction[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('actionflow_extractions');
    if (stored) {
      setExtractions(JSON.parse(stored));
    }
  }, []);

  const saveExtraction = (extraction: Omit<Extraction, 'id' | 'createdAt'>) => {
    const newExtraction: Extraction = {
      ...extraction,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    
    const updated = [newExtraction, ...extractions];
    setExtractions(updated);
    localStorage.setItem('actionflow_extractions', JSON.stringify(updated));
    return newExtraction;
  };

  const deleteExtraction = (id: string) => {
    const updated = extractions.filter(e => e.id !== id);
    setExtractions(updated);
    localStorage.setItem('actionflow_extractions', JSON.stringify(updated));
  };

  const clearAll = () => {
    setExtractions([]);
    localStorage.removeItem('actionflow_extractions');
  };

  return { extractions, saveExtraction, deleteExtraction, clearAll };
}

// NLP-based action item extraction
export function extractActionItems(text: string): ActionItem[] {
  const actionVerbs = [
    'will', 'should', 'must', 'need to', 'needs to', 'going to',
    'assign', 'complete', 'finish', 'deliver', 'send', 'create',
    'review', 'update', 'schedule', 'prepare', 'submit', 'implement',
    'follow up', 'reach out', 'contact', 'set up', 'organize'
  ];

  const names = [
    'Sarah', 'John', 'Mike', 'Lisa', 'David', 'Emma', 'Alex', 'Chris',
    'Jessica', 'Ryan', 'Amy', 'Tom', 'Rachel', 'James', 'Nicole'
  ];

  const deadlinePatterns = [
    /by (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi,
    /by (tomorrow|today|next week|end of (day|week|month))/gi,
    /by (\d{1,2}\/\d{1,2}(\/\d{2,4})?)/gi,
    /due (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi,
    /(\d{1,2})(st|nd|rd|th)?( of)? (january|february|march|april|may|june|july|august|september|october|november|december)/gi,
    /(january|february|march|april|may|june|july|august|september|october|november|december) (\d{1,2})(st|nd|rd|th)?/gi,
    /within (\d+) (days?|weeks?|hours?)/gi,
    /EOD|EOW|EOM/gi,
  ];

  const sentences = text.split(/[.!?\n]+/).filter(s => s.trim().length > 10);
  const items: ActionItem[] = [];

  sentences.forEach(sentence => {
    const lowerSentence = sentence.toLowerCase();
    
    const hasActionVerb = actionVerbs.some(verb => lowerSentence.includes(verb));
    if (!hasActionVerb) return;

    // Find owner
    let owner = 'Unassigned';
    for (const name of names) {
      if (sentence.includes(name)) {
        owner = name;
        break;
      }
    }

    // Find deadline
    let deadline = 'No deadline';
    for (const pattern of deadlinePatterns) {
      const match = sentence.match(pattern);
      if (match) {
        deadline = match[0].replace(/^by\s+/i, '').replace(/^due\s+/i, '');
        break;
      }
    }

    // Determine priority
    let priority: 'high' | 'medium' | 'low' = 'medium';
    if (/urgent|asap|critical|immediately|high priority/i.test(sentence)) {
      priority = 'high';
    } else if (/when possible|low priority|eventually|nice to have/i.test(sentence)) {
      priority = 'low';
    }

    // Calculate confidence
    let confidence = 0.5;
    if (hasActionVerb) confidence += 0.2;
    if (owner !== 'Unassigned') confidence += 0.15;
    if (deadline !== 'No deadline') confidence += 0.15;

    items.push({
      id: crypto.randomUUID(),
      task: sentence.trim().replace(/^[-•*]\s*/, ''),
      owner,
      deadline,
      priority,
      confidence: Math.min(confidence, 1),
    });
  });

  return items.slice(0, 15); // Limit to 15 items
}
