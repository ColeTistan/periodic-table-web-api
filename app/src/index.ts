import { Hono } from "hono";
import scraper from "./scraper";
const app = new Hono();
const baseUrl = "/api";

/**
 * handles HTTP requests returning a response that couldn't find any data.
 *
 * @param {Context} c
 * @returns {Text}
 */
app.notFound((c) => {
  return c.text("Data not found...", 404);
});

/**
 * handles internal server errors that occurred in response returned.
 *
 * @param {Context} c
 * @returns {Text}
 */
app.onError((err, c) => {
  console.error({ message: err.message });
  return c.text("Internal Server Error occurred...", 500);
});

/**
 * returns all periodic table data from getAllElements function
 *
 * @param {Context} c
 * @returns {JSON}
 */
app.on("GET", [`${baseUrl}/`, "/"], async (c) => {
  let elementsData = await scraper.getAllElements();
  return c.json(elementsData);
});

app.get(`${baseUrl}/:id`, async (c) => {
  /**
   * returns periodic table element data by given ID.
   *
   * @param {Context} c
   * @returns {JSON}
   */
  const { id } = c.req.param();
  let elementsData = await scraper.getAllElements();
  const filteredData = elementsData.filter(
    (data: any) => data.id === parseInt(id)
  )[0];
  if (filteredData.length === 0)
    return c.json({ status: 404, message: "Data not found..." });
  return c.json(filteredData);
});

app.get(`${baseUrl}/symbol/:symbol`, async (c) => {
  /**
   * returns periodic table element data by given element symbol.
   *
   * @param {Context} c
   * @returns {JSON}
   */
  const { symbol } = c.req.param();
  let elementData = await scraper.getElementBySymbol(symbol);
  if (elementData.name.length === 0) {
    return c.json({ status: 404, message: "Data not found..." });
  }
  return c.json(elementData);
});

app.get(`${baseUrl}/group/:group`, async (c) => {
  /**
   * TODO - Add GET endpoint to filter data by group name.
   * 
   * returns periodic table element data by given element group name
   * Ex: Noble Gas
   *
   * @async
   * @param {Context} c
   * @returns {JSON}
   */
  return;
});

export default {
  port: 3000,
  fetch: app.fetch,
};
