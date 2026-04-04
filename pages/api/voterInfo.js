import { google } from 'googleapis';

const civic = google.civicinfo({
  version: 'v2',
  auth: process.env.GOOGLE_CIVIC_API_KEY,
});

export default async (req, res) => {
  const { id, address } = req.query;

  if (!id || !address) {
    return res.status(400).json({
      error: 'Missing required parameters: id and address',
    });
  }

  try {
    const info = await civic.elections.voterInfoQuery({
      address,
      electionId: id,
      officialOnly: false,
      returnAllAvailableData: true,
      prettyPrint: true,
      alt: 'json',
    });

    if (info && typeof info === 'object') {
      return res.status(200).json(info);
    }

    return res.status(404).json({
      message: `voterInfoQuery() for electionId: ${id} not found or unrecognized type`,
    });
  } catch (error) {
    console.error(`Error fetching voter info for electionId: ${id}:`, error.message);
    return res.status(500).json({
      error: 'Failed to fetch voter info from Google Civic API',
      details: error.message,
    });
  }
};
