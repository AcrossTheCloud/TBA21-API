import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { badRequestResponse } from '../common';
import { db } from '../databaseConnect';

export const getItems = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  let
    queryString: { [name: string]: string } | null = event.queryStringParameters,
    QUERY: string = `select COUNT ( id ) OVER ( ), * from ${process.env.DB_NAME}.items items`,
    JOIN: string = ` INNER JOIN tba21.s3uploads s3uploads ON (items.s3uploads_sha512 = s3uploads.ID_sha512)`;

  // Default query string params.
  if (!queryString) {
    queryString = {
      limit: '15'
    };
  }

  const
    LIMIT: string = ` LIMIT ${queryString.limit}`,
    OFFSET: string = queryString.hasOwnProperty('offset') ? ` OFFSET ${queryString.offset}` : '';

  let WHERE: string = ` WHERE status=true`;
  // if false (draft)
    // todo get groups from AdminListGroupsForUser and check if user in apart of admin/specific group
    // todo also check if the owner of this = the accessor

  QUERY = QUERY + JOIN + WHERE + LIMIT + OFFSET;

  try {
    return {
      body: JSON.stringify({
         message: await db.query(QUERY),
       }),
      statusCode: 200,
    };
  } catch (e) {
    console.log('getItems ERROR - ', e);
    return badRequestResponse;
  }
};
