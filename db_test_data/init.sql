create table IF NOT EXISTS website_records (
	record_id INT unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
	url VARCHAR(9999) NOT NULL,
	boundary_regexp VARCHAR(1000),
	periodicity INT unsigned NOT NULL,
	label VARCHAR(100) NOT NULL,
	is_active BOOLEAN DEFAULT true,
	is_being_crawled BOOLEAN DEFAULT false,
	tags json NOT NULL,
	crawled_data json DEFAULT NULL,
	request_do_crawl BOOLEAN DEFAULT false
);

-- Generate different test data for website_records table using previous schema
-- Data is used for webcrawler app that is used to crawl websites and store data in database
-- Crawler recursively crawls all pages that are linked to the website if the link matches the boundary_regexp
-- Generate data for 3 websites, different tags, different boundary_regexp, different periodicity, different label, different url
INSERT INTO `website_records` VALUES
(1,'https://www.24ur.com/','https://www.24ur.com/.*',1,'24ur',true,false,JSON_ARRAY('24ur'),null,false),
(2,'https://www.rtvslo.si/','https://www.rtvslo.si/.*',1,'rtvslo',true,false,JSON_ARRAY('rtvs', 'hello'),null,false),
(3,'https://www.delo.si/','https://www.delo.si/.*',1,'delo',true,false,JSON_ARRAY(),null,false);


create table IF NOT EXISTS executions (
	execution_id INT unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
	status BOOLEAN DEFAULT false,
	start_time DATETIME DEFAULT NULL,
	end_time DATETIME DEFAULT NULL,
	sites_crawled_count INT DEFAULT NULL,
	record_id INT unsigned NOT NULL REFERENCES website_records(record_id)
);

ALTER TABLE executions
ADD CONSTRAINT execution_record_id_fk FOREIGN KEY (record_id) REFERENCES website_records(record_id) ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO `executions` VALUES
(1,false,'2020-05-01 00:00:00','2020-05-01 00:00:05',0,1),
(2,false,'2020-05-01 00:00:00','2020-05-01 00:00:05',0,2),
(3,false,'2020-05-01 00:00:00','2020-05-01 00:00:04',0,3);
