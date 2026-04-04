import { google } from 'googleapis';

const civic = google.civicinfo({
  version: 'v2',
  auth: process.env.GOOGLE_CIVIC_API_KEY,
});

export default async (req, res) => {
  try {
    const info = await civic.elections.electionQuery({
      officialOnly: false,
      returnAllAvailableData: true,
      prettyPrint: true,
      alt: 'json',
    });

    if (info && typeof info === 'object') {
      return res.status(200).json(info);
    }

    return res.status(404).json({
      message: 'electionQuery() data not found or unrecognized type',
    });
  } catch (error) {
    console.error('Error fetching elections:', error.message);
    return res.status(500).json({
      error: 'Failed to fetch elections from Google Civic API',
      details: error.message,
    });
  }
};
