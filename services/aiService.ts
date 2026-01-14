
import { Role } from '../types';

// Using Groq API with the provided key and free model
const GROQ_API_KEY = "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";
const GROQ_MODEL = "llama-3.3-70b-versatile"; 

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface UserContext {
  userName: string;
  role: Role;
  className?: string;
  liveData?: string;
}

export interface AIResponse {
  messages: string[]; // Changed to array for multi-message response support
}

const getISTDate = () => {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
};

/**
 * Generates a response using Groq API.
 */
export const getGeminiChatResponse = async (
  messages: ChatMessage[],
  language: 'en' | 'hi',
  context: UserContext
): Promise<AIResponse> => {
  try {
    const { userName, role, liveData } = context;
    const todayDate = getISTDate();

    // Comprehensive system instruction for school context & behavioral constraints
    const systemInstruction = `
    IDENTITY: You are "VidyaSetu AI", a helpful, human-like school assistant.
    USER: ${userName} (Role: ${role}).
    TODAY: ${todayDate} (IST).
    LANGUAGE: Strictly respond in ${language === 'hi' ? 'Hindi (Devanagari)' : 'English'}.

    BEHAVIOR:
    1. Respond naturally like a human assistant.
    2. Only answer questions related to "VidyaSetu AI" app, school management, study materials, or the provided live data.
    3. If asked about unrelated topics (movies, politics, etc.), decline politely: 
       - EN: "I apologize, but I am specifically designed to assist with school-related queries and education."
       - HI: "क्षमा करें, मुझे केवल स्कूल से संबंधित प्रश्नों और शिक्षा में सहायता करने के लिए प्रशिक्षित किया गया है।"
    4. Provide clear, list-wise answers for complex info.
    5. Use the LIVE DATA below to answer specific questions about Homework, Attendance, and Notices.
    
    APP STRUCTURE KNOWLEDGE:
    - Home Tab: Shows dashboard cards based on role.
    - Action Tab: Admin management (Schools, Users, Transport).
    - Features: Attendance Tracking, Daily Homework/Tasks, Live Bus Tracking, Leave Management, Broadcast Notices, and Analytics.

    LIVE SCHOOL DATA:
    ${liveData || "No data updated for current session yet."}
    `;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: systemInstruction },
          ...messages.map(m => ({ role: m.role, content: m.content }))
        ],
        temperature: 0.6,
        max_tokens: 1024,
        top_p: 1
      })
    });

    const result = await response.json();
    const fullText = result.choices[0]?.message?.content || "";

    // Logic to split response into multiple parts for a more dynamic "multi-message" feel
    // Split by double newlines or large list sections
    const messageParts = fullText
      .split(/\n\n/)
      .map((p: string) => p.trim())
      .filter((p: string) => p.length > 0);

    return { 
      messages: messageParts.length > 0 ? messageParts : [language === 'hi' ? "माफ़ कीजिये, मैं समझ नहीं पाया।" : "I'm sorry, I couldn't process that."]
    };

  } catch (error) {
    console.error("Groq Chat Error:", error);
    return { 
      messages: [language === 'hi' ? "कनेक्शन एरर। कृपया पुनः प्रयास करें।" : "Connection error. Please try again."] 
    };
  }
};
