CREATE TABLE IF NOT EXISTS workspaces (
  owner TEXT PRIMARY KEY,
  revision INTEGER NOT NULL DEFAULT 1,
  state TEXT NOT NULL CHECK(json_valid(state)),
  event TEXT NOT NULL CHECK(json_valid(event)),
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS workspace_history (
  owner TEXT NOT NULL,
  revision INTEGER NOT NULL,
  state TEXT NOT NULL CHECK(json_valid(state)),
  event TEXT NOT NULL CHECK(json_valid(event)),
  updated_at TEXT NOT NULL,
  PRIMARY KEY(owner,revision)
);
CREATE TRIGGER IF NOT EXISTS preserve_workspace BEFORE UPDATE ON workspaces
BEGIN
  INSERT INTO workspace_history(owner,revision,state,event,updated_at)
  VALUES(OLD.owner,OLD.revision,OLD.state,NEW.event,OLD.updated_at);
END;
