CREATE TABLE `requests` (
	`uuid` varchar(36) NOT NULL,
	`method` varchar(10) NOT NULL,
	`host` varchar(255) NOT NULL,
	`pathname` varchar(255) NOT NULL,
	`success` boolean NOT NULL,
	`latency` int NOT NULL,
	`status` int NOT NULL,
	`regions` json NOT NULL,
	`date` timestamp NOT NULL DEFAULT (now()),
	`headers` json NOT NULL,
	`message` varchar(255),
	`timing` json NOT NULL,
	CONSTRAINT `requests_uuid` PRIMARY KEY(`uuid`),
	CONSTRAINT `date_idx` UNIQUE(`date`),
	CONSTRAINT `status_idx` UNIQUE(`status`),
	CONSTRAINT `host_idx` UNIQUE(`host`)
);
