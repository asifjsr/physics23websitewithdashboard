import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Function Declarations for AI
const addToRoutineFn: FunctionDeclaration = {
  name: "addToRoutine",
  description: "Add a new item to the student's weekly routine schedule. For recurring classes, specify the day. For specific one-time dates, specify the date.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      day: { type: Type.STRING, description: "Day of the week (e.g. Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday). Required." },
      date: { type: Type.STRING, description: "Specific date in YYYY-MM-DD format if mentioned (e.g. 2024-05-20)." },
      subject: { type: Type.STRING, description: "Subject or class name" },
      time: { type: Type.STRING, description: "Time of the class (e.g. 09:00 AM)" },
      room: { type: Type.STRING, description: "Room number or location" }
    },
    required: ["day", "subject", "time"]
  }
};

const addTaskFn: FunctionDeclaration = {
  name: "addTask",
  description: "Add a new task to the student's to-do list",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Title of the task" },
      due: { type: Type.STRING, description: "Due date/time description (e.g. 'tomorrow', 'Friday', '2024-05-15')" },
      priority: { type: Type.STRING, enum: ["High", "Medium", "Low"], description: "Priority level" }
    },
    required: ["title"]
  }
};

// AI Chatbot Endpoint
app.post("/api/ai-chat", async (req, res) => {
  const { message, image, history, localTime, localDay } = req.body;

  try {
    const contents: any[] = [];
    
    // Add history
    if (history && Array.isArray(history)) {
      contents.push(...history);
    }

    const parts: any[] = [{ text: message || "Analyze this request." }];
    
    if (image) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: image.split(',')[1] // Remove data:image/jpeg;base64,
        }
      });
    }

    contents.push({ role: "user", parts });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
      config: {
        systemInstruction: `You are an intelligent Academic Assistant for students.
          CURRENT CONTEXT:
          - Today's Date: ${localTime || new Date().toISOString().split('T')[0]}
          - Today's Day: ${localDay || new Date().toLocaleDateString('en-US', { weekday: 'long' })}
          
          DATE PARSING RULES:
          1. If the user says "today", "tomorrow", or a weekday name, calculate the exact date and day.
          2. ALWAYS determine the correct "day" (e.g., Friday) for the addToRoutine tool.
          3. If the user specifies a specific day of the week, find the next occurrence of that day relative to today.
          4. If the user does NOT mention a day or date, ASK them which day they want to add it to. DO NOT GUESS.
          5. Support and understand Bangla (Bengali) language queries. Respond in the same language the user uses.
          
          CAPABILITIES:
          - Manage routine: Use 'addToRoutine' tool.
          - Manage tasks: Use 'addTask' tool.
          - Help with study plans and academic questions.
          - If a user provides a screenshot of a routine, extracted items and add them.
          
          Be polite, helpful, and concise.`,
        tools: [{ functionDeclarations: [addToRoutineFn, addTaskFn] }],
      },
    });

    res.json({
      text: response.text,
      functionCalls: response.functionCalls
    });
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    res.status(500).json({ error: "Failed to process AI chat" });
  }
});

// AI Study Planner Endpoint
app.post("/api/ai-planner", async (req, res) => {
  const { courseName, subjectName, chapterName, difficulty, examDate, availableTime, weakTopics } = req.body;

  try {
    const prompt = `Create a detailed study plan for:
    Course: ${courseName}
    Subject: ${subjectName}
    Chapter: ${chapterName}
    Difficulty: ${difficulty}
    Exam Date: ${examDate}
    Daily Available Time: ${availableTime}
    Weak Topics: ${weakTopics}

    Please provide the output in JSON format with the following keys:
    studyPlan (string), importantTopics (array), chapterBreakdown (array), revisionPlan (string), practiceSuggestions (array), examChecklist (array).`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: "Failed to generate AI plan" });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
