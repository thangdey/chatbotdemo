const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");
let userText = null;
const loadDataFromLocalstorage = () => {
  // Load saved chats and theme from local storage and apply/add on the page
  const themeColor = localStorage.getItem("themeColor");
  document.body.classList.toggle("light-mode", themeColor === "light_mode");
  themeButton.innerText = document.body.classList.contains("light-mode")
    ? "dark_mode"
    : "light_mode";
  const defaultText = `<div class="default-text">
                            <h1>Consultant Bot đang ở đây</h1>
                            <p>Hãy bắt đầu cuộc trò chuyện.<br> Tin nhắn sẽ được hiển thị tại đây.</p>
                        </div>`;
  chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
  chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to bottom of the chat container
};
const createChatElement = (content, className) => {
  // Create new div and apply chat, specified class and set html content of div
  const chatDiv = document.createElement("div");
  chatDiv.classList.add("chat", className);
  chatDiv.innerHTML = content;
  return chatDiv; // Return the created chat div
};
// const getChatResponse = (incomingChatDiv) => {
//   const pElement = document.createElement("p");
//   fetch("knowledge_base.json") 
//     .then((response) => response.json()) 
//     .then((jsonData) => {
//       const matchedQuestion = jsonData.questions.find(
//         (q) => q.question === userText
//       );

//       if (matchedQuestion) {
//         pElement.textContent = matchedQuestion.answer;
//       } else {
//         pElement.classList.add("error");
//         pElement.textContent =
//           "Rất tiếc, tôi chưa được lập trình để trả lời những tình huống như vậy";
//       }

//       incomingChatDiv.querySelector(".typing-animation").remove();
//       incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
//       localStorage.setItem("all-chats", chatContainer.innerHTML);
//       chatContainer.scrollTo(0, chatContainer.scrollHeight);
//     })
//     .catch((error) => {
//       console.error("Error loading JSON:", error);
//       // Handle the error, e.g., show an error message to the user
//     });
// };

const similarityThreshold = 0.5; // Ngưỡng độ tương đồng 80%

const getChatResponse = (incomingChatDiv) => {
  const pElement = document.createElement("p");
  fetch("knowledge_base.json")
    .then((response) => response.json())
    .then((jsonData) => {
      const userTextLower = userText.toLowerCase();
      const matchedQuestion = jsonData.questions.find((q) => {
        const questionLower = q.question.toLowerCase();
        const similarity = calculateStringSimilarity(userTextLower, questionLower);
        return similarity >= similarityThreshold;
      });

      if (matchedQuestion) {
        pElement.textContent = matchedQuestion.answer;
      } else {
        pElement.classList.add("error");
        pElement.textContent =
          "Rất tiếc, tôi chưa được lập trình để trả lời các câu hỏi thế này. Nếu câu hỏi bạn hỏi có liên quan nhiều đến vấn đề về công kích trên mạng xã hội mà vẫn không nhận được câu trả lời, hãy thử nhấn vào link này để xem những gợi ý về những câu hỏi chúng tôi đã soạn và từ đó có thể nhận được câu trả lời cho vấn đề bạn gặp phải: https://docs.google.com/document/d/1wijhLws80fbmQGlYOjpBZtq2n5_ux9H1Ro2E-Rbb2g4/edit";
      }

      incomingChatDiv.querySelector(".typing-animation").remove();
      incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
      localStorage.setItem("all-chats", chatContainer.innerHTML);
      chatContainer.scrollTo(0, chatContainer.scrollHeight);
    })
    .catch((error) => {
      console.error("Error loading JSON:", error);
      // Xử lý lỗi, ví dụ: hiển thị thông báo lỗi cho người dùng
    });
};


function calculateStringSimilarity(str1, str2) {
  const length = Math.max(str1.length, str2.length);
  const distance = levenshteinDistance(str1, str2);
  return 1 - distance / length;
}

function levenshteinDistance(str1, str2) {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      const cost = str1[j - 1] === str2[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[str2.length][str1.length];
}


const copyResponse = (copyBtn) => {
  // Copy the text content of the response to the clipboard
  const reponseTextElement = copyBtn.parentElement.querySelector("p");
  navigator.clipboard.writeText(reponseTextElement.textContent);
  copyBtn.textContent = "done";
  setTimeout(() => (copyBtn.textContent = "content_copy"), 1000);
};
const showTypingAnimation = () => {
  // Display the typing animation and call the getChatResponse function
  const html = `<div class="chat-content">
                    <div class="chat-details">
                     
                        <div class="typing-animation">
                            <div class="typing-dot" style="--delay: 0.2s"></div>
                            <div class="typing-dot" style="--delay: 0.3s"></div>
                            <div class="typing-dot" style="--delay: 0.4s"></div>
                        </div>
                    </div>
                    <span onclick="copyResponse(this)" class="material-symbols-rounded">content_copy</span>
                </div>`;
  // Create an incoming chat div with typing animation and append it to chat container
  const incomingChatDiv = createChatElement(html, "incoming");
  chatContainer.appendChild(incomingChatDiv);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
  getChatResponse(incomingChatDiv);
};
const handleOutgoingChat = () => {
  userText = chatInput.value.trim(); // Get chatInput value and remove extra spaces
  if (!userText) return; // If chatInput is empty return from here
  // Clear the input field and reset its height
  chatInput.value = "";
  chatInput.style.height = `${initialInputHeight}px`;
  const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="images/user.jpg" alt="user-img">
                        <p>${userText}</p>
                    </div>
                </div>`;
  // Create an outgoing chat div with user's message and append it to chat container
  const outgoingChatDiv = createChatElement(html, "outgoing");
  chatContainer.querySelector(".default-text")?.remove();
  chatContainer.appendChild(outgoingChatDiv);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
  setTimeout(showTypingAnimation, 500);
};
deleteButton.addEventListener("click", () => {
  // Remove the chats from local storage and call loadDataFromLocalstorage function
  if (confirm("Bạn có muốn xóa hết lịch sử chat?")) {
    localStorage.removeItem("all-chats");
    loadDataFromLocalstorage();
  }
});
themeButton.addEventListener("click", () => {
  // Toggle body's class for the theme mode and save the updated theme to the local storage
  document.body.classList.toggle("light-mode");
  localStorage.setItem("themeColor", themeButton.innerText);
  themeButton.innerText = document.body.classList.contains("light-mode")
    ? "dark_mode"
    : "light_mode";
});
const initialInputHeight = chatInput.scrollHeight;
chatInput.addEventListener("input", () => {
  // Adjust the height of the input field dynamically based on its content
  chatInput.style.height = `${initialInputHeight}px`;
  chatInput.style.height = `${chatInput.scrollHeight}px`;
});
chatInput.addEventListener("keydown", (e) => {
  // If the Enter key is pressed without Shift and the window width is larger
  // than 800 pixels, handle the outgoing chat
  if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
    e.preventDefault();
    handleOutgoingChat();
  }
});
loadDataFromLocalstorage();
sendButton.addEventListener("click", handleOutgoingChat);