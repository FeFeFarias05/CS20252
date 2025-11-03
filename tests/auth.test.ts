import jwt from "jsonwebtoken";
import request from "supertest";
import app from "../src/app";

const privateKey = "test-secret";

describe("JWT Auth Middleware", () => {
  it("should allow valid token", async () => {
    const token = jwt.sign(
      { sub: "user123", role: "admin", aud: "test-aud" },
      privateKey,
      { algorithm: "HS256", issuer: "test-issuer", expiresIn: "1h" }
    );

    const res = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
  });

  it("should reject invalid token", async () => {
    const res = await request(app)
      .get("/users")
      .set("Authorization", "Bearer invalid-token");

    expect(res.statusCode).toBe(401);
  });
});
