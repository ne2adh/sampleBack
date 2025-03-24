-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: 181.115.147.6    Database: agenda_db
-- ------------------------------------------------------
-- Server version	5.7.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tasks` (
  `id` char(36) NOT NULL,
  `fecha` date DEFAULT NULL,
  `responsable` varchar(255) NOT NULL,
  `institucion` varchar(255) NOT NULL,
  `titulo` text NOT NULL,
  `hora` time NOT NULL,
  `lugar` varchar(255) NOT NULL,
  `isEditing` tinyint(1) NOT NULL,
  `isNew` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks`
--

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
INSERT INTO `tasks` VALUES ('01210bb6-dc95-4ae4-b00b-2584303e44a7','2025-03-17','DRA. ANA LOPEZ - SALUD	','HOSPITAL CENTRAL ffff	','SESIÓN DE CAPACITACIÓN SOBRE PROTOCOLOS DE EMERGENCIA.	','14:30:00','AUDITORIO PRINCIPAL	',0,0),('0140cc56-54ae-4b10-9158-98defff85463','2025-03-17','ING. JUAN PEREZ - IT','EMPRESA TECH','REUNIÓN CON EQUIPO DE DESARROLLO PARA LANZAMIENTO DE NUEVA APP.','09:00:00','SALA DE JUNTAS',0,0),('1b8d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bs1','2025-03-17','LIC. VICTOR H. POMA - UNICOM','CANAL CEA.COM 3','ENTREVISTA EN PROGRAMA DE TELEVISION EN VIVO: PROGRAMA EL PRIMERO – CONDUCTOR MARGO AGUILAR.','07:30:00','M.A.E.',0,0),('1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4be1','2025-03-17','LIC. VICTOR H. POMA - UNICOM','CANAL CEA.COM 3','ENTREVISTA EN PROGRAMA DE TELEVISION EN VIVO: PROGRAMA EL PRIMERO – CONDUCTOR MARGO AGUILAR.','07:30:00','M.A.E.',0,0),('1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4be2','2025-03-17','LIC. VICTOR H. POMA - UNICOM','CANAL CEA.COM 3','ENTREVISTA EN PROGRAMA DE TELEVISION EN VIVO: PROGRAMA EL PRIMERO – CONDUCTOR MARGO AGUILAR.','07:30:00','M.A.E.',0,0),('1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4be3','2025-03-17','LIC. VICTOR H. POMA - UNICOM','CANAL CEA.COM 3','ENTREVISTA EN PROGRAMA DE TELEVISION EN VIVO: PROGRAMA EL PRIMERO – CONDUCTOR MARGO AGUILAR.','07:30:00','M.A.E.',0,0),('1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bee','2025-03-17','ddd','d','dddssd','07:30:00','M.A.E.',0,0),('1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bs1','2025-03-17','LIC. VICTOR H. POMA - UNICOM','CANAL CEA.COM 3','ENTREVISTA EN PROGRAMA DE TELEVISION EN VIVO: PROGRAMA EL PRIMERO – CONDUCTOR MARGO AGUILAR.','07:30:00','M.A.E.',0,0),('5935488f-61fa-4ff3-a95f-aba893a7ca71','2025-03-17','apurate 1111','Rosa','ssss','15:00:00','fdfd',0,0),('5935488f-61fa-4ff3-a95f-aba893a7ca72','2025-03-17','apurate 1111','Rosa','ssss','15:00:00','fdfd',0,0),('5935488f-61fa-4ff3-a95f-aba893a7ca73','2025-03-17','apurate 1111','Rosa','ssss','15:00:00','fdfd',0,0);
/*!40000 ALTER TABLE `tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint(20) NOT NULL,
  `username` varchar(255) NOT NULL,
  `isEditing` tinyint(1) NOT NULL,
  `isOnline` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1710000000000,'gianmet',0,1),(1710000000001,'usuario1',0,1),(1710000000002,'rosa',0,1),(1710000000003,'toco',0,0),(1710000000004,'rolando',0,0),(1710000000005,'ariel',0,0);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'agenda_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-03-24 16:00:38
