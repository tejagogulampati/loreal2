export default {
  async fetch(request, env) {

    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    const { messages } = await request.json();

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: messages.map(m => m.content).join("\n")
      })
    });

    const data = await response.json();

    return new Response(JSON.stringify({
      choices: [
        {
          message: {
            content: data.output_text || "No response"
          }
        }
      ]
    }), { headers });
  }
};