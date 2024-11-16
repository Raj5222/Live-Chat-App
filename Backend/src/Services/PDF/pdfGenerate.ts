import puppeteer from "puppeteer";

export const pdfGfunction = async ( pdftitle:string, heading: string[], data: any) => {
  try {
    const html = `
<head>
    <style>
         body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            width: 100vw;
            background-color: #f4f4f4;
            text-align: center;
        }

        table {
            width: 50%;
            margin: 20px auto;
            border-collapse: collapse;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            text-align: center;
        }

        th, td {
            padding: 12px;
            border-bottom: 1px solid #ddd;
        }

        th {
            background-color: #898989;
            color: white;
        }

        tr:hover {
            background-color: #f1f1f1;
        }

        td {
            background-color: #ffffff;
        }

        /* Style the table borders */
        table, th, td {
            border: 1px solid #ddd;
        }
        
        span {
          buttom : 0;
        }
    </style>
</head>
<body>
    <h1>${pdftitle}</h1>
    <table>
        <thead>
            <tr>
                ${heading.map((data) => `<th>${data}</th>`).join("")}
            </tr>
        </thead>
        <tbody>
        ${data
          .map(
            (row) =>
              `<tr>${row
                .map((value) => {
                  if (typeof value === "object") {
                    return `<td>${Object.values(value)}</td>`;
                  } else {
                    return `<td>${value}</td>`;
                  }
                })
                .join("")}</tr>`
          )
          .join("")}
        </tbody>
    </table>
    <span>Created At : ${Date()}</span>
</body>`;

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
    }); // Added no-sandbox for potential environment issues
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page
      .pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "20px", right: "20px", bottom: "40px", left: "20px" },
      })
      .then();
    const blob = Buffer.from(new Uint8Array(pdfBuffer));

    await browser.close();
    return blob; // Return the PDF buffer
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};
