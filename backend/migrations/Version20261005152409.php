<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20261005152409 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE validation (type VARCHAR(255) NOT NULL, payload LONGTEXT DEFAULT NULL, statut VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, decided_at DATETIME DEFAULT NULL, id BINARY(16) NOT NULL, profil_id BINARY(16) NOT NULL, INDEX IDX_16AC5B6E275ED078 (profil_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE validation ADD CONSTRAINT FK_16AC5B6E275ED078 FOREIGN KEY (profil_id) REFERENCES profil (id)');
        $this->addSql('ALTER TABLE profil ADD est_mineur TINYINT NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE validation DROP FOREIGN KEY FK_16AC5B6E275ED078');
        $this->addSql('DROP TABLE validation');
        $this->addSql('ALTER TABLE profil DROP est_mineur');
    }
}
