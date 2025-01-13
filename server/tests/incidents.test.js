const request = require("supertest");
const mongoose = require("mongoose");
require("dotenv").config({ path: "./.env.test" });

const app = require("../app");
const Incident = require("../models/Incident");

//reCAPTCHA zawsze zwraca true
jest.mock("../services/recaptchaService", () => ({
  verifyRecaptcha: jest.fn(() => Promise.resolve(true)),
}));

describe("Incident Controller - Add Incident", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_TEST_URI);
  });

  afterEach(async () => {
    await Incident.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should add a new incident when all required fields are provided", async () => {
    // Przykładowe dane
    const newIncident = {
      category: "Akty wandalizmu",
      description: "Opis incydentu testowego",
      location: JSON.stringify({
        type: "Point",
        coordinates: [19.05, 49.82],
      }),

      captcha: "dummy-captcha-token",
    };

    const res = await request(app).post("/api/incidents").send(newIncident);

    expect(res.statusCode).toEqual(200);
    expect(res.body._id).toBeDefined();
    expect(res.body.category).toBe(newIncident.category);
  });

  it("should return error when location is missing", async () => {
    const incompleteIncident = {
      category: "Akty wandalizmu",
      description: "Brak lokalizacji",
      captcha: "dummy-captcha-token",
    };

    const res = await request(app)
      .post("/api/incidents")
      .send(incompleteIncident);

    expect(res.statusCode).toEqual(400);
    expect(res.body.msg).toContain("Location is required.");
  });
});
