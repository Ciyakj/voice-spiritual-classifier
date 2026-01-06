import Groq from 'groq-sdk';

const INTENT_CATEGORIES = [
  'Career/Purpose',
  'Relationships',
  'Inner Conflict',
  'Life Transitions',
  'Daily Struggles'
];

/**
 * Classify user intent into one of 5 categories
 */
export async function classifyIntent(text) {
  // Demo mode for testing without OpenAI
  if (process.env.DEMO_MODE === 'true') {
    console.log('[CLASSIFY] Using demo mode');
    
    // Better keyword-based demo classification
    const lowerText = text.toLowerCase();
    let category = 'Daily Struggles'; // default
    
    // Career keywords
    if (lowerText.match(/career|job|work|calling|profession|promotion|interview|boss|employer|employment|purpose|path|direction|guidance/)) {
      category = 'Career/Purpose';
    }
    // Relationship keywords
    else if (lowerText.match(/relationship|family|friend|partner|husband|wife|girlfriend|boyfriend|spouse|parent|child|marriage|love|romance|social/)) {
      category = 'Relationships';
    }
    // Inner conflict keywords
    else if (lowerText.match(/doubt|identity|self|conflict|confused|uncertainty|struggling|self-doubt|insecure|fear|anxiety about myself|who am i/)) {
      category = 'Inner Conflict';
    }
    // Life transition keywords
    else if (lowerText.match(/change|transition|moving|moving|new city|new home|graduation|retirement|marriage|decision|major change|milestone|next chapter|phase/)) {
      category = 'Life Transitions';
    }
    // Daily struggles keywords
    else if (lowerText.match(/stress|anxious|worry|tired|frustrated|overwhelmed|struggling|difficult|challenge|problem|struggling/)) {
      category = 'Daily Struggles';
    }
    
    return {
      category: category,
      confidence: 0.85,
      explanation: `Detected keywords matching ${category}`
    };
  }

  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not configured and DEMO_MODE is off');
  }

  const client = new Groq({
    apiKey: process.env.GROQ_API_KEY
  });

  try {
    const systemPrompt = `You are an expert spiritual advisor assistant helping classify user queries about life guidance.

Classify the user's input into EXACTLY ONE of these categories:
1. Career/Purpose - Questions about job, career path, professional growth, calling
2. Relationships - Questions about family, friends, romantic partners, social connections
3. Inner Conflict - Questions about self-doubt, identity, values, internal struggles
4. Life Transitions - Questions about major changes (moving, marriage, major decisions, milestones)
5. Daily Struggles - Questions about stress, anxiety, routine challenges, mundane problems

Respond in JSON format:
{
  "category": "<one of the 5 categories>",
  "confidence": <0-1>,
  "explanation": "<brief one-line explanation>"
}

Be strict: Choose only ONE category even if multiple apply. Pick the PRIMARY theme.`;

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ],
      temperature: 0.3,
      max_tokens: 200
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);

    return {
      category: parsed.category,
      confidence: parsed.confidence,
      explanation: parsed.explanation
    };
  } catch (error) {
    console.error('Classification Error:', error.message);
    throw new Error(`Intent classification failed: ${error.message}`);
  }
}
