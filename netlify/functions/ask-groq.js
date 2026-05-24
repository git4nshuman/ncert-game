/* ============================================================
   NCERT Game — Netlify Function
   ask-groq.js
   Proxies requests to Groq API securely
   ============================================================ */

exports.handler = async function (event, context) {

  /* ── Only allow POST requests ── */
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  /* ── CORS headers (allows browser to call this function) ── */
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  /* ── Handle preflight ── */
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    /* ── Parse request body ── */
    const { chapter, chapterName, subject, classNum } = JSON.parse(event.body);

    /* ── Get key from Netlify environment ── */
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'API key not configured' })
      };
    }

    /* ── Build prompt ── */
    const prompt = `You are an expert NCERT ${subject} teacher for Class ${classNum} CBSE India.
Generate exactly 10 multiple choice questions for Chapter ${chapter}: "${chapterName}".

Rules:
- Questions must be based strictly on NCERT Class ${classNum} ${subject} syllabus
- Each question must have exactly 4 options
- Only one correct answer per question
- Include a brief explanation for the correct answer
- Vary difficulty: 3 easy, 4 medium, 3 hard
- Do not repeat questions
- Make questions specific and factual, not vague

Respond ONLY with a valid JSON array. No extra text, no markdown. Format:
[
  {
    "q": "question text here",
    "options": ["option A", "option B", "option C", "option D"],
    "answer": 0,
    "exp": "explanation of why this answer is correct"
  }
]
Where "answer" is the 0-based index of the correct option (0=A, 1=B, 2=C, 3=D).
Make sure answers are VARIED - not all the same index.`;

    /* ── Call Groq API ── */
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2500
      })
    });

    if (!groqRes.ok) {
      const err = await groqRes.text();
      throw new Error(`Groq error ${groqRes.status}: ${err}`);
    }

    const groqData = await groqRes.json();
    let text = groqData.choices[0].message.content.trim();

    /* ── Strip markdown fences if present ── */
    text = text.replace(/```json|```/g, '').trim();

    /* ── Parse and validate ── */
    const questions = JSON.parse(text);

    if (!Array.isArray(questions) || questions.length < 5) {
      throw new Error('Invalid questions format from Groq');
    }

    /* ── Return questions ── */
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ questions: questions.slice(0, 10) })
    };

  } catch (err) {
    console.error('ask-groq error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};