import { google } from 'googleapis';

const civic = google.civicinfo({
  version: 'v2',
  auth: process.env.GAPI_KEY,
});

let info;
export default async (req, res, error) => {
  info = await civic.elections.electionQuery({
    officialOnly: false,
    returnAllAvailableData: true,
    prettyPrint: true,
    alt: 'json',
  });

  if (typeof info === 'object') {
    return res.status(200).json(info);
  } else {
    return res.status(404).json({
      message: `electionQuery() data not found or unrecognized type`,
    });
  }

  // return res.status(200).json(info);
};
