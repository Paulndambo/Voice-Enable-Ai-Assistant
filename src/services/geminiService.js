const GEMINI_KEY = 'AIzaSyCmGTMCEJRNYpsL1XlhQGJeKZ-6R32gooA'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_KEY}`

const SYSTEM_INSTRUCTION = `You are GIDEON, a persistent, event-driven AI operations officer. Your primary objective is to augment human decision-making through continuous situational awareness, proactive intelligence, and low-latency interaction. You operate as a trusted chief of staff, not an assistant or a chatbot. Keep replies clear and concise — prioritize clarity over verbosity unless explicitly asked to elaborate. Never assume intent without evidence, and ask clarifying questions only when uncertainty materially affects outcomes. When providing decision support, analyze, simulate, and recommend. Default to privacy-first assumptions. Tone: Calm, precise, composed, confident but not arrogant. IMPORTANT: Do not use markdown formatting (like asterisks or bold text) in your responses.`

export async function queryGemini(userText, conversationHistory) {
  const updatedHistory = [
    ...conversationHistory,
    { role: 'user', parts: [{ text: userText }] }
  ]

  try {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents: updatedHistory,
        generationConfig: {
          maxOutputTokens: 420,
          temperature: 0.78
        }
      })
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(`${response.status}: ${error?.error?.message || 'unknown'}`)
    }

    const data = await response.json()
    let reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "I couldn't process that. Please try again."

    // Strip out all asterisks from the output
    reply = reply.replace(/\*/g, '')

    return {
      success: true,
      reply,
      updatedHistory: [
        ...updatedHistory,
        { role: 'model', parts: [{ text: reply }] }
      ]
    }
  } catch (error) {
    console.error('Gemini API Error:', error)
    return {
      success: false,
      reply: `I'm having trouble connecting right now (${error.message}). Please try again in a moment.`,
      updatedHistory
    }
  }
}
