# 🍽️ Mess Management System

A modern full-stack **Mess Management System** designed to simplify hostel/mess operations including member management, meals, meal preferences, bazar expenses, monthly meal-rate calculation, billing, payments, notices, and administration.

## 🌐 Live Demo

🚀 **Live Website:**
https://messmanagementsys.netlify.app/

## 📌 Project Overview

The **Mess Management System** is a web-based application that provides separate interfaces for **Admin** and **Members**.

The system helps administrators manage daily mess activities while allowing members to view their meals, monthly expenses, dues, payments, and meal preferences from a single platform.

---

## ✨ Features

### 👨‍💼 Admin Panel

* 🔐 Admin authentication
* 📊 Admin dashboard
* 👥 Member management
* 🍚 Daily meal management
* 🕐 Meal preference management
* 🛒 Bazar and expense management
* 🧮 Monthly meal-rate calculation
* 🏠 Rent and utility management
* 💰 Member due and balance calculation
* 💳 Payment verification
* 📱 bKash payment verification
* 🔎 bKash Transaction ID review
* ✅ Payment approval/rejection
* 🎲 Manager lottery
* 📢 Notice and announcement management
* ⚙️ Admin settings

### 👤 Member Panel

* 🔐 Member authentication
* 📊 Personal dashboard
* 🍚 View meal information
* 🕐 Submit meal preferences
* 💰 View monthly bill
* 🛒 View meal-related expenses
* 🏠 View rent and utility charges
* 💳 Submit payment requests
* 📱 bKash payment with Transaction ID
* 📜 View payment history
* 💵 View paid amount, due, and balance
* 📢 View notices

---

# 💳 Payment System

The system provides a manual payment verification workflow.

## Member Payment Flow

```text
Member
   ↓
Check Current Due
   ↓
Select Payment Method
   ↓
Enter Payment Amount
   ↓
Select bKash
   ↓
Enter Transaction ID
   ↓
Submit Payment
   ↓
Payment Status = Pending
```

## Admin Verification Flow

```text
Pending Payment
       ↓
Admin Reviews
       ↓
Member Information
       ↓
Payment Amount
       ↓
Payment Method
       ↓
Transaction ID
       ↓
Approve / Reject
       ↓
Payment Status Updated
       ↓
Member Balance Updated
```

For bKash payments, the member provides the actual **Transaction ID**. The transaction is stored in the database and remains pending until the administrator verifies it.

---

# 🍚 Monthly Meal Rate Calculation

The system calculates the monthly meal rate based on total bazar expenses and total actual meals.

### Formula

```text
Meal Rate = Total Bazar Expense ÷ Total Actual Meals
```

### Example

```text
Total Bazar = BDT 800
Total Meals = 5

Meal Rate = 800 ÷ 5
          = BDT 160
```

The calculated meal rate is then used to calculate each member's meal cost.

```text
Meal Charge = Member Meal Count × Meal Rate
```

---

# 🛒 Bazar & Expense Management

Bazar expenses are entered through:

```text
Admin Panel
     ↓
Expenses
     ↓
Add Expense
```

Each expense contains:

* Description
* Amount
* Date
* Category

Expenses categorized as **bazar** are included in the monthly meal-rate calculation.

### Example

```text
Bazar 1 = BDT 300
Bazar 2 = BDT 200
Bazar 3 = BDT 300
--------------------
Total Bazar = BDT 800
```

---

# 🧮 Billing System

### Meal Charge

```text
Meal Charge
= Meal Count × Monthly Meal Rate
```

### Total Member Cost

```text
Total Member Cost
= Meal Charge
+ Rent
+ Utility
+ Other Charges
+ Previous Due
```

### Payment Balance

```text
Balance
= Total Due - Verified Paid Amount
```

Only verified/approved payments are considered in the payment calculation.

---

# 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │       User          │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ React + TypeScript  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Supabase Client   │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
        ┌───────────┐    ┌───────────┐   ┌────────────┐
        │   Auth    │    │ PostgreSQL│   │    RLS     │
        └───────────┘    └───────────┘   └────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Application Data  │
                    └─────────────────────┘
```

---

# 🛠️ Technology Stack

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* Framer Motion
* Lucide React

## Backend & Database

* Supabase
* PostgreSQL
* Supabase Authentication
* Row Level Security (RLS)
* PostgreSQL Functions
* PostgreSQL Triggers

## Deployment

* Netlify

---

# 📁 Project Structure

```text
Web-lab-Project/
│
├── src/
│   ├── components/
│   │   ├── admin/
│   │   └── member/
│   │
│   ├── context/
│   │
│   ├── lib/
│   │
│   ├── pages/
│   │   ├── admin/
│   │   └── member/
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── supabase/
│   ├── functions/
│   └── migrations/
│
├── package.json
├── vite.config.ts
├── postcss.config.js
└── README.md
```

---

# 🚀 Installation & Setup

## 1. Clone Repository

```bash
git clone https://github.com/mstnasrinakterprome/Web-lab-Project.git
cd Web-lab-Project
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> ⚠️ Never commit real secret credentials to GitHub.

## 4. Run Development Server

```bash
npm run dev
```

The application will normally run at:

```text
http://localhost:5173
```

---

# 📦 Available Scripts

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm run preview
```

---

# 🗄️ Database

The project uses **Supabase PostgreSQL** for data management.

Major database areas include:

```text
Members
Meals
Meal Records
Meal Preferences
Expenses
Monthly Meal Rates
Monthly Costs
Member Dues
Payment Transactions
Notices
Manager Lottery
```

The project also uses:

* Row Level Security
* Database Functions
* Database Triggers
* Authentication

---

# 🔐 Security

The application implements several security mechanisms:

* Supabase Authentication
* Protected Admin routes
* Protected Member routes
* Row Level Security (RLS)
* User-specific data access
* Hostel-specific data access
* Payment verification workflow
* Environment variables for Supabase configuration

---

# 🎯 Project Objectives

The main objectives of this project are:

1. Reduce manual mess-management work.
2. Automate monthly meal-rate calculation.
3. Simplify member and meal management.
4. Track bazar and other expenses.
5. Provide transparent monthly billing.
6. Manage member payment requests.
7. Verify bKash payments using Transaction IDs.
8. Provide separate Admin and Member dashboards.
9. Maintain centralized and secure database records.

---

# 🌐 Live Application

Visit the deployed application:

👉 **https://messmanagementsys.netlify.app/**

---

# 👨‍💻 Author

**Saniul Islam**

Bachelor of Science in Computer Science and Engineering
Southeast University, Dhaka

---

# 📜 License

This project is developed for **academic and educational purposes**.
