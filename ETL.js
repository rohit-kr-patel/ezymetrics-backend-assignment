const Lead = require("./models/leads");
const Campaign = require("./models/campaigns");
const leadsData = require("./leads.json");
const campaignsData = require("./campaigns.json");
const sendMail = require("./config/email");

async function etlProcess() {
  try {
    console.log("Extracting data...");
    const transformedLeads = leadsData.map((lead) => ({
      ...lead,
      source: lead.source.toUpperCase(),
    }));

    const transformedCampaigns = campaignsData.map((campaign) => ({
      ...campaign,
      status: campaign.status.toLowerCase(),
    }));

    console.log("Transformed Data:", transformedLeads, transformedCampaigns);

    await Lead.insertMany(transformedLeads);
    await Campaign.insertMany(transformedCampaigns);

    console.log("Data loaded successfully into MongoDB!");

    if (transformedLeads.length > 100) {
      await sendEmailAlert(transformedLeads.length);
    }
  } catch (error) {
    console.error("ETL process failed:", error);
  }
}

async function sendEmailAlert(leadCount) {
  const mailOptions = {
    from: "rp58007@gmail.com",
    to: "recipient@example.com",
    subject: "EzyMetrics Alert: High Lead Count",
    text: `Alert! The total number of leads has exceeded the threshold. Current lead count: ${leadCount}.`,
  };

  try {
    await sendMail(mailOptions);
    console.log("Alert email sent successfully!");
  } catch (error) {
    console.error("Failed to send alert email:", error);
  }
}

module.exports = etlProcess;
