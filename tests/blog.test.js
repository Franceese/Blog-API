const request = require("supertest");
const app = require("../src/app");

let token;
let blogId;

beforeEach(async () => {
  await request(app).post("/api/auth/signup").send({
    first_name: "Author",
    last_name: "User",
    email: "author@example.com",
    password: "password123"
  });

  const login = await request(app)
    .post("/api/auth/login")
    .send({
      email: "author@example.com",
      password: "password123"
    });

  token = login.body.token;
});

describe("Blog Endpoints", () => {

  it("should create blog when authenticated", async () => {
    const res = await request(app)
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test Blog",
        body: "This is a test blog content with enough words to calculate reading time."
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.state).toBe("draft");
    blogId = res.body._id;
  });

  it("should publish blog", async () => {
    const create = await request(app)
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Publish Blog",
        body: "Content for publish blog"
      });

    const res = await request(app)
      .patch(`/api/blogs/${create.body._id}/publish`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.state).toBe("published");
  });

  it("should get published blogs (public)", async () => {
    const create = await request(app)
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Public Blog",
        body: "Public blog content"
      });

    await request(app)
      .patch(`/api/blogs/${create.body._id}/publish`)
      .set("Authorization", `Bearer ${token}`);

    const res = await request(app).get("/api/blogs");

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("should increment read_count when single blog is fetched", async () => {
    const create = await request(app)
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Read Count Blog",
        body: "Blog to test read count"
      });

    await request(app)
      .patch(`/api/blogs/${create.body._id}/publish`)
      .set("Authorization", `Bearer ${token}`);

    const firstFetch = await request(app)
      .get(`/api/blogs/${create.body._id}`);

    const secondFetch = await request(app)
      .get(`/api/blogs/${create.body._id}`);

    expect(secondFetch.body.read_count).toBe(2);
  });

  it("should delete blog", async () => {
    const create = await request(app)
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Delete Blog",
        body: "Delete blog content"
      });

    const res = await request(app)
      .delete(`/api/blogs/${create.body._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
  });

});
