const cheerio = require("cheerio");

const baseUrl =
  "https://www.periodni.com/elements_names_sorted_alphabetically.html";
const elementUrl = "https://www.periodni.com";

const capitalizeWords = (stringData: any) => {
  /**
   * capitalizes first letter for given string of words.
   *
   * @param {any} stringData
   * @returns {string}
   */
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
    const htmlUrl = `${elementUrl}/${$(element).find("a").attr("href")}`;
    const row = $(element)
      .find("td")
      .map((j: any, item: any) => $(item).text().trim())
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

const getElementById = async (id: any) => {
  try {
    let elementsData = await getAllElements();
    const filteredData = elementsData.filter(
      (data: any) => data.id === parseInt(id)
    )[0];
    if (filteredData.length === 0) {
      return { status: 404, message: "Data not found..." };
    }
    return filteredData;
  } catch (err: any) {
    console.error({ message: err.message });
  }
};

const getElementBySymbol = async (symbol: string) => {
  /**
   * traverses HTML document with given element symbol
   * and constructs a JSON Object of a specified element.
   * @returns {Array} filteredData
   */
  const elementsBySymbol: any = [];
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

    const tableRows: any = [];
    body.find("table:first tbody tr").each((i: any, item: any) => {
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
  } catch (err: any) {
    console.error({ message: err.message });
  }
};

const getElementByGroupName = async (groupName: string) => {
  const elementsByGroupName = [];
  const elements = await getAllElements();
  const newGroupName = capitalizeWords(groupName);
  for (let i = 0; i <= elements.length - 1; i++) {
    const elementById = await getElementById(elements[i].id);
    const elementBySymbol = await getElementBySymbol(elementById.symbol);
    if (elementBySymbol[0].groupName !== newGroupName) {
      continue;
    } else if (!elementBySymbol) {
      return { status: 404, message: "Data not found..." };
    } else {
      elementsByGroupName.push(elementBySymbol[0]);
    }
  }
  return elementsByGroupName;
};

export default {
  getAllElements,
  getElementById,
  getElementBySymbol,
  getElementByGroupName
};
