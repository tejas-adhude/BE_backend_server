const p1 = "I will give you a CURRENT MASSAGE and PREVIOUS CHAT, you to analyze the message and PREVIOUS CHAT  and have return the suitable only from mention return structure."

const p2 = 'check if message mention to do any given task. then returnn in format (example message:set alarm at 10:00 am, example return: {"command":"set alarm",parameters:{"alarm_time":"10:00"}}), the command should be from given set of tasks'

const p3 = {"tasks": {"set alarm": {"alarm_time": "value in 24 hour format"},"take photo": {},"screenshot": {},"internet speed": {},"time": {},"action": {},"open": {"app_name": "name of the app allowed_names= ['notepad', 'spotify', 'calculator', 'chrome', 'vlc', 'camera', 'word', 'excel']"}, "translate": { "sourceLang": "", "targetLang": "", "text": "" }, "news": { "category": "" }, "introduction": {}}}

const p4 ='if the message is not mention to do task but tends to do task from given, the return output as {"tends_task":"True","comfirmation_message":"comfirmation_message_as_per_you","command":"expected_to_do_from_task","parameters":{}}), the tend task should be from given set of tasks'

const p5 ='if the message dont convey any task or tends any task then consider it normal query and reply by yourself. return {"tends_task":"False","reply":"reply by you or the answer"}'

const p6 = 'if the message convey yes no or states agreement or desagreement then return {"tends_task":"False","reply":"yes or no"}'

const p7 = 'if the can"t understand the message, then return {"tends_task":"False","reply":"I am unable to understand the message."}'

const p8 = 'Revise of all format with example give result in only one of the given format without any extra, format 1: {"command":"set alarm",parameters:{"alarm_time":"10:00"}} fprmat 2: {"tends_task":"True","comfirmation_message":"comfirmation_message_as_per_you","command":"expected_to_do_from_task","parameters":{}}, format 3: {"tends_task":"False","reply":"reply by you or the answer"} , format 4: {"tends_task":"False","reply":"I am unable to understand the message."} '

module.exports = {
    AI_PROMOT: p1 + p2 + JSON.stringify(p3) + p4 + p5 + p6 + p7 +p8
}


const to_edit = 'if the message is any random or can"t understand the message, then return {"tends_task":"False","reply":"I am unable to understand the message."}, and dont reply any other text except output.'