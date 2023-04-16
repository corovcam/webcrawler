create table website_records (
	record_id INT,
	url VARCHAR(1000),
	boundary_regexp VARCHAR(100),
	periodicity VARCHAR(50),
	label VARCHAR(50),
	is_active BOOLEAN
);

ALTER TABLE website_records
ADD PRIMARY KEY (record_id);

insert into website_records (record_id, url, boundary_regexp, periodicity, label, is_active) values (1, 'https://upenn.edu/metus/vitae/ipsum.json?amet=neque&cursus=vestibulum&id=eget&turpis=vulputate&integer=ut&aliquet=ultrices&massa=vel&id=augue&lobortis=vestibulum&convallis=ante&tortor=ipsum&risus=primis&dapibus=in&augue=faucibus&vel=orci&accumsan=luctus&tellus=et&nisi=ultrices&eu=posuere&orci=cubilia&mauris=curae&lacinia=donec&sapien=pharetra&quis=magna&libero=vestibulum&nullam=aliquet', 'sENzp2oU6a', '23:50 sun', 'id', false);
insert into website_records (record_id, url, boundary_regexp, periodicity, label, is_active) values (2, 'http://parallels.com/suscipit/a/feugiat/et/eros/vestibulum/ac.xml?vivamus=duis&in=bibendum&felis=felis&eu=sed&sapien=interdum&cursus=venenatis&vestibulum=turpis&proin=enim&eu=blandit&mi=mi&nulla=in&ac=porttitor&enim=pede&in=justo', 'mI9NgRMtK6', null, 'pretium', true);
insert into website_records (record_id, url, boundary_regexp, periodicity, label, is_active) values (3, 'http://google.cn/mauris/sit/amet/eros/suspendisse/accumsan.xml?dui=proin&proin=at&leo=turpis&odio=a&porttitor=pede&id=posuere&consequat=nonummy&in=integer&consequat=non&ut=velit&nulla=donec&sed=diam&accumsan=neque&felis=vestibulum&ut=eget&at=vulputate&dolor=ut&quis=ultrices&odio=vel&consequat=augue&varius=vestibulum&integer=ante&ac=ipsum&leo=primis&pellentesque=in&ultrices=faucibus&mattis=orci&odio=luctus&donec=et&vitae=ultrices&nisi=posuere&nam=cubilia&ultrices=curae&libero=donec&non=pharetra', 'fm76IG8b36', '23:26 thu', 'sed', true);
insert into website_records (record_id, url, boundary_regexp, periodicity, label, is_active) values (4, 'https://nsw.gov.au/integer/ac/leo/pellentesque.jsp?nulla=magnis&ultrices=dis&aliquet=parturient&maecenas=montes&leo=nascetur&odio=ridiculus&condimentum=mus&id=etiam&luctus=vel&nec=augue&molestie=vestibulum&sed=rutrum&justo=rutrum&pellentesque=neque&viverra=aenean&pede=auctor&ac=gravida&diam=sem&cras=praesent&pellentesque=id&volutpat=massa&dui=id&maecenas=nisl&tristique=venenatis&est=lacinia&et=aenean&tempus=sit&semper=amet&est=justo&quam=morbi&pharetra=ut&magna=odio&ac=cras', 'HeCoEusaqY', '23:52 sun', 'quisque', false);

create table executions (
	execution_id INT,
	record_id INT,
	start_time DATETIME,
	end_time DATETIME,
	status BOOLEAN,
	start_node_id INT,
	sites_crawled_count INT
);

ALTER TABLE executions
ADD PRIMARY KEY (execution_id);

ALTER TABLE executions
ADD FOREIGN KEY (record_id) REFERENCES website_records(record_id);