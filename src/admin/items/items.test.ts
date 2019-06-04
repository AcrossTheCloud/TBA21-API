require('dotenv').config(
  {
    DEBUG: true,
    path: process.cwd() + (process.env.LOCAL ? '/.env' : '/.env-test')
  }
);

import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { db } from '../../databaseConnect';
import { QueryStringParameters } from '../../types/_test_';
import { get, getById, getByTag, getByType } from './items';

afterAll( () => {
  // Close the database connection.
  db.$pool.end();
});

describe('get Tests', () => {

  test('Check that we have 7 seeds.', async () => {
    const
      response = await get({} as APIGatewayProxyEvent, {} as Context),
      result = JSON.parse(response.body);

    expect(result.items.length).toEqual(7);
  });

  test('Check that we can limit the number of returned items.', async () => {
    const
      queryStringParameters: QueryStringParameters = {limit: '2'},
      response = await get({ queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      result = JSON.parse(response.body);

    expect(result.items.length).toEqual(2);
  });

  test('Check that the first row is populated and has specific values.', async () => {
    const
      response = await get({} as APIGatewayProxyEvent, {} as Context),
      result = JSON.parse(response.body);

    expect(result.items[0].id).toEqual('1');
    expect(result.items[0].s3_key).toEqual('wcHLmWtuuPhTFpwQXZkGFOSCmdOWc9H6w6z5fyTRY2shASsX1Vm6jbxM35GiPo7U2NZOJlE1I7YyhwC06STSGbfH7SrX4IHKDlbz3xevRoGIsHbQZmtnmW0JvmnUs0nOIZH8RYD4HKGIPAY4AnS6CKZ3HODs4XM7czksO1TqSpHARLPncu6xHCmDfcQaoczmJLOyeU9THyhDeCnBIJISxsl0pbM1USSgFOOcRLkv95mnIpIsWeJxw64ygyt7tedgfroDNWACwVzgutF03rDNQVUsSzsJaCgmDVymcSclknKDUevEVAOe36MF6V4Nf5ObBwKbqV16zSRiTYVDHyWWPP7VnZpEyCmeY4wCNYuh0QbGD5CAzjtBRCPFjFn24Ni0s7zEj8XrsNxr9nPoCJPoLSujCmEJz7mvTnDMzKa1B15vA2LXleMdaKT5XOIjNkODK34j52EtzNbGKWcqLG8sjtWbh1b7RQNEDAEEAMQPtD7ptA8jWNQmiTaOQsnZ7Cvv2nJTijC3hSwvbEz8ksoECapnGoQd8hobFT4ZZexV9nE8kgfKuGJXBr1qeFF15CvOmw6vru4PivatnSyTRs4USIXvZlDiFcv6rYRbKjWhHzNAkH4eXdHtym09MwXX0vy3PnJW9cj2tXiettfBj51GFOuV6l264Lamc1HMyBc306fEawI8gbJR9BclZJDrpxULcWwNNQ8oWVMSBZ3uwhcH99e3y7XUoRZ6A50D5MspZV0uVnV4waf93OMi4dciWN4YNIxhUpsZcLSsm2SO0zDpz16Skq5LsqZZ8Qi3TZjQPXnl3bC0bIOKyQPDfNXw3tdgPtKNuhzU44h9ET4EgtlTnXw45KAoJPNA4ZZfR6bbhP4A3p0p94D4SU9XOGwW4rhP1FtMXFHU0NSuoHnSj9f13xANSTOeZ57rUCPEthVNfBirDHxh2JlArGdjfd29BACTwOV8Wsy0VAnXEXEz89IyynkAcaLb3uoghl2GPwmbOITPx5vyiN3AF6xZL8dAJV5o');
  });

  test('Check that the second row is populated and has specific values.', async () => {
    const
      response = await get({} as APIGatewayProxyEvent, {} as Context),
      result = JSON.parse(response.body);

    expect(result.items[1].id).toEqual('2');
    expect(result.items[1].s3_key).toEqual('VMDrR2ifQtcXkhkj6GrRrbwRJsA72eP5mIjBLqWwlEZYYCgAe5AmZCivNUMdmCZN7CoxkF2yi5hAO6shMMqEx4Mh8yBXwPVpWzo6L2Hb97qOsJ5EprEmcFYIsDmGbpNa0BwreFxXVfbj2Ng4gKs8i7emAxOKpkomJppjrLeHrA5w6bRjMhvAD1iWPL5wKDUzr5XQdq5Z3UbSRGDEDjh5Z6Q05oWWTrRUH0cAul1mApwndrYAFcZ9oo1sAw8yM3fsgmUvXrhYiqXLwK2W05SngwAglcoFxIGLaoyPt5KoOhI00VYsKne2vuzs5qDiktLbM4gLMPc6D802XrMOS2LHyJWMUcXJiCbWvlZUwRqOYYCPzBJ88m49GvL6fEgh7d91sNNgQ8h5Ifg0dmdNTgnrDMnJeGB5wmyfjuSIJEIA659IaQQ5exR8dh3S9dtH5Ge9OU9GX5Sht1asjG0VEBtqBIuBdW4eGy3HIfphWw2R2TtutD7093M6C5Wu3b46Oq49EMqdFjxSn2Al9QxGzg0VhDCK9YsH2ycquaYmQ4oKoWd3lhwav2TB5zBMXsuX31j4XH1P48KgtJcT3VD4Sh2waIv7aWrDwEX80EALICdlbG4QYUH3SPCsGH5WbjZ7wcBTkWQAZjcTl7ooZGXmANRx7I9XT1BFz0OJzFGWgPhT6t13hIiVgpZCv7pSeVGDL5r2CmBVQGACF1krvtsQ9mWWaA54gc5QpiGcEWeZ5weis9qVtLgXtAKINHVbBPHkacIsElBnS8jsgnQk45TmXvtHjSnh7TzM61rZFliybENLeF1jpuXmZmhTaFFDVZMBCVwrDfblHqFApXe2v4aqBlXibdwEx82YJVmx1EY4SlKYHWlVTNSCJOBR5S1qkYt5dbcm4deStvIDJPwKUAqI4tZ58mnFU2kVOwMpwD0y03gzpnpABHIdRWl8mKAbcRKZ79LI3teT9bmCga4YPYPFdMLijIA8dcGSBp82uQFjEu70OyLGPN9pRuR93bg8GMoQUDWN');
  });
});

describe('/items/getById', () => {
  test('Get item by id of 2', async () => {
    const
      queryStringParameters: QueryStringParameters = {id: '2'},
      response = await getById({ queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      result = JSON.parse(response.body);

    expect(result.items[0].id).toEqual('2');
  });
  test('Get a bad response when no id is given', async () => {
    const
      queryStringParameters: QueryStringParameters = {id: ''},
      response = await getByTag({queryStringParameters } as APIGatewayProxyEvent, {} as Context);

    expect(response.statusCode).toEqual(400);
  });
});

describe('/items/getByTag', () => {
  test('Get all items with a tag of con', async () => {
    const
      queryStringParameters: QueryStringParameters = {tag: 'con'},
      response = await getByTag({queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      result = JSON.parse(response.body);

    expect(result.items.length).toEqual(4);
  });
  test('Get a bad response when no tag is given', async () => {
    const
      queryStringParameters: QueryStringParameters = {tag: ''},
      response = await getByTag({queryStringParameters } as APIGatewayProxyEvent, {} as Context);

    expect(response.statusCode).toEqual(400);
  });
});

describe('/items/getByType', () => {
  test('Get all items with a type of b', async () => {
    const
      queryStringParameters: QueryStringParameters = {type: 'b'},
      response = await getByType({queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      results = JSON.parse(response.body);
    console.log(results.item);
    expect(results.items.length).toEqual(1);
  });
  test('Get a bad response when no type is given', async () => {
    const
      queryStringParameters: QueryStringParameters = {person: ''},
      response = await getByTag({queryStringParameters } as APIGatewayProxyEvent, {} as Context);

    expect(response.statusCode).toEqual(400);
  });
});
