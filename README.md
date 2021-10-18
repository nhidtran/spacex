## Challenge

Using your favorite language, implement a GraphQL server that would allow a UI developer to query SpaceX's launch data. The UI Developer will be most interested in querying the mission name, launch date, and the norad ids of the payloads on board the rocket. The focus of this assignment is assessing how you create a useful graphQL schema against the data and how understandable your code is.

You should use the launch data that is attached as spacex_launches.json. The data from spacex_launches.json can be stored directly in memory; do not worry about adding a database or other storage mechanism beyond direct variable access.

If you have time, add additional fields and queries to your graphQL server based off of the data in spacex_launches.json and add relevant testing and logging to your working server.

## GraphQL

Explanation and code samples can be found https://graphql.org/code/

Apollo Server is explained here - https://www.apollographql.com/docs/apollo-server/getting-started/

## Data Explanation

The section below is pasted from spacex_launches.json for the first launch. The comments next to the fields give a background on what the field means.

```javascript
[
  {
    flight_number: 90,
    mission_name: "Starlink 4", // Mission Name the UI Developer will need to query
    launch_date_unix: 1581951955, // The Launch Date in standard unix epoch time the UI Developer will need to query
    rocket: {
      rocket_id: "falcon9",
      payloads: [
        {
          payload_id: "Starlink 4",
          norad_id: [
            // A list of the Norad Ids of the payload on the rocket that the UI Developer will need to query
            45341,
          ],
        },
      ],
    },
    launch_site: {
      site_id: "ccafs_slc_40",
      site_name: "CCAFS SLC 40",
      site_name_long:
        "Cape Canaveral Air Force Station Space Launch Complex 40",
    },
    launch_success: true,
  },
];
```
