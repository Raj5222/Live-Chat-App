import { parse,build } from "node-xlsx";

export async function createExcelFile(data:unknown[][]) {
  // Create Excel file
  const options = {
    "!merges": [], // Optional
  };
  const excelBuffer = build([{ name: "My Sheet", data ,options}]);

  console.log("Excel file created!");
  return excelBuffer; // Return Buffer Data Of Excel
}
