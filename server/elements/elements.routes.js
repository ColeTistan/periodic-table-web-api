const { Router } = require("express");
const {
  getAllElements,
  getElementById,
  getElementBySymbol,
  getElementByGroupName,
} = require("./elements.controller");

const baseUrl = "/api";
const elementsRouter = new Router();

elementsRouter.get(
  ["/", baseUrl],
  /**
   * returns response with status and json data of elements
   *
   * @async
   * @param {request} req
   * @param {response} res
   * @returns {res}
   */ async (req, res) => {
    try {
      let elements = await getAllElements();
      return res.status(200).json(elements);
    } catch (err) {
      return res.status(500).send({ message: err.message });
    }
  }
);

elementsRouter.get(`${baseUrl}/:id`, async (req, res) => {
  /**
   * returns response with status and json data of element with ID
   *
   * @async
   * @param {request} req
   * @param {response} res
   * @returns {res}
   */
  const id = req.params.id;
  const filteredData = await getElementById(id);
  return res.status(200).json(filteredData);
});

elementsRouter.get(`${baseUrl}/symbol/:symbol`, async (req, res) => {
  /**
   * returns periodic table element data by given element symbol.
   *
   * @async
   * @param {request} req
   * @param {response} res
   * @returns {res}
   */
  const symbol = req.params.symbol;
  let elementsBySymbol = await getElementBySymbol(symbol);
  if (elementsBySymbol[0].name.length === 0) {
    return res.status(404).json({ message: "Data not found..." });
  }
  return res.status(200).json(elementsBySymbol);
});

elementsRouter.get(`${baseUrl}/group/:groupName`, async (req, res) => {
  /**
   * returns periodic table element data
   * by given element group name.
   * Ex: Noble Gas
   *
   * @async
   * @param {request} req
   * @param {response} res
   * @returns {res}
   */
  const groupName = req.params.groupName;
  const elementsByGroupName = await getElementByGroupName(groupName);
  if (elementsByGroupName.length === 0) {
    return res.status(404).json({ message: "Data not found..." });
  }
  return res.status(200).json(elementsByGroupName);
});

module.exports = elementsRouter;
