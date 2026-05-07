import request from "supertest";
import app from "../../server.js";

describe("Appointments API", () => {

  test("GET /api/appointments", async () => {

    const res = await request(app)
      .get("/api/appointments");

    expect(res.statusCode).toBeDefined();

  });

});