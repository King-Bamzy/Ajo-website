const path = require("path");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const itemRoutes = require("./routes/items");
const planRoutes = require("./routes/plans");
const collectionRoutes = require("./routes/collections");
const authRoutes = require("./routes/auth");
const adminPages = require("./routes/adminPages");
const adminApi = require("./routes/adminApi");
const accountPages = require("./routes/accountPages");
const { attachUser } = require("./middleware/auth");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || true,
    optionsSuccessStatus: 200
  })
);
app.use(attachUser);

app.get("/", (req, res) => {
  const highlights = [
    {
      title: "Monitor your growing savings",
      copy: "Check your savings record without waiting for your next representative visit."
    },
    {
      title: "Maintain payment streaks",
      copy: "Stay consistent by following each collection date and keeping your momentum visible."
    },
    {
      title: "Track paid and missed days",
      copy: "See which collection days have been recorded and quickly spot any gaps."
    },
    {
      title: "Reach support for emergency withdrawals",
      copy: "Send a request when you need help, a clarification, or an urgent withdrawal conversation."
    }
  ];

  const steps = [
    "A representative introduces the website and helps you open your account.",
    "After sign up, you choose a single savings plan or set up multiple goals from your dashboard.",
    "Collections still happen physically while your online account keeps the record easier to follow.",
    "You log in anytime to monitor progress, payment days, and support updates."
  ];

  const faqs = [
    {
      question: "Do I still pay through the representative?",
      answer: "Yes. The website supports the process, but the physical collection model stays in place."
    },
    {
      question: "Can I save for more than one goal on one account?",
      answer: "Yes. You can use one customer account and ask for a multiple goals plan instead of creating separate accounts."
    },
    {
      question: "What if I miss a collection day?",
      answer: "Your record will help you see missed days quickly, and you can speak with the representative or support team about the next step."
    },
    {
      question: "How do I request an emergency withdrawal?",
      answer: "Log in to your account, then contact support from the details provided on the website so the team can guide you."
    },
    {
      question: "Can the representative help me create my account?",
      answer: "Yes. The website is designed so the representative can help new customers sign up during onboarding."
    },
    {
      question: "Will my information stay private?",
      answer: "Yes. Only the details needed to manage your savings plan and contact you are kept in the system."
    }
  ];

  res.render("index", {
    highlights,
    steps,
    faqs
  });
});

app.use("/auth", authRoutes);
app.use("/admin", adminPages);
app.use("/account", accountPages);

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "Ajo thrift API" });
});

app.get("/support", (req, res) => {
  res.render("info", {
    pageTitle: "Support - Ajo Thrift Collection",
    eyebrow: "Support",
    heading: "Help for savings, withdrawals, and account questions.",
    intro: "If your representative is not nearby, this page gives customers a clear place to find help and know what to expect.",
    panel: {
      title: "Quick help",
      copy: "Use these channels when you need an update or guidance.",
      items: [
        "WhatsApp support for payment and account questions",
        "Emergency withdrawal requests handled by the support team",
        "Representative follow-up for account or schedule changes"
      ]
    },
    sections: [
      {
        title: "Contact support",
        body: "Reach the team on WhatsApp at +234 801 234 5678 or by email at support@ajo.local. Include your full name and the phone number linked to your account."
      },
      {
        title: "Emergency withdrawals",
        body: "If you need urgent access to your savings, contact support as early as possible. The team will confirm your identity, review your account, and explain the next available steps."
      },
      {
        title: "Account updates",
        body: "For plan changes, missed collection days, or corrections to your details, contact support or tell your representative during their next visit."
      }
    ]
  });
});

app.get("/privacy", (req, res) => {
  res.render("info", {
    pageTitle: "Privacy - Ajo Thrift Collection",
    eyebrow: "Privacy",
    heading: "Your information is collected to support the savings process, not replace the trusted relationship behind it.",
    intro: "This website keeps a lighter digital record so customers can check their progress more easily while representatives continue physical collections.",
    panel: {
      title: "What we keep",
      copy: "Only the information needed to manage your account and communicate with you should be stored.",
      items: [
        "Your name and contact details",
        "Savings plan choices and collection schedules",
        "Support notes linked to your account"
      ]
    },
    sections: [
      {
        title: "Why your data is used",
        body: "Your information helps the team identify your account, confirm your savings plan, record collection schedules, and respond when you need support."
      },
      {
        title: "How access should be limited",
        body: "Only authorized staff and representatives who need the record to serve you should have access to customer information."
      },
      {
        title: "How to ask for corrections",
        body: "If your details are incorrect or outdated, contact support or inform your representative so the record can be updated."
      }
    ]
  });
});

app.get("/terms", (req, res) => {
  res.render("info", {
    pageTitle: "Terms - Ajo Thrift Collection",
    eyebrow: "Terms",
    heading: "Basic terms for using the customer account and savings tracking website.",
    intro: "These terms explain the purpose of the site and how it works alongside the existing representative-led savings model.",
    panel: {
      title: "Website purpose",
      copy: "The platform is for record keeping, customer access, and support visibility.",
      items: [
        "It does not remove the representative from the collection process",
        "It helps customers monitor plans and account activity",
        "It supports communication around savings and withdrawals"
      ]
    },
    sections: [
      {
        title: "Customer responsibility",
        body: "Customers should provide correct account details, keep their login secure, and confirm savings choices with their representative or the support team."
      },
      {
        title: "Collection process",
        body: "Savings collections may still happen physically according to the agreed plan. Account records on the website should reflect the official collection updates shared by the team."
      },
      {
        title: "Support and disputes",
        body: "If there is a question about your record, missed collections, or withdrawals, contact support promptly so the team can review the account with you."
      }
    ]
  });
});

app.use("/api/items", itemRoutes);
app.use("/api/plan-options", planRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/admin", adminApi);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.status || 500).json({ message: error.message || "Server error" });
});

mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ajo-thrift", {
    serverSelectionTimeoutMS: 5000
  })
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server", error);
  });
