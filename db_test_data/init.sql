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

INSERT INTO `website_records` VALUES 
(1, 'https://www.ultranative.com/', '/w{3}\.ultranative\.com/', 1, 'Ultranative', 1, 0, JSON_ARRAY('Ultra', 'Native'), null, 0), 


create table IF NOT EXISTS executions (
	execution_id INT unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
	status BOOLEAN DEFAULT false,
	start_time DATETIME DEFAULT NULL,
	end_time DATETIME DEFAULT NULL,
	sites_crawled_count INT DEFAULT NULL,
	record_id INT unsigned NOT NULL
);

ALTER TABLE executions
ADD CONSTRAINT execution_record_id_fk FOREIGN KEY (record_id) REFERENCES website_records(record_id) ON DELETE CASCADE ON UPDATE CASCADE;
