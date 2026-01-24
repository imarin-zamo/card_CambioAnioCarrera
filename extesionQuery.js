module.exports = {
    'getLevelAcademic': [{
        query: `{
  academicLevels6(
    filter: {
      OR: [
        { code: { EQ: "LI" } }
        { code: { EQ: "MA" } }
        { code: { EQ: "DO" } }
      ]
    }
  ) {
    edges {
      node {
        id
        code
        title
        description
      }
    }
  }
}`
    }]
}