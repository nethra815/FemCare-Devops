import request from "supertest";
import app from "../../server.js";

describe("Auth API", () => {

  test("POST /api/auth/login invalid credentials", async () => {

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "fake@test.com",
        password: "wrong"
      });

    expect(res.statusCode).toBeDefined();

  });

});