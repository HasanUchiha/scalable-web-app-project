CREATE TABLE languages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
) PARTITION BY HASH (id); -- For potential sharding

CREATE TABLE exercises (
  id BIGSERIAL PRIMARY KEY, -- Larger range for scaling
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  language_id INT NOT NULL REFERENCES languages(id),
  difficulty SMALLINT CHECK (difficulty BETWEEN 1 AND 5),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_exercises_language_id ON exercises(language_id);
CREATE INDEX idx_exercises_difficulty ON exercises(difficulty);

-- Initial data with optimized batch inserts
BEGIN;
INSERT INTO languages (name) VALUES ('Dart'), ('Rust');
INSERT INTO exercises (title, description, language_id, difficulty)
SELECT 
  'Hello, World!',
  'Print "Hello, World!" to the console.',
  id,
  1
FROM languages;
COMMIT;