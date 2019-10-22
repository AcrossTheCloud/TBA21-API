import axios from 'axios';

export const qldbQuery = async (query: string) => {
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
    // If we're running tests and can't connect.
    if (e.toString().includes('ENOTFOUND') && process.env.JEST_WORKER_ID) {
      console.log('\x1b[33m%s\x1b[0m', 'TEST Warning : #### Issue connecting to QLDB ####');
    } else {
      console.log('Update QLDB Error', e);
    }
  }
};
