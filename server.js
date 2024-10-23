const express = require("express");
const leads = require("./leads.json");
const campaigns = require("./campaigns.json");
const connect_db = require("./config/db");
const etl_process = require("./ETL");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const { createObjectCsvWriter } = require("csv-writer");
const Lead = require("./models/leads");
const Campaign = require("./models/campaigns");

const app = express();
const PORT = 3000;
app.use(express.json());

app.get("/crm/leads", (req, res) => {
  try {
    res.status(200).json({
      status: "success",
      data: leads,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.get("/marketing/campaigns", (req, res) => {
  try {
    res.status(200).json({
      status: "success",
      data: campaigns,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.get("/report/pdf", async (req, res) => {
  try {
    const doc = new PDFDocument();
    const pdfPath = "report.pdf";

    if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);

    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    doc.fontSize(18).text("EzyMetrics Report", { align: "center" }).moveDown();
    doc.fontSize(14).text("Leads Data:");
    doc.fontSize(12).text(JSON.stringify(leads, null, 2)).moveDown();
    doc.fontSize(14).text("Campaigns Data:");
    doc.fontSize(12).text(JSON.stringify(campaigns, null, 2));
    doc.end();

    stream.on("finish", () => {
      res.download(pdfPath, "EzyMetrics_Report.pdf", (err) => {
        if (err) {
          return res
            .status(500)
            .json({ status: "error", message: err.message });
        }
      });
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.get("/report/csv", async (req, res) => {
  try {
    const csvPath = "report.csv";
    if (fs.existsSync(csvPath)) fs.unlinkSync(csvPath);
    const csvWriter = createObjectCsvWriter({
      path: csvPath,
      header: [
        { id: "leadId", title: "Lead ID" },
        { id: "name", title: "Name" },
        { id: "email", title: "Email" },
        { id: "source", title: "Source" },
      ],
    });
    const leadsData = await Lead.find({});
    if (!leadsData.length) {
      return res
        .status(404)
        .json({ status: "error", message: "No leads found" });
    }
    await csvWriter.writeRecords(leadsData);
    res.download(csvPath);
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

connect_db()
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      etl_process();
    });
  })
  .catch((err) => {
    console.log("Failed to connect to MongoDB", err);
  });
