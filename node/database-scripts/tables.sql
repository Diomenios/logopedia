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
  image MEDIUMBLOB NOT NULL,
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
