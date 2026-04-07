# LexiAssist - Frontend

A brief, one-to-two sentence description of what LexiAssist does. [e.g., The official frontend web application for LexiAssist, built to provide a seamless and responsive user interface for AI-driven tasks.]

##  Tech Stack

* **Framework:** [Next.js](https://nextjs.org/)
* **UI Library:** React
* **Styling:** [Tailwind CSS / CSS Modules / Styled Components]
* **Assets:** Custom SVG icon library

## 🛠️ Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites
Make sure you have the following installed:
* [Node.js](https://nodejs.org/) (Version 16.x or higher recommended)
* npm, yarn, or pnpm

### Installation

1. Clone the repository:
  bash
   git clone [https://github.com/LexiAssist/Frontend.git](https://github.com/LexiAssist/Frontend.git)

   Navigate into the project directory:

Bash
cd Frontend
Install the dependencies:

Bash
npm install
# or yarn install
Start the development server:

Bash
npm run dev
# or yarn dev
Open your browser and visit http://localhost:3000 to see the app in action.

📂 Project Structure
A quick overview of the main directories in this project:

/components - Reusable UI components (buttons, modals, etc.)

/pages or /app - Next.js routing and page views

/public/icon - Contains the primary white SVG icon assets used throughout the app

/styles - Global CSS and styling configurations

## 🔐 Authentication Flow

### Test Email (Development Only)

For testing email verification without a real email service, use this special test email:

| Field | Value |
|-------|-------|
| **Test Email** | `mytest@email.com` |
| **Password** | Any password (min 8 characters) |

### How to Get the OTP Code

When you register with `mytest@email.com`, the OTP will be printed in the **backend logs** (not sent to email):

1. **Watch the backend logs** (in a separate terminal):
   ```powershell
   cd lexiassist-backend
   docker-compose -f infra/docker-compose.yml logs -f user-service
   ```

2. **Register** at `http://localhost:3000/register` with `mytest@email.com`

3. **Look for the OTP** in the logs:
   ```
   ========================================
   [DEV OTP] Email: mytest@email.com
   [DEV OTP] Code:  394827
   ========================================
   ```

4. **Enter that code** on the verify-email page

### Resending OTP

If the code expires (15 minutes) or you need a new one:
1. Wait for the 60-second countdown on the verify-email page
2. Click **"Resend Code"**
3. Check the backend logs for the **new OTP** (old one will be invalid)

### Authentication Pages

| Page | Route | Description |
|------|-------|-------------|
| Register | `/register` | Create new account |
| Login | `/login` | Sign in to existing account |
| Verify Email | `/verify-email?userId=xxx` | Enter 6-digit OTP |
| Forgot Password | `/forgot-password` | Request password reset |
| Reset Password | `/reset-password?token=xxx` | Set new password |

---

## 🤝 Contributing

We welcome contributions! If you would like to help improve LexiAssist, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add some amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.
