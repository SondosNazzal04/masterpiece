-- =========================================================
-- TeamFlow — Database Schema
-- MySQL 8 / MariaDB 10.4+
-- Charset: utf8mb4 (emoji + international names)
-- =========================================================

CREATE DATABASE IF NOT EXISTS teamflow
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE teamflow;

-- ---------------------------------------------------------
-- users
-- ---------------------------------------------------------
CREATE TABLE users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100)  NOT NULL,
  initials      VARCHAR(4)    NOT NULL,
  email         VARCHAR(150)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  github_username VARCHAR(60) NULL,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- projects
-- ---------------------------------------------------------
CREATE TABLE projects (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120)  NOT NULL,
  description   TEXT          NULL,
  cover_slug    VARCHAR(40)   NOT NULL DEFAULT 'forest',  -- gradient preset
  cover_image   VARCHAR(255)  NULL,                        -- upload path
  deadline      DATE          NULL,
  created_by    INT UNSIGNED  NULL,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_projects_creator
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- memberships  (user <-> project, with role)
-- ---------------------------------------------------------
CREATE TABLE memberships (
  user_id     INT UNSIGNED NOT NULL,
  project_id  INT UNSIGNED NOT NULL,
  role        ENUM('lead','member') NOT NULL DEFAULT 'member',
  joined_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, project_id),
  CONSTRAINT fk_memberships_user
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  CONSTRAINT fk_memberships_project
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- tasks
-- ---------------------------------------------------------
CREATE TABLE tasks (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code         VARCHAR(12)   NOT NULL UNIQUE,            -- 'TF-105'
  project_id   INT UNSIGNED  NOT NULL,
  title        VARCHAR(200)  NOT NULL,
  description  TEXT          NULL,
  status       ENUM('todo','progress','review','done') NOT NULL DEFAULT 'todo',
  priority     ENUM('low','med','high')                NOT NULL DEFAULT 'med',
  difficulty   TINYINT UNSIGNED NOT NULL DEFAULT 3
                 CHECK (difficulty BETWEEN 1 AND 5),
  assignee_id  INT UNSIGNED  NULL,
  due_date     DATE          NULL,
  is_blocked   BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
                 ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tasks_project
    FOREIGN KEY (project_id)  REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_tasks_assignee
    FOREIGN KEY (assignee_id) REFERENCES users(id)    ON DELETE SET NULL,
  INDEX idx_tasks_project_status (project_id, status),
  INDEX idx_tasks_assignee       (assignee_id),
  INDEX idx_tasks_due            (due_date)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- task_dod  (Definition of Done — one row per criterion)
-- ---------------------------------------------------------
CREATE TABLE task_dod (
  id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  task_id   INT UNSIGNED  NOT NULL,
  text      VARCHAR(200)  NOT NULL,
  done      BOOLEAN       NOT NULL DEFAULT FALSE,
  position  TINYINT UNSIGNED NOT NULL DEFAULT 0,
  CONSTRAINT fk_dod_task
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  INDEX idx_dod_task (task_id, position)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- skills  (the shared vocabulary: 'JavaScript', 'PHP', ...)
-- ---------------------------------------------------------
CREATE TABLE skills (
  id    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(80) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- skill_evidence  (who demonstrates which skill, from where)
-- ---------------------------------------------------------
CREATE TABLE skill_evidence (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  skill_id    INT UNSIGNED NOT NULL,
  source      ENUM('github','self','course','peer') NOT NULL,
  strength    TINYINT UNSIGNED NOT NULL DEFAULT 3
                CHECK (strength BETWEEN 1 AND 5),
  confidence  ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
  note        VARCHAR(255) NULL,   -- e.g. repo name or course title
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_evidence_user
    FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  CONSTRAINT fk_evidence_skill
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
  INDEX idx_evidence_user_skill (user_id, skill_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- comments / activity  (feeds the dashboard "Recent activity")
-- ---------------------------------------------------------
CREATE TABLE activity (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_id INT UNSIGNED NOT NULL,
  task_id    INT UNSIGNED NULL,
  user_id    INT UNSIGNED NULL,
  kind       ENUM('created','assigned','status_changed','commented','completed') NOT NULL,
  message    VARCHAR(255) NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_activity_project
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_activity_task
    FOREIGN KEY (task_id)    REFERENCES tasks(id)    ON DELETE SET NULL,
  CONSTRAINT fk_activity_user
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE SET NULL,
  INDEX idx_activity_project_time (project_id, created_at DESC)
) ENGINE=InnoDB;
