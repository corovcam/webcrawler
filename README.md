# webcrawler_T16

Start with "docker-compose up", force rebuild with "docker-compose up --build".

Development servers:
- Frontend: http://localhost:3001
- Database: Azure MySQL
    - host: webcrawler-t16.mysql.database.azure.com
    - user: admint16
    - pass: webcrawler-t16
    - database: webcrawler
    - port: 3306
    - ssl: enable
        - ssl certificate required: frontend/src/data/DigiCertGlobalRootCA.crt.pem

Database testing data: frontend/src/data/db_test_data