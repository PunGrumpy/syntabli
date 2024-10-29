ALTER TABLE `requests` RENAME COLUMN `timing` TO `timing_dns`;--> statement-breakpoint
ALTER TABLE `requests` DROP INDEX `date_idx`;--> statement-breakpoint
ALTER TABLE `requests` DROP INDEX `status_idx`;--> statement-breakpoint
ALTER TABLE `requests` DROP INDEX `host_idx`;--> statement-breakpoint
ALTER TABLE `requests` MODIFY COLUMN `timing_dns` int NOT NULL;--> statement-breakpoint
ALTER TABLE `requests` ADD `timing_connection` int NOT NULL;--> statement-breakpoint
ALTER TABLE `requests` ADD `timing_tls` int NOT NULL;--> statement-breakpoint
ALTER TABLE `requests` ADD `timing_ttfb` int NOT NULL;--> statement-breakpoint
ALTER TABLE `requests` ADD `timing_transfer` int NOT NULL;