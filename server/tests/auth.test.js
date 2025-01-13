// tests/auth.test.js
const request = require("supertest");
const mongoose = require("mongoose");
require("dotenv").config({ path: "./.env.test" });

const app = require("../app"); // Używamy app.js (czysta instancja Express)
const User = require("../models/User");

// Mocks:
jest.mock("../services/recaptchaService", () => ({
  verifyRecaptcha: jest.fn(() => Promise.resolve(true)),
}));

jest.mock("../utils/sendEmail", () => jest.fn(() => Promise.resolve(true)));

beforeAll(async () => {
  // Łączymy się z testową bazą danych
  await mongoose.connect(process.env.MONGO_TEST_URI, {});
});

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Auth Controller - Register", () => {
  it("should register a new user and send verification email", async () => {
    const newUser = {
      firstName: "Jan",
      lastName: "Kowalski",
      email: "jan.kowalski@example.com",
      password: "SuperBezpieczneHaslo1!", // Zgodne z regułami
      captcha: "dummy-captcha-token",
    };

    const res = await request(app).post("/api/auth/register").send(newUser);

    expect(res.statusCode).toEqual(201);
    expect(res.body.msg).toContain(
      "Registration successful. Please check your email to verify your account."
    );

    const user = await User.findOne({ email: newUser.email });
    expect(user).toBeTruthy();
    expect(user.firstName).toBe("Jan");
  });

  it("should return error if required fields are missing", async () => {
    const incompleteUser = {
      email: "test@example.com",
      password: "SuperBezpieczneHaslo1!",
      captcha: "dummy-captcha-token",
    };

    const res = await request(app)
      .post("/api/auth/register")
      .send(incompleteUser);

    expect(res.statusCode).toEqual(400);
    expect(res.body.errors).toBeDefined();
  });
});

describe("Auth Controller - Login", () => {
  beforeEach(async () => {
    const user = new User({
      firstName: "Anna",
      lastName: "Nowak",
      email: "anna.nowak@example.com",
      password: "SuperBezpieczneHaslo1!",
      isVerified: true,
    });
    await user.save();
  });

  it("should login an existing user and return a token", async () => {
    const loginData = {
      email: "anna.nowak@example.com",
      password: "SuperBezpieczneHaslo1!",
      rememberMe: true,
    };

    const res = await request(app).post("/api/auth/login").send(loginData);

    expect(res.statusCode).toEqual(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("anna.nowak@example.com");
  });

  it("should return error for wrong password", async () => {
    const loginData = {
      email: "anna.nowak@example.com",
      password: "ZleHaslo!",
      rememberMe: false,
    };

    const res = await request(app).post("/api/auth/login").send(loginData);

    expect(res.statusCode).toEqual(400);
    expect(res.body.msg).toContain("Invalid credentials");
  });
});
