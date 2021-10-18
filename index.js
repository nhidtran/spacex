const { ApolloServer, gql } = require("apollo-server");
const { GraphQLScalarType, Kind } = require("graphql");
const spacexjson = require("./spacex_launches.json");

const server = new ApolloServer({
  typeDefs: gql`
    scalar EpochTime
    scalar ISODateTime
    enum SiteEnum {
      CAPE_CANAVERAL
      FOO
      KENNEDY_SPACE_STATION
    }
    enum RocketEnum {
      FALCON_9
    }
    type Flight {
      flight_number: String
    }
    type Rocket {
      rocket_id: String
    }
    type Site {
      site_id: String
      site_name: String
      site_name_long: String
    }
    type Mission {
      mission_name: String!
      rocket: Rocket!
      launch_info: Launch!
      found_norads: [Int]!
    }
    type Missions {
      missions: [Mission]!
    }
    type Launch {
      launch_success: Boolean!
      launch_date: DateTime!
      launch_site: Site!
    }
    type DateTime {
      epoch_datetime: EpochTime
      iso_datetime: ISODateTime
    }
    interface Error {
      error_message: String!
    }
    type MissionNotFoundError implements Error {
      error_message: String!
    }
    union MissionResult = Mission | MissionNotFoundError
    union MissionsResult = Missions | MissionNotFoundError
    type Query {
      missionByName(name: String!): MissionResult!
      missionByFlight(flight_num: Int!): MissionResult!
      missionsBySite(siteId: SiteEnum!): MissionsResult!
      failedMissions: [Mission]!
      successfulMissions: [Mission]!
      rocketMissions(rocketId: RocketEnum!): MissionsResult!
    }
  `,
  resolvers: {
    Query: {
      missionsBySite: (_, { siteId }) => {
        const foundMissions = spacexjson.filter(
          (obj) => obj.launch_site.site_id === siteId
        );
        if (!foundMissions) {
          return {
            __typename: "MissionNotFoundError",
            error_message: `Missions at site not found with the provided site id '${siteId}'`,
          };
        }
        return {
          __typename: "Missions",
          missions: foundMissions,
        };
      },
      missionByName: (_, { name }) => {
        const foundMission = spacexjson.find(
          (obj) => obj.mission_name === name
        );
        if (!foundMission) {
          return {
            __typename: "MissionNotFoundError",
            error_message: `The mission with the provided name '${name}' does not exist`,
          };
        }
        return {
          __typename: "Mission",
          ...foundMission,
        };
      },
      missionByFlight: (_, { flight_num }) => {
        const foundMission = spacexjson.find(
          (obj) => obj.flight_number === flight_num
        );
        if (!foundMission) {
          return {
            __typename: "MissionNotFoundError",
            error_message: `The mission with the provided flight number '${flight_num}' does not exist`,
          };
        }
        return {
          __typename: "Mission",
          ...foundMission,
        };
      },
      rocketMissions: (_, { rocketId }) => {
        const missions = spacexjson.filter(
          (mission) => mission.rocket.rocket_id === rocketId
        );
        if (!missions) {
          return {
            __typename: "MissionNotFoundError",
            error_message: `Missions at site not found with the provided site id '${siteId}'`,
          };
        }
        return {
          __typename: "Missions",
          missions: missions,
        };
      },
      failedMissions: () => {
        return spacexjson.filter((mission) => !mission.launch_success);
      },
      successfulMissions: () =>
        spacexjson.filter((mission) => !!mission.launch_success),
    },
    EpochTime: new GraphQLScalarType({
      name: "EpochTime",
      description: "Epoch representation of a date",
      parseLiteral(ast) {
        if (ast.kind !== Kind.INT) {
          throw new Error("Invalid epoch value. Expected 9 integers");
        }
        if (new Date(ast.value) <= 0)
          throw new Error("Invalid epoch value provided");
      },
      parseValue(value) {
        if (new Date(value) <= 0)
          throw new Error("Invalid epoch value provided");
        return value;
      },
      serialize(value) {
        if (new Date(value) <= 0)
          throw new Error("Invalid epoch value provided");
        return value;
      },
    }),
    ISODateTime: new GraphQLScalarType({
      name: "ISODateTime",
      description: "ISO-8601 string",
      parseLiteral(ast) {
        if (new Date(ast.value) > 0) return new Date(ast.value).toISOString();
        throw new Error("Invalid epoch value provided");
      },
      parseValue(value) {
        if (new Date(value) > 0) return new Date(value).toISOString();
        throw new Error("Invalid epoch value provided");
      },
      serialize(value) {
        if (new Date(value) > 0) return new Date(value).toISOString();
        throw new Error("Invalid epoch value provided");
      },
    }),
    DateTime: {
      epoch_datetime: (parent) => parent,
      iso_datetime: (parent) => parent,
    },
    Mission: {
      launch_info: (parent) => {
        return {
          launch_date: parent.launch_date_unix,
          launch_success: parent.launch_success,
          launch_site: parent.launch_site,
        };
      },
      found_norads: (parent) => {
        const res = parent.rocket.payloads[0].norad_id;
        return res || [];
      },
    },
    RocketEnum: {
      FALCON_9: "falcon9",
    },
    SiteEnum: {
      FOO: "foo",
      CAPE_CANAVERAL: "ccafs_slc_40",
      KENNEDY_SPACE_STATION: "ksc_lc_39a",
    },
  },
});

server.listen({ port: 3000 }).then(({ url }) => {
  console.log(`Server running at ${url}`);
});
