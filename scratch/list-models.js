const { GoogleGenerativeAI } = require("@google/generative-ai");

async function list() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return;

  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    // There isn't a direct listModels in the standard JS SDK easily accessible 
    // but we can try a few known ones
    const models = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-1.5-pro", "gemini-pro"];
    for (const m of models) {
      try {
        const model = genAI.getGenerativeModel({ model: m });
        const result = await model.generateContent("Hi");
        console.log(`Model ${m}: OK`);
      } catch (e) {
        console.log(`Model ${m}: FAILED - ${e.message}`);
      }
    }
  } catch (err) {
    console.error("Global Error:", err.message);
  }
}

list();
