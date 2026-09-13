

// ============================================
// API SERVICE
// ============================================

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";


// ============================================
// COMMON API REQUEST
// ============================================

const apiRequest = async (url, options = {}) => {
  const response = await fetch(url, options);

  if (response.status === 401) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");

    window.location.reload();

    throw new Error("Session expired. Please login again.");
  }

  return response;
};

// ============================================
// GET TOKEN
// ============================================

const getToken = () => {
  return localStorage.getItem("access_token");
};


// ============================================
// COMMON HEADERS
// ============================================

const authHeaders = () => {
  return {
    Authorization: `Bearer ${getToken()}`,
  };
};


// ============================================
// LOGIN
// ============================================

export const login = async (username, password) => {

  const formData = new URLSearchParams();

  formData.append("username", username);
  formData.append("password", password);

  const response = await fetch(
    `${API_URL}/login`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },

      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Login failed"
    );
  }

  return data;
};


// ============================================
// REGISTER
// ============================================

export async function register(username, email, password) {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      email,
      password,
    }),
  });

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      typeof error.detail === "string"
        ? error.detail
        : JSON.stringify(error.detail)
    );
  }

  const data = await response.json();
  return data;
}


// ============================================
// GET TASKS
// ============================================

export const getTasks = async () => {

  const response = await apiRequest(
    `${API_URL}/tasks`,
    {
      headers: authHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Could not load tasks"
    );
  }

  return data;
};


// ============================================
// CREATE TASK
// ============================================

export const createTask = async (
  title,
  completed = false
) => {

  const response = await apiRequest(
    `${API_URL}/tasks`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },

      body: JSON.stringify({
        title,
        completed,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Could not create task"
    );
  }

  return data;
};


// ============================================
// UPDATE TASK
// ============================================

export const updateTask = async (
  taskId,
  title,
  completed
) => {

  const response = await apiRequest(
    `${API_URL}/tasks/${taskId}`,
    {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },

      body: JSON.stringify({
        title,
        completed,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Could not update task"
    );
  }

  return data;
};


// ============================================
// DELETE TASK
// ============================================

export const deleteTask = async (
  taskId
) => {

  const response = await apiRequest(
    `${API_URL}/tasks/${taskId}`,
    {
      method: "DELETE",

      headers: authHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Could not delete task"
    );
  }

  return data;
};

// ==========================================
// VERIFY OTP
// ==========================================

export async function verifyOTP(username, otp) {
  const response = await fetch(
    `${API_URL}/verify-otp?username=${encodeURIComponent(username)}&otp=${encodeURIComponent(otp)}`,
    {
      method: "POST",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof data.detail === "string"
        ? data.detail
        : JSON.stringify(data.detail)
    );
  }

  return data;
}