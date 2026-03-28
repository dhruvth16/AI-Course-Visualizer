import axios from "axios";

export async function fetchLesson({
  authToken,
  user_id,
}: {
  authToken: string;
  user_id: string;
}) {
  try {
    const res = await axios.get(`/api/lessons/${user_id}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    return res;
  } catch (error) {
    console.error("Error fetching lesson:", error);
  }
}

export async function fetchLessonById({
  historyId,
  user_id,
  token,
}: {
  historyId: string;
  user_id: string;
  token: string;
}) {
  try {
    const res = await axios.get(
      `/api/lessons?lesson_id=${historyId}&user_id=${user_id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching lesson by ID:", error);
  }
}

export async function clearSearchHistory(user_id: string) {
  try {
    const res = await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/clear_history?user_id=${user_id}`,
    );
    return res;
  } catch (error) {
    console.error("Error clearing search history:", error);
  }
}

export async function deleteHistoryById({
  historyId,
  user_id,
}: {
  historyId: string;
  user_id: string;
}) {
  try {
    const res = await axios.delete(
      `/api/lessons/clear?lesson_id=${historyId}&user_id=${user_id}`,
    );
    return res;
  } catch (error) {
    console.error("Error deleting history by ID:", error);
  }
}

export async function fetchSubtopicContent({
  prompt,
  label,
  model,
  grade,
}: {
  prompt: string;
  label: string;
  model: string;
  grade: string;
}) {
  try {
    const res = await axios.post(`/api/subtopic`, {
      lesson_name: prompt,
      subtopic_name: label,
      model: model,
      grade: grade,
    });
    return res;
  } catch (error) {
    console.error("Error fetching subtopic content:", error);
  }
}

export async function streamMermid({
  prompt,
  model,
  grade,
}: {
  prompt: string;
  model: string;
  grade: string;
}) {
  try {
    const res = await axios.post("/api/lessons/stream", {
      lesson_name: prompt,
      model,
      grade,
    });
    return res;
  } catch (error) {
    console.error("Error streaming mermaid content:", error);
  }
}

export async function saveMermaid({
  user_id,
  prompt,
  mermaid_code,
  model,
  grade,
}: {
  user_id: string;
  prompt: string;
  mermaid_code: string;
  model: string;
  grade: string;
}) {
  try {
    const res = await axios.post("/api/lessons/create", {
      user_id,
      lesson_name: prompt,
      model,
      grade,
      mermaid_code,
    });
    return res;
  } catch (error) {
    console.error("Error saving mermaid diagram:", error);
  }
}
