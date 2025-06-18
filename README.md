# Next Chapter - Modern Bookstore Platform

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Clerk](https://img.shields.io/badge/Clerk-000000?style=for-the-badge&logo=clerk&logoColor=white)
![Razorpay](https://img.shields.io/badge/Razorpay-02042B?style=for-the-badge&logo=razorpay&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn/ui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](http://makeapullrequest.com)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg?style=for-the-badge)](https://github.com/dibya-22/Next-Chapter/graphs/commit-activity)

</div>

A full-featured, modern bookstore platform built with Next.js 15, TypeScript, and Tailwind CSS. This project aims to provide a seamless book shopping experience with advanced features and a beautiful user interface.

## ⚠️ Important Notice

This is a demonstration project:
- No real payment processing is implemented
- No actual physical or digital products are delivered
- All transactions are simulated for testing purposes
- Book data is for demonstration only

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Environment Variables](#-environment-variables)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

## 🚀 Features

### Current Features
- 🔐 **Authentication & Authorization**
  - Secure user authentication using Clerk
  - Role-based access control (Admin/User)
  - Protected routes and API endpoints

- 📚 **Book Management**
  - Browse and search books
  - Detailed book information pages
  - Admin book management interface

- 🛒 **Shopping Experience**
  - Shopping cart functionality
  - Order management system
  - Order status tracking
  - Secure payment integration with Razorpay

- 🎨 **UI/UX**
  - Modern, responsive design
  - Dark/Light theme support
  - Smooth animations and transitions
  - Toast notifications for user feedback

### Coming Soon
- [ ] Advanced search and filtering
- [ ] User reviews and ratings
- [ ] Wishlist functionality
- [ ] Social sharing features
- [ ] Enhanced admin dashboard
- [ ] Analytics and reporting
- [ ] AI customer support system
- [ ] And more features based on user suggestions!

## 💡 Suggestions & Feedback

We welcome your ideas and feedback! If you have any suggestions for new features or improvements, please:

1. Open an issue with the `suggestion` label
2. Describe your idea in detail
3. Explain how it would benefit the platform
4. Include any relevant examples or mockups

Your suggestions help us make Next Chapter better for everyone!

## 🛠️ Tech Stack

<div align="center">

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 15 |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Authentication** | Clerk |
| **Database** | PostgreSQL |
| **Payment** | Razorpay |
| **UI Components** | shadcn/ui (built on Radix UI) |
| **AI Integration** | Google Gemini (Future Plan) - For recommendations, chat assistant, and customer support |

</div>

## 🔑 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL=

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Payment (Razorpay)
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# AI (Google Gemini)
GOOGLE_GEMINI_API_KEY=

# Books API (Google Books)
GOOGLE_BOOKS_API_KEY=
```

## 🚀 Getting Started

### Prerequisites
- Node.js (Latest LTS version)
- pnpm (Package manager)
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone https://github.com/dibya-22/Next-Chapter.git
cd Next-Chapter
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
Create a `.env` file in the root directory and add the required environment variables as shown above.

4. Run the development server:
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
├── app/                 # Next.js app directory
│   ├── admin/          # Admin dashboard
│   ├── api/            # API routes
│   ├── books/          # Book-related pages
│   ├── cart/           # Shopping cart
│   └── orders/         # Order management
├── components/         # React components
│   ├── ui/            # UI components (shadcn/ui)
│   ├── books/         # Book-related components
│   └── cart/          # Cart components
├── lib/               # Utility functions and configurations
├── public/            # Static assets
└── styles/            # Global styles
```

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) team for the amazing framework
- [Clerk](https://clerk.com/) for authentication
- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [Tailwind CSS](https://tailwindcss.com/) for styling
- All other open-source contributors

---

<div align="center">

Made with ❤️ by [Dibya](https://github.com/dibya-22)

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/dibya-22)
[![X](https://img.shields.io/badge/X-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/dibya22_)

</div>
