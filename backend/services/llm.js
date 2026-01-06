import Groq from 'groq-sdk';

/**
 * Generate a Krishna-like spiritual response
 * @param {string} userText - The user's question/statement
 * @param {object} intent - The classified intent
 * @param {string} language - Language code (en, hi, hinglish)
 */
export async function generateResponse(userText, intent, language = 'en') {
  // Demo mode for testing without OpenAI
  if (process.env.DEMO_MODE === 'true') {
    console.log('[LLM] Using demo mode, language:', language);
    const demoResponses = {
      en: {
        'Career/Purpose': 'Dear one, remember that your work is but a canvas for your talents. Focus on doing your best without attachment to the fruits of your labor. Your purpose reveals itself through sincere effort and alignment with your values.',
        'Relationships': 'The bonds we form are sacred threads in the fabric of life. Approach each relationship with compassion and understanding. Listen more than you speak, and remember that love grows through acceptance, not control.',
        'Inner Conflict': 'Within you lies a war between your fears and your dreams. Know that this struggle is natural and necessary for growth. Be gentle with yourself, for in accepting your shadows, you find your light.',
        'Life Transitions': 'Change is the only constant, dear one. What feels like an ending is often a doorway to new beginnings. Trust the process, stay grounded in your values, and remember that you have navigated challenges before.',
        'Daily Struggles': 'The small struggles of daily life are the forge in which your character is strengthened. Find peace in the present moment. Breathe deeply, and know that this too shall pass.'
      },
      hi: {
        'Career/Purpose': 'प्रिय, याद रखें कि आपका काम आपकी प्रतिभा का एक कैनवास है। अपना सर्वश्रेष्ठ करने पर ध्यान दें लेकिन परिणामों से जुड़ाव न रखें। आपका उद्देश्य ईमानदार प्रयास और आपके मूल्यों के साथ संरेखण के माध्यम से खुद को प्रकट करता है।',
        'Relationships': 'जो बंधन हम बनाते हैं वे जीवन के कपड़े में पवित्र धागे हैं। प्रत्येक रिश्ते में करुणा और समझ के साथ आएं। अधिक सुनें, कम बोलें, और याद रखें कि प्रेम स्वीकृति के माध्यम से बढ़ता है, नियंत्रण के माध्यम से नहीं।',
        'Inner Conflict': 'आपके भीतर आपके डर और सपनों के बीच एक युद्ध है। जानिए कि यह संघर्ष प्राकृतिक और वृद्धि के लिए आवश्यक है। अपने साथ कोमल रहें, क्योंकि अपनी छाया को स्वीकार करने में आप अपनी प्रकाश पाते हैं।',
        'Life Transitions': 'परिवर्तन ही एकमात्र स्थिरांक है, प्रिय। जो एक अंत लग रहा है वह अक्सर नई शुरुआत का एक द्वार है। प्रक्रिया पर विश्वास रखें, अपने मूल्यों में निहित रहें, और याद रखें कि आपने पहले चुनौतियों का सामना किया है।',
        'Daily Struggles': 'दैनिक जीवन के छोटे संघर्ष ही वह भट्टी हैं जिसमें आपका चरित्र मजबूत होता है। वर्तमान क्षण में शांति खोजें। गहरी सांस लें, और जानिए कि यह भी गुजर जाएगा।'
      },
      hinglish: {
        'Career/Purpose': 'Dear one, yaad rakhiye ki aapka kaam aapki pratibha ka canvas hai. Apna best karte rahiye, par results se attached na rahen. Aapka purpose khud ko reveal karta hai sincere efforts aur values ke through.',
        'Relationships': 'Jo bonds hum bante hain, wo life ke fabric mein sacred threads hain. Har rishte mein compassion aur understanding ke saath ayen. Jyada suno, kam bolo, aur yaad rakhiye ki love acceptance se badhta hai, control se nahi.',
        'Inner Conflict': 'Aapke andar aapke fears aur dreams ke beech ek war hai. Jaan lo ki yeh struggle natural hai aur growth ke liye zaruri hai. Apne aap se pyaar se baat karo, kyuki apni shadows ko accept karte hue aap apni light pate ho.',
        'Life Transitions': 'Change hi ek matra constant hai, dear one. Jo ending lag raha hai, wo aksar naya beginning ka doorway hai. Process par vishwas rakho, apne values mein grounded raho, aur yaad rakhiye ki tumne pehle bhi challenges face kiye ho.',
        'Daily Struggles': 'Daily life ke chhote struggles hi wo forge hain jisme tumhara character stronger hota hai. Present moment mein peace dhundho. Gehra saans lo, aur jano ki yeh bhi pass ho jayega.'
      }
    };
    
    const category = intent?.category || 'Daily Struggles';
    const lang = language === 'hi' ? 'hi' : language === 'hinglish' ? 'hinglish' : 'en';
    const responses = demoResponses[lang] || demoResponses['en'];
    const response = responses[category] || responses['Daily Struggles'];
    
    console.log('[LLM] Demo mode selected language:', lang);
    console.log('[LLM] Response category:', category);
    console.log('[LLM] Response text:', response.substring(0, 60) + '...');
    
    return {
      text: response,
      intent: category,
      language: lang,
      tokens_used: 150
    };
  }

  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not configured and DEMO_MODE is off');
  }

  const client = new Groq({
    apiKey: process.env.GROQ_API_KEY
  });

  try {
    // Build language-specific prompt
    let languageInstruction = 'Respond in English';
    if (language === 'hi') {
      languageInstruction = 'Respond in Hindi';
    } else if (language === 'hinglish') {
      languageInstruction = 'Respond in Hinglish (mixing Hindi and English words naturally)';
    }
    
    const systemPrompt = `You are Krishna, a wise spiritual guide speaking to a seeker in modern times.

${languageInstruction}. Important: Always respond in the user's language.

Your style:
- Warm, compassionate, understanding
- Use analogies from the Bhagavad Gita when relevant
- Acknowledge their specific concern (${intent?.category || 'their struggle'})
- Offer practical wisdom mixed with spiritual guidance
- Keep responses concise (2-3 sentences) for voice delivery
- Speak directly to the person, not about them
- Use warm addresses like "dear one" or equivalents in their language
- Be conversational, not preachy

Generate a response to their concern that acknowledges the category (${intent?.category || 'their struggle'}) and provides brief, actionable wisdom.

Important: Respond with plain text only - no JSON, no markdown, just the spoken response. Always respond in ${languageInstruction.toLowerCase()}.`;

    const response = await client.chat.completions.create({
      model: 'mixtral-8x7b-32768', // Groq's fastest model (~300ms response time)
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userText }
      ],
      temperature: 0.7,
      max_tokens: 150 // Shorter responses = faster
    });

    const text = response.choices[0].message.content.trim();

    return {
      text: text,
      intent: intent?.category || 'unknown',
      language: language,
      tokens_used: response.usage.total_tokens
    };
  } catch (error) {
    console.error('LLM Error:', error.message);
    throw new Error(`Response generation failed: ${error.message}`);
  }
}
