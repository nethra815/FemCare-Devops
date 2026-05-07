import request from "supertest";
import app from "../../server.js";

describe("Health API", () => {

  test("GET /api/health should return 200", async () => {

    const res = await request(app).get("/api/health");

    expect(res.statusCode).toBe(200);

  });

});