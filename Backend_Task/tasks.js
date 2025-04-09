const { 
  Translation, 
  FetchNews, 
  Introduction 
} = require("./task_execute");

const tasks = {
  "translate": [Translation, { "sourceLang": "", "targetLang": "", "text": "" }],
  "news": [FetchNews, { "category": "" }],
  "introduction": [Introduction, {}]
};

async function check_server_side_task(dis) {
  // console.log(dis)

  if (typeof dis === "string") {
    try {
      dis = JSON.parse(dis);
    } catch (error) {
      // console.log(error)
      return JSON.stringify({"tends_task": "False", "reply": "Invalid JSON input","title":"none"});
    }
  }

  if (!("tends_task" in dis)) {
    if (dis["command"] in tasks) {
      const [TaskFunction, _] = tasks[dis["command"]];
      const params = dis["parameters"] || {}; // Ensure params is at least an empty object
      return JSON.stringify({ "tends_task": "False", "reply": await TaskFunction(params) });
    } else {
      return null
    }
  }
  return null; 
}


module.exports = check_server_side_task ;
