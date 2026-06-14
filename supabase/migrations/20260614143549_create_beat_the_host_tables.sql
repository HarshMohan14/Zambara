CREATE TABLE IF NOT EXISTS beat_the_host_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'in_game', 'completed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS beat_the_host_games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'live' CHECK (status IN ('live', 'completed')),
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  duration_seconds integer,
  winner_id uuid REFERENCES beat_the_host_players(id) ON DELETE SET NULL,
  winner_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS beat_the_host_game_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES beat_the_host_games(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES beat_the_host_players(id) ON DELETE CASCADE,
  player_name text NOT NULL
);

ALTER TABLE beat_the_host_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE beat_the_host_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE beat_the_host_game_players ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'public_read_bth_players') THEN
    CREATE POLICY "public_read_bth_players" ON beat_the_host_players FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'public_read_bth_games') THEN
    CREATE POLICY "public_read_bth_games" ON beat_the_host_games FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'public_read_bth_game_players') THEN
    CREATE POLICY "public_read_bth_game_players" ON beat_the_host_game_players FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'service_all_bth_players') THEN
    CREATE POLICY "service_all_bth_players" ON beat_the_host_players FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'service_all_bth_games') THEN
    CREATE POLICY "service_all_bth_games" ON beat_the_host_games FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'service_all_bth_game_players') THEN
    CREATE POLICY "service_all_bth_game_players" ON beat_the_host_game_players FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'anon_insert_bth_players') THEN
    CREATE POLICY "anon_insert_bth_players" ON beat_the_host_players FOR INSERT TO anon WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'anon_update_bth_players') THEN
    CREATE POLICY "anon_update_bth_players" ON beat_the_host_players FOR UPDATE TO anon USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'anon_delete_bth_players') THEN
    CREATE POLICY "anon_delete_bth_players" ON beat_the_host_players FOR DELETE TO anon USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'anon_insert_bth_games') THEN
    CREATE POLICY "anon_insert_bth_games" ON beat_the_host_games FOR INSERT TO anon WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'anon_update_bth_games') THEN
    CREATE POLICY "anon_update_bth_games" ON beat_the_host_games FOR UPDATE TO anon USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'anon_delete_bth_games') THEN
    CREATE POLICY "anon_delete_bth_games" ON beat_the_host_games FOR DELETE TO anon USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'anon_insert_bth_game_players') THEN
    CREATE POLICY "anon_insert_bth_game_players" ON beat_the_host_game_players FOR INSERT TO anon WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'anon_delete_bth_game_players') THEN
    CREATE POLICY "anon_delete_bth_game_players" ON beat_the_host_game_players FOR DELETE TO anon USING (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_bth_players_status ON beat_the_host_players(status);
CREATE INDEX IF NOT EXISTS idx_bth_games_status ON beat_the_host_games(status);
CREATE INDEX IF NOT EXISTS idx_bth_game_players_game ON beat_the_host_game_players(game_id);
