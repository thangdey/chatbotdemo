const fs = require("fs");
const readline = require("readline");
const { getClosestMatch } = require("closest-match");

function loadKnowledgeBase(filePath) {
  const data = fs.readFileSync(filePath, "utf8");
  return JSON.parse(data);
}

function saveKnowledgeBase(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function findBestMatch(userQuestion, questions) {
  const cm = new getClosestMatch(questions);
  const bestMatch = cm.get(userQuestion);
  return bestMatch.distance >= 0.6 ? bestMatch.value : null;
}

function getAnswerForQuestion(question, knowledgeBase) {
  const matchedQuestion = knowledgeBase.questions.find(
    (q) => q.question === question
  );
  return matchedQuestion ? matchedQuestion.answer : null;
}

async function chatBot() {
  const knowledgeBase = loadKnowledgeBase("knowledge_base.json");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  while (true) {
    const userInput = await new Promise((resolve) => {
      rl.question("You: ", resolve);
    });

    if (userInput.toLowerCase() === "quit") {
      rl.close();
      break;
    }

    const bestMatch = findBestMatch(
      userInput,
      knowledgeBase.questions.map((q) => q.question)
    );

    if (bestMatch) {
      const answer = getAnswerForQuestion(bestMatch, knowledgeBase);
      console.log(`Bot: ${answer}`);

    } else {
      console.log("Bot: Tôi chưa được lập trình để trả lời tình huống này!");
      const newAnswer = await new Promise((resolve) => {
        rl.question('Type the answer or "skip" to skip: ', resolve);
      });

      if (newAnswer.toLowerCase() !== "skip") {
        knowledgeBase.questions.push({
          question: userInput,
          answer: newAnswer,
        });
        saveKnowledgeBase("knowledge_base.json", knowledgeBase);
        console.log("Bot: Cảm ơn bạn, tôi đã học được");
      }
    }
  }
}

if (require.main === module) {
  chatBot();
}