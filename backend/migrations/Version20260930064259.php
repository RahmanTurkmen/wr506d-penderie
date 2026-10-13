<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260930064259 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE blocage (created_at DATETIME NOT NULL, id BINARY(16) NOT NULL, profil_id BINARY(16) NOT NULL, user_id BINARY(16) NOT NULL, UNIQUE INDEX profil_user_unique (profil_id, user_id), INDEX IDX_92F33C42275ED078 (profil_id), INDEX IDX_92F33C42A76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE categorie (nom VARCHAR(100) NOT NULL, id BINARY(16) NOT NULL, UNIQUE INDEX UNIQ_497DD6346C6E55B5 (nom), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE commentaire (contenu LONGTEXT NOT NULL, created_at DATETIME NOT NULL, id BINARY(16) NOT NULL, partage_id BINARY(16) NOT NULL, auteur_id BINARY(16) NOT NULL, INDEX IDX_67F068BCD5CB766D (partage_id), INDEX IDX_67F068BC60BB6FE6 (auteur_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE conteneur (nom VARCHAR(100) NOT NULL, id BINARY(16) NOT NULL, piece_id BINARY(16) NOT NULL, INDEX IDX_E9628FD2C40FCFA8 (piece_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE logement (nom VARCHAR(100) NOT NULL, id BINARY(16) NOT NULL, profil_id BINARY(16) NOT NULL, INDEX IDX_F0FD4457275ED078 (profil_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE objet (nom VARCHAR(150) NOT NULL, type VARCHAR(255) NOT NULL, statut VARCHAR(255) NOT NULL, qr_code_interne VARCHAR(100) NOT NULL, id BINARY(16) NOT NULL, profil_id BINARY(16) NOT NULL, categorie_id BINARY(16) NOT NULL, piece_id BINARY(16) DEFAULT NULL, conteneur_id BINARY(16) DEFAULT NULL, UNIQUE INDEX UNIQ_46CD4C382E388360 (qr_code_interne), INDEX IDX_46CD4C38275ED078 (profil_id), INDEX IDX_46CD4C38BCF5E72D (categorie_id), INDEX IDX_46CD4C38C40FCFA8 (piece_id), INDEX IDX_46CD4C38F7EBA077 (conteneur_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE objet_tag (objet_id BINARY(16) NOT NULL, tag_id BINARY(16) NOT NULL, INDEX IDX_E3164735F520CF5A (objet_id), INDEX IDX_E3164735BAD26311 (tag_id), PRIMARY KEY (objet_id, tag_id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE partage (token BINARY(16) NOT NULL, created_at DATETIME NOT NULL, revoked_at DATETIME DEFAULT NULL, id BINARY(16) NOT NULL, profil_id BINARY(16) NOT NULL, UNIQUE INDEX UNIQ_8B929E6E5F37A13B (token), INDEX IDX_8B929E6E275ED078 (profil_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE piece (nom VARCHAR(100) NOT NULL, id BINARY(16) NOT NULL, logement_id BINARY(16) NOT NULL, INDEX IDX_44CA0B2358ABF955 (logement_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE pret (emprunteur_nom VARCHAR(150) NOT NULL, date_debut DATETIME NOT NULL, date_fin_prevue DATETIME DEFAULT NULL, date_retour DATETIME DEFAULT NULL, id BINARY(16) NOT NULL, objet_id BINARY(16) NOT NULL, INDEX IDX_52ECE979F520CF5A (objet_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE profil (nom VARCHAR(100) NOT NULL, type VARCHAR(255) NOT NULL, id BINARY(16) NOT NULL, user_id BINARY(16) NOT NULL, INDEX IDX_E6D6B297A76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE refus_tenue (id BINARY(16) NOT NULL, profil_id BINARY(16) NOT NULL, objet_id BINARY(16) DEFAULT NULL, categorie_id BINARY(16) DEFAULT NULL, INDEX IDX_3CE53DD4275ED078 (profil_id), INDEX IDX_3CE53DD4F520CF5A (objet_id), INDEX IDX_3CE53DD4BCF5E72D (categorie_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE tag (nom VARCHAR(50) NOT NULL, id BINARY(16) NOT NULL, UNIQUE INDEX UNIQ_389B7836C6E55B5 (nom), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE tenue (nom VARCHAR(150) NOT NULL, created_at DATETIME NOT NULL, id BINARY(16) NOT NULL, profil_id BINARY(16) NOT NULL, INDEX IDX_EB51486D275ED078 (profil_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE tenue_objet (tenue_id BINARY(16) NOT NULL, objet_id BINARY(16) NOT NULL, INDEX IDX_C61AF82E28239C7 (tenue_id), INDEX IDX_C61AF82EF520CF5A (objet_id), PRIMARY KEY (tenue_id, objet_id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE transaction (montant NUMERIC(10, 2) NOT NULL, statut VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, id BINARY(16) NOT NULL, objet_id BINARY(16) NOT NULL, acheteur_id BINARY(16) NOT NULL, INDEX IDX_723705D1F520CF5A (objet_id), INDEX IDX_723705D196A7BB5F (acheteur_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE `user` (email VARCHAR(180) NOT NULL, password VARCHAR(255) NOT NULL, roles JSON NOT NULL, created_at DATETIME NOT NULL, id BINARY(16) NOT NULL, UNIQUE INDEX UNIQ_8D93D649E7927C74 (email), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE valise (nom VARCHAR(150) NOT NULL, created_at DATETIME NOT NULL, id BINARY(16) NOT NULL, profil_id BINARY(16) NOT NULL, INDEX IDX_C7D71674275ED078 (profil_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE valise_objet (valise_id BINARY(16) NOT NULL, objet_id BINARY(16) NOT NULL, INDEX IDX_9C858CB43196F7DB (valise_id), INDEX IDX_9C858CB4F520CF5A (objet_id), PRIMARY KEY (valise_id, objet_id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE blocage ADD CONSTRAINT FK_92F33C42275ED078 FOREIGN KEY (profil_id) REFERENCES profil (id)');
        $this->addSql('ALTER TABLE blocage ADD CONSTRAINT FK_92F33C42A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE commentaire ADD CONSTRAINT FK_67F068BCD5CB766D FOREIGN KEY (partage_id) REFERENCES partage (id)');
        $this->addSql('ALTER TABLE commentaire ADD CONSTRAINT FK_67F068BC60BB6FE6 FOREIGN KEY (auteur_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE conteneur ADD CONSTRAINT FK_E9628FD2C40FCFA8 FOREIGN KEY (piece_id) REFERENCES piece (id)');
        $this->addSql('ALTER TABLE logement ADD CONSTRAINT FK_F0FD4457275ED078 FOREIGN KEY (profil_id) REFERENCES profil (id)');
        $this->addSql('ALTER TABLE objet ADD CONSTRAINT FK_46CD4C38275ED078 FOREIGN KEY (profil_id) REFERENCES profil (id)');
        $this->addSql('ALTER TABLE objet ADD CONSTRAINT FK_46CD4C38BCF5E72D FOREIGN KEY (categorie_id) REFERENCES categorie (id)');
        $this->addSql('ALTER TABLE objet ADD CONSTRAINT FK_46CD4C38C40FCFA8 FOREIGN KEY (piece_id) REFERENCES piece (id)');
        $this->addSql('ALTER TABLE objet ADD CONSTRAINT FK_46CD4C38F7EBA077 FOREIGN KEY (conteneur_id) REFERENCES conteneur (id)');
        $this->addSql('ALTER TABLE objet_tag ADD CONSTRAINT FK_E3164735F520CF5A FOREIGN KEY (objet_id) REFERENCES objet (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE objet_tag ADD CONSTRAINT FK_E3164735BAD26311 FOREIGN KEY (tag_id) REFERENCES tag (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE partage ADD CONSTRAINT FK_8B929E6E275ED078 FOREIGN KEY (profil_id) REFERENCES profil (id)');
        $this->addSql('ALTER TABLE piece ADD CONSTRAINT FK_44CA0B2358ABF955 FOREIGN KEY (logement_id) REFERENCES logement (id)');
        $this->addSql('ALTER TABLE pret ADD CONSTRAINT FK_52ECE979F520CF5A FOREIGN KEY (objet_id) REFERENCES objet (id)');
        $this->addSql('ALTER TABLE profil ADD CONSTRAINT FK_E6D6B297A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE refus_tenue ADD CONSTRAINT FK_3CE53DD4275ED078 FOREIGN KEY (profil_id) REFERENCES profil (id)');
        $this->addSql('ALTER TABLE refus_tenue ADD CONSTRAINT FK_3CE53DD4F520CF5A FOREIGN KEY (objet_id) REFERENCES objet (id)');
        $this->addSql('ALTER TABLE refus_tenue ADD CONSTRAINT FK_3CE53DD4BCF5E72D FOREIGN KEY (categorie_id) REFERENCES categorie (id)');
        $this->addSql('ALTER TABLE tenue ADD CONSTRAINT FK_EB51486D275ED078 FOREIGN KEY (profil_id) REFERENCES profil (id)');
        $this->addSql('ALTER TABLE tenue_objet ADD CONSTRAINT FK_C61AF82E28239C7 FOREIGN KEY (tenue_id) REFERENCES tenue (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE tenue_objet ADD CONSTRAINT FK_C61AF82EF520CF5A FOREIGN KEY (objet_id) REFERENCES objet (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE transaction ADD CONSTRAINT FK_723705D1F520CF5A FOREIGN KEY (objet_id) REFERENCES objet (id)');
        $this->addSql('ALTER TABLE transaction ADD CONSTRAINT FK_723705D196A7BB5F FOREIGN KEY (acheteur_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE valise ADD CONSTRAINT FK_C7D71674275ED078 FOREIGN KEY (profil_id) REFERENCES profil (id)');
        $this->addSql('ALTER TABLE valise_objet ADD CONSTRAINT FK_9C858CB43196F7DB FOREIGN KEY (valise_id) REFERENCES valise (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE valise_objet ADD CONSTRAINT FK_9C858CB4F520CF5A FOREIGN KEY (objet_id) REFERENCES objet (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE blocage DROP FOREIGN KEY FK_92F33C42275ED078');
        $this->addSql('ALTER TABLE blocage DROP FOREIGN KEY FK_92F33C42A76ED395');
        $this->addSql('ALTER TABLE commentaire DROP FOREIGN KEY FK_67F068BCD5CB766D');
        $this->addSql('ALTER TABLE commentaire DROP FOREIGN KEY FK_67F068BC60BB6FE6');
        $this->addSql('ALTER TABLE conteneur DROP FOREIGN KEY FK_E9628FD2C40FCFA8');
        $this->addSql('ALTER TABLE logement DROP FOREIGN KEY FK_F0FD4457275ED078');
        $this->addSql('ALTER TABLE objet DROP FOREIGN KEY FK_46CD4C38275ED078');
        $this->addSql('ALTER TABLE objet DROP FOREIGN KEY FK_46CD4C38BCF5E72D');
        $this->addSql('ALTER TABLE objet DROP FOREIGN KEY FK_46CD4C38C40FCFA8');
        $this->addSql('ALTER TABLE objet DROP FOREIGN KEY FK_46CD4C38F7EBA077');
        $this->addSql('ALTER TABLE objet_tag DROP FOREIGN KEY FK_E3164735F520CF5A');
        $this->addSql('ALTER TABLE objet_tag DROP FOREIGN KEY FK_E3164735BAD26311');
        $this->addSql('ALTER TABLE partage DROP FOREIGN KEY FK_8B929E6E275ED078');
        $this->addSql('ALTER TABLE piece DROP FOREIGN KEY FK_44CA0B2358ABF955');
        $this->addSql('ALTER TABLE pret DROP FOREIGN KEY FK_52ECE979F520CF5A');
        $this->addSql('ALTER TABLE profil DROP FOREIGN KEY FK_E6D6B297A76ED395');
        $this->addSql('ALTER TABLE refus_tenue DROP FOREIGN KEY FK_3CE53DD4275ED078');
        $this->addSql('ALTER TABLE refus_tenue DROP FOREIGN KEY FK_3CE53DD4F520CF5A');
        $this->addSql('ALTER TABLE refus_tenue DROP FOREIGN KEY FK_3CE53DD4BCF5E72D');
        $this->addSql('ALTER TABLE tenue DROP FOREIGN KEY FK_EB51486D275ED078');
        $this->addSql('ALTER TABLE tenue_objet DROP FOREIGN KEY FK_C61AF82E28239C7');
        $this->addSql('ALTER TABLE tenue_objet DROP FOREIGN KEY FK_C61AF82EF520CF5A');
        $this->addSql('ALTER TABLE transaction DROP FOREIGN KEY FK_723705D1F520CF5A');
        $this->addSql('ALTER TABLE transaction DROP FOREIGN KEY FK_723705D196A7BB5F');
        $this->addSql('ALTER TABLE valise DROP FOREIGN KEY FK_C7D71674275ED078');
        $this->addSql('ALTER TABLE valise_objet DROP FOREIGN KEY FK_9C858CB43196F7DB');
        $this->addSql('ALTER TABLE valise_objet DROP FOREIGN KEY FK_9C858CB4F520CF5A');
        $this->addSql('DROP TABLE blocage');
        $this->addSql('DROP TABLE categorie');
        $this->addSql('DROP TABLE commentaire');
        $this->addSql('DROP TABLE conteneur');
        $this->addSql('DROP TABLE logement');
        $this->addSql('DROP TABLE objet');
        $this->addSql('DROP TABLE objet_tag');
        $this->addSql('DROP TABLE partage');
        $this->addSql('DROP TABLE piece');
        $this->addSql('DROP TABLE pret');
        $this->addSql('DROP TABLE profil');
        $this->addSql('DROP TABLE refus_tenue');
        $this->addSql('DROP TABLE tag');
        $this->addSql('DROP TABLE tenue');
        $this->addSql('DROP TABLE tenue_objet');
        $this->addSql('DROP TABLE transaction');
        $this->addSql('DROP TABLE `user`');
        $this->addSql('DROP TABLE valise');
        $this->addSql('DROP TABLE valise_objet');
    }
}
