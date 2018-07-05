# TBA21 OceanArchive api

## Methods
* GET /items{?ocean=nameOfOcean e.g. [Atlantic](https://tba21-api.acrossthecloud.net/items?ocean=Atlantic) or [Pacific](https://tba21-api.acrossthecloud.net/items?ocean=Pacific)
* POST /item with body example:
```json
{
  "ocean":"Pacific",
  "description":"whales",
  "url":"https://www.wildaboutwhales.com.au/mj65jcqcktsj/3PIBKE5PVSakQIuGcUimgi/cc089697dfb65e8b2296493498128bdc/moonshadow-cruises-656x388.jpg",
  "position":[150.9321558,-34.4128595],
  "artist": "artist-uuid",
  "tags": ["tag1", "tag2"]
}
```
## Required metadata fields
* `ocean`: one of 'Pacific','Atlantic','Indian','Southern','Arctic'.
* `description`: text description of artefact.
* `url`: url for viewing/downloading artefact.
* `position`: [lng,lat] coordinates for the artefact.
