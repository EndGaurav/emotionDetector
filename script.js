const video = document.getElementById('camera');
const canvas = document.getElementById('photo');
const displayResponse = document.getElementById('paragraph');
const captureBtn = document.getElementById('capture-btn');
const retakeBtn = document.getElementById('retake-btn');
const canvasContainer = document.querySelector(".canvas-container");
const llmResponse = document.querySelector(".llm-response-container");
const context = canvas.getContext('2d');

// Request access to the user's camera
navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
        video.srcObject = stream;
    })
    .catch((error) => {
        scrib.error("Error accessing the camera:", error);
    });

   

// drawing Canvas  
captureBtn.addEventListener("click", () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.style.display = "block";
    canvasContainer.style.visibility = "visible";

    // for passing image to LLM in bytes. 
    const imageDataURL = canvas.toDataURL('image/jpeg');
    const base64Image = imageDataURL.split(',')[1];

    const query = "can you tell me what this image is about?";
    analyzeImageWithLLM(base64Image, query);

})

// indirectly calling capture button element.
retakeBtn.addEventListener("click", () => {
    llmResponse.style.display = "none"
    captureBtn.click();
})
let result;

const SYSTEM_PROMPT = `
You are an Emotion Recognition Expert. and your work is to detect how person or object is looks like. 
And try to understand person's tone, feeling and emotion. 
You are very capable of understanding following emotion:
1. Happiness
2. Sadness
3. Anger
4. Fear
5. Surprise
6. Neutal

Always provide the **life lesson** according to person's emotion. 

Example:
Now when you detect person is happy the first thing need to do that is appreciate the person and tell me what else he/she can do more further in life to stay happy and delight. 
Now when you detect person is sad the first thing need to do that is give him/her a **life lesson** so that they can feel little-bit motivated and always make sure you do not do it over so it must not look like fake or over And also tell me what general things he/she can do to overcome it.
Now when you detect person is in anger mood. tell him/her the cons of anger so that he can be neutral in life. 

Keep the response short and crisp.
`
// Now when you detect person is happy the first thing need to do that is appreciate the person and ask him/her why is he happy today ?
async function analyzeImageWithLLM(base64Image, query) {
    const apiKey = GROQ_API_KEY; // provide your groq api key
    const apiEndpoint = 'https://api.groq.com/openai/v1/chat/completions';
    const modelId = "meta-llama/llama-4-scout-17b-16e-instruct";

    const headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
    };

    const body = {
        model: modelId,
        messages: [
            {
                role: "system",
                content: SYSTEM_PROMPT
            },
            {
                role: "user",
                content: [
                    { type: "text", text: query },
                    {
                        type: "image_url",
                        image_url: {
                            url: `data:image/jpeg;base64,${base64Image}`
                        }
                    }
                ]
            }
        ]
    };

    console.log("Sending request to LLM with body:", body);
    const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
    });

    console.log(response)

    //   window.result = await response.json()
    result = await response.json()



    if (result && result.choices && result.choices.length > 0) {
        console.log("scope")
        const content = result.choices[0].message.content;
        // scrib.show(marked.marked(content));
        console.log(content);
        llmResponse.style.display = "block"
        displayResponse.innerText = content

    }
}




