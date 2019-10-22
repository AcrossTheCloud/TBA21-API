import axios from 'axios';

export const updateQLDB = async (query: string) => {
  try {
    await axios.post(
      process.env.QLDB_API_URL,
      query
        .replace(/array\[/gmi, '['), // remove the word array from array[1,2]
      {
        headers: {
          'Content-Type': 'text/plain',
          'X-API-KEY': process.env.QLDB_API_KEY
        },
      }
    );
  } catch (e) {
    console.log('Error', e);
  }
};
