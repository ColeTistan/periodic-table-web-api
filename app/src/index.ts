import { Hono } from "hono";

const app = new Hono();
const base_url = "/api"
let data = [
  {
    id: 1,
    firstName: "Bryce",
    lastName: "Harper",
  },
  {
    id: 2,
    firstName: "Trea",
    lastName: "Turner",
  },
  {
    id: 3,
    firstName: "Bryson",
    lastName: "Stott",
  },
];

app.notFound((c) => {
  return c.text("Data not found...", 404);
});

app.onError((err, c) => {
  console.error({ message: err.message });
  return c.text("Internal Server Error occurred...", 500);
});

app.get(`${base_url}/`, (c) => c.json(data));

app.get(`${base_url}/:id`, (c) => {
  const { id } = c.req.param();
  const filteredData = data.filter((data) => data.id === parseInt(id));
  if (filteredData.length === 0) return c.json({"status": 404, "message": "Data not found..."})
  return c.json(filteredData);
});

app.post(`${base_url}/`, async (c) => {
  const body = await c.req.json();
  if (!body) return c.json({"status": 401, "message": "Request Payload is required..."})
  const newEntry = {
    id: data.length + 1,
    firstName: body.firstName,
    lastName: body.lastName,
  };
  data.push(newEntry);
  return c.json({ data: newEntry });
});

export default {
  port: 3000,
  fetch: app.fetch,
};
