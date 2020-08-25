import { google } from 'googleapis';

const civic = google.civicinfo({
  version: 'v2',
  auth: process.env.GAPI_KEY,
});

export default async ({ query: { id }, query: { address } }, res, error) => {
  const info = await civic.elections.voterInfoQuery({
    address,
    electionId: id,
    officialOnly: false,
    returnAllAvailableData: true,
    prettyPrint: true,
    alt: 'json',
  });

  if (typeof info === 'object') {
    return res.status(200).json(info);
  } else {
    return res.status(404).json({
      message: `voterInfoQuery() for electionId: ${id} not found or unrecognized type`,
    });
  }
};
