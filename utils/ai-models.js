// Get AI response
async function getGroqReply(promot,client) {
    try {
      const chatCompletion = await client.chat.completions.create({
        messages: [
          {
            role: "user",
            content: promot,
          },
        ],
        model: "llama-3.3-70b-versatile",
      })
  
      return chatCompletion.choices[0].message.content
    } catch (error) {
      // console.log(error)
      return null
    }
  }
  
  async function queryOllama(prompt,model = 'deepseek-r1:1.5b', stream = false) {
    // console.log(prompt)
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          prompt,
          stream
        })
      });
  
      if (!response.ok) {
        throw new Error(`Ollama error: ${response.status} - ${response.statusText}`);
      }
  
      const data = await response.json();
  
      if (!data || typeof data.response !== 'string') {
        throw new Error('Unexpected response format from Ollama');
      }
  
      return data.response.replace(/<think>/g, '').replace(/<\/think>/g, '').trim();
  
    } catch (err) {
      console.error('Error querying Ollama:', err.message);
      throw err;
    }
  }

module.exports ={getGroqReply, queryOllama}