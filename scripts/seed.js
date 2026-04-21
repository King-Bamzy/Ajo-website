const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Item = require("../src/models/Item");
const Collection = require("../src/models/Collection");
const User = require("../src/models/User");
const thriftItems = require("../src/data/thriftItems");
const { hashPassword } = require("../src/utils/passwords");

dotenv.config();

const sampleCollections = [
  {
    memberName: "Tola Adebayo",
    phone: "+2348012345678",
    memberEmail: "tola@example.com",
    plan: "Starter Ajo",
    contribution: 50000,
    notes: "First contribution after onboarding",
    status: "scheduled"
  },
  {
    memberName: "Ifunanya Okoye",
    phone: "+2348029876543",
    memberEmail: "ifunanya@example.com",
    plan: "Basic Ajo",
    contribution: 200000,
    notes: "Wants to join the Basic circle",
    status: "pending"
  }
];

async function seed() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ajo-thrift";

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  console.log("Connected to MongoDB for seeding");

  await Item.deleteMany();
  await Collection.deleteMany();
  await User.deleteMany();

  await Item.insertMany(thriftItems);

  const adminEmail = (process.env.SEED_ADMIN_EMAIL || "admin@ajo.local").toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "Admin1234!";

  const memberEmail = (process.env.SEED_MEMBER_EMAIL || "member@ajo.local").toLowerCase();
  const memberPassword = process.env.SEED_MEMBER_PASSWORD || "Member1234!";

  const [admin, member] = await User.create([
    {
      name: "Ajo Admin",
      email: adminEmail,
      passwordHash: hashPassword(adminPassword),
      role: "admin"
    },
    {
      name: "Ajo Member",
      email: memberEmail,
      passwordHash: hashPassword(memberPassword),
      role: "user"
    }
  ]);

  const seededCollections = sampleCollections.map((c, index) => {
    if (index === 1) {
      return { ...c, userId: member._id, memberName: member.name, memberEmail: member.email };
    }
    return c;
  });

  await Collection.insertMany(seededCollections);

  console.log("Seeded items and collection statuses");
  console.log("Seeded users:");
  console.log(`- admin: ${adminEmail} / ${adminPassword}`);
  console.log(`- member: ${memberEmail} / ${memberPassword}`);
  await mongoose.disconnect();
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seeding failed", error);
    process.exit(1);
  });
