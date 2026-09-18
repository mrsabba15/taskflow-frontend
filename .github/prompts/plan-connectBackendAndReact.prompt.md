## Plan: Connect FastAPI And React

The project is already wired for local communication:

- Backend: `http://127.0.0.1:8000`
- Frontend: `http://localhost:5173`
- CORS is configured in `backend-project/main.py`
- API requests are configured in `frontend/src/services/api.js`

**Steps**

1. Open PowerShell in `c:\Users\Sabba\backend-project`.
2. Create and activate a virtual environment:

   `python -m venv venv`

   `.\venv\Scripts\Activate.ps1`

3. Install backend packages:

   `pip install -r requirements.txt`

4. Confirm PostgreSQL is running and the `backend_db` database exists.
5. Start FastAPI:

   `uvicorn main:app --reload`

6. Open `http://127.0.0.1:8000/`. You should see:

   `{"message":"Backend is working!"}`

7. Open a second PowerShell window in `c:\Users\Sabba\frontend`.
8. Install and start React:

   `npm install`

   `npm run dev`

9. Open the Vite URL, normally `http://localhost:5173`.
10. Test the user flow:
    - Register
    - Enter the OTP from Resend
    - Log in
    - Create, edit, complete, and delete tasks

The frontend stores the JWT in `localStorage` and sends it as `Authorization: Bearer <token>` for protected task requests.

**Troubleshooting**

- `Connection refused`: FastAPI is not running or the port is wrong.
- CORS error: ensure the frontend URL is listed in `main.py`.
- `401`: the JWT is missing or expired.
- `403`: the account has not completed OTP verification.
- `500` during registration: check PostgreSQL and Resend configuration.

Also rotate the Resend API key currently present in the backend `.env`, since it has been exposed.