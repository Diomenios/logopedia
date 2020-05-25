CREATE TABLE Classes(
  classe_id INT AUTO_INCREMENT NOT NULL,
  classe_nom VARCHAR(100) NOT NULL,
  PRIMARY KEY(classe_id),
  UNIQUE(classe_nom)
);

CREATE TABLE Types(
  type_id INT AUTO_INCREMENT NOT NULL,
  type_nom VARCHAR(100) NOT NULL,
  classe_id INT NOT NULL,
  PRIMARY KEY(type_id),
  FOREIGN KEY(classe_id)
    REFERENCES Classes(classe_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE Images(
  image_id INT AUTO_INCREMENT NOT NULL,
  image_nom VARCHAR(200) NOT NULL,
  image_original_nom VARCHAR(150),
  image_extension VARCHAR(10) NOT NULL,
  type_id INT NOT NULL,
  PRIMARY KEY(image_id),
  FOREIGN KEY(type_id)
    REFERENCES Types(type_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE Mots(
  mot_id INT AUTO_INCREMENT NOT NULL,
  mot VARCHAR(100) NOT NULL,
  distracteur TINYINT NOT NULL,
  type_id INT NOT NULL,
  PRIMARY KEY(mot_id),
  FOREIGN KEY(type_id)
    REFERENCES Types(type_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT true_boolean CHECK(distracteur = 0 OR distracteur = 1)
);

CREATE TABLE Difficultes(
  nom VARCHAR(30) NOT NULL,
  nombre_mots INT NOT NULL UNIQUE,
  PRIMARY KEY(nom)
);

CREATE TABLE Longueurs(
  nom VARCHAR(30) NOT NULL,
  nombre_images INT NOT NULL UNIQUE,
  PRIMARY KEY(nom)
);

CREATE TABLE DescriptionActivites(
  activite_id INT AUTO_INCREMENT NOT NULL,
  activite_url VARCHAR(100) NOT NULL UNIQUE,
  activite_nom VARCHAR(30) NOT NULL UNIQUE,
  description VARCHAR(400) NOT NULL,
  PRIMARY KEY(activite_id)
);

CREATE TABLE Users(
  user_id  INT AUTO_INCREMENT,
  user_name VARCHAR(30) NOT NULL UNIQUE,  
  password VARCHAR(200) NOT NULL,
  salt VARCHAR(50) NOT NULL,
  root INT NOT NULL,
  PRIMARY KEY(user_id)
);

CREATE TABLE News(
  id_news INT AUTO_INCREMENT NOT NULL,
  version INT,
  modification VARCHAR(255),
  PRIMARY KEY(id_news),
  UNIQUE(version)
);
