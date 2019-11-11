require('dotenv').config(
  {
    DEBUG: true
  }
);

import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { db } from '../databaseConnect';
import { QueryStringParameters } from '../types/_test_';
import { reSeedDatabase } from '../utils/testHelper';
import { get, changeStatus, updateById } from './collections';

describe('Collections Update', () => {
  // AfterAll tests reseed the DB
  afterAll(async () => {
    await reSeedDatabase();
    // Close the database connection.
    db.$pool.end();
  });

  test('Change the status of a collection', async () => {
    const
      queryStringParameters: QueryStringParameters = { status: 'false', id: '1' },
      response = await changeStatus({ queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      results = JSON.parse(response.body);

    expect(results);
    const getResponse = await get({} as APIGatewayProxyEvent),
      getResults = JSON.parse(getResponse.body);

    expect(getResults.data.objects.output.geometries.length).toEqual(2);
  });

  test('Contributor tries to update a collection who does not belong to him/her', async () => {
    const
      requestBody = {
        'id': '1',
        'contributors': ['1f89f9b6-39bc-416e-899e-ef1a8d656f24'],
        'status': 'true',
        'concept_tags': [3, 4],
        'keyword_tags': [1, 3],
        'regions': ['Atlantic'],
        'regional_focus': 'Arctic Ocean',
        'creators': ['creators'],
        'directors': ['directors1, directors2'],
        'writers': ['writers'],
        'editor': 'editor',
        'collaborators': ['collaborators'],
        'exhibited_at': ['exhibited at'],
        'series': 'series',
        'isbn': [674316184220],
        'edition': '1',
        'publisher': ['publisher'],
        'interviewers': ['interviewer'],
        'interviewees': ['interviewee'],
        'cast_': ['cast'],
        'title': 'title',
        'subtitle': 'subtitle',
        'description': 'descritption',
        'copyright_holder': 'copyright holder',
        'copyright_country': 'Australia',
        'disciplinary_field': 'disciplinary_field',
        'specialisation': 'specialisation',
        'department': 'department',
        'expedition_leader': 'expedition_leader',
        'institution': 'institution',
        'expedition_vessel': 'expedition_vessel',
        'expedition_route': 'expedition_route',
        'expedition_blog_link': 'www.blog.com',
        'participants': ['participants'],
        'venues': ['venue'],
        'curator': 'curator',
        'host': ['host'],
        'event_type': 'event type',
        'type': 'Event',
        'host_organisation': ['host org'],
        'focus_arts': '1',
        'focus_action': '2',
        'focus_scitech': '3',
        'url': 'www.google.com',
        'related_material': [1, 2],
        'license': 'CC BY-ND',
        'location': 'wollongong',
        'year_produced': '1992',
        'media_type': 'photograph',
        'city_of_publication': 'wollongong',
        'digital_only': 'true',
        'related_event': 'related',
        'volume': '1',
        'number': '2',
        'items': ['private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/ad742900-a6a0-11e9-b5d9-1726307e8330-kitten-pet-animal-domestic-104827.jpeg', 'private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/ad742900-a6a0-11e9-b5d9-1726307e8330-dog-pet-animal-domestic-104827.jpeg', 'private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/862f0b10-a6a7-11e9-9669-7fbab4073699-Humpback_Whales_-_South_Bank.jpg'],
      },
      body: string = JSON.stringify(requestBody),
      response = await updateById({
        body, requestContext: {
          identity: {
            cognitoAuthenticationProvider: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx:CognitoSignIn:1f89f9b6-39bc-416e-899e-ef1a8d656f24'
          }
        }
      } as APIGatewayProxyEvent);

    expect(response.statusCode).toBe(403);
  });

  test('Contributor tries to update a collection in which is a contributor', async () => {
    const
      requestBody = {
        'id': '1',
        'contributors': ['1f89f9b6-39bc-416e-899e-ef1a8d656f24', '7e32b7c6-c6d3-4e70-a101-12af2df21a19'],
        'status': 'true',
        'concept_tags': [3, 4],
        'keyword_tags': [1, 3],
        'regions': ['Atlantic'],
        'regional_focus': 'Arctic Ocean',
        'creators': ['creators'],
        'directors': ['directors1, directors2'],
        'writers': ['writers'],
        'editor': 'editor',
        'collaborators': ['collaborators'],
        'exhibited_at': ['exhibited at'],
        'series': 'series',
        'isbn': [674316184220],
        'edition': '1',
        'publisher': ['publisher'],
        'interviewers': ['interviewer'],
        'interviewees': ['interviewee'],
        'cast_': ['cast'],
        'title': 'title',
        'subtitle': 'subtitle',
        'description': 'descritption',
        'copyright_holder': 'copyright holder',
        'copyright_country': 'Australia',
        'disciplinary_field': 'disciplinary_field',
        'specialisation': 'specialisation',
        'department': 'department',
        'expedition_leader': 'expedition_leader',
        'institution': 'institution',
        'expedition_vessel': 'expedition_vessel',
        'expedition_route': 'expedition_route',
        'expedition_blog_link': 'www.blog.com',
        'participants': ['participants'],
        'venues': ['venue'],
        'curator': 'curator',
        'host': ['host'],
        'event_type': 'event type',
        'type': 'Event',
        'host_organisation': ['host org'],
        'focus_arts': '1',
        'focus_action': '2',
        'focus_scitech': '3',
        'url': 'www.google.com',
        'related_material': [1, 2],
        'license': 'CC BY-ND',
        'location': 'wollongong',
        'year_produced': '1992',
        'media_type': 'photograph',
        'city_of_publication': 'wollongong',
        'digital_only': 'true',
        'related_event': 'related',
        'volume': '1',
        'number': '2',
        'items': ['private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/ad742900-a6a0-11e9-b5d9-1726307e8330-kitten-pet-animal-domestic-104827.jpeg', 'private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/ad742900-a6a0-11e9-b5d9-1726307e8330-dog-pet-animal-domestic-104827.jpeg', 'private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/862f0b10-a6a7-11e9-9669-7fbab4073699-Humpback_Whales_-_South_Bank.jpg'],
      },
      body: string = JSON.stringify(requestBody),
      response = await updateById({
        body, requestContext: {
          identity: {
            cognitoAuthenticationProvider: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx:CognitoSignIn:7e32b7c6-c6d3-4e70-a101-12af2df21a19'
          }
        }
      } as APIGatewayProxyEvent);

    expect(response.statusCode).toBe(200);
  });

});
