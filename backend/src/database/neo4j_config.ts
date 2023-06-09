import neo4j from "neo4j-driver";
require('dotenv').config();

const host = process.env.NEO4J_HOST || 'localhost';
const port = process.env.NEO4J_PORT || '7687';
const user = process.env.NEO4J_USER || 'neo4j';
const password = process.env.NEO4J_PASSWORD || 'tazkeheslo';

const neo_driver = neo4j.driver(`bolt://${host}:${port}`, neo4j.auth.basic(user, password), { disableLosslessIntegers: true });

(async () => {
  const session = neo_driver
    .session({
      database: 'neo4j',
      defaultAccessMode: neo4j.session.WRITE
    });
  try {
    await session.run(`
        CREATE CONSTRAINT url_recordId_idx IF NOT EXISTS FOR (n:Node) 
        REQUIRE (n.url, n.recordId) IS UNIQUE;`);
    await session.run(`
        CREATE INDEX recordId_idx IF NOT EXISTS FOR (n:Node) ON (n.recordId);`);
  } catch (e) {
    console.log(e);
  } finally {
    session.close();
  }
})();

export default neo_driver;
