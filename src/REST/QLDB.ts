import axios from 'axios';

export const qldbQuery = async (query: string) => {
  // If we're running tests don't run any QLDB code.
  if (process.env.JEST_WORKER_ID) { return; }

  try {
    await axios.post(
      process.env.QLDB_API_URL,
      query.replace(/array\[/gmi, '['), // remove the word array from array[1,2]
      {
        headers: {
          'Content-Type': 'text/plain',
          'X-API-KEY': process.env.QLDB_API_KEY
        },
      }
    );
  } catch (e) {
    console.log('Update QLDB Error', e);
  }
};
