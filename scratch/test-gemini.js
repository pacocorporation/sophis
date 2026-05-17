const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("Using API Key:", apiKey ? "FOUND" : "NOT FOUND");
  if (!apiKey) return;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    console.log("Sending test prompt...");
    const result = await model.generateContent("Olá, responda com apenas uma palavra: OK.");
    const response = await result.response;
    console.log("Response:", response.text());
  } catch (err) {
    console.error("Error:", err.message);
  }
}

test();
