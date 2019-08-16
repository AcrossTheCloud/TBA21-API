require('dotenv').config(
    {
      DEBUG: true
    }
  );

import { APIGatewayProxyEvent } from 'aws-lambda';
import { db } from '../../databaseConnect';
import { reSeedDatabase } from '../../utils/testHelper';
import { updateByS3key } from './update';

describe('/admin/items/update/updateByS3key', () => {

    // AfterAll tests reseed the DB
    afterAll( async () => {
      await reSeedDatabase();
      // Close the database connection.
      db.$pool.end();
    });

    test('Update item updateByS3key', async () => {
      const
        requestBody = {
        's3_key': 'private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/862f0b10-a6a7-11e9-9669-7fbab4073699-Humpback_Whales_-_South_Bank.jpg',
        'concept_tags': [3, 4],
        'keyword_tags': [1, 3],
        'place': ['place'],
        'regions': ['Ocean'],
        'item_type': 'Text',
        'item_subtype': 'Sculpture',
        'creators': ['Zara', 'Dan'],
        'directors': ['directors'],
        'writers': ['writers'],
        'collaborators': ['collaborators'],
        'exhibited_at': ['exhibited at'],
        'series': 'series',
        'ISBN': '123456',
        'DOI': 'doi',
        'edition': '1',
        'year_produced': '1992',
        'publisher': ['publisher'],
        'interviewers': ['interviewers'],
        'interviewees': ['interviewees'],
        'cast_': ['cast'],
        'license': 'CC BY',
        'title': 'title',
        'subtitle': 'subtitle',
        'in_title': 'in title',
        'description': 'description',
        'map_icon': 'map icon',
        'focus_arts': '1',
        'focus_action': '2',
        'focus_scitech': '3',
        'article_link': 'www.link.com',
        'translated_from': 'translated from',
        'language': 'language',
        'birth_date': '2019-02-22 10:53',
        'death_date': '2019-02-22 10:53',
        'venues': ['venue1', 'venue2'],
        'screened_at': 'screened at',
        'genre': 'genre',
        'news_outlet': 'news outlet',
        'institution': 'institution',
        'medium': 'medium',
        'dimensions': 'dimensions',
        'recording_technique': 'recording techniques',
        'original_sound_credit': 'original sound credit',
        'record_label': 'record label',
        'series_name': 'series name',
        'episode_name': 'episode name',
        'episode_number': '1',
        'recording_name': 'recording name',
        'speakers': ['speakers'],
        'performers': ['performers'],
        'host_organisation': ['host org'],
        'radio_station': 'radio station',
        'item_name': 'item name',
        'original_title': 'otiginsl title',
        'related_event': 'related event',
        'volume_in_series': '3',
        'organisation': ['organisation'],
        'oa_highlight': 'true',
        'tba21_material': 'false',
        'oa_original': 'false',
        'lecturer': 'lecturer',
        'authors': ['authors'],
        'credit': 'credit',
        'copyright_holder': 'copyright holder',
        'copyright_country': 'copyright country',
        'created_for': 'created for',
        'duration': '60',
        'interface': 'interface',
        'document_code': 'code',
        'project': 'project',
        'journal': 'journal',
        'event_title': 'event title',
        'recording_studio': 'recodring studio',
        'original_text_credit': 'original text credit',
        'issue': '1',
        'pages': '394',
        'city_of_publication': 'city of publication',
        'disciplinary_field': 'disciplinary field',
        'related_project': 'related project',
        'location': 'location',
        'participants': ['participants'],
        'produced_by': ['produced by'],
        'projection': 'projection',
        'related_ISBN': '1234',
        'edition_uploaded': '4',
        'first_edition_year': '1990',
        'editor': 'editor',
        'featured_in': 'featured in',
        'volume': '2'
        },
        body: string = JSON.stringify(requestBody),
        response = await updateByS3key({ body } as APIGatewayProxyEvent),
        responseBody = JSON.parse(response.body);
      expect(responseBody.success).toBe(true);
    });

    test('Get a bad response when no s3_key is given', async () => {
        const
          requestBody = { 's3_key': '' },
          body: string = JSON.stringify(requestBody),
          response = await updateByS3key({ body } as APIGatewayProxyEvent);

        expect(response.statusCode).toEqual(400);
      });
  });
