# nodejs-user-api
An example of simple nodejs user api

Project uses MySQL for users table.

CREATE TABLE `users` (
  `email` varchar(100) NOT NULL,
  `password` varchar(100) DEFAULT NULL,
  `active` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`email`)
);
