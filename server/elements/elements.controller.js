const cheerio = require("cheerio");

const baseUrl =
  "https://www.periodni.com/elements_names_sorted_alphabetically.html";
const elementUrl = "https://www.periodni.com";

const capitalizeWords = (stringData) => {
  /**
   * capitalizes first letter for given string of words.
   *
   * @param {any} stringData
   * @returns {string}
   */
  return stringData.toLowerCase().replace(/\b./g, (l) => {
    return l.toUpperCase();
  });
};

const getLoadedData = async (url) => {
  /**
   * returns cheerio object of parsed document to scrape data.
   *
   * @param {string} url
   * @returns {Cheerio} $
   */
  const response = await fetch(url);
  const body = await response.text();
  const $ = cheerio.load(body);
  return $;
};

const getAllElements = async () => {
  /**
   * traverses loaded document to scrape data from baseUrl
   * and return array of elements with appended data to construct web API.
   *
   * @returns {any} elements
   */
  const elements = [];
  const $ = await getLoadedData(baseUrl);
  $("table tr").each((i, element) => {
    const htmlUrl = `${elementUrl}/${$(element).find("a").attr("href")}`;
    const row = $(element)
      .find("td")
      .map((j, item) => $(item).text().trim())
      .get();
    let elementObj = {
      id: parseInt(row[0]),
      name: row[2],
      symbol: row[1],
      atomicNumber: parseInt(row[0]),
      url: htmlUrl,
    };
    elements.push(elementObj);
  });
  return elements.slice(1);
};

const getElementById = async (id) => {
  try {
    let elementsData = await getAllElements();
    const filteredData = elementsData.filter((data) => data.id === id);
    if (filteredData.length === 0) {
      return { status: 404, message: "Data not found..." };
    }
    return filteredData;
  } catch (err) {
    console.error({ message: err.message });
  }
};

const getElementBySymbol = async (symbol) => {
  /**
   * traverses HTML document with given element symbol
   * and constructs a JSON Object of a specified element.
   * @returns {Array} filteredData
   */
  const elementsBySymbol = [];
  try {
    const $ = await getLoadedData(`${elementUrl}/${symbol.toLowerCase()}.html`);
    const body = $("#ebody");
    // Get element name and clean inner text
    const elementName = capitalizeWords(body.find("h1").text());
    let groupName = capitalizeWords(body.find("p.txt-c").text());
    if (groupName.length === 0) {
      groupName = "N/A";
    }
    if (groupName.includes("Transition Element: ")) {
      groupName = groupName.split(":").pop().toString().trim();
    }

    const tableRows = [];
    body.find("table:first tbody tr").each((i, item) => {
      const row = $(item).find("td").text().split(":").pop();
      tableRows.push(row);
    });

    if (isNaN(tableRows[0])) {
      return { status: 404, message: "Data not found..." };
    }

    const elementObj = {
      id: parseInt(tableRows[0]),
      name: elementName,
      groupName: groupName,
      atomicNumber: parseInt(tableRows[0]),
      groupNumbers: parseInt(tableRows[1]),
      periodNumber: parseInt(tableRows[2]),
      electronicConfig: tableRows[3],
      formalOxidationNumber: tableRows[4],
      electronegativities: tableRows[5],
      atomicRadius: tableRows[6],
      relativeAtomicMass: tableRows[7],
    };
    elementsBySymbol.push(elementObj);
    return elementsBySymbol;
  } catch (err) {
    console.error({ message: err.message });
  }
};

const getElementByGroupName = async (groupName) => {
  let elementsArr = [];
  const elementsData = await getAllElements();
  const newGroupName = capitalizeWords(groupName);
  await Promise.all(
    elementsData.map(async (row) => {
      const elementById = await getElementById(row.id);
      const elementBySymbol = await getElementBySymbol(elementById[0].symbol);
      elementsArr.push(elementBySymbol[0]);
    })
  );
  return elementsArr.filter((data) => data.groupName === newGroupName);
};

module.exports = {
  getAllElements,
  getElementById,
  getElementBySymbol,
  getElementByGroupName,
};
