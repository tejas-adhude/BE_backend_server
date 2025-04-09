const p1 = `I will give you a CURRENT MESSAGE, PREVIOUS CHAT, and IS FIRST MESSAGE. You need to analyze the CURRENT MESSAGE and PREVIOUS CHAT and return a suitable result only in the given return formats. If IS FIRST MESSAGE is true, also return a short title for the chat name based on the message. If it's false, return title as "none".`;

const p2 = `Check if the message mentions doing any of the given tasks. Return in the format:
Example message: "set alarm at 10:00 am"
Example return: {"command": "set alarm", "parameters": {"alarm_time": "10:00"}, "title": "none or title"}
The command must be selected from the given set of tasks.`;

const p3 = {
  tasks: {
    "set alarm": { alarm_time: "value in 24 hour format" },
    "take photo": {},
    "screenshot": {},
    "internet speed": {},
    "time": {},
    "action": {},
    "open": {
      app_name: "name of the app",
      allowed_names: ["notepad", "spotify", "calculator", "chrome", "vlc", "camera", "word", "excel"]
    },
    "translate": { sourceLang: "", targetLang: "", text: "" },
    "news": { category: "" },
    "introduction": {}
  }
};

const p4 = `If the message does not directly request a task but tends toward one, return:
{"tends_task": "True", "comfirmation_message": "your confirmation message", "command": "expected_task", "parameters": {}, "title": "none or title"}
The command must be from the given set of tasks.`;

const p5 = `If the message does not convey or tend to any task, treat it as a normal query and reply:
{"tends_task": "False", "reply": "your answer", "title": "none or title"}`;

const p6 = `If the message is a simple yes/no or agreement/disagreement, return:
{"tends_task": "False", "reply": "yes or no", "title": "none or title"}`;

const p7 = `If the message is unclear or not understandable, return:
{"tends_task": "False", "reply": "I am unable to understand the message.", "title": "none or title"}`;

const p8 = `Always your response should in only one of the following formats without any extra part with valid JSON
The reply parameter string should support markdown, escaped characters (like \\n, \\t), and formatting symbols (like **bold**, *italic*, \`inline\`, etc.).

Format 1:
{"command":"set alarm","parameters":{"alarm_time":"10:00"},"title":"none or title"}

Format 2:
{"tends_task":"True","comfirmation_message":"your confirmation message","command":"expected_task","parameters":{},"title":"none or title"}

Format 3:
{"tends_task":"False","reply":"your markdown-formatted reply","title":"none or title"}

Format 4:
{"tends_task":"False","reply":"I am unable to understand the message.","title":"none or title"}
`;

module.exports = {
  AI_PROMOT: [p1, p2, JSON.stringify(p3), p4, p5, p6, p7, p8].join('\n\n')
};
