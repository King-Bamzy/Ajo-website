const ajoPlans = [
  {
    name: "Daily Saver",
    contribution: 1000,
    frequency: "Daily collection",
    duration: "Flexible",
    totalPayout: 30000,
    description: "A simple daily amount for members who want their representative to collect small, steady savings.",
    benefits: ["Easy to maintain daily streaks", "Clear view of paid and missed days"]
  },
  {
    name: "Weekly Saver",
    contribution: 5000,
    frequency: "Weekly collection",
    duration: "Flexible",
    totalPayout: 20000,
    description: "For customers who prefer fewer collection visits while still building savings consistently.",
    benefits: ["Planned weekly collections", "Good for salary or market-cycle savers"]
  },
  {
    name: "Monthly Saver",
    contribution: 20000,
    frequency: "Monthly collection",
    duration: "Flexible",
    totalPayout: 200000,
    description: "A higher monthly plan for customers who want to save in larger scheduled amounts.",
    benefits: ["Monthly balance check-ins", "Easier planning for bigger targets"]
  },
  {
    name: "Multiple Goals Plan",
    contribution: 1000,
    frequency: "Custom collection",
    duration: "Flexible",
    totalPayout: 50000,
    description: "Use one account to run more than one savings target without opening multiple customer accounts.",
    benefits: ["Separate goals under one profile", "Representative can help structure the targets"]
  }
];

module.exports = ajoPlans;
