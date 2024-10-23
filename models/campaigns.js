const mongoose = require("mongoose");

const CampaignSchema = new mongoose.Schema({
    campaignId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
    }
  });

  const Campaign = mongoose.model("Campaign", CampaignSchema);

  module.exports = Campaign;