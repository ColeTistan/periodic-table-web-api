const cheerio = require("cheerio");

const baseUrl =
  "https://www.periodni.com/elements_names_sorted_alphabetically.html";
const elementUrl = "https://www.periodni.com";

const capitalizeWords =
  /**
   * capitalizes first letter for given string of words.
   *
   * @param {any} stringData
   * @returns {string}
   */
  (stringData: any) => {
    return stringData.toLowerCase().replace(/\b./g, (l: any) => {
      return l.toUpperCase();
    });
  };

const getLoadedData = async (url: string) => {
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
  const elements: any = [];
  const $ = await getLoadedData(baseUrl);
  $("table tr").each((i: any, element: any) => {
    const row = $(element)
      .find("td")
      .map((j: any, item: any) => $(item).text().trim())
      .get();
    let elementObj = {
      id: i,
      name: row[2],
      symbol: row[1],
      atomicNumber: parseInt(row[0]),
    };
    elements.push(elementObj);
  });
  return elements.slice(1);
};

const getElementBySymbol = async (symbol: string) => {
  /**
   * traverses HTML document with given element symbol
   * and constructs a JSON Object of a specified element.
   * @returns {JSON} elementObj
   */
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

  const tableRows: any = [];
  body.find("table:first tbody tr").each((i: any, item: any) => {
    const row = $(item).find("td").text().split(":").pop();
    tableRows.push(row);
  });

  const elementObj = {
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

  return elementObj;
};

export default {
  getAllElements,
  getElementBySymbol,
};
