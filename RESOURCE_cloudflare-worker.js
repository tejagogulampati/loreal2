export default {
  async fetch(request, env) {

    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    try {
      const { messages = [], products = [] } = await request.json();

      const conversation = messages
        .map(m => `${m.role.toUpperCase()}: ${m.content}`)
        .join("\n");

      const prompt = `
You are a professional L'Oréal beauty advisor.

ONLY talk about:
- skincare
- makeup
- haircare
- beauty routines

If unrelated, say:
"I'm here for beauty advice only!"

Use ONLY these products:
${JSON.stringify(products, null, 2)}

Conversation:
${conversation}
      `;

      const res = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          input: prompt
        })
      });

      const raw = await res.text();

      if (!res.ok) {
        return new Response(JSON.stringify({
          reply: "OpenAI API error",
          error: raw
        }), { headers });
      }

      const data = JSON.parse(raw);

      let reply =
        data.output_text ||
        data.output?.[0]?.content?.[0]?.text ||
        "No response";

      return new Response(JSON.stringify({ reply }), { headers });

    } catch (err) {
      return new Response(JSON.stringify({
        reply: "Worker crashed",
        error: err.message
      }), { headers });
    }
  }
};