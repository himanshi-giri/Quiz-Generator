const axios = require("axios");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Get list of subjects
const getSubjects = async (req, res) => {
  try {
    // Define a list of subjects
    const subjects = [
      { id: 1, name: "Mathematics" },
      { id: 2, name: "Science" },
      { id: 3, name: "Social Studies" },
      { id: 4, name: "General Knowledge" },
      { id: 5, name: "Machine Learning" }
    ];
    
    res.json(subjects);
  } catch (error) {
    console.error("Error getting subjects:", error.message);
    res.status(500).json({ error: "Server error while fetching subjects" });
  }
};

// Get topics by subject (reusing your existing function from quizController)
const getTopicsBySubject = async (req, res) => {
  try {
    const { subject } = req.params;
    
    if (!subject) {
      return res.status(400).json({ error: "Subject is required" });
    }
    
    // Define the topics by subject mapping
    const topicsBySubject = {
      "Mathematics": ["Algebra", "Geometry", "Calculus", "Statistics", "Trigonometry", "Number Theory"],
      "Science": ["Physics", "Chemistry", "Biology", "Astronomy", "Earth Science", "Environmental Science"],
      "Social Studies": ["History", "Geography", "Civics", "Economics", "Political Science", "Sociology"],
      "General Knowledge": ["Current Affairs", "Geography", "Arts & Literature", "Sports", "Technology", "Entertainment"],
      "Machine Learning": ["Supervised Learning", "Unsupervised Learning", "Deep Learning", "Neural Networks", "Natural Language Processing", "Computer Vision"],
    };
    
    // Format topics as objects with id and name for frontend consistency
    const topics = (topicsBySubject[subject] || []).map((topic, index) => ({
      id: index + 1,
      name: topic
    }));
    
    res.json(topics);
  } catch (error) {
    console.error("Error fetching topics:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Generate teaching content using Gemini API
const teachTopic = async (req, res) => {
  try {
    console.log("Received teaching request:", req.body);
    console.log("Gemini API Key:", GEMINI_API_KEY ? "Present" : "Missing");

    const { subject, topic } = req.body;
    
    if (!subject || !topic) {
      console.error("Missing subject or topic");
      return res.status(400).json({ error: "Subject and topic are required" });
    }

    const prompt = `You are Aanya, an expert AI tutor specialized in teaching ${subject}.
    Please provide a comprehensive lesson on ${topic} within ${subject}. Your response should be tailored for a student in middle or high school.
    
    Structure your response with the following sections:
    1. Introduction: Brief overview of what ${topic} is and why it's important in ${subject}
    2. Key Concepts: The fundamental ideas and definitions in ${topic}
    3. Detailed Explanation: In-depth discussion with examples and illustrations
    4. Applications: How ${topic} is used in real-world scenarios
    5. Practice Problems: 2-3 questions with solutions to test understanding
    6. Summary: Recap of key points learned
    
    Format your response in HTML for better readability with appropriate headings, paragraphs, lists, and emphasis.`;

    let lastError = null;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`🔹 Attempt ${attempt}: Sending request to Gemini API...`);
        const response = await axios.post(
          GEMINI_API_URL,
          {
            contents: [{ parts: [{ text: prompt }] }]
          },
          { 
            headers: { "Content-Type": "application/json" },
            params: { key: GEMINI_API_KEY }
          }
        );

        console.log("Gemini API Response received");

        if (!response.data || !response.data.candidates) {
          throw new Error("Invalid response from Gemini API");
        }

        const content = response.data.candidates[0].content.parts[0].text;
        
        return res.json({
          subject,
          topic,
          content
        });
      } catch (error) {
        lastError = error;
        if (error.response?.status === 429) {
          console.log(`Rate limit hit, attempt ${attempt}/${MAX_RETRIES}. Waiting ${RETRY_DELAY}ms...`);
          if (attempt < MAX_RETRIES) {
            await sleep(RETRY_DELAY * attempt); // Exponential backoff
            continue;
          }
        }
        // For other errors or if we've exhausted retries, break the loop
        break;
      }
    }
    
    // If we get here, all retries failed
    console.error("Error generating teaching content:", lastError.message);
    if (lastError.response?.status === 429) {
      return res.status(503).json({ error: "Service temporarily unavailable. Please try again in a few moments." });
    } else {
      return res.status(500).json({ error: lastError.message });
    }
  } catch (error) {
    console.error("Error generating teaching content:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Handle user questions about the topic
const answerQuestion = async (req, res) => {
  try {
    const { subject, topic, question } = req.body;
    
    if (!subject || !topic || !question) {
      return res.status(400).json({ error: "Subject, topic, and question are required" });
    }
    
    const prompt = `As Aanya, an expert AI tutor specializing in ${subject}, please answer the following question about ${topic}:
    
    "${question}"
    
    Provide a clear, concise, and accurate answer that helps the student understand the concept. Include examples if appropriate.`;
    
    let lastError = null;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await axios.post(
          GEMINI_API_URL,
          {
            contents: [{ parts: [{ text: prompt }] }]
          },
          { 
            headers: { "Content-Type": "application/json" },
            params: { key: GEMINI_API_KEY }
          }
        );

        if (!response.data || !response.data.candidates) {
          throw new Error("Invalid response from Gemini API");
        }

        const answer = response.data.candidates[0].content.parts[0].text;
        
        return res.json({
          question,
          answer
        });
      } catch (error) {
        lastError = error;
        if (error.response?.status === 429) {
          console.log(`Rate limit hit, attempt ${attempt}/${MAX_RETRIES}. Waiting ${RETRY_DELAY}ms...`);
          if (attempt < MAX_RETRIES) {
            await sleep(RETRY_DELAY * attempt);
            continue;
          }
        }
        break;
      }
    }
    
    console.error("Error answering question:", lastError.message);
    if (lastError.response?.status === 429) {
      return res.status(503).json({ error: "Service temporarily unavailable. Please try again in a few moments." });
    } else {
      return res.status(500).json({ error: lastError.message });
    }
  } catch (error) {
    console.error("Error answering question:", error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { 
  getSubjects, 
  getTopicsBySubject, 
  teachTopic, 
  answerQuestion 
};