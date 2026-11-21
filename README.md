# 💍 WedPlan – Wedding Service Marketplace

<p align="center">
  A Modern Platform to Plan Your Perfect Wedding
</p>

<p align="center">
  Discover wedding services, connect with professional vendors, and manage your wedding bookings — all in one place.
</p>

<p align="center">
  <a href="https://wedplan-client-rho.vercel.app">Live Website</a> •
  <a href="https://github.com/yousufali01/WedPlan_Client">Frontend Repository</a> •
  <a href="https://github.com/yousufali01/WedPlan_Server">Backend Repository</a>
</p>

---

## 📖 About WedPlan

WedPlan is a full-stack wedding service marketplace designed to simplify the wedding planning experience. It connects customers with professional wedding service providers through a modern, responsive, and user-friendly platform.

Customers can discover wedding services, explore vendor profiles, submit booking requests, track booking statuses, and complete secure payments.

Vendors can create and manage their services, handle customer booking requests, and upgrade their accounts through subscription plans.

Administrators can manage users, review services, monitor bookings, and oversee marketplace activities.

The platform provides three role-based experiences: **Customer, Vendor, and Admin**.

## ✨ Key Features

### 👤 Customer Features

- Browse and discover available wedding services.
- Search services by name or keyword.
- Filter services by category and location.
- Sort services by price.
- View detailed service information and vendor profiles.
- Submit wedding service booking requests.
- Track booking statuses: Pending, Accepted, Rejected, and Cancelled.
- Cancel pending booking requests.
- Complete payments through Stripe.
- View booking and transaction history.
- Manage personal profile information.
- Access a dedicated customer dashboard.

### 🏪 Vendor Features

- Access a dedicated vendor dashboard.
- Create and manage vendor profiles.
- Add, edit, and delete wedding services.
- Upload service images.
- Submit services for administrator approval.
- View and manage customer booking requests.
- Accept or reject booking requests.
- Track service and booking activities.
- Manage subscription plans.
- Upgrade to Premium through Stripe Checkout.
- Display a Premium badge for eligible vendors.

### 🛡️ Admin Features

- Access the administrator dashboard.
- Manage customers and vendors.
- View and manage user accounts.
- Review pending wedding services.
- Approve or reject submitted services.
- Monitor marketplace services.
- Manage bookings and transactions.
- Oversee platform activities.

### 🔐 Authentication & Security

- Email and password authentication.
- Google OAuth authentication.
- Better Auth integration.
- JWT-based API authorization.
- Role-based dashboard access.
- Protected routes and authenticated pages.
- Secure user session management.
- Role-based navigation and interface.

### 💳 Payment & Subscription

- Stripe Checkout integration.
- Secure payment experience.
- Free and Premium vendor plans.
- Monthly and yearly subscription options.
- Subscription and transaction information.
- Payment status feedback.

### 🎨 User Experience

- Responsive design for desktop, tablet, and mobile.
- Modern and reusable UI components.
- Interactive animations.
- Smooth navigation.
- Loading and empty states.
- Error handling and toast notifications.
- Form validation and user feedback.

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| Next.js 16 | Frontend framework |
| React 19 | UI development |
| TypeScript | Type safety |
| Tailwind CSS 4 | Styling |
| Shadcn UI | Reusable UI components |
| Better Auth | Authentication |
| Stripe.js | Payment integration |
| Motion | Animations |
| Lucide React | Icons |
| React Hook Form | Form management |
| Zod | Schema validation |
| Sonner | Toast notifications |
| Recharts | Data visualization |
| date-fns | Date formatting |

## 🏗️ Project Structure

```text
WedPlan_Client/
│
├── public/
│
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   ├── services/
│   │   ├── bookings/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── shared/
│   │   ├── auth/
│   │   └── dashboard/
│   │
│   ├── hooks/
│   ├── lib/
│   ├── services/
│   ├── types/
│   └── utils/
│
├── .gitignore
├── next.config.ts
├── package.json
├── package-lock.json
└── README.md
```

*Note: The structure is a high-level overview. Refer to the repository for the complete implementation.*

## ⚙️ Installation & Setup

### Prerequisites

- Node.js
- npm
- Git
- Running WedPlan backend API

### 1. Clone the Repository

```bash
git clone https://github.com/yousufali01/WedPlan_Client.git
```

### 2. Navigate to the Project

```bash
cd WedPlan_Client
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env.local` file in the project root.

Add the environment variables required by your frontend implementation. For example, if your API client reads `NEXT_PUBLIC_API_URL`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

For the deployed application, use the production backend URL:

```env
NEXT_PUBLIC_API_URL=https://wedplan-server-seven.vercel.app
```

If the frontend directly uses ImgBB uploads, configure the public ImgBB API key in the frontend deployment environment as well:

```env
NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_api_key
```

**Important:** Keep only the variables actually read by your frontend code. Never expose private API keys, database credentials, Better Auth secrets, or Stripe secret keys in frontend environment variables.

### 5. Start the Development Server

```bash
npm run dev
```

Open the application:

```text
http://localhost:3000
```

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

## 🔗 Backend Integration

The frontend communicates with the WedPlan backend through RESTful APIs.

**Production Backend:**

https://wedplan-server-seven.vercel.app

The backend provides services for:

- Authentication and authorization.
- User and vendor management.
- Wedding service management.
- Booking operations.
- Subscription management.
- Payment processing.
- Transaction management.
- Administrative operations.

## 👥 User Roles

| Role | Main Responsibilities |
|---|---|
| Customer | Discover services, submit bookings, make payments, and track requests |
| Vendor | Manage profiles, services, subscriptions, and booking requests |
| Admin | Manage users, approve services, and oversee marketplace operations |

## 🌐 Live Application

**Live Website:** https://wedplan-client-rho.vercel.app

**Backend API:** https://wedplan-server-seven.vercel.app

## 🔗 Project Repositories

- **Frontend:** https://github.com/yousufali01/WedPlan_Client
- **Backend:** https://github.com/yousufali01/WedPlan_Server

## 👨‍💻 Developer

**WedPlan – Wedding Service Marketplace**

Developed as a full-stack web application using modern frontend technologies.

---

<p align="center">
  <strong>WedPlan – Making Every Wedding Special. ❤️</strong>
</p>
